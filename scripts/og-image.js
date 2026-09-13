/*
 * Anteprime social 1200×630 in JPEG (LinkedIn e WhatsApp non leggono WebP), una serie per lingua:
 * public/images/og/ e og/en/. Da rilanciare dopo nuovi progetti o copertine: node scripts/og-image.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  aboutIn,
  archivioIn,
  areeIn,
  contaProgetti,
  manifestoFoto,
  periodoArchivio,
  periodoDi,
  profiloIn,
  progettiAreaIn,
  projectImages,
} from '../src/data/siteData.js'
import { LINGUE, testi } from '../src/i18n.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public', 'images', 'og')

/* 1200×630 (1.91:1): il formato che tutte le piattaforme trattano uguale. */
const W = 1200
const H = 630

const PAPER = '#f4f3f1'
const INK = '#14110f'
const MUTED = '#8f8b86'
const LINE = '#d7d4cf'
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Larghezze dei caratteri (millesimi di em, Helvetica Bold): sharp non misura il testo.
const ADV = {
  A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278,
  J: 556, K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  ' ': 278, '·': 350, '.': 278, ',': 278, '-': 333, '–': 556, '’': 238,
  0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556, 8: 556, 9: 556,
}

// Le stesse in Helvetica regular, per la descrizione.
const ADV_TESTO = {
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222,
  j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333,
  s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  à: 556, è: 556, é: 556, ì: 556, ò: 556, ù: 556,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278,
  J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  ' ': 278, '.': 278, ',': 278, ':': 278, ';': 278, '·': 350, '-': 333,
  '–': 556, '’': 191, '(': 333, ')': 333,
  0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556, 8: 556, 9: 556,
}

/* `tracking` in em (negativo = lettere più strette, come nei titoli del sito). */
function larghezza(testo, fontSize, tracking = 0, tabella = ADV) {
  let em = 0
  for (const ch of String(testo)) em += (tabella[ch] ?? 700) / 1000 + tracking
  return em * fontSize
}

function aCapo(testo, fontSize, maxW, tracking, tabella = ADV) {
  const righe = []
  let corrente = ''
  for (const parola of String(testo).split(/\s+/)) {
    const prova = corrente ? `${corrente} ${parola}` : parola
    if (corrente && larghezza(prova, fontSize, tracking, tabella) > maxW) {
      righe.push(corrente)
      corrente = parola
    } else {
      corrente = prova
    }
  }
  if (corrente) righe.push(corrente)
  return righe
}

// Il corpo più grande con cui il titolo sta in `maxRighe`.
function titoloAdattato(testo, { maxW, maxRighe = 3, max = 78, min = 34 }) {
  const tracking = -0.02
  for (let size = max; size >= min; size -= 2) {
    const righe = aCapo(testo, size, maxW, tracking)
    if (righe.length <= maxRighe && righe.every((r) => larghezza(r, size, tracking) <= maxW)) {
      return { size, righe, tracking }
    }
  }
  return { size: min, righe: aCapo(testo, min, maxW, tracking), tracking }
}

