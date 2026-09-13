import { aboutIn, profiloIn } from '../data/siteData'
import { testi } from '../i18n'
import { Link, percorso, useLang } from '../router'
import Competenze from '../components/about/Competenze'
import Sketchbook from '../components/about/Sketchbook'
import { srcSetDi, MISURE } from '../immagini'

/*
 * La testata: il titolo grande incastrato nel ritratto scontornato, che gli sta
 * sopra e ne nasconde la coda.
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
 * stessa larghezza — e poi la supera di `SPORGENZA`: è la più lunga delle due,
 * e la sua coda è il punto più a destra della testata.
 *
 * I numeri passano al CSS come variabili perché i breakpoint restano classi:
 * `calc()` divide per una variabile senza unità senza fare storie.
 *
 * ⚠️ TITOLO E FIGURA NON SI TOCCANO. La coda della riga piccola si ferma prima
 * del ritratto, di `STACCO`: il testo non finisce MAI sotto la foto. Prima ci
 * finiva apposta — l'ultima lettera spariva sotto la manica — poi è stato
 * chiesto il contrario, ed è per questo che il margine porta il segno più.
 *
 * Lo stacco è calcolato, non tarato a occhio su una finestra sola: titolo e
 * ritratto sono appesi alla stessa misura — `--figura`, la larghezza con cui il
 * ritaglio viene disegnato DAVVERO — e non a due frazioni indipendenti della
 * finestra. Prima erano `46vw` per la foto e `39vw` per il titolo, due numeri
 * che si sfioravano per caso: con `object-contain` la foto si rimpicciolisce
 * quando a limitare è l'altezza, e la distanza fra i due cambiava con la sola
 * altezza della finestra — fino a farli sovrapporre.
 */

/*
 * Quanto la riga piccola sporge oltre quella grande, da md in su. 1 sarebbe
 * appaiata: quello che avanza è la coda, ed è lei — non la riga grande — il
 * bordo destro vero della testata, quello da cui si misura lo stacco.
 */
const SPORGENZA = 1.2

/*
 * Il respiro fra la coda della frase e il bordo della figura, da md in su.
 *
 * ⚠️ In rem e non in em: entra anche nel conto del corpo del titolo (`corpo()`,
 * qui sotto), e in em dipenderebbe dal corpo che serve a calcolare. Un numero
 * che si morde la coda, e il titolo tornerebbe a toccare la foto.
 */
const STACCO = '2rem'

/*
 * Il riquadro in cui vive il ritratto: alto quanto la finestra meno la barra,
 * largo 46vw. Con `object-contain` il ritaglio ne riempie uno dei due lati e
 * viene disegnato largo `min(46vw, altezza * PROPORZIONE)` — su una finestra
 * bassa e larga vince il secondo termine, ed è per questo che la larghezza
 * vera va calcolata invece che data per scontata.
 *
 * ⚠️ PROPORZIONE_RITRATTO sono le proporzioni di `joe-hero.webp` (1200×1364).
 * Cambiando ritaglio va rifatta, o l'incastro si sposta senza che nulla protesti.
 */
const PROPORZIONE_RITRATTO = 1200 / 1364
const BARRA = '4rem'
const RIQUADRO = `calc(100svh - ${BARRA})`
const LARGHEZZA_FIGURA = `min(46vw, calc(${RIQUADRO} * ${PROPORZIONE_RITRATTO.toFixed(6)}))`
const ALTEZZA_FIGURA = `calc(var(--figura) / ${PROPORZIONE_RITRATTO.toFixed(6)})`

/*
 * A che altezza della figura passa la riga piccola: 0 sarebbe ai piedi, 1 sopra
 * la testa. A 0.437 la frase si affianca alla figura all'altezza della manica.
 *
 * ⚠️ Da md il titolo è appeso al FONDO della sezione (`mt-auto` più questo
 * margine), non centrato in mezzo, perché al fondo ci sta anche la figura:
 * centrato, su una finestra alta e stretta il titolo saliva sopra la testa e le
 * due parti smettevano di stare su una riga sola.
 */
