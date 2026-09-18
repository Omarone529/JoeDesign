// Estensioni `.js` esplicite: questo file lo legge anche Node (test e script).
import {
  aboutIn,
  archiveIn,
  areaOf,
  areaBySlugIn,
  areasIn,
  countProjects,
  focusItemsIn,
  archivePeriod,
  periodOf,
  profile,
  profileIn,
  areaProjectsIn,
  manifestoPhoto,
  manifestoPhotoIn,
  projectImages,
  readableTitle,
} from './data/siteData.js'
import { LANGS, texts } from './i18n.js'
import { pathFor, translatedPath } from './routes.js'

/*
 * Metadati per rotta (meta, dati strutturati, sitemap), serializzati da prerender.js.
 * SITE viene dalla env `URL` di Netlify; il ripiego deve combaciare col dominio primario.
 */
const ENV_SITE =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.SITE_URL || process.env.URL)) ||
  ''
export const SITE = (ENV_SITE || 'https://joesarchiolla.com').replace(/\/+$/, '')

const abs = (p) => (/^https?:/.test(p) ? p : SITE + p)

/* L'URL assoluto di una pagina, nella lingua chiesta. */
const url = (name, params, lang) => SITE + pathFor(name, params, lang)

const PERIOD = archivePeriod
  ? archivePeriod.first === archivePeriod.last
    ? `${archivePeriod.first}`
    : `${archivePeriod.first} · ${archivePeriod.last}`
  : ''

// Ripiego per le schede senza `desc`: oggetto, anno e autore.
function projectDescription(item, lang) {
  if (item.desc?.trim()) return item.desc
  const p = profileIn(lang)
  const year = item.year ? `, ${item.year}` : ''
  return texts(lang).seo.projectDesc(
    readableTitle(item.title),
    item.cat,
    year,
    p.name,
    p.role,
    p.place,
  )
}

// Taglia a `max` caratteri, preferendo chiudere su una frase intera.
export function clip(text, max = 155, min = 80) {
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t

  let full = ''
  for (const sentence of t.match(/[^.!?]+[.!?]+(\s|$)/g) || []) {
    if ((full + sentence).trim().length > max) break
    full += sentence
  }
  full = full.trim()
  if (full.length >= min) return full

  return t.slice(0, max - 1).replace(/\s+\S*$/, '').trim() + '…'
}

// JPEG, non WebP: LinkedIn e WhatsApp non mostrano le WebP.
const ogImage = (name, lang) => abs(`/images/og/${lang === 'en' ? 'en/' : ''}${name}.jpg`)

const SIGNATURE = `${profile.name} “${profile.nick}”`

// Nome per esteso nel title; oltre ~62 caratteri cade prima la categoria.
function projectTitle(item) {
  const name = readableTitle(item.title)
  const fullness = `${name} · ${item.cat} · ${SIGNATURE}`
  if (fullness.length <= 62) return fullness
  const noCategory = `${name} · ${SIGNATURE}`
  return noCategory.length <= 62 ? noCategory : `${name} · ${profile.name}`
}

function periodLabel(period) {
  if (!period) return ''
  return period.first === period.last
    ? `${period.first}`
    : `${period.first} · ${period.last}`
}

// hreflang delle due lingue, con x-default sull'italiano.
function alternative(route) {
  if (route.name === 'notfound') return []
  return [
    ...LANGS.map((l) => ({ lang: l, href: SITE + translatedPath(route, l) })),
    { lang: 'x-default', href: SITE + translatedPath(route, 'it') },
  ]
}

