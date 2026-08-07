import {
  altDisegno,
  altGalleria,
  altSfondo,
  archive,
  projectImages,
} from '../data/siteData'
import Carousel from '../components/Carousel'
import { Link } from '../router'

// Formato comune a tutti gli sfondo.webp: dichiararlo riserva lo spazio e la
// navigazione sotto non salta a caricamento avvenuto.
const SFONDO_W = 1672
const SFONDO_H = 941

/*
 * Testo e carosello allineati in cima alla stessa riga di griglia, così la foto
 * parte dall'altezza del titolo e non da quella della descrizione. Da xl la
 * colonna foto pesa più di quella del testo; sotto, metà e metà, o il testo si
 * strozza.
 */
export default function ProjectDetail({ slug }) {
  const index = archive.findIndex((p) => p.slug === slug)
  const item = archive[index]

  // `cover` è solo l'anteprima di griglia/home: non entra nel carosello.
  const { gallery, drawing, sfondo } = projectImages(item)
  const slides = gallery.map((src, i) => ({ src, alt: altGalleria(item, i, gallery.length) }))
  const prev = archive[(index - 1 + archive.length) % archive.length]
  const next = archive[(index + 1) % archive.length]

  const specRows = [
    ...(item.year ? [['Anno', item.year]] : []),
    ...Object.entries(item.spec || {}),
    ['Designer', 'Joe Sarchiolla'],
  ]

  return (
    <main className="animate-viewIn">
      <div className="grid grid-cols-1 gap-y-10 md:grid-cols-2 md:items-start md:gap-x-10 lg:gap-x-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="px-5 pt-8 sm:px-8 sm:pt-12 lg:px-[72px] lg:pt-12">
          <Link
            to="/archivio"
            className="text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
          >
            ← Archivio
          </Link>

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
          {/* `key`: rimonta il carosello cambiando scheda (vedi Carousel). */}
          <Carousel key={item.slug} images={slides} title={item.title} />
        </div>
      </div>

      <section className="px-5 sm:px-8 lg:px-[72px]">
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 md:mt-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-y-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-12">
          <div className="border-t border-line pt-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Progetto</div>
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

          {/* Altezza fissa: le proporzioni variano da un disegno all'altro, e
              senza, la pagina si assesta a caricamento avvenuto. */}
          {drawing && (
            <figure className="m-0 border-t border-line pt-6">
              <img
                src={drawing}
                alt={altDisegno(item)}
                loading="lazy"
                decoding="async"
                className="mt-6 h-[clamp(260px,38vh,420px)] w-full object-contain lg:h-[clamp(300px,46vh,560px)]"
              />
            </figure>
          )}
        </div>
      </section>

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
                <p className="mt-3 max-w-[46ch] text-[14px] leading-[1.5] text-ink/80">{w.note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {sfondo && (
        <section className="px-5 pt-14 sm:px-8 lg:px-[72px] lg:pt-20">
          <figure className="m-0 border-t border-line pt-6">
            <img
              src={sfondo}
              alt={altSfondo(item)}
              loading="lazy"
              decoding="async"
              width={SFONDO_W}
              height={SFONDO_H}
              className="h-auto w-full object-cover"
            />
          </figure>
        </section>
      )}

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
