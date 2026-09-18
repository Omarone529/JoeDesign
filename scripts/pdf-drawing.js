/*
 * Disegni tecnici vettoriali dal PDF d'archivio: rende la pagina, ritaglia, passa a ink-alpha.js.
 *   npm i --no-save pdf-to-img && node scripts/pdf-drawing.js [slug…]
 */
import sharp from 'sharp'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pdf } from 'pdf-to-img'

const PDF = 'C:/Generale/Lavori/Joe design/ARCHIVE JOE SARCHIOLLA.pdf'

// Il tratto è sottile: sotto questa scala si impasta una volta ridotto.
const SCALE = 3

// Oltre questa misura il file cresce senza che si veda.
const WIDTH = 900

// Riquadro del disegno in frazioni di pagina, prima del filetto e della freccia.
const FRAME = { left: 0.06, right: 0.425, top: 0.19, bottom: 0.448 }

/* Pagina della scheda per ogni progetto (numerazione del PDF, non del libro). */
const PAGES = {
  'dog-lamp': 18,
  anelli: 22,
  pistone: 24,
  food: 26,
  nymphe: 28,
  'zeta-3': 32,
  bullone: 34,
  trave: 36,
  'zero-sfrido': 40,
  'stanza-nella-stanza': 42,
  'directional-arrow': 46,
  'dado-lamp': 50,
  'sedia-tempo-determinato': 54,
  orbit: 56,
  'fuori-asse': 58,
  'mari-chair': 60,
  flue: 64,
  // I manifesti non hanno scheda tecnica nell'archivio.
}

const requested = process.argv.slice(2)
const slugs = requested.length ? requested : Object.keys(PAGES)

for (const slug of slugs) {
  if (!PAGES[slug]) {
    console.error(`✗ ${slug}: nessuna pagina nota nell'archivio`)
    process.exitCode = 1
  }
}

const todo = slugs.filter((s) => PAGES[s])
const last = Math.max(...todo.map((s) => PAGES[s]))
const perPage = new Map(todo.map((s) => [PAGES[s], s]))

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drawings-'))

// Le pagine arrivano in sequenza: si scorre una volta sola fino all'ultima utile.
let n = 0
for await (const page of await pdf(PDF, { scale: SCALE })) {
  n += 1
  const slug = perPage.get(n)
  if (slug) await extract(page, slug)
  if (n >= last) break
}

fs.rmSync(tmp, { recursive: true, force: true })

async function extract(page, slug) {
  const img = sharp(page)
  const { width, height } = await img.metadata()
  const crop = path.join(tmp, `${slug}.png`)

  await img
    .extract({
      left: Math.round(width * FRAME.left),
      top: Math.round(height * FRAME.top),
      width: Math.round(width * (FRAME.right - FRAME.left)),
      height: Math.round(height * (FRAME.bottom - FRAME.top)),
    })
    .png()
    .toFile(crop)

  const dest = `public/images/products/${slug}/drawing.webp`
  const outcome = spawnSync(
    process.execPath,
    ['scripts/ink-alpha.js', crop, dest, String(WIDTH)],
    { stdio: 'inherit' },
  )
  if (outcome.status !== 0) process.exitCode = 1
}
