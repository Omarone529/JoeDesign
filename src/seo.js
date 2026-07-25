import { about, archive, periodoArchivio, profile, projectImages } from './data/siteData'

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

/* Periodo dell'archivio in forma leggibile: "2024 · 2026", o il solo anno. */
const PERIODO = periodoArchivio
  ? periodoArchivio.primo === periodoArchivio.ultimo
    ? `${periodoArchivio.primo}`
    : `${periodoArchivio.primo} · ${periodoArchivio.ultimo}`
  : ''

/* Taglia una descrizione a ~155 caratteri (lunghezza ideale per Google). */
function clip(text, max = 155) {
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return t.slice(0, max - 1).replace(/\s+\S*$/, '').trim() + '…'
}

export function metaForRoute(route) {
  if (route.name === 'archive') {
    return {
      title: `Archivio progetti · ${profile.name} “${profile.nick}”`,
      description: `Tutti i ${archive.length} progetti di ${profile.name} “${profile.nick}”: product design, arredo, packaging e grafica. Portfolio ${PERIODO}.`,
      canonical: `${SITE}/archivio`,
      image: abs('/images/home/family-band.webp'),
      type: 'website',
    }
  }

  if (route.name === 'about') {
    return {
      title: `Chi sono · ${profile.displayName} · ${profile.role}`,
      description: clip(about.intro),
      canonical: `${SITE}/chi-sono`,
      // Non il ritratto scontornato: le anteprime social non gestiscono la
      // trasparenza e la rendono su fondo nero. Serve un'immagine piena.
      image: abs(about.photos.lab.src),
      preload: about.photos.hero.src, // elemento più grande della pagina
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
        preload: cover, // prima diapositiva del carosello
        type: 'article',
        project: item,
      }
    }
  }

  // Home. Il title porta nome, ruolo e città: sono le chiavi delle ricerche
  // realistiche, sul nome e su base locale.
  return {
    title: `${profile.name} “${profile.nick}” · ${profile.role} a Reggio Emilia`,
    description: `${profile.name} “${profile.nick}”, ${profile.role} a ${profile.place}. Portfolio ${PERIODO}: prodotto, arredo, packaging e grafica.`,
    canonical: `${SITE}/`,
    image: abs('/images/home/family-band.webp'),
    type: 'website',
  }
}

/* Elenco di tutte le rotte da pre-renderizzare (cresce con l'archivio). */
export function allRoutes() {
  return ['/', '/chi-sono', '/archivio', ...archive.map((p) => `/progetto/${p.slug}`)]
}
