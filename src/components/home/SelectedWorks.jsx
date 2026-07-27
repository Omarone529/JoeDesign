import { focusItems } from '../../data/siteData'
import { Link } from '../../router'

/*
 * "Lavori selezionati": i cinque progetti focus del portfolio 2026, numerati
 * 01–05 (selezione in `focusSlugs`). Griglia 1→2→3→5 colonne, zoom in hover,
 * ogni scheda apre /progetto/<slug>. La linea dalla hero la disegna la hero.
 */
export default function SelectedWorks() {
  return (
    <section
      id="lavori"
      className="px-5 pb-4 pt-10 sm:px-8 sm:pt-16 lg:px-[72px] lg:pb-10 lg:pt-20"
    >
      <div className="mb-6 flex items-baseline justify-between sm:mb-8 lg:mb-12">
        <h2 className="m-0 text-[clamp(22px,3vw,40px)] font-bold uppercase tracking-[-0.01em]">
          Lavori selezionati
        </h2>
        <Link
          to="/archivio"
          className="whitespace-nowrap border-b border-ink pb-[3px] text-[11px] uppercase tracking-[0.2em]"
        >
          Archivio completo →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {focusItems.map((p, i) => (
          <Link key={p.slug} to={`/progetto/${p.slug}`} className="group block cursor-pointer">
            <article>
              {/* Numero e anno sopra la foto: la numerazione del portfolio. */}
              <div className="mb-3 flex items-baseline justify-between gap-3 border-t border-line pt-2">
                <span className="text-[11px] tracking-[0.2em] text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="whitespace-nowrap text-[11px] tracking-[0.12em] text-muted">
                  {p.year}
                </span>
              </div>
              <div className="aspect-[4/5] overflow-hidden bg-placeholder">
                {/* Prima riga in viewport: niente lazy per non ritardarla. */}
                <img
                  src={p.cover}
                  alt={p.title}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  fetchpriority={i === 0 ? 'high' : undefined}
                  decoding="async"
                  className="h-full w-full object-cover contrast-[1.02] transition-transform duration-[800ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105"
                />
              </div>
              <div className="mt-3">
                <div className="text-[clamp(15px,1.4vw,19px)] font-bold tracking-[0.01em]">
                  {p.title}
                </div>
                <div className="mt-[3px] text-[12px] text-muted">{p.cat}</div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
