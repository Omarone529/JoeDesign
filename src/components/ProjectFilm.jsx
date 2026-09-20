import { useState } from 'react'
import VideoYouTube from './VideoYouTube'
import { srcSetDi, SIZES } from '../images'

/*
 * Filmato orizzontale in fondo alla scheda. ⚠️ Parte solo premendo play, anche col consenso:
 * sotto la piega giocherebbe senza essere visto. Nell'HTML statico non deve finire l'iframe.
 */
const POSTER_W = 1280
const POSTER_H = 720

export default function ProjectFilm({ videoId, title, poster, alt }) {
  const [active, setActive] = useState(false)

  return (
    /*
     * Il 16:9 prende l'altezza dalla larghezza, quindi si limita la larghezza: 1200px sugli schermi
     * larghi, e su quelli bassi (telefono girato, finestra schiacciata) quanto ne entra in altezza.
     * La riserva di 9rem è quella del carosello.
     */
    <div className="relative mx-auto aspect-video w-full max-w-[min(1200px,calc((var(--screen-height,100vh)-9rem)*16/9))] overflow-hidden bg-night">
      {/* Resta sotto il player: toglierlo farebbe lampeggiare il fondo mentre YouTube carica. */}
      <img
        src={poster}
        srcSet={srcSetDi(poster)}
        sizes={SIZES.film}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={POSTER_W}
        height={POSTER_H}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <VideoYouTube
        videoId={videoId}
        title={title}
        active={active}
        /* Sempre con il sonoro: qui la partenza muta del reel non esiste. */
        muted={false}
        onStart={() => setActive(true)}
      />
    </div>
  )
}
