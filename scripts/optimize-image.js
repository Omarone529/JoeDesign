// jpg/png → WebP, per le foto da `media`.
//   node scripts/optimize-image.js <sorgente> <dest.webp> [larghezzaMax] [qualità]
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const [, , src, dest, maxWidth = '1600', quality = '80'] = process.argv

if (!src || !dest) {
  console.error('Uso: node scripts/optimize-image.js <sorgente> <destinazione.webp> [larghezzaMax] [qualità]')
  process.exit(1)
}

fs.mkdirSync(path.dirname(dest), { recursive: true })

const img = sharp(src).rotate() // rispetta l'orientamento EXIF
const meta = await img.metadata()
const targetW = Math.min(Number(maxWidth), meta.width || Number(maxWidth))

await img
  .resize({ width: targetW, withoutEnlargement: true })
  .webp({ quality: Number(quality) })
  .toFile(dest)

const kb = (fs.statSync(dest).size / 1024).toFixed(0)
console.log(`✓ ${path.basename(dest)}  ${targetW}px  ${kb} KB`)
