/*
 * Controlla che i dati di `src/data/siteData.js` corrispondano ai file che
 * stanno davvero su disco. Gira da solo prima di ogni `npm run build` (script
 * `prebuild` in package.json), e si può lanciare a mano:
 *
 *   node scripts/verifica.js
 *
 * Perché esiste. Le immagini non si importano, si nominano: `photos: 8` è una
 * promessa che da qualche parte esistono `01.webp…08.webp`, e nessuno la
 * verifica. Se le foto sono sei, la build passa lo stesso, il pre-rendering
 * scrive tranquillamente due `<img>` verso file inesistenti, e il difetto si
 * scopre guardando il sito pubblicato. Lo stesso vale per una copertina che
 * manca, per un'anteprima social non rigenerata dopo aver aggiunto un
 * progetto, per un indice in `ai` che punta a una foto che non c'è — cioè per
 * un'etichetta AI Act appiccicata alla foto sbagliata — e per una chiave di
 * `contenutiEn.js` scritta con un refuso, che non traduce niente e non lo dice.
 *
 * Sono tutti errori muti: non rompono nulla, escono in produzione. Qui
 * diventano una build che si ferma, con scritto quale file cercare.
 *
 * ERRORE = la build si ferma. AVVISO = si segnala e si prosegue, perché è una
 * scelta legittima (un progetto senza traduzione inglese resta in italiano, e
 * `CLAUDE.md` dice che va bene).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pub = (p) => path.join(root, 'public', p)

const {
  archive,
  aree,
  areaDi,
  about,
  focusItems,
  homeHero,
  familyBand,
  manifestoFoto,
  projectImages,
} = await import(path.join(root, 'src/data/siteData.js'))
const { progettiEn, aboutEn } = await import(path.join(root, 'src/data/contenutiEn.js'))
const { varianti, SUFFISSO_VARIANTE } = await import(path.join(root, 'src/data/varianti.js'))

const errori = []
const avvisi = []
const err = (m) => errori.push(m)
const avv = (m) => avvisi.push(m)

/* `src` è sempre un percorso assoluto del sito, come lo scrive `siteData`. */
const manca = (src) => !fs.existsSync(pub(src))
const chiediFile = (src, dove) => manca(src) && err(`${dove}: manca ${src}`)

/* ───────────────────────────── progetti ───────────────────────────── */

const chiaviArea = new Set(aree.map((a) => a.chiave))
const slugVisti = new Set()

for (const p of archive) {
  const dove = `progetto "${p.slug}"`

  if (slugVisti.has(p.slug)) err(`${dove}: slug ripetuto — gli URL si sovrascriverebbero`)
  slugVisti.add(p.slug)

  if (!chiaviArea.has(areaDi(p))) {
    err(`${dove}: area "${areaDi(p)}" non esiste (attese: ${[...chiaviArea].join(', ')})`)
  }

  const { cover, gallery, drawing, sfondo, videoPoster, filmatoPoster } = projectImages(p)

  if (cover) chiediFile(cover, dove)
  gallery.forEach((src) => chiediFile(src, dove))
  if (drawing) chiediFile(drawing, dove)
  if (sfondo) chiediFile(sfondo, dove)
  if (videoPoster) chiediFile(videoPoster, dove)
  if (filmatoPoster) chiediFile(filmatoPoster, dove)

  /*
   * Il controllo all'incontrario: una foto in più nella cartella non rompe
   * niente ma non si vede da nessuna parte, ed è quasi sempre un `photos`
   * dimenticato indietro dopo aver aggiunto uno scatto.
   */
  const dir = pub(`/images/products/${p.slug}`)
  if (fs.existsSync(dir)) {
    const suDisco = fs.readdirSync(dir).filter((f) => /^\d\d\.webp$/.test(f)).length
    const dichiarate = p.photos || 0
    if (suDisco > dichiarate) {
      err(
        `${dove}: la cartella ha ${suDisco} foto di galleria ma \`photos\` dice ${dichiarate} — le ultime ${suDisco - dichiarate} non compaiono nel sito`,
      )
    }
  }

  // Un'etichetta AI Act che punta a una foto inesistente è peggio di una che
  // manca: dichiara come sintetica una foto che nel sito è un'altra.
  for (const [campo, elenco] of [
    ['generate', p.ai?.generate],
    ['modificate', p.ai?.modificate],
  ]) {
    if (!Array.isArray(elenco)) continue
    for (const n of elenco) {
      if (!Number.isInteger(n) || n < 1 || n > (p.photos || 0)) {
        err(`${dove}: ai.${campo} contiene ${n}, fuori dalle ${p.photos || 0} foto di galleria`)
      }
    }
  }
  if (p.ai?.sfondo && !p.sfondo) {
    err(`${dove}: ai.sfondo è dichiarato ma il progetto non ha \`sfondo: true\``)
  }

  if (!progettiEn[p.slug]) avv(`${dove}: nessuna traduzione in contenutiEn.js — resta in italiano`)
}

