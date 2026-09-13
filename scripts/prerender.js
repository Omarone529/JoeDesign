// Pre-rendering: HTML statico per ogni rotta in it/en, 404 e sitemap. Metadati da src/seo.js.
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
    // Le due lingue della stessa pagina, più x-default. Ogni pagina elenca
    // anche sé stessa: è la forma che Google chiede.
    ...(meta.alternate || []).map(
      (a) => `<link rel="alternate" hreflang="${a.lang}" href="${a.href}" />`,
    ),
    // Immagine principale nota in anticipo: il preload la mette in coda leggendo
    // l'head, senza aspettare il layout.
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
    // Senza le dimensioni, alla prima condivisione la piattaforma scarica il
    // file per impaginarlo e spesso mostra l'anteprima vuota.
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
    // La lingua del documento: con `it` su una pagina inglese, le sintesi
    // vocali leggerebbero l'inglese con la pronuncia italiana.
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

// 404 fuori dalla sitemap. /en/404.html la serve la regola in netlify.toml.
fs.writeFileSync(path.join(distDir, '404.html'), buildPage('/404'), 'utf8')
console.log(`  ✓ 404  →  dist/404.html`)

fs.mkdirSync(path.join(distDir, 'en'), { recursive: true })
fs.writeFileSync(path.join(distDir, 'en', '404.html'), buildPage('/en/404'), 'utf8')
console.log(`  ✓ 404 (en)  →  dist/en/404.html`)

// Niente changefreq, priority né lastmod. In <image:image> solo <image:loc>: il resto è deprecato.
const IMG_NS = 'http://www.google.com/schemas/sitemap-image/1.1'
const XHTML_NS = 'http://www.w3.org/1999/xhtml'

// xhtml:link di traduzione, come gli hreflang nell'head.
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

/* robots.txt: punta alla sitemap sul dominio reale del build. */
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf8')
console.log(`  ✓ robots.txt`)

console.log(`\nPre-rendering completato per ${SITE}: ${routes.length} pagine.`)
