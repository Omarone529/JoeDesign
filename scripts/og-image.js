/*
 * Anteprime social (Open Graph) in public/images/og/, una per pagina.
 *
 * Servono in JPEG: il sito è tutto WebP, che LinkedIn e WhatsApp non leggono
 * come anteprima, e il link condiviso uscirebbe con un riquadro vuoto.
 *
 * Da rilanciare dopo aver aggiunto un progetto o cambiato una copertina:
 *
 *   node scripts/og-image.js
 *
 * Due impianti, nella grammatica del sito: schede e "Chi sono" con testo a
 * sinistra e immagine a destra sempre CONTENUTA (ritagliata, i manifesti e le
 * figure intere perderebbero la parte che conta); home e archivio con la
 * famiglia di prodotti a tutta pagina.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  about,
  archive,
  aree,
  contaProgetti,
  periodoArchivio,
  periodoDi,
  profile,
  progettiArea,
  projectImages,
} from '../src/data/siteData.js'

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

/*
 * sharp disegna l'SVG ma non sa dire quanto misura il testo, e serve per
 * mandare a capo: le larghezze dei caratteri (millesimi di em, Helvetica Bold)
 * stanno qui.
 */
const ADV = {
  A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278,
  J: 556, K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  ' ': 278, '·': 350, '.': 278, ',': 278, '-': 333, '–': 556, '’': 238,
  0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556, 8: 556, 9: 556,
}

/*
 * Le stesse misure in Helvetica regular, minuscole comprese: la riga di
 * descrizione non è un titolo, si scrive come si parla e va a capo su parole
 * normali. Con la tabella del grassetto maiuscolo andrebbe a capo troppo
 * presto, lasciando righe corte in mezzo al vuoto.
 */
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

/*
 * Sceglie il corpo più grande con cui il titolo sta in `maxRighe` righe senza
 * sbordare. I titoli vanno da "FLUE" a "SEDIA A TEMPO DETERMINATO": un corpo
 * fisso servirebbe male entrambi.
 */
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

/* ---------------------------------------------------------------------------
 * Impianto 1 — testo a sinistra, immagine contenuta a destra.
 * Usato dalle schede progetto, da "Chi sono" e dalla home.
 *
 * `descrizione` è facoltativa: una o due righe fra il titolo e il filetto, per
 * dire in chiaro di cosa si tratta. La porta la home, dove l'anteprima del
 * link è la prima cosa che si vede del lavoro; le schede no, che il titolo
 * del progetto e la sua foto bastano.
 * ------------------------------------------------------------------------- */
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

  /*
   * Ritmo verticale. Le altezze si calcolano tutte prima, così il blocco
   * (occhiello · titolo · descrizione · filetto · firma) può essere centrato
   * sull'altezza che occupa davvero: un titolo su tre righe scende quanto
   * serve senza scavalcare l'occhiello.
   * `capH` è l'altezza delle maiuscole: in un testo SVG la y è la linea di
   * base, non il bordo superiore.
   */
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

  /*
   * `contain` su fondo carta: l'immagine entra intera, mai tagliata.
   *
   * Il ritratto scontornato fa eccezione (`ancoraInBasso`): nell'originale la
   * figura è già tagliata alle gambe, e centrata galleggerebbe a mezz'aria con
   * un taglio netto in mezzo alla carta. Appoggiata al bordo inferiore, il
   * taglio finisce fuori dalla cornice e la figura sta in piedi. Prima si
   * toglie il vuoto trasparente attorno, altrimenti a scendere sarebbe il
   * margine e non Joe.
   */
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

/* ---------------------------------------------------------------------------
 * Impianto 2 — immagine a tutta pagina, testo nel vuoto in alto a sinistra.
 * Usato da home e archivio, dove la famiglia di prodotti è già su fondo chiaro
 * e la parte alta della fotografia è libera.
 * ------------------------------------------------------------------------- */
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

  /*
   * La fotografia della famiglia di prodotti è già scontornata su bianco pieno:
   * la tela è bianca anche lei, così l'immagine entra INTERA (niente ritagli
   * sui prodotti in basso) e il bordo non si vede. Il margine lascia respiro e
   * libera l'angolo in alto a sinistra per il testo.
   */
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

