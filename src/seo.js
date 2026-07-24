import { about, archive, profile, projectImages } from './data/siteData'

/*
 * Metadati SEO per ogni rotta: title, description, canonical, immagine social.
 * Usati dallo script di pre-rendering (scripts/prerender.js) per scrivere i
 * meta tag e l'Open Graph di ciascuna pagina HTML statica.
 *
 * SITE = dominio di produzione. In fase di build su Netlify viene letto in
 * automatico dalla variabile d'ambiente `URL` (il vero indirizzo del sito, sia
 * il sottodominio *.netlify.app sia il dominio personalizzato che aggiungerai
 * in futuro). In locale usa il placeholder qui sotto. Per forzarlo a mano:
 * `SITE_URL=https://miodominio.it npm run build`.
 */
const ENV_SITE =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.SITE_URL || process.env.URL)) ||
  ''
export const SITE = (ENV_SITE || 'https://joedesign.netlify.app').replace(/\/+$/, '')

const abs = (p) => (/^https?:/.test(p) ? p : SITE + p)

/* Taglia una descrizione a ~155 caratteri (lunghezza ideale per Google). */
function clip(text, max = 155) {
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return t.slice(0, max - 1).replace(/\s+\S*$/, '').trim() + '…'
}

export function metaForRoute(route) {
  if (route.name === 'archive') {
    return {
      title: 'Archivio · Giovanni “Joe” Sarchiolla',
      description:
        'Tutti i progetti di Giovanni “Joe” Sarchiolla: product design, arredo, packaging e grafica. Portfolio 2024 · 2026.',
      canonical: `${SITE}/archivio`,
      image: abs('/images/home/family-band.webp'),
      type: 'website',
    }
  }

  if (route.name === 'about') {
    return {
      title: `Chi sono · ${profile.displayName}`,
      description: about.intro,
      canonical: `${SITE}/chi-sono`,
      image: abs(about.photos.hero.src),
      type: 'profile',
    }
  }

  if (route.name === 'project') {
    const item = archive.find((p) => p.slug === route.slug)
    if (item) {
      const { cover } = projectImages(item)
      return {
        title: `${item.title} · ${item.cat} · Joe Sarchiolla`,
        description: clip(item.desc),
        canonical: `${SITE}/progetto/${item.slug}`,
        image: abs(cover),
        type: 'article',
        project: item,
      }
    }
  }

  // Home (default)
  return {
    title: `${profile.name} “${profile.nick}” · ${profile.role}`,
    description: `${profile.name} “${profile.nick}”, ${profile.role} a ${profile.place}. Portfolio 2024 · 2026: prodotto, arredo, packaging e grafica.`,
    canonical: `${SITE}/`,
    image: abs('/images/home/family-band.webp'),
    type: 'website',
  }
}

/* Elenco di tutte le rotte da pre-renderizzare (cresce con l'archivio). */
export function allRoutes() {
  return ['/', '/chi-sono', '/archivio', ...archive.map((p) => `/progetto/${p.slug}`)]
}
