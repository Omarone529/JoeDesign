import { altCopertina, focusItemsIn } from '../../data/siteData'
import { testi } from '../../i18n'
import { Link, percorso, useLang } from '../../router'

/* I cinque progetti focus del portfolio 2026 (selezione in `focusSlugs`). */
export default function SelectedWorks() {
  const lang = useLang()
  const T = testi(lang)

  return (
    <section
      id="lavori"
      className="px-5 pb-4 pt-10 sm:px-8 sm:pt-16 lg:px-[72px] lg:pb-10 lg:pt-20"
    >
      <div className="mb-5 flex items-baseline justify-between sm:mb-6 lg:mb-8">
        <h2 className="m-0 text-[clamp(22px,3vw,40px)] font-bold uppercase tracking-[-0.01em]">
          {T.home.lavoriSelezionati}
        </h2>
        <Link
          to={percorso('archive', {}, lang)}
          className="relative whitespace-nowrap border-b border-ink pb-[3px] text-[11px] uppercase tracking-[0.2em] before:absolute before:-inset-x-2 before:-inset-y-2 before:content-['']"
        >
          {T.home.archivioCompleto}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {focusItemsIn(lang).map((p, i) => (
          <Link
            key={p.slug}
            to={percorso('project', { slug: p.slug }, lang)}
            className="group relative block cursor-pointer transition-transform duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] will-change-transform hover:z-10 hover:scale-[1.045]"
          >
            <article>
              <div className="aspect-[4/5] overflow-hidden bg-placeholder">
                <img
                  src={p.cover}
                  alt={altCopertina(p, lang)}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  fetchpriority={i === 0 ? 'high' : undefined}
                  decoding="async"
                  className="h-full w-full object-cover contrast-[1.02]"
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
