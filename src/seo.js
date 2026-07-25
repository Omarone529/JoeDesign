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

/*
 * Immagini per le anteprime social: JPEG 1200×630 in public/images/og/,
 * preparate da `node scripts/og-image.js`. Non si usano le WebP del sito
 * perché LinkedIn e WhatsApp non le mostrano, e chi condivide il link
 * vedrebbe un riquadro vuoto.
 */
const ogImage = (nome) => abs(`/images/og/${nome}.jpg`)

const FIRMA = `${profile.name} “${profile.nick}”`

/*
 * Titolo di una scheda progetto. Porta sempre il nome per esteso: le schede
 * sono la maggior parte del sito, e con il solo "Joe" non risponderebbero a
 * chi cerca "Giovanni Sarchiolla". Se la riga supera i ~62 caratteri Google la
 * tronca con i puntini, quindi la categoria cade per prima: è l'informazione
 * che il titolo del progetto già lascia intuire.
 */
function titoloProgetto(item) {
  const pieno = `${item.title} · ${item.cat} · ${FIRMA}`
  if (pieno.length <= 62) return pieno
  const senzaCategoria = `${item.title} · ${FIRMA}`
  return senzaCategoria.length <= 62 ? senzaCategoria : `${item.title} · ${profile.name}`
}

export function metaForRoute(route) {
  if (route.name === 'archive') {
    return {
      title: `Archivio progetti · ${FIRMA}`,
      description: `Tutti i ${archive.length} progetti di ${FIRMA}: product design, arredo, packaging e grafica. Portfolio ${PERIODO}.`,
      canonical: `${SITE}/archivio`,
      image: ogImage('archivio'),
      imageAlt: `La famiglia di prodotti disegnati da ${profile.displayName}`,
      type: 'website',
    }
  }

  if (route.name === 'about') {
    return {
      title: `Chi sono · ${FIRMA} · ${profile.role}`,
      description: clip(about.intro),
      canonical: `${SITE}/chi-sono`,
      image: ogImage('chi-sono'),
      imageAlt: about.photos.lab.alt,
      preload: about.photos.hero.src, // elemento più grande della pagina
      type: 'profile',
    }
  }

  if (route.name === 'project') {
    const item = archive.find((p) => p.slug === route.slug)
    if (item) {
      const { cover } = projectImages(item)
      return {
        title: titoloProgetto(item),
        description: clip(item.desc),
        canonical: `${SITE}/progetto/${item.slug}`,
        image: ogImage(item.slug),
        imageAlt: `${item.title} · ${item.cat}`,
        preload: cover, // prima diapositiva del carosello
        type: 'article',
        project: item,
      }
    }
  }

  // 404. `noindex` perché la pagina non deve finire nell'indice, e nessun
  // canonical: l'URL che la mostra è per definizione sbagliato, indicarne uno
  // "giusto" direbbe a Google che quell'indirizzo è un'altra pagina del sito.
  if (route.name === 'notfound') {
    return {
      title: `Pagina non trovata · ${FIRMA}`,
      description: `L'indirizzo non corrisponde a nessuna pagina del sito di ${FIRMA}.`,
      image: ogImage('home'),
      imageAlt: `La famiglia di prodotti disegnati da ${profile.displayName}`,
      type: 'website',
      noindex: true,
    }
  }

  // Home. Il title porta nome, ruolo e città: sono le chiavi delle ricerche
  // realistiche, sul nome e su base locale.
  return {
    title: `${FIRMA} · ${profile.role} a Reggio Emilia`,
    description: `${FIRMA}, ${profile.role} a ${profile.place}. Portfolio ${PERIODO}: prodotto, arredo, packaging e grafica.`,
    canonical: `${SITE}/`,
    image: ogImage('home'),
    imageAlt: `La famiglia di prodotti disegnati da ${profile.displayName}`,
    type: 'website',
  }
}

/* Elenco di tutte le rotte da pre-renderizzare (cresce con l'archivio). */
export function allRoutes() {
  return ['/', '/chi-sono', '/archivio', ...archive.map((p) => `/progetto/${p.slug}`)]
}
