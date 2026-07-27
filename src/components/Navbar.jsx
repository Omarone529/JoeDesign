import { useEffect, useState } from 'react'
import { profile } from '../data/siteData'
import { Link } from '../router'

const SOGLIA = 96 // px di scorrimento sotto i quali la barra resta comunque visibile
const MOVIMENTO_MINIMO = 6 // px di soglia contro micro-scostamenti e rimbalzo elastico

/*
 * Nasconde la barra scorrendo giù, la ripristina scorrendo su. Parte visibile
 * (è ciò che c'è nell'HTML statico: evita un mismatch in hydration). Scroll
 * passivo accorpato in rAF: un render al massimo per frame.
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
 * Voce di navigazione. Padding sul link (area di tocco più ampia del testo);
 * sottolineatura ancorata allo span interno per restare attaccata alla parola,
 * in assoluto così non sposta il testo. Compare su pagina attiva e in hover.
 */
function NavLink({ to, active = false, children }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className="group whitespace-nowrap py-2 text-[9px] uppercase tracking-[0.06em] text-ink transition-colors sm:text-[10px] sm:tracking-[0.14em] md:tracking-[0.16em] lg:text-[11px] lg:tracking-[0.2em]"
    >
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 -bottom-1 h-0.5 origin-left bg-ink transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] ${
            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
      </span>
    </Link>
  )
}

/*
 * Barra sticky condivisa: occupa i suoi 4rem anche da nascosta (misura su cui
 * è tarata la hero in About). La voce attiva deriva dalla rotta.
 */
export default function Navbar({ route }) {
  const name = route?.name ?? 'home'
  const [nascosta, setNascosta] = useNavbarNascosta(name)

  // Solo le tre rotte: i recapiti stanno nel footer.
  const links = [
    { label: 'Home', to: '/', active: name === 'home' },
    { label: 'Archivio', to: '/archivio', active: name === 'archive' || name === 'project' },
    { label: 'Chi sono', to: '/chi-sono', active: name === 'about' },
  ]

  return (
    <header
      onFocusCapture={() => setNascosta(false)}
      className={`sticky top-0 z-50 border-b border-ink bg-paper/90 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
        nascosta ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="relative flex h-16 items-center justify-between gap-2 px-5 sm:px-8 lg:px-[72px]">
        <Link to="/" aria-label="Joe Sarchiolla — home" className="flex shrink-0 items-center">
          <img
            src="/images/navbar/logo.webp"
            alt=""
            width="36"
            height="36"
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
        </Link>

        {/* Nome + marchio Instagram. Centrato solo da md: sotto non ci starebbe
            e resta in linea nel flusso (justify-between). */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 md:absolute md:left-1/2 md:-translate-x-1/2">
          <span className="whitespace-nowrap text-[11px] font-normal uppercase tracking-[0.1em] sm:text-[13px] sm:tracking-[0.14em] lg:text-[15px] lg:tracking-[0.18em]">
            {profile.displayName}
          </span>
          <a
            href={profile.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${profile.handle} su Instagram`}
            className="flex shrink-0 items-center text-ink transition-colors hover:text-muted"
          >
            <LogoInstagram className="h-[15px] w-[15px] sm:h-[17px] sm:w-[17px] lg:h-[19px] lg:w-[19px]" />
          </a>
        </div>

        <nav className="flex shrink-0 items-center gap-2 sm:gap-5 md:gap-6 lg:gap-10">
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

/*
 * Marchio Instagram al tratto in `currentColor` (segue il testo accanto),
 * spessore leggero perché a 15–19px un tratto pieno annerirebbe il segno.
 * Decorativo: dove porta lo dice l'`aria-label` del link.
 */
function LogoInstagram({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5.4" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
