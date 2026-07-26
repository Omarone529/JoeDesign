import { focusItems } from '../../data/siteData'
import { Link } from '../../router'

/*
 * "Lavori selezionati" - i cinque progetti focus del portfolio 2026, nello
 * stesso ordine e numerati come lì, da 01 a 05 (la selezione è `focusSlugs` in
 * siteData). Mobile-first: 1 colonna → 2 (sm) → 3 (md) → 5 (lg), cioè in fila
 * su schermo largo, come l'indice del portfolio. Sotto i 1024px l'ultima riga
 * resta spaiata: è la stessa griglia dell'archivio, dove i resti lasciano un
 * vuoto in fondo invece di allargare una scheda.
 * L'immagine ha un delicato zoom in hover; ogni scheda apre /progetto/<slug>.
 * La linea di separazione dalla hero la disegna la hero stessa (bordo inferiore),
 * dove chiude la foto; qui punta la sua freccia "Scorri".
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
              {/* Numero e anno sopra la foto, divisi da un filetto: la
                  numerazione del portfolio, nella riga a filetti del sito. */}
              <div className="mb-3 flex items-baseline justify-between gap-3 border-t border-line pt-2">
                <span className="text-[11px] tracking-[0.2em] text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="whitespace-nowrap text-[11px] tracking-[0.12em] text-muted">
                  {p.year}
                </span>
              </div>
              <div className="aspect-[4/5] overflow-hidden bg-placeholder">
                {/* La prima riga è già in viewport dopo il masthead: caricarla
                    pigramente ne ritarderebbe la richiesta */}
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