fs.mkdirSync(outDir, { recursive: true })

const PERIODO = periodoArchivio
  ? periodoArchivio.primo === periodoArchivio.ultimo
    ? `${periodoArchivio.primo}`
    : `${periodoArchivio.primo}–${periodoArchivio.ultimo}`
  : ''

const firma = `${profile.displayName} · ${profile.role}`
const generati = []

/*
 * Home — il biglietto da visita. È il link che si condivide per primo, quindi
 * porta la persona e non il catalogo: il ritratto scontornato (lo stesso di
 * "Chi sono") a destra, e a sinistra nome, mestiere e una riga su cosa nasce
 * dal lavoro. La famiglia di prodotti resta l'anteprima dell'archivio, che è
 * la pagina dove quei prodotti si guardano davvero.
 */
await schedaConImmagine({
  sorgente: path.join(root, 'public', about.photos.hero.src),
  categoria: profile.place,
  titolo: profile.displayName,
  descrizione: profile.sintesi,
  coda: profile.role,
  ancoraInBasso: true,
  dest: path.join(outDir, 'home.jpg'),
})
generati.push('home.jpg')

/* Archivio */
await schedaPiena({
  sorgente: path.join(root, 'public/images/home/family-band.webp'),
  occhielloTesto: `${archive.length} progetti · ${PERIODO}`,
  titolo: 'Archivio progetti',
  coda: firma,
  dest: path.join(outDir, 'archivio.jpg'),
})
generati.push('archivio.jpg')

/*
 * Una per area dell'archivio. Product design riusa la famiglia di prodotti;
 * graphic design prende la copertina del manifesto più recente, contenuta e
 * non ritagliata come tutte le immagini di questo impianto.
 */
for (const area of aree) {
  const progetti = progettiArea(area.chiave)
  const periodo = periodoDi(progetti)
  const arco = periodo
    ? periodo.primo === periodo.ultimo
      ? `${periodo.primo}`
      : `${periodo.primo}–${periodo.ultimo}`
    : ''
  const occhielloArea = [contaProgetti(progetti.length), arco].filter(Boolean).join(' · ')
  const dest = path.join(outDir, `archivio-${area.slug}.jpg`)

  if (area.chiave === 'product') {
    await schedaPiena({
      sorgente: path.join(root, 'public/images/home/family-band.webp'),
      occhielloTesto: occhielloArea,
      titolo: area.label,
      coda: firma,
      dest,
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
      dest,
    })
  }
  generati.push(`archivio-${area.slug}.jpg`)
}

/* Chi sono */
await schedaConImmagine({
  sorgente: path.join(root, 'public', about.photos.lab.src),
  categoria: profile.place,
  titolo: 'Chi sono',
  coda: firma,
  dest: path.join(outDir, 'chi-sono.jpg'),
})
generati.push('chi-sono.jpg')

/* Una per progetto */
for (const item of archive) {
  const { cover } = projectImages(item)
  // Scheda ancora senza immagini: `seo.js` le fa usare l'anteprima dell'area.
  if (!cover) continue
  await schedaConImmagine({
    sorgente: path.join(root, 'public', cover),
    categoria: item.cat,
    titolo: item.title,
    coda: [item.year, profile.displayName].filter(Boolean).join(' · '),
    dest: path.join(outDir, `${item.slug}.jpg`),
  })
  generati.push(`${item.slug}.jpg`)
}

const peso = generati.reduce((t, f) => t + fs.statSync(path.join(outDir, f)).size, 0)
console.log(
  `✓ ${generati.length} immagini social in public/images/og/ ` +
    `(${(peso / 1024 / 1024).toFixed(1)} MB totali, ` +
    `~${Math.round(peso / generati.length / 1024)} KB l'una)`,
)
