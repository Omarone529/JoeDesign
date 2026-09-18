import { Fragment } from 'react'
import { homeHero, profile } from '../../data/siteData'
import { texts } from '../../i18n'
import { scrolling } from '../../motion'
import { useLang } from '../../router'
import { srcSetDi, SIZES } from '../../images'

// Secondi.
const FIRST_LETTER = 0.2
const LETTER_STEP = 0.045
const AFTER_NAME = 1.1

// Corpo del nome = larghezza / em della riga (5.99 e 8.10): da ricalcolare se cambiano padding o tracking.
export default function Hero() {
  const T = texts(useLang())

  // A mano, per rispettare `prefers-reduced-motion`; l'href resta per il tasto centrale.
  const goToWorks = (e) => {
    const works = document.getElementById('works')
    if (!works) return
    e.preventDefault()
    works.scrollIntoView({ behavior: scrolling(), block: 'start' })
  }

  // Sull'intero nome: le lettere entrano in fila anche a cavallo dell'a capo.
  let countedLetters = 0
  const words = profile.displayName.split(' ').map((word) => ({
    word,
    letters: [...word].map((letter) => ({
      letter,
      delay: FIRST_LETTER + countedLetters++ * LETTER_STEP,
    })),
  }))

  const scrollDelay = FIRST_LETTER + countedLetters * LETTER_STEP + AFTER_NAME

  return (
    <section className="relative flex min-h-[calc(var(--screen-height,100svh)-4rem)] flex-col items-center justify-center overflow-hidden border-b-2 border-ink px-5 py-24 text-center sm:px-8 lg:px-[72px]">
      <div aria-hidden="true" className="absolute inset-0 bg-paper">
        <img
          src={homeHero.src}
          srcSet={srcSetDi(homeHero.src)}
          sizes={SIZES.half}
          alt={homeHero.alt}
          width={homeHero.width}
          height={homeHero.height}
          fetchpriority="high"
          decoding="async"
          className="h-full w-full object-contain object-bottom blur-[6px] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-paper/50" />
      </div>

      <DiagonalArrow
        style={{ animationDelay: `${scrollDelay}s` }}
        className="absolute right-5 top-6 h-[clamp(34px,4vw,54px)] w-[clamp(34px,4vw,54px)] animate-viewIn motion-reduce:animate-none sm:right-8 sm:top-8 lg:right-[72px]"
      />

      <h1
        aria-label={profile.displayName}
        className="relative m-0 font-medium uppercase leading-[0.9] tracking-[-0.05em] text-[calc((100vw_-_40px)*0.155)] sm:text-[calc((100vw_-_64px)*0.155)] md:text-[calc((100vw_-_64px)*0.114)] lg:text-[min(calc((100vw_-_144px)*0.114),300px)]"
      >
        {words.map(({ word, letters }, i) => (
          <Fragment key={word}>
            {/* Spazio per i crawler: senza, leggono "JoeSarchiolla". */}
            {i > 0 && ' '}
            <span className="block md:inline-block">
              {letters.map(({ letter, delay }, j) => (
                <span
                  key={`${word}-${j}`}
                  style={{ animationDelay: `${delay}s` }}
                  className="inline-block animate-letterIn motion-reduce:animate-none"
                >
                  {letter}
                </span>
              ))}
              {/* Fuori da `letters`: non conta per la cadenza né per il corpo. */}
              {i === words.length - 1 && (
                <sup
                  aria-hidden="true"
                  style={{
                    animationDelay: `${letters[letters.length - 1].delay + LETTER_STEP}s`,
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

      {/* Due elementi: sullo stesso, centraggio e animazione si annullerebbero. */}
      <div className="absolute inset-x-0 bottom-7 flex justify-center">
        <a
          href="#works"
          onClick={goToWorks}
          style={{ animationDelay: `${scrollDelay}s` }}
          className="flex animate-viewIn flex-col items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted transition-colors hover:text-ink motion-reduce:animate-none sm:text-[11px]"
        >
          {T.home.scroll}
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

function DiagonalArrow({ className = '', style }) {
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
