import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { parsePath } from './rotte'

// Parte React del routing. Gli indirizzi stanno in rotte.js (senza React), riesportati qui.
export { parsePath, percorso, percorsoTradotto } from './rotte'

const RouterContext = createContext(null)

// useLayoutEffect nel browser (scroll ripristinato prima del paint), useEffect in SSR.
const useEffettoDiLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function RouterProvider({ initialPath = '/', children }) {
  const [path, setPath] = useState(initialPath)
  // In transizione: la pagina vecchia resta in vista finché il file della nuova non arriva.
  const [, avviaTransizione] = useTransition()
  const cambiaPath = useCallback((p) => avviaTransizione(() => setPath(p)), [])
  // Scroll da applicare quando la pagina nuova è in vista. Quello del browser
  // arriva prima del render e sbaglia. Regge perché le immagini riservano la loro altezza.
  const scrollDaRipristinare = useRef(null)

  useEffect(() => {
    if (!window.history.scrollRestoration) return
    const precedente = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = precedente
    }
  }, [])

  useEffect(() => {
    const onPop = (e) => {
      scrollDaRipristinare.current = e.state?.scrollY ?? 0
      cambiaPath(window.location.pathname)
    }
    window.addEventListener('popstate', onPop)
    // Recupera un popstate arrivato prima dell'hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPath((corrente) =>
      corrente === window.location.pathname ? corrente : window.location.pathname,
    )
    return () => window.removeEventListener('popstate', onPop)
  }, [cambiaPath])

  const navigate = useCallback((to) => {
    if (typeof window === 'undefined') return
    // La posizione va scritta nella voce di cronologia della pagina che si
    // lascia, ed è l'ultimo momento per farlo: dopo il pushState non è più quella corrente.
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '')
    if (to === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    window.history.pushState({ scrollY: 0 }, '', to)
    scrollDaRipristinare.current = 0
    cambiaPath(to)
  }, [cambiaPath])

  // Alla prima apertura non c'è niente da ripristinare.
  useEffettoDiLayout(() => {
    const y = scrollDaRipristinare.current
    if (y === null) return
    scrollDaRipristinare.current = null
    window.scrollTo(0, y)
  }, [path])

  // parsePath scorre l'archivio, e un value nuovo ri-renderizzerebbe ogni <Link>.
  const value = useMemo(() => ({ route: parsePath(path), navigate }), [path, navigate])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRoute() {
  return useContext(RouterContext).route
}

export function useLang() {
  return useContext(RouterContext).route.lang
}

function isExternal(to) {
  return typeof to !== 'string' || !to.startsWith('/')
}

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
