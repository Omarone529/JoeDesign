/*
 * Decide come ogni foto entra nel carosello e scrive src/data/photoFit.js (node scripts/photo-fit.js).
 * Ritaglio puntato sul soggetto; se non ci sta, le foto si tagliano e le grafiche piatte
 * (pochi pixel sfumati) si mostrano intere.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.join('public', 'images', 'products')
const OUTPUT = path.join('src', 'data', 'photoFit.js')

// Da tenere allineato ad `aspect-square` in `src/components/Carousel.jsx`.
const FRAME_R = 1

// Oltre questi formati il ritaglio lascerebbe una fetta: si mostra intera.
const WIDE_END = 2
const NARROW_END = 0.4

const PHOTO_THRESHOLD = 0.13 // quota di pixel sfumati sopra cui è uno scatto

// Grafiche che la misura scambia per foto: sempre intere.
const ALWAYS_WHOLE = new Set([
  'in-the-box/cover.webp',
  'rilegno/cover.webp',
  // Manifesti su campo pieno: la misura li crede tagliabili perché il
  // giallo è uniforme, ma il testo sta tutto in alto e si perderebbe.
  'citta-parla/cover.webp',
  'direzione-tolleranza/cover.webp',
])

// Ritaglio a mano, '<slug>/<file>' → object-position.
const MANUAL_FOCUS = {
  // Primo piano del viso: centrata la cornice taglia gli occhi a metà, puntata
  // in basso inquadra bocca e prodotto.
  'dose/05.webp': '50% 100%',
}

const TOLERANCE = 0.04 // quanto il soggetto può uscire dalla finestra
const SAMPLE = 200 // lato su cui si misura
const DIFF = 26 // distanza dal fondo oltre cui il pixel è soggetto
const SOFT_STEP = [2, 30] // salto di luminosità che segna una transizione morbida

async function measure(file) {
  const img = sharp(file)
  const meta = await img.metadata()
  const { data, info } = await img
    .resize(SAMPLE, SAMPLE, { fit: 'inside' })
    .flatten({ background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: w, height: h, channels: c } = info
  const px = (x, y) => {
    const i = (y * w + x) * c
    return [data[i], data[i + 1], data[i + 2]]
  }

  const edge = []
  for (let x = 0; x < w; x++) edge.push(px(x, 0), px(x, h - 1))
  for (let y = 0; y < h; y++) edge.push(px(0, y), px(w - 1, y))

  const median = (v) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)]
  const bg = [0, 1, 2].map((k) => median(edge.map((p) => p[k])))
  const subject = (p) =>
    Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]) > DIFF * 3

  const clean = edge.filter((p) => !subject(p)).length / edge.length

  let x0 = w
  let y0 = h
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!subject(px(x, y))) continue
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  if (x1 < 0) {
    x0 = 0
    y0 = 0
    x1 = w - 1
    y1 = h - 1
  }

  const hex = (v) => '#' + v.map((k) => Math.round(k).toString(16).padStart(2, '0')).join('')

  return {
    ratio: meta.width / meta.height,
    bg: hex(bg),
    clean,
    soft: await softShare(file),
    box: { x0: x0 / w, x1: (x1 + 1) / w, y0: y0 / h, y1: (y1 + 1) / h },
  }
}

// Quota di pixel su transizioni morbide: alta nelle foto, bassa nelle grafiche.
async function softShare(file) {
  const { data, info } = await sharp(file)
    .resize(SAMPLE, SAMPLE, { fit: 'inside' })
    .flatten({ background: '#ffffff' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: w, height: h } = info
  let soft = 0
  let tot = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const jump = Math.abs(data[i + 1] - data[i - 1]) + Math.abs(data[i + w] - data[i - w])
      if (jump > SOFT_STEP[0] && jump <= SOFT_STEP[1]) soft++
      tot++
    }
  }
  return soft / tot
}

function viewport(ratio) {
  return ratio < FRAME_R
    ? { x: 1, y: ratio / FRAME_R }
    : { x: FRAME_R / ratio, y: 1 }
}

// Posizione (0–100) che contiene il soggetto fra `from` e `to`; `ok` falso se non ci sta.
function aim(visible, from, to) {
  if (visible >= 1) return { ok: true, pos: 50 }
  const span = to - from
  const center = (from + to) / 2
  const start = Math.min(Math.max(center - visible / 2, 0), 1 - visible)
  return {
    ok: span <= visible + TOLERANCE,
    pos: Math.round((start / (1 - visible)) * 100),
  }
}

function decide({ ratio, soft, box }) {
  if (ratio > WIDE_END || ratio < NARROW_END) {
    return { fit: 'contain', reason: 'formato fuori scala' }
  }

  const visible = viewport(ratio)
  const y = aim(visible.y, box.y0, box.y1)
  const x = aim(visible.x, box.x0, box.x1)

  // Soggetto troppo grande: una foto regge il taglio, una grafica no.
  if ((!y.ok || !x.ok) && soft < PHOTO_THRESHOLD) {
    return { fit: 'contain', reason: 'grafica da non tagliare' }
  }

  const pos = x.pos === 50 && y.pos === 50 ? null : `${x.pos}% ${y.pos}%`
  return { fit: 'cover', pos, reason: y.ok && x.ok ? 'soggetto salvo' : 'scatto, taglio libero' }
}

(async () => {
  const entries = {}
  const tally = { cover: 0, shifted: 0, contain: 0 }

  for (const slug of fs.readdirSync(ROOT).sort()) {
    for (const f of fs.readdirSync(path.join(ROOT, slug)).sort()) {
      // Le -800 hanno l'inquadratura dell'originale.
      if (!f.endsWith('.webp') || f.endsWith('-800.webp')) continue
      // Miniature dei video: le inquadrano i loro riquadri.
      if (f === 'drawing.webp' || f === 'video.webp' || f === 'film.webp') continue
      const key = `${slug}/${f}`
      const m = await measure(path.join(ROOT, slug, f))
      const d = MANUAL_FOCUS[key]
        ? { fit: 'cover', pos: MANUAL_FOCUS[key], reason: 'ritaglio segnato a mano' }
        : ALWAYS_WHOLE.has(key)
          ? { fit: 'contain', reason: 'grafica segnata a mano' }
          : decide(m)
      const src = `/images/products/${slug}/${f}`

      if (d.fit === 'contain') {
        // I lati scoperti prendono il colore del bordo, se è uniforme.
        entries[src] = { fit: 'contain', ...(m.clean > 0.85 ? { bg: m.bg } : {}) }
        tally.contain++
      } else if (d.pos) {
        entries[src] = { pos: d.pos }
        tally.shifted++
      } else {
        tally.cover++
      }
      console.log(`${src.padEnd(46)} ${d.fit}${d.pos ? ' ' + d.pos : ''} · ${d.reason}`)
    }
  }

  const text = `/*
 * Generato da \`node scripts/photo-fit.js\`: non si modifica a mano.
 *
 * Come ogni foto entra nel carosello (assente = riempie centrata).
 *   fit: 'contain' intera · pos: 'x% y%' ritaglio puntato · bg: colore del bordo
 */
export const photoFit = ${JSON.stringify(entries, null, 2)}
`
  fs.writeFileSync(OUTPUT, text)
  console.log(
    `\n${OUTPUT} · ${tally.cover} riempiono centrate, ${tally.shifted} riempiono spostate, ${tally.contain} intere.`,
  )
})()
