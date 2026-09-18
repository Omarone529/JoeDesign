import { texts } from '../i18n'
import { useLang } from '../router'

// Marchio AI GENERATED / AI MODIFIED (vedi `aiPhoto`). <img> con alt nella lingua della pagina;
// `kind` nullo = niente etichetta.
const BADGES = {
  generated: '/images/labels/ai-generated.svg',
  modified: '/images/labels/ai-modified.svg',
}

export default function AiLabel({ kind, className = '', ...rest }) {
  const T = texts(useLang())
  if (!kind || !BADGES[kind]) return null

  return (
    <img
      src={BADGES[kind]}
      alt={T.ai[kind]}
      decoding="async"
      // Non intercetta il clic: sulla foto quel clic mette in pausa il carosello.
      className={`pointer-events-none absolute bottom-3 left-3 h-[18px] w-auto sm:bottom-4 sm:left-4 sm:h-[22px] ${className}`}
      {...rest}
    />
  )
}
