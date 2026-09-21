/*
 * Icone del sito dal marchio della navbar, in public/. Solo se il marchio cambia: node scripts/favicon.js
 * Le icone per la schermata Home vanno su fondo `paper`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { profile } from '../src/data/siteData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '..', 'public')
const logoPath = path.join(publicDir, 'images', 'navbar', 'logo.webp')

const PAPER = '#f7f7f7'

const transparentIcon = (side) => sharp(logoPath).resize(side, side).png({ compressionLevel: 9 })

const opaqueIcon = (side) =>
  sharp(logoPath)
    .resize(side, side)
    .flatten({ background: PAPER })
    .png({ compressionLevel: 9 })

// .ico con un PNG dentro: 6 byte di testata e 16 per la voce.
function ico(pngBuffer, side) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // riservato
  header.writeUInt16LE(1, 2) // 1 = icona
  header.writeUInt16LE(1, 4) // una sola immagine

  const entry = Buffer.alloc(16)
  entry.writeUInt8(side, 0) // larghezza
  entry.writeUInt8(side, 1) // altezza
  entry.writeUInt8(0, 2) // nessuna tavolozza
  entry.writeUInt8(0, 3) // riservato
  entry.writeUInt16LE(1, 4) // piani di colore
  entry.writeUInt16LE(32, 6) // bit per pixel
  entry.writeUInt32LE(pngBuffer.length, 8)
  entry.writeUInt32LE(22, 12) // i dati iniziano dopo testata + voce

  return Buffer.concat([header, entry, pngBuffer])
}

const logoBase64 = fs.readFileSync(logoPath).toString('base64')
fs.writeFileSync(
  path.join(publicDir, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144"><image width="144" height="144" href="data:image/webp;base64,${logoBase64}"/></svg>\n`,
  'utf8',
)

await (await opaqueIcon(180)).toFile(path.join(publicDir, 'apple-touch-icon.png'))
await (await opaqueIcon(192)).toFile(path.join(publicDir, 'icon-192.png'))
await (await opaqueIcon(512)).toFile(path.join(publicDir, 'icon-512.png'))

fs.writeFileSync(
  path.join(publicDir, 'favicon.ico'),
  ico(await (await transparentIcon(32)).toBuffer(), 32),
)

// `display: browser`: è un sito da leggere, la barra serve a condividere.
fs.writeFileSync(
  path.join(publicDir, 'site.webmanifest'),
  JSON.stringify(
    {
      name: `${profile.name} “${profile.nick}” · ${profile.role}`,
      short_name: profile.nick,
      lang: 'it',
      start_url: '/',
      display: 'browser',
      background_color: PAPER,
      theme_color: PAPER,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2,
  ) + '\n',
  'utf8',
)

console.log('✓ favicon.svg · favicon.ico · apple-touch-icon.png · icon-192/512.png · site.webmanifest')
