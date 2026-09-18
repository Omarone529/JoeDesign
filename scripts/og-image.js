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
  archiveIn,
  areasIn,
  countProjects,
  manifestoPhoto,
  archivePeriod,
  periodOf,
  profileIn,
  areaProjectsIn,
  projectImages,
} from '../src/data/siteData.js'
import { LANGS, texts } from '../src/i18n.js'

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
const ADV_TEXT = {
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
function width(text, fontSize, tracking = 0, table = ADV) {
  let em = 0
  for (const ch of String(text)) em += (table[ch] ?? 700) / 1000 + tracking
  return em * fontSize
}

function wrapLines(text, fontSize, maxW, tracking, table = ADV) {
  const rows = []
  let current = ''
  for (const word of String(text).split(/\s+/)) {
    const attempt = current ? `${current} ${word}` : word
    if (current && width(attempt, fontSize, tracking, table) > maxW) {
      rows.push(current)
      current = word
    } else {
      current = attempt
    }
  }
  if (current) rows.push(current)
  return rows
}

// Il corpo più grande con cui il titolo sta in `maxLines`.
function fittedTitle(text, { maxW, maxLines = 3, max = 78, min = 34 }) {
  const tracking = -0.02
  for (let size = max; size >= min; size -= 2) {
    const rows = wrapLines(text, size, maxW, tracking)
    if (rows.length <= maxLines && rows.every((r) => width(r, size, tracking) <= maxW)) {
      return { size, rows, tracking }
    }
  }
  return { size: min, rows: wrapLines(text, min, maxW, tracking), tracking }
}

function eyebrow(text, x, y, color = MUTED) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="15" font-weight="400"
    letter-spacing="3.4" fill="${color}">${esc(String(text).toUpperCase())}</text>`
}

// Impianto 1: testo a sinistra, immagine contenuta a destra (schede, "Chi sono", home).
async function cardWithImage({
  source,
  category,
  title,
  description,
  tail,
  anchoredBottom = false,
  dest,
}) {
  const TEXT_X = 72
  const TEXT_MAX = 452
  const BOX = { x: 596, y: 46, w: 556, h: 538 } // area dell'immagine

  const { size, rows, tracking } = fittedTitle(title.toUpperCase(), {
    maxW: TEXT_MAX,
    // Con la descrizione sotto, il titolo lascia spazio invece di prendersi
    // tutta l'altezza: due righe al massimo, corpo un po' più contenuto.
    ...(description ? { maxLines: 2, max: 68 } : null),
  })

  const DESC_SIZE = 21
  const DESC_LEADING = 30
  const descRows = description
    ? wrapLines(description, DESC_SIZE, TEXT_MAX, 0, ADV_TEXT)
    : []
  const descHeight = descRows.length
    ? 34 + (descRows.length - 1) * DESC_LEADING + DESC_SIZE * 0.72
    : 0

  // Altezze calcolate prima, per centrare il blocco. `capH` = altezza delle maiuscole (y SVG = linea di base).
  const capH = size * 0.72
  const leading = size * 0.92
  const titleHeight = (rows.length - 1) * leading + capH
  const block = 15 + 30 + titleHeight + descHeight + 44 + 32 + 15

  let y = (H - block) / 2
  const eyebrowY = y + 15
  const firstBaseline = y + 15 + 30 + capH
  const firstDesc = y + 15 + 30 + titleHeight + 34 + DESC_SIZE * 0.72
  const ruleY = y + 15 + 30 + titleHeight + descHeight + 44
  const tailY = ruleY + 32 + 15

  const svgRows = rows
    .map(
      (r, i) =>
        `<text x="${TEXT_X}" y="${firstBaseline + i * leading}" font-family="${FONT}"
          font-size="${size}" font-weight="700" letter-spacing="${(tracking * size).toFixed(2)}"
          fill="${INK}">${esc(r)}</text>`,
    )
    .join('\n')

  const descSvg = descRows
    .map(
      (r, i) =>
        `<text x="${TEXT_X}" y="${firstDesc + i * DESC_LEADING}" font-family="${FONT}"
          font-size="${DESC_SIZE}" font-weight="400" fill="${INK}">${esc(r)}</text>`,
    )
    .join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${PAPER}"/>
    ${eyebrow(category, TEXT_X, eyebrowY)}
    ${svgRows}
    ${descSvg}
    <line x1="${TEXT_X}" y1="${ruleY}" x2="${TEXT_X + 300}" y2="${ruleY}" stroke="${LINE}" stroke-width="1"/>
    ${eyebrow(tail, TEXT_X, tailY, INK)}
    <line x1="${BOX.x - 48}" y1="0" x2="${BOX.x - 48}" y2="${H}" stroke="${LINE}" stroke-width="1"/>
  </svg>`

  // Immagine intera su carta; il ritratto (`anchoredBottom`) va rifilato e appoggiato al fondo.
  const image = anchoredBottom
    ? await sharp(source)
        .trim({ threshold: 1 })
        .resize(BOX.w, H - 34, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true })
    : await sharp(source)
        .resize(BOX.w, BOX.h, { fit: 'inside', withoutEnlargement: false })
        .toBuffer({ resolveWithObject: true })

  const left = BOX.x + Math.round((BOX.w - image.info.width) / 2)
  const top = anchoredBottom
    ? H - image.info.height
    : BOX.y + Math.round((BOX.h - image.info.height) / 2)

  await sharp(Buffer.from(svg))
    .composite([{ input: image.data, left, top }])
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(dest)
}

