/*
 * Tratto su fondo bianco → WebP con canale alpha (firme, schizzi, scansioni).
 *
 * Le scansioni arrivano come inchiostro nero su carta bianca: sovrapposte a una
 * foto mostrerebbero il loro rettangolo. Qui il fondo diventa trasparenza e il
 * tratto viene ricolorato nel nero caldo del sito, così il segno si appoggia su
 * qualsiasi immagine restando coerente con la palette.
 *
 * Il chiaro-scuro dell'originale non diventa colore ma opacità: i bordi morbidi
 * del pennarello restano morbidi, invece di seghettarsi come farebbe una soglia
 * netta. `sogliaChiaro`/`sogliaScuro` tagliano il grigio sporco della scansione
 * (sotto il primo = trasparente, sopra il secondo = pieno).
 *
 * Uso:
 *   node scripts/ink-alpha.js <sorgente> <destinazione.webp> [larghezzaMax] [colore]
 *
 * Esempio:
 *   node scripts/ink-alpha.js "C:/.../schizzo.webp" public/images/about/schizzo.webp 900
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

// 1. Pixel grezzi RGBA su fondo bianco (un eventuale alpha di partenza va
//    appiattito, altrimenti la carta trasparente conterebbe come tratto).
const { data, info } = await sharp(src)
  .flatten({ background: '#ffffff' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// 2. Ogni pixel diventa tinta unita + opacità ricavata dal suo scuro:
//    inchiostro nero → opaco, carta bianca → trasparente. Le due soglie
//    tagliano il grigio sporco della scansione e stirano il resto su 0…255.
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

// 3. Margini trasparenti ritagliati (la firma resta senz'aria intorno: così la
//    si posiziona dal CSS senza compensare a occhio) e larghezza finale.
const finale = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim()
  .resize({ width: Number(maxWidth), withoutEnlargement: true })
  .webp({ quality: 92, alphaQuality: 100 })

const { width, height } = await finale.toFile(dest)

const kb = (fs.statSync(dest).size / 1024).toFixed(1)
console.log(`✓ ${path.basename(dest)}  ${width}×${height}  ${kb} KB`)
