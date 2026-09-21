import {
  aiPhoto,
  altDrawing,
  altGallery,
  altBackdrop,
  altVideo,
  archiveIn,
  areaOf,
  areasIn,
  projectImages,
} from '../data/siteData'
import Carousel from '../components/Carousel'
import AiLabel from '../components/AiLabel'
import ProjectFilm from '../components/ProjectFilm'
import { texts } from '../i18n'
import { Link, pathFor, useLang } from '../router'
import { srcSetDi, SIZES } from '../images'

// Formato di tutti i backdrop.webp: riserva lo spazio prima del caricamento.
const BACKDROP_W = 1672
const BACKDROP_H = 941

export default function ProjectDetail({ slug }) {
  const lang = useLang()
  const T = texts(lang)
  const archive = archiveIn(lang)
  const item = archive.find((p) => p.slug === slug)

  // `cover` è solo l'anteprima di griglia/home: non entra nel carosello.
  const { gallery, drawing, backdrop, videoPoster, filmPoster } = projectImages(item)
  // Da 1, come i file 01.webp…NN.webp.
  const photos = gallery.map((src, i) => ({
    src,
    alt: altGallery(item, i, gallery.length, lang),
    ai: aiPhoto(item, i + 1),
  }))
  const reel = item.video ? [{ src: videoPoster, alt: altVideo(item, lang), video: item.video }] : []
  const slides = [...reel, ...photos]

  const area = areasIn(lang).find((a) => a.key === areaOf(item))
  const siblings = archive.filter((p) => areaOf(p) === areaOf(item))
  const i = siblings.findIndex((p) => p.slug === slug)
  const prev = siblings[(i - 1 + siblings.length) % siblings.length]
  const next = siblings[(i + 1) % siblings.length]
  const onlyOne = siblings.length < 2

  const specRows = [
    ...(item.year ? [[T.project.year, item.year]] : []),
    ...Object.entries(item.spec || {}),
    [T.project.designer, item.designer || 'Giovanni Sarchiolla'],
  ]

  return (
    <main className="animate-viewIn">
      <div className="grid grid-cols-1 gap-y-10 md:grid-cols-2 md:items-start md:gap-x-10 lg:gap-x-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="px-5 pt-8 sm:px-8 sm:pt-12 lg:px-[72px] lg:pt-12">
          <Link
            to={pathFor('archive', { area: area?.slug }, lang)}
            className="relative inline-block text-[11px] uppercase tracking-[0.2em] text-muted transition-colors before:absolute before:-inset-x-2 before:-inset-y-2 before:content-[''] hover:text-ink"
          >
            ← {area ? area.label : T.project.archive}
          </Link>

          <h1 className="mt-6 text-[clamp(36px,6vw,88px)] font-bold uppercase leading-[0.9] tracking-[-0.02em] lg:mt-6">
            {item.title}
          </h1>

          <div className="mt-8 border-t border-line pt-8">
            <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-muted">
              {item.cat}
            </div>
            {item.desc?.trim() && (
              <p className="m-0 max-w-[52ch] text-[clamp(16px,1.35vw,19px)] leading-[1.5]">
                {item.desc}
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pt-8 sm:px-8 sm:pt-12 md:px-0 lg:pt-12">
          {/* `key`: rimonta il carosello cambiando scheda (vedi Carousel). */}
          {slides.length > 0 ? (
            <Carousel key={item.slug} images={slides} title={item.title} />
          ) : (
            /* Senza immagini la cornice resta, o la colonna rimane a metà. */
            <div className="flex aspect-square w-full items-center justify-center bg-placeholder">
              <span className="text-[11px] uppercase tracking-[0.24em] text-muted">
                {T.project.incomingPhoto}
              </span>
            </div>
          )}
        </div>
      </div>

      <section className="px-5 sm:px-8 lg:px-[72px]">
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 md:mt-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-y-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-12">
          <div className="flex flex-col border-t border-line pt-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
              {T.project.card}
            </div>
            <div className="mt-6 flex flex-1 items-center">
              <dl className="grid w-full grid-cols-1 gap-0 border-t border-line-soft">
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
          </div>

          {/* Da md, accanto alla scheda, il disegno esce dal flusso e ne prende l'altezza:
              parte dal filo del `dl` (pt-6 + etichetta da 15px + mt-6). Sotto, altezza fissa. */}
          {drawing && (
            <figure className="relative m-0 border-t border-line pt-6">
              <img
                src={drawing}
                srcSet={srcSetDi(drawing)}
                sizes={SIZES.half}
                alt={altDrawing(item, lang)}
                loading="lazy"
                decoding="async"
                className="mt-6 h-[clamp(260px,calc(var(--screen-height,100vh)*0.38),420px)] w-full object-contain md:absolute md:inset-x-0 md:top-[calc(3rem+15px)] md:mt-0 md:h-[calc(100%-3rem-15px)]"
              />
            </figure>
          )}
        </div>
      </section>

      {item.works && item.works.length > 0 && (
        <section className="px-5 pt-14 sm:px-8 lg:px-[72px] lg:pt-20">
          <h2 className="mb-8 border-t border-line pt-6 text-[clamp(18px,2.2vw,28px)] font-bold uppercase tracking-[-0.01em]">
            {T.project.iWorks}
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

      {/* Parte solo col play, anche col consenso: quaggiù si arriva scorrendo. */}
      {filmPoster && (
        <section className="px-5 pt-14 sm:px-8 lg:px-[72px] lg:pt-20">
          {/* Il player è centrato e più stretto: sopra lo stesso stacco che la sezione dopo lascia sotto. */}
          <figure className="m-0 border-t border-line pt-14 lg:pt-20">
            <ProjectFilm
              videoId={item.film}
              title={item.title}
              poster={filmPoster}
              alt={altVideo(item, lang)}
            />
          </figure>
        </section>
      )}

      {backdrop && (
        <section className="px-5 pt-14 sm:px-8 lg:px-[72px] lg:pt-20">
          <figure className="relative m-0 border-t border-line pt-6">
            <img
              src={backdrop}
              srcSet={srcSetDi(backdrop)}
              sizes={SIZES.filled}
              alt={altBackdrop(item, lang)}
              loading="lazy"
              decoding="async"
              width={BACKDROP_W}
              height={BACKDROP_H}
              className="h-auto w-full object-cover"
            />
            <AiLabel kind={item.ai?.backdrop} />
          </figure>
        </section>
      )}

      {onlyOne ? (
        <section className="mt-14 border-t border-line sm:mt-20 lg:mt-28">
          <Link
            to={pathFor('archive', { area: area?.slug }, lang)}
            className="group block px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
          >
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
              {T.project.backTo}
            </div>
            <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
              {area ? area.label : T.project.archive}
            </div>
          </Link>
        </section>
      ) : (
      <section className="mt-14 grid grid-cols-2 border-t border-line sm:mt-20 lg:mt-28">
        <Link
          to={pathFor('project', { slug: prev.slug }, lang)}
          className="group border-r border-line px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.project.previous}
          </div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            {prev.title}
          </div>
        </Link>
        <Link
          to={pathFor('project', { slug: next.slug }, lang)}
          className="group px-5 py-10 text-right transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.project.next}
          </div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            {next.title}
          </div>
        </Link>
      </section>
      )}
    </main>
  )
}
