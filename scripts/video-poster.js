/*
 * Miniatura locale di un video YouTube in products/<slug>/: video.webp dal reel (oardefault,
 * verticale) o filmato.webp con --orizzontale (maxresdefault). Il filmato vuole poi varianti-foto.js.
 *   node scripts/video-poster.js <slug> <idVideo> [larghezzaMax] [qualità] [--orizzontale]
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const argomenti = process.argv.slice(2)
const orizzontale = argomenti.includes('--orizzontale')
const [slug, id, maxWidth, quality = '82'] = argomenti.filter((a) => !a.startsWith('--'))

if (!slug || !id) {
  console.error('Uso: node scripts/video-poster.js <slug> <idVideo> [larghezzaMax] [qualità] [--orizzontale]')
  process.exit(1)
}

// In ordine di preferenza. Per il reel il formato originale, poi i 16:9 come
// ripiego; per il filmato direttamente il 16:9 più grande.
const MISURE = orizzontale
  ? ['maxresdefault', 'hqdefault']
  : ['oardefault', 'maxresdefault', 'hqdefault']

const NOME = orizzontale ? 'filmato.webp' : 'video.webp'
const LARGHEZZA = Number(maxWidth ?? (orizzontale ? 1280 : 720))

async function scarica(id) {
  for (const misura of MISURE) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${misura}.jpg`)
    if (res.ok) return { misura, buf: Buffer.from(await res.arrayBuffer()) }
  }
  throw new Error(`Nessuna miniatura trovata per il video ${id}`)
}

const { misura, buf } = await scarica(id)
const meta = await sharp(buf).metadata()

if (orizzontale && meta.width < meta.height) {
  console.warn(
    `⚠ ${misura}.jpg è ${meta.width}×${meta.height}, non orizzontale: la cornice 16:9 lo taglierà.`,
  )
} else if (!orizzontale && meta.width >= meta.height) {
  console.warn(
    `⚠ ${misura}.jpg è ${meta.width}×${meta.height}, non verticale: la cornice 9:16 lo taglierà.`,
  )
}

const dest = path.join('public', 'images', 'products', slug, NOME)
fs.mkdirSync(path.dirname(dest), { recursive: true })

const targetW = Math.min(LARGHEZZA, meta.width)
await sharp(buf)
  .resize({ width: targetW, withoutEnlargement: true })
  .webp({ quality: Number(quality) })
  .toFile(dest)

const kb = (fs.statSync(dest).size / 1024).toFixed(0)
console.log(`✓ ${dest}  ${misura}  ${targetW}px  ${kb} KB`)
