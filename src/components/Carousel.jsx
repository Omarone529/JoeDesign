import { useEffect, useRef, useState } from 'react'
import { fotoFit } from '../data/fotoFit'
import { animazioniRidotte } from '../motion'

/*
 * Carosello immagini della scheda progetto. Crossfade, autoplay 2s in pausa
 * al clic (non all'hover), swipe su mobile, frecce/puntini/contatore/tastiera
 * da desktop. Rispetta prefers-reduced-motion (niente autoplay).
 */
const INTERVAL = 2000

// Spostamento minimo del dito perché valga come cambio foto e non come tocco.
const SWIPE = 45

export default function Carousel({ images, title }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = images.length

  // Tocco in corso: punto di partenza del dito e se è diventato un trascinamento.
  const tocco = useRef(null)

  const go = (i) => setIndex((i + n) % n)
  const next = () => go(index + 1)
  const prev = () => go(index - 1)

  const inizioTocco = (e) => {
    const t = e.touches[0]
    tocco.current = { x: t.clientX, y: t.clientY, trascinato: false }
  }

  const fineTocco = (e) => {
    if (!tocco.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - tocco.current.x
    const dy = t.clientY - tocco.current.y
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy)) return
    tocco.current.trascinato = true
    if (dx < 0) next()
    else prev()
  }

  useEffect(() => {
    if (n <= 1 || paused || animazioniRidotte()) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % n), INTERVAL)
    return () => clearTimeout(timer)
  }, [index, paused, n])

  if (n === 0) return null

  return (
    <div
      className="group relative mx-auto w-full max-w-[1500px] md:mx-0 md:max-w-none"
      role="group"
      aria-roledescription="carosello"
      aria-label={`Immagini di ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
    >
      {/*
       * Cornice a misura fissa (non dipende dal formato mostrato, così non si
       * muove cambiando foto). Su mobile/tablet altezza legata al viewport ma
       * limitata: lascia spazio a testata sopra e disegno tecnico sotto. Da
       * desktop (md, colonna a piena larghezza fino al bordo destro dello
       * schermo) l'altezza sale molto: la foto occupa davvero il quadrante
       * destro della pagina, grande.
       */}
      <div
        className="relative h-[clamp(320px,54vh,480px)] cursor-pointer select-none overflow-hidden bg-placeholder sm:h-[clamp(400px,62vh,620px)] md:h-[clamp(480px,72vh,880px)]"
        onTouchStart={inizioTocco}
        onTouchEnd={fineTocco}
        // Clic sulla foto = pausa/ripresa; i clic sui comandi e gli swipe non contano.
        onClick={(e) => {
          if (e.target.closest('button') || tocco.current?.trascinato) return
          setPaused((p) => !p)
        }}
      >
        {/*
         * `object-cover`: ogni foto riempie la cornice, così i formati
         * disparati dell'archivio si susseguono uguali, al prezzo di un
         * ritaglio. Dove il ritaglio farebbe danno `fotoFit` dice di mostrarla
         * intera o dove puntare il taglio (lo genera `scripts/fit-foto.js`).
         */}
        {images.map((src, i) => {
          const fit = fotoFit[src]
          return (
            <img
              key={src}
              src={src}
              alt={`${title} · ${i + 1}`}
              aria-hidden={i !== index}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchpriority={i === 0 ? 'high' : undefined}
              decoding="async"
              style={fit?.pos ? { objectPosition: fit.pos } : undefined}
              className={`absolute inset-0 h-full w-full contrast-[1.02] transition-opacity duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
                fit?.fit === 'contain' ? 'object-contain' : 'object-cover'
              } ${i === index ? 'opacity-100' : 'opacity-0'}`}
            />
          )
        })}

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Immagine precedente"
              className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center bg-paper/80 text-ink opacity-0 backdrop-blur-sm transition-opacity hover:bg-paper focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Immagine successiva"
              className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center bg-paper/80 text-ink opacity-0 backdrop-blur-sm transition-opacity hover:bg-paper focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
            >
              →
            </button>

            {/* Contatore - segnala anche quando lo scorrimento è in pausa */}
            <div className="absolute right-2 top-2 flex items-center gap-2 bg-ink/85 px-2 py-1 text-[10px] tracking-[0.14em] text-paper sm:right-4 sm:top-4">
              {paused && <span aria-hidden="true">▌▌</span>}
              <span>
                {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
            </div>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
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