export function metaForRoute(route) {
  const lang = route.lang || 'it'
  const T = texts(lang)
  const p = profileIn(lang)
  const common = { lang, htmlLang: T.htmlLang, ogLocale: T.ogLocale, alternate: alternative(route) }

  if (route.name === 'archive') {
    // Pagina d'area: /archivio/product-design, /en/archive/graphic-design.
    const area = route.area ? areaBySlugIn(route.area, lang) : null
    if (area) {
      const projects = areaProjectsIn(area.key, lang)
      return {
        ...common,
        title: T.seo.areaTitle(area.label, SIGNATURE),
        description: clip(
          T.seo.areaDesc(
            countProjects(projects.length, lang),
            area.label.toLowerCase(),
            SIGNATURE,
            periodLabel(periodOf(projects)),
            area.desc,
          ),
        ),
        canonical: url('archive', { area: area.slug }, lang),
        image: ogImage(`archive-${area.slug}`, lang),
        imageAlt: T.seo.areaImageAlt(area.label, p.displayName),
        type: 'website',
        area,
      }
    }

    return {
      ...common,
      title: T.seo.archiveTitle(SIGNATURE),
      description: T.seo.archiveDesc(archiveIn(lang).length, SIGNATURE, PERIOD),
      canonical: url('archive', {}, lang),
      image: ogImage('archive', lang),
      imageAlt: T.seo.areaImageAlt(T.seo.archiveName, p.displayName),
      type: 'website',
    }
  }

  if (route.name === 'about') {
    const about = aboutIn(lang)
    return {
      ...common,
      title: T.seo.aboutTitle(SIGNATURE, p.role),
      description: clip(about.intro),
      canonical: url('about', {}, lang),
      image: ogImage('about', lang),
      // L'alt descrive l'ANTEPRIMA social, che `og-image.js` compone ancora con
      // la foto della lampada: cambiando la sorgente là, va cambiato anche qui.
      imageAlt: manifestoPhotoIn(lang).alt,
      preload: about.photos.hero.src, // elemento più grande della pagina
      type: 'profile',
    }
  }

  if (route.name === 'project') {
    const item = archiveIn(lang).find((x) => x.slug === route.slug)
    if (item) {
      const { cover, gallery } = projectImages(item)
      // Senza copertina non c'è nemmeno l'anteprima social della scheda:
      // il link condiviso porta quella dell'area, non un riquadro vuoto.
      const areaItem = areasIn(lang).find((a) => a.key === areaOf(item))
      // Un `area` che non corrisponde a nessuna area dichiarata è un refuso nei
      // dati: senza questa riga la build muore più avanti su un `undefined`.
      if (!areaItem) {
        throw new Error(
          `seo: il progetto "${item.slug}" dichiara area "${areaOf(item)}", che non esiste in \`aree\` (${areasIn(lang)
            .map((a) => a.key)
            .join(', ')})`,
        )
      }
      return {
        ...common,
        title: projectTitle(item),
        description: clip(projectDescription(item, lang)),
        canonical: url('project', { slug: item.slug }, lang),
        image: ogImage(cover ? item.slug : `archive-${areaItem.slug}`, lang),
        imageAlt: `${item.title} · ${item.cat}`,
        preload: gallery[0], // prima diapositiva del carosello
        type: 'article',
        project: item,
      }
    }
  }

  // Anteprima social della home: og-image.js non ne genera una per la privacy.
  if (route.name === 'privacy') {
    return {
      ...common,
      title: T.seo.privacyTitle(SIGNATURE),
      description: T.seo.privacyDesc(SIGNATURE),
      canonical: url('privacy', {}, lang),
      image: ogImage('home', lang),
      imageAlt: aboutIn(lang).photos.hero.alt,
      type: 'website',
    }
  }

  // Nessun canonical: l'URL che mostra la 404 è per definizione sbagliato, e
  // indicarne uno "giusto" direbbe a Google che è un'altra pagina del sito.
  if (route.name === 'notfound') {
    return {
      ...common,
      title: T.seo.notFoundTitle(SIGNATURE),
      description: T.seo.notFoundDesc(SIGNATURE),
      image: ogImage('home', lang),
      imageAlt: aboutIn(lang).photos.hero.alt,
      type: 'website',
      noindex: true,
    }
  }

  // Nome, ruolo e città: le chiavi delle ricerche realistiche.
  return {
    ...common,
    title: T.seo.homeTitle(SIGNATURE, p.role),
    description: T.seo.homeDesc(SIGNATURE, p.role, p.place, PERIOD),
    canonical: url('home', {}, lang),
    image: ogImage('home', lang),
    imageAlt: aboutIn(lang).photos.hero.alt,
    type: 'website',
  }
}

