/*
 * Porta public/images/ a 1600px e ricomprime (grafiche piatte e trasparenze più alte). Prima di photo-fit.js.
 *   node scripts/compress-photos.js [--dry-run]
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { photoFit } from '../src/data/photoFit.js'

const ROOT = path.join('public', 'images')
const MAX_WIDTH = 1600
const QUALITY = 76
const DELICATE_QUALITY = 86 // grafiche piatte e immagini con trasparenza

// Sotto, il guadagno non vale la perdita di ogni ricompressione.
const BYTE_THRESHOLD = 120 * 1024

// È anche ciò che lo rende ripetibile: vedi la nota in testa.
const MIN_GAIN = 0.1

const dryRun = process.argv.includes('--dry-run')

const flatImages = new Set(
  Object.entries(photoFit)
    .filter(([, v]) => v.fit === 'contain')
    .map(([k]) => k.replace('/images/', '').split('/').join(path.sep))
)

function listFiles(dir) {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) out.push(...listFiles(p))
    // Le varianti -800 sono derivate da queste: le rigenera photo-variants.js.
    else if (name.endsWith('.webp') && !name.endsWith('-800.webp')) out.push(p)
  }
  return out
}

const kb = (b) => `${Math.round(b / 1024)} kB`

let beforeTotal = 0
let afterTotal = 0
let touched = 0

for (const file of listFiles(ROOT)) {
  const before = fs.statSync(file).size
  beforeTotal += before
  afterTotal += before

  if (before <= BYTE_THRESHOLD) continue

  const rel = path.relative(ROOT, file)
  // Sul buffer e non sul percorso: su Windows sharp terrebbe il file aperto in
  // lettura e la riscrittura sullo stesso percorso fallirebbe.
  const source = fs.readFileSync(file)
  const meta = await sharp(source).metadata()
  const delicate = flatImages.has(rel) || meta.hasAlpha
  const quality = delicate ? DELICATE_QUALITY : QUALITY

  const buf = await sharp(source)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: quality })
    .toBuffer()

  if (buf.length > before * (1 - MIN_GAIN)) continue

  if (!dryRun) fs.writeFileSync(file, buf)
  afterTotal += buf.length - before
  touched += 1

  const width = Math.min(MAX_WIDTH, meta.width)
  const note = delicate ? ' · delicata' : ''
  console.log(
    `  ${rel.split(path.sep).join('/')}\n    ${meta.width}px ${kb(before)}  →  ${width}px ${kb(buf.length)}   q${quality}${note}`
  )
}

const savings = beforeTotal - afterTotal
console.log(
  `\n${dryRun ? '[prova] ' : ''}${touched} immagini ricompresse` +
    `\ntotale ${(beforeTotal / 1048576).toFixed(1)} MB  →  ${(afterTotal / 1048576).toFixed(1)} MB` +
    `   (-${((savings * 100) / beforeTotal).toFixed(0)}%, ${kb(savings)} risparmiati)`
)
if (dryRun) console.log('\nNiente è stato scritto. Rilancia senza --dry-run per applicare.')
else if (touched) console.log('\nOra rilancia:  node scripts/photo-fit.js')
