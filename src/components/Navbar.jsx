import { Fragment, useEffect, useState } from 'react'
import { profile } from '../data/siteData'
import { LINGUE, testi } from '../i18n'
import { Link, percorso, percorsoTradotto } from '../router'

const SOGLIA = 96 // px di scorrimento sotto i quali la barra resta comunque visibile
const MOVIMENTO_MINIMO = 6 // px di soglia contro micro-scostamenti e rimbalzo elastico

// Parte visibile perché è così nell'HTML statico: altrimenti mismatch in
// hydration. Lo scroll è accorpato in rAF, un render al massimo per frame.
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

  // Riesposta a ogni navigazione. Corretta durante il render e non in un
  // effetto, o si vedrebbe un frame con la pagina nuova e la barra nascosta.
  const [rottaPrec, setRottaPrec] = useState(route)
  if (route !== rottaPrec) {
    setRottaPrec(route)
    setNascosta(false)
  }

  return [nascosta, setNascosta]
}

// Sottolineatura ancorata allo span interno, in assoluto: resta attaccata alla
// parola e non sposta il testo.
function NavLink({ to, active = false, children }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className="group whitespace-nowrap py-2.5 text-[10px] uppercase tracking-[0.08em] text-ink transition-colors sm:py-2 sm:tracking-[0.14em] md:tracking-[0.16em] lg:text-[11px] lg:tracking-[0.2em]"
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

// Occupa i suoi 4rem anche da nascosta: su quella misura è tarata la hero in About.
export default function Navbar({ route }) {
  const name = route?.name ?? 'home'
  const lang = route?.lang ?? 'it'
  const T = testi(lang)
  // Sulla `path` e non sul nome: cambiando lingua la rotta resta la stessa, e
  // la barra deve riesporsi lo stesso.
  const [nascosta, setNascosta] = useNavbarNascosta(route?.path ?? '/')

  const links = [
    { label: T.nav.home, to: percorso('home', {}, lang), active: name === 'home' },
    {
      label: T.nav.archivio,
      to: percorso('archive', {}, lang),
      active: name === 'archive' || name === 'project',
    },
    { label: T.nav.chiSono, to: percorso('about', {}, lang), active: name === 'about' },
  ]

  return (
    <header
      onFocusCapture={() => setNascosta(false)}
      className={`sticky top-0 z-50 border-b border-ink bg-paper/90 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
        nascosta ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Sotto md il gruppo di destra è `contents`, così `justify-between` distribuisce menù, IG e lingue. */}
      <div className="relative flex h-16 items-center justify-between gap-3 px-5 sm:px-8 lg:px-[72px]">
        <Link
          to={percorso('home', {}, lang)}
          aria-label={T.nav.logo}
          className="flex shrink-0 items-center"
        >
          <img
            src="/images/navbar/logo.webp"
            alt=""
            width="36"
            height="36"
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
        </Link>

        {/* Nome visibile da sm, centrato da md: sul telefono la barra tiene solo la navigazione. */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex sm:gap-2.5 md:absolute md:left-1/2 md:-translate-x-1/2">
          <span className="hidden whitespace-nowrap text-[13px] font-bold uppercase tracking-[-0.05em] sm:inline-block sm:text-[15px] sm:tracking-[-0.06em] lg:text-[17px] lg:tracking-[-0.075em]">
            {profile.displayName}
          </span>
          <LinkInstagram lang={lang} className="hidden sm:flex" />
        </div>

        <div className="contents md:flex md:shrink-0 md:items-center md:gap-5 lg:gap-8">
          <nav className="flex shrink-0 items-center gap-4 sm:gap-5 md:gap-6 lg:gap-10">
            {links.map((l) => (
              <NavLink key={l.label} to={l.to} active={l.active}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          {/* Sotto i 360px cade: i suoi quindici pixel mandano "CHI SONO" fuori schermo. */}
          <LinkInstagram lang={lang} className="hidden min-[360px]:flex sm:hidden" />
          <SelettoreLingua route={route} />
        </div>
      </div>
    </header>
  )
}

// `before` allarga il bersaglio dell'icona. Compare due volte, mai insieme (sm e sotto sm).
function LinkInstagram({ lang, className = '' }) {
  return (
    <a
      href={profile.instagram}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={testi(lang).nav.instagram(profile.handle)}
      className={`relative shrink-0 items-center text-ink transition-colors hover:text-muted before:absolute before:-inset-1.5 before:content-[''] ${className}`}
    >
      <LogoInstagram className="h-[15px] w-[15px] sm:h-[17px] sm:w-[17px] lg:h-[19px] lg:w-[19px]" />
    </a>
  )
}

// Le lingue sono due link alla pagina gemella, non un interruttore. Visibili entrambe.
function SelettoreLingua({ route }) {
  const attuale = route?.lang ?? 'it'

  return (
    <div
      aria-label={testi(attuale).nav.lingua}
      className="flex shrink-0 items-center gap-1 border-l border-line pl-2 text-[10px] uppercase tracking-[0.08em] sm:gap-1.5 sm:pl-3 sm:tracking-[0.14em] lg:text-[11px]"
    >
      {LINGUE.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span aria-hidden="true" className="pointer-events-none text-line">
              /
            </span>
          )}
          <Link
            to={percorsoTradotto(route, l)}
            hrefLang={l}
            aria-current={l === attuale ? 'true' : undefined}
            className={`relative py-2 transition-colors before:absolute before:-inset-x-2 before:content-[''] ${
              l === attuale ? 'font-bold text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {l}
          </Link>
        </Fragment>
      ))}
    </div>
  )
}

/* Tratto leggero: a 15–19px uno pieno annerirebbe il segno. */
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
