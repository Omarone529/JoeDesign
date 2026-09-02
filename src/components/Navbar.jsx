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

// Sottolineatura ancorata allo span interno per restare attaccata alla parola,
// e in assoluto per non spostare il testo.
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

        {/*
          Centrato solo da md: sotto non ci starebbe. E sotto `sm` non c'è
          proprio: il nome ripete quello che il marchio dice già, e Instagram
          sta nel piede — a spartirsi 320 pixel con tre voci di menù e le due
          lingue restava un rigo di caratteri da nove punti, illeggibile e
          impossibile da centrare col dito. Sulla barra di un telefono ci va la
          navigazione, il resto può aspettare lo schermo grande.
        */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 md:absolute md:left-1/2 md:-translate-x-1/2">
          <span className="hidden whitespace-nowrap text-[13px] font-bold uppercase tracking-[-0.05em] sm:inline-block sm:text-[15px] sm:tracking-[-0.06em] lg:text-[17px] lg:tracking-[-0.075em]">
            {profile.displayName}
          </span>
          <LinkInstagram lang={lang} className="hidden sm:flex" />
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4 md:gap-5 lg:gap-8">
          <nav className="flex shrink-0 items-center gap-3 sm:gap-5 md:gap-6 lg:gap-10">
            {links.map((l) => (
              <NavLink key={l.label} to={l.to} active={l.active}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          {/* Sotto i 360px cade: i suoi quindici pixel sono quelli che
              mandano "CHI SONO" fuori schermo. */}
          <LinkInstagram lang={lang} className="hidden min-[360px]:flex sm:hidden" />
          <SelettoreLingua route={route} />
        </div>
      </div>
    </header>
  )
}

/*
 * Compare due volte nella barra e mai insieme: da `sm` accanto al nome, sotto
 * in fondo alla riga (vedi il commento nel gruppo centrale). Quello nascosto
 * esce dal `display`, quindi per chi legge con la voce il link resta uno solo.
 */
function LinkInstagram({ lang, className = '' }) {
  return (
    <a
      href={profile.instagram}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={testi(lang).nav.instagram(profile.handle)}
      className={`shrink-0 items-center text-ink transition-colors hover:text-muted ${className}`}
    >
      <LogoInstagram className="h-[15px] w-[15px] sm:h-[17px] sm:w-[17px] lg:h-[19px] lg:w-[19px]" />
    </a>
  )
}

/*
 * Le due lingue sono due indirizzi, non un interruttore: ognuna è un link alla
 * gemella della pagina aperta, così restano condivisibili e apribili a freddo.
 * `hrefLang` dice al browser (e ai crawler) cosa aspettarsi dall'altra parte.
 *
 * Si vedono tutte e due, con la corrente in nero. Sul telefono prima ne
 * compariva una sola, per mancanza di spazio: ma "EN" da solo non dice se sei
 * in inglese o se ci vai, e lo spazio adesso c'è — la barra sotto `sm` non
 * porta più il nome né Instagram.
 */
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
            <span aria-hidden="true" className="text-line">
              /
            </span>
          )}
          <Link
            to={percorsoTradotto(route, l)}
            hrefLang={l}
            aria-current={l === attuale ? 'true' : undefined}
            className={`py-2 transition-colors ${
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
