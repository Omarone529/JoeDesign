/*
 * Genera la variante da 800 px di ogni foto di `public/images/` e scrive
 * `src/data/varianti.js`, l'elenco che dice al sito quali immagini hanno una
 * seconda misura e quanto è larga l'originale.
 *
 *   node scripts/varianti-foto.js            # applica
 *   node scripts/varianti-foto.js --prova    # mostra e basta
 *
 * Perché: `comprimi-foto.js` porta l'archivio a 1600 px, che è la misura giusta
 * per un desktop retina. Un telefono però mostra quelle stesse foto dentro una
 * colonna da ~400 px CSS, e scaricando il file da 1600 ne butta via i tre
 * quarti. Con la variante da 800 px in `srcset` il browser sceglie da sé: chi
 * ha lo schermo grande continua a ricevere l'originale, chi legge dal telefono
 * scarica un terzo dei byte.
 *
 * Le varianti si riconoscono dal suffisso `-800` e sono escluse da
 * `comprimi-foto.js` e `fit-foto.js`: sono un prodotto derivato, non foto
 * d'archivio. Rilanciarlo è sicuro — una variante già aggiornata si salta, e
 * quelle rimaste orfane si cancellano.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fotoFit } from '../src/data/fotoFit.js'

const RADICE = path.join('public', 'images')
const USCITA = path.join('src', 'data', 'varianti.js')

export const SUFFISSO = '-800'
const LARGHEZZA = 800

// Sotto questa larghezza l'originale è già piccolo: una seconda copia
// aggiungerebbe un file al deploy senza togliere byte a nessuno.
const LARGHEZZA_MINIMA = 900

// Le stesse qualità di comprimi-foto.js: grafiche piatte e trasparenze si
// sgranano prima delle fotografie.
const QUALITA = 76
const QUALITA_DELICATE = 86

// Se la variante non è almeno questo più leggera, non vale il file in più.
const GUADAGNO_MINIMO = 0.2

// Le og: le apre solo il crawler di un social, che pesca l'immagine dichiarata
// nel meta tag e non guarda nessun srcset.
const ESCLUSE = new Set(['og'])

const prova = process.argv.includes('--prova')

const piatte = new Set(
  Object.entries(fotoFit)
    .filter(([, v]) => v.fit === 'contain')
    .map(([k]) => k.replace('/images/', '').split('/').join(path.sep))
)

export const eVariante = (nome) => nome.endsWith(`${SUFFISSO}.webp`)

function elenca(dir) {
  const out = []
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome)
    if (fs.statSync(p).isDirectory()) {
      if (!ESCLUSE.has(nome)) out.push(...elenca(p))
    } else if (nome.endsWith('.webp') && !eVariante(nome)) {
      out.push(p)
    }
  }
  return out
}

const kb = (b) => `${Math.round(b / 1024)} kB`
const url = (file) => `/images/${path.relative(RADICE, file).split(path.sep).join('/')}`

const originali = elenca(RADICE)
const manifesto = {}
let generate = 0
let saltate = 0
let primaTot = 0
let dopoTot = 0

for (const file of originali) {
  const meta = await sharp(fs.readFileSync(file)).metadata()
  if (meta.width < LARGHEZZA_MINIMA) continue

  const variante = file.replace(/\.webp$/, `${SUFFISSO}.webp`)
  const rel = path.relative(RADICE, file)

  // Già aggiornata: si tiene, si conta nel manifesto e si passa oltre.
  if (fs.existsSync(variante) && fs.statSync(variante).mtimeMs >= fs.statSync(file).mtimeMs) {
    manifesto[url(file)] = meta.width
    saltate += 1
    continue
  }

  const delicata = piatte.has(rel) || meta.hasAlpha
  const buf = await sharp(fs.readFileSync(file))
    .resize({ width: LARGHEZZA, withoutEnlargement: true })
    .webp({ quality: delicata ? QUALITA_DELICATE : QUALITA })
    .toBuffer()

  const prima = fs.statSync(file).size
  if (buf.length > prima * (1 - GUADAGNO_MINIMO)) continue

  if (!prova) fs.writeFileSync(variante, buf)
  manifesto[url(file)] = meta.width
  generate += 1
  primaTot += prima
  dopoTot += buf.length

  console.log(
    `  ${rel.split(path.sep).join('/')}\n` +
      `    ${meta.width}px ${kb(prima)}  →  ${LARGHEZZA}px ${kb(buf.length)}`
  )
}

// Varianti il cui originale è stato rinominato o tolto: senza questa pulizia
// resterebbero nel deploy per sempre, invisibili e mai servite.
const orfane = []
function cercaOrfane(dir) {
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome)
    if (fs.statSync(p).isDirectory()) cercaOrfane(p)
    else if (eVariante(nome) && !fs.existsSync(p.replace(`${SUFFISSO}.webp`, '.webp'))) orfane.push(p)
  }
}
cercaOrfane(RADICE)
for (const p of orfane) {
  if (!prova) fs.unlinkSync(p)
  console.log(`  orfana rimossa: ${path.relative(RADICE, p).split(path.sep).join('/')}`)
}

const ordinato = Object.fromEntries(Object.entries(manifesto).sort(([a], [b]) => a.localeCompare(b)))

const intestazione = `/*
 * Generato da \`node scripts/varianti-foto.js\` — non si modifica a mano.
 *
 * Le foto che hanno accanto una variante da 800 px, con la larghezza del loro
 * originale. Serve a \`srcSetDi()\` in \`src/immagini.js\` per scrivere un srcset
 * con i descrittori giusti: senza la larghezza vera il browser non può
 * scegliere, e con una sbagliata sceglie male.
 */
export const LARGHEZZA_VARIANTE = ${LARGHEZZA}
export const SUFFISSO_VARIANTE = '${SUFFISSO}'

export const varianti = ${JSON.stringify(ordinato, null, 2)}
`

if (!prova) fs.writeFileSync(USCITA, intestazione)

console.log(
  `\n${prova ? '[prova] ' : ''}${generate} varianti generate, ${saltate} già aggiornate` +
    (orfane.length ? `, ${orfane.length} orfane rimosse` : '') +
    `\n${Object.keys(ordinato).length} foto nel manifesto` +
    (generate ? `\nle nuove: ${kb(primaTot)}  →  ${kb(dopoTot)}   (-${(((primaTot - dopoTot) * 100) / primaTot).toFixed(0)}%)` : '')
)
if (prova) console.log('\nNiente è stato scritto. Rilancia senza --prova per applicare.')
