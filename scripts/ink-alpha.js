/*
 * Tratto su fondo bianco → WebP con alpha; il chiaro-scuro diventa opacità.
 *   node scripts/ink-alpha.js <sorgente> <destinazione.webp> [larghezzaMax] [colore]
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const [, , src, dest, maxWidth = '1200', color = '#14110f'] = process.argv

if (!src || !dest) {
  console.error('Uso: node scripts/ink-alpha.js <sorgente> <destinazione.webp> [larghezzaMax] [colore]')
  process.exit(1)
}

const lightThreshold = 40 // sotto: fondo, del tutto trasparente
const darkThreshold = 170 // sopra: tratto pieno, del tutto opaco

const rgb = color.replace('#', '').match(/../g).map((h) => parseInt(h, 16))

fs.mkdirSync(path.dirname(dest), { recursive: true })

// L'alpha di partenza va appiattito, o la carta trasparente conta come tratto.
const { data, info } = await sharp(src)
  .flatten({ background: '#ffffff' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Tinta unita + opacità ricavata dallo scuro. Le soglie tagliano il grigio
// sporco della scansione e stirano il resto su 0…255.
const scale = 255 / (darkThreshold - lightThreshold)
const out = Buffer.alloc(info.width * info.height * 4)

for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
  const dark = 255 - (data[i] + data[i + 1] + data[i + 2]) / 3
  const alpha = Math.max(0, Math.min(255, Math.round((dark - lightThreshold) * scale)))
  out[o] = rgb[0]
  out[o + 1] = rgb[1]
  out[o + 2] = rgb[2]
  out[o + 3] = alpha
}

// Margini ritagliati: il segno resta senz'aria intorno, così lo si posiziona
// dal CSS senza compensare a occhio.
const final = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim()
  .resize({ width: Number(maxWidth), withoutEnlargement: true })
  .webp({ quality: 92, alphaQuality: 100 })

const { width, height } = await final.toFile(dest)

const kb = (fs.statSync(dest).size / 1024).toFixed(1)
console.log(`✓ ${path.basename(dest)}  ${width}×${height}  ${kb} KB`)
