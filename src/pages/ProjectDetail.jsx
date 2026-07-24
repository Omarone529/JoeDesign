import { archive, projectImages } from '../data/siteData'
import Carousel from '../components/Carousel'

/*
 * Scheda progetto — testata con descrizione e scheda tecnica, galleria
 * completa, ed eventuale elenco dei lavori (per la raccolta grafica).
 * Testi e dati provengono dall'archivio/portfolio di Joe Sarchiolla.
 */
export default function ProjectDetail({ slug }) {
  const index = archive.findIndex((p) => p.slug === slug)
  const item = archive[index]

  if (!item) {
    return (
      <main className="animate-viewIn px-5 py-24 sm:px-8 lg:px-[72px]">
        <p className="text-[13px] uppercase tracking-[0.2em] text-muted">
          Progetto non trovato.
        </p>
        <a
          href="#archivio"
          className="mt-4 inline-block border-b border-ink pb-[3px] text-[11px] uppercase tracking-[0.2em]"
        >
          ← Torna all'Archivio
        </a>
      </main>
    )
  }

  const { cover, gallery } = projectImages(item)
  const slides = [cover, ...gallery]
  const prev = archive[(index - 1 + archive.length) % archive.length]
  const next = archive[(index + 1) % archive.length]

  // Righe della scheda tecnica: Anno + eventuali campi in `spec`.
  const specRows = [
    ...(item.year ? [['Anno', item.year]] : []),
    ...Object.entries(item.spec || {}),
    ['Designer', 'Joe Sarchiolla'],
  ]

  return (
    <main className="animate-viewIn">
      {/* Testata */}
      <section className="px-5 pt-8 sm:px-8 sm:pt-12 lg:px-[72px] lg:pt-20">
        <a
          href="#archivio"
          className="text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
        >
          ← Archivio
        </a>

        <h1 className="mt-6 text-[clamp(40px,8vw,120px)] font-bold uppercase leading-[0.9] tracking-[-0.02em] lg:mt-10">
          {item.title}
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-8 border-t border-line pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-start lg:mt-12 lg:gap-16 lg:pt-12">
          {/* Colonna sinistra: descrizione + scheda tecnica (fissa su desktop) */}
          <div className="md:sticky md:top-24">
            <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-muted">
              {item.cat}
            </div>
            <p className="m-0 max-w-[52ch] text-[clamp(16px,1.6vw,22px)] leading-[1.5]">
              {item.desc}
            </p>

            <dl className="mt-8 grid grid-cols-1 gap-0 border-t border-line-soft lg:mt-10">
              {specRows.map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[92px_1fr] gap-3 border-b border-line-soft py-3"
                >
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">{k}</dt>
                  <dd className="m-0 text-[13px] leading-[1.4]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Colonna destra: carosello con avanzamento automatico */}
          <Carousel images={slides} title={item.title} />
        </div>
      </section>

      {/* Lavori (raccolta grafica) */}
      {item.works && item.works.length > 0 && (
        <section className="px-5 pt-14 sm:px-8 lg:px-[72px] lg:pt-20">
          <h2 className="mb-8 border-t border-line pt-6 text-[clamp(18px,2.2vw,28px)] font-bold uppercase tracking-[-0.01em]">
            I lavori
          </h2>
          <div className="grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2">
            {item.works.map((w) => (
              <div key={w.title} className="border-t border-line-soft pt-4">
                <div className="text-[clamp(15px,1.5vw,19px)] font-bold tracking-[0.01em]">
                  {w.title}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                  {w.meta}
                </div>
                <p className="mt-3 max-w-[46ch] text-[14px] leading-[1.5] text-ink/80">
                  {w.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Navigazione progetto precedente / successivo */}
      <section className="mt-14 grid grid-cols-2 border-t border-line sm:mt-20 lg:mt-28">
        <a
          href={`#progetto/${prev.slug}`}
          className="group border-r border-line px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">← Precedente</div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            {prev.title}
          </div>
        </a>
        <a
          href={`#progetto/${next.slug}`}
          className="group px-5 py-10 text-right transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Successivo →</div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            {next.title}
          </div>
        </a>
      </section>
    </main>
  )
}