// Impianto 2: immagine a tutta pagina, testo in alto a sinistra (archivio).
async function fullCard({ source, eyebrowText, title, tail, dest }) {
  const TEXT_X = 72
  const { size, rows, tracking } = fittedTitle(title.toUpperCase(), {
    maxW: 700,
    max: 72,
    maxLines: 2,
  })

  const capH = size * 0.72
  const leading = size * 0.92
  const firstBaseline = 118 + capH
  const tailY = firstBaseline + (rows.length - 1) * leading + 46

  const svgRows = rows
    .map(
      (r, i) =>
        `<text x="${TEXT_X}" y="${firstBaseline + i * leading}" font-family="${FONT}"
          font-size="${size}" font-weight="700" letter-spacing="${(tracking * size).toFixed(2)}"
          fill="${INK}">${esc(r)}</text>`,
    )
    .join('\n')

  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${eyebrow(eyebrowText, TEXT_X, 86)}
    ${svgRows}
    ${eyebrow(tail, TEXT_X, tailY, INK)}
  </svg>`)

  // Foto su bianco pieno: entra intera, col margine che libera l'angolo per il testo.
  const image = await sharp(source)
    .resize(W - 96, H - 150, { fit: 'inside' })
    .flatten({ background: '#ffffff' })
    .toBuffer({ resolveWithObject: true })

  await sharp({
    create: { width: W, height: H, channels: 3, background: '#ffffff' },
  })
    .composite([
      { input: image.data, left: Math.round((W - image.info.width) / 2), top: H - 24 - image.info.height },
      { input: text, left: 0, top: 0 },
    ])
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(dest)
}

/* ------------------------------------------------------------------------- */

const PERIOD = archivePeriod
  ? archivePeriod.first === archivePeriod.last
    ? `${archivePeriod.first}`
    : `${archivePeriod.first}–${archivePeriod.last}`
  : ''

const generatedFiles = []

for (const lang of LANGS) {
  const T = texts(lang)
  const profile = profileIn(lang)
  const about = aboutIn(lang)
  const archive = archiveIn(lang)
  // Le italiane in og/, le inglesi in og/en/: `seo.js` le cerca lì.
  const langDir = lang === 'en' ? path.join(outDir, 'en') : outDir
  fs.mkdirSync(langDir, { recursive: true })

  const signature = `${profile.displayName} · ${profile.role}`
  const where = (name) => path.join(langDir, name)
  const done = (name) => generatedFiles.push(path.join(lang === 'en' ? 'en' : '', name))

  // Home: il ritratto, con nome, mestiere e una riga sul lavoro.
  await cardWithImage({
    source: path.join(root, 'public', about.photos.hero.src),
    category: profile.place,
    title: profile.displayName,
    description: profile.summary,
    tail: profile.role,
    anchoredBottom: true,
    dest: where('home.jpg'),
  })
  done('home.jpg')

  /* Archivio */
  await fullCard({
    source: path.join(root, 'public/images/home/family-band.webp'),
    eyebrowText: `${countProjects(archive.length, lang)} · ${PERIOD}`,
    title: T.seo.archiveName,
    tail: signature,
    dest: where('archive.jpg'),
  })
  done('archive.jpg')

  // Una per area: product riusa la famiglia di prodotti, graphic il manifesto più recente.
  for (const area of areasIn(lang)) {
    const projects = areaProjectsIn(area.key, lang)
    const period = periodOf(projects)
    const arc = period
      ? period.first === period.last
        ? `${period.first}`
        : `${period.first}–${period.last}`
      : ''
    const areaEyebrow = [countProjects(projects.length, lang), arc].filter(Boolean).join(' · ')
    const name = `archive-${area.slug}.jpg`

    if (area.key === 'product') {
      await fullCard({
        source: path.join(root, 'public/images/home/family-band.webp'),
        eyebrowText: areaEyebrow,
        title: area.label,
        tail: signature,
        dest: where(name),
      })
    } else {
      // Il più recente FRA QUELLI con la copertina: una scheda in attesa di foto
      // non ha immagine da mettere qui.
      const showcase = projects.find((p) => projectImages(p).cover)
      await cardWithImage({
        source: path.join(root, 'public', projectImages(showcase).cover),
        category: areaEyebrow,
        title: area.label,
        tail: signature,
        dest: where(name),
      })
    }
    done(name)
  }

  /* Chi sono */
  await cardWithImage({
    source: path.join(root, 'public', manifestoPhoto.src),
    category: profile.place,
    title: T.about.eyebrow,
    tail: signature,
    dest: where('about.jpg'),
  })
  done('about.jpg')

  /* Una per progetto */
  for (const item of archive) {
    const { cover } = projectImages(item)
    // Scheda ancora senza immagini: `seo.js` le fa usare l'anteprima dell'area.
    if (!cover) continue
    await cardWithImage({
      source: path.join(root, 'public', cover),
      category: item.cat,
      title: item.title,
      tail: T.seo.projectSignature(profile.displayName),
      dest: where(`${item.slug}.jpg`),
    })
    done(`${item.slug}.jpg`)
  }
}

const weight = generatedFiles.reduce((t, f) => t + fs.statSync(path.join(outDir, f)).size, 0)
console.log(
  `✓ ${generatedFiles.length} immagini social in public/images/og/ ` +
    `(${(weight / 1024 / 1024).toFixed(1)} MB totali, ` +
    `~${Math.round(weight / generatedFiles.length / 1024)} KB l'una)`,
)
