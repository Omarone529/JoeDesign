import { testi } from '../i18n'
import { useLang } from '../router'

/*
 * Player YouTube, controllato da chi lo monta (miniatura compresa). L'iframe (nocookie) compare
 * solo dopo il play: ⚠️ nell'HTML statico non deve finire nessun iframe. `muto` per l'autoplay,
 * che i browser consentono solo senza audio; `loop` vuole anche `playlist`.
 */
export default function VideoYouTube({ videoId, title, attivo, muto, onAvvia }) {
  const T = testi(useLang()).progetto

  if (attivo) {
    const parametri = [
      'autoplay=1',
      'rel=0',
      'playsinline=1',
      ...(muto ? ['mute=1', 'loop=1', `playlist=${videoId}`] : []),
    ].join('&')
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?${parametri}`}
        title={T.videoTitolo(title)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    )
  }

  // Gruppo con nome: dentro il `group` del carosello un group-hover anonimo risponderebbe a quello.
  return (
    <button
      type="button"
      onClick={onAvvia}
      aria-label={T.videoPlay(title)}
      className="group/play absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center border-0 bg-transparent p-0"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/90 transition-transform group-hover/play:scale-105">
        {/* Triangolo pieno, spostato di un pelo a destra: centrato sul suo
            riquadro sembrerebbe storto. */}
        <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-[3px] h-6 w-6 fill-ink">
          <path d="M6 3.5v17l15-8.5z" />
        </svg>
      </span>
    </button>
  )
}
