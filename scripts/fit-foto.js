/*
 * Decide come ogni foto entra nel carosello e scrive src/data/fotoFit.js (node scripts/fit-foto.js).
 * Ritaglio puntato sul soggetto; se non ci sta, le foto si tagliano e le grafiche piatte
 * (pochi pixel sfumati) si mostrano intere.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const RADICE = path.join('public', 'images', 'products')
const USCITA = path.join('src', 'data', 'fotoFit.js')

// Da tenere allineato ad `aspect-square` in `src/components/Carousel.jsx`.
const R_CORNICE = 1

// Oltre questi formati il ritaglio lascerebbe una fetta: si mostra intera.
const ESTREMO_LARGO = 2
const ESTREMO_STRETTO = 0.4

const FOTOGRAFIA = 0.13 // quota di pixel sfumati sopra cui è uno scatto

// Grafiche che la misura scambia per foto: sempre intere.
const SEMPRE_INTERE = new Set([
  'in-the-box/cover.webp',
  'rilegno/cover.webp',
  // Manifesti su campo pieno: la misura li crede tagliabili perché il
  // giallo è uniforme, ma il testo sta tutto in alto e si perderebbe.
  'citta-parla/cover.webp',
  'direzione-tolleranza/cover.webp',
])

// Ritaglio a mano, '<slug>/<file>' → object-position.
const FUOCO_A_MANO = {
  // Primo piano del viso: centrata la cornice taglia gli occhi a metà, puntata
  // in basso inquadra bocca e prodotto.
  'dose/05.webp': '50% 100%',
}

const TOLLERANZA = 0.04 // quanto il soggetto può debordare dalla finestra
const CAMPIONE = 200 // lato massimo su cui si misura: basta e avanza
const DIFF = 26 // distanza dal fondo oltre cui il pixel è soggetto
const SFUMATO = [2, 30] // salto di luminosità che segna una transizione morbida

async function misura(file) {
  const img = sharp(file)
  const meta = await img.metadata()
  const { data, info } = await img
    .resize(CAMPIONE, CAMPIONE, { fit: 'inside' })
    .flatten({ background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: w, height: h, channels: c } = info
  const px = (x, y) => {
    const i = (y * w + x) * c
    return [data[i], data[i + 1], data[i + 2]]
  }

  const bordo = []
  for (let x = 0; x < w; x++) bordo.push(px(x, 0), px(x, h - 1))
  for (let y = 0; y < h; y++) bordo.push(px(0, y), px(w - 1, y))

  const mediana = (v) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)]
  const fondo = [0, 1, 2].map((k) => mediana(bordo.map((p) => p[k])))
  const soggetto = (p) =>
    Math.abs(p[0] - fondo[0]) + Math.abs(p[1] - fondo[1]) + Math.abs(p[2] - fondo[2]) > DIFF * 3

  const pulito = bordo.filter((p) => !soggetto(p)).length / bordo.length

  let x0 = w
  let y0 = h
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!soggetto(px(x, y))) continue
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

  const esa = (v) => '#' + v.map((k) => Math.round(k).toString(16).padStart(2, '0')).join('')

  return {
    rapporto: meta.width / meta.height,
    fondo: esa(fondo),
    pulito,
    sfumati: await quotaSfumati(file),
    box: { x0: x0 / w, x1: (x1 + 1) / w, y0: y0 / h, y1: (y1 + 1) / h },
  }
}

// Quota di pixel su transizioni morbide: alta nelle foto, bassa nelle grafiche.
async function quotaSfumati(file) {
  const { data, info } = await sharp(file)
    .resize(CAMPIONE, CAMPIONE, { fit: 'inside' })
    .flatten({ background: '#ffffff' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: w, height: h } = info
  let sfumati = 0
  let tot = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const salto = Math.abs(data[i + 1] - data[i - 1]) + Math.abs(data[i + w] - data[i - w])
      if (salto > SFUMATO[0] && salto <= SFUMATO[1]) sfumati++
      tot++
    }
  }
  return sfumati / tot
}

// Parte visibile dell'immagine per asse, riempiendo la cornice quadrata.
function finestra(rapporto) {
  return rapporto < R_CORNICE
    ? { x: 1, y: rapporto / R_CORNICE }
    : { x: R_CORNICE / rapporto, y: 1 }
}

// Posizione (0–100) che contiene il soggetto fra `da` e `a`; `ok` falso se non ci sta.
function punta(visibile, da, a) {
  if (visibile >= 1) return { ok: true, pos: 50 }
  const largo = a - da
  const centro = (da + a) / 2
  const inizio = Math.min(Math.max(centro - visibile / 2, 0), 1 - visibile)
  return {
    ok: largo <= visibile + TOLLERANZA,
    pos: Math.round((inizio / (1 - visibile)) * 100),
  }
}

function decidi({ rapporto, sfumati, box }) {
  if (rapporto > ESTREMO_LARGO || rapporto < ESTREMO_STRETTO) {
    return { fit: 'contain', motivo: 'formato fuori scala' }
  }

  const visibile = finestra(rapporto)
  const y = punta(visibile.y, box.y0, box.y1)
  const x = punta(visibile.x, box.x0, box.x1)

  // Il soggetto non entra nella finestra: una foto regge lo stesso il taglio,
  // una grafica no.
  if ((!y.ok || !x.ok) && sfumati < FOTOGRAFIA) {
    return { fit: 'contain', motivo: 'grafica da non tagliare' }
  }

  const pos = x.pos === 50 && y.pos === 50 ? null : `${x.pos}% ${y.pos}%`
  return { fit: 'cover', pos, motivo: y.ok && x.ok ? 'soggetto salvo' : 'scatto, taglio libero' }
}

(async () => {
  const voci = {}
  const conto = { cover: 0, spostate: 0, contain: 0 }

  for (const slug of fs.readdirSync(RADICE).sort()) {
    for (const f of fs.readdirSync(path.join(RADICE, slug)).sort()) {
      // Le -800 sono le varianti responsive: stessa inquadratura dell'originale,
      // che è già nel manifesto. Vedi scripts/varianti-foto.js.
      if (!f.endsWith('.webp') || f.endsWith('-800.webp')) continue
      // Miniature dei due video: come si inquadrano lo decidono i loro riquadri
      // (vedi Carousel e FilmatoProgetto), non una misura presa qui.
      if (f === 'disegno.webp' || f === 'video.webp' || f === 'filmato.webp') continue
      const chiave = `${slug}/${f}`
      const m = await misura(path.join(RADICE, slug, f))
      const d = FUOCO_A_MANO[chiave]
        ? { fit: 'cover', pos: FUOCO_A_MANO[chiave], motivo: 'ritaglio segnato a mano' }
        : SEMPRE_INTERE.has(chiave)
          ? { fit: 'contain', motivo: 'grafica segnata a mano' }
          : decidi(m)
      const src = `/images/products/${slug}/${f}`

      if (d.fit === 'contain') {
        // Mostrata intera lascia scoperti i lati della cella: un bordo di un
        // colore solo li riempie, uno screziato lascia il grigio.
        voci[src] = { fit: 'contain', ...(m.pulito > 0.85 ? { fondo: m.fondo } : {}) }
        conto.contain++
      } else if (d.pos) {
        voci[src] = { pos: d.pos }
        conto.spostate++
      } else {
        conto.cover++ // riempie e resta centrata: è il comportamento di base
      }
      console.log(`${src.padEnd(46)} ${d.fit}${d.pos ? ' ' + d.pos : ''} · ${d.motivo}`)
    }
  }

  const testo = `/*
 * Generato da \`node scripts/fit-foto.js\`: non si modifica a mano.
 *
 * Come ogni foto entra nel carosello (assente = riempie centrata).
 *   fit: 'contain' intera · pos: 'x% y%' ritaglio puntato · fondo: colore del bordo
 */
export const fotoFit = ${JSON.stringify(voci, null, 2)}
`
  fs.writeFileSync(USCITA, testo)
  console.log(
    `\n${USCITA} · ${conto.cover} riempiono centrate, ${conto.spostate} riempiono spostate, ${conto.contain} intere.`,
  )
})()
