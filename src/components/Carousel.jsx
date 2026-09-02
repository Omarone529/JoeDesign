import { useEffect, useRef, useState } from 'react'
import { fotoFit } from '../data/fotoFit'
import { testi } from '../i18n'
import { useLang } from '../router'
import { animazioniRidotte } from '../motion'
import { useConsensoVideo } from '../consenso'
import VideoShort from './VideoShort'

const INTERVAL = 2000
// Sulla slide del reel lo scorrimento rallenta: due secondi bastano a vedere un
// fotogramma, non a decidere di guardarlo e a centrare il tasto play.
const INTERVAL_VIDEO = 6000
const SWIPE = 45 // spostamento minimo del dito perché valga come cambio foto

// `night`, lo stesso fondo del footer. Un verticale su fondo chiaro sembra una
// foto tagliata male; su fondo scuro è la forma in cui i reel si guardano.
const FONDO_VIDEO = '#0a0908'

/*
 * Carosello della scheda progetto. `images` è una lista di `{ src, alt }`.
 *
 * L'ultima slide può essere il reel del progetto: porta in più `video`, l'id
 * dello Short. La sua `src` è una miniatura del sito come tutte le altre, e
 * resta tale finché non si preme play — il player lo monta `VideoShort`, che
 * spiega perché non basti incorporare l'iframe e via.
 *
 * Il tetto di dimensione sta sulla LARGHEZZA: con `aspect-square` l'altezza la
 * segue, quindi limitare quella tiene il quadrato dentro la prima schermata.
 *
 * Le slide sono impilate nello stesso riquadro, quindi per il browser sono
 * tutte nel viewport e `loading="lazy"` non ne rimanda nessuna: il `src` va
 * dato a mano (vedi `caricate`), o parte l'intera galleria al primo paint.
 *
 * Va montato con `key` sullo slug: senza, cambiando scheda React riusa
 * l'istanza e `index` resta quello di prima — su una galleria più corta non
 * corrisponde a nessuna slide, e il riquadro resta vuoto.
 */
export default function Carousel({ images, title }) {
  const T = testi(useLang())
  const consenso = useConsensoVideo()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // Slide con il `src` assegnato. Parte dalla sola prima, l'unica che ce l'ha
  // anche nell'HTML pre-renderizzato: nessun mismatch in hydration. Chi entra
  // non esce più, così tornare indietro non riscarica.
  const [caricate, setCaricate] = useState(() => new Set([0]))
  // Lo Short in riproduzione. Non tocca `paused`, che resta la scelta di chi
  // guarda: uscendo dalla slide lo scorrimento riprende da sé.
  const [videoAttivo, setVideoAttivo] = useState(false)
  const [videoMuto, setVideoMuto] = useState(false)
  const avviatoDaSolo = useRef(false)
  const n = images.length
  const slideVideo = images[index]?.video || null

  const tocco = useRef(null) // { x, y, trascinato } del tocco in corso
  const primoGiro = useRef(true)

  /*
   * Il reel apre la scheda e parte da sé, una volta sola: `avviatoDaSolo`
   * impedisce che il ciclo del carosello lo faccia ripartire a ogni giro.
   * Muto per forza — i browser non lasciano partire l'audio da solo — e fermo
   * del tutto se chi guarda ha chiesto meno animazioni.
   *
   * Ma prima di tutto: solo con il consenso. Senza, o prima che sia stato dato,
   * non parte niente e non si contatta nessuno — resta la miniatura del sito
   * col tasto play, che vale come consenso per quel video soltanto.
   *
   * Non prima del `load`, come per le slide vicine qui sotto: il player di
   * YouTube pesa quasi un megabyte e partendo insieme alla pagina toglierebbe
   * banda alla prima immagine e al resto della scheda. Su una navigazione
   * interna il `load` è già passato e non tornerà, quindi lì si parte subito.
   */
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
    // Ogni cambio slide passa di qui — frecce, pallini, dito. L'autoplay no, ma
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

  useEffect(() => {
    if (n <= 1 || paused || videoAttivo || animazioniRidotte()) return
    const attesa = slideVideo ? INTERVAL_VIDEO : INTERVAL
    const timer = setTimeout(() => setIndex((i) => (i + 1) % n), attesa)
    return () => clearTimeout(timer)
  }, [index, paused, videoAttivo, slideVideo, n])

  if (n === 0) return null

  // La foto mostrata intera non copre la cornice: il colore del suo bordo
  // (`fondo`, da `fotoFit`) riempie lo scoperto. Cambia con la foto, in
  // dissolvenza come lei; senza, resta il grigio di `bg-placeholder`.
  const fondo = slideVideo ? FONDO_VIDEO : fotoFit[images[index]?.src]?.fondo

  return (
    // Le frecce da tastiera raccolgono gli eventi in risalita dai comandi veri,
    // che sono tutti <button>. Il contenitore non è focusabile di suo.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="group relative mx-auto w-full max-w-[calc(100vh-9rem)] md:ml-auto md:mr-0"
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
        {/* I formati d'archivio sono disparati: riempiono tutti la cornice, e
            dove il ritaglio farebbe danno `fotoFit` dice come rimediare. */}
        {images.map(({ src, alt, video }, i) => {
          // Il 9:16 del reel nella cornice quadrata si mostra intero: tagliarlo
          // per riempire vorrebbe dire buttare via metà inquadratura.
          const fit = video ? { fit: 'contain' } : fotoFit[src]
          return (
            <img
              key={src}
              src={caricate.has(i) ? src : undefined}
              alt={alt}
              aria-hidden={i !== index}
              fetchpriority={i === 0 ? 'high' : undefined}
              decoding="async"
              style={fit?.pos ? { objectPosition: fit.pos } : undefined}
              className={`absolute inset-0 h-full w-full contrast-[1.02] transition-opacity duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
                fit?.fit === 'contain' ? 'object-contain' : 'object-cover'
              } ${i === index ? 'opacity-100' : 'opacity-0'}`}
            />
          )
        })}

        {/* Solo sulla slide in vista: il tasto play delle altre sarebbe
            invisibile ma raggiungibile da tastiera. */}
        {slideVideo && (
          <VideoShort
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
              className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center bg-paper/80 text-ink opacity-0 backdrop-blur-sm transition-opacity hover:bg-paper focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={T.carosello.successiva}
              className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center bg-paper/80 text-ink opacity-0 backdrop-blur-sm transition-opacity hover:bg-paper focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
            >
              →
            </button>

            {/* Il contatore è anche il comando di pausa, e dev'essere un
                controllo vero: lo scorrimento parte da solo, e la WCAG 2.2.2
                chiede di poterlo fermare da tastiera. */}
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? T.carosello.riprendi : T.carosello.pausa}
              className="absolute right-2 top-2 flex items-center gap-2 bg-ink/85 px-2 py-1 text-[10px] tracking-[0.14em] text-paper transition-colors hover:bg-ink sm:right-4 sm:top-4"
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
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={T.carosello.vaiA(i + 1)}
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
