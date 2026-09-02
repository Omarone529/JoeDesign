import { testi } from '../i18n'
import { useLang } from '../router'

/*
 * Etichetta AI Act sopra un'immagine di sintesi. Quali immagini la portano lo
 * dice il campo `ai` del progetto, in `siteData` (vedi `aiFoto`).
 *
 * Il marchio è quello standard "AI GENERATED" / "AI MODIFIED", ritinto con
 * l'`ink` del sito e alla stessa opacità del contatore del carosello: sulla
 * foto è già presente un riquadro scuro con micro-testo chiaro, e due modi
 * diversi di appoggiare una targhetta sulla stessa immagine sarebbero due voci.
 *
 * È un <img> con `alt` e non un fondo CSS: la scritta dentro il marchio è
 * disegnata e in inglese, quindi la frase per intero — e nella lingua della
 * pagina — la deve dare il testo alternativo. `tipo` nullo = niente etichetta,
 * così chi la usa non deve avvolgerla in una condizione.
 */
const MARCHIO = {
  generata: '/images/etichette/ai-generata.svg',
  modificata: '/images/etichette/ai-modificata.svg',
}

export default function EtichettaAI({ tipo, className = '', ...resto }) {
  const T = testi(useLang())
  if (!tipo || !MARCHIO[tipo]) return null

  return (
    <img
      src={MARCHIO[tipo]}
      alt={T.ai[tipo]}
      decoding="async"
      // Non intercetta il clic: sulla foto quel clic mette in pausa il
      // carosello, e una targhetta non può essere un buco nel comando.
      className={`pointer-events-none absolute bottom-3 left-3 h-[18px] w-auto sm:bottom-4 sm:left-4 sm:h-[22px] ${className}`}
      {...resto}
    />
  )
}