// Una chiave di troppo in contenutiEn non traduce niente e non protesta: è
// sempre un refuso nello slug.
for (const slug of Object.keys(progettiEn)) {
  if (!slugVisti.has(slug)) {
    err(`contenutiEn.js: la chiave "${slug}" non corrisponde a nessun progetto dell'archivio`)
  }
}

/* ─────────────────────── home, chi sono, anteprime ─────────────────────── */

focusItems.forEach((f) => chiediFile(f.cover, `home, lavoro selezionato "${f.slug}"`))
chiediFile(homeHero.src, 'home')
chiediFile(manifestoFoto.src, 'home')
// Non è più in pagina, ma è la sorgente delle anteprime social dell'archivio.
chiediFile(familyBand.src, 'anteprime social dell’archivio')
// Card di "Chi sono" senza traduzione (avviso) o traduzioni senza card (errore).
{
  const chiaviEn = new Set(aboutEn.competenze.map((c) => c.chiave))
  for (const c of about.competenze) {
    if (!chiaviEn.has(c.chiave)) {
      avv(`chi sono: la card "${c.chiave}" non ha traduzione in contenutiEn.js — resta in italiano`)
    }
    chiaviEn.delete(c.chiave)
    if (c.foto) chiediFile(c.foto.src, `chi sono, card "${c.chiave}"`)
  }
  for (const chiave of chiaviEn) {
    err(`contenutiEn.js: la card "${chiave}" non corrisponde a nessuna competenza di siteData.js`)
  }
}

chiediFile(about.photos.hero.src, 'chi sono')
chiediFile(about.photos.schizzi.src, 'chi sono')
for (const tavola of about.sketchbook) {
  for (const faccia of [tavola.front, tavola.back]) {
    if (!faccia) continue
    chiediFile(faccia.src, 'sketchbook')
    // La misura ridotta la usa il telefono: senza, la tavola non si vede là.
    chiediFile(faccia.src.replace(/\.webp$/, '-mezza.webp'), 'sketchbook (mezza misura)')
  }
}

/*
 * Anteprime social. È il file che si dimentica più spesso, perché `og-image.js`
 * si lancia a mano e un progetto nuovo non se ne accorge: la scheda esce con un
 * link condiviso senza immagine.
 */
const attesiOg = [
  'home',
  'chi-sono',
  'archivio',
  ...aree.map((a) => `archivio-${a.slug}`),
  ...archive.map((p) => p.slug),
]
for (const nome of attesiOg) {
  for (const [lingua, prefisso] of [
    ['it', ''],
    ['en', 'en/'],
  ]) {
    const src = `/images/og/${prefisso}${nome}.jpg`
    if (manca(src)) err(`anteprima social (${lingua}): manca ${src} — rilancia scripts/og-image.js`)
  }
}

/* ────────────────────────── varianti da 800px ────────────────────────── */

for (const [src, larghezza] of Object.entries(varianti)) {
  const variante = src.replace(/\.webp$/, `${SUFFISSO_VARIANTE}.webp`)
  if (manca(src)) err(`varianti.js: elenca ${src}, che non esiste`)
  if (manca(variante)) {
    err(`varianti.js: manca ${variante} — rilancia scripts/varianti-foto.js`)
  }
  if (!Number.isInteger(larghezza) || larghezza <= 800) {
    err(`varianti.js: ${src} dichiara larghezza ${larghezza}, che non è un originale più grande di 800`)
  }
}

/* ──────────────────────────────── esito ──────────────────────────────── */

for (const a of avvisi) console.log(`  ~ ${a}`)
for (const e of errori) console.error(`  ✗ ${e}`)

if (errori.length) {
  console.error(
    `\nVerifica fallita: ${errori.length} error${errori.length === 1 ? 'e' : 'i'} nei dati. La build si ferma qui.`,
  )
  process.exit(1)
}

console.log(
  `  ✓ dati verificati — ${archive.length} progetti, ${Object.keys(varianti).length} immagini con variante${
    avvisi.length ? `, ${avvisi.length} avvis${avvisi.length === 1 ? 'o' : 'i'}` : ''
  }`,
)
