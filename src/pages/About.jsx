import { aboutIn, profiloIn } from '../data/siteData'
import { testi } from '../i18n'
import { Link, percorso, useLang } from '../router'
import Competenze from '../components/about/Competenze'
import Sketchbook from '../components/about/Sketchbook'
import { srcSetDi, MISURE } from '../immagini'

/*
 * Testata: la larghezza del titolo è fissa, il corpo si ricava da quanti em misura la riga
 * (`heroNomeEm`), così le due lingue danno testate larghe uguali. Titolo e ritratto
 * dipendono dalla stessa misura, `--figura`.
 */

// Quanto la riga piccola sporge oltre quella grande, da md.
const SPORGENZA = 1.2

// Spazio lasciato libero dal corpo del titolo. In rem: entra in `corpo()`.
const STACCO = '2rem'

// Posizione del titolo, solo nel margine. INCASTRO: coda sotto la manica, in em della riga
// piccola. MANICA: rientro della manica nel riquadro della foto, in frazione della figura.
const INCASTRO = 0.22
const MANICA = 0.015

// Larghezza vera del ritratto con object-contain
const PROPORZIONE_RITRATTO = 1200 / 1364
const BARRA = '4rem'
const RIQUADRO = `calc(var(--schermo, 100svh) - ${BARRA})`
const LARGHEZZA_FIGURA = `min(46vw, calc(${RIQUADRO} * ${PROPORZIONE_RITRATTO.toFixed(6)}))`
const ALTEZZA_FIGURA = `calc(var(--figura) / ${PROPORZIONE_RITRATTO.toFixed(6)})`

// Corpo del titolo da md: il minimo fra spazio accanto alla figura, frazione della colonna e tetto.
const LARGO = 0.43
const FATTORE = SPORGENZA.toFixed(4)
const SICUREZZA = '6px'
const corpo = (colonna, tetto) =>
  `min(calc((100vw - ${colonna} - var(--figura) - ${STACCO} - ${SICUREZZA}) / ${FATTORE} / var(--nome-em)),` +
  ` calc((100vw - ${colonna}) * ${LARGO} / var(--nome-em)), ${tetto})`

// Altezza della riga piccola sulla figura (0 piedi, 1 testa): all'altezza della manica.
const ALTEZZA_RIGA = 0.437
const PIEDE = '7rem' // il `pb-28` della sezione, da cui il margine va scalato

// Carta sopra la testa quando la figura non arriva in cima.
const ARIA = '8rem'

export default function About() {
  const lang = useLang()
  const T = testi(lang)
  const about = aboutIn(lang)
  const profile = profiloIn(lang)
  const { hero, schizzi } = about.photos

  return (
    <main className="animate-viewIn">
      <section
        style={{
          '--figura': LARGHEZZA_FIGURA,
          '--figura-alta': ALTEZZA_FIGURA,
          '--figura-riquadro': RIQUADRO,
          '--riga-bassa': `calc(${ALTEZZA_RIGA} * var(--figura-alta) - ${PIEDE})`,
          '--testata-minima': `min(${RIQUADRO}, calc(var(--figura-alta) + ${ARIA}))`,
        }}
        className="relative flex min-h-[calc(var(--schermo,100svh)-4rem)] flex-col justify-center overflow-hidden border-b-2 border-ink px-5 pt-16 sm:px-8 md:min-h-[var(--testata-minima)] md:pb-28 lg:px-[72px]"
      >
        <h1
          style={{
            '--nome-em': T.chiSono.heroNomeEm,
            '--fuori-figura': `calc(${-MANICA} * var(--figura) - ${(INCASTRO * SPORGENZA * T.chiSono.heroNomeEm / T.chiSono.heroRuoloEm).toFixed(4)} * 1em)`,
            '--corpo-md': corpo('4rem', '210px'),
            '--corpo-lg': corpo('9rem', '240px'),
          }}
          className="m-0 w-fit font-bold uppercase leading-[0.86] md:ml-auto md:mb-[var(--riga-bassa)] md:mt-auto md:mr-[calc(var(--figura)_+_var(--fuori-figura))] text-[min(calc((100vw_-_40px)*0.98/var(--nome-em)),150px)] sm:text-[min(calc((100vw_-_64px)*0.82/var(--nome-em)),190px)] md:text-[length:var(--corpo-md)] lg:text-[length:var(--corpo-lg)]"
        >
          <span className="block tracking-[-0.03em]">{T.chiSono.heroNome}</span>
          <span
            style={{
              '--ruolo': T.chiSono.heroNomeEm / T.chiSono.heroRuoloEm,
              '--sporgenza': `${SPORGENZA}em`,
            }}
            className="block whitespace-nowrap leading-[1.05] tracking-[-0.03em] text-[calc(var(--ruolo)*1em)] md:text-[calc(var(--ruolo)*var(--sporgenza))]"
          >
            {T.chiSono.heroRuolo}
          </span>
        </h1>
        <img
          src={hero.src}
          srcSet={srcSetDi(hero.src)}
          sizes={MISURE.ritratto}
          alt={hero.alt}
          width="1200"
          height="1364"
          fetchpriority="high"
          className="relative z-10 mx-auto mt-auto block w-[88%] max-w-[440px] pt-10 md:absolute md:bottom-0 md:right-8 md:mx-0 md:mt-0 md:h-[var(--figura-riquadro)] md:w-[46vw] md:max-w-none md:object-contain md:pt-0 md:[object-position:100%_100%] lg:right-[72px]"
        />
      </section>

      {/* L'intro sta fuori dalla testata: dentro, farebbe da didascalia al ritratto. */}
      <section id="intro" className="border-b border-line px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
        <p className="mx-auto m-0 max-w-[52ch] text-center text-[clamp(16px,1.6vw,22px)] leading-[1.5]">
          {about.intro}
        </p>
      </section>
      <Competenze />
      <Sketchbook />

      <section className="border-y border-line px-5 py-14 sm:px-8 sm:py-16 lg:px-[72px] lg:py-20">
        <p className="mx-auto m-0 max-w-[56ch] text-center text-[clamp(16px,1.6vw,22px)] leading-[1.45]">
          <strong className="block font-bold">{T.chiSono.disegnoTitolo}</strong>
          {T.chiSono.disegnoTesto}
        </p>
      </section>

      <section className="bg-paper px-5 py-10 sm:px-8 sm:py-14 lg:px-[72px]">
        <img
          src={schizzi.src}
          srcSet={srcSetDi(schizzi.src)}
          sizes={MISURE.piena}
          alt={schizzi.alt}
          loading="lazy"
          width="1920"
          height="1080"
          className="mx-auto block w-full max-w-[1400px] mix-blend-multiply"
        />
      </section>

      <section className="grid grid-cols-1 border-t-2 border-ink sm:grid-cols-2">
        <Link
          to={percorso('archive', {}, lang)}
          className="group border-b border-line px-5 py-10 transition-colors hover:bg-hover sm:border-b-0 sm:border-r sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.chiSono.ilLavoro}
          </div>
          <div className="mt-2 text-[clamp(18px,2.4vw,32px)] font-bold uppercase tracking-[-0.01em]">
            {T.chiSono.vaiArchivio}
          </div>
        </Link>
        <a
          href={profile.emailHref}
          target="_blank"
          rel="noreferrer"
          className="group px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.chiSono.scrivimi}
          </div>
          <div className="mt-2 break-words text-[clamp(16px,2.4vw,32px)] font-bold tracking-[-0.01em]">
            {profile.email}
          </div>
        </a>
      </section>
    </main>
  )
}
