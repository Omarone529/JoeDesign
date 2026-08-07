/*
 * Tratto su fondo bianco → WebP con canale alpha (firme, schizzi, scansioni):
 * il fondo diventa trasparenza e il tratto prende il nero del sito.
 *
 * Il chiaro-scuro dell'originale diventa opacità e non colore, così i bordi
 * morbidi del pennarello non si seghettano come con una soglia netta.
 *
 * Uso:
 *   node scripts/ink-alpha.js <sorgente> <destinazione.webp> [larghezzaMax] [colore]
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const [, , src, dest, maxWidth = '1200', colore = '#14110f'] = process.argv

if (!src || !dest) {
  console.error('Uso: node scripts/ink-alpha.js <sorgente> <destinazione.webp> [larghezzaMax] [colore]')
  process.exit(1)
}

const sogliaChiaro = 40 // sotto: fondo, del tutto trasparente
const sogliaScuro = 170 // sopra: tratto pieno, del tutto opaco

const rgb = colore.replace('#', '').match(/../g).map((h) => parseInt(h, 16))

fs.mkdirSync(path.dirname(dest), { recursive: true })

// L'alpha di partenza va appiattito, o la carta trasparente conta come tratto.
const { data, info } = await sharp(src)
  .flatten({ background: '#ffffff' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Tinta unita + opacità ricavata dallo scuro. Le soglie tagliano il grigio
// sporco della scansione e stirano il resto su 0…255.
const scala = 255 / (sogliaScuro - sogliaChiaro)
const out = Buffer.alloc(info.width * info.height * 4)

for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
  const scuro = 255 - (data[i] + data[i + 1] + data[i + 2]) / 3
  const alpha = Math.max(0, Math.min(255, Math.round((scuro - sogliaChiaro) * scala)))
  out[o] = rgb[0]
  out[o + 1] = rgb[1]
  out[o + 2] = rgb[2]
  out[o + 3] = alpha
}

// Margini ritagliati: il segno resta senz'aria intorno, così lo si posiziona
// dal CSS senza compensare a occhio.
const finale = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim()
  .resize({ width: Number(maxWidth), withoutEnlargement: true })
  .webp({ quality: 92, alphaQuality: 100 })

const { width, height } = await finale.toFile(dest)

const kb = (fs.statSync(dest).size / 1024).toFixed(1)
console.log(`✓ ${path.basename(dest)}  ${width}×${height}  ${kb} KB`)
