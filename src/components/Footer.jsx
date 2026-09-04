import { profiloIn } from '../data/siteData'
import { testi } from '../i18n'
import { scorrimento } from '../motion'
import { Link, percorso, useLang } from '../router'

// Fissato a build-time. Con `getFullYear()` al render, il primo gennaio l'HTML
// statico e il browser direbbero anni diversi e l'hydration si romperebbe.
const ANNO = __ANNO_BUILD__

// `/10` e non `/12`: l'opacità Tailwind va di cinque in cinque, e un valore
// fuori scala non genera la classe — il bordo resterebbe pieno.
const FILETTO = 'border-paper/10'

/*
 * Il testo secondario di questo file è `night-soft` e non `muted`: sono lo
 * stesso ruolo su fondi opposti. `muted` è tarato per leggersi sulla carta e
 * sul nero del footer scenderebbe a 3.77:1, sotto il minimo AA; `night-soft`
 * fa 11.47:1 ed è già il colore delle icone social qui sotto.
 */

/* Fa anche da pagina contatti, che come rotta non esiste. */
export default function Footer() {
  const lang = useLang()
  const T = testi(lang)
  const profile = profiloIn(lang)

  const pagine = [
    { label: T.nav.home, to: percorso('home', {}, lang) },
    { label: T.nav.archivio, to: percorso('archive', {}, lang) },
    { label: T.nav.chiSono, to: percorso('about', {}, lang) },
  ]

  return (
    /* Destinazione del salto "Contatti": il focus arriva qui, senza contorno
       (su un elemento così largo sarebbe enorme). */
    <footer
      id="contatti"
      tabIndex={-1}
      className="scroll-mt-16 bg-night text-paper focus:outline-none"
    >
      <div className="flex flex-col items-center px-5 py-14 text-center sm:px-8 sm:py-16 lg:px-[72px] lg:py-20">
        <nav aria-label={T.footer.pagine}>
          <ul className="m-0 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 p-0 list-none">
            {pagine.map((p) => (
              <li key={p.to}>
                <Link
                  to={p.to}
                  className="group relative inline-block text-[13px] uppercase tracking-[0.16em] text-night-soft transition-colors duration-300 before:absolute before:-inset-x-2 before:-inset-y-1.5 before:content-[''] hover:text-paper"
                >
                  {p.label}
                  <Sottolineatura />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <a
            href={profile.emailHref}
            target="_blank"
            rel="noreferrer"
            aria-label={T.footer.scriviA(profile.email)}
            className="relative text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] before:absolute before:-inset-1.5 before:content-[''] hover:text-paper"
          >
            <LogoGmail className="h-5 w-5" />
          </a>

          <a
            href={profile.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label={T.footer.instagram(profile.handle)}
            className="relative text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] before:absolute before:-inset-1.5 before:content-[''] hover:text-paper"
          >
            <LogoInstagram className="h-5 w-5" />
          </a>

          <a
            href={profile.youtube}
            target="_blank"
            rel="noreferrer"
            aria-label={T.footer.youtube}
            className="relative text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] before:absolute before:-inset-1.5 before:content-[''] hover:text-paper"
          >
            <LogoYoutube className="h-5 w-5" />
          </a>

          <a
            href={profile.tiktok}
            target="_blank"
            rel="noreferrer"
            aria-label={T.footer.tiktok}
            className="relative text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] before:absolute before:-inset-1.5 before:content-[''] hover:text-paper"
          >
            <LogoTiktok className="h-5 w-5" />
          </a>

          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={T.footer.linkedin}
            className="relative text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] before:absolute before:-inset-1.5 before:content-[''] hover:text-paper"
          >
            <LogoLinkedin className="h-5 w-5" />
          </a>
        </div>

        <p className="m-0 mt-8 max-w-[38ch] text-[14px] leading-[1.55] text-night-soft">
          {T.footer.riga(profile.role, profile.place)}
        </p>
      </div>

      <div
        className={`flex flex-col items-center gap-4 border-t ${FILETTO} px-5 py-6 text-center sm:px-8 lg:px-[72px]`}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-2 text-[10px] uppercase tracking-[0.2em] text-night-soft">
          <span>
            © {ANNO} {profile.name} · {T.footer.diritti}
          </span>
          <span aria-hidden="true">·</span>
          <Link
            to={percorso('privacy', {}, lang)}
            className="group relative inline-block transition-colors before:absolute before:-inset-x-2 before:-inset-y-2 before:content-[''] hover:text-paper"
          >
            {T.footer.privacy}
            <Sottolineatura />
          </Link>
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: scorrimento() })}
          className="group relative flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-night-soft transition-colors before:absolute before:-inset-x-2 before:-inset-y-2 before:content-[''] hover:text-paper"
        >
          {T.footer.tornaSu}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-0.5"
          >
            ↑
          </span>
        </button>
      </div>
    </footer>
  )
}

/*
 * I `before` sui link qui sopra allargano il bersaglio senza spostare niente:
 * una riga di testo da 13px è alta venti pixel, le icone social venti per venti,
 * e col dito non si prendono. Il padding non andava bene: la sottolineatura è
 * ancorata al fondo del link e sarebbe scesa sotto lo spazio vuoto.
 *
 * Lo stacco fra "Privacy" e "Torna su" è di 16px e non di 12 perché i due
 * bersagli allargati si toccano esattamente lì: a 12 si sovrapponevano, e nella
 * striscia in comune il tocco finiva sempre sul secondo.
 */

/* Va in un contenitore `relative` dentro un elemento `group`. */
function Sottolineatura() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
    />
  )
}

function LogoGmail({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="2.5" />
      <path d="M3.5 6.75l8.5 6.5 8.5-6.5" />
    </svg>
  )
}

function LogoInstagram({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" />
      <circle cx="12" cy="12" r="4.15" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LogoYoutube({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="4" />
      <path d="M10.5 9.25l4.5 2.75-4.5 2.75z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LogoTiktok({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 3v10.5a3.25 3.25 0 1 1-3.25-3.25c.36 0 .7.05 1.02.15" />
      <path d="M14 3c.3 2.35 1.9 3.9 4.25 4.1" strokeLinejoin="round" />
    </svg>
  )
}

function LogoLinkedin({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" />
      <circle cx="7.7" cy="7.6" r="1.05" fill="currentColor" stroke="none" />
      <path d="M7.7 10.6v6" />
      <path d="M11.7 16.6v-6" />
      <path d="M11.7 13.4a2.65 2.65 0 0 1 5.3 0v3.2" />
    </svg>
  )
}
