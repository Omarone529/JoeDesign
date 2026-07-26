import { useEffect, useRef, useState } from 'react'
import { animazioniRidotte } from '../motion'

/*
 * Carosello immagini con avanzamento automatico.
 * - crossfade tra le immagini (una visibile alla volta)
 * - autoplay ogni 2s; si mette in pausa (e riparte) con un clic sulla foto,
 *   non al semplice passaggio del mouse
 * - da telefono si cambia foto trascinando il dito; le frecce compaiono solo
 *   da desktop, in hover, per non appesantire la foto sul piccolo schermo
 * - controlli manuali: frecce, puntini, contatore; frecce da tastiera
 * - rispetta prefers-reduced-motion (niente autoplay)
 * Occupa tutta la larghezza della scheda progetto: le foto sono il contenuto
 * principale, quindi la cornice è la più grande che lo schermo consente.
 */
const INTERVAL = 2000

// Spostamento minimo del dito perché valga come cambio foto e non come tocco.
const SWIPE = 45

// Le foto d'archivio arrivano dal PDF con risoluzioni molto diverse (alcune
// sotto i 600px). Nella cornice grande verrebbero ingrandite troppo e
// uscirebbero sgranate: si consente al massimo questo ingrandimento rispetto
// alla dimensione nativa. Le foto grandi non ne risentono, riempiono comunque.
const MAX_SCALE = 1.8

export default function Carousel({ images, title }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // Dimensioni native, misurate al caricamento: { src: [larghezza, altezza] }
  const [sizes, setSizes] = useState({})
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

  // Cambia foto solo se il movimento è chiaramente orizzontale: così lo
  // scorrimento verticale della pagina resta libero.
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

  // Misura l'immagine appena è disponibile. Serve sia l'onLoad sia il controllo
  // su `complete` via ref: in hydration le foto dell'HTML statico possono
  // essere già caricate prima che React agganci gli handler.
  const misura = (el, src) => {
    if (!el || !el.naturalWidth) return
    setSizes((s) => (s[src] ? s : { ...s, [src]: [el.naturalWidth, el.naturalHeight] }))
  }

  useEffect(() => {
    if (n <= 1 || paused || animazioniRidotte()) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % n), INTERVAL)
    return () => clearTimeout(timer)
  }, [index, paused, n])

  if (n === 0) return null

  return (
    <div
      className="group relative mx-auto w-full max-w-[1500px]"
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
       * quindi non si muove cambiando diapositiva. L'altezza segue il viewport
       * (con minimo e massimo) così la foto è grande su ogni schermo senza mai
       * costringere a scorrere per vederla intera.
       */}
      <div
        className="relative h-[clamp(320px,58vh,540px)] cursor-pointer select-none overflow-hidden bg-paper sm:h-[clamp(420px,68vh,720px)] lg:h-[clamp(540px,76vh,860px)]"
        onTouchStart={inizioTocco}
        onTouchEnd={fineTocco}
        // Clic sulla foto = ferma / riprende lo scorrimento. I clic sui
        // comandi (frecce, contatore) restano solo navigazione, e un
        // trascinamento del dito non deve valere come tocco.
        onClick={(e) => {
          if (e.target.closest('button') || tocco.current?.trascinato) return
          setPaused((p) => !p)
        }}
      >
        {images.map((src, i) => {
          const nat = sizes[src]
          return (
            <div
              key={src}
              aria-hidden={i !== index}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-[cubic-bezier(.2,.7,.2,1)] sm:p-2 lg:p-4 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                ref={(el) => misura(el, src)}
                src={src}
                alt={`${title} · ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchpriority={i === 0 ? 'high' : undefined}
                decoding="async"
                onLoad={(e) => misura(e.currentTarget, src)}
                // Finché non si conoscono le dimensioni native la foto riempie
                // la cornice; dopo la misura viene limitata a MAX_SCALE.
                style={
                  nat
                    ? { width: nat[0] * MAX_SCALE, height: nat[1] * MAX_SCALE }
                    : { width: '100%', height: '100%' }
                }
                className="max-h-full max-w-full object-contain contrast-[1.02]"
              />
            </div>
          )
        })}

        {/* Frecce - solo da desktop e in hover: da telefono si trascina il dito */}
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

      {/* Puntini - centrati sotto la cornice */}
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
