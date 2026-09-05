import { aboutIn, profiloIn } from '../data/siteData'
import { testi } from '../i18n'
import { Link, percorso, useLang } from '../router'
import Sketchbook from '../components/about/Sketchbook'
import { scorrimento } from '../motion'
import { srcSetDi, MISURE } from '../immagini'

/*
 * La testata: il titolo grande incastrato nel ritratto scontornato, che gli sta
 * sopra e ne nasconde la coda, e la freccia che invita a scorrere.
 *
 * A essere fissata è la LARGHEZZA della riga grande, non il suo corpo: una
 * frazione della colonna, diversa a ogni breakpoint. Il corpo si ricava
 * dividendo per quanto la riga misura in em (`heroNomeEm` in `i18n.js`).
 *
 * Serve perché le due lingue hanno stringhe di lunghezza molto diversa — "SONO
 * JOE" sta in 4.97em, "I'M JOE" in 3.53 — e un corpo fisso darebbe due testate
 * larghe una due terzi dell'altra. Con la larghezza fissa la testata resta la
 * stessa e cambia il corpo, che è il verso giusto in cui far cadere lo scarto.
 *
 * La riga piccola parte da lì — `heroNomeEm / heroRuoloEm` la porterebbe alla
 * stessa larghezza — e poi la supera di `SPORGENZA`: quello che avanza è la
 * coda che finisce sotto la figura.
 *
 * I numeri passano al CSS come variabili perché i breakpoint restano classi:
 * `calc()` divide per una variabile senza unità senza fare storie.
 */

/*
 * Quanto la riga piccola sporge oltre quella grande, da md in su. 1 sarebbe
 * appaiata. Tarato perché a sparire sotto la manica sia l'ultima parola e non
 * mezza frase: la riga resta leggibile, e quello che si nasconde lo si è già
 * letto.
 */
const SPORGENZA = 1.2

