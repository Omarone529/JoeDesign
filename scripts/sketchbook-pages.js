/*
 * Tavole dello sketchbook per il widget 3D in "Chi sono", da "ARCHIVE JOE
 * SARCHIOLLA.pdf". A differenza di pdf-disegno.js si tiene la pagina intera,
 * come sfogliando il libro vero.
 *
 *   npm i --no-save pdf-to-img     (fuori da package.json: serve solo qui)
 *   node scripts/sketchbook-pages.js
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { pdf } from 'pdf-to-img'

// Override, poi le due posizioni note (Mac e Windows).
const candidati = [
  process.env.SKETCHBOOK_PDF,
  '/Users/omar/Desktop/ARCHIVE JOE SARCHIOLLA.pdf',
  'C:/Generale/Lavori/Joe design/ARCHIVE JOE SARCHIOLLA.pdf',
].filter(Boolean)
const PDF_PATH = candidati.find((p) => fs.existsSync(p))
if (!PDF_PATH) {
  console.error('✗ PDF non trovato. Imposta SKETCHBOOK_PDF con il percorso corretto.')
  process.exit(1)
}

// Le pagine hanno testo piccolo: serve nitidezza. Si rende molto più grande del
// necessario e si rimpicciolisce con sharp (lanczos): il downsampling di un
// render abbondante tiene i bordi delle lettere più definiti di un render già
// vicino alla misura finale.
const SCALA = 4
// 1000 px è la misura giusta, non un compromesso: nel widget 3D una pagina
// occupa al massimo ~1000 pixel reali (widget largo 1120 CSS, pixel ratio 2),
// quindi la texture non viene mai ingrandita e tutto ciò che sta sopra a questa
// larghezza sarebbe peso scaricato per niente.
const LARGHEZZA = 1000
// Ogni rimpicciolimento ammorbidisce: una maschera di contrasto leggera
// restituisce il filo alle lettere senza gli aloni dello sharpen aggressivo.
const NITIDEZZA = { sigma: 0.6, m1: 0.4, m2: 0.9 }
const QUALITA = 88

const OUT_DIR = 'public/images/about/sketchbook'

/* Numerazione di rendering (1 = prima pagina del PDF, non il folio stampato). */
const TAVOLE = [
  { pagina: 1, nome: '01' }, // Copertina "Personal Archive 2024-2026"
  { pagina: 3, nome: '02' }, // Frontespizio "Vol.1 Archivio"
  { pagina: 6, nome: '03' }, // Indice progetti 2024
  { pagina: 7, nome: '04' }, // Griglia prodotti in miniatura
  { pagina: 15, nome: '05' }, // "Dal 2024 ad oggi", Joe con i suoi oggetti
  { pagina: 30, nome: '06' }, // Percorso artistico / progetto Bullone
  { pagina: 45, nome: '07' }, // Foto scenografica progetto Flue
  { pagina: 60, nome: '08' }, // Scheda progetto Mari Chair CAD
  { pagina: 75, nome: '09' }, // Contest "In-sicurezza", sedia in cartone
]

fs.mkdirSync(OUT_DIR, { recursive: true })

const daPagina = new Map(TAVOLE.map((t) => [t.pagina, t]))
const ultima = Math.max(...TAVOLE.map((t) => t.pagina))

// Le pagine arrivano in sequenza: si scorre una volta sola fino all'ultima utile.
let n = 0
for await (const pagina of await pdf(PDF_PATH, { scale: SCALA })) {
  n += 1
  const tavola = daPagina.get(n)
  if (tavola) {
    const dest = path.join(OUT_DIR, `${tavola.nome}.webp`)
    await sharp(pagina).resize({ width: LARGHEZZA }).sharpen(NITIDEZZA).webp({ quality: QUALITA }).toFile(dest)
    const { width, height } = await sharp(dest).metadata()
    console.log(`✓ ${tavola.nome}.webp (pagina ${n}, ${width}×${height})`)
  }
  if (n >= ultima) break
}
