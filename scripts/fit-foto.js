/*
 * fit-foto.js — decide come ogni foto d'archivio entra nella cornice del
 * carosello, e scrive il risultato in `src/data/fotoFit.js`.
 *
 *   node scripts/fit-foto.js
 *
 * Va rilanciato quando si aggiungono o si sostituiscono foto in
 * `public/images/products/`. Come og-image.js e pdf-disegno.js: si lancia a
 * mano, il risultato è un file versionato, la build non ricalcola niente.
 *
 * Perché serve: la cornice del carosello è a misura fissa (le immagini si
 * susseguono tutte uguali) mentre i formati d'archivio vanno dal 2.4:1 delle
 * campionature al 1:3 delle foto verticali. Riempiendo la cornice, su qualche
 * scheda il ritaglio mangiava il prodotto. Qui ogni immagine viene misurata:
 *
 * 1. si stima il colore del fondo dai pixel di bordo e si trova il riquadro di
 *    ciò che sta sopra il fondo, cioè il soggetto;
 * 2. si calcola dove puntare il ritaglio (`object-position`) perché il soggetto
 *    ci stia tutto, sia nella cornice più larga sia nella più stretta;
 * 3. se non ci sta comunque, decide che tipo di immagine è: una fotografia si
 *    lascia riempire — tagliarla è quello che farebbe un fotografo — mentre una
 *    grafica piatta (manifesto, disegno al tratto, pianta quotata, render su
 *    fondo bianco) si mostra intera, perché il taglio le mozzerebbe il testo o
 *    il pezzo;
 * 4. i formati fuori scala (le strisce di campionature, i montaggi altissimi)
 *    si mostrano interi comunque: riempiendo se ne vedrebbe una fetta.
 *
 * Fotografia o grafica si distinguono dai pixel "sfumati": in una foto la luce
 * degrada e un pixel su cinque sta su una transizione morbida, in una grafica
 * ci sono campiture piatte e bordi netti, e quei pixel sono pochi.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const RADICE = path.join('public', 'images', 'products')
const USCITA = path.join('src', 'data', 'fotoFit.js')

// Rapporti estremi che la cornice assume tra telefono e desktop: la più larga
// taglia in altezza, la più stretta in larghezza. Tenere allineati a
// `src/components/Carousel.jsx` se cambiano le altezze.
const R_LARGA = 1.05
const R_STRETTA = 0.75

// Oltre questi formati il ritaglio lascerebbe una fetta: si mostra intera.
const ESTREMO_LARGO = 2
const ESTREMO_STRETTO = 0.4

const FOTOGRAFIA = 0.13 // quota di pixel sfumati sopra cui è uno scatto

/*
 * Quello che la misura non prende: manifesti con il fondo sfumato o con dentro
 * una fotografia, che alla conta dei pixel sembrano scatti mentre tagliarli
 * mozzerebbe il testo. Si aggiunge qui `<progetto>/<file>` quando capita.
 */
const SEMPRE_INTERE = new Set(['grafica/06.webp', 'grafica/07.webp', 'trave/04.webp'])
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

  return {
    rapporto: meta.width / meta.height,
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
 * Finestra che resta visibile riempiendo una cornice di rapporto R, e punto in
 * cui centrarla (0–100) perché contenga il soggetto. `ok` è falso quando il
 * soggetto è più grande della finestra: lì non c'è posizione che tenga.
 */
function inquadra(rapporto, R, da, a) {
  const verticale = rapporto < R
  const visibile = verticale ? rapporto / R : R / rapporto
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

  const y = inquadra(rapporto, R_LARGA, box.y0, box.y1)
  const x = inquadra(rapporto, R_STRETTA, box.x0, box.x1)

  // Il soggetto non entra nella finestra: una foto regge lo stesso il taglio,
  // una grafica no.
  if ((!y.ok || !x.ok) && sfumati < FOTOGRAFIA) {
    return { fit: 'contain', motivo: 'grafica da non tagliare' }
  }

  const pos = x.pos === 50 && y.pos === 50 ? null : `${x.pos}% ${y.pos}%`
  return { fit: 'cover', pos, motivo: y.ok && x.ok ? 'soggetto salvo' : 'scatto, taglio libero' }
}

;(async () => {
  const voci = {}
  const conto = { cover: 0, spostate: 0, contain: 0 }

  for (const slug of fs.readdirSync(RADICE).sort()) {
    for (const f of fs.readdirSync(path.join(RADICE, slug)).sort()) {
      if (!f.endsWith('.webp') || f === 'disegno.webp') continue
      const d = SEMPRE_INTERE.has(`${slug}/${f}`)
        ? { fit: 'contain', motivo: 'grafica segnata a mano' }
        : decidi(await misura(path.join(RADICE, slug, f)))
      const src = `/images/products/${slug}/${f}`

      if (d.fit === 'contain') {
        voci[src] = { fit: 'contain' }
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
 */
export const fotoFit = ${JSON.stringify(voci, null, 2)}
`
  fs.writeFileSync(USCITA, testo)
  console.log(
    `\n${USCITA} · ${conto.cover} riempiono centrate, ${conto.spostate} riempiono spostate, ${conto.contain} intere.`,
  )
})()
