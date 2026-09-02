import {
  aboutIn,
  archivioIn,
  areaDi,
  areaPerSlugIn,
  areeIn,
  contaProgetti,
  familyBand,
  periodoArchivio,
  periodoDi,
  profile,
  profiloIn,
  progettiAreaIn,
  projectImages,
  titoloLeggibile,
} from './data/siteData'
import { LINGUE, testi } from './i18n'
import { percorso, percorsoTradotto } from './router'

/*
 * Metadati per rotta: meta tag, dati strutturati, immagini della sitemap.
 * Li scrive nelle pagine `scripts/prerender.js`, che qui non decide nulla.
 *
 * Il sito è bilingue e ogni pagina esiste due volte, una per lingua: qui la
 * lingua arriva sempre dalla rotta (`route.lang`), e da lì scendono titolo,
 * descrizione, `inLanguage`, l'anteprima social e gli hreflang che legano le
 * due versioni. Nessuna pagina si descrive nella lingua dell'altra.
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

/* L'URL assoluto di una pagina, nella lingua chiesta. */
const url = (name, params, lang) => SITE + percorso(name, params, lang)

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
function descrizioneProgetto(item, lang) {
  if (item.desc?.trim()) return item.desc
  const p = profiloIn(lang)
  const anno = item.year ? `, ${item.year}` : ''
  return testi(lang).seo.progettoDesc(
    titoloLeggibile(item.title),
    item.cat,
    anno,
    p.name,
    p.role,
    p.place,
  )
}

/*
 * Meta description entro `max` caratteri. Prima si prova a chiudere su una
 * frase intera: nella SERP «…il fulcro del prodotto, conferendogli un forte…»
 * si legge peggio di una frase che finisce. Se nemmeno la prima frase ci sta,
 * allora si taglia sull'ultima parola e si mettono i puntini.
 */
function clip(text, max = 155, min = 80) {
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t

  let intero = ''
  for (const frase of t.match(/[^.!?]+[.!?]+(\s|$)/g) || []) {
    if ((intero + frase).trim().length > max) break
    intero += frase
  }
  intero = intero.trim()
  if (intero.length >= min) return intero

  return t.slice(0, max - 1).replace(/\s+\S*$/, '').trim() + '…'
}

/*
 * JPEG e non le WebP del sito: LinkedIn e WhatsApp non le mostrano, e il link
 * condiviso uscirebbe senza immagine. Le prepara `scripts/og-image.js`, che
 * scrive le italiane in /images/og/ e le inglesi in /images/og/en/.
 */
const ogImage = (nome, lang) => abs(`/images/og/${lang === 'en' ? 'en/' : ''}${nome}.jpg`)

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

function periodoTesto(periodo) {
  if (!periodo) return ''
  return periodo.primo === periodo.ultimo
    ? `${periodo.primo}`
    : `${periodo.primo} · ${periodo.ultimo}`
}

/*
 * Le due versioni della stessa pagina, più `x-default` che indica quale
 * servire a chi non dichiara una lingua: l'italiano, che è la lingua del
 * lavoro e del dominio. Senza queste righe Google vedrebbe due pagine
 * concorrenti sullo stesso contenuto invece di due traduzioni.
 */
function alternative(route) {
  if (route.name === 'notfound') return []
  return [
    ...LINGUE.map((l) => ({ lang: l, href: SITE + percorsoTradotto(route, l) })),
    { lang: 'x-default', href: SITE + percorsoTradotto(route, 'it') },
  ]
}

