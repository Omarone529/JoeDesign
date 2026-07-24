import { archive, projectImages } from '../data/siteData'
import { Link } from '../router'

/*
 * ARCHIVIO - griglia completa dei progetti.
 * Riprende lo stile di "Lavori selezionati": griglia 1 → 2 → 3 colonne,
 * immagine 4:5 con zoom in hover. Ogni scheda apre la pagina di dettaglio
 * (/progetto/<slug>) con la galleria completa.
 */
export default function Archive() {
  return (
    <main className="animate-viewIn">
      {/* Testata */}
      <section className="px-5 pb-8 pt-12 sm:px-8 sm:pb-12 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-[1.35fr_.65fr] lg:gap-16">
          <h1 className="m-0 text-[clamp(48px,10.5vw,168px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
            Archivio
          </h1>
          <p className="pb-2 text-[clamp(15px,1.4vw,19px)] leading-[1.5]">
            Tutti i progetti: prodotto, arredo, packaging e grafica.
            Ogni scheda raccoglie la galleria completa del lavoro.
          </p>
        </div>
      </section>

      {/* Griglia progetti */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-[72px] lg:pb-28">
        <div className="mb-6 flex items-baseline justify-between border-t border-line pt-5 sm:mb-8">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
            {archive.length} progetti
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
            2024 · 2026
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {archive.map((p) => {
            const { cover } = projectImages(p)
            return (
              <Link key={p.slug} to={`/progetto/${p.slug}`} className="group block cursor-pointer">
                <article>
                  <div className="aspect-[4/5] overflow-hidden bg-placeholder">
                    <img
                      src={cover}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover contrast-[1.02] transition-transform duration-[800ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105"
                    />
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
