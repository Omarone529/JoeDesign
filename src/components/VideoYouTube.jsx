import { testi } from '../i18n'
import { useLang } from '../router'

/*
 * Il video di YouTube dentro la scheda progetto: il tasto play e, una volta
 * premuto, il player. Lo usano in due, e il formato non lo decide questo file:
 * il carosello per il reel verticale (`Carousel.jsx`) e la fascia in fondo alla
 * pagina per il filmato orizzontale (`FilmatoProgetto.jsx`). Qui dentro non c'è
 * niente di 9:16 né di 16:9 — l'iframe riempie il riquadro che trova.
 *
 * La miniatura NON sta qui: chi lo monta ce l'ha già, e nel carosello è una
 * slide come le altre, con la stessa dissolvenza e lo stesso caricamento pigro.
 * Qui c'è solo la parte che riguarda YouTube, che è quella delicata. L'iframe
 * porta con sé
 * quasi un megabyte di script e piazza identificatori nel browser appena la
 * pagina si apre, video avviato o no: su una scheda che serve WebP da 60 KB
 * sarebbe la cosa più pesante, e obbligherebbe a un banner di consenso che oggi
 * non serve. Finché non si preme play in pagina c'è dunque solo un'immagine del
 * sito, e `youtube-nocookie.com` rimanda gli identificatori pubblicitari al
 * momento della riproduzione.
 *
 * Il pre-rendering fotografa lo stato iniziale: nell'HTML statico non finisce
 * nessun iframe, ed è la cosa da ricontrollare se si tocca questo file.
 *
 * Componente controllato: fermare il carosello e far partire lo Short sono la
 * stessa decisione, e chi la prende è il carosello.
 *
 * `muto` distingue le due partenze. Quando il reel parte da sé all'apertura
 * della scheda DEVE essere muto: Chrome, Safari e Firefox bloccano l'autoplay
 * con audio, e senza `mute=1` il player resterebbe fermo sul primo fotogramma.
 * Già che è muto conviene farlo ciclare, come cicla un reel — `loop` da solo
 * non basta, YouTube vuole anche `playlist` con lo stesso id. Premuto a mano,
 * invece, parte com'è giusto: con il sonoro.
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

  /*
   * Gruppo con un nome suo: il carosello è già un `group` e muove le frecce
   * all'hover, e un `group-hover` anonimo qui dentro risponderebbe a quello
   * invece che al proprio riquadro.
   */
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
