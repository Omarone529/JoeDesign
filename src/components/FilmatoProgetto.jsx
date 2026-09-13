import { useState } from 'react'
import VideoYouTube from './VideoYouTube'
import { srcSetDi, MISURE } from '../immagini'

/*
 * Filmato orizzontale in fondo alla scheda. ⚠️ Parte solo premendo play, anche col consenso:
 * sotto la piega giocherebbe senza essere visto. Nell'HTML statico non deve finire l'iframe.
 */
const POSTER_W = 1280
const POSTER_H = 720

export default function FilmatoProgetto({ videoId, title, poster, alt }) {
  const [attivo, setAttivo] = useState(false)

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-night">
      {/* Il poster resta sotto il player: montandolo l'iframe lo copre per
          intero, e toglierlo dal DOM farebbe lampeggiare il fondo scuro nel
          frattempo che YouTube carica. */}
      <img
        src={poster}
        srcSet={srcSetDi(poster)}
        sizes={MISURE.piena}
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
        attivo={attivo}
        /* Premuto a mano: parte com'è giusto, con il sonoro. Qui non esiste
           l'altra partenza, quella muta, che nel carosello serve al reel. */
        muto={false}
        onAvvia={() => setAttivo(true)}
      />
    </div>
  )
}
