/*
 * Riduce le immagini di public/images alla misura in cui vengono mostrate: le
 * foto di ARCHIVIO WEBP sono da stampa, fino a 4600x6200 px. Idempotente, e
 * gli originali restano nell'archivio.
 *
 * Superato da `comprimi-foto.js`, che fa lo stesso distinguendo foto e
 * grafiche piatte. Resta perché taglia per destinazione d'uso.
 *
 * Uso:
 *   node scripts/optimize-public-images.js            elenca gli interventi
 *   node scripts/optimize-public-images.js --applica  riscrive i file
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RADICE = path.resolve(__dirname, '..', 'public', 'images')
const APPLICA = process.argv.includes('--applica')

/*
 * Ingombro reale a schermo x2, per gli schermi a densità doppia. Il primo
 * criterio che corrisponde vince.
 */
const LIMITI = [
  { prova: (p) => /products[\\/][^\\/]+[\\/]cover\.webp$/.test(p), max: 900 },
  { prova: (p) => /products[\\/]/.test(p), max: 1200 },
  { prova: () => true, max: 2000 },
]

const limiteDi = (p) => LIMITI.find((l) => l.prova(p)).max
const kb = (b) => Math.round(b / 1024)

function elenca(dir) {
  return fs.readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f)
    return fs.statSync(p).isDirectory() ? elenca(p) : [p]
  })
}

const files = elenca(RADICE).filter((f) => f.endsWith('.webp'))
let primaTot = 0
let dopoTot = 0
let toccati = 0

for (const file of files) {
  const relativo = path.relative(RADICE, file).replace(/\\/g, '/')
  const pesoPrima = fs.statSync(file).size
  primaTot += pesoPrima

  // Su Windows sharp tiene il file agganciato: senza leggerlo prima in memoria,
  // la riscrittura in place fallisce con EBUSY.
  const originale = fs.readFileSync(file)
  const meta = await sharp(originale).metadata()
  const max = limiteDi(file)

  if (meta.width <= max) {
    dopoTot += pesoPrima
    continue
  }

    const buffer = await sharp(originale)
    .resize({ width: max, withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 100 })
    .toBuffer()

  // Sorgenti molto compresse possono ingrassare al riencode.
  if (buffer.length >= pesoPrima) {
    dopoTot += pesoPrima
    continue
  }

  toccati++
  dopoTot += buffer.length
  console.log(
    `  ${APPLICA ? '✓' : '·'} ${relativo}` +
      `  ${meta.width}px → ${max}px` +
      `  ${kb(pesoPrima)} KB → ${kb(buffer.length)} KB`,
  )
  if (APPLICA) fs.writeFileSync(file, buffer)
}

const risparmio = primaTot - dopoTot
console.log(
  `\n${toccati} immagini su ${files.length} da ridimensionare.\n` +
    `Totale ${kb(primaTot)} KB → ${kb(dopoTot)} KB ` +
    `(${(risparmio / 1024 / 1024).toFixed(1)} MB in meno, -${Math.round((risparmio / primaTot) * 100)}%).`,
)
if (!APPLICA) console.log('\nAnteprima: rilancia con --applica per riscrivere i file.')
