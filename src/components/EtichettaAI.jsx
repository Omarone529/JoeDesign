import { testi } from '../i18n'
import { useLang } from '../router'

// Marchio AI GENERATED / AI MODIFIED (vedi `aiFoto`). <img> con alt nella lingua della pagina;
// `tipo` nullo = niente etichetta.
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
