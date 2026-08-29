import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { archive, areaPerSlug } from './data/siteData'

/*
 * Router minimale su path reali (History API), niente dipendenze: l'hash
 * routing impediva SEO e pre-rendering. Funziona anche in SSR, dove riceve
 * `initialPath` e non tocca mai `window`.
 *   /  ·  /chi-sono  ·  /archivio  ·  /archivio/<area>  ·  /progetto/<slug>
 *   ·  altro → 404
 */
export function parsePath(pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/'
  if (p === '/') return { name: 'home', path: '/' }
  if (p === '/chi-sono') return { name: 'about', path: '/chi-sono' }
  if (p === '/archivio') return { name: 'archive', area: null, path: '/archivio' }
  if (p.startsWith('/archivio/')) {
    const slug = decodeURIComponent(p.slice('/archivio/'.length))
    // Area inesistente → 404, non una griglia vuota.
    if (areaPerSlug(slug)) return { name: 'archive', area: slug, path: p }
  }
  if (p.startsWith('/progetto/')) {
    const slug = decodeURIComponent(p.slice('/progetto/'.length))
    // Slug non in archivio → 404, non una scheda vuota.
    if (archive.some((item) => item.slug === slug)) {
      return { name: 'project', slug, path: p }
    }
  }
  // 404 (Netlify la serve con lo status giusto).
  return { name: 'notfound', path: p }
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
