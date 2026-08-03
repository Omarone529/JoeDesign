import { archive, periodoArchivio, projectImages } from '../data/siteData'
import { Link } from '../router'

/*
 * Archivio: griglia completa dei progetti, dal più recente. Scheda intera che
 * si ingrandisce leggermente in hover, ogni scheda apre /progetto/<slug>.
 * Conteggio e periodo in testa sono calcolati dai dati.
 */
export default function Archive() {
  return (
    <main className="animate-viewIn">
      <section className="px-5 pb-8 pt-12 text-center sm:px-8 sm:pb-12 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
        <h1 className="m-0 text-[clamp(48px,10.5vw,168px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
          Archivio
        </h1>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-[72px] lg:pb-28">
        <div className="mb-6 flex items-baseline justify-between border-t border-line pt-5 sm:mb-8">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
            {archive.length} {archive.length === 1 ? 'progetto' : 'progetti'}
          </span>
          {periodoArchivio && (
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {periodoArchivio.primo === periodoArchivio.ultimo
                ? periodoArchivio.primo
                : `${periodoArchivio.primo} · ${periodoArchivio.ultimo}`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {archive.map((p, i) => {
            const { cover } = projectImages(p)
            // Prime due righe (8 celle): in viewport all'apertura, richieste subito.
            const subito = i < 8
            return (
              <Link
                key={p.slug}
                to={`/progetto/${p.slug}`}
                className="group relative block cursor-pointer transition-transform duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] will-change-transform hover:z-10 hover:scale-[1.045]"
              >
                <article>
                  <div className="relative aspect-square overflow-hidden bg-placeholder">
                    <img
                      src={cover}
                      alt={p.title}
                      loading={subito ? 'eager' : 'lazy'}
                      fetchpriority={i < 4 ? 'high' : undefined}
                      decoding="async"
                      className="h-full w-full object-cover contrast-[1.02]"
                    />
                    {p.tavola && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/35 group-hover:opacity-100">
                        <span className="text-[clamp(28px,5vw,52px)] font-bold uppercase leading-none tracking-[-0.02em] text-paper">
                          {String(p.tavola).padStart(2, '0')}
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
    </main>
  )
}
