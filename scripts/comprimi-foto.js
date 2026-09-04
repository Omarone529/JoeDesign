/*
 * Riduce le immagini di `public/images/` alla misura che il sito usa davvero e
 * le ricomprime. Da rilanciare dopo aver aggiunto foto, PRIMA di fit-foto.js.
 *
 *   node scripts/comprimi-foto.js            # applica
 *   node scripts/comprimi-foto.js --prova    # mostra e basta
 *
 * L'archivio arriva a 2000x2000, ma il carosello mostra al massimo ~800 px CSS
 * — 1600 su uno schermo retina, quindi i 2000 originali pesano il doppio del
 * necessario. Le grafiche piatte (`fit: 'contain'` in fit-foto.js) e quelle con
 * trasparenza restano più alte: hanno bordi netti, e la compressione lossy le
 * sgrana molto prima delle fotografie.
 *
 * Converge: su un file già compresso il margine di GUADAGNO_MINIMO non c'è più,
 * quindi rilanciarlo non rimastica l'archivio.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fotoFit } from '../src/data/fotoFit.js'

const RADICE = path.join('public', 'images')
const LARGHEZZA_MAX = 1600
const QUALITA = 76
const QUALITA_DELICATE = 86 // grafiche piatte e immagini con trasparenza

// Sotto, il guadagno non vale la perdita di ogni ricompressione.
const SOGLIA_BYTE = 120 * 1024

// È anche ciò che lo rende ripetibile: vedi la nota in testa.
const GUADAGNO_MINIMO = 0.1

const prova = process.argv.includes('--prova')

const piatte = new Set(
  Object.entries(fotoFit)
    .filter(([, v]) => v.fit === 'contain')
    .map(([k]) => k.replace('/images/', '').split('/').join(path.sep))
)

function elenca(dir) {
  const out = []
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome)
    if (fs.statSync(p).isDirectory()) out.push(...elenca(p))
    // Le varianti -800 sono derivate da queste: le rigenera varianti-foto.js.
    else if (nome.endsWith('.webp') && !nome.endsWith('-800.webp')) out.push(p)
  }
  return out
}

const kb = (b) => `${Math.round(b / 1024)} kB`

let primaTot = 0
let dopoTot = 0
let toccati = 0

for (const file of elenca(RADICE)) {
  const prima = fs.statSync(file).size
  primaTot += prima
  dopoTot += prima

  if (prima <= SOGLIA_BYTE) continue

  const rel = path.relative(RADICE, file)
  // Sul buffer e non sul percorso: su Windows sharp terrebbe il file aperto in
  // lettura e la riscrittura sullo stesso percorso fallirebbe.
  const sorgente = fs.readFileSync(file)
  const meta = await sharp(sorgente).metadata()
  const delicata = piatte.has(rel) || meta.hasAlpha
  const qualita = delicata ? QUALITA_DELICATE : QUALITA

  const buf = await sharp(sorgente)
    .resize({ width: LARGHEZZA_MAX, withoutEnlargement: true })
    .webp({ quality: qualita })
    .toBuffer()

  if (buf.length > prima * (1 - GUADAGNO_MINIMO)) continue

  if (!prova) fs.writeFileSync(file, buf)
  dopoTot += buf.length - prima
  toccati += 1

  const larghezza = Math.min(LARGHEZZA_MAX, meta.width)
  const nota = delicata ? ' · delicata' : ''
  console.log(
    `  ${rel.split(path.sep).join('/')}\n    ${meta.width}px ${kb(prima)}  →  ${larghezza}px ${kb(buf.length)}   q${qualita}${nota}`
  )
}

const risparmio = primaTot - dopoTot
console.log(
  `\n${prova ? '[prova] ' : ''}${toccati} immagini ricompresse` +
    `\ntotale ${(primaTot / 1048576).toFixed(1)} MB  →  ${(dopoTot / 1048576).toFixed(1)} MB` +
    `   (-${((risparmio * 100) / primaTot).toFixed(0)}%, ${kb(risparmio)} risparmiati)`
)
if (prova) console.log('\nNiente è stato scritto. Rilancia senza --prova per applicare.')
else if (toccati) console.log('\nOra rilancia:  node scripts/fit-foto.js')
