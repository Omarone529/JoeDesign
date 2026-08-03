import { archive, projectImages } from '../data/siteData'
import Carousel from '../components/Carousel'
import { Link } from '../router'

export default function ProjectDetail({ slug }) {
  const index = archive.findIndex((p) => p.slug === slug)
  const item = archive[index]

  // `cover` è solo l'anteprima di griglia/home: non entra nel carosello.
  const { gallery, drawing, sfondo } = projectImages(item)
  const slides = gallery
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
      {/*
       * Fascia 1 · titolo + descrizione a sinistra, foto a destra, allineati
       * in cima (stessa riga della griglia, stesso padding-top): la foto
       * parte dall'altezza del titolo, non da quella della descrizione. Da
       * desktop la colonna foto esce dal contenitore e arriva al bordo destro
       * dello schermo (nessun padding, nessun max-width): occupa il
       * quadrante destro della pagina, grande. Su telefono resta impaginata
       * come prima (colonna unica, titolo e descrizione sopra, foto sotto).
       */}
      <div className="grid grid-cols-1 gap-y-10 md:grid-cols-2 md:items-start md:gap-x-10 lg:gap-x-12">
        <div className="px-5 pt-8 sm:px-8 sm:pt-12 lg:px-[72px] lg:pt-12">
          <Link
            to="/archivio"
            className="text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
          >
            ← Archivio
          </Link>

          {/* Titolo più contenuto: sotto deve entrare tutta la scheda nella prima schermata. */}
          <h1 className="mt-6 text-[clamp(36px,6vw,88px)] font-bold uppercase leading-[0.9] tracking-[-0.02em] lg:mt-6">
            {item.title}
          </h1>

          <div className="mt-8 border-t border-line pt-8">
            <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-muted">
              {item.cat}
            </div>
            <p className="m-0 max-w-[52ch] text-[clamp(16px,1.35vw,19px)] leading-[1.5]">
              {item.desc}
            </p>
          </div>
        </div>

        <div className="px-5 pt-8 sm:px-8 sm:pt-12 md:px-0 lg:pt-12">
          <Carousel images={slides} title={item.title} />
        </div>
      </div>

      <section className="px-5 sm:px-8 lg:px-[72px]">
        {/*
         * Fascia 2 · dati tecnici + disegno. Torna nel contenitore standard
         * (niente bleed qui): stessa larghezza colonne di prima dell'ultima
         * modifica.
         */}
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 md:mt-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-y-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-12">
          <div className="border-t border-line pt-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Progetto</div>
            {/* Voce a sinistra, valore a destra: tiene la colonna anche larga. */}
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
           * Fascia 2 · disegno tecnico. Fondo trasparente
           * (`scripts/pdf-disegno.js`), si appoggia alla carta senza riquadro.
           * Altezza fissa: proporzioni diverse, senza altezza la pagina si
           * assesterebbe a caricamento avvenuto.
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

      {/* Immagine di sfondo del progetto */}
      {sfondo && (
        <section className="px-5 pt-14 sm:px-8 lg:px-[72px] lg:pt-20">
          <figure className="m-0 border-t border-line pt-6">
            <img
              src={sfondo}
              alt={`Immagine di sfondo di ${item.title}`}
              loading="lazy"
              decoding="async"
              className="w-full object-cover"
            />
          </figure>
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
