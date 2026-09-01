/*
 * Pre-rendering statico. Per ogni rotta renderizza la pagina React, la inietta
 * nel template di dist/index.html con i suoi meta tag, e la salva al percorso
 * giusto (dist/progetto/flue/index.html). Poi le 404 e la sitemap.
 *
 * Il sito è bilingue: le stesse rotte esistono in italiano nella radice e in
 * inglese sotto /en, e ogni pagina dichiara sé stessa e la propria gemella
 * (hreflang) così Google le tratta come traduzioni e non come doppioni.
 *
 * Così Google e le anteprime dei link vedono il contenuto senza eseguire JS.
 * I meta e i dati strutturati vengono da `src/seo.js`: qui non si decide nulla.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')

const server = await import(
  pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href
)
const {
  render,
  allRoutes,
  metaForRoute,
  schemaForRoute,
  immaginiPerRotta,
  parsePath,
  SITE,
  profile,
} = server

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')

function headTags(meta, route) {
  const tags = [
    `<meta name="author" content="${esc(profile.name)}" />`,
    // La 404 è l'unica senza canonical: non ha un indirizzo proprio.
    ...(meta.noindex ? [`<meta name="robots" content="noindex,follow" />`] : []),
    ...(meta.canonical ? [`<link rel="canonical" href="${meta.canonical}" />`] : []),
    // Le due lingue della stessa pagina, più x-default per chi non ne dichiara
    // nessuna. Ogni pagina elenca anche sé stessa: è la forma che Google chiede.
    ...(meta.alternate || []).map(
      (a) => `<link rel="alternate" hreflang="${a.lang}" href="${a.href}" />`,
    ),
    // Immagine principale nota in anticipo: il preload la mette in coda leggendo
    // l'head, senza aspettare che il layout ne riveli la necessità.
    ...(meta.preload ? [`<link rel="preload" as="image" href="${meta.preload}" fetchpriority="high" />`] : []),
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="Giovanni “Joe” Sarchiolla" />`,
    `<meta property="og:locale" content="${meta.ogLocale}" />`,
    ...(meta.alternate || [])
      .filter((a) => a.lang !== 'x-default' && a.lang !== meta.lang)
      .map(() => `<meta property="og:locale:alternate" content="${meta.lang === 'it' ? 'en_US' : 'it_IT'}" />`),
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    ...(meta.canonical ? [`<meta property="og:url" content="${meta.canonical}" />`] : []),
    `<meta property="og:image" content="${meta.image}" />`,
    // Senza le dimensioni, alla prima condivisione la piattaforma deve scaricare
    // il file per impaginarlo, e spesso mostra l'anteprima vuota proprio allora.
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    ...(meta.imageAlt ? [`<meta property="og:image:alt" content="${esc(meta.imageAlt)}" />`] : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${meta.image}" />`,
    ...(meta.imageAlt ? [`<meta name="twitter:image:alt" content="${esc(meta.imageAlt)}" />`] : []),
  ]
  // Non sulla 404: descrivere un errore a un motore di ricerca non ha senso.
  if (!meta.noindex) {
    const schema = JSON.stringify(schemaForRoute(route, meta))
    // `</script>` dentro una stringa chiuderebbe il tag: va spezzato.
    tags.push(
      `<script type="application/ld+json">${schema.replace(/<\//g, '<\\/')}</script>`
    )
  }
  return tags.join('\n    ')
}

function buildPage(pathname) {
  const route = parsePath(pathname)
  const meta = metaForRoute(route)
  const { html } = render(pathname)

  return template
    // La lingua del documento: la leggono i motori di ricerca, i traduttori
    // automatici e le sintesi vocali, che con `it` su una pagina inglese
    // leggerebbero l'inglese con la pronuncia italiana.
    .replace(/<html lang="[^"]*"/, `<html lang="${meta.htmlLang}"`)
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${esc(meta.title)}</title>`,
    )
    .replace(
      /<meta\s+name="description"[\s\S]*?\/?>/,
      `<meta name="description" content="${esc(meta.description)}" />`,
    )
    .replace('</head>', `    ${headTags(meta, route)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
}

function outFile(pathname) {
  if (pathname === '/') return path.join(distDir, 'index.html')
  return path.join(distDir, pathname.replace(/^\//, ''), 'index.html')
}

const routes = allRoutes()

for (const pathname of routes) {
  const file = outFile(pathname)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, buildPage(pathname), 'utf8')
  console.log(`  ✓ ${pathname}  →  ${path.relative(root, file)}`)
}

/*
 * Fuori da `allRoutes()`, quindi fuori dalla sitemap. Il nome dev'essere questo
 * e stare nella radice: è il file che Netlify serve con status 404. Quella
 * inglese sta in /en/404.html e la serve la regola in netlify.toml: chi sbaglia
 * un indirizzo sotto /en non deve trovarsi davanti una pagina in italiano.
 */
fs.writeFileSync(path.join(distDir, '404.html'), buildPage('/404'), 'utf8')
console.log(`  ✓ 404  →  dist/404.html`)

fs.mkdirSync(path.join(distDir, 'en'), { recursive: true })
fs.writeFileSync(path.join(distDir, 'en', '404.html'), buildPage('/en/404'), 'utf8')
console.log(`  ✓ 404 (en)  →  dist/en/404.html`)

/*
 * Niente `changefreq` né `priority`, che Google ignora da anni. Niente
 * `lastmod`: qui varrebbe la data della build, che cambia a ogni deploy anche
 * a contenuti identici, e un "modificato oggi" su tutte le pagine fa scartare
 * il campo per l'intero sito. Quando l'archivio avrà date vere, allora sì.
 *
 * Dentro `<image:image>` va il solo `<image:loc>`: `image:title` e compagnia
 * sono deprecati dal 2022 e ignorati. La descrizione Google la prende dall'alt
 * nella pagina, ed è per questo che gli alt sono scritti bene in `siteData`.
 */
const IMG_NS = 'http://www.google.com/schemas/sitemap-image/1.1'
const XHTML_NS = 'http://www.w3.org/1999/xhtml'

/*
 * Ogni URL porta i propri `xhtml:link`: sono la stessa cosa degli hreflang
 * nell'head, ripetuti qui perché Google li vuole in entrambi i posti per
 * riconoscere due pagine come traduzioni l'una dell'altra.
 */
const voceSitemap = (r) => {
  const route = parsePath(r)
  const meta = metaForRoute(route)
  const loc = `${SITE}${r === '/' ? '/' : r}`
  const alternative = (meta.alternate || [])
    .map(
      (a) =>
        `\n    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${esc(a.href)}" />`,
    )
    .join('')
  const immagini = immaginiPerRotta(route)
    .map((src) => `\n    <image:image><image:loc>${esc(src)}</image:loc></image:image>`)
    .join('')
  const dentro = alternative + immagini
  return `  <url><loc>${loc}</loc>${dentro}${dentro ? '\n  ' : ''}</url>`
}

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="${IMG_NS}" xmlns:xhtml="${XHTML_NS}">\n` +
  routes.map(voceSitemap).join('\n') +
  `\n</urlset>\n`
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')
console.log(`  ✓ sitemap.xml (${routes.length} URL)`)

/* robots.txt — punta alla sitemap sul dominio reale del build. */
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf8')
console.log(`  ✓ robots.txt`)

console.log(`\nPre-rendering completato per ${SITE} — ${routes.length} pagine.`)