function occhiello(testo, x, y, colore = MUTED) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="15" font-weight="400"
    letter-spacing="3.4" fill="${colore}">${esc(String(testo).toUpperCase())}</text>`
}

// Impianto 1: testo a sinistra, immagine contenuta a destra (schede, "Chi sono", home).
async function schedaConImmagine({
  sorgente,
  categoria,
  titolo,
  descrizione,
  coda,
  ancoraInBasso = false,
  dest,
}) {
  const TESTO_X = 72
  const TESTO_MAX = 452
  const BOX = { x: 596, y: 46, w: 556, h: 538 } // area dell'immagine

  const { size, righe, tracking } = titoloAdattato(titolo.toUpperCase(), {
    maxW: TESTO_MAX,
    // Con la descrizione sotto, il titolo lascia spazio invece di prendersi
    // tutta l'altezza: due righe al massimo, corpo un po' più contenuto.
    ...(descrizione ? { maxRighe: 2, max: 68 } : null),
  })

  const DESC_SIZE = 21
  const DESC_INTERLINEA = 30
  const righeDesc = descrizione
    ? aCapo(descrizione, DESC_SIZE, TESTO_MAX, 0, ADV_TESTO)
    : []
  const altezzaDesc = righeDesc.length
    ? 34 + (righeDesc.length - 1) * DESC_INTERLINEA + DESC_SIZE * 0.72
    : 0

  // Altezze calcolate prima, per centrare il blocco. `capH` = altezza delle maiuscole (y SVG = linea di base).
  const capH = size * 0.72
  const interlinea = size * 0.92
  const altezzaTitolo = (righe.length - 1) * interlinea + capH
  const blocco = 15 + 30 + altezzaTitolo + altezzaDesc + 44 + 32 + 15

  let y = (H - blocco) / 2
  const occhielloY = y + 15
  const primaBaseline = y + 15 + 30 + capH
  const primaDesc = y + 15 + 30 + altezzaTitolo + 34 + DESC_SIZE * 0.72
  const filettoY = y + 15 + 30 + altezzaTitolo + altezzaDesc + 44
  const codaY = filettoY + 32 + 15

  const righeSvg = righe
    .map(
      (r, i) =>
        `<text x="${TESTO_X}" y="${primaBaseline + i * interlinea}" font-family="${FONT}"
          font-size="${size}" font-weight="700" letter-spacing="${(tracking * size).toFixed(2)}"
          fill="${INK}">${esc(r)}</text>`,
    )
    .join('\n')

  const descSvg = righeDesc
    .map(
      (r, i) =>
        `<text x="${TESTO_X}" y="${primaDesc + i * DESC_INTERLINEA}" font-family="${FONT}"
          font-size="${DESC_SIZE}" font-weight="400" fill="${INK}">${esc(r)}</text>`,
    )
    .join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${PAPER}"/>
    ${occhiello(categoria, TESTO_X, occhielloY)}
    ${righeSvg}
    ${descSvg}
    <line x1="${TESTO_X}" y1="${filettoY}" x2="${TESTO_X + 300}" y2="${filettoY}" stroke="${LINE}" stroke-width="1"/>
    ${occhiello(coda, TESTO_X, codaY, INK)}
    <line x1="${BOX.x - 48}" y1="0" x2="${BOX.x - 48}" y2="${H}" stroke="${LINE}" stroke-width="1"/>
  </svg>`

  // Immagine intera su carta; il ritratto (`ancoraInBasso`) va rifilato e appoggiato al fondo.
  const immagine = ancoraInBasso
    ? await sharp(sorgente)
        .trim({ threshold: 1 })
        .resize(BOX.w, H - 34, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true })
    : await sharp(sorgente)
        .resize(BOX.w, BOX.h, { fit: 'inside', withoutEnlargement: false })
        .toBuffer({ resolveWithObject: true })

  const left = BOX.x + Math.round((BOX.w - immagine.info.width) / 2)
  const top = ancoraInBasso
    ? H - immagine.info.height
    : BOX.y + Math.round((BOX.h - immagine.info.height) / 2)

  await sharp(Buffer.from(svg))
    .composite([{ input: immagine.data, left, top }])
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(dest)
}

