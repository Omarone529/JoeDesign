import { aboutIn, profileIn } from '../data/siteData'
import { texts } from '../i18n'
import { Link, pathFor, useLang } from '../router'
import Skills from '../components/about/Skills'
import Sketchbook from '../components/about/Sketchbook'
import { srcSetDi, SIZES } from '../images'

/*
 * Testata: il corpo del titolo si ricava da quanti em misura la riga (`heroNameEm`), così
 * le due lingue danno testate larghe uguali; la larghezza del riquadro è quella della riga
 * grande. Titolo e ritratto dipendono dalla stessa misura, `--figure`.
 */

// Corpo della riga piccola, in frazione della grande (1 = larghe uguali): la riga
// grande resta la più larga, quindi è lei a dare la misura del riquadro e la piccola
// ci sta dentro centrata.
const ROLE = 0.8

// Spazio che il corpo del titolo lascia libero accanto alla figura. In rem: entra in
// `body()`, che dimensiona come se il titolo dovesse stare tutto fuori dalla foto.
// Il margine poi lo tira dentro di `OVERLAP`: riservare qui il posto è il modo di non
// far mai uscire il titolo dalla colonna.
const GAP = '2rem'

// Quanto la E di "Sono Joe" entra dietro la figura, in em della riga grande. La E è larga
// 0.618 em, quindi 0.24 ne copre il 39% e 0.618 la coprirebbe tutta. In em e non in pixel
// perché è una frazione di lettera, e la lettera cresce col titolo. MANICA è la striscia
// trasparente fra il bordo del riquadro del ritratto e la manica vera, in frazione della
// figura.
const OVERLAP = 0.24
const SLEEVE = 0.015

// Quanto il ritratto rientra dal bordo destro. Il titolo lo segue della stessa misura,
// così l'incastro della E resta quello: muovere la foto non cambia quanto entra la
// lettera. Lo paga `GAP`, il posto che `body()` tiene libero, più quello che
// l'incastro restituisce — oltre quella somma il titolo si stringe per stare nella
// colonna, e si vede come un corpo che cala invece che come una foto che si sposta.
const INSET = '2rem'

// Larghezza vera del ritratto con object-contain
const PORTRAIT_RATIO = 1200 / 1364
const BAR = '4rem'
const FRAME = `calc(var(--screen-height, 100svh) - ${BAR})`
const FIGURE_WIDTH = `min(46vw, calc(${FRAME} * ${PORTRAIT_RATIO.toFixed(6)}))`
const FIGURE_HEIGHT = `calc(var(--figure) / ${PORTRAIT_RATIO.toFixed(6)})`

// Corpo del titolo da md: il minimo fra spazio accanto alla figura, frazione della colonna e tetto.
const WIDE = 0.43
const SAFETY = '6px'
const body = (column, cap) =>
  `min(calc((100vw - ${column} - var(--figure) - ${GAP} - ${SAFETY}) / var(--name-em)),` +
  ` calc((100vw - ${column}) * ${WIDE} / var(--name-em)), ${cap})`

// Dove cade la riga piccola sulla figura (0 piedi, 1 testa): all'altezza della manica.
// Non la tocca più, ma è la quota che tiene titolo e ritratto sulla stessa riga d'occhio.
const ROW_HEIGHT = 0.437
const FOOT = '7rem' // il `pb-28` della sezione, da cui il margine va scalato

// Carta sopra la testa quando la figura non arriva in cima.
const BREATHING_ROOM = '8rem'

