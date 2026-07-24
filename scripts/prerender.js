/*
 * Pre-rendering statico del sito.
 *
 * Dopo `vite build` (bundle client) e `vite build --ssr` (bundle server),
 * questo script per ogni rotta:
 *   1. renderizza la pagina React in HTML già completo;
 *   2. lo inietta nel template dist/index.html;
 *   3. scrive title, meta description, canonical, Open Graph e dati strutturati
 *      specifici della pagina;
 *   4. salva il file HTML statico nel percorso giusto (es. dist/progetto/flue/index.html).
 * Infine genera sitemap.xml.
 *
 * Risultato: Google e le anteprime dei link (WhatsApp, LinkedIn…) vedono subito
 * il contenuto, senza dover eseguire JavaScript.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')

// Import del bundle SSR compilato da Vite.
const server = await import(
  pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href
)
const { render, allRoutes, metaForRoute, parsePath, SITE } = server

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')

/* Tag da inserire nell'<head> per una singola pagina. */
function headTags(meta) {
  const tags = [
    `<link rel="canonical" href="${meta.canonical}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="Giovanni “Joe” Sarchiolla" />`,
    `<meta property="og:locale" content="it_IT" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:image" content="${meta.image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${meta.image}" />`,
  ]
  tags.push(`<script type="application/ld+json">${jsonLd(meta)}</script>`)
  return tags.join('\n    ')
}

/* Dati strutturati schema.org: Person in home, CreativeWork nelle schede. */
function jsonLd(meta) {
  if (meta.project) {
    const p = meta.project
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: p.title,
      description: meta.description,
      image: meta.image,
      url: meta.canonical,
      dateCreated: p.year,
      creator: {
        '@type': 'Person',
        name: 'Giovanni Sarchiolla',
        alternateName: 'Joe Sarchiolla',
      },
    })
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Giovanni Sarchiolla',
    alternateName: 'Joe Sarchiolla',
    jobTitle: 'Product Designer',
    url: `${SITE}/`,
    address: { '@type': 'PostalAddress', addressLocality: 'Reggio Emilia', addressCountry: 'IT' },
    sameAs: ['https://instagram.com/joesarchiolla.design'],
  })
}

/* Costruisce l'HTML finale di una pagina a partire dal template. */
function buildPage(pathname) {
  const meta = metaForRoute(parsePath(pathname))
  const { html } = render(pathname)

  return template
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${esc(meta.title)}</title>`,
    )
    .replace(
      /<meta\s+name="description"[\s\S]*?\/?>/,
      `<meta name="description" content="${esc(meta.description)}" />`,
    )
    .replace('</head>', `    ${headTags(meta)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
}

/* Percorso su disco per una rotta: "/" → index.html, "/x" → x/index.html. */
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

/* sitemap.xml */
const today = new Date().toISOString().slice(0, 10)
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes
    .map(
      (r) =>
        `  <url>\n    <loc>${SITE}${r === '/' ? '/' : r}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>${r === '/' ? '1.0' : '0.8'}</priority>\n  </url>`,
    )
    .join('\n') +
  `\n</urlset>\n`
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')
console.log(`  ✓ sitemap.xml (${routes.length} URL)`)

/* robots.txt — punta alla sitemap sul dominio reale del build. */
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf8')
console.log(`  ✓ robots.txt`)

console.log(`\nPre-rendering completato per ${SITE} — ${routes.length} pagine.`)