export default function About() {
  const lang = useLang()
  const T = testi(lang)
  const about = aboutIn(lang)
  const profile = profiloIn(lang)
  const { hero, schizzi, lab } = about.photos

  // Salto a mano per rispettare la preferenza animazioni. L'href resta valido
  // per il tasto centrale e per "copia indirizzo".
  const vaiAllIntro = (e) => {
    const intro = document.getElementById('intro')
    if (!intro) return // senza la sezione in pagina resta il salto nativo
    e.preventDefault()
    intro.scrollIntoView({ behavior: scorrimento(), block: 'start' })
  }

  return (
    <main className="animate-viewIn">
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden border-b-2 border-ink px-5 pb-24 pt-16 sm:px-8 sm:pb-28 lg:px-[72px]">
        {/* Il titolo è largo quanto la sua riga più lunga, e da md `ml-auto`
            lo spinge a destra finché la coda del sottotitolo non finisce
            sotto la figura.

            Il titolo resta sotto la foto (`z` di default contro `z-10` della
            figura): il braccio alzato scavalca le ultime lettere, ed è
            l'incastro che la reference mostra. Con la foto sotto, invece, il
            ritaglio le passerebbe dietro e l'effetto sparirebbe.

            ⚠️ `tracking` va ripetuto sulla riga piccola. `letter-spacing` in em
            si risolve sul corpo dell'elemento che lo dichiara e poi si eredita
            come lunghezza assoluta: presi dalla riga grande, quei pixel su un
            corpo tre volte più piccolo valgono -0.11em, e le lettere si toccano. */}
        <h1
          style={{ '--nome-em': T.chiSono.heroNomeEm }}
          className="m-0 w-fit font-bold uppercase leading-[0.86] md:ml-auto md:mr-[39vw] text-[min(calc((100vw_-_40px)*0.98/var(--nome-em)),150px)] sm:text-[min(calc((100vw_-_64px)*0.82/var(--nome-em)),190px)] md:text-[min(calc((100vw_-_64px)*0.43/var(--nome-em)),210px)] lg:text-[min(calc((100vw_-_144px)*0.43/var(--nome-em)),240px)]"
        >
          <span className="block tracking-[-0.03em]">{T.chiSono.heroNome}</span>
          {/* La riga piccola SPORGE oltre quella grande e le ultime lettere
              finiscono sotto la figura: è l'incastro della reference, e il
              motivo per cui la foto sta sopra il titolo nel DOM. Solo da md —
              sotto, la foto è in colonna e non copre niente, quindi una riga
              che sporge perderebbe lettere contro `overflow-hidden` senza
              nulla che le nasconda: lì le due righe tornano appaiate. */}
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

        {/* ⚠️ Da md la foto è FUORI dal flusso, e non è un vezzo: in colonna
            `h-full` è una percentuale che al momento di misurare la riga non ha
            ancora un riferimento, e il browser ripiega sulle proporzioni vere
            del file — la sezione diventava alta quanto la foto invece che
            quanto lo schermo. Fuori dal flusso l'altezza la decide solo
            `min-h`, e la percentuale si risolve sul riquadro della sezione.

            Il ritratto è ritagliato attorno alla figura, con appena un margine
            di respiro: con un quinto di trasparente per lato, sul telefono la
            figura resterebbe piccola in mezzo a due bande vuote. Un ritaglio
            nuovo va rifatto così, e `width`/`height` aggiornati con esso.

            ⚠️ La foto è LARGA una frazione della sezione, non ALTA una frazione
            della sezione, e il motivo è che anche il titolo cresce con la
            larghezza: appese allo stesso lato, le due misure si sfiorano sempre
            allo stesso modo — il braccio alzato sull'ultima lettera. Legata
            all'altezza, invece, su una finestra bassa e larga (un portatile in
            orizzontale) la figura si allargava fin dentro il titolo e si
            mangiava mezzo sottotitolo, mentre `max-w` la schiacciava per farla
            stare: la stessa foto, ma stirata.

            ⚠️ `46vw` e non `46%`: fuori dal flusso la percentuale si risolve
            sul riquadro INTERO della sezione, padding compreso, mentre il
            margine che spinge il titolo (`mr-[39vw]`) si risolve sulla colonna
            di testo. Con due basi diverse l'incastro fra i due si spostava a
            ogni cambio di padding; in `vw` guardano entrambi la stessa misura.
            `object-contain` serve al caso opposto — finestra alta e stretta,
            dove a limitare è `h-full` — e `[object-position:100%_100%]` tiene
            la figura appoggiata all'angolo in basso a destra invece di
            centrarla nel riquadro rimasto. */}
        <img
          src={hero.src}
          srcSet={srcSetDi(hero.src)}
          sizes={MISURE.ritratto}
          alt={hero.alt}
          width="1200"
          height="1364"
          fetchpriority="high"
          className="relative z-10 mx-auto mt-auto block w-[88%] max-w-[440px] pt-10 md:absolute md:bottom-0 md:right-8 md:mx-0 md:mt-0 md:h-full md:w-[46vw] md:max-w-none md:object-contain md:pt-0 md:[object-position:100%_100%] lg:right-[72px]"
        />

        {/* Contenitore = centraggio, link = animazione: sullo stesso elemento
            le due transform si annullerebbero. */}
        <div className="absolute inset-x-0 bottom-7 z-20 flex justify-center">
          <a
            href="#intro"
            onClick={vaiAllIntro}
            aria-label={T.chiSono.scorri}
            className="text-[18px] leading-none text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden="true" className="block animate-float motion-reduce:animate-none">
              ↓
            </span>
          </a>
        </div>
      </section>

      {/* L'intro esce dalla testata e sta da sola, centrata: la testata è
          adesso una figura sola — nome e ritratto — e un paragrafo dentro le
          farebbe da didascalia. */}
      <section id="intro" className="border-b border-line px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
        <p className="mx-auto m-0 max-w-[52ch] text-center text-[clamp(16px,1.6vw,22px)] leading-[1.5]">
          {about.intro}
        </p>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-[72px] lg:py-20">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:gap-x-24 lg:gap-y-16">
          <div className="space-y-12 lg:space-y-16">
            <ArrowBlock label={T.chiSono.experience}>
              <dl className="m-0">
                {about.experience.map((it) => (
                  <Row key={it.titolo + it.anno} anno={it.anno} titolo={it.titolo} luogo={it.luogo} />
                ))}
              </dl>
            </ArrowBlock>

            <ArrowBlock label={T.chiSono.education}>
              <dl className="m-0">
                {about.education.map((it) => (
                  <Row key={it.titolo} anno={it.anno} titolo={it.titolo} luogo={it.luogo} />
                ))}
              </dl>
            </ArrowBlock>
          </div>

          <div className="space-y-12 lg:space-y-16">
            <ArrowBlock label={T.chiSono.skills}>
              <ul className="flex flex-wrap gap-2">
                {about.skills.map((s) => (
                  <li
                    key={s}
                    className="border border-line bg-paper px-3 py-1 text-[13px] tracking-[0.02em] lg:px-4 lg:py-1.5 lg:text-[15px]"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </ArrowBlock>

            <ArrowBlock label={T.chiSono.contacts}>
              <div className="space-y-1 text-[15px] lg:space-y-2 lg:text-[17px]">
                <a
                  href={profile.emailHref}
                  target="_blank"
                  rel="noreferrer"
                  className="block break-all hover:underline"
                >
                  {profile.email}
                </a>
              </div>
            </ArrowBlock>
          </div>
        </div>
      </section>

      {/* Il libro sfogliabile apre il manifesto: sono gli schizzi da cui i
          progetti nascono, e la frase dice esattamente quello. Sotto restano la
          foto in laboratorio e i due link d'uscita. */}
      <Sketchbook />

      {/* La frase che chiude lo sketchbook e apre la tavola di schizzi: sta fra
          due filetti, come nella reference, e la tavola le sta sotto a tutta
          larghezza. Prima riga in grassetto, seconda in tondo: è la gerarchia
          occhiello/corpo usata ovunque nel sito. */}
      <section className="border-y border-line px-5 py-14 sm:px-8 sm:py-16 lg:px-[72px] lg:py-20">
        <p className="mx-auto m-0 max-w-[56ch] text-center text-[clamp(16px,1.6vw,22px)] leading-[1.45]">
          {/* `block`: la frase in grassetto apre da sola, come nella reference.
              Resta dentro il paragrafo perché è la prima delle due frasi, non
              un titolo: a capo sì, gerarchia di intestazione no. */}
          <strong className="block font-bold">{T.chiSono.disegnoTitolo}</strong>
          {T.chiSono.disegnoTesto}
        </p>
      </section>

      {/* La tavola ha il fondo bianco vero, quindi va in `mix-blend-multiply`
          su una sezione con `bg-paper`: il fondo del `body` non finisce sulla
          tela e non fonderebbe, restando un rettangolo bianco sulla carta. */}
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

      <section className="border-t-2 border-ink px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
        <blockquote className="m-0 max-w-[24ch] text-[clamp(26px,4vw,56px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]">
          “{profile.manifesto}”
        </blockquote>
      </section>

      <section className="bg-night">
        <img
          src={lab.src}
          srcSet={srcSetDi(lab.src)}
          sizes={MISURE.piena}
          alt={lab.alt}
          loading="lazy"
          width="1900"
          height="1425"
          className="block aspect-[16/9] w-full object-cover object-top"
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

/*
 * La freccia porta U+FE0E (VS-15), che forza la resa testuale: le diagonali
 * ↖↗↘↙ hanno una variante emoji e su iOS/Android uscirebbero a colori.
 */
function ArrowBlock({ label, children }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 lg:mb-6">
        <span aria-hidden className="text-[15px] leading-none lg:text-[17px]">{'↘︎'}</span>
        <h2 className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] lg:text-[15px]">
          {label}
        </h2>
      </div>
      {children}
    </div>
  )
}

function Row({ anno, titolo, luogo }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4 border-t border-line-soft py-3 lg:grid-cols-[132px_1fr] lg:gap-6 lg:py-4">
      <dt className="text-[13px] font-bold tabular-nums tracking-[0.02em] lg:text-[15px]">{anno}</dt>
      <dd className="m-0 text-[14px] leading-snug lg:text-[17px]">
        {titolo}
        {luogo && <span className="text-muted"> · {luogo}</span>}
      </dd>
    </div>
  )
}
