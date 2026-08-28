import {
  about,
  archive,
  familyBand,
  homeHero,
  periodoArchivio,
  profile,
  projectImages,
  titoloLeggibile,
} from './data/siteData'

/*
 * Metadati per rotta: meta tag, dati strutturati, immagini della sitemap.
 * Li scrive nelle pagine `scripts/prerender.js`, che qui non decide nulla.
 *
 * SITE lo passa Netlify al deploy nella env `URL`, quindi segue da sé il
 * dominio vero. Per forzarlo: `SITE_URL=https://miodominio.it npm run build`.
 */
const ENV_SITE =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.SITE_URL || process.env.URL)) ||
  ''
export const SITE = (ENV_SITE || 'https://joedesign.netlify.app').replace(/\/+$/, '')

const abs = (p) => (/^https?:/.test(p) ? p : SITE + p)

const PERIODO = periodoArchivio
  ? periodoArchivio.primo === periodoArchivio.ultimo
    ? `${periodoArchivio.primo}`
    : `${periodoArchivio.primo} · ${periodoArchivio.ultimo}`
  : ''

/*
 * Le schede ancora senza testo (`desc: ''`) avrebbero una meta description
 * vuota, che vale meno di niente: qui il ripiego dice almeno oggetto, anno e
 * autore. Appena la descrizione c'è, vince quella.
 */
function descrizioneProgetto(item) {
  if (item.desc?.trim()) return item.desc
  const anno = item.year ? `, ${item.year}` : ''
  return `${titoloLeggibile(item.title)} — ${item.cat}${anno}. Progetto di ${profile.name}, ${profile.role} a ${profile.place}.`
}

function clip(text, max = 155) {
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return t.slice(0, max - 1).replace(/\s+\S*$/, '').trim() + '…'
}

/*
 * JPEG e non le WebP del sito: LinkedIn e WhatsApp non le mostrano, e il link
 * condiviso uscirebbe senza immagine. Le prepara `scripts/og-image.js`.
 */
const ogImage = (nome) => abs(`/images/og/${nome}.jpg`)

const FIRMA = `${profile.name} “${profile.nick}”`

/*
 * Sempre il nome per esteso: le schede sono la maggior parte del sito, e con
 * il solo "Joe" non risponderebbero a chi cerca "Giovanni Sarchiolla". Oltre i
 * ~62 caratteri Google tronca, quindi la categoria cade per prima.
 */
function titoloProgetto(item) {
  const nome = titoloLeggibile(item.title)
  const pieno = `${nome} · ${item.cat} · ${FIRMA}`
  if (pieno.length <= 62) return pieno
  const senzaCategoria = `${nome} · ${FIRMA}`
  return senzaCategoria.length <= 62 ? senzaCategoria : `${nome} · ${profile.name}`
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
      const { gallery } = projectImages(item)
      return {
        title: titoloProgetto(item),
        description: clip(descrizioneProgetto(item)),
        canonical: `${SITE}/progetto/${item.slug}`,
        image: ogImage(item.slug),
        imageAlt: `${item.title} · ${item.cat}`,
        preload: gallery[0], // prima diapositiva del carosello
        type: 'article',
        project: item,
      }
    }
  }

  // Nessun canonical: l'URL che mostra la 404 è per definizione sbagliato, e
  // indicarne uno "giusto" direbbe a Google che è un'altra pagina del sito.
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

  // Nome, ruolo e città: le chiavi delle ricerche realistiche.
  return {
    title: `${FIRMA} · ${profile.role} a Reggio Emilia`,
    description: `${FIRMA}, ${profile.role} a ${profile.place}. Portfolio ${PERIODO}: prodotto, arredo, packaging e grafica.`,
    canonical: `${SITE}/`,
    image: ogImage('home'),
    imageAlt: `La famiglia di prodotti disegnati da ${profile.displayName}`,
    type: 'website',
  }
}

export function allRoutes() {
  return ['/', '/chi-sono', '/archivio', ...archive.map((p) => `/progetto/${p.slug}`)]
}

/* ─────────────────────────── Dati strutturati ─────────────────────────── */

/*
 * Un grafo per pagina. Le entità hanno un `@id` stabile e si richiamano invece
 * di ridescriversi: così le 18 schede risultano di una persona sola, e non di
 * 18 omonimi.
 */
const ID_SITO = `${SITE}/#sito`
const ID_PERSONA = `${SITE}/#persona`
const ID_ARCHIVIO = `${SITE}/archivio#raccolta`

/* `sameAs` lega il nome ai profili: vanno elencati tutti. */
const SOCIAL = [profile.instagram, profile.youtube, profile.tiktok, profile.linkedin].filter(
  Boolean,
)

