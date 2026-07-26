import { profile } from '../data/siteData'
import { scorrimento } from '../motion'
import { Link } from '../router'

/*
 * Footer condiviso. Assolve anche la funzione di pagina contatti, che il sito
 * non ha: qui stanno tutti i recapiti, ognuno una volta sola.
 *
 * Impianto convenzionale: a sinistra il nome con i due canali di contatto, a
 * destra due colonne di collegamenti, in fondo la riga legale. Un solo filetto
 * in tutto il blocco, quello sopra la coda: la separazione tra le colonne la
 * fanno gli spazi bianchi, non i bordi.
 */
/*
 * Anno del copyright, fissato al momento della build.
 *
 * Non `new Date().getFullYear()` durante il render: le pagine sono statiche e
 * l'anno resterebbe cucito nell'HTML generato: al primo gennaio il browser
 * calcolerebbe l'anno nuovo su un HTML che dice quello vecchio, React
 * troverebbe due testi diversi e l'aggancio (hydration) fallirebbe su tutte le
 * pagine. Vite sostituisce questa costante con il valore letterale in fase di
 * compilazione, così HTML e browser dicono sempre la stessa cosa.
 */
const ANNO = __ANNO_BUILD__

/*
 * Il filetto della coda. `/10` e non `/12`: la scala di opacità di Tailwind va
 * di cinque in cinque, un valore fuori scala non genera alcuna classe e il
 * bordo ricadrebbe sul grigio chiaro di default, vistoso sul fondo notte.
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
     * `id` e `tabIndex` fanno del footer la destinazione della voce "Contatti"
     * in barra: dopo il salto il focus si sposta qui, così da tastiera si
     * continua dai recapiti e non dall'inizio della pagina. Il contorno del
     * focus è tolto perché su un elemento largo quanto il footer sarebbe una
     * cornice enorme; `scroll-mt-16` tiene conto della barra sticky (4rem).
     */
    <footer
      id="contatti"
      tabIndex={-1}
      className="scroll-mt-16 bg-night text-paper focus:outline-none"
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-12 md:gap-x-10 lg:px-[72px] lg:py-20">
        {/*
         * Contatti diretti. La colonna si apre con un occhiello come le altre
         * due: le tre teste stanno sulla stessa quota e con lo stesso peso,
         * altrimenti questa partirebbe con un grassetto e le altre con un
         * maiuscoletto, e le colonne non si leggerebbero come pari grado.
         * Il nome per esteso non si ripete qui: è già in barra e in fondo,
         * nella riga di copyright.
         */}
        <div className="col-span-2 md:col-span-6 md:pr-10">
          <Occhiello>Contatti</Occhiello>

          {/*
           * L'unico elemento di primo livello del footer, che di fatto è la
           * pagina contatti del sito: tutto il resto sta sotto, a 15px.
           * flex w-fit e non inline-flex: serve un box di livello blocco perché
           * i due canali restino incolonnati su colonne larghe, ma largo quanto
           * il testo perché l'area sensibile all'hover non invada la colonna.
           */}
          <a
            href={`mailto:${profile.email}`}
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

          {/* Riga di chiusura: descrive, non è un recapito, quindi sta in coda
              alla colonna e un gradino sotto ai due canali. */}
          <p className="m-0 mt-7 max-w-[38ch] text-[14px] leading-[1.55] text-muted">
            {profile.role}, con base a {profile.place}.
          </p>
        </div>

        {/* Pagine */}
        <nav aria-label="Pagine del sito" className="md:col-span-3">
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

        {/*
         * Recapiti: solo il telefono. La sede sta già nella riga di chiusura
         * qui accanto, e ripeterla a due colonne di distanza la farebbe
         * sembrare un'altra informazione invece della stessa.
         */}
        <div className="md:col-span-3">
          <Occhiello>Recapiti</Occhiello>
          <ul className="m-0 mt-5 list-none p-0">
            <li>
              <a
                href={profile.phoneHref}
                className="group relative inline-block whitespace-nowrap text-[15px] text-night-soft transition-colors duration-300 hover:text-paper"
              >
                {profile.phone}
                <Sottolineatura />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Coda */}
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
 * Sottolineatura animata, stesso gesto delle voci in Navbar: cresce da sinistra
 * al passaggio del mouse e all'arrivo del focus da tastiera - il solo hover
 * lascerebbe chi naviga col tab senza alcun segnale. In assoluto, quindi non
 * occupa spazio nel flusso e non sposta il testo. Va dentro un contenitore
 * `relative` in un elemento `group`. Usa currentColor, così accompagna la
 * transizione di colore del link.
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
 * Marchio Instagram in SVG inline, per non introdurre una libreria di icone o
 * una richiesta esterna per un solo glifo. Lo stroke usa currentColor, quindi
 * segue il colore del link anche durante la transizione di hover.
 * Decorativo: la maniglia è nel testo accanto.
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
