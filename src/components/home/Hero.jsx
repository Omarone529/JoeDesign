import { Fragment } from 'react'
import { homeHero, profile } from '../../data/siteData'
import { scorrimento } from '../../motion'

/* Tempi dell'ingresso, in secondi. */
const PRIMA_LETTERA = 0.2 // attesa prima che parta il nome
const PASSO_LETTERA = 0.045 // scarto fra una lettera e la successiva
const DOPO_NOME = 1.1 // pausa fra la fine del nome e l'invito a scorrere

/*
 * Hero della homepage: il ritratto di Joe sfocato a tutto schermo, il nome in
 * sovrimpressione e la linea nera in fondo - la stessa su cui si appoggia la
 * foto in "Chi sono" - che chiude insieme l'immagine e la sezione.
 *
 * L'ingresso è scaglionato: il nome entra lettera per lettera, poi compare
 * l'invito a scorrere. Alta quanto la finestra meno la navbar
 * (4rem), in `svh` e non `vh` perché su mobile è l'altezza col browser a barre
 * aperte: la linea resta a filo dello schermo invece di finire sotto la barra
 * degli indirizzi.
 */
export default function Hero() {
  /*
   * "Lavori selezionati" è la sezione successiva, non una rotta: salto interno
   * gestito a mano per rispettare la preferenza sulle animazioni. L'href resta
   * valido per il tasto centrale e il "copia indirizzo".
   */
  const vaiAiLavori = (e) => {
    const lavori = document.getElementById('lavori')
    if (!lavori) return // senza la sezione in pagina resta il salto nativo
    e.preventDefault()
    lavori.scrollIntoView({ behavior: scorrimento(), block: 'start' })
  }

  // Ritardo progressivo lettera per lettera, contato sull'intero nome e non
  // sulla singola parola: le lettere entrano in fila da J a A.
  let lettereContate = 0
  const parole = profile.displayName.split(' ').map((parola) => ({
    parola,
    lettere: [...parola].map((lettera) => ({
      lettera,
      ritardo: PRIMA_LETTERA + lettereContate++ * PASSO_LETTERA,
    })),
  }))

  const ritardoScorri = PRIMA_LETTERA + lettereContate * PASSO_LETTERA + DOPO_NOME

  // Padding verticale simmetrico: ora che il nome è l'unico contenuto,
  // `justify-center` lo lascia esattamente al centro della sezione.
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden border-b-2 border-ink px-5 py-24 text-center sm:px-8 lg:px-[72px]">
      {/*
       * Sfondo. `object-contain` tiene la figura intera dentro l'altezza della
       * sezione - ritagliandola (`cover`) su schermo largo resterebbe solo la
       * testa - e `object-bottom` la appoggia alla linea in fondo.
       *
       * `mix-blend-multiply` fa sparire il riquadro della foto: il fondo dello
       * scatto è bianco pieno (#fff) e sulla carta del sito, più calda, si
       * vedeva come una toppa più chiara. Moltiplicato sul fondo carta del
       * contenitore, il bianco diventa esattamente la carta - qualunque colore
       * abbia in palette - mentre la figura si scurisce del 4%, che non si nota.
       * Per questo il fondo `bg-paper` sta sul contenitore e non sulla sezione:
       * la fusione avviene con ciò che è dipinto sotto, nello stesso strato.
       *
       * La sfocatura è in CSS e non nel file, così resta regolabile. Il velo di
       * carta sopra tiene il contrasto del testo costante anche dove la foto è
       * scura (il cappello) e mantiene la dominante del sito; essendo carta su
       * carta, non reintroduce alcuno stacco.
       */}
      <div aria-hidden="true" className="absolute inset-0 bg-paper">
        <img
          src={homeHero.src}
          alt={homeHero.alt}
          width={homeHero.width}
          height={homeHero.height}
          fetchpriority="high"
          decoding="async"
          className="h-full w-full object-contain object-bottom blur-[6px] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-paper/50" />
      </div>

      {/*
       * Segno grafico in alto a destra: la freccia obliqua che in footer segue
       * l'indirizzo email, qui in grande come accento della hero. Allineata al
       * margine della sezione, entra insieme all'invito a scorrere così i due
       * segni incorniciano il nome.
       */}
      <FrecciaObliqua
        style={{ animationDelay: `${ritardoScorri}s` }}
        className="absolute right-5 top-6 h-[clamp(34px,4vw,54px)] w-[clamp(34px,4vw,54px)] animate-viewIn motion-reduce:animate-none sm:right-8 sm:top-8 lg:right-[72px]"
      />

      {/*
       * Peso medio (500): su macOS e iOS lo prende Helvetica Neue Medium, su
       * Windows - dove Helvetica non c'è - Arial ha solo chiaro e nero e
       * ricade sul chiaro. Tracking -50 della crenatura tipografica, cioè
       * -0.05em.
       *
       * Corpo derivato dalla larghezza disponibile, non dal viewport: con
       * questo peso e questo tracking "SARCHIOLLA" misura 5.99em e
       * "JOE SARCHIOLLA" 8.10em. Il corpo è quindi larghezza / quella misura,
       * meno un margine perché il nome respiri ai lati e per le differenze fra
       * Helvetica Neue, Helvetica e Arial (i coefficienti tengono conto del
       * padding di ogni breakpoint). Da ricalcolare se cambiano padding,
       * tracking o peso. Sotto md il nome va a capo e si dimensiona sulla
       * parola più lunga, altrimenti resterebbe minuto.
       */}
      <h1
        aria-label={profile.displayName}
        className="relative m-0 font-medium uppercase leading-[0.9] tracking-[-0.05em] text-[calc((100vw_-_40px)*0.155)] sm:text-[calc((100vw_-_64px)*0.155)] md:text-[calc((100vw_-_64px)*0.114)] lg:text-[min(calc((100vw_-_144px)*0.114),300px)]"
      >
        {parole.map(({ parola, lettere }, i) => (
          <Fragment key={parola}>
            {/* Lo spazio separa le parole nel testo estratto dai crawler, che
                leggono "JoeSarchiolla" se i due span si toccano. Fra i due
                blocchi impilati (sotto md) non produce nulla. */}
            {i > 0 && ' '}
            <span className="block md:inline-block">
              {lettere.map(({ lettera, ritardo }, j) => (
                <span
                  key={`${parola}-${j}`}
                  style={{ animationDelay: `${ritardo}s` }}
                  className="inline-block animate-letterIn motion-reduce:animate-none"
                >
                  {lettera}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </h1>

      {/* Fuori dal blocco centrato per restare appoggiato alla linea. Il
          contenitore porta il centraggio e il link l'animazione: sullo stesso
          elemento la trasformazione dell'ingresso cancellerebbe quella del
          centraggio. */}
      <div className="absolute inset-x-0 bottom-7 flex justify-center">
        <a
          href="#lavori"
          onClick={vaiAiLavori}
          style={{ animationDelay: `${ritardoScorri}s` }}
          className="flex animate-viewIn flex-col items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted transition-colors hover:text-ink motion-reduce:animate-none sm:text-[11px]"
        >
          Scorri
          <span
            aria-hidden="true"
            className="animate-float text-[13px] leading-none motion-reduce:animate-none"
          >
            ↓
          </span>
        </a>
      </div>
    </section>
  )
}

/*
 * Freccia obliqua disegnata, non il carattere ↗: il glifo di sistema ha l'asta
 * corta e la punta minuta, e ingrandito non regge come segno grafico. Qui
 * l'asta attraversa quasi tutta la cornice e le due stanghette della punta sono
 * lunghe metà dell'asta. Tratto in `currentColor`, quindi segue il colore del
 * testo. Decorativa.
 */
function FrecciaObliqua({ className = '', style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4.5 19.5 18.5 5.5" />
      <path d="M8.5 5.5h10v10" />
    </svg>
  )
}
