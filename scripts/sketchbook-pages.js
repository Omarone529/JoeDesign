/*
 * Tavole dello sketchbook dal PDF d'archivio, a pagina intera.
 *   npm i --no-save pdf-to-img && node scripts/sketchbook-pages.js
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { pdf } from 'pdf-to-img'

const candidates = [
  process.env.SKETCHBOOK_PDF,
  '/Users/omar/Desktop/ARCHIVE JOE SARCHIOLLA.pdf',
  'C:/Generale/Lavori/Joe design/ARCHIVE JOE SARCHIOLLA.pdf',
].filter(Boolean)
const PDF_PATH = candidates.find((p) => fs.existsSync(p))
if (!PDF_PATH) {
  console.error('✗ PDF non trovato. Imposta SKETCHBOOK_PDF con il percorso corretto.')
  process.exit(1)
}

// Render abbondante e riduzione con lanczos: il testo piccolo resta nitido.
const SCALE = 4
const WIDTH = 1000
const HALF_WIDTH = 500
// Leggera: uno sharpen forte lascia aloni attorno alle lettere.
const SHARPNESS = { sigma: 0.6, m1: 0.4, m2: 0.9 }
const QUALITY = 88

const OUT_DIR = 'public/images/about/sketchbook'

// `page` conta dalla prima pagina del PDF, non dal numero stampato.
const PLATES = [
  { page: 1, name: '01' }, // Copertina "Personal Archive 2024-2026"
  { page: 3, name: '02' }, // Frontespizio "Vol.1 Archivio"
  { page: 6, name: '03' }, // Indice progetti 2024
  { page: 7, name: '04' }, // Griglia prodotti in miniatura
  { page: 15, name: '05' }, // "Dal 2024 ad oggi", Joe con i suoi oggetti
  { page: 30, name: '06' }, // Percorso artistico / progetto Bullone
  { page: 45, name: '07' }, // Foto scenografica progetto Flue
  { page: 60, name: '08' }, // Scheda progetto Mari Chair CAD
  { page: 75, name: '09' }, // Contest "In-sicurezza", sedia in cartone
]

fs.mkdirSync(OUT_DIR, { recursive: true })

const fromPage = new Map(PLATES.map((t) => [t.page, t]))
const last = Math.max(...PLATES.map((t) => t.page))

let n = 0
for await (const page of await pdf(PDF_PATH, { scale: SCALE })) {
  n += 1
  const plate = fromPage.get(n)
  if (plate) {
    const dest = path.join(OUT_DIR, `${plate.name}.webp`)
    await sharp(page).resize({ width: WIDTH }).sharpen(SHARPNESS).webp({ quality: QUALITY }).toFile(dest)
    const { width, height } = await sharp(dest).metadata()

    // Dalla grande, non dal PDF: due passaggi di lanczos tengono le lettere più nitide.
    const half = path.join(OUT_DIR, `${plate.name}-half.webp`)
    await sharp(dest)
      .resize({ width: HALF_WIDTH, kernel: 'lanczos3' })
      .sharpen(SHARPNESS)
      .webp({ quality: QUALITY - 2 })
      .toFile(half)

    console.log(`✓ ${plate.name}.webp (pagina ${n}, ${width}×${height}) + mezza`)
  }
  if (n >= last) break
}
