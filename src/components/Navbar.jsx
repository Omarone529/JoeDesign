import { useEffect, useState } from 'react'
import { Link } from '../router'

const SOGLIA = 96 // px di scorrimento sotto i quali la barra resta comunque visibile
const MOVIMENTO_MINIMO = 6 // px di soglia contro micro-scostamenti e rimbalzo elastico

/*
 * Nasconde la barra scorrendo verso il basso, la ripristina scorrendo in su.
 *
 * Lo stato parte da "visibile" perché è quello che finisce nell'HTML statico:
 * un valore diverso creerebbe un disallineamento in idratazione. Gli eventi di
 * scroll sono passivi e accorpati in un requestAnimationFrame, così un render
 * al massimo per frame.
 */
function useNavbarNascosta(route) {
  const [nascosta, setNascosta] = useState(false)

  useEffect(() => {
    let ultimaY = window.scrollY
    let inCoda = false

    const aggiorna = () => {
      const y = window.scrollY
      const delta = y - ultimaY
      if (Math.abs(delta) > MOVIMENTO_MINIMO) {
        setNascosta(delta > 0 && y > SOGLIA)
        ultimaY = y
      }
      inCoda = false
    }

    const onScroll = () => {
      if (inCoda) return
      inCoda = true
      requestAnimationFrame(aggiorna)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Il router riporta in cima a ogni navigazione: la barra va riesposta.
  useEffect(() => setNascosta(false), [route])

  return [nascosta, setNascosta]
}

/*
 * Voce di navigazione. La sottolineatura è posizionata in assoluto
 * (non occupa spazio nel flusso): compare sulla pagina attiva e in hover,
 * senza mai spostare il testo. Animata da sinistra a destra.
 */
function NavLink({ to, active = false, children }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className="group relative whitespace-nowrap py-1 text-[10px] uppercase tracking-[0.1em] text-ink transition-colors sm:text-[11px] sm:tracking-[0.2em]"
    >
      {children}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-left bg-ink transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  )
}

/*
 * Barra di navigazione condivisa. Sticky: resta nel flusso e occupa i suoi 4rem
 * anche da nascosta, misura su cui è tarata l'altezza della hero in About.
 * La voce attiva deriva dalla rotta corrente.
 */
export default function Navbar({ route }) {
  const name = route?.name ?? 'home'
  const [nascosta, setNascosta] = useNavbarNascosta(name)
  const links = [
    { label: 'Home', to: '/', active: name === 'home' },
    { label: 'Archivio', to: '/archivio', active: name === 'archive' || name === 'project' },
    { label: 'Chi sono', to: '/chi-sono', active: name === 'about' },
  ]

  return (
    <header
      // Navigazione da tastiera: il focus su una voce deve poter riesporre la barra.
      onFocusCapture={() => setNascosta(false)}
      className={`sticky top-0 z-50 border-b border-ink bg-paper/90 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
        nascosta ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-[72px]">
        {/* Brand */}
        <Link to="/" className="flex shrink-0 items-baseline gap-3">
          {/* Sotto sm corpo e tracking ridotti: a piena misura marchio e voci
              non stanno nella larghezza di un telefono */}
          <span className="whitespace-nowrap text-[15px] font-bold tracking-[0.08em] sm:text-[19px] sm:tracking-[0.14em]">
            SARCHIOLLA
          </span>
          <span className="hidden text-[9px] tracking-[0.24em] text-muted sm:inline">
            STUDIO · IT
          </span>
        </Link>

        {/* Navigazione */}
        <nav className="flex items-center gap-3 sm:gap-6 lg:gap-10">
          {links.map((l) => (
            <NavLink key={l.label} to={l.to} active={l.active}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
