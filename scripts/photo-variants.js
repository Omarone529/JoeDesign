/*
 * Varianti da 800px (-800) per srcset, e l'elenco in src/data/variants.js. Rilanciabile: salta
 * le aggiornate e cancella le orfane.
 *   node scripts/photo-variants.js [--dry-run]
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { photoFit } from '../src/data/photoFit.js'

const ROOT = path.join('public', 'images')
const OUTPUT = path.join('src', 'data', 'variants.js')

export const SUFFIX = '-800'
const WIDTH = 800

// Sotto questa larghezza l'originale è già piccolo: una seconda copia
// aggiungerebbe un file al deploy senza togliere byte a nessuno.
const MIN_WIDTH = 900

// Le stesse qualità di compress-photos.js: grafiche piatte e trasparenze si
// sgranano prima delle fotografie.
const QUALITY = 76
const DELICATE_QUALITY = 86

// Se la variante non è almeno questo più leggera, non vale il file in più.
const MIN_GAIN = 0.2

// Le og: le apre solo il crawler di un social, che pesca l'immagine dichiarata
// nel meta tag e non guarda nessun srcset.
const EXCLUDED = new Set(['og'])

const dryRun = process.argv.includes('--dry-run')

const flatImages = new Set(
  Object.entries(photoFit)
    .filter(([, v]) => v.fit === 'contain')
    .map(([k]) => k.replace('/images/', '').split('/').join(path.sep))
)

export const isVariant = (name) => name.endsWith(`${SUFFIX}.webp`)

function listFiles(dir) {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) {
      if (!EXCLUDED.has(name)) out.push(...listFiles(p))
    } else if (name.endsWith('.webp') && !isVariant(name)) {
      out.push(p)
    }
  }
  return out
}

const kb = (b) => `${Math.round(b / 1024)} kB`
const url = (file) => `/images/${path.relative(ROOT, file).split(path.sep).join('/')}`

const originals = listFiles(ROOT)
const manifesto = {}
let generated = 0
let skipped = 0
let beforeTotal = 0
let afterTotal = 0

for (const file of originals) {
  const meta = await sharp(fs.readFileSync(file)).metadata()
  if (meta.width < MIN_WIDTH) continue

  const variant = file.replace(/\.webp$/, `${SUFFIX}.webp`)
  const rel = path.relative(ROOT, file)

  // Già aggiornata: si tiene, si conta nel manifesto e si passa oltre.
  if (fs.existsSync(variant) && fs.statSync(variant).mtimeMs >= fs.statSync(file).mtimeMs) {
    manifesto[url(file)] = meta.width
    skipped += 1
    continue
  }

  const delicate = flatImages.has(rel) || meta.hasAlpha
  const buf = await sharp(fs.readFileSync(file))
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: delicate ? DELICATE_QUALITY : QUALITY })
    .toBuffer()

  const before = fs.statSync(file).size
  if (buf.length > before * (1 - MIN_GAIN)) continue

  if (!dryRun) fs.writeFileSync(variant, buf)
  manifesto[url(file)] = meta.width
  generated += 1
  beforeTotal += before
  afterTotal += buf.length

  console.log(
    `  ${rel.split(path.sep).join('/')}\n` +
      `    ${meta.width}px ${kb(before)}  →  ${WIDTH}px ${kb(buf.length)}`
  )
}

// Varianti il cui originale è stato rinominato o tolto: senza questa pulizia
// resterebbero nel deploy per sempre, invisibili e mai servite.
const orphans = []
function findOrphans(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) findOrphans(p)
    else if (isVariant(name) && !fs.existsSync(p.replace(`${SUFFIX}.webp`, '.webp'))) orphans.push(p)
  }
}
findOrphans(ROOT)
for (const p of orphans) {
  if (!dryRun) fs.unlinkSync(p)
  console.log(`  orfana rimossa: ${path.relative(ROOT, p).split(path.sep).join('/')}`)
}

const sorted = Object.fromEntries(Object.entries(manifesto).sort(([a], [b]) => a.localeCompare(b)))

const header = `/*
 * Generato da \`node scripts/photo-variants.js\`: non si modifica a mano.
 *
 * Foto con variante da 800 px e larghezza dell'originale, per \`srcSetDi()\`.
 */
export const VARIANT_WIDTH = ${WIDTH}
export const VARIANT_SUFFIX = '${SUFFIX}'

export const variants = ${JSON.stringify(sorted, null, 2)}
`

if (!dryRun) fs.writeFileSync(OUTPUT, header)

console.log(
  `\n${dryRun ? '[prova] ' : ''}${generated} varianti generate, ${skipped} già aggiornate` +
    (orphans.length ? `, ${orphans.length} orfane rimosse` : '') +
    `\n${Object.keys(sorted).length} foto nel manifesto` +
    (generated ? `\nle nuove: ${kb(beforeTotal)}  →  ${kb(afterTotal)}   (-${(((beforeTotal - afterTotal) * 100) / beforeTotal).toFixed(0)}%)` : '')
)
if (dryRun) console.log('\nNiente è stato scritto. Rilancia senza --dry-run per applicare.')
