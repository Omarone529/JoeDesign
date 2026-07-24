import { contests } from '../../data/siteData'

/* "Concorsi & partecipazioni" — elenco a scorrimento tipografico. */
export default function ContestsTicker() {
  return (
    <section className="border-b border-t-2 border-b-line border-t-ink px-5 py-7 sm:px-8 sm:py-10 lg:px-[72px] lg:py-12">
      <div className="mb-[22px] text-[10px] uppercase tracking-[0.24em] text-muted">
        Concorsi &amp; partecipazioni
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-2.5">
        {contests.map((c, i) => (
          <span
            key={c.name}
            className="text-[clamp(16px,2.4vw,30px)] font-bold uppercase tracking-[-0.01em]"
          >
            {c.name}
            {i < contests.length - 1 && (
              <span className="text-dot">&nbsp;·&nbsp;</span>
            )}
          </span>
        ))}
      </div>
    </section>
  )
}
