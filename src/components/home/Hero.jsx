import { Fragment } from 'react'
import { homeHero, profile } from '../../data/siteData'
import { testi } from '../../i18n'
import { scorrimento } from '../../motion'
import { useLang } from '../../router'

/* Tempi dell'ingresso, in secondi. */
const PRIMA_LETTERA = 0.2 // attesa prima che parta il nome
const PASSO_LETTERA = 0.045 // scarto fra una lettera e la successiva
const DOPO_NOME = 1.1 // pausa fra la fine del nome e l'invito a scorrere

/*
 * `svh` e non `vh`: su mobile la linea in fondo resta a filo invece di finire
 * sotto la barra degli indirizzi.
 *
 * `mix-blend-multiply` fonde il fondo bianco dello scatto con il `bg-paper` del
 * contenitore — per questo il colore sta sul contenitore e non sull'immagine.
 *
 * Il corpo del nome deriva dalla larghezza: "SARCHIOLLA" misura 5.99em e "JOE
 * SARCHIOLLA" 8.10em, quindi corpo = larghezza / quella misura. I coefficienti
 * includono il padding di ogni breakpoint: da ricalcolare se cambiano padding,
 * tracking o peso.
 */
export default function Hero() {
  const T = testi(useLang())

  // Salto a mano per rispettare la preferenza animazioni. L'href resta valido
  // per il tasto centrale e per "copia indirizzo".
  const vaiAiLavori = (e) => {
    const lavori = document.getElementById('lavori')
    if (!lavori) return // senza la sezione in pagina resta il salto nativo
    e.preventDefault()
    lavori.scrollIntoView({ behavior: scorrimento(), block: 'start' })
  }

  // Contato sull'intero nome, non sulla parola: le lettere entrano in fila
  // anche a cavallo dell'a capo.
  let lettereContate = 0
  const parole = profile.displayName.split(' ').map((parola) => ({
    parola,
    lettere: [...parola].map((lettera) => ({
      lettera,
      ritardo: PRIMA_LETTERA + lettereContate++ * PASSO_LETTERA,
    })),
  }))

  const ritardoScorri = PRIMA_LETTERA + lettereContate * PASSO_LETTERA + DOPO_NOME

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden border-b-2 border-ink px-5 py-24 text-center sm:px-8 lg:px-[72px]">
      {/* `contain` + `bottom`: figura intera appoggiata alla linea in fondo,
          `cover` mostrerebbe solo la testa. */}
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

      <FrecciaObliqua
        style={{ animationDelay: `${ritardoScorri}s` }}
        className="absolute right-5 top-6 h-[clamp(34px,4vw,54px)] w-[clamp(34px,4vw,54px)] animate-viewIn motion-reduce:animate-none sm:right-8 sm:top-8 lg:right-[72px]"
      />

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
              {/* Fuori da `lettere`: non conta per la cadenza né per il corpo. */}
              {i === parole.length - 1 && (
                <sup
                  aria-hidden="true"
                  style={{
                    animationDelay: `${lettere[lettere.length - 1].ritardo + PASSO_LETTERA}s`,
                  }}
                  className="ml-[0.08em] inline-block animate-letterIn align-super text-[0.32em] font-normal tracking-normal motion-reduce:animate-none"
                >
                  ™
                </sup>
              )}
            </span>
          </Fragment>
        ))}
      </h1>

      {/* Contenitore = centraggio, link = animazione: sullo stesso elemento le
          due transform si annullerebbero. */}
      <div className="absolute inset-x-0 bottom-7 flex justify-center">
        <a
          href="#lavori"
          onClick={vaiAiLavori}
          style={{ animationDelay: `${ritardoScorri}s` }}
          className="flex animate-viewIn flex-col items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted transition-colors hover:text-ink motion-reduce:animate-none sm:text-[11px]"
        >
          {T.home.scorri}
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

/* Disegnata e non il carattere ↗, che ingrandito non regge come segno. */
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