export default function About() {
  const lang = useLang()
  const T = texts(lang)
  const about = aboutIn(lang)
  const profile = profileIn(lang)
  const { hero, sketches } = about.photos

  return (
    <main className="animate-viewIn">
      <section
        style={{
          '--figure': FIGURE_WIDTH,
          '--figure-tall': FIGURE_HEIGHT,
          '--figure-frame': FRAME,
          '--bottom-row': `calc(${ROW_HEIGHT} * var(--figure-tall) - ${FOOT})`,
          '--masthead-min': `min(${FRAME}, calc(var(--figure-tall) + ${BREATHING_ROOM}))`,
          '--inset': INSET,
        }}
        className="relative flex min-h-[calc(var(--screen-height,100svh)-4rem)] flex-col justify-center overflow-hidden border-b-2 border-ink px-5 pt-16 sm:px-8 md:min-h-[var(--masthead-min)] md:pb-28 lg:px-[72px]"
      >
        <h1
          style={{
            '--name-em': T.about.heroNameEm,
            '--outside-figure': `calc(${-SLEEVE} * var(--figure) - ${OVERLAP} * 1em)`,
            '--size-md': body('4rem', '210px'),
            '--size-lg': body('9rem', '240px'),
          }}
          className="m-0 w-fit font-bold uppercase leading-[0.86] md:ml-auto md:mb-[var(--bottom-row)] md:mt-auto md:mr-[calc(var(--figure)_+_var(--outside-figure)_+_var(--inset))] text-[min(calc((100vw_-_40px)*0.98/var(--name-em)),150px)] sm:text-[min(calc((100vw_-_64px)*0.82/var(--name-em)),190px)] md:text-[length:var(--size-md)] lg:text-[length:var(--size-lg)]"
        >
          <span className="block animate-titleIn tracking-[-0.03em] motion-reduce:animate-none">{T.about.heroName}</span>
          <span
            style={{
              '--role': T.about.heroNameEm / T.about.heroRoleEm,
              '--role-small': `${ROLE}em`,
            }}
            className="block animate-roleIn whitespace-nowrap text-center leading-[1.05] tracking-[-0.03em] text-[calc(var(--role)*var(--role-small))] motion-reduce:animate-none"
          >
            {T.about.heroRole}
          </span>
        </h1>
        <img
          src={hero.src}
          srcSet={srcSetDi(hero.src)}
          sizes={SIZES.portrait}
          alt={hero.alt}
          width="1200"
          height="1364"
          fetchpriority="high"
          className="relative z-10 mx-auto mt-auto block animate-photoIn motion-reduce:animate-none w-[88%] max-w-[440px] pt-10 md:absolute md:bottom-0 md:right-[calc(2rem_+_var(--inset))] md:mx-0 md:mt-0 md:h-[var(--figure-frame)] md:w-[46vw] md:max-w-none md:object-contain md:pt-0 md:[object-position:100%_100%] lg:right-[calc(72px_+_var(--inset))]"
        />
      </section>

      {/* L'intro sta fuori dalla testata: dentro, farebbe da didascalia al ritratto. */}
      <section id="intro" className="border-b border-line px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
        <p className="mx-auto m-0 max-w-[52ch] text-center text-[clamp(16px,1.6vw,22px)] leading-[1.5]">
          {about.intro}
        </p>
      </section>
      <Skills />
      <Sketchbook />

      <section className="border-y border-line px-5 py-14 sm:px-8 sm:py-16 lg:px-[72px] lg:py-20">
        <p className="mx-auto m-0 max-w-[56ch] text-center text-[clamp(16px,1.6vw,22px)] leading-[1.45]">
          <strong className="block font-bold">{T.about.drawingTitle}</strong>
          {T.about.drawingText}
        </p>
      </section>

      <section className="bg-paper px-5 py-10 sm:px-8 sm:py-14 lg:px-[72px]">
        <img
          src={sketches.src}
          srcSet={srcSetDi(sketches.src)}
          sizes={SIZES.filled}
          alt={sketches.alt}
          loading="lazy"
          width="1920"
          height="1080"
          className="mx-auto block w-full max-w-[1400px] mix-blend-multiply"
        />
      </section>

      <section className="grid grid-cols-1 border-t-2 border-ink sm:grid-cols-2">
        <Link
          to={pathFor('archive', {}, lang)}
          className="group border-b border-line px-5 py-10 transition-colors hover:bg-hover sm:border-b-0 sm:border-r sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.about.theWork}
          </div>
          <div className="mt-2 text-[clamp(18px,2.4vw,32px)] font-bold uppercase tracking-[-0.01em]">
            {T.about.goToArchive}
          </div>
        </Link>
        <a
          href={profile.emailHref}
          target="_blank"
          rel="noreferrer"
          className="group px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.about.writeMe}
          </div>
          <div className="mt-2 break-words text-[clamp(16px,2.4vw,32px)] font-bold tracking-[-0.01em]">
            {profile.email}
          </div>
        </a>
      </section>
    </main>
  )
}
