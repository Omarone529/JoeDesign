/*
 * Controlla che siteData.js corrisponda ai file su disco (foto, copertine, anteprime social,
 * indici `ai`, chiavi di contentEn.js). Gira in prebuild. ERRORE ferma la build, AVVISO no.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pub = (p) => path.join(root, 'public', p)
// import() dinamico: su Windows un percorso assoluto non è un URL valido, serve file://
const mod = (p) => pathToFileURL(path.join(root, p)).href

const {
  archive,
  areas,
  areaOf,
  about,
  focusItems,
  homeHero,
  familyBand,
  manifestoPhoto,
  projectImages,
} = await import(mod('src/data/siteData.js'))
const { projectsEn, aboutEn } = await import(mod('src/data/contentEn.js'))
const { variants, VARIANT_SUFFIX } = await import(mod('src/data/variants.js'))

const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

const missing = (src) => !fs.existsSync(pub(src))
const requireFile = (src, where) => missing(src) && err(`${where}: manca ${src}`)

// Progetti

const areaKeys = new Set(areas.map((a) => a.key))
const seenSlugs = new Set()

for (const p of archive) {
  const where = `progetto "${p.slug}"`

  if (seenSlugs.has(p.slug)) err(`${where}: slug ripetuto, gli URL si sovrascriverebbero`)
  seenSlugs.add(p.slug)

  if (!areaKeys.has(areaOf(p))) {
    err(`${where}: area "${areaOf(p)}" non esiste (attese: ${[...areaKeys].join(', ')})`)
  }

  const { cover, gallery, drawing, backdrop, videoPoster, filmPoster } = projectImages(p)

  if (cover) requireFile(cover, where)
  gallery.forEach((src) => requireFile(src, where))
  if (drawing) requireFile(drawing, where)
  if (backdrop) requireFile(backdrop, where)
  if (videoPoster) requireFile(videoPoster, where)
  if (filmPoster) requireFile(filmPoster, where)

  // Al contrario: foto in cartella oltre `photos`, di solito un conteggio non aggiornato.
  const dir = pub(`/images/products/${p.slug}`)
  if (fs.existsSync(dir)) {
    const onDisk = fs.readdirSync(dir).filter((f) => /^\d\d\.webp$/.test(f)).length
    const declared = p.photos || 0
    if (onDisk > declared) {
      err(
        `${where}: la cartella ha ${onDisk} foto di galleria ma \`photos\` dice ${declared}: le ultime ${onDisk - declared} non compaiono nel sito`,
      )
    }
  }

  // Un'etichetta che punta alla foto sbagliata dichiara sintetica una foto vera.
  for (const [field, list] of [
    ['generated', p.ai?.generated],
    ['modified', p.ai?.modified],
  ]) {
    if (!Array.isArray(list)) continue
    for (const n of list) {
      if (!Number.isInteger(n) || n < 1 || n > (p.photos || 0)) {
        err(`${where}: ai.${field} contiene ${n}, fuori dalle ${p.photos || 0} foto di galleria`)
      }
    }
  }
  if (p.ai?.backdrop && !p.backdrop) {
    err(`${where}: ai.backdrop è dichiarato ma il progetto non ha \`sfondo: true\``)
  }

  if (!projectsEn[p.slug]) warn(`${where}: nessuna traduzione in contentEn.js, resta in italiano`)
}

// Una chiave di troppo in contentEn non protesta: è sempre un refuso nello slug.
for (const slug of Object.keys(projectsEn)) {
  if (!seenSlugs.has(slug)) {
    err(`contentEn.js: la chiave "${slug}" non corrisponde a nessun progetto dell'archivio`)
  }
}

// Home, chi sono, anteprime

focusItems.forEach((f) => requireFile(f.cover, `home, lavoro selezionato "${f.slug}"`))
requireFile(homeHero.src, 'home')
requireFile(manifestoPhoto.src, 'home')
// Non è in pagina: è la sorgente delle anteprime dell'archivio.
requireFile(familyBand.src, 'anteprime social dell’archivio')
// Card di "Chi sono" senza traduzione (avviso) o traduzioni senza card (errore).
{
  const enKeys = new Set(aboutEn.skillCards.map((c) => c.key))
  for (const c of about.skillCards) {
    if (!enKeys.has(c.key)) {
      warn(`chi sono: la card "${c.key}" non ha traduzione in contentEn.js, resta in italiano`)
    }
    enKeys.delete(c.key)
    if (c.photos) requireFile(c.photos.src, `chi sono, card "${c.key}"`)
  }
  for (const key of enKeys) {
    err(`contentEn.js: la card "${key}" non corrisponde a nessuna competenza di siteData.js`)
  }
}

requireFile(about.photos.hero.src, 'chi sono')
requireFile(about.photos.sketches.src, 'chi sono')
for (const plate of about.sketchbook) {
  for (const face of [plate.front, plate.back]) {
    if (!face) continue
    requireFile(face.src, 'sketchbook')
    requireFile(face.src.replace(/\.webp$/, '-half.webp'), 'sketchbook (mezza misura)')
  }
}

// og-image.js si lancia a mano, e ci si dimentica.
const expectedOg = [
  'home',
  'about',
  'archive',
  ...areas.map((a) => `archive-${a.slug}`),
  ...archive.map((p) => p.slug),
]
for (const name of expectedOg) {
  for (const [language, prefix] of [
    ['it', ''],
    ['en', 'en/'],
  ]) {
    const src = `/images/og/${prefix}${name}.jpg`
    if (missing(src)) err(`anteprima social (${language}): manca ${src}: rilancia scripts/og-image.js`)
  }
}

// Font: senza i file, fuori da Apple il sito esce in Arial.
const css = fs.readFileSync(path.join(root, 'src', 'index.css'), 'utf8')
for (const [, font] of css.matchAll(/url\('(\/fonts\/[^']+)'\)/g)) {
  if (missing(font)) warn(`font: manca ${font}, fuori da iPhone e Mac il sito usa Arial`)
}

// Varianti da 800px

for (const [src, width] of Object.entries(variants)) {
  const variant = src.replace(/\.webp$/, `${VARIANT_SUFFIX}.webp`)
  if (missing(src)) err(`variants.js: elenca ${src}, che non esiste`)
  if (missing(variant)) {
    err(`variants.js: manca ${variant}: rilancia scripts/photo-variants.js`)
  }
  if (!Number.isInteger(width) || width <= 800) {
    err(`variants.js: ${src} dichiara larghezza ${width}, che non è un originale più grande di 800`)
  }
}

// Esito

for (const a of warnings) console.log(`  ~ ${a}`)
for (const e of errors) console.error(`  ✗ ${e}`)

if (errors.length) {
  console.error(
    `\nVerifica fallita: ${errors.length} error${errors.length === 1 ? 'e' : 'i'} nei dati. La build si ferma qui.`,
  )
  process.exit(1)
}

console.log(
  `  ✓ dati verificati: ${archive.length} progetti, ${Object.keys(variants).length} immagini con variante${
    warnings.length ? `, ${warnings.length} avvis${warnings.length === 1 ? 'o' : 'i'}` : ''
  }`,
)
