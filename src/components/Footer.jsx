import { profile } from '../data/siteData'
import { scorrimento } from '../motion'
import { Link } from '../router'

/*
 * Footer condiviso, che fa anche da pagina contatti (assente): qui i
 * recapiti, ognuno una volta sola. Struttura centrata a blocco unico (canali,
 * pagine, riga descrittiva, poi la coda legale) invece delle due colonne
 * precedenti: stessi link, disposizione ispirata a omarbayadi.com.
 */
/*
 * Anno del copyright fissato a build-time (Vite lo inlinea). Non
 * `getFullYear()` al render: le pagine sono statiche e al primo gennaio
 * browser e HTML direbbero anni diversi, rompendo l'hydration.
 */
const ANNO = __ANNO_BUILD__

/*
 * Filetto della coda. `/10` e non `/12`: l'opacità Tailwind va di cinque in
 * cinque; un valore fuori scala non genera classe e il bordo diventerebbe
 * vistoso sul fondo notte.
 */
const FILETTO = 'border-paper/10'

export default function Footer() {
  const pagine = [
    { label: 'Home', to: '/' },
    { label: 'Archivio', to: '/archivio' },
    { label: 'Chi sono', to: '/chi-sono' },
  ]

  return (
    /*
     * `id`/`tabIndex`: destinazione del salto "Contatti", il focus si sposta
     * qui. Contorno tolto (su un elemento così largo sarebbe enorme);
     * `scroll-mt-16` tiene conto della barra sticky (4rem).
     */
    <footer
      id="contatti"
      tabIndex={-1}
      className="scroll-mt-16 bg-night text-paper focus:outline-none"
    >
      <div className="flex flex-col items-center px-5 py-14 text-center sm:px-8 sm:py-16 lg:px-[72px] lg:py-20">
        {/* Pagine, in cima. */}
        <nav aria-label="Pagine del sito">
          <ul className="m-0 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 p-0 list-none">
            {pagine.map((p) => (
              <li key={p.to}>
                <Link
                  to={p.to}
                  className="group relative inline-block text-[13px] uppercase tracking-[0.16em] text-muted transition-colors duration-300 hover:text-paper"
                >
                  {p.label}
                  <Sottolineatura />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Canali, solo icona: l'indirizzo/handle non si ripete, c'è già nel target del link. */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <a
            href={profile.emailHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`Scrivi a ${profile.email}`}
            className="text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:text-paper"
          >
            <LogoGmail className="h-5 w-5" />
          </a>

          <a
            href={profile.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label={`@${profile.handle} su Instagram`}
            className="text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:text-paper"
          >
            <LogoInstagram className="h-5 w-5" />
          </a>

          <a
            href={profile.youtube}
            target="_blank"
            rel="noreferrer"
            aria-label="Joe Sarchiolla su YouTube"
            className="text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:text-paper"
          >
            <LogoYoutube className="h-5 w-5" />
          </a>

          <a
            href={profile.tiktok}
            target="_blank"
            rel="noreferrer"
            aria-label="Joe Sarchiolla su TikTok"
            className="text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:text-paper"
          >
            <LogoTiktok className="h-5 w-5" />
          </a>
        </div>

        {/* Riga di chiusura: descrive, non è un recapito. */}
        <p className="m-0 mt-8 max-w-[38ch] text-[14px] leading-[1.55] text-muted">
          {profile.role}, di {profile.place}.
        </p>
      </div>

      <div
        className={`flex flex-col items-center gap-3 border-t ${FILETTO} px-5 py-6 text-center sm:px-8 lg:px-[72px]`}
      >
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
          © {ANNO} {profile.name} · Tutti i diritti riservati
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: scorrimento() })}
          className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-paper"
        >
          Torna su
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
 * Sottolineatura animata (come in Navbar): cresce da sinistra su hover e su
 * focus da tastiera. In assoluto (non sposta il testo), in currentColor.
 * Va in un contenitore `relative` dentro un elemento `group`.
 */
function Sottolineatura() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
    />
  )
}

/*
 * Icona busta (email) SVG inline, stesso trattamento delle altre icone del
 * footer (stroke in currentColor, decorativo: l'indirizzo è nel testo accanto).
 */
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

/*
 * Marchio Instagram SVG inline (no libreria di icone per un glifo). Stroke in
 * currentColor, segue il link anche in hover. Decorativo: la maniglia è nel
 * testo accanto.
 */
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

/*
 * Marchio YouTube SVG inline, stesso trattamento della Instagram accanto
 * (stroke in currentColor, decorativo).
 */
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

/*
 * Marchio TikTok SVG inline, stesso trattamento delle altre due icone
 * (stroke in currentColor, decorativo).
 */
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
