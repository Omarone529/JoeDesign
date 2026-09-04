import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { parsePath } from './rotte'

/*
 * La parte React del routing: il contesto, la navigazione, `<Link>`.
 *
 * Il calcolo degli indirizzi — quali segmenti ha ogni pagina in ogni lingua, e
 * come si legge un URL — sta in `rotte.js`, che non importa React. È la stessa
 * ragione per cui `i18n.js` non importa niente: quelle funzioni le usano anche
 * `seo.js` e gli script node, che React non lo montano mai, e tenerle qui
 * dentro voleva dire trascinarsi appresso un albero di componenti per sapere
 * come si scrive "/chi-sono". Si rileggono anche da sole, il che è il motivo
 * per cui i test le raggiungono.
 *
 * Riesportate qui sotto: chi importa da `./router` continua a trovarle dov'erano.
 */
export { parsePath, percorso, percorsoTradotto } from './rotte'

const RouterContext = createContext(null)

/*
 * In pre-rendering non esiste un layout da misurare e React avviserebbe che
 * `useLayoutEffect` non ha effetto sul server. Nel browser serve quello e non
 * `useEffect`: il ripristino della posizione deve avvenire nello stesso
 * fotogramma in cui la pagina compare, o si vede il salto dall'alto.
 */
const useEffettoDiLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function RouterProvider({ initialPath = '/', children }) {
  const [path, setPath] = useState(initialPath)
  /*
   * Dove rimettere la pagina al prossimo render: un numero quando si torna
   * indietro, `null` quando si va avanti (che vuol dire "in cima").
   *
   * Il ripristino automatico del browser qui non funziona. Il browser lo
   * tenta prima che React abbia disegnato la pagina precedente — che è più
   * alta di quella che si sta lasciando — quindi trova un documento corto e
   * si ferma dove capita. Chiudendo una scheda progetto si tornava in cima
   * all'archivio invece che sulla cella da cui si era partiti, e con
   * venticinque celle vuol dire cercarla di nuovo.
   *
   * Funziona perché ogni riquadro d'immagine del sito riserva la propria
   * altezza prima di caricare (`aspect-…`, o `width`/`height` dichiarati):
   * al momento del ripristino la pagina è già alta quanto sarà. Togliendo
   * quelle proporzioni si rompe anche questo.
   */
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
      setPath(window.location.pathname)
    }
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
    // La posizione della pagina che si sta lasciando va scritta nella SUA voce
    // di cronologia, ed è l'ultimo momento in cui la si conosce: dopo il
    // pushState quella voce non è più quella corrente e non si può più toccare.
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '')
    if (to !== window.location.pathname) {
      window.history.pushState({ scrollY: 0 }, '', to)
    }
    scrollDaRipristinare.current = null
    setPath(to)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  // Solo tornando indietro o avanti: andando avanti `navigate` ha già portato
  // in cima, e alla prima apertura non c'è niente da ripristinare.
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
