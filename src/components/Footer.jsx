import { profile } from '../data/siteData'
import { scorrimento } from '../motion'
import { Link } from '../router'

/*
 * Footer condiviso, che fa anche da pagina contatti (assente): qui i recapiti,
 * ognuno una volta sola. A sinistra i due canali, a destra i link, in fondo la
 * riga legale. Le colonne le separano gli spazi, non i bordi.
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
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-12 md:gap-x-10 lg:px-[72px] lg:py-20">
        {/*
         * Contatti diretti. Occhiello come le altre due colonne, così le tre
         * teste sono pari grado. Il nome per esteso non si ripete: è già in
         * barra e nella riga di copyright.
         */}
        <div className="col-span-2 md:col-span-6 md:pr-10">
          <Occhiello>Contatti</Occhiello>

          {/*
           * Elemento di primo livello del footer (il resto sta sotto, a 15px).
           * `flex w-fit`: box di blocco perché i due canali restino incolonnati,
           * ma largo quanto il testo così l'hover non invade la colonna.
           */}
          <a
            href={profile.emailHref}
            target="_blank"
            rel="noreferrer"
            className="group mt-5 flex w-fit items-baseline gap-2.5 text-[clamp(20px,2.2vw,29px)] font-bold tracking-[-0.015em] transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:text-night-soft"
          >
            <span className="relative break-words">
              {profile.email}
              <Sottolineatura />
            </span>
            {/* U+FE0E: forza la resa testuale della freccia, che altrimenti su
                iOS e Android esce come emoji a colori (vedi About.jsx) */}
            <span
              aria-hidden="true"
              className="text-[0.55em] transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-1 group-hover:translate-x-1"
            >
              {'↗︎'}
            </span>
          </a>

          <a
            href={profile.instagram}
            target="_blank"
            rel="noreferrer"
            className="group mt-4 flex w-fit items-center gap-2.5 text-[15px] tracking-[0.01em] text-night-soft transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:text-paper lg:text-[16px]"
          >
            <LogoInstagram className="h-[18px] w-[18px] shrink-0" />
            <span className="relative">
              @{profile.handle}
              <Sottolineatura />
            </span>
          </a>

          {/* Riga di chiusura: descrive, non è un recapito. */}
          <p className="m-0 mt-7 max-w-[38ch] text-[14px] leading-[1.55] text-muted">
            {profile.role}, con base a {profile.place}.
          </p>
        </div>

        <nav aria-label="Pagine del sito" className="col-span-2 md:col-span-6">
          <Occhiello>Pagine</Occhiello>
          <ul className="m-0 mt-5 list-none space-y-3 p-0">
            {pagine.map((p) => (
              <li key={p.to}>
                <Link
                  to={p.to}
                  className="group relative inline-block text-[15px] tracking-[0.01em] text-night-soft transition-colors duration-300 hover:text-paper"
                >
                  {p.label}
                  <Sottolineatura />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        className={`flex flex-col gap-4 border-t ${FILETTO} px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-[72px]`}
      >
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
          © {ANNO} {profile.name} · Tutti i diritti riservati
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: scorrimento() })}
          className="group flex items-center gap-2 self-start text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-paper sm:self-auto"
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

/* Etichetta di colonna: maiuscoletto spaziato, come negli occhielli del sito. */
function Occhiello({ children }) {
  return <div className="text-[10px] uppercase tracking-[0.24em] text-muted">{children}</div>
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
