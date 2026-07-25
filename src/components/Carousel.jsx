import { useEffect, useState } from 'react'

/*
 * Carosello immagini con avanzamento automatico.
 * - crossfade tra le immagini (una visibile alla volta)
 * - autoplay ogni 2s, in pausa al passaggio del mouse / focus
 * - controlli manuali: frecce, puntini, contatore; frecce da tastiera
 * - rispetta prefers-reduced-motion (niente autoplay)
 * Pensato per stare accanto alla descrizione fissa nella scheda progetto.
 */
const INTERVAL = 2000

export default function Carousel({ images, title }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = images.length

  const go = (i) => setIndex((i + n) % n)
  const next = () => go(index + 1)
  const prev = () => go(index - 1)

  useEffect(() => {
    if (n <= 1 || paused) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % n), INTERVAL)
    return () => clearTimeout(timer)
  }, [index, paused, n])

  if (n === 0) return null

  return (
    <div
      className="group relative mx-auto w-full max-w-[560px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="group"
      aria-roledescription="carosello"
      aria-label={`Immagini di ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
    >
      {/*
       * Cornice a misura fissa: non dipende dal formato dell'immagine mostrata,
       * quindi non si muove cambiando diapositiva. Le foto vi stanno dentro con
       * object-contain, sul fondo carta della pagina.
       */}
      <div className="relative h-[400px] overflow-hidden bg-paper sm:h-[480px] lg:h-[560px]">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${title} · ${i + 1}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchpriority={i === 0 ? 'high' : undefined}
            decoding="async"
            aria-hidden={i !== index}
            className={`absolute inset-0 h-full w-full object-contain p-4 contrast-[1.02] transition-opacity duration-700 ease-[cubic-bezier(.2,.7,.2,1)] sm:p-6 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Frecce */}
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Immagine precedente"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-paper/80 text-ink opacity-0 backdrop-blur-sm transition-opacity hover:bg-paper focus-visible:opacity-100 group-hover:opacity-100"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Immagine successiva"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-paper/80 text-ink opacity-0 backdrop-blur-sm transition-opacity hover:bg-paper focus-visible:opacity-100 group-hover:opacity-100"
            >
              →
            </button>

            {/* Contatore */}
            <div className="absolute right-3 top-3 bg-ink/85 px-2 py-1 text-[10px] tracking-[0.14em] text-paper">
              {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </div>
          </>
        )}
      </div>

      {/* Puntini */}
      {n > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Vai all'immagine ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-ink' : 'w-1.5 bg-dot hover:bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