/*
 * Il corpo del titolo, da md in su, è il PIÙ PICCOLO fra tre numeri:
 *
 *   1. quello che sta nello spazio rimasto — la colonna meno la figura e meno
 *      lo stacco che le corre a fianco. È il vincolo che comanda sotto i
 *      ~1700px, e senza il quale la testata sbatte contro il bordo sinistro:
 *      lì `ml-auto` non ha più margine da distribuire, il titolo resta piantato
 *      a sinistra e la coda si allunga sotto la figura da sola — cioè proprio
 *      la sovrapposizione che non si deve più vedere;
 *   2. la vecchia frazione della colonna (LARGO), che tiene il titolo dal
 *      gonfiarsi quando la figura si rimpicciolisce su una finestra bassa;
 *   3. il tetto in pixel, perché oltre un certo corpo il titolo non cresce più.
 *
 * FATTORE è il conto del punto 1 risolto: la larghezza del titolo è quella
 * della riga piccola, cioè SPORGENZA volte la riga grande. Niente più rientra
 * sotto la figura, quindi va sottratta per intero.
 * SICUREZZA è lo scarto fra la larghezza vera del testo e quella dichiarata in
 * em: senza, un pixel di troppo fa rientrare il caso che si voleva evitare.
 */
const LARGO = 0.43
const FATTORE = SPORGENZA.toFixed(4)
const SICUREZZA = '6px'
const corpo = (colonna, tetto) =>
  `min(calc((100vw - ${colonna} - var(--figura) - ${STACCO} - ${SICUREZZA}) / ${FATTORE} / var(--nome-em)),` +
  ` calc((100vw - ${colonna}) * ${LARGO} / var(--nome-em)), ${tetto})`

const ALTEZZA_RIGA = 0.437
const PIEDE = '7rem' // il `pb-28` della sezione, da cui il margine va scalato

