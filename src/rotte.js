/*
 * Le estensioni `.js` sono esplicite di proposito. Dentro il sito le
 * risolverebbe Vite anche senza, ma questo file lo legge anche Node — i test e
 * gli script — e Node le pretende. È la stessa scelta già fatta in
 * `data/siteData.js`.
 */
import { archive, areaPerSlug } from './data/siteData.js'
import { LINGUA_PREDEFINITA, normalizzaLingua } from './i18n.js'

/*
 * Router minimale su path reali (History API), niente dipendenze: l'hash
 * routing impediva SEO e pre-rendering. Funziona anche in SSR, dove riceve
 * `initialPath` e non tocca mai `window`.
 *
 * Il sito è bilingue e ogni pagina ha due indirizzi reali, uno per lingua:
 * l'italiano sta nella radice, l'inglese sotto /en. Non è uno stato salvato
 * nel browser ma parte dell'URL, perché una pagina inglese dev'essere
 * indicizzabile, condivisibile e apribile a freddo com'è quella italiana.
 *
 * Lo slug dell'area (product-design) e quello del progetto non cambiano fra le
 * due lingue: sono nomi propri, e tradurli spezzerebbe i link già in giro.
 */
const SEGMENTI = {
  it: { about: 'chi-sono', archive: 'archivio', project: 'progetto', privacy: 'privacy' },
  en: { about: 'about', archive: 'archive', project: 'project', privacy: 'privacy' },
}

const PREFISSO = { it: '', en: '/en' }

/* L'indirizzo di una pagina, nella lingua chiesta. Da usare in ogni <Link>. */
export function percorso(name, params = {}, lang = LINGUA_PREDEFINITA) {
  const l = normalizzaLingua(lang)
  const base = PREFISSO[l]
  const seg = SEGMENTI[l]
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
export function percorsoTradotto(route, lang) {
  if (!route || route.name === 'notfound') return percorso('home', {}, lang)
  return percorso(route.name, { area: route.area, slug: route.slug }, lang)
}

export function parsePath(pathname) {
  const intero = (pathname || '/').replace(/\/+$/, '') || '/'

  const inglese = intero === '/en' || intero.startsWith('/en/')
  const lang = inglese ? 'en' : LINGUA_PREDEFINITA
  const p = inglese ? intero.slice(3) || '/' : intero
  const seg = SEGMENTI[lang]

  if (p === '/') return { name: 'home', lang, path: intero }
  if (p === `/${seg.about}`) return { name: 'about', lang, path: intero }
  if (p === `/${seg.privacy}`) return { name: 'privacy', lang, path: intero }
  if (p === `/${seg.archive}`) return { name: 'archive', area: null, lang, path: intero }
  if (p.startsWith(`/${seg.archive}/`)) {
    const slug = decodeURIComponent(p.slice(seg.archive.length + 2))
    if (areaPerSlug(slug)) return { name: 'archive', area: slug, lang, path: intero }
  }
  if (p.startsWith(`/${seg.project}/`)) {
    const slug = decodeURIComponent(p.slice(seg.project.length + 2))
    if (archive.some((item) => item.slug === slug)) {
      return { name: 'project', slug, lang, path: intero }
    }
  }
  // 404 (Netlify la serve con lo status giusto). La lingua resta quella del
  // prefisso: chi sbaglia un indirizzo sotto /en vede la 404 in inglese.
  return { name: 'notfound', lang, path: intero }
}
