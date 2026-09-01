import { aboutIn, profiloIn } from '../data/siteData'
import { testi } from '../i18n'
import { Link, percorso, useLang } from '../router'
import Sketchbook from '../components/about/Sketchbook'

/*
 * Il padding alto sta sulla colonna di testo, così la foto parte a filo del
 * bordo. Il corpo del nome deriva dalla larghezza della colonna: = larghezza /
 * 6.355, la misura di "SARCHIOLLA" col tracking in uso. Da ricalcolare se
 * cambiano griglia, padding o tracking.
 */
export default function About() {
  const lang = useLang()
  const T = testi(lang)
  const about = aboutIn(lang)
  const profile = profiloIn(lang)
  const { hero, lab } = about.photos

  return (
    <main className="animate-viewIn">
      <section className="grid grid-cols-1 gap-y-10 border-b-2 border-ink px-5 sm:px-8 md:min-h-[calc(100vh-4rem)] md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] md:gap-x-10 lg:px-[72px] lg:gap-x-16">
        <div className="flex flex-col pt-10 sm:pt-14 md:col-start-1 md:row-start-1 lg:pt-16">
          <div className="mb-6 text-[11px] uppercase tracking-[0.24em] text-muted">
            {T.chiSono.occhiello}
          </div>
          <p className="m-0 max-w-[42ch] text-[clamp(15px,1.15vw,18px)] leading-[1.5]">
            {about.intro}
          </p>
          {/* Con `leading-[0.85]` la riga finisce 0.046em sotto la linea di base,
              e SARCHIOLLA resterebbe sospesa sopra il filetto. Il margine
              negativo recupera esattamente quello scarto e appoggia le lettere
              sul bordo, senza scavalcarlo. Il numero viene dalle metriche del
              taglio in uso — Helvetica Neue BOLD, 975 + 217 su 1000 di corpo:
              (975 + 217 - 850) / 2 = 171 di mezzo-interlinea tolti ai 217 di
              discesa. Da ricalcolare se cambiano peso, font o `leading`.
              Solo da md, dove il titolo sta in fondo alla colonna: sotto ha la
              foto, non il filetto. */}
          <h1
            aria-label={profile.displayName}
            className="m-0 mt-12 font-bold uppercase leading-[0.85] tracking-[-0.03em] text-[min(calc((100vw_-_40px)*0.1526),300px)] sm:text-[min(calc((100vw_-_64px)*0.1526),300px)] md:-mb-[0.046em] md:mt-auto md:text-[min(calc((100vw_-_104px)*0.0954),300px)] lg:text-[min(calc((100vw_-_208px)*0.0954),300px)]"
          >
            {/* Lo spazio separa le due parole nel testo estratto dai crawler,
                che leggono "JoeSarchiolla" se i due span si toccano. */}
            <span className="block">Joe</span>{' '}
            <span className="block">Sarchiolla</span>
          </h1>
        </div>

        {/* `object-top`: protegge la testa su finestre basse. */}
        <div className="mx-auto w-full max-w-[440px] md:col-start-2 md:row-start-1 md:max-w-none">
          <img
            src={hero.src}
            alt={hero.alt}
            width="1600"
            height="2132"
            fetchpriority="high"
            className="block w-full md:h-full md:object-cover md:object-top"
          />
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-[72px] lg:py-20">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:gap-x-24 lg:gap-y-16">
          <div className="space-y-12 lg:space-y-16">
            <ArrowBlock label={T.chiSono.experience}>
              <dl className="m-0">
                {about.experience.map((it) => (
                  <Row key={it.titolo + it.anno} anno={it.anno} titolo={it.titolo} luogo={it.luogo} />
                ))}
              </dl>
            </ArrowBlock>

            <ArrowBlock label={T.chiSono.education}>
              <dl className="m-0">
                {about.education.map((it) => (
                  <Row key={it.titolo} anno={it.anno} titolo={it.titolo} luogo={it.luogo} />
                ))}
              </dl>
            </ArrowBlock>
          </div>

          <div className="space-y-12 lg:space-y-16">
            <ArrowBlock label={T.chiSono.skills}>
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

            <ArrowBlock label={T.chiSono.contacts}>
              <div className="space-y-1 text-[15px] lg:space-y-2 lg:text-[17px]">
                <a
                  href={profile.emailHref}
                  target="_blank"
                  rel="noreferrer"
                  className="block break-all hover:underline"
                >
                  {profile.email}
                </a>
              </div>
            </ArrowBlock>
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
        <blockquote className="m-0 max-w-[24ch] text-[clamp(26px,4vw,56px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]">
          “{profile.manifesto}”
        </blockquote>
      </section>

      <section className="bg-night">
        <img
          src={lab.src}
          alt={lab.alt}
          loading="lazy"
          width="1900"
          height="1425"
          className="block aspect-[16/9] w-full object-cover object-top"
        />
      </section>

      <Sketchbook />

      <section className="grid grid-cols-1 border-t-2 border-ink sm:grid-cols-2">
        <Link
          to={percorso('archive', {}, lang)}
          className="group border-b border-line px-5 py-10 transition-colors hover:bg-hover sm:border-b-0 sm:border-r sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.chiSono.ilLavoro}
          </div>
          <div className="mt-2 text-[clamp(18px,2.4vw,32px)] font-bold uppercase tracking-[-0.01em]">
            {T.chiSono.vaiArchivio}
          </div>
        </Link>
        <a
          href={profile.emailHref}
          target="_blank"
          rel="noreferrer"
          className="group px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.chiSono.scrivimi}
          </div>
          <div className="mt-2 break-words text-[clamp(16px,2.4vw,32px)] font-bold tracking-[-0.01em]">
            {profile.email}
          </div>
        </a>
      </section>
    </main>
  )
}

/*
 * La freccia porta U+FE0E (VS-15), che forza la resa testuale: le diagonali
 * ↖↗↘↙ hanno una variante emoji e su iOS/Android uscirebbero a colori.
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