/*
 * Il respiro di carta sopra la testa. Serve quando la figura non arriva in
 * cima: lì la testata smette di essere alta quanto la finestra e si accorcia
 * fino alla figura, o su un tablet in verticale resterebbe mezzo schermo vuoto
 * sopra a un titolo schiacciato in fondo.
 */
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
        className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden border-b-2 border-ink px-5 pt-16 sm:px-8 md:min-h-[var(--testata-minima)] md:pb-28 lg:px-[72px]"
      >
        {/* Il titolo è largo quanto la sua riga più lunga, e da md `ml-auto`
            lo spinge a destra: il margine che lo trattiene è la larghezza della
            figura PIÙ quello che la coda sporge oltre il riquadro del titolo,
            più lo stacco (`--fuori-figura`; la prima parte è in em, quindi
            cresce col corpo del titolo). Il conto torna perché la foto è
            appoggiata allo stesso bordo destro della colonna di testo
            (`right-8`/`lg:right-[72px]` contro `sm:px-8`/`lg:px-[72px]`):
            toccando uno dei due va toccato anche l'altro.

            ⚠️ Il margine si misura dalla CODA, non dal riquadro del titolo: il
            riquadro è largo quanto la riga grande, e fermare lui al bordo della
            figura lascerebbe la coda dentro il ritratto. La foto resta sopra il
            titolo nel DOM (`z-10`), ma adesso non ha più niente da coprire.

            ⚠️ `tracking` va ripetuto sulla riga piccola. `letter-spacing` in em
            si risolve sul corpo dell'elemento che lo dichiara e poi si eredita
            come lunghezza assoluta: presi dalla riga grande, quei pixel su un
            corpo tre volte più piccolo valgono -0.11em, e le lettere si toccano. */}
        <h1
          style={{
            '--nome-em': T.chiSono.heroNomeEm,
            '--fuori-figura': `calc(${(SPORGENZA - 1).toFixed(4)} * var(--nome-em) * 1em + ${STACCO})`,
            '--corpo-md': corpo('4rem', '210px'),
            '--corpo-lg': corpo('9rem', '240px'),
          }}
          className="m-0 w-fit font-bold uppercase leading-[0.86] md:ml-auto md:mb-[var(--riga-bassa)] md:mt-auto md:mr-[calc(var(--figura)_+_var(--fuori-figura))] text-[min(calc((100vw_-_40px)*0.98/var(--nome-em)),150px)] sm:text-[min(calc((100vw_-_64px)*0.82/var(--nome-em)),190px)] md:text-[length:var(--corpo-md)] lg:text-[length:var(--corpo-lg)]"
        >
          <span className="block tracking-[-0.03em]">{T.chiSono.heroNome}</span>
          {/* La riga piccola SPORGE oltre quella grande, e si ferma prima
              della figura: è il bordo destro della testata, non un pezzo che
              va a nascondersi. Solo da md — sotto, la foto è in colonna, il
              titolo è largo quanto la finestra e una riga che sporge
              perderebbe lettere contro `overflow-hidden`: lì le due righe
              tornano appaiate. */}
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
            l'altezza in percentuale al momento di misurare la riga non ha
            ancora un riferimento, e il browser ripiega sulle proporzioni vere
            del file — la sezione diventava alta quanto la foto invece che
            quanto lo schermo.

            ⚠️ L'altezza è `--figura-riquadro` (la finestra meno la barra) e non
            `h-full`: `h-full` è l'altezza della sezione, che da qui in poi non
            è più sempre quella — su una finestra alta e stretta la testata si
            accorcia fino alla figura. Con `h-full` la foto si rimpicciolirebbe
            con la sezione e lo stacco dal titolo, che quel numero lo dà per
            fisso, si sposterebbe.

            Il ritratto è ritagliato attorno alla figura, con appena un margine
            di respiro: con un quinto di trasparente per lato, sul telefono la
            figura resterebbe piccola in mezzo a due bande vuote. Un ritaglio
            nuovo va rifatto così, e `width`/`height` aggiornati con esso.

            ⚠️ La foto è LARGA una frazione della finestra e non ALTA una
            frazione della sezione: legata all'altezza, su una finestra bassa e
            larga si allargava fin dentro il titolo, mentre `max-w` la
            schiacciava per farla stare — la stessa foto, ma stirata.

            ⚠️ `46vw` e non `46%`: fuori dal flusso la percentuale si risolve
            sul riquadro INTERO della sezione, padding compreso, mentre il
            margine che trattiene il titolo si risolve sulla colonna di testo.
            Con due basi diverse lo stacco fra i due si spostava a ogni cambio
            di padding; in `vw` guardano entrambi la stessa misura.
            `object-contain` serve al caso opposto — finestra bassa e larga,
            dove a limitare è l'altezza del riquadro, ed è il caso che
            `--figura` mette in conto — e `[object-position:100%_100%]` tiene
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
          className="relative z-10 mx-auto mt-auto block w-[88%] max-w-[440px] pt-10 md:absolute md:bottom-0 md:right-8 md:mx-0 md:mt-0 md:h-[var(--figura-riquadro)] md:w-[46vw] md:max-w-none md:object-contain md:pt-0 md:[object-position:100%_100%] lg:right-[72px]"
        />
      </section>

      {/* L'intro esce dalla testata e sta da sola, centrata: la testata è
          adesso una figura sola — nome e ritratto — e un paragrafo dentro le
          farebbe da didascalia. */}
      <section id="intro" className="border-b border-line px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
        <p className="mx-auto m-0 max-w-[52ch] text-center text-[clamp(16px,1.6vw,22px)] leading-[1.5]">
          {about.intro}
        </p>
      </section>
      <Competenze />
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

      {/* Il manifesto e la foto con la lampada accesa, che chiudevano la
          pagina, sono passati in home: là dicono con che criterio sono fatti i
          progetti appena mostrati. Dopo la tavola di schizzi restano i due link
          d'uscita, che il filetto grosso stacca da essa. */}
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
