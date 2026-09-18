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
import { parsePath } from './routes'

// Parte React del routing. Gli indirizzi stanno in routes.js (senza React), riesportati qui.
export { parsePath, pathFor, translatedPath } from './routes'

const RouterContext = createContext(null)

// useLayoutEffect nel browser (scroll ripristinato prima del paint), useEffect in SSR.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function RouterProvider({ initialPath = '/', children }) {
  const [path, setPath] = useState(initialPath)
  // In transizione: la pagina vecchia resta in vista finché il file della nuova non arriva.
  const [, startTransition] = useTransition()
  const changePath = useCallback((p) => startTransition(() => setPath(p)), [])
  // Applicato a pagina nuova in vista: quello del browser arriva prima del render e sbaglia.
  const scrollToRestore = useRef(null)

  useEffect(() => {
    if (!window.history.scrollRestoration) return
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useEffect(() => {
    const onPop = (e) => {
      scrollToRestore.current = e.state?.scrollY ?? 0
      changePath(window.location.pathname)
    }
    window.addEventListener('popstate', onPop)
    // Recupera un popstate arrivato prima dell'hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPath((current) =>
      current === window.location.pathname ? current : window.location.pathname,
    )
    return () => window.removeEventListener('popstate', onPop)
  }, [changePath])

  const navigate = useCallback((to) => {
    if (typeof window === 'undefined') return
    // Ultimo momento per salvarla nella voce che si lascia: dopo il pushState è un'altra.
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '')
    if (to === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    window.history.pushState({ scrollY: 0 }, '', to)
    scrollToRestore.current = 0
    changePath(to)
  }, [changePath])

  // Alla prima apertura non c'è niente da ripristinare.
  useIsomorphicLayoutEffect(() => {
    const y = scrollToRestore.current
    if (y === null) return
    scrollToRestore.current = null
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