// Impianto 2: immagine a tutta pagina, testo in alto a sinistra (archivio).
async function schedaPiena({ sorgente, occhielloTesto, titolo, coda, dest }) {
  const TESTO_X = 72
  const { size, righe, tracking } = titoloAdattato(titolo.toUpperCase(), {
    maxW: 700,
    max: 72,
    maxRighe: 2,
  })

  const capH = size * 0.72
  const interlinea = size * 0.92
  const primaBaseline = 118 + capH
  const codaY = primaBaseline + (righe.length - 1) * interlinea + 46

  const righeSvg = righe
    .map(
      (r, i) =>
        `<text x="${TESTO_X}" y="${primaBaseline + i * interlinea}" font-family="${FONT}"
          font-size="${size}" font-weight="700" letter-spacing="${(tracking * size).toFixed(2)}"
          fill="${INK}">${esc(r)}</text>`,
    )
    .join('\n')

  const testo = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${occhiello(occhielloTesto, TESTO_X, 86)}
    ${righeSvg}
    ${occhiello(coda, TESTO_X, codaY, INK)}
  </svg>`)

  // Foto su bianco pieno: entra intera, col margine che libera l'angolo per il testo.
  const immagine = await sharp(sorgente)
    .resize(W - 96, H - 150, { fit: 'inside' })
    .flatten({ background: '#ffffff' })
    .toBuffer({ resolveWithObject: true })

  await sharp({
    create: { width: W, height: H, channels: 3, background: '#ffffff' },
  })
    .composite([
      { input: immagine.data, left: Math.round((W - immagine.info.width) / 2), top: H - 24 - immagine.info.height },
      { input: testo, left: 0, top: 0 },
    ])
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(dest)
}

/* ------------------------------------------------------------------------- */

const PERIODO = periodoArchivio
  ? periodoArchivio.primo === periodoArchivio.ultimo
    ? `${periodoArchivio.primo}`
    : `${periodoArchivio.primo}–${periodoArchivio.ultimo}`
  : ''

const generati = []

for (const lang of LINGUE) {
  const T = testi(lang)
  const profile = profiloIn(lang)
  const about = aboutIn(lang)
  const archive = archivioIn(lang)
  // Le italiane in og/, le inglesi in og/en/: `seo.js` le cerca lì.
  const dirLingua = lang === 'en' ? path.join(outDir, 'en') : outDir
  fs.mkdirSync(dirLingua, { recursive: true })

  const firma = `${profile.displayName} · ${profile.role}`
  const dove = (nome) => path.join(dirLingua, nome)
  const fatto = (nome) => generati.push(path.join(lang === 'en' ? 'en' : '', nome))

  // Home: il ritratto, con nome, mestiere e una riga sul lavoro.
  await schedaConImmagine({
    sorgente: path.join(root, 'public', about.photos.hero.src),
    categoria: profile.place,
    titolo: profile.displayName,
    descrizione: profile.sintesi,
    coda: profile.role,
    ancoraInBasso: true,
    dest: dove('home.jpg'),
  })
  fatto('home.jpg')

  /* Archivio */
  await schedaPiena({
    sorgente: path.join(root, 'public/images/home/family-band.webp'),
    occhielloTesto: `${contaProgetti(archive.length, lang)} · ${PERIODO}`,
    titolo: T.seo.archivioNome,
    coda: firma,
    dest: dove('archivio.jpg'),
  })
  fatto('archivio.jpg')

  // Una per area: product riusa la famiglia di prodotti, graphic il manifesto più recente.
  for (const area of areeIn(lang)) {
    const progetti = progettiAreaIn(area.chiave, lang)
    const periodo = periodoDi(progetti)
    const arco = periodo
      ? periodo.primo === periodo.ultimo
        ? `${periodo.primo}`
        : `${periodo.primo}–${periodo.ultimo}`
      : ''
    const occhielloArea = [contaProgetti(progetti.length, lang), arco].filter(Boolean).join(' · ')
    const nome = `archivio-${area.slug}.jpg`

    if (area.chiave === 'product') {
      await schedaPiena({
        sorgente: path.join(root, 'public/images/home/family-band.webp'),
        occhielloTesto: occhielloArea,
        titolo: area.label,
        coda: firma,
        dest: dove(nome),
      })
    } else {
      // Il più recente FRA QUELLI con la copertina: una scheda in attesa di foto
      // non ha immagine da mettere qui.
      const vetrina = progetti.find((p) => projectImages(p).cover)
      await schedaConImmagine({
        sorgente: path.join(root, 'public', projectImages(vetrina).cover),
        categoria: occhielloArea,
        titolo: area.label,
        coda: firma,
        dest: dove(nome),
      })
    }
    fatto(nome)
  }

  /* Chi sono */
  await schedaConImmagine({
    sorgente: path.join(root, 'public', manifestoFoto.src),
    categoria: profile.place,
    titolo: T.chiSono.occhiello,
    coda: firma,
    dest: dove('chi-sono.jpg'),
  })
  fatto('chi-sono.jpg')

  /* Una per progetto */
  for (const item of archive) {
    const { cover } = projectImages(item)
    // Scheda ancora senza immagini: `seo.js` le fa usare l'anteprima dell'area.
    if (!cover) continue
    await schedaConImmagine({
      sorgente: path.join(root, 'public', cover),
      categoria: item.cat,
      titolo: item.title,
      coda: T.seo.progettoFirma(profile.displayName),
      dest: dove(`${item.slug}.jpg`),
    })
    fatto(`${item.slug}.jpg`)
  }
}

const peso = generati.reduce((t, f) => t + fs.statSync(path.join(outDir, f)).size, 0)
console.log(
  `✓ ${generati.length} immagini social in public/images/og/ ` +
    `(${(peso / 1024 / 1024).toFixed(1)} MB totali, ` +
    `~${Math.round(peso / generati.length / 1024)} KB l'una)`,
)