/* Tutte le pagine da generare: le stesse rotte in tutte e due le lingue. */
export function allRoutes() {
  return LANGS.flatMap((lang) => [
    pathFor('home', {}, lang),
    pathFor('about', {}, lang),
    pathFor('archive', {}, lang),
    pathFor('privacy', {}, lang),
    ...areasIn(lang).map((a) => pathFor('archive', { area: a.slug }, lang)),
    ...archiveIn(lang).map((p) => pathFor('project', { slug: p.slug }, lang)),
  ])
}

/* ─────────────────────────── Dati strutturati ─────────────────────────── */

// Un @graph per pagina: sito e persona hanno un @id unico, pagine e opere uno per lingua.
const SITE_ID = `${SITE}/#site`
const PERSON_ID = `${SITE}/#person`
const archiveId = (lang) => `${url('archive', {}, lang)}#raccolta`

/* `sameAs` lega il nome ai profili: vanno elencati tutti. */
const SOCIAL = [profile.instagram, profile.youtube, profile.tiktok, profile.linkedin].filter(
  Boolean,
)

function siteNode(lang) {
  const T = texts(lang)
  const p = profileIn(lang)
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: `${SITE}/`,
    name: `${profile.name} “${profile.nick}”`,
    description: T.seo.siteDesc(p.name, p.role, p.place),
    inLanguage: T.schemaLang,
    publisher: { '@id': PERSON_ID },
  }
}

function personNode(lang) {
  const p = profileIn(lang)
  const about = aboutIn(lang)
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: p.name,
    alternateName: [p.displayName, p.nick],
    jobTitle: p.role,
    description: clip(about.intro),
    url: url('about', {}, lang),
    image: abs(about.photos.hero.src),
    email: `mailto:${p.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: p.place.split(',')[0].trim(),
      addressRegion: 'Emilia-Romagna',
      addressCountry: 'IT',
    },
    alumniOf: { '@type': 'CollegeOrUniversity', name: p.education },
    hasOccupation: {
      '@type': 'Occupation',
      name: p.role,
      occupationLocation: { '@type': 'City', name: p.place.split(',')[0].trim() },
    },
    // Discipline più gli strumenti, che `about.skills` tiene già aggiornati.
    knowsAbout: [...texts(lang).seo.disciplines, ...about.skills],
    sameAs: SOCIAL,
  }
}

function projectNode(item, meta) {
  const { cover, gallery, drawing } = projectImages(item)
  const name = readableTitle(item.title)
  const years = String(item.year || '').match(/\d{4}/g)
  // `spec` cambia lingua e con essa le chiavi: il materiale è la seconda voce
  // in italiano e in inglese, e va cercato per l'una o per l'altra.
  const material = item.spec?.Materiale || item.spec?.Material

  return {
    '@type': 'CreativeWork',
    '@id': `${meta.canonical}#opera`,
    name: name,
    description: meta.description,
    url: meta.canonical,
    inLanguage: texts(meta.lang).schemaLang,
    // La copertina per prima: è quella che finisce accanto al risultato.
    image: [cover, ...gallery, drawing].filter(Boolean).map(abs),
    ...(years ? { dateCreated: years[years.length - 1] } : {}),
    ...(material ? { material: material } : {}),
    keywords: [...new Set([item.cat, ...Object.values(item.spec || {})])].join(', '),
    creator: { '@id': PERSON_ID },
    isPartOf: { '@id': archiveId(meta.lang) },
    mainEntityOfPage: meta.canonical,
  }
}

// Copia minima del nodo archivio, così ogni @id citato nella pagina è anche definito.
function archiveLink(lang) {
  return {
    '@type': 'CollectionPage',
    '@id': archiveId(lang),
    url: url('archive', {}, lang),
    name: texts(lang).seo.archiveName,
    isPartOf: { '@id': SITE_ID },
  }
}

