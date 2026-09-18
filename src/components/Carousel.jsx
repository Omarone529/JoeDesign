import { Fragment, useEffect, useRef, useState } from 'react'
import { photoFit } from '../data/photoFit'
import { srcSetDi, SIZES } from '../images'
import { texts } from '../i18n'
import { useLang } from '../router'
import { reducedMotion } from '../motion'
import { useVideoConsent } from '../consent'
import VideoYouTube from './VideoYouTube'
import AiLabel from './AiLabel'

const INTERVAL = 2000
// Sulla slide del reel: a due secondi il tasto play non è colpibile.
const INTERVAL_VIDEO = 6000
const SWIPE = 45 // spostamento minimo del dito perché valga come cambio foto

// `night`: un verticale su fondo chiaro sembra una foto tagliata male.
const VIDEO_BACKGROUND = '#0a0908'

/*
 * Carosello della scheda: `images` è `[{ src, alt }]`, una slide può avere `video`.
 * Le slide sono impilate, quindi `loading=lazy` non basta: i `src` li dà `loaded`.
 * Va montato con `key` sullo slug, o `index` resta quello della scheda precedente.
 */
export default function Carousel({ images, title }) {
  const T = texts(useLang())
  const consent = useVideoConsent()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // Slide con il `src` assegnato. Parte dalla sola prima, l'unica che ce l'ha
  // anche nell'HTML pre-renderizzato: nessun mismatch in hydration.
  const [loaded, setLoaded] = useState(() => new Set([0]))
  // Lo Short in riproduzione. Non tocca `paused`, che resta la scelta di chi guarda.
  const [videoActive, setVideoActive] = useState(false)
  const [videoMuted, setVideoMuted] = useState(false)
  // Pausa automatica fuori vista o a scheda nascosta (diversa da `paused`, che sceglie chi guarda).
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)
  const container = useRef(null)
  const autoStarted = useRef(false)
  const n = images.length
  const slideVideo = images[index]?.video || null

  const touch = useRef(null) // { x, y, trascinato } del tocco in corso
  const firstRun = useRef(true)

  // Il reel parte da solo una volta, muto, solo col consenso e dopo il `load` della pagina.
  useEffect(() => {
    if (consent !== 'yes') return
    if (autoStarted.current || index !== 0 || !images[0]?.video) return
    if (reducedMotion()) return

    const start = () => {
      autoStarted.current = true
      setVideoMuted(true)
      setVideoActive(true)
    }

    if (document.readyState === 'complete') {
      const t = setTimeout(start, 0)
      return () => clearTimeout(t)
    }
    window.addEventListener('load', start, { once: true })
    return () => window.removeEventListener('load', start)
  }, [consent, index, images])

  const go = (i) => {
    // Ogni cambio slide passa di qui: frecce, pallini, dito. L'autoplay no, ma
    // mentre lo Short va è fermo, quindi non può scavalcare questa riga.
    setVideoActive(false)
    setVideoMuted(false)
    setIndex((i + n) % n)
  }
  const next = () => go(index + 1)
  const prev = () => go(index - 1)

  const touchStart = (e) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY, dragged: false }
  }

  const touchEnd = (e) => {
    if (!touch.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current.x
    const dy = t.clientY - touch.current.y
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy)) return
    touch.current.dragged = true
    if (dx < 0) next()
    else prev()
  }

  // Slide corrente più le due vicine. Al primo giro aspetta il `load`: la prima
  // è l'elemento LCP della scheda e le vicine le toglierebbero banda.
  useEffect(() => {
    const expand = () =>
      setLoaded((prevSet) => {
        const neighbors = [index, (index + 1) % n, (index - 1 + n) % n]
        if (neighbors.every((i) => prevSet.has(i))) return prevSet // stesso riferimento: niente render in più
        const nextSet = new Set(prevSet)
        neighbors.forEach((i) => nextSet.add(i))
        return nextSet
      })

    const immediate = !firstRun.current || document.readyState === 'complete'
    firstRun.current = false
    if (immediate) {
      expand()
      return
    }
    window.addEventListener('load', expand, { once: true })
    return () => window.removeEventListener('load', expand)
  }, [index, n])

  // Fuori dallo schermo il carosello non scorre.
  useEffect(() => {
    const el = container.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* Stessa ragione, per la scheda del browser passata in secondo piano. */
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  const advancing = n > 1 && !paused && !videoActive && inView && tabVisible

  useEffect(() => {
    if (!advancing || reducedMotion()) return
    const wait = slideVideo ? INTERVAL_VIDEO : INTERVAL
    const timer = setTimeout(() => setIndex((i) => (i + 1) % n), wait)
    return () => clearTimeout(timer)
  }, [index, advancing, slideVideo, n])

  if (n === 0) return null

  // Col player montato lo swipe non arriva (iframe di altro dominio): frecce sempre visibili.
  const pinnedArrows = videoActive
  const arrowClass = `absolute top-1/2 z-10 h-12 w-12 -translate-y-1/2 items-center justify-center bg-paper/80 text-ink backdrop-blur-sm transition-opacity hover:bg-paper focus-visible:opacity-100 sm:flex ${
    pinnedArrows ? 'flex opacity-100' : 'hidden opacity-0 group-hover:opacity-100'
  }`

  // La foto mostrata intera non copre la cornice: il colore del suo bordo
  // (`bg`, da `photoFit`) riempie lo scoperto, in dissolvenza come lei.
  const bg = slideVideo ? VIDEO_BACKGROUND : photoFit[images[index]?.src]?.bg

  return (
    // Le frecce da tastiera raccolgono gli eventi in risalita dai comandi veri,
    // che sono tutti <button>. Il contenitore non è focusabile di suo.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={container}
      className="group relative mx-auto w-full max-w-[calc(var(--screen-height,100vh)-9rem)] md:ml-auto md:mr-0"
      role="group"
      aria-roledescription="carosello"
      aria-label={T.carousel.imagesOf(title)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
    >
      {/* Clic sulla foto = pausa: scorciatoia col mouse. L'equivalente da
          tastiera è il pulsante contatore qui sotto. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative aspect-square w-full cursor-pointer select-none overflow-hidden bg-placeholder transition-colors duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
        style={bg ? { backgroundColor: bg } : undefined}
        onTouchStart={touchStart}
        onTouchEnd={touchEnd}
        onClick={(e) => {
          if (e.target.closest('button') || touch.current?.dragged) return
          setPaused((p) => !p)
        }}
      >
        {images.map(({ src, alt, video, ai }, i) => {
          // Il 9:16 del reel si mostra intero: tagliarlo butterebbe metà inquadratura.
          const fit = video ? { fit: 'contain' } : photoFit[src]
          // Foto ed etichetta svaniscono insieme: le slide sono impilate, e una
          // targhetta rimasta indietro dichiarerebbe la foto sbagliata.
          const fade = `transition-opacity duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`
          return (
            <Fragment key={src}>
              <img
                src={loaded.has(i) ? src : undefined}
                srcSet={loaded.has(i) ? srcSetDi(src) : undefined}
                sizes={SIZES.carousel}
                alt={alt}
                aria-hidden={i !== index}
                fetchpriority={i === 0 ? 'high' : undefined}
                decoding="async"
                style={fit?.pos ? { objectPosition: fit.pos } : undefined}
                className={`absolute inset-0 h-full w-full contrast-[1.02] ${
                  fit?.fit === 'contain' ? 'object-contain' : 'object-cover'
                } ${fade}`}
              />
              <AiLabel kind={ai} aria-hidden={i !== index} className={fade} />
            </Fragment>
          )
        })}

        {/* Solo la slide in vista: il tasto play delle altre sarebbe invisibile
            ma raggiungibile da tastiera. */}
        {slideVideo && (
          <VideoYouTube
            videoId={slideVideo}
            title={title}
            active={videoActive}
            muted={videoMuted}
            onStart={() => {
              setVideoMuted(false) // premuto a mano: con l'audio
              setVideoActive(true)
            }}
          />
        )}

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label={T.carousel.previous}
              className={`left-4 ${arrowClass}`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={T.carousel.next}
              className={`right-4 ${arrowClass}`}
            >
              →
            </button>

            {/* Il contatore è anche il comando di pausa: lo scorrimento parte da
                solo, e la WCAG 2.2.2 chiede di poterlo fermare da tastiera. */}
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? T.carousel.resume : T.carousel.pause}
              className="absolute right-2 top-2 z-10 flex items-center gap-2 bg-ink/85 px-2 py-1 before:absolute before:-inset-1 before:content-[''] text-[10px] tracking-[0.14em] text-paper transition-colors hover:bg-ink sm:right-4 sm:top-4"
            >
              {paused && <span aria-hidden="true">▌▌</span>}
              <span>
                {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
            </button>
          </>
        )}
      </div>

      {n > 1 && (
        /* `before` allarga il bersaglio dei pallini; lo stacco di 20px evita che si accavallino.
           `px-2.5` tiene dentro l'allargamento degli estremi, che a fila piena sbordava dallo schermo. */
        <div className="mt-4 flex flex-wrap items-center justify-center gap-5 px-2.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={T.carousel.goToSlide(i + 1)}
              aria-current={i === index}
              className={`relative h-1.5 rounded-full transition-all before:absolute before:-inset-x-2.5 before:-inset-y-3 before:content-[''] ${
                i === index ? 'w-6 bg-ink' : 'w-1.5 bg-muted hover:bg-ink'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
