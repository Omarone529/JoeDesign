/*
 * Miniatura locale di un video YouTube → public/images/products/<slug>/
 *
 * La scheda progetto non incorpora l'iframe di YouTube: mostra questa immagine
 * e carica il player solo al click (vedi src/components/VideoYouTube.jsx). La
 * miniatura vive quindi nel sito come tutte le altre foto e, finché non si
 * preme play, nessun dato raggiunge Google — è la ragione per cui l'informativa
 * privacy può ancora dire che le pagine si compongono con i soli file del sito.
 *
 * Due formati, due file, perché la scheda ne mostra due in due posti diversi:
 *
 *   video.webp    il reel verticale, prima slide del carosello (campo `video`)
 *   filmato.webp  il 16:9 della fascia in fondo alla scheda (campo `filmato`)
 *
 * Cambia il fotogramma che si scarica. `oardefault.jpg` è il formato originale,
 * ed è l'unico in cui uno Short resta 1080×1920: le altre misure di YouTube
 * sono 16:9 e in una cornice verticale tornerebbero con le bande. Per un video
 * orizzontale vale l'opposto, e `maxresdefault.jpg` (1280×720) è già la misura
 * giusta — è il motivo per cui la miniatura non si "hotlinka" e basta.
 *
 * Uso:
 *   node scripts/video-poster.js <slug> <idVideo> [larghezzaMax] [qualità]
 *   node scripts/video-poster.js <slug> <idVideo> --orizzontale
 *
 * Il file esce più largo di 900px, quindi dopo vuole `varianti-foto.js` per la
 * variante da 800 (il reel, a 720, non ne ha bisogno).
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
