import { focusItems } from '../../data/siteData'

/*
 * "Lavori selezionati" — griglia delle 5 schede in evidenza.
 * Mobile-first: 1 colonna → 2 (sm) → 3 (md), come il template originale
 * su desktop. L'immagine ha un delicato zoom in hover.
 * Le card diventeranno cliccabili verso la scheda progetto quando
 * l'Archivio sarà pronto.
 */
export default function SelectedWorks() {
  return (
    <section className="px-5 pb-4 pt-10 sm:px-8 sm:pt-16 lg:px-[72px] lg:pb-10 lg:pt-20">
      <div className="mb-6 flex items-baseline justify-between sm:mb-8 lg:mb-12">
        <h2 className="m-0 text-[clamp(22px,3vw,40px)] font-bold uppercase tracking-[-0.01em]">
          Lavori selezionati
        </h2>
        <a
          href="#archivio"
          className="whitespace-nowrap border-b border-ink pb-[3px] text-[11px] uppercase tracking-[0.2em]"
        >
          Archivio completo →
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {focusItems.map((p) => (
          <a key={p.id} href={`#progetto/${p.slug}`} className="group block cursor-pointer">
            <article>
              <div className="aspect-[4/5] overflow-hidden bg-placeholder">
                <img
                  src={p.cover}
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
                <div className="whitespace-nowrap text-[11px] tracking-[0.12em] text-muted">
                  {p.year}
                </div>
              </div>
            </article>
          </a>
        ))}
      </div>
    </section>
  )
}
