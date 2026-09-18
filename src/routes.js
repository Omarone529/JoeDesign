// Estensioni `.js` esplicite: questo file lo legge anche Node (test e script).
import { archive, areaBySlug } from './data/siteData.js'
import { DEFAULT_LANG, normalizeLang } from './i18n.js'

// Indirizzi nelle due lingue (italiano alla radice, inglese sotto /en). Gli slug non si traducono.
const SEGMENTS = {
  it: { about: 'chi-sono', archive: 'archivio', project: 'progetto', privacy: 'privacy' },
  en: { about: 'about', archive: 'archive', project: 'project', privacy: 'privacy' },
}

const PREFIX = { it: '', en: '/en' }

/* L'indirizzo di una pagina, nella lingua chiesta. Da usare in ogni <Link>. */
export function pathFor(name, params = {}, lang = DEFAULT_LANG) {
  const l = normalizeLang(lang)
  const base = PREFIX[l]
  const seg = SEGMENTS[l]
  switch (name) {
    case 'about':
      return `${base}/${seg.about}`
    case 'archive':
      return params.area ? `${base}/${seg.archive}/${params.area}` : `${base}/${seg.archive}`
    case 'project':
      return `${base}/${seg.project}/${params.slug}`
    // Unico segmento uguale nelle due lingue: "privacy" è la parola che si usa
    // anche in italiano, e tradurla darebbe un indirizzo che nessuno cerca.
    case 'privacy':
      return `${base}/${seg.privacy}`
    default:
      return base || '/'
  }
}

/* La stessa pagina nell'altra lingua: è il link del selettore in navbar e il
   valore degli hreflang. Una 404 non ha gemella: si va alla home. */
export function translatedPath(route, lang) {
  if (!route || route.name === 'notfound') return pathFor('home', {}, lang)
  return pathFor(route.name, { area: route.area, slug: route.slug }, lang)
}

export function parsePath(pathname) {
  const full = (pathname || '/').replace(/\/+$/, '') || '/'

  const english = full === '/en' || full.startsWith('/en/')
  const lang = english ? 'en' : DEFAULT_LANG
  const p = english ? full.slice(3) || '/' : full
  const seg = SEGMENTS[lang]

  if (p === '/') return { name: 'home', lang, path: full }
  if (p === `/${seg.about}`) return { name: 'about', lang, path: full }
  if (p === `/${seg.privacy}`) return { name: 'privacy', lang, path: full }
  if (p === `/${seg.archive}`) return { name: 'archive', area: null, lang, path: full }
  if (p.startsWith(`/${seg.archive}/`)) {
    const slug = decodeURIComponent(p.slice(seg.archive.length + 2))
    if (areaBySlug(slug)) return { name: 'archive', area: slug, lang, path: full }
  }
  if (p.startsWith(`/${seg.project}/`)) {
    const slug = decodeURIComponent(p.slice(seg.project.length + 2))
    if (archive.some((item) => item.slug === slug)) {
      return { name: 'project', slug, lang, path: full }
    }
  }
  // 404 (Netlify la serve con lo status giusto). La lingua resta quella del
  // prefisso: chi sbaglia un indirizzo sotto /en vede la 404 in inglese.
  return { name: 'notfound', lang, path: full }
}
