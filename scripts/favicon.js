/*
 * Genera l'icona del sito in tutti i formati che servono ai browser, a
 * partire dal marchio usato nella navbar (public/images/navbar/logo.webp).
 *
 *   node scripts/favicon.js
 *
 * Produce in public/:
 *   favicon.svg           browser moderni (il marchio incapsulato in un SVG)
 *   favicon.ico           32×32, richiesto in automatico dalla radice del sito
 *   apple-touch-icon.png  180×180, iPhone/iPad "aggiungi a schermata Home"
 *   icon-192.png          Android / manifest
 *   icon-512.png          Android / manifest, splash screen
 *   site.webmanifest      nome e colori dell'app installata
 *
 * Il marchio non esiste in vettoriale: `favicon.svg` incapsula lo stesso
 * raster (nitido alle dimensioni ridotte a cui viene mostrato). Per la
 * scheda del browser resta trasparente, come nella navbar; per le icone da
 * schermata Home (Apple/Android, che non gestiscono bene la trasparenza)
 * viene appoggiato sul fondo `paper` del sito.
 *
 * Va rilanciato solo se cambia il marchio: i file finiti stanno nel repo.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { profile } from '../src/data/siteData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '..', 'public')
const logoPath = path.join(publicDir, 'images', 'navbar', 'logo.webp')

const PAPER = '#f4f3f1'

const iconTrasparente = (lato) => sharp(logoPath).resize(lato, lato).png({ compressionLevel: 9 })

const iconOpaca = (lato) =>
  sharp(logoPath)
    .resize(lato, lato)
    .flatten({ background: PAPER })
    .png({ compressionLevel: 9 })

/*
 * Contenitore ICO. Dal 2007 un .ico può contenere direttamente un PNG, quindi
 * bastano due intestazioni davanti ai byte dell'immagine: 6 byte di testata
 * (tipo "icona", una sola dimensione) e 16 che descrivono quell'unica voce.
 */
function ico(pngBuffer, lato) {
  const testata = Buffer.alloc(6)
  testata.writeUInt16LE(0, 0) // riservato
  testata.writeUInt16LE(1, 2) // 1 = icona
  testata.writeUInt16LE(1, 4) // una sola immagine

  const voce = Buffer.alloc(16)
  voce.writeUInt8(lato, 0) // larghezza
  voce.writeUInt8(lato, 1) // altezza
  voce.writeUInt8(0, 2) // nessuna tavolozza
  voce.writeUInt8(0, 3) // riservato
  voce.writeUInt16LE(1, 4) // piani di colore
  voce.writeUInt16LE(32, 6) // bit per pixel
  voce.writeUInt32LE(pngBuffer.length, 8)
  voce.writeUInt32LE(22, 12) // i dati iniziano dopo testata + voce

  return Buffer.concat([testata, voce, pngBuffer])
}

/* SVG: incapsula il raster del marchio (trasparente, come in navbar). */
const logoBase64 = fs.readFileSync(logoPath).toString('base64')
fs.writeFileSync(
  path.join(publicDir, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144"><image width="144" height="144" href="data:image/webp;base64,${logoBase64}"/></svg>\n`,
  'utf8',
)

await (await iconOpaca(180)).toFile(path.join(publicDir, 'apple-touch-icon.png'))
await (await iconOpaca(192)).toFile(path.join(publicDir, 'icon-192.png'))
await (await iconOpaca(512)).toFile(path.join(publicDir, 'icon-512.png'))

fs.writeFileSync(
  path.join(publicDir, 'favicon.ico'),
  ico(await (await iconTrasparente(32)).toBuffer(), 32),
)

/*
 * Manifest: come si chiama e di che colore è il sito quando viene aggiunto
 * alla schermata Home. `display: browser` perché è un sito da leggere, non
 * un'applicazione: nascondere la barra dell'indirizzo toglierebbe all'utente
 * il modo di condividere la pagina.
 */
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
