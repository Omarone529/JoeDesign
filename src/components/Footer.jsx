import { profile } from '../data/siteData'
import { Link } from '../router'

/*
 * Footer condiviso su sfondo notte. Fa anche da pagina contatti del sito:
 * raccoglie tutti i recapiti, quindi in navbar non c'è più la voce "Contatti".
 * Tre fasce separate da filetti sottili:
 *   1. la mail in grande + i recapiti + le pagine, su griglia a 12 colonne;
 *   2. la firma tipografica "SARCHIOLLA" distesa da bordo a bordo;
 *   3. la coda con copyright e ritorno in cima.
 * La mail sta solo nella chiamata grande, non anche in elenco: niente doppioni.
 */
export default function Footer() {
  const anno = new Date().getFullYear()

  const recapiti = [
    { label: 'Telefono', valore: profile.phone, href: profile.phoneHref },
    { label: 'Sede', valore: profile.place },
  ]

  const pagine = [
    { label: 'Home', to: '/' },
    { label: 'Archivio', to: '/archivio' },
    { label: 'Chi sono', to: '/chi-sono' },
  ]

  return (
    <footer className="bg-night text-paper">
      {/* 1. Chiamata, recapiti, pagine */}
      <div className="grid grid-cols-1 gap-y-12 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-12 md:gap-x-10 lg:px-[72px] lg:py-20">
        <div className="md:col-span-6">
          <Occhiello>Scrivimi</Occhiello>
          {/*
           * `flex w-fit`: riquadro di livello blocco (i due canali restano
           * incolonnati anche quando la colonna è larga) ma stretto sul testo,
           * così colore e freccia reagiscono solo sopra la scritta.
           */}
          <a
            href={`mailto:${profile.email}`}
            className="group mt-5 flex w-fit items-baseline gap-3 text-[clamp(20px,2.6vw,36px)] font-bold tracking-[-0.02em] transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:text-night-soft"
          >
            <span className="break-words">{profile.email}</span>
            {/*
             * U+FE0E in coda alla freccia: impone la resa testuale, altrimenti
             * iOS e Android disegnano ↗ come emoji blu invece del segno nero.
             */}
            <span
              aria-hidden="true"
              className="text-[0.5em] transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-1 group-hover:translate-x-1"
            >
              {'↗︎'}
            </span>
          </a>
          {/*
           * Secondo canale: su Instagram è raggiungibile quanto via mail, quindi
           * su schermo grande cresce insieme alla mail invece di restare una
           * postilla (16px sotto a 36px sembrava una nota a piè di pagina).
           */}
          <a
            href={profile.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex w-fit items-center gap-2.5 text-[16px] tracking-[0.01em] transition-colors duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:text-night-soft lg:mt-7 lg:gap-3 lg:text-[19px]"
          >
            <LogoInstagram className="h-[19px] w-[19px] shrink-0 lg:h-[22px] lg:w-[22px]" />
            <span>@{profile.handle}</span>
          </a>

          <p className="m-0 mt-7 max-w-[40ch] text-[14px] leading-[1.55] text-night-soft lg:mt-9 lg:text-[15px]">
            {profile.role}, con base a {profile.place}.
          </p>
        </div>

        {/* Recapiti: stessa grammatica della scheda tecnica dei progetti */}
        <div className="md:col-span-3">
          <Occhiello>Recapiti</Occhiello>
          <dl className="m-0 mt-5 border-t border-paper/12">
            {recapiti.map((r) => (
              <div key={r.label} className="grid grid-cols-[84px_1fr] gap-3 border-b border-paper/12 py-3">
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">{r.label}</dt>
                <dd className="m-0 break-words text-[14px] leading-[1.4]">
                  {r.href ? (
                    <a
                      href={r.href}
                      {...(r.esterno ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="transition-colors hover:text-night-soft hover:underline"
                    >
                      {r.valore}
                    </a>
                  ) : (
                    r.valore
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Pagine */}
        <nav aria-label="Pagine del sito" className="md:col-span-3">
          <Occhiello>Pagine</Occhiello>
          <ul className="mt-5 space-y-2.5">
            {pagine.map((p) => (
              <li key={p.to}>
                <Link
                  to={p.to}
                  className="text-[15px] tracking-[0.01em] transition-colors hover:text-night-soft"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/*
       * 2. Firma: le lettere sono distribuite in flex, quindi la parola chiude
       * esattamente sui due margini a qualunque larghezza. Decorativa: il nome
       * per esteso è nella riga di copyright qui sotto.
       */}
      <div className="border-t border-paper/12 px-5 py-8 sm:px-8 lg:px-[72px]">
        <div
          aria-hidden="true"
          className="flex justify-between text-[clamp(26px,7vw,104px)] font-bold uppercase leading-[0.9]"
        >
          {[...'Sarchiolla'].map((ch, i) => (
            <span key={`${ch}-${i}`}>{ch}</span>
          ))}
        </div>
      </div>

      {/* 3. Coda */}
      <div className="flex flex-col gap-4 border-t border-paper/12 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-[72px]">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
          © {anno} {profile.name} · Tutti i diritti riservati
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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

/* Etichetta piccola in maiuscoletto spaziato, come nel resto del sito. */
function Occhiello({ children }) {
  return <div className="text-[10px] uppercase tracking-[0.24em] text-muted">{children}</div>
}

/*
 * Marchio Instagram disegnato a filo, in SVG inline: nessuna libreria di icone
 * da installare e nessuna richiesta a un CDN esterno per un solo glifo.
 * `currentColor` e le misure in em lo tengono in accordo col testo accanto,
 * anche nelle transizioni di hover. Decorativo: la maniglia è scritta di fianco.
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
