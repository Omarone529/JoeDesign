import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { archive } from './data/siteData'

/*
 * Router minimale basato sui path reali dell'URL (History API) - nessuna
 * dipendenza esterna. Sostituisce il vecchio hash routing, che impediva sia
 * la SEO sia il pre-rendering per pagina.
 *   /                 → Indice (home)
 *   /chi-sono         → Chi sono
 *   /archivio         → Archivio
 *   /progetto/<slug>  → Scheda progetto
 *   qualsiasi altro   → 404
 *
 * Funziona sia nel browser sia in fase di build (SSR/pre-rendering): in SSR
 * riceve `initialPath` e non tocca mai `window`.
 */
export function parsePath(pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/'
  if (p === '/') return { name: 'home', path: '/' }
  if (p === '/chi-sono') return { name: 'about', path: '/chi-sono' }
  if (p === '/archivio') return { name: 'archive', path: '/archivio' }
  if (p.startsWith('/progetto/')) {
    const slug = decodeURIComponent(p.slice('/progetto/'.length))
    // Solo gli slug presenti in archivio sono rotte vere: un progetto
    // inventato deve dare 404, non una scheda vuota.
    if (archive.some((item) => item.slug === slug)) {
      return { name: 'project', slug, path: p }
    }
  }
  // Indirizzo inesistente: pagina 404 (servita da Netlify con lo status giusto).
  return { name: 'notfound', path: p }
}

const RouterContext = createContext(null)

export function RouterProvider({ initialPath = '/', children }) {
  const [path, setPath] = useState(initialPath)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    // Allinea lo stato al path reale dopo l'hydration. Aggiorna solo se
    // differisce davvero: di norma coincide già con initialPath, e riscriverlo
    // costerebbe un render in più a ogni caricamento di pagina.
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

  /*
   * Memoizzato per due motivi: parsePath scorre l'archivio per validare lo
   * slug, e un valore nuovo a ogni render farebbe ri-renderizzare tutti i
   * consumatori del contesto (ogni <Link> della pagina) anche quando la rotta
   * non è cambiata. `navigate` è già stabile grazie a useCallback.
   */
  const value = useMemo(() => ({ route: parsePath(path), navigate }), [path, navigate])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
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
