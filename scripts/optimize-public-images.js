/*
 * Riduce le immagini di public/images alla massima misura in cui vengono
 * effettivamente mostrate. Le foto di "ARCHIVIO WEBP" sono da stampa (fino a
 * 4600x6200 px, 6 MB l'una) e vanno rimpicciolite prima della pubblicazione.
 *
 * Idempotente: chi è già sotto il limite non viene riscritto, quindi si può
 * rilanciare senza perdita di qualità progressiva. Gli originali restano in
 * "ARCHIVIO WEBP".
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
 * Larghezza massima per destinazione d'uso: ingombro reale a schermo x2, per
 * gli schermi a densità doppia. Il primo criterio che corrisponde vince.
 *   copertine  griglie home/archivio, riquadro max ~440 px
 *   galleria   cornice del carosello, 560 px
 *   resto      fasce a tutta larghezza (home, chi sono)
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

  // Su Windows sharp tiene il file agganciato: va letto in memoria, altrimenti
  // la riscrittura in place fallisce con EBUSY.
  const originale = fs.readFileSync(file)
  const meta = await sharp(originale).metadata()
  const max = limiteDi(file)

  if (meta.width <= max) {
    dopoTot += pesoPrima
    continue
  }

  // alphaQuality 100 preserva il canale alpha del ritratto scontornato.
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
