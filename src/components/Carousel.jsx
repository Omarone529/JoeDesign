import { Fragment, useEffect, useRef, useState } from 'react'
import { fotoFit } from '../data/fotoFit'
import { srcSetDi, MISURE } from '../immagini'
import { testi } from '../i18n'
import { useLang } from '../router'
import { animazioniRidotte } from '../motion'
import { useConsensoVideo } from '../consenso'
import VideoYouTube from './VideoYouTube'
import EtichettaAI from './EtichettaAI'

const INTERVAL = 2000
// Sulla slide del reel: a due secondi il tasto play non è colpibile.
const INTERVAL_VIDEO = 6000
const SWIPE = 45 // spostamento minimo del dito perché valga come cambio foto

// `night`: un verticale su fondo chiaro sembra una foto tagliata male.
const FONDO_VIDEO = '#0a0908'

/*
 * Carosello della scheda: `images` è `[{ src, alt }]`, una slide può avere `video`.
 * Le slide sono impilate, quindi `loading=lazy` non basta: i `src` li dà `caricate`.
 * Va montato con `key` sullo slug, o `index` resta quello della scheda precedente.
 */
export default function Carousel({ images, title }) {
  const T = testi(useLang())
  const consenso = useConsensoVideo()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // Slide con il `src` assegnato. Parte dalla sola prima, l'unica che ce l'ha
  // anche nell'HTML pre-renderizzato: nessun mismatch in hydration.
  const [caricate, setCaricate] = useState(() => new Set([0]))
  // Lo Short in riproduzione. Non tocca `paused`, che resta la scelta di chi guarda.
  const [videoAttivo, setVideoAttivo] = useState(false)
  const [videoMuto, setVideoMuto] = useState(false)
  // Pausa automatica fuori vista o a scheda nascosta (diversa da `paused`, che sceglie chi guarda).
  const [inVista, setInVista] = useState(true)
  const [schedaVisibile, setSchedaVisibile] = useState(true)
  const contenitore = useRef(null)
  const avviatoDaSolo = useRef(false)
  const n = images.length
  const slideVideo = images[index]?.video || null

  const tocco = useRef(null) // { x, y, trascinato } del tocco in corso
  const primoGiro = useRef(true)

  // Il reel parte da solo una volta, muto, solo col consenso e dopo il `load` della pagina.
  useEffect(() => {
    if (consenso !== 'si') return
    if (avviatoDaSolo.current || index !== 0 || !images[0]?.video) return
    if (animazioniRidotte()) return

    const avvia = () => {
      avviatoDaSolo.current = true
      setVideoMuto(true)
      setVideoAttivo(true)
    }

    if (document.readyState === 'complete') {
      const t = setTimeout(avvia, 0)
      return () => clearTimeout(t)
    }
    window.addEventListener('load', avvia, { once: true })
    return () => window.removeEventListener('load', avvia)
  }, [consenso, index, images])

  const go = (i) => {
    // Ogni cambio slide passa di qui: frecce, pallini, dito. L'autoplay no, ma
    // mentre lo Short va è fermo, quindi non può scavalcare questa riga.
    setVideoAttivo(false)
    setVideoMuto(false)
    setIndex((i + n) % n)
  }
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

  // Slide corrente più le due vicine. Al primo giro aspetta il `load`: la prima
  // è l'elemento LCP della scheda e le vicine le toglierebbero banda.
  useEffect(() => {
    const espandi = () =>
      setCaricate((prec) => {
        const vicine = [index, (index + 1) % n, (index - 1 + n) % n]
        if (vicine.every((i) => prec.has(i))) return prec // stesso riferimento: niente render in più
        const succ = new Set(prec)
        vicine.forEach((i) => succ.add(i))
        return succ
      })

    const subito = !primoGiro.current || document.readyState === 'complete'
    primoGiro.current = false
    if (subito) {
      espandi()
      return
    }
    window.addEventListener('load', espandi, { once: true })
    return () => window.removeEventListener('load', espandi)
  }, [index, n])

  // Fuori dallo schermo il carosello non scorre.
  useEffect(() => {
    const el = contenitore.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const osservatore = new IntersectionObserver(([voce]) => setInVista(voce.isIntersecting), {
      threshold: 0.25,
    })
    osservatore.observe(el)
    return () => osservatore.disconnect()
  }, [])

  /* Stessa ragione, per la scheda del browser passata in secondo piano. */
  useEffect(() => {
    const aggiorna = () => setSchedaVisibile(!document.hidden)
    document.addEventListener('visibilitychange', aggiorna)
    return () => document.removeEventListener('visibilitychange', aggiorna)
  }, [])

  const scorre = n > 1 && !paused && !videoAttivo && inVista && schedaVisibile

  useEffect(() => {
    if (!scorre || animazioniRidotte()) return
    const attesa = slideVideo ? INTERVAL_VIDEO : INTERVAL
    const timer = setTimeout(() => setIndex((i) => (i + 1) % n), attesa)
    return () => clearTimeout(timer)
  }, [index, scorre, slideVideo, n])

  if (n === 0) return null

  // Col player montato lo swipe non arriva (iframe di altro dominio): frecce sempre visibili.
  const frecceFisse = videoAttivo
  const classeFreccia = `absolute top-1/2 z-10 h-12 w-12 -translate-y-1/2 items-center justify-center bg-paper/80 text-ink backdrop-blur-sm transition-opacity hover:bg-paper focus-visible:opacity-100 sm:flex ${
    frecceFisse ? 'flex opacity-100' : 'hidden opacity-0 group-hover:opacity-100'
  }`

  // La foto mostrata intera non copre la cornice: il colore del suo bordo
  // (`fondo`, da `fotoFit`) riempie lo scoperto, in dissolvenza come lei.
  const fondo = slideVideo ? FONDO_VIDEO : fotoFit[images[index]?.src]?.fondo

  return (
    // Le frecce da tastiera raccolgono gli eventi in risalita dai comandi veri,
    // che sono tutti <button>. Il contenitore non è focusabile di suo.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={contenitore}
      className="group relative mx-auto w-full max-w-[calc(var(--schermo,100vh)-9rem)] md:ml-auto md:mr-0"
      role="group"
      aria-roledescription="carosello"
      aria-label={T.carosello.immaginiDi(title)}
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
        style={fondo ? { backgroundColor: fondo } : undefined}
        onTouchStart={inizioTocco}
        onTouchEnd={fineTocco}
        onClick={(e) => {
          if (e.target.closest('button') || tocco.current?.trascinato) return
          setPaused((p) => !p)
        }}
      >
        {images.map(({ src, alt, video, ai }, i) => {
          // Il 9:16 del reel si mostra intero: tagliarlo butterebbe metà inquadratura.
          const fit = video ? { fit: 'contain' } : fotoFit[src]
          // Foto ed etichetta svaniscono insieme: le slide sono impilate, e una
          // targhetta rimasta indietro dichiarerebbe la foto sbagliata.
          const dissolvenza = `transition-opacity duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`
          return (
            <Fragment key={src}>
              <img
                src={caricate.has(i) ? src : undefined}
                srcSet={caricate.has(i) ? srcSetDi(src) : undefined}
                sizes={MISURE.carosello}
                alt={alt}
                aria-hidden={i !== index}
                fetchpriority={i === 0 ? 'high' : undefined}
                decoding="async"
                style={fit?.pos ? { objectPosition: fit.pos } : undefined}
                className={`absolute inset-0 h-full w-full contrast-[1.02] ${
                  fit?.fit === 'contain' ? 'object-contain' : 'object-cover'
                } ${dissolvenza}`}
              />
              <EtichettaAI tipo={ai} aria-hidden={i !== index} className={dissolvenza} />
            </Fragment>
          )
        })}

        {/* Solo la slide in vista: il tasto play delle altre sarebbe invisibile
            ma raggiungibile da tastiera. */}
        {slideVideo && (
          <VideoYouTube
            videoId={slideVideo}
            title={title}
            attivo={videoAttivo}
            muto={videoMuto}
            onAvvia={() => {
              setVideoMuto(false) // premuto a mano: con l'audio
              setVideoAttivo(true)
            }}
          />
        )}

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label={T.carosello.precedente}
              className={`left-4 ${classeFreccia}`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={T.carosello.successiva}
              className={`right-4 ${classeFreccia}`}
            >
              →
            </button>

            {/* Il contatore è anche il comando di pausa: lo scorrimento parte da
                solo, e la WCAG 2.2.2 chiede di poterlo fermare da tastiera. */}
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? T.carosello.riprendi : T.carosello.pausa}
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
              aria-label={T.carosello.vaiA(i + 1)}
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
