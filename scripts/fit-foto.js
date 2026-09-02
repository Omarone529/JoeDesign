/*
 * Decide come ogni foto entra nella cornice quadrata del carosello e scrive
 * `src/data/fotoFit.js`. Da rilanciare quando cambiano le foto di
 * `public/images/products/`; il risultato è versionato.
 *
 *   node scripts/fit-foto.js
 *
 * I formati d'archivio vanno dal 2.4:1 al 1:3, e riempiendo la cornice su
 * qualche scheda il ritaglio mangiava il prodotto. Per ogni immagine: si stima
 * il fondo dai pixel di bordo, si trova il riquadro del soggetto e si punta lì
 * il ritaglio. Se il soggetto non ci sta comunque, una fotografia si lascia
 * tagliare — è quello che farebbe un fotografo — mentre una grafica piatta si
 * mostra intera, o il taglio le mozza il testo.
 *
 * Le due si distinguono dai pixel sfumati: in una foto la luce degrada e uno su
 * cinque sta su una transizione morbida, in una grafica i bordi sono netti.
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

/*
 * Quello che la misura non prende: manifesti col fondo sfumato o con dentro una
 * foto, che alla conta dei pixel sembrano scatti. Si aggiunge a mano.
 */
const SEMPRE_INTERE = new Set([
  'in-the-box/cover.webp',
  'rilegno/cover.webp',
  // Manifesti su campo pieno: la misura li crede tagliabili perché il
  // giallo è uniforme, ma il testo sta tutto in alto e si perderebbe.
  'citta-parla/cover.webp',
  'direzione-tolleranza/cover.webp',
])

/*
 * Il ritaglio che la misura non può indovinare: uno scatto dove il soggetto
 * riempie tutto il fotogramma, quindi non c'è un riquadro da puntare, ma il
 * prodotto sta in un punto solo. Chiave '<slug>/<file>' → `object-position`.
 */
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

/*
 * Quota di pixel che stanno su una transizione morbida: alta in una fotografia
 * (la luce degrada), bassa in una grafica piatta, dove si passa di netto da una
 * campitura all'altra.
 */
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

/*
 * Quanta parte dell'immagine resta visibile riempiendo la cornice, per asse:
 * un'immagine più stretta della cornice si taglia in altezza e si vede tutta in
 * larghezza, una più larga il contrario. Quadrata come la cornice = tutta.
 */
function finestra(rapporto) {
  return rapporto < R_CORNICE
    ? { x: 1, y: rapporto / R_CORNICE }
    : { x: R_CORNICE / rapporto, y: 1 }
}

/*
 * Dove centrare la finestra lungo un asse (0–100) perché contenga il soggetto,
 * che sull'immagine va da `da` ad `a`. `ok` è falso quando il soggetto è più
 * grande della finestra: lì non c'è posizione che tenga.
 */
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
      if (!f.endsWith('.webp') || f === 'disegno.webp') continue
      const chiave = `${slug}/${f}`
      const m = await misura(path.join(RADICE, slug, f))
      const d = FUOCO_A_MANO[chiave]
        ? { fit: 'cover', pos: FUOCO_A_MANO[chiave], motivo: 'ritaglio segnato a mano' }
        : SEMPRE_INTERE.has(chiave)
          ? { fit: 'contain', motivo: 'grafica segnata a mano' }
          : decidi(m)
      const src = `/images/products/${slug}/${f}`

      if (d.fit === 'contain') {
        // Mostrata intera lascia scoperti i lati della cella: se il suo bordo è
        // di un colore solo, quel colore riempie lo scoperto e lo spazio vuoto
        // sparisce. Bordo screziato (una foto al vivo): si lascia il grigio.
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
 * Generato da \`node scripts/fit-foto.js\` — non si modifica a mano.
 *
 * Come ogni foto entra nella cornice del carosello. Manca da qui tutto ciò che
 * riempie la cornice restando centrato: è il comportamento di base.
 *   fit: 'contain' → mostrata intera, il ritaglio le toglierebbe il soggetto
 *   pos: '<x>% <y>%' → riempie, ma il ritaglio è puntato sul prodotto
 *   fondo: '#rrggbb' → il colore del suo bordo, per coprire lo spazio che
 *     l'immagine intera lascia scoperto nella cella
 */
export const fotoFit = ${JSON.stringify(voci, null, 2)}
`
  fs.writeFileSync(USCITA, testo)
  console.log(
    `\n${USCITA} · ${conto.cover} riempiono centrate, ${conto.spostate} riempiono spostate, ${conto.contain} intere.`,
  )
})()