export function metaForRoute(route) {
  const lang = route.lang || 'it'
  const T = testi(lang)
  const p = profiloIn(lang)
  const comuni = { lang, htmlLang: T.htmlLang, ogLocale: T.ogLocale, alternate: alternative(route) }

  if (route.name === 'archive') {
    // Pagina d'area: /archivio/product-design, /en/archive/graphic-design.
    const area = route.area ? areaPerSlugIn(route.area, lang) : null
    if (area) {
      const progetti = progettiAreaIn(area.chiave, lang)
      return {
        ...comuni,
        title: T.seo.areaTitolo(area.label, FIRMA),
        description: clip(
          T.seo.areaDesc(
            contaProgetti(progetti.length, lang),
            area.label.toLowerCase(),
            FIRMA,
            periodoTesto(periodoDi(progetti)),
            area.desc,
          ),
        ),
        canonical: url('archive', { area: area.slug }, lang),
        image: ogImage(`archivio-${area.slug}`, lang),
        imageAlt: T.seo.areaImmagineAlt(area.label, p.displayName),
        type: 'website',
        area,
      }
    }

    return {
      ...comuni,
      title: T.seo.archivioTitolo(FIRMA),
      description: T.seo.archivioDesc(archivioIn(lang).length, FIRMA, PERIODO),
      canonical: url('archive', {}, lang),
      image: ogImage('archivio', lang),
      imageAlt: T.seo.areaImmagineAlt(T.seo.archivioNome, p.displayName),
      type: 'website',
    }
  }

  if (route.name === 'about') {
    const about = aboutIn(lang)
    return {
      ...comuni,
      title: T.seo.chiSonoTitolo(FIRMA, p.role),
      description: clip(about.intro),
      canonical: url('about', {}, lang),
      image: ogImage('chi-sono', lang),
      imageAlt: about.photos.lab.alt,
      preload: about.photos.hero.src, // elemento più grande della pagina
      type: 'profile',
    }
  }

  if (route.name === 'project') {
    const item = archivioIn(lang).find((x) => x.slug === route.slug)
    if (item) {
      const { cover, gallery } = projectImages(item)
      // Senza copertina non c'è nemmeno l'anteprima social della scheda:
      // il link condiviso porta quella dell'area, non un riquadro vuoto.
      const areaItem = areeIn(lang).find((a) => a.chiave === areaDi(item))
      return {
        ...comuni,
        title: titoloProgetto(item),
        description: clip(descrizioneProgetto(item, lang)),
        canonical: url('project', { slug: item.slug }, lang),
        image: ogImage(cover ? item.slug : `archivio-${areaItem.slug}`, lang),
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
      ...comuni,
      title: T.seo.nonTrovataTitolo(FIRMA),
      description: T.seo.nonTrovataDesc(FIRMA),
      image: ogImage('home', lang),
      imageAlt: aboutIn(lang).photos.hero.alt,
      type: 'website',
      noindex: true,
    }
  }

  // Nome, ruolo e città: le chiavi delle ricerche realistiche.
  return {
    ...comuni,
    title: T.seo.homeTitolo(FIRMA, p.role),
    description: T.seo.homeDesc(FIRMA, p.role, p.place, PERIODO),
    canonical: url('home', {}, lang),
    image: ogImage('home', lang),
    imageAlt: aboutIn(lang).photos.hero.alt,
    type: 'website',
  }
}

/* Tutte le pagine da generare: le stesse rotte in tutte e due le lingue. */
export function allRoutes() {
  return LINGUE.flatMap((lang) => [
    percorso('home', {}, lang),
    percorso('about', {}, lang),
    percorso('archive', {}, lang),
    ...areeIn(lang).map((a) => percorso('archive', { area: a.slug }, lang)),
    ...archivioIn(lang).map((p) => percorso('project', { slug: p.slug }, lang)),
  ])
}

/* ─────────────────────────── Dati strutturati ─────────────────────────── */

/*
 * Un grafo per pagina. Le entità hanno un `@id` stabile e si richiamano invece
 * di ridescriversi: così tutte le schede risultano di una persona sola, e non
 * di venticinque omonimi.
 *
 * Sito e persona hanno un `@id` unico anche fra le due lingue — la persona è
 * la stessa, e sdoppiarla darebbe due designer omonimi. Cambia solo il testo
 * con cui ogni pagina la descrive. Le raccolte e le opere, che sono pagine,
 * hanno invece un `@id` per lingua: sono due URL distinti e indicizzabili.
 */
const ID_SITO = `${SITE}/#sito`
const ID_PERSONA = `${SITE}/#persona`
const idArchivio = (lang) => `${url('archive', {}, lang)}#raccolta`

/* `sameAs` lega il nome ai profili: vanno elencati tutti. */
const SOCIAL = [profile.instagram, profile.youtube, profile.tiktok, profile.linkedin].filter(
  Boolean,
)

function nodoSito(lang) {
  const T = testi(lang)
  const p = profiloIn(lang)
  return {
    '@type': 'WebSite',
    '@id': ID_SITO,
    url: `${SITE}/`,
    name: `${profile.name} “${profile.nick}”`,
    description: T.seo.sitoDesc(p.name, p.role, p.place),
    inLanguage: T.schemaLang,
    publisher: { '@id': ID_PERSONA },
  }
}

function nodoPersona(lang) {
  const p = profiloIn(lang)
  const about = aboutIn(lang)
  return {
    '@type': 'Person',
    '@id': ID_PERSONA,
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
    alumniOf: { '@type': 'CollegeOrUniversity', name: p.formazione },
    hasOccupation: {
      '@type': 'Occupation',
      name: p.role,
      occupationLocation: { '@type': 'City', name: p.place.split(',')[0].trim() },
    },
    // Discipline più gli strumenti, che `about.skills` tiene già aggiornati.
    knowsAbout: [...testi(lang).seo.discipline, ...about.skills],
    sameAs: SOCIAL,
  }
}

function nodoProgetto(item, meta) {
  const { cover, gallery, drawing } = projectImages(item)
  const nome = titoloLeggibile(item.title)
  const anni = String(item.year || '').match(/\d{4}/g)
  // `spec` cambia lingua e con essa le chiavi: il materiale è la seconda voce
  // in italiano e in inglese, e va cercato per l'una o per l'altra.
  const materiale = item.spec?.Materiale || item.spec?.Material

  return {
    '@type': 'CreativeWork',
    '@id': `${meta.canonical}#opera`,
    name: nome,
    description: meta.description,
    url: meta.canonical,
    inLanguage: testi(meta.lang).schemaLang,
    // La copertina per prima: è quella che finisce accanto al risultato.
    image: [cover, ...gallery, drawing].filter(Boolean).map(abs),
    ...(anni ? { dateCreated: anni[anni.length - 1] } : {}),
    ...(materiale ? { material: materiale } : {}),
    keywords: [...new Set([item.cat, ...Object.values(item.spec || {})])].join(', '),
    creator: { '@id': ID_PERSONA },
    isPartOf: { '@id': idArchivio(meta.lang) },
    mainEntityOfPage: meta.canonical,
  }
}

/*
 * Copia essenziale del nodo archivio. Le schede e le pagine d'area dichiarano
 * `isPartOf` verso l'archivio della loro lingua, ma quel nodo è descritto per
 * intero solo in /archivio: senza questa copia il rimando resterebbe a vuoto,
 * e un validatore lo segnala. Poche righe, e ogni @id citato nella pagina è
 * anche definito.
 */
function rimandoArchivio(lang) {
  return {
    '@type': 'CollectionPage',
    '@id': idArchivio(lang),
    url: url('archive', {}, lang),
    name: testi(lang).seo.archivioNome,
    isPartOf: { '@id': ID_SITO },
  }
}

/* Sito e persona ci sono sempre, più l'entità propria della pagina. */
export function schemaForRoute(route, meta) {
  const lang = meta.lang || 'it'
  const T = testi(lang)
  const grafo = [nodoSito(lang), nodoPersona(lang)]
  const briciole = (voci) => ({ '@type': 'BreadcrumbList', itemListElement: voci })

  if (route.name === 'project') {
    const item = archivioIn(lang).find((p) => p.slug === route.slug)
    if (item) {
      const area = areeIn(lang).find((a) => a.chiave === areaDi(item))
      grafo.push(rimandoArchivio(lang), nodoProgetto(item, meta), briciole([
        { '@type': 'ListItem', position: 1, name: T.seo.briciolaHome, item: url('home', {}, lang) },
        {
          '@type': 'ListItem',
          position: 2,
          name: T.seo.briciolaArchivio,
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
        { '@type': 'ListItem', position: area ? 4 : 3, name: titoloLeggibile(item.title) },
      ]))
    }
  } else if (route.name === 'archive') {
    // La pagina d'area è una raccolta a sé, parte dell'archivio.
    const area = meta.area
    const progetti = area ? progettiAreaIn(area.chiave, lang) : archivioIn(lang)
    if (area) grafo.push(rimandoArchivio(lang))
    grafo.push({
      '@type': 'CollectionPage',
      '@id': area ? `${meta.canonical}#raccolta` : idArchivio(lang),
      url: meta.canonical,
      name: area ? T.seo.areaNome(area.label) : T.seo.archivioNome,
      description: meta.description,
      inLanguage: T.schemaLang,
      isPartOf: { '@id': area ? idArchivio(lang) : ID_SITO },
      about: { '@id': ID_PERSONA },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: progetti.length,
        itemListElement: progetti.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: url('project', { slug: p.slug }, lang),
          name: titoloLeggibile(p.title),
        })),
      },
    })
    if (area) {
      grafo.push(
        briciole([
          {
            '@type': 'ListItem',
            position: 1,
            name: T.seo.briciolaHome,
            item: url('home', {}, lang),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: T.seo.briciolaArchivio,
            item: url('archive', {}, lang),
          },
          { '@type': 'ListItem', position: 3, name: area.label },
        ]),
      )
    }
  } else if (route.name === 'about') {
    grafo.push({
      '@type': 'ProfilePage',
      '@id': `${url('about', {}, lang)}#pagina`,
      url: url('about', {}, lang),
      name: meta.title,
      inLanguage: T.schemaLang,
      isPartOf: { '@id': ID_SITO },
      mainEntity: { '@id': ID_PERSONA },
    })
  }

  return { '@context': 'https://schema.org', '@graph': grafo }
}

