import { about, profile } from '../data/siteData'
import { Link } from '../router'

/*
 * "Chi sono" - impostata sulla pagina "MI PRESENTO" del portfolio Direzione A.
 * Hero su fondo intonaco: intro in nero bold in alto a sinistra, nome enorme in
 * basso a sinistra, figura ritagliata a destra; una linea nera chiude la testata
 * sul fondo della foto. Sotto: EXPERIENCE · EDUCATION · SKILLS · CONTACTS su due
 * colonne. Tono impersonale.
 */
export default function About() {
  const { hero, lab, flue, dado } = about.photos

  return (
    <main className="animate-viewIn">
      {/*
       * Hero su fondo carta. Due colonne: a sinistra occhiello e descrizione in
       * alto e il nome enorme allineato a sinistra in basso, a destra la figura
       * ritagliata che parte attaccata alla navbar. La foto è l'elemento più
       * alto, quindi la linea nera chiude la sezione esattamente sul suo fondo.
       * Il padding alto sta sulla colonna di sinistra, non sulla sezione: così
       * la foto tocca il bordo superiore senza margini negativi.
       */}
      <section className="grid grid-cols-1 gap-y-10 border-b-2 border-ink px-5 sm:px-8 md:min-h-[calc(100vh-4rem)] md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] md:gap-x-10 lg:px-[72px] lg:gap-x-16">
        <div className="flex flex-col pt-10 sm:pt-14 md:col-start-1 md:row-start-1 lg:pt-16">
          <div className="mb-6 text-[11px] uppercase tracking-[0.24em] text-muted">Chi sono</div>
          <p className="m-0 max-w-[42ch] text-[clamp(15px,1.15vw,18px)] leading-[1.5]">
            {about.intro}
          </p>
          {/*
           * Corpo tarato sulla larghezza della colonna: "SARCHIOLLA" (6.355em
           * col tracking applicato) la riempie quasi tutta, "JOE" chiude dove
           * finisce. Se cambi griglia, padding o tracking, ricalcola i coefficienti.
           */}
          <h1
            aria-label={profile.displayName}
            className="m-0 mt-12 font-bold uppercase leading-[0.85] tracking-[-0.03em] text-[min(calc((100vw_-_40px)*0.1526),300px)] sm:text-[min(calc((100vw_-_64px)*0.1526),300px)] md:mt-auto md:text-[min(calc((100vw_-_104px)*0.0954),300px)] lg:text-[min(calc((100vw_-_208px)*0.0954),300px)]"
          >
            {/* Lo spazio fra le due righe serve al testo estratto dai crawler:
                senza, il contenuto dell'h1 sarebbe "JoeSarchiolla" attaccato. */}
            <span className="block">Joe</span>{' '}
            <span className="block">Sarchiolla</span>
          </h1>
        </div>

        {/*
         * Foto: attaccata alla navbar, chiude in basso sulla linea. Da md in su
         * riempie in altezza la cella (che la sezione stira fino alla piega):
         * `object-cover` rifila i margini trasparenti ai lati, `object-top`
         * tiene la testa ancorata in alto.
         */}
        <div className="mx-auto w-full max-w-[440px] md:col-start-2 md:row-start-1 md:max-w-none">
          <img
            src={hero.src}
            alt={hero.alt}
            width="1600"
            height="2132"
            className="block w-full md:h-full md:object-cover md:object-top"
          />
        </div>
      </section>

      {/*
       * Sotto la linea: CV su due colonne. Da lg in su corpi e spaziature
       * crescono e le colonne si distanziano: con la stessa scala del mobile il
       * testo risultava minuto e sperduto nella larghezza dello schermo.
       */}
      <section className="px-5 py-12 sm:px-8 lg:px-[72px] lg:py-20">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:gap-x-24 lg:gap-y-16">
          <div className="space-y-12 lg:space-y-16">
            <ArrowBlock label="Experience">
              <dl className="m-0">
                {about.experience.map((it) => (
                  <Row key={it.titolo + it.anno} anno={it.anno} titolo={it.titolo} luogo={it.luogo} />
                ))}
              </dl>
            </ArrowBlock>

            <ArrowBlock label="Education">
              <dl className="m-0">
                {about.education.map((it) => (
                  <Row key={it.titolo} anno={it.anno} titolo={it.titolo} luogo={it.luogo} />
                ))}
              </dl>
            </ArrowBlock>
          </div>

          <div className="space-y-12 lg:space-y-16">
            <ArrowBlock label="Skills">
              <ul className="flex flex-wrap gap-2">
                {about.skills.map((s) => (
                  <li
                    key={s}
                    className="border border-line bg-paper px-3 py-1 text-[13px] tracking-[0.02em] lg:px-4 lg:py-1.5 lg:text-[15px]"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </ArrowBlock>

            <ArrowBlock label="Contacts">
              <div className="space-y-1 text-[15px] lg:space-y-2 lg:text-[17px]">
                <a href={profile.phoneHref} className="block hover:underline">
                  {profile.phone}
                </a>
                <a href={`mailto:${profile.email}`} className="block break-all hover:underline">
                  {profile.email}
                </a>
              </div>
            </ArrowBlock>
          </div>
        </div>
      </section>

      {/* Citazione / manifesto */}
      <section className="border-t-2 border-ink px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
        <blockquote className="m-0 max-w-[24ch] text-[clamp(26px,4vw,56px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]">
          “{profile.manifesto}”
        </blockquote>
      </section>

      {/* Galleria. Altezza naturale: la foto si vede intera, senza tagli. */}
      <section className="bg-night">
        <img
          src={lab.src}
          alt={lab.alt}
          loading="lazy"
          width="1900"
          height="1425"
          className="block h-auto w-full"
        />
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2">
        {[flue, dado].map((ph) => (
          <div key={ph.src} className="bg-placeholder">
            <img
              src={ph.src}
              alt={ph.alt}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover contrast-[1.02]"
            />
          </div>
        ))}
      </section>

      {/* Navigazione */}
      <section className="grid grid-cols-1 border-t-2 border-ink sm:grid-cols-2">
        <Link
          to="/archivio"
          className="group border-b border-line px-5 py-10 transition-colors hover:bg-hover sm:border-b-0 sm:border-r sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Il lavoro</div>
          <div className="mt-2 text-[clamp(18px,2.4vw,32px)] font-bold uppercase tracking-[-0.01em]">
            Vai all’Archivio →
          </div>
        </Link>
        <a
          href={`mailto:${profile.email}`}
          className="group px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Scrivimi</div>
          <div className="mt-2 break-words text-[clamp(16px,2.4vw,32px)] font-bold tracking-[-0.01em]">
            {profile.email}
          </div>
        </a>
      </section>
    </main>
  )
}

/*
 * Blocco con etichetta e freccia ↘ (stile portfolio).
 * La freccia porta in coda U+FE0E (variation selector-15), che impone la resa
 * TESTUALE: senza, iOS e Android disegnano ↘ come emoji blu al posto del segno
 * nero. Vale per le frecce diagonali (↖ ↗ ↘ ↙) e per ↔ ↕, che hanno una
 * variante emoji; ← → ↑ ↓ non ce l'hanno e restano sempre testo.
 */
function ArrowBlock({ label, children }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 lg:mb-6">
        <span aria-hidden className="text-[15px] leading-none lg:text-[17px]">{'↘︎'}</span>
        <h2 className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] lg:text-[15px]">
          {label}
        </h2>
      </div>
      {children}
    </div>
  )
}

/* Riga anno · titolo · luogo per experience/education. */
function Row({ anno, titolo, luogo }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4 border-t border-line-soft py-3 lg:grid-cols-[132px_1fr] lg:gap-6 lg:py-4">
      <dt className="text-[13px] font-bold tabular-nums tracking-[0.02em] lg:text-[15px]">{anno}</dt>
      <dd className="m-0 text-[14px] leading-snug lg:text-[17px]">
        {titolo}
        {luogo && <span className="text-muted"> · {luogo}</span>}
      </dd>
    </div>
  )
}
