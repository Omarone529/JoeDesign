/*
 * Tavole dello "sketchbook" personale di Joe per il widget 3D in "Chi sono",
 * estratte da "ARCHIVE JOE SARCHIOLLA.pdf" (lo stesso archivio che
 * pdf-disegno.js usa per i disegni tecnici).
 *
 * A differenza di pdf-disegno.js qui non serve ritagliare nulla: si vuole
 * la pagina intera, come si vedrebbe sfogliando il libro vero. Si rasterizza
 * ogni pagina scelta e si converte in WebP via sharp.
 *
 * Va lanciato a mano, come gli altri script sul PDF:
 *
 *   npm i --no-save pdf-to-img
 *   node scripts/sketchbook-pages.js
 *
 * `pdf-to-img` non è in package.json - serve solo qui, come in pdf-disegno.js.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { pdf } from 'pdf-to-img'

// Percorso dell'archivio: sul Mac sta sul Desktop, su Windows nella cartella
// di rete (stesso file di pdf-disegno.js). Si prova prima un eventuale
// override, poi le due posizioni note.
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

// Risoluzione di rendering: pagine intere con foto e testo piccolo (le
// specifiche in stile macchina da scrivere), serve nitidezza.
const SCALA = 2.2
const LARGHEZZA = 1000

const OUT_DIR = 'public/images/about/sketchbook'

/*
 * Pagine scelte (numerazione di rendering: 1 = prima pagina del PDF, non il
 * numero di folio stampato) e nome del file d'uscita. L'ordine qui è
 * l'ordine di lettura dello sketchbook nel sito.
 */
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
    await sharp(pagina).resize({ width: LARGHEZZA }).webp({ quality: 82 }).toFile(dest)
    const { width, height } = await sharp(dest).metadata()
    console.log(`✓ ${tavola.nome}.webp (pagina ${n}, ${width}×${height})`)
  }
  if (n >= ultima) break
}
