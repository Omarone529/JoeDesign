import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { archive, areaPerSlug } from './data/siteData'
import { LINGUA_PREDEFINITA, normalizzaLingua } from './i18n'

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
 *   /  ·  /chi-sono  ·  /archivio  ·  /archivio/<area>  ·  /progetto/<slug>
 *   /en  ·  /en/about  ·  /en/archive  ·  /en/archive/<area>  ·  /en/project/<slug>
 *   ·  altro → 404
 *
 * Lo slug dell'area (product-design) e quello del progetto non cambiano fra le
 * due lingue: sono nomi propri, e tradurli spezzerebbe i link già in giro.
 */
const SEGMENTI = {
  it: { about: 'chi-sono', archive: 'archivio', project: 'progetto' },
  en: { about: 'about', archive: 'archive', project: 'project' },
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

  // Prefisso di lingua: /en, /en/... — tutto il resto è italiano.
  const inglese = intero === '/en' || intero.startsWith('/en/')
  const lang = inglese ? 'en' : LINGUA_PREDEFINITA
  const p = inglese ? intero.slice(3) || '/' : intero
  const seg = SEGMENTI[lang]

  if (p === '/') return { name: 'home', lang, path: intero }
  if (p === `/${seg.about}`) return { name: 'about', lang, path: intero }
  if (p === `/${seg.archive}`) return { name: 'archive', area: null, lang, path: intero }
  if (p.startsWith(`/${seg.archive}/`)) {
    const slug = decodeURIComponent(p.slice(seg.archive.length + 2))
    // Area inesistente → 404, non una griglia vuota.
    if (areaPerSlug(slug)) return { name: 'archive', area: slug, lang, path: intero }
  }
  if (p.startsWith(`/${seg.project}/`)) {
    const slug = decodeURIComponent(p.slice(seg.project.length + 2))
    // Slug non in archivio → 404, non una scheda vuota.
    if (archive.some((item) => item.slug === slug)) {
      return { name: 'project', slug, lang, path: intero }
    }
  }
  // 404 (Netlify la serve con lo status giusto). La lingua resta quella del
  // prefisso: chi sbaglia un indirizzo sotto /en vede la 404 in inglese.
  return { name: 'notfound', lang, path: intero }
}

const RouterContext = createContext(null)

export function RouterProvider({ initialPath = '/', children }) {
  const [path, setPath] = useState(initialPath)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    // Fra il primo render e l'attacco del listener un popstate passerebbe
    // inosservato (indietro premuto prima dell'hydration): qui si recupera.
    // Restituire lo stesso valore quando coincide evita un render in più.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPath((corrente) =>
      corrente === window.location.pathname ? corrente : window.location.pathname,
    )
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    if (typeof window === 'undefined') return
    if (to !== window.location.pathname) {
      window.history.pushState(null, '', to)
    }
    setPath(to)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  // parsePath scorre l'archivio, e un value nuovo ri-renderizzerebbe ogni <Link>.
  const value = useMemo(() => ({ route: parsePath(path), navigate }), [path, navigate])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRoute() {
  return useContext(RouterContext).route
}

export function useNavigate() {
  return useContext(RouterContext).navigate
}

/* La lingua della pagina aperta: la dice l'URL, non uno stato del browser. */
export function useLang() {
  return useContext(RouterContext).route.lang
}

function isExternal(to) {
  return typeof to !== 'string' || !to.startsWith('/')
}

/* Client-side per i path interni, <a> normale per mailto/tel/esterni. */
export function Link({ to, children, onClick, target, ...props }) {
  const ctx = useContext(RouterContext)

  if (isExternal(to)) {
    return (
      <a href={to} onClick={onClick} target={target} {...props}>
        {children}
      </a>
    )
  }

  const handleClick = (e) => {
    if (onClick) onClick(e)
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      target
    ) {
      return
    }
    e.preventDefault()
    ctx.navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
