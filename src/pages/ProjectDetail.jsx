import { archive, projectImages } from '../data/siteData'
import Carousel from '../components/Carousel'
import { Link } from '../router'

export default function ProjectDetail({ slug }) {
  const index = archive.findIndex((p) => p.slug === slug)
  const item = archive[index]

  const { cover, gallery, drawing } = projectImages(item)
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
      <section className="px-5 pt-8 sm:px-8 sm:pt-12 lg:px-[72px] lg:pt-12">
        <Link
          to="/archivio"
          className="text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
        >
          ← Archivio
        </Link>

        {/* Più contenuto dei titoli di Home e Archivio: qui sotto il titolo deve
            entrare tutta la scheda — foto e disegno — nella prima schermata. */}
        <h1 className="mt-6 text-[clamp(36px,6vw,88px)] font-bold uppercase leading-[0.9] tracking-[-0.02em] lg:mt-6">
          {item.title}
        </h1>

        {/*
         * Impianto della scheda d'archivio, a filetti come la pagina stampata:
         * a sinistra il testo, a destra le immagini, su due fasce. In alto la
         * descrizione accanto al carosello, in basso i dati tecnici accanto al
         * disegno quotato.
         * La colonna del testo è la più larga delle due: quella delle immagini
         * resta stretta abbastanza da tenere le celle quasi quadrate, vicine al
         * formato verticale dell'archivio (circa 3:4), così le foto la riempiono
         * senza grossi ritagli. Il testo non ci perde: la descrizione è comunque
         * fermata a 52 caratteri di riga.
         * Su telefono le quattro celle si incolonnano nell'ordine di lettura:
         * descrizione, foto, dati, disegno.
         */}
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-10 border-t border-line pt-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:gap-y-14 lg:mt-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-12 lg:pt-8">
          {/* Fascia 1 · descrizione */}
          <div>
            <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-muted">
              {item.cat}
            </div>
            <p className="m-0 max-w-[52ch] text-[clamp(16px,1.35vw,19px)] leading-[1.5]">
              {item.desc}
            </p>
          </div>

          {/* Fascia 1 · carosello con avanzamento automatico */}
          <Carousel images={slides} title={item.title} />

          {/* Fascia 2 · scheda tecnica */}
          <div className="border-t border-line pt-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Progetto</div>
            {/* Voce a sinistra, valore allineato a destra: la riga tiene la
                colonna anche quando è larga, senza vuoti in mezzo. */}
            <dl className="mt-6 grid grid-cols-1 gap-0 border-t border-line-soft">
              {specRows.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-6 border-b border-line-soft py-3"
                >
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">{k}</dt>
                  <dd className="m-0 text-right text-[13px] leading-[1.4]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/*
           * Fascia 2 · disegno tecnico, sotto al carosello. Il tratto è su fondo
           * trasparente (`scripts/pdf-disegno.js`), quindi si appoggia alla
           * carta senza riquadro: si riconosce da sé, senza didascalia.
           * Cornice di altezza fissa: i disegni hanno proporzioni diverse e
           * senza un'altezza data la pagina si assesterebbe a caricamento
           * avvenuto.
           */}
          {drawing && (
            <figure className="m-0 border-t border-line pt-6">
              <img
                src={drawing}
                alt={`Disegno tecnico quotato di ${item.title}`}
                loading="lazy"
                decoding="async"
                className="mt-6 h-[clamp(260px,38vh,420px)] w-full object-contain lg:h-[clamp(300px,46vh,560px)]"
              />
            </figure>
          )}
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
        <Link
          to={`/progetto/${prev.slug}`}
          className="group border-r border-line px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">← Precedente</div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            {prev.title}
          </div>
        </Link>
        <Link
          to={`/progetto/${next.slug}`}
          className="group px-5 py-10 text-right transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Successivo →</div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            {next.title}
          </div>
        </Link>
      </section>
    </main>
  )
}
