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
 * Infine genera la pagina d'errore 404.html e la sitemap.xml.
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
const { render, allRoutes, metaForRoute, parsePath, SITE, profile } = server

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
    // La 404 è l'unica pagina senza canonical: non ha un indirizzo proprio da
    // dichiarare. In compenso chiede esplicitamente di non essere indicizzata.
    ...(meta.noindex ? [`<meta name="robots" content="noindex,follow" />`] : []),
    ...(meta.canonical ? [`<link rel="canonical" href="${meta.canonical}" />`] : []),
    // Immagine principale nota in anticipo (ritratto in "Chi sono", copertina
    // nelle schede): il preload la mette in coda leggendo l'head, senza
    // attendere che il layout ne riveli la necessità.
    ...(meta.preload ? [`<link rel="preload" as="image" href="${meta.preload}" fetchpriority="high" />`] : []),
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="Giovanni “Joe” Sarchiolla" />`,
    `<meta property="og:locale" content="it_IT" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    ...(meta.canonical ? [`<meta property="og:url" content="${meta.canonical}" />`] : []),
    `<meta property="og:image" content="${meta.image}" />`,
    // Dimensioni dichiarate: senza, alla prima condivisione la piattaforma
    // deve scaricare il file per sapere come impaginarlo, e spesso mostra
    // l'anteprima senza immagine proprio la prima volta - quella che conta.
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
  // Dati strutturati solo sulle pagine vere: descrivere un errore a un motore
  // di ricerca non ha senso.
  if (!meta.noindex) {
    tags.push(`<script type="application/ld+json">${jsonLd(meta)}</script>`)
  }
  return tags.join('\n    ')
}

/*
 * Dati strutturati schema.org, con i valori presi da `profile`.
 *   schede progetto  CreativeWork + BreadcrumbList (in SERP il percorso
 *                    sostituisce l'URL nudo)
 *   altre pagine     Person, con ruolo, sede e recapiti
 */
function jsonLd(meta) {
  const persona = {
    '@type': 'Person',
    name: profile.name,
    alternateName: profile.displayName,
    jobTitle: profile.role,
    url: `${SITE}/`,
  }

  if (meta.project) {
    const p = meta.project
    // dateCreated vuole un anno singolo: da un intervallo si prende l'ultimo.
    const anni = String(p.year || '').match(/\d{4}/g)

    return JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: p.title,
        description: meta.description,
        image: meta.image,
        url: meta.canonical,
        ...(anni ? { dateCreated: anni[anni.length - 1] } : {}),
        creator: persona,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Archivio', item: `${SITE}/archivio` },
          { '@type': 'ListItem', position: 3, name: p.title, item: meta.canonical },
        ],
      },
    ])
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    ...persona,
    description: `${profile.role} a ${profile.place}.`,
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.place.split(',')[0].trim(),
      addressRegion: 'Emilia-Romagna',
      addressCountry: 'IT',
    },
    alumniOf: { '@type': 'CollegeOrUniversity', name: profile.formazione },
    knowsAbout: ['Product design', 'Industrial design', 'Packaging design', 'Graphic design'],
    sameAs: [profile.instagram],
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

/*
 * 404.html — pagina d'errore, generata a parte.
 * Non è una rotta del sito: sta fuori da `allRoutes()` (quindi fuori dalla
 * sitemap) e va scritta con questo nome esatto nella radice di dist, perché è
 * il file che Netlify serve, con status 404, per ogni indirizzo inesistente.
 */
fs.writeFileSync(path.join(distDir, '404.html'), buildPage('/404'), 'utf8')
console.log(`  ✓ 404  →  dist/404.html`)

/*
 * sitemap.xml — il solo elenco degli indirizzi.
 *
 * Niente `changefreq` né `priority`: Google li ignora da anni, dichiarati o no.
 * Niente `lastmod`: qui potrebbe valere solo la data della build, che cambia a
 * ogni deploy anche quando i contenuti sono identici. Un "modificato oggi"
 * ripetuto su tutte le pagine viene riconosciuto come falso e fa scartare il
 * campo per l'intero sito - meglio non dichiararlo che dichiararlo a caso.
 * (Se un giorno le voci dell'archivio avranno una data di aggiornamento vera,
 * quella sì che varrà la pena di scriverla qui.)
 */
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map((r) => `  <url><loc>${SITE}${r === '/' ? '/' : r}</loc></url>`).join('\n') +
  `\n</urlset>\n`
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')
console.log(`  ✓ sitemap.xml (${routes.length} URL)`)

/* robots.txt — punta alla sitemap sul dominio reale del build. */
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf8')
console.log(`  ✓ robots.txt`)

console.log(`\nPre-rendering completato per ${SITE} — ${routes.length} pagine.`)
