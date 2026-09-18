import { Fragment, useEffect, useState } from 'react'
import { profile } from '../data/siteData'
import { LANGS, texts } from '../i18n'
import { Link, pathFor, translatedPath } from '../router'

const THRESHOLD = 96 // px: sopra, la barra resta sempre visibile
const MIN_MOVEMENT = 6 // px: contro il rimbalzo elastico

// Parte visibile come nell'HTML statico, o l'aggancio non combacia.
function useNavbarHidden(route) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let queued = false

    const update = () => {
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) > MIN_MOVEMENT) {
        setHidden(delta > 0 && y > THRESHOLD)
        lastY = y
      }
      queued = false
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Durante il render e non in un effetto: niente frame con la pagina nuova e la barra nascosta.
  const [prevRoute, setPrevRoute] = useState(route)
  if (route !== prevRoute) {
    setPrevRoute(route)
    setHidden(false)
  }

  return [hidden, setHidden]
}

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
  const T = texts(lang)
  // Sulla `path`: cambiando lingua il nome della rotta non cambia.
  const [hidden, setHidden] = useNavbarHidden(route?.path ?? '/')

  const links = [
    { label: T.nav.home, to: pathFor('home', {}, lang), active: name === 'home' },
    {
      label: T.nav.archive,
      to: pathFor('archive', {}, lang),
      active: name === 'archive' || name === 'project',
    },
    { label: T.nav.about, to: pathFor('about', {}, lang), active: name === 'about' },
  ]

  return (
    <header
      onFocusCapture={() => setHidden(false)}
      className={`sticky top-0 z-50 border-b border-ink bg-paper/90 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Sotto md il gruppo di destra è `contents`, così `justify-between` distribuisce menù, IG e lingue. */}
      <div className="relative flex h-16 items-center justify-between gap-3 px-5 sm:px-8 lg:px-[72px]">
        <Link
          to={pathFor('home', {}, lang)}
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
          <LanguageSwitcher route={route} />
        </div>
      </div>
    </header>
  )
}

// Compare due volte, mai insieme (sopra e sotto sm).
function LinkInstagram({ lang, className = '' }) {
  return (
    <a
      href={profile.instagram}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={texts(lang).nav.instagram(profile.handle)}
      className={`relative shrink-0 items-center text-ink transition-colors hover:text-muted before:absolute before:-inset-1.5 before:content-[''] ${className}`}
    >
      <LogoInstagram className="h-[15px] w-[15px] sm:h-[17px] sm:w-[17px] lg:h-[19px] lg:w-[19px]" />
    </a>
  )
}

function LanguageSwitcher({ route }) {
  const currentLang = route?.lang ?? 'it'

  return (
    <div
      aria-label={texts(currentLang).nav.language}
      className="flex shrink-0 items-center gap-1 border-l border-line pl-2 text-[10px] uppercase tracking-[0.08em] sm:gap-1.5 sm:pl-3 sm:tracking-[0.14em] lg:text-[11px]"
    >
      {LANGS.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span aria-hidden="true" className="pointer-events-none text-line">
              /
            </span>
          )}
          <Link
            to={translatedPath(route, l)}
            hrefLang={l}
            aria-current={l === currentLang ? 'true' : undefined}
            className={`relative py-2 transition-colors before:absolute before:-inset-x-2 before:content-[''] ${
              l === currentLang ? 'font-bold text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {l}
          </Link>
        </Fragment>
      ))}
    </div>
  )
}

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
