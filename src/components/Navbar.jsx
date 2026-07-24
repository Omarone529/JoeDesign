import { useEffect, useState } from 'react'
import { Link } from '../router'

const SOGLIA = 96 // px oltre i quali la barra può nascondersi
const MOVIMENTO_MINIMO = 6 // px: ignora i micro-scostamenti e il rimbalzo elastico

/*
 * Nasconde la barra quando si scorre verso il basso e la fa ricomparire appena
 * si torna su. Lo stato si aggiorna dentro un requestAnimationFrame, così lo
 * scroll non paga il costo del render a ogni evento.
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

  // Cambio pagina: il router riporta in cima, la barra deve tornare visibile.
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
 * Barra di navigazione condivisa.
 * Sticky con sfondo semi-trasparente e blur, bordo inferiore inchiostro.
 * Scorrendo verso il basso scompare verso l'alto, tornando su ricompare.
 * La voce attiva è evidenziata in base alla rotta corrente.
 * "Studio" verrà collegata quando la pagina sarà pronta.
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
      // Il focus da tastiera deve poter richiamare la barra anche da nascosta.
      onFocusCapture={() => setNascosta(false)}
      className={`sticky top-0 z-50 border-b border-ink bg-paper/90 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
        nascosta ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-[72px]">
        {/* Brand */}
        <Link to="/" className="flex shrink-0 items-baseline gap-3">
          {/* Da telefono corpo e spaziatura ridotti: sennò il marchio arriva addosso alle voci */}
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