/* Sito e persona ci sono sempre, più l'entità propria della pagina. */
export function schemaForRoute(route, meta) {
  const lang = meta.lang || 'it'
  const T = texts(lang)
  const graph = [siteNode(lang), personNode(lang)]
  const breadcrumbs = (entries) => ({ '@type': 'BreadcrumbList', itemListElement: entries })

  if (route.name === 'project') {
    const item = archiveIn(lang).find((p) => p.slug === route.slug)
    if (item) {
      const area = areasIn(lang).find((a) => a.key === areaOf(item))
      graph.push(archiveLink(lang), projectNode(item, meta), breadcrumbs([
        { '@type': 'ListItem', position: 1, name: T.seo.breadcrumbHome, item: url('home', {}, lang) },
        {
          '@type': 'ListItem',
          position: 2,
          name: T.seo.breadcrumbArchive,
          item: url('archive', {}, lang),
        },
        ...(area
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: area.label,
                item: url('archive', { area: area.slug }, lang),
              },
            ]
          : []),
        { '@type': 'ListItem', position: area ? 4 : 3, name: readableTitle(item.title) },
      ]))
    }
  } else if (route.name === 'archive') {
    // La pagina d'area è una raccolta a sé, parte dell'archivio.
    const area = meta.area
    const projects = area ? areaProjectsIn(area.key, lang) : archiveIn(lang)
    if (area) graph.push(archiveLink(lang))
    graph.push({
      '@type': 'CollectionPage',
      '@id': area ? `${meta.canonical}#raccolta` : archiveId(lang),
      url: meta.canonical,
      name: area ? T.seo.areaName(area.label) : T.seo.archiveName,
      description: meta.description,
      inLanguage: T.schemaLang,
      isPartOf: { '@id': area ? archiveId(lang) : SITE_ID },
      about: { '@id': PERSON_ID },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: projects.length,
        itemListElement: projects.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: url('project', { slug: p.slug }, lang),
          name: readableTitle(p.title),
        })),
      },
    })
    if (area) {
      graph.push(
        breadcrumbs([
          {
            '@type': 'ListItem',
            position: 1,
            name: T.seo.breadcrumbHome,
            item: url('home', {}, lang),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: T.seo.breadcrumbArchive,
            item: url('archive', {}, lang),
          },
          { '@type': 'ListItem', position: 3, name: area.label },
        ]),
      )
    }
  } else if (route.name === 'privacy') {
    // Nessun `about`: l'informativa parla del sito, non della persona.
    graph.push({
      '@type': 'WebPage',
      '@id': `${meta.canonical}#pagina`,
      url: meta.canonical,
      name: meta.title,
      description: meta.description,
      inLanguage: T.schemaLang,
      isPartOf: { '@id': SITE_ID },
    })
  } else if (route.name === 'about') {
    graph.push({
      '@type': 'ProfilePage',
      '@id': `${url('about', {}, lang)}#pagina`,
      url: url('about', {}, lang),
      name: meta.title,
      inLanguage: T.schemaLang,
      isPartOf: { '@id': SITE_ID },
      mainEntity: { '@id': PERSON_ID },
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

// Immagini per la sitemap: ogni URL, anche inglese, dichiara le proprie.
export function imagesForRoute(route) {
  const lang = route.lang || 'it'

  // Foto del manifesto e anteprime dei selezionati. Il ritratto in cima no: ha alt vuoto.
  if (route.name === 'home') {
    return [manifestoPhoto.src, ...focusItemsIn(lang).map((p) => p.cover)].map(abs)
  }

  if (route.name === 'about') {
    const about = aboutIn(lang)
    const plates = about.sketchbook.flatMap((t) => [t.front?.src, t.back?.src])
    const photos = [about.photos.hero.src, about.photos.sketches.src]
    return [...photos, ...plates].filter(Boolean).map(abs)
  }

  const covers = (items) =>
    items.map((p) => projectImages(p).cover).filter(Boolean).map(abs)

  if (route.name === 'archive') {
    if (!route.area) return covers(archiveIn(lang))
    const area = areaBySlugIn(route.area, lang)
    return area ? covers(areaProjectsIn(area.key, lang)) : []
  }

  if (route.name !== 'project') return []
  const item = archiveIn(lang).find((p) => p.slug === route.slug)
  if (!item) return []
  const { cover, gallery, drawing, backdrop, videoPoster, filmPoster } = projectImages(item)
  return [cover, ...gallery, drawing, backdrop, videoPoster, filmPoster].filter(Boolean).map(abs)
}
