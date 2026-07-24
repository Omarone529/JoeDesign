import { about, profile } from '../data/siteData'
import { Link } from '../router'

/*
 * "Chi sono" - impostata sulla pagina "MI PRESENTO" del portfolio Direzione A:
 * intro con barra rossa, EXPERIENCE · SKILLS · EDUCATION, foto ritagliata con
 * la card Instagram e il QR sovrapposti ("bannerini"). Tono impersonale.
 */
export default function About() {
  const { hero, lab, flue, dado } = about.photos
  const ig = about.instagram

  return (
    <main className="animate-viewIn">
      {/* Testata: titolo diviso stile "MI · PRESENTO" */}
      <section className="px-5 pt-8 sm:px-8 sm:pt-12 lg:px-[72px] lg:pt-16">
        <div className="mb-6 text-[11px] uppercase tracking-[0.24em] text-muted">Chi sono</div>
        <h1 className="m-0 flex flex-wrap items-baseline justify-between gap-x-4 text-[clamp(44px,11vw,176px)] font-bold uppercase leading-[0.85] tracking-[-0.02em]">
          <span>Joe</span>
          <span>Sarchiolla</span>
        </h1>
      </section>

      {/* Corpo: colonna testo (CV) + foto con bannerini */}
      <section className="mt-8 grid grid-cols-1 gap-y-12 px-5 sm:px-8 md:mt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-x-10 lg:px-[72px] lg:gap-x-16">
        {/* Colonna sinistra */}
        <div className="order-2 md:order-1">
          {/* Intro con barra rossa */}
          <p className="border-l-2 border-accent pl-4 text-[clamp(16px,1.7vw,21px)] leading-[1.5]">
            {about.intro}
          </p>

          <div className="mt-12 space-y-12">
            <ArrowBlock label="Experience">
              <dl className="m-0">
                {about.experience.map((it) => (
                  <Row key={it.titolo + it.anno} anno={it.anno} titolo={it.titolo} luogo={it.luogo} />
                ))}
              </dl>
            </ArrowBlock>

            <ArrowBlock label="Skills">
              <ul className="flex flex-wrap gap-2">
                {about.skills.map((s) => (
                  <li
                    key={s}
                    className="border border-line bg-paper px-3 py-1 text-[13px] tracking-[0.02em]"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </ArrowBlock>

            <ArrowBlock label="Education">
              <dl className="m-0">
                {about.education.map((it) => (
                  <Row key={it.titolo} anno={it.anno} titolo={it.titolo} luogo={it.luogo} />
                ))}
              </dl>
            </ArrowBlock>

            <ArrowBlock label="Contacts">
              <div className="space-y-1 text-[15px]">
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

        {/* Colonna destra: foto ritagliata + bannerini */}
        <div className="relative order-1 self-end md:order-2">
          <img
            src={hero.src}
            alt={hero.alt}
            width="1600"
            height="2132"
            className="mx-auto block w-full max-w-[440px] md:max-w-none"
          />

          {/* Bannerino: card Instagram */}
          <a
            href={ig.url}
            target="_blank"
            rel="noreferrer"
            className="group absolute bottom-16 right-0 w-[min(88%,320px)] rounded-2xl bg-paper/95 p-4 shadow-[0_8px_30px_rgba(20,17,15,0.16)] ring-1 ring-line backdrop-blur-sm transition-transform hover:-translate-y-0.5 md:-right-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={ig.avatar}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-accent"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[14px] font-bold leading-tight">
                  <span className="truncate">{ig.handle}</span>
                  <span aria-hidden className="text-accent">✦</span>
                </div>
                <div className="truncate text-[11px] text-muted">{ig.role}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-4 border-t border-line-soft pt-3">
              {ig.stats.map(([n, l]) => (
                <div key={l} className="text-[12px] leading-tight">
                  <span className="font-bold">{n}</span> <span className="text-muted">{l}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-snug text-ink/80">{ig.bio}</p>
          </a>

          {/* Bannerino: QR Instagram */}
          <div className="absolute -bottom-2 left-2 rounded-xl bg-paper p-2 shadow-[0_6px_20px_rgba(20,17,15,0.14)] ring-1 ring-line sm:left-4">
            <img src={ig.qr} alt="QR del profilo Instagram" className="h-[72px] w-[72px] sm:h-20 sm:w-20" />
          </div>
        </div>
      </section>

      {/* Citazione / manifesto */}
      <section className="mt-16 border-t-2 border-ink px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
        <blockquote className="m-0 max-w-[24ch] text-[clamp(26px,4vw,56px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]">
          “{profile.manifesto}”
        </blockquote>
      </section>

      {/* Galleria */}
      <section className="bg-night">
        <img
          src={lab.src}
          alt={lab.alt}
          loading="lazy"
          className="h-[clamp(300px,60vh,680px)] w-full object-cover"
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

/* Blocco con etichetta e freccia ↘ (stile portfolio). */
function ArrowBlock({ label, children }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span aria-hidden className="text-[15px] leading-none">↘</span>
        <h2 className="m-0 text-[13px] font-bold uppercase tracking-[0.22em]">{label}</h2>
      </div>
      {children}
    </div>
  )
}

/* Riga anno · titolo · luogo per experience/education. */
function Row({ anno, titolo, luogo }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4 border-t border-line-soft py-3">
      <dt className="text-[13px] font-bold tabular-nums tracking-[0.02em]">{anno}</dt>
      <dd className="m-0 text-[14px] leading-snug">
        {titolo}
        {luogo && <span className="text-muted"> · {luogo}</span>}
      </dd>
    </div>
  )
}