const nodoSito = {
  '@type': 'WebSite',
  '@id': ID_SITO,
  url: `${SITE}/`,
  name: `${profile.name} “${profile.nick}”`,
  description: `Portfolio di ${profile.name}, ${profile.role} a ${profile.place}.`,
  inLanguage: 'it-IT',
  publisher: { '@id': ID_PERSONA },
}

const nodoPersona = {
  '@type': 'Person',
  '@id': ID_PERSONA,
  name: profile.name,
  alternateName: [profile.displayName, profile.nick],
  jobTitle: profile.role,
  description: clip(about.intro),
  url: `${SITE}/chi-sono`,
  image: abs(about.photos.hero.src),
  email: `mailto:${profile.email}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: profile.place.split(',')[0].trim(),
    addressRegion: 'Emilia-Romagna',
    addressCountry: 'IT',
  },
  alumniOf: { '@type': 'CollegeOrUniversity', name: profile.formazione },
  hasOccupation: {
    '@type': 'Occupation',
    name: profile.role,
    occupationLocation: { '@type': 'City', name: profile.place.split(',')[0].trim() },
  },
  // Discipline più gli strumenti, che `about.skills` tiene già aggiornati.
  knowsAbout: [
    'Product design',
    'Industrial design',
    'Packaging design',
    'Graphic design',
    ...about.skills,
  ],
  sameAs: SOCIAL,
}

function nodoProgetto(item, meta) {
  const { cover, gallery, drawing } = projectImages(item)
  const nome = titoloLeggibile(item.title)
  const anni = String(item.year || '').match(/\d{4}/g)

  return {
    '@type': 'CreativeWork',
    '@id': `${meta.canonical}#opera`,
    name: nome,
    description: meta.description,
    url: meta.canonical,
    inLanguage: 'it-IT',
    // La copertina per prima: è quella che finisce accanto al risultato.
    image: [cover, ...gallery, ...(drawing ? [drawing] : [])].map(abs),
    ...(anni ? { dateCreated: anni[anni.length - 1] } : {}),
    ...(item.spec?.Materiale ? { material: item.spec.Materiale } : {}),
    keywords: [...new Set([item.cat, ...Object.values(item.spec || {})])].join(', '),
    creator: { '@id': ID_PERSONA },
    isPartOf: { '@id': ID_ARCHIVIO },
    mainEntityOfPage: meta.canonical,
  }
}

/* Sito e persona ci sono sempre, più l'entità propria della pagina. */
export function schemaForRoute(route, meta) {
  const grafo = [nodoSito, nodoPersona]

  if (route.name === 'project') {
    const item = archive.find((p) => p.slug === route.slug)
    if (item) {
      grafo.push(nodoProgetto(item, meta), {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Archivio', item: `${SITE}/archivio` },
          { '@type': 'ListItem', position: 3, name: titoloLeggibile(item.title) },
        ],
      })
    }
  } else if (route.name === 'archive') {
    grafo.push({
      '@type': 'CollectionPage',
      '@id': ID_ARCHIVIO,
      url: `${SITE}/archivio`,
      name: 'Archivio progetti',
      description: meta.description,
      inLanguage: 'it-IT',
      isPartOf: { '@id': ID_SITO },
      about: { '@id': ID_PERSONA },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: archive.length,
        itemListElement: archive.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE}/progetto/${p.slug}`,
          name: titoloLeggibile(p.title),
        })),
      },
    })
  } else if (route.name === 'about') {
    grafo.push({
      '@type': 'ProfilePage',
      '@id': `${SITE}/chi-sono#pagina`,
      url: `${SITE}/chi-sono`,
      name: meta.title,
      inLanguage: 'it-IT',
      isPartOf: { '@id': ID_SITO },
      mainEntity: { '@id': ID_PERSONA },
    })
  }

  return { '@context': 'https://schema.org', '@graph': grafo }
}

/*
 * Per un portfolio Google Immagini vale quanto la ricerca per testo: senza
 * queste righe le foto si scoprono solo passando dalla pagina che le ospita.
 */
export function immaginiPerRotta(percorso) {
  if (percorso === '/') return [homeHero.src, familyBand.src].map(abs)

  if (percorso === '/chi-sono') {
    const tavole = about.sketchbook.flatMap((t) => [t.front?.src, t.back?.src])
    return [about.photos.hero.src, about.photos.lab.src, ...tavole].filter(Boolean).map(abs)
  }

  if (percorso === '/archivio') return archive.map((p) => abs(projectImages(p).cover))

  if (!percorso.startsWith('/progetto/')) return []
  const item = archive.find((p) => p.slug === percorso.slice('/progetto/'.length))
  if (!item) return []
  const { cover, gallery, drawing, sfondo } = projectImages(item)
  return [cover, ...gallery, ...(drawing ? [drawing] : []), ...(sfondo ? [sfondo] : [])].map(abs)
}
