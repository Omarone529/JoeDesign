/*
 * Miniatura locale di un video YouTube in products/<slug>/: video.webp dal reel (oardefault,
 * verticale) o film.webp con --horizontal (maxresdefault). Il filmato vuole poi photo-variants.js.
 *   node scripts/video-poster.js <slug> <idVideo> [larghezzaMax] [qualità] [--horizontal]
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const horizontal = args.includes('--horizontal')
const [slug, id, maxWidth, quality = '82'] = args.filter((a) => !a.startsWith('--'))

if (!slug || !id) {
  console.error('Uso: node scripts/video-poster.js <slug> <idVideo> [larghezzaMax] [qualità] [--horizontal]')
  process.exit(1)
}

// In ordine di preferenza. Per il reel il formato originale, poi i 16:9 come
// ripiego; per il filmato direttamente il 16:9 più grande.
const SIZES = horizontal
  ? ['maxresdefault', 'hqdefault']
  : ['oardefault', 'maxresdefault', 'hqdefault']

const NAME = horizontal ? 'film.webp' : 'video.webp'
const WIDTH = Number(maxWidth ?? (horizontal ? 1280 : 720))

async function download(id) {
  for (const size of SIZES) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`)
    if (res.ok) return { size, buf: Buffer.from(await res.arrayBuffer()) }
  }
  throw new Error(`Nessuna miniatura trovata per il video ${id}`)
}

const { size, buf } = await download(id)
const meta = await sharp(buf).metadata()

if (horizontal && meta.width < meta.height) {
  console.warn(
    `⚠ ${size}.jpg è ${meta.width}×${meta.height}, non orizzontale: la cornice 16:9 lo taglierà.`,
  )
} else if (!horizontal && meta.width >= meta.height) {
  console.warn(
    `⚠ ${size}.jpg è ${meta.width}×${meta.height}, non verticale: la cornice 9:16 lo taglierà.`,
  )
}

const dest = path.join('public', 'images', 'products', slug, NAME)
fs.mkdirSync(path.dirname(dest), { recursive: true })

const targetW = Math.min(WIDTH, meta.width)
await sharp(buf)
  .resize({ width: targetW, withoutEnlargement: true })
  .webp({ quality: Number(quality) })
  .toFile(dest)

const kb = (fs.statSync(dest).size / 1024).toFixed(0)
console.log(`✓ ${dest}  ${size}  ${targetW}px  ${kb} KB`)
