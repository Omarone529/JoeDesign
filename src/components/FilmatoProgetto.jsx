import { useState } from 'react'
import VideoYouTube from './VideoYouTube'
import { srcSetDi, MISURE } from '../immagini'

/*
 * La fascia col filmato del progetto, in fondo alla scheda sopra lo sfondo.
 *
 * È il fratello orizzontale del reel: quello è 9:16, apre il carosello e con il
 * consenso parte da sé; questo è un 16:9 che sta in fondo alla pagina e parte
 * SOLO premendo play. La differenza non è un capriccio: quaggiù si arriva
 * scorrendo, e un video che si avvia da solo sotto la piega giocherebbe senza
 * che nessuno lo veda, dopo aver contattato Google per farlo. Premere play vale
 * come consenso per questo filmato soltanto, ed è la ragione per cui questa
 * fascia non legge `useConsensoVideo`: non ha una partenza automatica da
 * autorizzare.
 *
 * Finché non si preme, in pagina c'è una figura del sito e nient'altro — il
 * pre-rendering fotografa questo stato, quindi nell'HTML statico non finisce
 * nessun iframe. È la cosa da ricontrollare se si tocca questo file.
 *
 * La cornice è `aspect-video` e non un'altezza in pixel: il filmato è 16:9 e la
 * fascia è larga quanto la colonna, quindi l'altezza si ricava da sé a ogni
 * misura di finestra e la pagina non salta quando il poster arriva.
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
