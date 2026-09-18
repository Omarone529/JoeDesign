/*
 * Riduce public/images alla misura d'uso. Superato da compress-photos.js.
 *   node scripts/optimize-public-images.js [--apply]
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', 'public', 'images')
const APPLY = process.argv.includes('--apply')

// Ingombro a schermo ×2; vince il primo criterio che corrisponde.
const LIMITS = [
  { attempt: (p) => /products[\\/][^\\/]+[\\/]cover\.webp$/.test(p), max: 900 },
  { attempt: (p) => /products[\\/]/.test(p), max: 1200 },
  { attempt: () => true, max: 2000 },
]

const limitOf = (p) => LIMITS.find((l) => l.attempt(p)).max
const kb = (b) => Math.round(b / 1024)

function listFiles(dir) {
  return fs.readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f)
    return fs.statSync(p).isDirectory() ? listFiles(p) : [p]
  })
}

const files = listFiles(ROOT).filter((f) => f.endsWith('.webp'))
let beforeTotal = 0
let afterTotal = 0
let touched = 0

for (const file of files) {
  const relative = path.relative(ROOT, file).replace(/\\/g, '/')
  const weightBefore = fs.statSync(file).size
  beforeTotal += weightBefore

  // Su Windows sharp tiene il file agganciato: senza leggerlo prima in memoria,
  // la riscrittura in place fallisce con EBUSY.
  const original = fs.readFileSync(file)
  const meta = await sharp(original).metadata()
  const max = limitOf(file)

  if (meta.width <= max) {
    afterTotal += weightBefore
    continue
  }

    const buffer = await sharp(original)
    .resize({ width: max, withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 100 })
    .toBuffer()

  // Sorgenti molto compresse possono ingrassare al riencode.
  if (buffer.length >= weightBefore) {
    afterTotal += weightBefore
    continue
  }

  touched++
  afterTotal += buffer.length
  console.log(
    `  ${APPLY ? '✓' : '·'} ${relative}` +
      `  ${meta.width}px → ${max}px` +
      `  ${kb(weightBefore)} KB → ${kb(buffer.length)} KB`,
  )
  if (APPLY) fs.writeFileSync(file, buffer)
}

const savings = beforeTotal - afterTotal
console.log(
  `\n${touched} immagini su ${files.length} da ridimensionare.\n` +
    `Totale ${kb(beforeTotal)} KB → ${kb(afterTotal)} KB ` +
    `(${(savings / 1024 / 1024).toFixed(1)} MB in meno, -${Math.round((savings / beforeTotal) * 100)}%).`,
)
if (!APPLY) console.log('\nAnteprima: rilancia con --apply per riscrivere i file.')
