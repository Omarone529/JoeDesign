import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/*
 * Router minimale basato sui path reali dell'URL (History API) - nessuna
 * dipendenza esterna. Sostituisce il vecchio hash routing, che impediva sia
 * la SEO sia il pre-rendering per pagina.
 *   /                 → Indice (home)
 *   /chi-sono         → Chi sono
 *   /archivio         → Archivio
 *   /progetto/<slug>  → Scheda progetto
 *
 * Funziona sia nel browser sia in fase di build (SSR/pre-rendering): in SSR
 * riceve `initialPath` e non tocca mai `window`.
 */
export function parsePath(pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/'
  if (p === '/chi-sono') return { name: 'about', path: '/chi-sono' }
  if (p === '/archivio') return { name: 'archive', path: '/archivio' }
  if (p.startsWith('/progetto/')) {
    return {
      name: 'project',
      slug: decodeURIComponent(p.slice('/progetto/'.length)),
      path: p,
    }
  }
  return { name: 'home', path: '/' }
}

const RouterContext = createContext(null)

export function RouterProvider({ initialPath = '/', children }) {
  const [path, setPath] = useState(initialPath)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    // Allinea lo stato al path reale dopo l'hydration.
    setPath(window.location.pathname)
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

  return (
    <RouterContext.Provider value={{ route: parsePath(path), navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRoute() {
  return useContext(RouterContext).route
}

export function useNavigate() {
  return useContext(RouterContext).navigate
}

/* Un link è "esterno" (anchor normale) se non è un path interno. */
function isExternal(to) {
  return typeof to !== 'string' || !to.startsWith('/')
}

/*
 * Link di navigazione. Per i path interni fa navigazione client-side senza
 * ricaricare la pagina; per mailto/tel/#/URL esterni resta un <a> normale.
 */
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
