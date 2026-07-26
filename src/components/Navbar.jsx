import { useEffect, useState } from 'react'
import { profile } from '../data/siteData'
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
 * Voce di navigazione. Il padding verticale sta sul link (area di tocco più
 * generosa del solo testo, che su mobile è di 9px), mentre la sottolineatura
 * è ancorata allo span interno: così resta attaccata alla parola invece di
 * scendere in fondo all'area cliccabile. È in assoluto e non occupa spazio nel
 * flusso: compare sulla pagina attiva e in hover, senza mai spostare il testo.
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
 * Barra di navigazione condivisa. Sticky: resta nel flusso e occupa i suoi 4rem
 * anche da nascosta, misura su cui è tarata l'altezza della hero in About.
 * La voce attiva deriva dalla rotta corrente.
 */
export default function Navbar({ route }) {
  const name = route?.name ?? 'home'
  const [nascosta, setNascosta] = useNavbarNascosta(name)

  /*
   * Solo le tre rotte del sito: i recapiti stanno in fondo a ogni pagina, nel
   * footer, e non hanno più una voce qui.
   */
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
        {/* Logo */}
        <Link to="/" aria-label="Joe Sarchiolla — home" className="flex shrink-0 items-center">
          <img
            src="/images/navbar/logo.webp"
            alt=""
            width="36"
            height="36"
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
        </Link>

        {/* Al posto del nome, il profilo Instagram: marchio e nome utente, che
            è il recapito pubblico di Joe. Tiene il posto che aveva il nome —
            centrato sulla pagina da md in su; sotto, logo + profilo + tre voci
            non entrano nella metà utile, quindi resta in linea nel flusso
            (spinto dal justify-between) invece di finire sotto le voci. */}
        <a
          href={profile.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${profile.handle} su Instagram`}
          className="group flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-normal tracking-[0.04em] sm:gap-2 sm:text-[13px] sm:tracking-[0.06em] md:absolute md:left-1/2 md:-translate-x-1/2 lg:text-[15px] lg:tracking-[0.1em]"
        >
          <LogoInstagram className="h-[13px] w-[13px] shrink-0 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
          <span className="relative">
            {profile.handle}
            {/* Stessa sottolineatura delle voci di navigazione, ancorata al
                testo: compare in hover senza spostare nulla. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-ink transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-x-100"
            />
          </span>
        </a>

        {/* Navigazione */}
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
 * Marchio Instagram disegnato al tratto, come la freccia obliqua della hero:
 * il quadrato con gli angoli tondi, l'obiettivo e il puntino in alto a destra.
 * Tratto in `currentColor`, quindi segue il colore del testo accanto, e spessore
 * leggero perché alle misure della barra (13–18px) un tratto pieno annerirebbe
 * il segno. Decorativo: il nome utente di fianco dice già dove porta.
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
