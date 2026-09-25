import {
  altCover,
  archiveIn,
  areaBySlugIn,
  areasIn,
  countProjects,
  archivePeriod,
  periodOf,
  areaProjectsIn,
  projectImages,
} from '../data/siteData'
import { photoFit } from '../data/photoFit'
import { texts } from '../i18n'
import { Link, pathFor, useLang } from '../router'
import { srcSetDi, SIZES } from '../images'

function periodText(period) {
  if (!period) return ''
  return period.first === period.last
    ? `${period.first}`
    : `${period.first} · ${period.last}`
}

function Heading({ left, right }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4 border-t border-line pt-5 sm:mb-8">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted">{left}</span>
      {right && (
        <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-muted">
          {right}
        </span>
      )}
    </div>
  )
}

// Celle grafiche verticali (7:10); nel bivio restano quadrate, con il colore `bg` ai lati.
function cellShape(area) {
  return area.key === 'graphic' ? 'aspect-[7/10]' : 'aspect-square'
}

function Title({ children }) {
  return (
    <section className="px-5 pb-8 pt-12 text-center sm:px-8 sm:pb-12 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
      <h1 className="m-0 text-[clamp(48px,10.5vw,168px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
        {children}
      </h1>
    </section>
  )
}

// /archivio: le due aree, ognuna con la copertina del suo progetto più recente.
function AreaChooser() {
  const lang = useLang()
  const T = texts(lang)
  const archive = archiveIn(lang)

  return (
    <main className="animate-viewIn">
      <Title>{T.archive.title}</Title>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-[72px] lg:pb-28">
        <Heading
          left={countProjects(archive.length, lang)}
          right={periodText(archivePeriod)}
        />

        <div className="mx-auto mt-4 grid grid-cols-1 gap-10 sm:mt-8 sm:max-w-[980px] sm:grid-cols-2 sm:gap-8 lg:max-w-[1200px] lg:gap-10">
          {areasIn(lang).map((area, i) => {
            const projects = areaProjectsIn(area.key, lang)
            // Il più recente fra quelli con la copertina.
            const first = projects.find((x) => projectImages(x).cover) ?? projects[0]
            // Un'area ancora senza progetti non si annuncia.
            if (!first) return null
            const { cover } = projectImages(first)
            const fit = photoFit[cover]
            return (
              <Link
                key={area.slug}
                to={pathFor('archive', { area: area.slug }, lang)}
                className="group block"
              >
                <div
                  className="relative aspect-square overflow-hidden bg-placeholder"
                  style={fit?.bg ? { backgroundColor: fit.bg } : undefined}
                >
                  <img
                    src={cover}
                    srcSet={srcSetDi(cover)}
                    sizes={SIZES.areas}
                    alt={altCover(first, lang)}
                    fetchpriority={i === 0 ? 'high' : undefined}
                    decoding="async"
                    style={fit?.pos ? { objectPosition: fit.pos } : undefined}
                    className={`h-full w-full contrast-[1.02] transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.03] ${
                      fit?.fit === 'contain' ? 'object-contain' : 'object-cover'
                    }`}
                  />
                  {/* Nome dell'area: al passaggio col puntatore, sempre visibile al tocco. */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/35 opacity-100 transition-all duration-300 hover-fine:bg-ink/0 hover-fine:opacity-0 hover-fine:group-hover:bg-ink/35 hover-fine:group-hover:opacity-100">
                    <h2 className="m-0 px-4 text-center text-[clamp(22px,3.4vw,40px)] font-bold uppercase leading-[0.95] tracking-[-0.02em] text-paper">
                      {area.label}
                    </h2>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-4 text-[11px] uppercase leading-none tracking-[0.12em] text-muted transition-colors group-hover:text-ink">
                  <span>{T.archive.openArea}</span>
                  <span className="whitespace-nowrap">{periodText(periodOf(projects))}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function AreaGrid({ area }) {
  const lang = useLang()
  const T = texts(lang)
  const projects = areaProjectsIn(area.key, lang)
  const other = areasIn(lang).find((a) => a.slug !== area.slug)
  const cell = cellShape(area)

  return (
    <main className="animate-viewIn">
      <section className="px-5 pb-8 pt-12 text-center sm:px-8 sm:pb-12 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
        <h1 className="m-0 text-[clamp(40px,8.4vw,132px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
          {area.label}
        </h1>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-[72px] lg:pb-28">
        <Heading
          left={countProjects(projects.length, lang)}
          right={periodText(periodOf(projects))}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {projects.map((p, i) => {
            const { cover } = projectImages(p)
            const fit = photoFit[cover]
            // Prime due righe (8 celle): in viewport all'apertura, richieste subito.
            const immediate = i < 8
            return (
              <Link
                key={p.slug}
                to={pathFor('project', { slug: p.slug }, lang)}
                className="group relative block cursor-pointer transition-transform duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] will-change-transform hover:z-10 hover:scale-[1.045]"
              >
                <article>
                  <div
                    className={`relative ${cell} overflow-hidden bg-placeholder`}
                    style={fit?.bg ? { backgroundColor: fit.bg } : undefined}
                  >
                    {cover ? (
                      <img
                        src={cover}
                        srcSet={srcSetDi(cover)}
                        sizes={SIZES.archive}
                        alt={altCover(p, lang)}
                        loading={immediate ? 'eager' : 'lazy'}
                        fetchpriority={i < 4 ? 'high' : undefined}
                        decoding="async"
                        style={fit?.pos ? { objectPosition: fit.pos } : undefined}
                        className={`h-full w-full contrast-[1.02] ${
                          fit?.fit === 'contain' ? 'object-contain' : 'object-cover'
                        }`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-[10px] uppercase tracking-[0.24em] text-muted">
                          {T.archive.incomingPhoto}
                        </span>
                      </div>
                    )}
                    {p.plate && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/35 group-hover:opacity-100">
                        <span className="text-[clamp(28px,5vw,52px)] font-bold uppercase leading-none tracking-[-0.02em] text-paper">
                          {String(p.plate).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <div>
                      <div className="text-[clamp(15px,1.4vw,19px)] font-bold tracking-[0.01em]">
                        {p.title}
                      </div>
                      <div className="mt-[3px] text-[12px] text-muted">{p.cat}</div>
                    </div>
                    {p.year && (
                      <div className="whitespace-nowrap text-[11px] tracking-[0.12em] text-muted">
                        {p.year}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Passaggio diretto all'altra area: tornare indietro e riscegliere è un giro inutile. */}
      {other && (
        <section className="border-t border-line">
          <Link
            to={pathFor('archive', { area: other.slug }, lang)}
            className="group block px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
          >
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
              {T.archive.otherArea}
            </div>
            <div className="mt-2 text-[clamp(20px,3vw,40px)] font-bold uppercase tracking-[-0.02em]">
              {other.label}
            </div>
          </Link>
        </section>
      )}
    </main>
  )
}

export default function Archive({ area }) {
  const lang = useLang()
  const choice = area ? areaBySlugIn(area, lang) : null
  return choice ? <AreaGrid area={choice} /> : <AreaChooser />
}
