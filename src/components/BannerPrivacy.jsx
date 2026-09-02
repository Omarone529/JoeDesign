import { impostaConsensoVideo, useConsensoVideo, useMontato } from '../consenso'
import { testi } from '../i18n'
import { Link, percorso, useLang } from '../router'

/*
 * Il banner cookie e privacy.
 *
 * Dice una cosa scomoda per un banner: di cookie, qui, non ce n'è. Il sito non
 * ne usa di propri e non misura niente, quindi l'unica cosa che un consenso lo
 * richiede davvero è il reel di YouTube di alcune schede. Scrivere «usiamo i
 * cookie per migliorare la tua esperienza» sarebbe falso, e il banner esiste
 * proprio per non dire falsità.
 *
 * Montato in `App.jsx`, quindi su tutte le pagine e non solo sulle schede col
 * reel: la domanda dev'essere fatta all'ingresso, in home, non quando si è già
 * dentro una scheda con il video pronto a partire. Resta finché non si risponde.
 *
 * Fascia in fondo alla pagina, allineata al passo orizzontale delle sezioni:
 * il sito è fatto di righe che vanno da bordo a bordo, e un riquadro appoggiato
 * in un angolo ci starebbe come un adesivo. Non sbarra la pagina — si legge e
 * si naviga lo stesso — e non copre la navigazione, che sta in alto.
 *
 * Non ha un tasto per chiuderlo senza scegliere: chiuderlo e basta lascerebbe
 * la domanda in sospeso facendo credere di aver acconsentito, che è il difetto
 * di metà dei banner in giro. I due tasti pesano uguale, per la stessa ragione.
 *
 * Rispondere "no" non toglie niente: il reel resta la figura del sito che è
 * già, e premendo play parte lo stesso. Il banner decide se possa partire DA
 * SOLO, non se si possa guardare.
 */
export default function BannerPrivacy() {
  const lang = useLang()
  const T = testi(lang).banner
  const consenso = useConsensoVideo()
  const montato = useMontato()

  if (!montato || consenso) return null

  return (
    /*
     * L'ombra sale verso l'alto (`0 -1px 32px`): la fascia sta in fondo, e
     * un'ombra buttata in giù finirebbe fuori schermo senza staccare niente.
     */
    <div
      role="region"
      aria-label={T.aria}
      className="fixed inset-x-0 bottom-0 z-50 animate-viewIn border-t border-ink bg-paper shadow-[0_-1px_32px_rgba(20,17,15,.07)]"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-12 md:py-6 lg:px-[72px]">
        <div className="max-w-[76ch]">
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">{T.occhiello}</div>

          {/* Una frase che apre, poi il dettaglio in tono minore: la stessa
              gerarchia delle sezioni del sito, occhiello e corpo. */}
          <p className="m-0 mt-3 text-[clamp(14px,1.15vw,16px)] leading-[1.45]">{T.testo}</p>
          <p className="m-0 mt-2 text-[13px] leading-[1.5] text-ink/70">
            {T.dettaglio}{' '}
            <Link
              to={percorso('privacy', {}, lang)}
              className="whitespace-nowrap underline underline-offset-2 transition-colors hover:text-ink"
            >
              {T.informativa}
            </Link>
          </p>
        </div>

        {/* Larghezza minima uguale per i due tasti: pesano lo stesso perché
            devono pesare lo stesso, non perché il testo è lungo uguale. */}
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => impostaConsensoVideo('no')}
            className="min-w-[8rem] flex-1 border border-line px-5 py-3 text-[11px] uppercase tracking-[0.16em] transition-colors hover:border-ink hover:bg-hover md:flex-none"
          >
            {T.rifiuta}
          </button>
          <button
            type="button"
            onClick={() => impostaConsensoVideo('si')}
            className="min-w-[8rem] flex-1 border border-ink bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-night md:flex-none"
          >
            {T.attiva}
          </button>
        </div>
      </div>
    </div>
  )
}
