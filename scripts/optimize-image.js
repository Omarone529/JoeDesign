/*
 * Converte un'immagine (jpg/png/…) in WebP ottimizzato per il web.
 * Utile per le foto che arrivano dalla cartella `media` in formato pesante.
 * (Le immagini in `ARCHIVIO WEBP` sono già webp: quelle si copiano e basta.)
 *
 * Uso:
 *   node scripts/optimize-image.js <sorgente> <destinazione.webp> [larghezzaMax] [qualità]
 *
 * Esempio:
 *   node scripts/optimize-image.js "C:/.../media/.../joe.jpg" public/images/about/joe-hero.webp 1100 82
 */
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
