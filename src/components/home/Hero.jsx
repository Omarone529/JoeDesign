import { Fragment } from 'react'
import { homeHero, profile } from '../../data/siteData'
import { scorrimento } from '../../motion'

/* Tempi dell'ingresso, in secondi. */
const PRIMA_LETTERA = 0.2 // attesa prima che parta il nome
const PASSO_LETTERA = 0.045 // scarto fra una lettera e la successiva
const DOPO_NOME = 1.1 // pausa fra la fine del nome e l'invito a scorrere

/*
 * Hero della homepage: ritratto sfocato a tutto schermo, nome in
 * sovrimpressione, linea nera in fondo. Ingresso scaglionato (nome lettera per
 * lettera, poi l'invito a scorrere). Alta 100svh meno la navbar (4rem): `svh`
 * e non `vh` così su mobile la linea resta a filo, non sotto la barra indirizzi.
 */
export default function Hero() {
  /*
   * "Lavori selezionati" è una sezione, non una rotta: salto interno a mano per
   * rispettare la preferenza animazioni. L'href resta valido per tasto centrale
   * e "copia indirizzo".
   */
  const vaiAiLavori = (e) => {
    const lavori = document.getElementById('lavori')
    if (!lavori) return // senza la sezione in pagina resta il salto nativo
    e.preventDefault()
    lavori.scrollIntoView({ behavior: scorrimento(), block: 'start' })
  }

  // Ritardo progressivo contato sull'intero nome (non sulla parola): le lettere entrano in fila.
  let lettereContate = 0
  const parole = profile.displayName.split(' ').map((parola) => ({
    parola,
    lettere: [...parola].map((lettera) => ({
      lettera,
      ritardo: PRIMA_LETTERA + lettereContate++ * PASSO_LETTERA,
    })),
  }))

  const ritardoScorri = PRIMA_LETTERA + lettereContate * PASSO_LETTERA + DOPO_NOME

  // Nome unico contenuto: `justify-center` lo centra nella sezione.
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden border-b-2 border-ink px-5 py-24 text-center sm:px-8 lg:px-[72px]">
      {/*
       * Sfondo. `object-contain` + `object-bottom`: figura intera appoggiata
       * alla linea in fondo (`cover` mostrerebbe solo la testa). Il fondo dello
       * scatto è bianco (#fff): `mix-blend-multiply` sul `bg-paper` del
       * contenitore lo fonde con la carta e fa sparire il riquadro (la figura
       * si scurisce del 4%, impercettibile) - per questo il fondo sta sul
       * contenitore. Sfocatura in CSS (regolabile); il velo carta sopra tiene
       * il contrasto del testo costante dov'è scura.
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
       * Freccia obliqua in alto a destra (la stessa del footer, qui in grande).
       * Entra con l'invito a scorrere, così i due segni incorniciano il nome.
       */}
      <FrecciaObliqua
        style={{ animationDelay: `${ritardoScorri}s` }}
        className="absolute right-5 top-6 h-[clamp(34px,4vw,54px)] w-[clamp(34px,4vw,54px)] animate-viewIn motion-reduce:animate-none sm:right-8 sm:top-8 lg:right-[72px]"
      />

      {/*
       * Peso medio (500; su Windows senza Helvetica, Arial ricade sul chiaro),
       * tracking -0.05em. Corpo derivato dalla larghezza, non dal viewport:
       * "SARCHIOLLA" misura 5.99em e "JOE SARCHIOLLA" 8.10em, quindi corpo =
       * larghezza / quella misura, meno un margine (i coefficienti includono il
       * padding di ogni breakpoint). Ricalcolare se cambiano padding, tracking
       * o peso. Sotto md il nome va a capo, dimensionato sulla parola più lunga.
       */}
      <h1
        aria-label={profile.displayName}
        className="relative m-0 font-medium uppercase leading-[0.9] tracking-[-0.05em] text-[calc((100vw_-_40px)*0.155)] sm:text-[calc((100vw_-_64px)*0.155)] md:text-[calc((100vw_-_64px)*0.114)] lg:text-[min(calc((100vw_-_144px)*0.114),300px)]"
      >
        {parole.map(({ parola, lettere }, i) => (
          <Fragment key={parola}>
            {/* Spazio per i crawler: senza, leggono "JoeSarchiolla". */}
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
              {/* ™ solo dopo l'ultima parola (il cognome): fuori da `lettere`,
                  così non conta per la cadenza né per il calcolo del corpo. */}
              {i === parole.length - 1 && (
                <sup
                  aria-hidden="true"
                  style={{ animationDelay: `${lettere[lettere.length - 1].ritardo + PASSO_LETTERA}s` }}
                  className="ml-[0.08em] inline-block animate-letterIn align-super text-[0.32em] font-normal tracking-normal motion-reduce:animate-none"
                >
                  ™
                </sup>
              )}
            </span>
          </Fragment>
        ))}
      </h1>

      {/* Fuori dal blocco centrato per restare sulla linea. Contenitore =
          centraggio, link = animazione: sullo stesso elemento le due transform
          si annullerebbero. */}
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
 * Freccia obliqua disegnata, non il carattere ↗ (ingrandito non regge come
 * segno grafico). Tratto in `currentColor`, segue il testo. Decorativa.
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
