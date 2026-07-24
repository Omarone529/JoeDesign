/*
 * Rimuove lo sfondo da una foto (segmentazione AI) e salva un WebP con
 * trasparenza, ridimensionato per il web.
 *
 * Uso:
 *   node scripts/remove-bg.js <sorgente> <destinazione.webp> [larghezzaMax] [qualità]
 */
import { removeBackground } from '@imgly/background-removal-node'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const [, , src, dest, maxWidth = '1600', quality = '90'] = process.argv
if (!src || !dest) {
  console.error('Uso: node scripts/remove-bg.js <sorgente> <destinazione.webp> [larghezzaMax] [qualità]')
  process.exit(1)
}

console.log('Rimozione sfondo in corso (può richiedere qualche minuto la prima volta)…')
// Percorso locale → file:// URL (necessario su Windows).
const input = /^[a-z]+:\/\//i.test(src) ? src : pathToFileURL(path.resolve(src)).href
const blob = await removeBackground(input)
const png = Buffer.from(await blob.arrayBuffer())

fs.mkdirSync(path.dirname(dest), { recursive: true })

// Ridimensiona e ottieni i pixel RGBA grezzi.
const { data, info } = await sharp(png)
  .resize({ width: Number(maxWidth), withoutEnlargement: true })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Pulizia: tieni solo la sagoma più grande, azzera i puntini staccati.
cleanStraySpecks(data, info.width, info.height)

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .webp({ quality: Number(quality), alphaQuality: 100 })
  .toFile(dest)

const kb = (fs.statSync(dest).size / 1024).toFixed(0)
console.log(`✓ ${path.basename(dest)}  ${kb} KB (con trasparenza)`)

/*
 * Mantiene solo la componente connessa di area maggiore (il soggetto) e rende
 * trasparente tutto il resto: elimina puntini/aloni staccati lasciati dalla
 * segmentazione, senza intaccare la figura principale.
 */
function cleanStraySpecks(data, W, H) {
  const T = 24 // soglia alpha per considerare un pixel "pieno"
  const N = W * H
  const label = new Int32Array(N).fill(-1)
  const stack = new Int32Array(N)
  let best = -1
  let bestSize = 0

  for (let seed = 0; seed < N; seed++) {
    if (label[seed] !== -1 || data[seed * 4 + 3] <= T) continue
    let sp = 0
    stack[sp++] = seed
    label[seed] = seed
    let size = 0
    while (sp > 0) {
      const p = stack[--sp]
      size++
      const x = p % W
      const y = (p - x) / W
      const nb = [
        x > 0 ? p - 1 : -1,
        x < W - 1 ? p + 1 : -1,
        y > 0 ? p - W : -1,
        y < H - 1 ? p + W : -1,
      ]
      for (const q of nb) {
        if (q >= 0 && label[q] === -1 && data[q * 4 + 3] > T) {
          label[q] = seed
          stack[sp++] = q
        }
      }
    }
    if (size > bestSize) {
      bestSize = size
      best = seed
    }
  }

  // Bounding box della sagoma principale.
  let minX = W, minY = H, maxX = 0, maxY = 0
  for (let p = 0; p < N; p++) {
    if (label[p] === best) {
      const x = p % W
      const y = (p - x) / W
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  const pad = 4
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad)
  maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad)

  // Azzera TUTTO ciò che è fuori dal riquadro della sagoma (rimuove qualsiasi
  // puntino/alone sparso, anche semi-trasparente), lasciando la figura intatta.
  let removed = 0
  for (let p = 0; p < N; p++) {
    const x = p % W
    const y = (p - x) / W
    const outside = x < minX || x > maxX || y < minY || y > maxY
    const strayInside = data[p * 4 + 3] > T && label[p] !== best
    if ((outside || strayInside) && data[p * 4 + 3] !== 0) {
      data[p * 4 + 3] = 0
      data[p * 4] = 0
      data[p * 4 + 1] = 0
      data[p * 4 + 2] = 0
      removed++
    }
  }
  console.log(`  pulizia: sagoma ${bestSize} px, box [${minX},${minY}]-[${maxX},${maxY}], rimossi ${removed} px`)
}
