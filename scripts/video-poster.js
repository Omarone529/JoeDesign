/*
 * Miniatura locale di uno Short YouTube → public/images/products/<slug>/video.webp
 *
 * La scheda progetto non incorpora l'iframe di YouTube: mostra questa immagine
 * e carica il player solo al click (vedi src/components/VideoShort.jsx). La
 * miniatura vive quindi nel sito come tutte le altre foto e, finché non si
 * preme play, nessun dato raggiunge Google — è la ragione per cui l'informativa
 * privacy può ancora dire che le pagine si compongono con i soli file del sito.
 *
 * `oardefault.jpg` è il fotogramma nel formato originale (1080×1920 per uno
 * Short). Le altre misure di YouTube sono 16:9: in una cornice verticale
 * tornerebbero con le bande, ed è il motivo per cui la miniatura non si
 * "hotlinka" e basta.
 *
 * Uso:
 *   node scripts/video-poster.js <slug> <idVideo> [larghezzaMax] [qualità]
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const [, , slug, id, maxWidth = '720', quality = '82'] = process.argv

if (!slug || !id) {
  console.error('Uso: node scripts/video-poster.js <slug> <idVideo> [larghezzaMax] [qualità]')
  process.exit(1)
}

// In ordine di preferenza: il formato originale, poi i 16:9 come ripiego per i
// video che Short non sono.
const MISURE = ['oardefault', 'maxresdefault', 'hqdefault']

async function scarica(id) {
  for (const misura of MISURE) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${misura}.jpg`)
    if (res.ok) return { misura, buf: Buffer.from(await res.arrayBuffer()) }
  }
  throw new Error(`Nessuna miniatura trovata per il video ${id}`)
}

const { misura, buf } = await scarica(id)
const meta = await sharp(buf).metadata()

if (meta.width >= meta.height) {
  console.warn(
    `⚠ ${misura}.jpg è ${meta.width}×${meta.height}, non verticale: la cornice 9:16 lo taglierà.`,
  )
}

const dest = path.join('public', 'images', 'products', slug, 'video.webp')
fs.mkdirSync(path.dirname(dest), { recursive: true })

const targetW = Math.min(Number(maxWidth), meta.width)
await sharp(buf)
  .resize({ width: targetW, withoutEnlargement: true })
  .webp({ quality: Number(quality) })
  .toFile(dest)

const kb = (fs.statSync(dest).size / 1024).toFixed(0)
console.log(`✓ ${dest}  ${misura}  ${targetW}px  ${kb} KB`)
