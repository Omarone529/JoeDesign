/*
 * Testi dell'interfaccia nelle due lingue del sito. I *contenuti* (progetti,
 * bio, manifesto) stanno in `data/siteData.js` e `data/contenutiEn.js`: qui ci
 * sono solo le parole che il sito dice di suo — voci di menù, etichette,
 * frecce, testi di servizio.
 *
 * Questo file non importa niente: lo usano sia i componenti sia `seo.js`.
 */

export const LINGUE = ['it', 'en']
export const LINGUA_PREDEFINITA = 'it'

/* Lingua valida o quella di partenza: da un URL può arrivare di tutto. */
export function normalizzaLingua(lang) {
  return LINGUE.includes(lang) ? lang : LINGUA_PREDEFINITA
}

const TESTI = {
  it: {
    // `htmlLang` finisce in <html lang>, `ogLocale` nei meta Open Graph,
    // `schemaLang` in `inLanguage` dei dati strutturati.
    htmlLang: 'it',
    ogLocale: 'it_IT',
    schemaLang: 'it-IT',
    etichetta: 'Italiano',

    nav: {
      home: 'Home',
      archivio: 'Archivio',
      chiSono: 'Chi sono',
      logo: 'Joe Sarchiolla — home',
      instagram: (handle) => `${handle} su Instagram`,
      lingua: 'Lingua',
      passaA: 'Versione inglese',
    },

    home: {
      scorri: 'Scorri',
      lavoriSelezionati: 'Lavori selezionati',
      archivioCompleto: 'Archivio completo →',
      skills: 'Skills',
      fermaNastro: 'Ferma',
      riprendiNastro: 'Riprendi',
    },

    archivio: {
      titolo: 'Archivio',
      apriArea: 'Apri l’area →',
      altraArea: 'L’altra area →',
      fotoInArrivo: 'Foto in arrivo',
      conteggio: (n) => `${n} ${n === 1 ? 'progetto' : 'progetti'}`,
    },

    progetto: {
      scheda: 'Progetto',
      anno: 'Anno',
      designer: 'Designer',
      iLavori: 'I lavori',
      precedente: '← Precedente',
      successivo: 'Successivo →',
      tornaA: '← Torna a',
      archivio: 'Archivio',
      fotoInArrivo: 'Foto in arrivo',
      videoPlay: (titolo) => `Riproduci il video di ${titolo}`,
      videoTitolo: (titolo) => `Video del progetto ${titolo}`,
    },

    chiSono: {
      occhiello: 'Chi sono',
      /* Le due righe della testata. Sono l'unico punto del sito in prima
         persona: è la firma con cui Joe si presenta, non un testo di pagina.
         `…Em` è quanto la riga misura in em — Helvetica Neue BOLD maiuscolo con
         `tracking-[-0.03em]` — e serve a due cose in About.jsx: dare a tutte e
         due le righe la stessa larghezza, e tenere quella larghezza uguale
         nelle due lingue nonostante le stringhe siano diverse. ⚠️ Cambiando il
         testo, il peso o il tracking vanno rimisurate, o le righe si
         disallineano. Si misurano in pagina con un Range sul contenuto della
         riga, diviso il suo font-size. */
      heroNome: 'Sono Joe',
      heroNomeEm: 4.966,
      heroRuolo: 'Product designer e molto altro',
      heroRuoloEm: 17.936,
      scorri: 'Scorri',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      contacts: 'Contacts',
      sketchbook: 'Sketchbook',
      sketchbookAria: 'Tavole dello sketchbook personale di Joe Sarchiolla',
      sketchbookRuolo: 'sketchbook sfogliabile',
      /* Il manifesto sotto lo sketchbook: prima riga in grassetto, seconda in
         tondo. Sono due frasi, non due paragrafi: vanno di seguito. */
      disegnoTitolo: 'Il disegno è la visione del prodotto finale.',
      disegnoTesto:
        'È il luogo in cui prende forma, viene modificato e perfezionato, fino a definire ciò che il prodotto diventerà.',
      ilLavoro: 'Il lavoro',
      vaiArchivio: 'Vai all’Archivio →',
      scrivimi: 'Scrivimi',
    },

    carosello: {
      immaginiDi: (titolo) => `Immagini di ${titolo}`,
      precedente: 'Immagine precedente',
      successiva: 'Immagine successiva',
      riprendi: 'Riprendi lo scorrimento',
      pausa: 'Metti in pausa lo scorrimento',
      vaiA: (n) => `Vai all'immagine ${n}`,
    },

    footer: {
      pagine: 'Pagine del sito',
      scriviA: (email) => `Scrivi a ${email}`,
      instagram: (handle) => `@${handle} su Instagram`,
      youtube: 'Joe Sarchiolla su YouTube',
      tiktok: 'Joe Sarchiolla su TikTok',
      linkedin: 'Giovanni Sarchiolla su LinkedIn',
      riga: (ruolo, luogo) => `${ruolo}, di ${luogo}.`,
      diritti: 'Tutti i diritti riservati',
      privacy: 'Privacy',
      tornaSu: 'Torna su',
    },

    /*
     * Il banner cookie e privacy. Dice quello che davvero succede: «usiamo i
     * cookie per migliorare la tua esperienza» qui sarebbe falso, perché
     * cookie non ce ne sono, e non spiegherebbe niente a nessuno.
     */
    banner: {
      occhiello: 'Cookie e privacy',
      aria: 'Cookie e privacy',
      testo: 'Il sito non usa cookie propri e non raccoglie statistiche: nulla di quanto si fa qui viene misurato.',
      dettaglio:
        'Una cosa sola ha bisogno di un consenso: alcune schede di progetto contengono reel ospitati da YouTube. Accettando si aprono da sé, e Google può conservare informazioni nel browser. Rifiutando restano figure del sito, e ogni filmato parte lo stesso premendo play. La risposta si cambia quando si vuole.',
      attiva: 'Accetta',
      rifiuta: 'Rifiuta',
      informativa: 'Informativa privacy',
    },

    // 404 e schermata d'errore: stessa impaginazione, due voci diverse.
    servizio: {
      indice: '← Indice',
      home: 'Home',
      tuttiProgetti: 'Tutti i progetti →',
      archivio: 'Archivio',
      errore404: 'Errore 404',
      titolo404: ['Pagina', 'non trovata'],
      testo404:
        "L'indirizzo non corrisponde a nessuna pagina del sito: può essere stato spostato, oppure non è mai esistito. Da qui si torna all'indice o all'archivio completo dei progetti.",
      errore: 'Errore',
      titoloErrore: ['Qualcosa', 'non ha funzionato'],
      testoErrore:
        "Questa pagina non è riuscita a caricarsi. Il resto del sito funziona: da qui si torna all'indice o all'archivio completo dei progetti.",
    },


    /*
     * Informativa privacy. È un testo di servizio come la 404, quindi sta qui
     * e non in `siteData`: non è un contenuto del portfolio.
     *
     * Descrive il sito com'è OGGI: statico, senza statistiche, e con i video di
     * YouTube che si caricano SOLO dopo un consenso — quello dato al banner
     * (`components/BannerPrivacy.jsx`) o quello implicito nel premere play su un
     * singolo filmato. Senza, non viene contattato nessun terzo.
     *
     * L'unica cosa salvata nel browser è la risposta al banner, e va detto:
     * `localStorage`, non un cookie, e non lascia il dispositivo.
     *
     * Ogni novità che tocchi i trattamenti — un'analitica, un modulo di
     * contatto, o il passaggio a uno spezzone video ospitato in proprio —
     * vuole le sezioni «Cookie e statistiche», «Perché, e con quale diritto»,
     * «Chi altro li vede» e «Link esterni» riscritte PRIMA che entri in
     * funzione, e `aggiornato` con esse.
     */
    privacy: {
      occhiello: 'Privacy',
      titolo: ['Informativa', 'privacy'],
      intro:
        'Il sito non usa cookie propri, non raccoglie statistiche e non chiede dati a chi lo visita. Restano tre cose: i log tecnici del server, i video di YouTube che si aprono nelle schede di progetto solo se lo si consente, e le email che qualcuno decide di scrivere. Qui c’è spiegato come vengono trattate.',
      aggiornato: 'Ultimo aggiornamento: 3 settembre 2026',
      scelta: {
        attivi: 'I video sono attivi: si aprono da soli nelle schede che ne hanno uno.',
        spenti: 'I video sono spenti: partono solo premendo play.',
        nonScelto: 'Non è ancora stata data una risposta: i video restano spenti, e partono solo premendo play.',
        attiva: 'Attiva i video',
        spegni: 'Spegni i video',
      },
      sezioni: [
        {
          titolo: 'Chi tratta i dati',
          corpo: [
            'Il titolare del trattamento è Giovanni Sarchiolla, Reggio Emilia (Italia). Per far valere i propri diritti, o per qualsiasi domanda su questa pagina, si può scrivere a:',
          ],
          contatto: true,
        },
        {
          titolo: 'Cosa raccoglie il sito',
          corpo: [
            'Il sito è statico: non ha moduli da compilare, né aree riservate, né registrazione. A chi lo visita non chiede niente.',
            'Come ogni sito, il server che lo ospita registra da sé i dati tecnici di ogni visita: indirizzo IP, tipo di browser e di dispositivo, data, ora e pagina aperta. Sono i normali log di funzionamento. Non servono a identificare nessuno e non vengono incrociati con altre informazioni.',
            'I dati sono trattati con strumenti informatici, protetti dalle misure di sicurezza che chiede l’articolo 32 del Regolamento perché nessuno vi acceda, li diffonda, li cambi o li distrugga senza averne titolo. Scrivere al titolare resta libero: non c’è nessun campo obbligatorio, perché non c’è nessun modulo, e di una persona arriva solo quello che sceglie di scrivere.',
          ],
        },
        {
          titolo: 'Cookie e statistiche',
          corpo: [
            'Il sito non usa cookie, né tecnici né di profilazione. L’unica cosa che salva nella memoria del browser è la risposta alla domanda sui video, per non doverla richiedere a ogni pagina. Resta sul dispositivo, non va a nessuno e non serve a riconoscere chi torna.',
            'Non c’è nessuno strumento di statistica o di tracciamento. Anche i caratteri tipografici, i fogli di stile e gli script con cui le pagine sono composte arrivano tutti dal sito, mai da domini di terze parti.',
            'Alcune schede di progetto contengono un breve video ospitato da YouTube, l’unico contenuto che arriverebbe da fuori. Non si carica da sé: al suo posto c’è una figura del sito. YouTube viene contattato in due soli casi. Il primo è se lo si è consentito rispondendo alla domanda che compare aprendo il sito, e allora il filmato parte da solo, muto, a pagina caricata. Il secondo è premendo play su quel singolo video. Chi non fa né l’una né l’altra cosa guarda tutto il sito senza che nessun terzo ne sappia niente.',
            'Il player si carica nella modalità senza cookie che YouTube mette a disposizione, la quale rimanda gli identificatori pubblicitari ma non li toglie. Da quel momento vale l’informativa di Google.',
            'Le pagine senza video, cioè la home, l’archivio, «Chi sono» e questa stessa, restano fatte con i soli file del sito, e lì nessun terzo viene contattato.',
          ],
        },
        {
          titolo: 'La scelta sui video',
          corpo: [
            'La risposta alla domanda sui video resta nel browser di chi visita e non va da nessuna parte: serve solo a ricordare di non caricare YouTube senza permesso. Si cambia da qui quando si vuole, e cancellando i dati del sito dal browser sparisce con essi.',
            'Il consenso si può dare, negare o ritirare liberamente, e negarlo non costa niente: il sito resta intero. Il ritiro vale da quel momento in avanti e non rende illecito quello che è già successo mentre il consenso c’era (art. 7, par. 3 del Regolamento). La risposta non scade: resta finché non la si cambia.',
          ],
          scelta: true,
        },
        {
          titolo: 'Perché, e con quale diritto',
          corpo: [
            'I log tecnici servono a far funzionare il sito e a difenderlo dagli abusi. La base giuridica è il legittimo interesse del titolare (art. 6, par. 1, lett. f del Regolamento UE 2016/679).',
            'Quello che si scrive in un’email, cioè il nome, l’indirizzo e il resto del messaggio, serve solo a rispondere e, se ne nasce una collaborazione, a portarla avanti (art. 6, par. 1, lett. b ed f).',
            'Il player di YouTube, e i dati che ne derivano, poggiano sul consenso (art. 6, par. 1, lett. a). Lo si dà rispondendo alla domanda che compare aprendo il sito, oppure premendo play su un singolo filmato, e si può ritirare quando si vuole dalla sezione «La scelta sui video». Negandolo non si perde nient’altro: fotografie, disegno tecnico e testi restano interi.',
          ],
        },
        {
          titolo: 'Chi altro li vede',
          corpo: [
            'Il sito è ospitato da Netlify, Inc. (Stati Uniti), che è responsabile del trattamento ed è chi conserva i log del server. I dati escono dallo Spazio economico europeo sulla base delle clausole contrattuali standard approvate dalla Commissione europea.',
            'La posta elettronica è gestita da Google Ireland Limited (Gmail).',
            'I video delle schede di progetto sono su YouTube (Google Ireland Limited). Quando il player si carica, dopo il consenso o premendo play, il browser si collega ai server di Google. Google riceve l’indirizzo IP, i dati tecnici della richiesta e l’indirizzo della pagina da cui si arriva, e può conservare informazioni nel dispositivo secondo la propria informativa. Su questi dati il titolare non ha alcun controllo: valgono le condizioni di Google. Senza consenso e senza clic non accade niente di tutto questo.',
            'Nessun dato viene ceduto o venduto, e non c’è nessuna decisione presa in automatico.',
          ],
        },
        {
          titolo: 'Per quanto tempo',
          corpo: [
            'I log del server restano per il breve periodo previsto da chi ospita il sito, poi si cancellano da soli. Le email si conservano il tempo che serve a rispondere e, se ne nasce un lavoro, a documentarlo.',
          ],
        },
        {
          titolo: 'Cosa si può chiedere',
          corpo: [
            'A chi visita il sito spettano i diritti degli articoli da 15 a 22 del Regolamento: sapere quali dati ci sono, farli correggere, farli cancellare, limitarne l’uso, opporsi al trattamento e farseli consegnare in un formato leggibile. Per esercitarli basta scrivere al titolare, all’indirizzo in cima a questa pagina.',
            'Dove il trattamento poggia sul legittimo interesse, e qui riguarda i soli log tecnici, ci si può opporre quando si vuole, spiegando il motivo. Il titolare risponde entro un mese, come chiede l’articolo 12. Se la richiesta è complicata il termine può allungarsi di due mesi, dicendolo prima.',
            'Resta sempre la possibilità di presentare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it), o di rivolgersi a un giudice.',
          ],
        },
        {
          titolo: 'Link esterni',
          corpo: [
            'Le icone in fondo a ogni pagina portano ai profili Instagram, YouTube, TikTok e LinkedIn. Sono collegamenti normali: finché non si clicca, nessun dato li raggiunge. Il video delle schede di progetto è invece un contenuto incorporato, e finché non lo si consente resta una figura del sito.',
            'Una volta usciti dal sito, o avviato il video, valgono le informative di quelle piattaforme, sulle quali il titolare non può niente.',
          ],
        },
        {
          titolo: 'Se qualcosa cambia',
          corpo: [
            'Se il sito cambierà, per esempio con delle statistiche di visita o un modulo di contatto, questa pagina verrà aggiornata prima che la novità entri in funzione. Vale sempre la versione pubblicata qui.',
          ],
        },
      ],
    },

    /* Titoli e descrizioni delle pagine (meta tag e dati strutturati). */
    seo: {
      homeTitolo: (firma, ruolo) => `${firma} · ${ruolo} a Reggio Emilia`,
      homeDesc: (firma, ruolo, luogo, periodo) =>
        `${firma}, ${ruolo} a ${luogo}. Portfolio ${periodo}: prodotto, arredo, packaging e grafica.`,
      archivioTitolo: (firma) => `Archivio progetti · ${firma}`,
      archivioDesc: (n, firma, periodo) =>
        `Tutti i ${n} progetti di ${firma}, divisi in product design e graphic design. Portfolio ${periodo}.`,
      archivioNome: 'Archivio progetti',
      areaTitolo: (label, firma) => `${label} · Archivio · ${firma}`,
      areaDesc: (conteggio, label, firma, periodo, desc) =>
        `${conteggio} di ${label} di ${firma}, ${periodo}. ${desc}`,
      areaNome: (label) => `${label} · Archivio progetti`,
      areaImmagineAlt: (label, nome) => `${label} — progetti di ${nome}`,
      chiSonoTitolo: (firma, ruolo) => `Chi sono · ${firma} · ${ruolo}`,
      progettoDesc: (titolo, cat, anno, nome, ruolo, luogo) =>
        `${titolo} — ${cat}${anno}. Progetto di ${nome}, ${ruolo} a ${luogo}.`,
      /*
       * Firma in fondo all'anteprima social di una scheda: vedi og-image.js.
       * In inglese anche sulla serie italiana, ed è l'unica eccezione alle due
       * lingue separate: `designed by` è la formula con cui il design si firma,
       * e in italiano si usa così. Non è un pezzo di frase rimasto indietro.
       */
      progettoFirma: (nome) => `Designed by ${nome}`,
      privacyTitolo: (firma) => `Informativa privacy · ${firma}`,
      privacyDesc: (firma) =>
        `Come il sito di ${firma} tratta i dati di chi lo visita: nessun cookie proprio, nessuna statistica, e i video di YouTube solo con il consenso.`,
      nonTrovataTitolo: (firma) => `Pagina non trovata · ${firma}`,
      nonTrovataDesc: (firma) => `L'indirizzo non corrisponde a nessuna pagina del sito di ${firma}.`,
      sitoDesc: (nome, ruolo, luogo) => `Portfolio di ${nome}, ${ruolo} a ${luogo}.`,
      briciolaHome: 'Home',
      briciolaArchivio: 'Archivio',
      discipline: ['Product design', 'Industrial design', 'Packaging design', 'Graphic design'],
    },

    // Testi alternativi delle immagini di prodotto: li usano le pagine e la
    // sitemap immagini, quindi stanno scritti una volta sola.
    /* Marchio "AI GENERATED"/"AI MODIFIED": la scritta dentro è disegnata e in
       inglese, quindi la frase per intero la dà il testo alternativo. */
    ai: {
      generata: 'Immagine generata con l’intelligenza artificiale',
      modificata: 'Immagine modificata con l’intelligenza artificiale',
    },

    alt: {
      copertina: (titolo, cat, nome) => `${titolo}, ${cat} — progetto di ${nome}`,
      galleria: (titolo, cat, i, totale) => `${titolo}, ${cat} — immagine ${i} di ${totale}`,
      disegno: (titolo, cat) => `Disegno tecnico quotato di ${titolo}, ${cat}`,
      sfondo: (titolo) => `${titolo} — ambientazione`,
      video: (titolo) => `${titolo} — fotogramma del video di progetto`,
    },
  },

  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    schemaLang: 'en',
    etichetta: 'English',

    nav: {
      home: 'Home',
      archivio: 'Archive',
      chiSono: 'About',
      logo: 'Joe Sarchiolla — home',
      instagram: (handle) => `${handle} on Instagram`,
      lingua: 'Language',
      passaA: 'Italian version',
    },

    home: {
      scorri: 'Scroll',
      lavoriSelezionati: 'Selected works',
      archivioCompleto: 'Full archive →',
      skills: 'Skills',
      fermaNastro: 'Stop',
      riprendiNastro: 'Resume',
    },

    archivio: {
      titolo: 'Archive',
      apriArea: 'Open the area →',
      altraArea: 'The other area →',
      fotoInArrivo: 'Photos coming',
      conteggio: (n) => `${n} ${n === 1 ? 'project' : 'projects'}`,
    },

    progetto: {
      scheda: 'Project',
      anno: 'Year',
      designer: 'Designer',
      iLavori: 'The works',
      precedente: '← Previous',
      successivo: 'Next →',
      tornaA: '← Back to',
      archivio: 'Archive',
      fotoInArrivo: 'Photos coming',
      videoPlay: (titolo) => `Play the video of ${titolo}`,
      videoTitolo: (titolo) => `Video of the ${titolo} project`,
    },

    chiSono: {
      occhiello: 'About',
      heroNome: 'I’m Joe',
      heroNomeEm: 3.53,
      heroRuolo: 'Product designer and much more',
      heroRuoloEm: 18.768,
      scorri: 'Scroll',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      contacts: 'Contacts',
      sketchbook: 'Sketchbook',
      sketchbookAria: 'Pages from the personal sketchbook of Joe Sarchiolla',
      sketchbookRuolo: 'flippable sketchbook',
      disegnoTitolo: 'Drawing is the vision of the final product.',
      disegnoTesto:
        'It is where the object takes shape, is reworked and refined, until it defines what the product will become.',
      ilLavoro: 'The work',
      vaiArchivio: 'Go to the Archive →',
      scrivimi: 'Write to me',
    },

    carosello: {
      immaginiDi: (titolo) => `Images of ${titolo}`,
      precedente: 'Previous image',
      successiva: 'Next image',
      riprendi: 'Resume the slideshow',
      pausa: 'Pause the slideshow',
      vaiA: (n) => `Go to image ${n}`,
    },

    footer: {
      pagine: 'Site pages',
      scriviA: (email) => `Write to ${email}`,
      instagram: (handle) => `@${handle} on Instagram`,
      youtube: 'Joe Sarchiolla on YouTube',
      tiktok: 'Joe Sarchiolla on TikTok',
      linkedin: 'Giovanni Sarchiolla on LinkedIn',
      riga: (ruolo, luogo) => `${ruolo}, based in ${luogo}.`,
      diritti: 'All rights reserved',
      privacy: 'Privacy',
      tornaSu: 'Back to top',
    },

    banner: {
      occhiello: 'Cookies and privacy',
      aria: 'Cookies and privacy',
      testo: 'The site sets no cookies of its own and collects no statistics: nothing done here is measured.',
      dettaglio:
        'One thing alone needs consent: some project pages carry reels hosted on YouTube. Accepted, they open by themselves, and Google may store information in the browser. Refused, they stay images belonging to the site, and each clip still starts when play is pressed. The answer can be changed whenever you like.',
      attiva: 'Accept',
      rifiuta: 'Refuse',
      informativa: 'Privacy policy',
    },

    servizio: {
      indice: '← Index',
      home: 'Home',
      tuttiProgetti: 'All projects →',
      archivio: 'Archive',
      errore404: 'Error 404',
      titolo404: ['Page', 'not found'],
      testo404:
        'This address matches no page on the site: it may have been moved, or it never existed. From here the way back leads to the index or to the full project archive.',
      errore: 'Error',
      titoloErrore: ['Something', 'went wrong'],
      testoErrore:
        'This page failed to load. The rest of the site works: from here the way back leads to the index or to the full project archive.',
    },

    privacy: {
      occhiello: 'Privacy',
      titolo: ['Privacy', 'policy'],
      intro:
        'This site sets no cookies of its own, collects no statistics and asks visitors for no data. Three things remain: the server’s technical logs, the YouTube videos that open on the project pages only if you allow them, and any email someone decides to write. This page explains how they are handled.',
      aggiornato: 'Last updated: 3 September 2026',
      scelta: {
        attivi: 'Videos are on: they open by themselves on the pages that have one.',
        spenti: 'Videos are off: they start only when play is pressed.',
        nonScelto: 'No answer has been given yet: videos stay off, and start only when play is pressed.',
        attiva: 'Turn videos on',
        spegni: 'Turn videos off',
      },
      sezioni: [
        {
          titolo: 'Who handles the data',
          corpo: [
            'The data controller is Giovanni Sarchiolla, Reggio Emilia (Italy). To exercise your rights, or for any question about this page, write to:',
          ],
          contatto: true,
        },
        {
          titolo: 'What the site collects',
          corpo: [
            'The site is static: no forms to fill in, no private areas, no sign-up. It asks visitors for nothing.',
            'As with any website, the server hosting it records the technical details of each visit by itself: IP address, browser and device type, date, time and page opened. These are ordinary operational logs. They identify no one and are never cross-referenced with other information.',
            'The data is handled with electronic tools and protected by the security measures article 32 of the Regulation requires, so that no one may access, disclose, alter or destroy it without being entitled to. Writing to the controller stays entirely free: there is no required field, because there is no form at all, and nothing of a person arrives beyond what they choose to write.',
          ],
        },
        {
          titolo: 'Cookies and statistics',
          corpo: [
            'The site sets no cookies, neither technical nor profiling ones. The only thing it keeps in the browser’s memory is your answer to the question about videos, so it need not be asked on every page. It stays on the device, goes to no one, and is not used to recognise anyone who returns.',
            'There is no analytics or tracking tool of any kind. The typefaces, stylesheets and scripts the pages are built from all come from the site itself, never from third-party domains.',
            'Some project pages carry a short video hosted by YouTube, the only content that would come from outside. It does not load by itself: in its place there is an image belonging to the site. YouTube is contacted in two cases only. The first is if you have allowed it by answering the question that appears when the site opens, and then the clip starts by itself, muted, once the page has loaded. The second is by pressing play on that single video. Anyone who does neither browses the whole site without any third party learning anything.',
            'The player loads in the cookie-free mode YouTube provides, which defers advertising identifiers but does not remove them. From that moment Google’s own policy applies.',
            'The pages without a video, that is the home, the archive, “About” and this one, are built from the site’s own files alone, and there no third party is contacted.',
          ],
        },
        {
          titolo: 'Your choice about videos',
          corpo: [
            'The answer you give to the question about videos stays in your browser and goes nowhere: it serves only to remember not to load YouTube without permission. You can change it here whenever you like, and clearing the site’s data from the browser clears it too.',
            'Consent may be freely given, refused or withdrawn, and refusing it costs nothing: the site stays whole. Withdrawal takes effect from that moment onwards and does not make unlawful what already happened while consent was in place (art. 7(3) of the Regulation). The answer does not expire: it stays until you change it.',
          ],
          scelta: true,
        },
        {
          titolo: 'Why, and on what basis',
          corpo: [
            'The technical logs keep the site running and protect it from abuse. The legal basis is the controller’s legitimate interest (art. 6(1)(f) of Regulation (EU) 2016/679).',
            'What you write in an email, that is your name, your address and the rest of the message, serves only to reply and, should a collaboration follow, to carry it forward (art. 6(1)(b) and (f)).',
            'The YouTube player, and the data that follows from it, rest on consent (art. 6(1)(a)). You give it by answering the question that appears when the site opens, or by pressing play on a single clip, and you can withdraw it whenever you like from the “Your choice about videos” section. Refusing costs nothing else: photographs, technical drawing and text stay whole.',
          ],
        },
        {
          titolo: 'Who else sees it',
          corpo: [
            'The site is hosted by Netlify, Inc. (United States), which acts as data processor and is the party keeping the server logs. Data leaves the European Economic Area on the basis of the standard contractual clauses approved by the European Commission.',
            'Email is handled by Google Ireland Limited (Gmail).',
            'The videos on the project pages are on YouTube (Google Ireland Limited). When the player loads, after consent or on pressing play, the browser connects to Google’s servers. Google receives the IP address, the technical details of the request and the address of the page you come from, and may keep information on the device under its own policy. The controller has no control over this data: Google’s terms apply. Without consent and without a click, none of it happens.',
            'No data is sold or handed over, and nothing is decided automatically.',
          ],
        },
        {
          titolo: 'How long it is kept',
          corpo: [
            'Server logs stay for the short period set by whoever hosts the site, then delete themselves. Emails are kept for as long as it takes to reply and, should work follow, to document it.',
          ],
        },
        {
          titolo: 'What you can ask for',
          corpo: [
            'Visitors hold the rights set out in articles 15 to 22 of the Regulation: to know what data there is, to have it corrected, to have it erased, to limit its use, to object to the processing and to be handed it in a readable format. To exercise them, write to the controller at the address at the top of this page.',
            'Where processing rests on legitimate interest, which here means the technical logs alone, you may object whenever you like, giving your reason. The controller answers within one month, as article 12 requires. Where a request is complicated that term may be extended by two months, said so in advance.',
            'It is always possible to lodge a complaint with the Italian Data Protection Authority, the Garante per la protezione dei dati personali (garanteprivacy.it), or to go before a court.',
          ],
        },
        {
          titolo: 'External links',
          corpo: [
            'The icons at the foot of every page lead to the Instagram, YouTube, TikTok and LinkedIn profiles. They are ordinary links: until one is clicked, no data reaches them. The video on the project pages is embedded content, and until it is allowed it stays an image belonging to the site.',
            'Once you leave the site, or start the video, the policies of those platforms apply, over which the controller can do nothing.',
          ],
        },
        {
          titolo: 'If something changes',
          corpo: [
            'Should the site change, by adding visit statistics or a contact form for instance, this page will be updated before the new feature goes live. The version published here is always the one that applies.',
          ],
        },
      ],
    },



    seo: {
      homeTitolo: (firma, ruolo) => `${firma} · ${ruolo} in Reggio Emilia`,
      homeDesc: (firma, ruolo, luogo, periodo) =>
        `${firma}, ${ruolo} in ${luogo}. Portfolio ${periodo}: product, furniture, packaging and graphics.`,
      archivioTitolo: (firma) => `Project archive · ${firma}`,
      archivioDesc: (n, firma, periodo) =>
        `All ${n} projects by ${firma}, split into product design and graphic design. Portfolio ${periodo}.`,
      archivioNome: 'Project archive',
      areaTitolo: (label, firma) => `${label} · Archive · ${firma}`,
      areaDesc: (conteggio, label, firma, periodo, desc) =>
        `${conteggio} of ${label} by ${firma}, ${periodo}. ${desc}`,
      areaNome: (label) => `${label} · Project archive`,
      areaImmagineAlt: (label, nome) => `${label} — projects by ${nome}`,
      chiSonoTitolo: (firma, ruolo) => `About · ${firma} · ${ruolo}`,
      progettoDesc: (titolo, cat, anno, nome, ruolo, luogo) =>
        `${titolo} — ${cat}${anno}. Project by ${nome}, ${ruolo} in ${luogo}.`,
      progettoFirma: (nome) => `Designed by ${nome}`,
      privacyTitolo: (firma) => `Privacy policy · ${firma}`,
      privacyDesc: (firma) =>
        `How the site of ${firma} handles visitors’ data: no cookies of its own, no analytics, and YouTube videos only with consent.`,
      nonTrovataTitolo: (firma) => `Page not found · ${firma}`,
      nonTrovataDesc: (firma) => `This address matches no page on the site of ${firma}.`,
      sitoDesc: (nome, ruolo, luogo) => `Portfolio of ${nome}, ${ruolo} in ${luogo}.`,
      briciolaHome: 'Home',
      briciolaArchivio: 'Archive',
      discipline: ['Product design', 'Industrial design', 'Packaging design', 'Graphic design'],
    },

    ai: {
      generata: 'Image generated with artificial intelligence',
      modificata: 'Image edited with artificial intelligence',
    },

    alt: {
      copertina: (titolo, cat, nome) => `${titolo}, ${cat} — project by ${nome}`,
      galleria: (titolo, cat, i, totale) => `${titolo}, ${cat} — image ${i} of ${totale}`,
      disegno: (titolo, cat) => `Dimensioned technical drawing of ${titolo}, ${cat}`,
      sfondo: (titolo) => `${titolo} — in context`,
      video: (titolo) => `${titolo} — still frame from the project video`,
    },
  },
}

export function testi(lang) {
  return TESTI[normalizzaLingua(lang)]
}
