/*
 * Disegni tecnici dei progetti, estratti da "ARCHIVE JOE SARCHIOLLA.pdf".
 *
 * Nell'archivio ogni progetto ha una pagina scheda con lo stesso impianto:
 * in alto a sinistra il disegno tecnico con le quote, a destra la tabella dati.
 * Il disegno è vettoriale, quindi non si trova fra le immagini incorporate
 * (quelle stanno in "ARCHIVIO WEBP"): va ripreso rendendo la pagina.
 *
 * Qui la pagina viene rasterizzata ad alta risoluzione, ritagliata sul riquadro
 * del disegno e passata a `ink-alpha.js`, che rende trasparente il fondo bianco
 * e porta il tratto sul nero del sito: così il disegno si appoggia alla carta
 * senza il suo rettangolo bianco.
 *
 * Va lanciato a mano, come og-image.js e favicon.js: i WebP prodotti stanno in
 * `public/` insieme alle altre immagini e non si rigenerano a ogni build.
 * `pdf-to-img` non è in package.json - serve solo qui - quindi:
 *
 *   npm i --no-save pdf-to-img
 *   node scripts/pdf-disegno.js [slug…]
 *
 * Senza argomenti rifà tutti i progetti elencati sotto.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pdf } from 'pdf-to-img'

const PDF = 'C:/Generale/Lavori/Joe design/ARCHIVE JOE SARCHIOLLA.pdf'

// Risoluzione di rendering: il disegno è un tratto sottile, sotto questa scala
// si impasta una volta ridotto alla larghezza finale.
const SCALA = 3

// Larghezza del WebP finale. I disegni sono segni semplici: oltre questa misura
// il file cresce senza che si veda.
const LARGHEZZA = 900

/*
 * Riquadro del disegno nella pagina, in frazioni di larghezza e altezza (lo
 * stesso su tutte le schede, che condividono l'impianto).
 * Il margine destro si ferma prima del filetto verticale che divide le colonne,
 * quello inferiore prima della freccia ↙ che chiude il blocco: sono segni della
 * pagina, non del disegno. Il ritaglio è largo, i bianchi intorno li toglie
 * `ink-alpha.js`.
 */
const RIQUADRO = { sinistra: 0.06, destra: 0.425, alto: 0.19, basso: 0.448 }

/* Pagina della scheda per ogni progetto (numerazione del PDF, non del libro). */
const PAGINE = {
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
  // "grafica" (progetti grafici) non ha scheda tecnica nell'archivio.
}

const richiesti = process.argv.slice(2)
const slugs = richiesti.length ? richiesti : Object.keys(PAGINE)

for (const slug of slugs) {
  if (!PAGINE[slug]) {
    console.error(`✗ ${slug}: nessuna pagina nota nell'archivio`)
    process.exitCode = 1
  }
}

const daFare = slugs.filter((s) => PAGINE[s])
const ultima = Math.max(...daFare.map((s) => PAGINE[s]))
const perPagina = new Map(daFare.map((s) => [PAGINE[s], s]))

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disegni-'))

// Le pagine arrivano in sequenza: si scorre una volta sola fino all'ultima utile.
let n = 0
for await (const pagina of await pdf(PDF, { scale: SCALA })) {
  n += 1
  const slug = perPagina.get(n)
  if (slug) await estrai(pagina, slug)
  if (n >= ultima) break
}

fs.rmSync(tmp, { recursive: true, force: true })

async function estrai(pagina, slug) {
  const img = sharp(pagina)
  const { width, height } = await img.metadata()
  const ritaglio = path.join(tmp, `${slug}.png`)

  await img
    .extract({
      left: Math.round(width * RIQUADRO.sinistra),
      top: Math.round(height * RIQUADRO.alto),
      width: Math.round(width * (RIQUADRO.destra - RIQUADRO.sinistra)),
      height: Math.round(height * (RIQUADRO.basso - RIQUADRO.alto)),
    })
    .png()
    .toFile(ritaglio)

  const dest = `public/images/products/${slug}/disegno.webp`
  const esito = spawnSync(
    process.execPath,
    ['scripts/ink-alpha.js', ritaglio, dest, String(LARGHEZZA)],
    { stdio: 'inherit' },
  )
  if (esito.status !== 0) process.exitCode = 1
}