/*
 * Per un portfolio Google Immagini vale quanto la ricerca per testo: senza
 * queste righe le foto si scoprono solo passando dalla pagina che le ospita.
 *
 * Prende la rotta già interpretata: le stesse immagini valgono per entrambe le
 * lingue, ma ogni URL dichiara le proprie — la pagina inglese è una pagina a
 * sé, e in sitemap deve portarsi dietro le sue.
 */
export function immaginiPerRotta(route) {
  const lang = route.lang || 'it'

  /*
   * Solo `familyBand`: il ritratto in cima alla home è decorativo e ha `alt`
   * vuoto per questo. Dichiararlo qui lo proporrebbe a Google Immagini senza la
   * descrizione che Google si aspetta di trovare nell'alt — un'immagine muta in
   * un indice che vive di didascalie.
   */
  if (route.name === 'home') return [familyBand.src].map(abs)

  if (route.name === 'about') {
    const about = aboutIn(lang)
    const tavole = about.sketchbook.flatMap((t) => [t.front?.src, t.back?.src])
    return [about.photos.hero.src, about.photos.lab.src, ...tavole].filter(Boolean).map(abs)
  }

  const copertine = (lista) =>
    lista.map((p) => projectImages(p).cover).filter(Boolean).map(abs)

  if (route.name === 'archive') {
    if (!route.area) return copertine(archivioIn(lang))
    const area = areaPerSlugIn(route.area, lang)
    return area ? copertine(progettiAreaIn(area.chiave, lang)) : []
  }

  if (route.name !== 'project') return []
  const item = archivioIn(lang).find((p) => p.slug === route.slug)
  if (!item) return []
  const { cover, gallery, drawing, sfondo } = projectImages(item)
  return [cover, ...gallery, drawing, sfondo].filter(Boolean).map(abs)
}
