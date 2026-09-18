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
    <div className="relative aspect-video w-full overflow-hidden bg-night">
      {/* Il poster resta sotto il player, che lo copre per intero: togliendolo
          dal DOM il fondo scuro lampeggerebbe mentre YouTube carica. */}
      <img
        src={poster}
        srcSet={srcSetDi(poster)}
        sizes={SIZES.filled}
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
