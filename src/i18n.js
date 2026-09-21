// Testi dell'interfaccia in it/en. Non importa niente: lo usano componenti, seo.js e script.

export const LANGS = ['it', 'en']
export const DEFAULT_LANG = 'it'

/* Lingua valida o quella di partenza: da un URL può arrivare di tutto. */
export function normalizeLang(lang) {
  return LANGS.includes(lang) ? lang : DEFAULT_LANG
}

const TEXTS = {
  it: {
    // `htmlLang` finisce in <html lang>, `ogLocale` nei meta Open Graph,
    // `schemaLang` in `inLanguage` dei dati strutturati.
    htmlLang: 'it',
    ogLocale: 'it_IT',
    schemaLang: 'it-IT',
    label: 'Italiano',

    nav: {
      home: 'Home',
      archive: 'Archivio',
      about: 'Chi sono',
      logo: 'Joe Sarchiolla — home',
      instagram: (handle) => `${handle} su Instagram`,
      language: 'Lingua',
      goTo: 'Versione inglese',
    },

    home: {
      scroll: 'Scorri',
      selectedWorks: 'Lavori selezionati',
      fullArchive: 'Archivio completo →',
    },

    archive: {
      title: 'Archivio',
      openArea: 'Apri l’area →',
      otherArea: 'L’altra area →',
      incomingPhoto: 'Foto in arrivo',
      count: (n) => `${n} ${n === 1 ? 'progetto' : 'progetti'}`,
    },

    project: {
      card: 'Progetto',
      year: 'Anno',
      designer: 'Designer',
      iWorks: 'I lavori',
      previous: '← Precedente',
      next: 'Successivo →',
      backTo: '← Torna a',
      archive: 'Archivio',
      incomingPhoto: 'Foto in arrivo',
      videoPlay: (title) => `Riproduci il video di ${title}`,
      videoTitle: (title) => `Video del progetto ${title}`,
    },

    about: {
      eyebrow: 'Chi sono',
      /* Unico testo in prima persona. `…Em` = larghezza della riga in em (Helvetica bold, tracking
      -0.03em): ⚠️ va rimisurata cambiando testo, peso o tracking. */
      heroName: 'Sono Joe',
      heroNameEm: 4.966,
      heroRole: 'Product designer',
      heroRoleEm: 10.001,
      skills: 'Skills',
      sketchbook: 'Sketchbook',
      sketchbookAria: 'Tavole dello sketchbook personale di Joe Sarchiolla',
      sketchbookRole: 'sketchbook sfogliabile',
      // Due frasi di seguito, non due paragrafi.
      drawingTitle: 'Il disegno è la visione del prodotto finale.',
      drawingText:
        'È il luogo in cui prende forma, viene modificato e perfezionato, fino a definire ciò che il prodotto diventerà.',
      theWork: 'Il lavoro',
      goToArchive: 'Vai all’Archivio →',
      writeMe: 'Scrivimi',
    },

    carousel: {
      imagesOf: (title) => `Immagini di ${title}`,
      previous: 'Immagine precedente',
      next: 'Immagine successiva',
      resume: 'Riprendi lo scorrimento',
      pause: 'Metti in pausa lo scorrimento',
      goToSlide: (n) => `Vai all'immagine ${n}`,
    },

    footer: {
      pages: 'Pagine del sito',
      writeTo: (email) => `Scrivi a ${email}`,
      instagram: (handle) => `@${handle} su Instagram`,
      youtube: 'Joe Sarchiolla su YouTube',
      tiktok: 'Joe Sarchiolla su TikTok',
      linkedin: 'Giovanni Sarchiolla su LinkedIn',
      row: (role, country) => `${role}, ${country}.`,
      rights: 'Tutti i diritti riservati',
      privacy: 'Privacy',
      backToTop: 'Torna su',
    },

    // Banner cookie e privacy: dice solo ciò che succede davvero.
    banner: {
      eyebrow: 'Cookie e privacy',
      aria: 'Cookie e privacy',
      text: 'Il sito non usa cookie propri e non raccoglie statistiche. Il consenso serve solo per mostrare i video di YouTube in alcune schede di progetto.',
      detail:
        'Accettando, i video partono da soli e Google riceve l’indirizzo IP e può salvare tracker nel browser. Rifiutando, al loro posto resta un’immagine e ogni video parte solo premendo play. La scelta si cambia in qualsiasi momento dall’informativa.',
      enable: 'Accetta',
      decline: 'Rifiuta',
      policy: 'Informativa privacy',
    },

    // 404 e schermata d'errore: stessa impaginazione, due voci diverse.
    service: {
      index: '← Indice',
      home: 'Home',
      allProjects: 'Tutti i progetti →',
      archive: 'Archivio',
      error404: 'Errore 404',
      title404: ['Pagina', 'non trovata'],
      text404:
        "L'indirizzo non corrisponde a nessuna pagina del sito. Può essere stato spostato, oppure non è mai esistito. Da qui si torna all'indice o all'archivio completo dei progetti.",
      error: 'Errore',
      errorTitle: ['Qualcosa', 'non ha funzionato'],
      errorText:
        "Questa pagina non è riuscita a caricarsi. Il resto del sito funziona, e da qui si torna all'indice o all'archivio completo dei progetti.",
    },


    /*
     * Informativa privacy, allineata al sito di oggi. ⚠️ Ogni nuovo trattamento (analitica, modulo,
     * video) richiede di riscriverla, e di spostare `updated`, prima di entrare in funzione.
     */
    privacy: {
      eyebrow: 'Privacy',
      title: ['Informativa', 'privacy'],
      intro:
        'In breve, il sito non usa cookie propri, non raccoglie statistiche e non ha moduli. Si trattano soltanto i log tecnici del server, le email che qualcuno sceglie di scrivere e, solo con il consenso o premendo play, i dati che riceve YouTube per mostrare i video. Qui sotto si trova il dettaglio di ogni trattamento.',
      updated: 'Ultimo aggiornamento: 18 settembre 2026',
      choice: {
        on: 'I video sono attivi e si aprono da soli nelle schede che ne hanno uno.',
        off: 'I video sono spenti e partono solo premendo play.',
        notChosen: 'Non è ancora stata data una risposta, quindi i video restano spenti e partono solo premendo play.',
        enable: 'Attiva i video',
        turnOff: 'Spegni i video',
      },
      sections: [
        {
          title: 'Titolare del trattamento',
          body: [
            'Giovanni Sarchiolla, Reggio Emilia (Italia). Per esercitare i propri diritti, o per qualsiasi domanda su questa informativa, si scrive all’indirizzo qui sotto.',
          ],
          contact: true,
        },
        {
          title: 'Tipi di dati raccolti',
          body: [
            'Il sito è statico. Non ha moduli, aree riservate né registrazione, e a chi lo visita non chiede niente.',
            'I dati trattati sono di tre tipi. Ci sono i dati di utilizzo che il server registra da sé a ogni visita, quelli contenuti nelle email scritte al titolare e, solo se si attiva un video, quelli che il browser invia a YouTube. Ogni trattamento è descritto più sotto, con la sua finalità.',
            'Nessun dato è obbligatorio. Scrivere al titolare è una scelta, e di una persona arriva solo quello che decide di scrivere; senza email non c’è risposta, ma il sito resta interamente consultabile.',
          ],
        },
        {
          title: 'Modalità e luogo del trattamento',
          body: [
            'I dati sono trattati con strumenti informatici e protetti con le misure di sicurezza richieste dall’art. 32 del Regolamento UE 2016/679 (GDPR), perché nessuno vi acceda, li diffonda, li modifichi o li distrugga senza averne titolo. Non sono ceduti né venduti, e non servono a prendere decisioni automatizzate o a profilare nessuno.',
            'Il titolare opera in Italia. I fornitori elencati nelle schede di ciascun trattamento possono conservare i dati anche fuori dallo Spazio economico europeo, e in quel caso il trasferimento avviene con le garanzie indicate nella scheda.',
            'I dati si conservano per il tempo necessario alla finalità per cui sono raccolti, indicato trattamento per trattamento. Trascorso quel tempo si cancellano.',
          ],
        },
        {
          title: 'Finalità e basi giuridiche',
          body: ['Ogni trattamento ha una sola finalità e poggia su una base giuridica dell’art. 6 del GDPR.'],
          facts: [
            ['Funzionamento e sicurezza del sito', 'Log di sistema · legittimo interesse (art. 6, par. 1, lett. f)'],
            ['Risposta alle richieste', 'Email · misure precontrattuali e legittimo interesse (art. 6, par. 1, lett. b e f)'],
            ['Visualizzazione dei video', 'YouTube · consenso (art. 6, par. 1, lett. a)'],
          ],
        },
        {
          title: 'Log di sistema e manutenzione',
          body: [
            'Come ogni sito, il server che lo ospita registra i dati tecnici di ogni richiesta. Servono a far funzionare il sito e a difenderlo dagli abusi; non vengono usati per identificare nessuno né incrociati con altre informazioni. Ci si può opporre in qualsiasi momento, indicando il motivo.',
          ],
          facts: [
            ['Fornitore', 'Netlify, Inc., responsabile del trattamento'],
            ['Dati trattati', 'Indirizzo IP, tipo di browser e di dispositivo, data, ora e pagina richiesta'],
            ['Base giuridica', 'Legittimo interesse del titolare'],
            ['Luogo', 'Stati Uniti · clausole contrattuali standard della Commissione europea'],
            ['Conservazione', 'Il breve periodo fissato dal fornitore, poi cancellazione automatica'],
          ],
        },
        {
          title: 'Contatto via email',
          body: [
            'Chi scrive all’indirizzo del titolare gli comunica i dati contenuti nel messaggio, che servono solo a rispondere e, se ne nasce una collaborazione, a portarla avanti.',
          ],
          facts: [
            ['Fornitore', 'Google Ireland Limited (Gmail)'],
            ['Dati trattati', 'Nome, indirizzo email e quanto scritto nel messaggio'],
            ['Base giuridica', 'Misure precontrattuali richieste dall’interessato e legittimo interesse a rispondere'],
            ['Luogo', 'Irlanda; eventuali trasferimenti negli Stati Uniti rientrano nel Data Privacy Framework UE–USA'],
            ['Conservazione', 'Il tempo necessario a rispondere e, se ne nasce un lavoro, a documentarlo'],
          ],
        },
        {
          title: 'Video da YouTube',
          body: [
            'Alcune schede di progetto contengono un breve video ospitato da YouTube, l’unico contenuto che arriva da fuori. Al suo posto, finché non si attiva, c’è un’immagine del sito. Il player si carica solo in due casi. Il primo è il consenso dato rispondendo alla domanda che compare aprendo il sito, e allora il video parte da solo e muto. Il secondo è premere play su quel singolo video.',
            'Il player usa la modalità a privacy avanzata (youtube-nocookie.com), che rimanda gli identificatori pubblicitari ma non li elimina. Da quel momento Google riceve i dati sotto indicati e ne risponde secondo la propria informativa, senza che il titolare abbia alcun controllo su di essi. Senza consenso e senza clic non accade niente di tutto questo.',
          ],
          facts: [
            ['Fornitore', 'Google Ireland Limited (YouTube), titolare autonomo'],
            ['Dati trattati', 'Indirizzo IP, dati tecnici della richiesta, pagina di provenienza e tracker salvati nel browser'],
            ['Base giuridica', 'Consenso, revocabile in qualsiasi momento'],
            ['Luogo', 'Irlanda; eventuali trasferimenti negli Stati Uniti rientrano nel Data Privacy Framework UE–USA'],
            ['Informativa', 'policies.google.com/privacy'],
          ],
        },
        {
          title: 'Cookie e altri tracker',
          body: [
            'Il sito non installa cookie, né tecnici né di profilazione, e non usa strumenti di statistica. Caratteri, fogli di stile e script arrivano tutti dal sito stesso, mai da domini di terzi.',
            'Nella memoria locale del browser resta soltanto la risposta alla domanda sui video, per non doverla ripetere a ogni pagina. Non lascia il dispositivo, non scade e si cancella con i dati del sito.',
            'Il consenso si può dare, negare o revocare liberamente, e negarlo non toglie niente, perché fotografie, disegni e testi restano interi. La revoca vale da quel momento in avanti e non rende illecito il trattamento già avvenuto (art. 7, par. 3 del GDPR). La scelta si cambia con il pulsante qui sotto.',
          ],
          choice: true,
        },
        {
          title: 'Diritti dell’interessato',
          body: ['Alle condizioni degli articoli da 15 a 22 del GDPR, chi visita il sito ha i diritti elencati qui sotto.'],
          facts: [
            ['Revocare il consenso', 'In qualsiasi momento, dalla sezione sui cookie qui sopra'],
            ['Opporsi al trattamento', 'Quando si fonda sul legittimo interesse, indicandone il motivo'],
            ['Accedere ai dati', 'Sapere se e quali dati sono trattati, e riceverne copia'],
            ['Rettificarli', 'Farli correggere o completare'],
            ['Limitarne il trattamento', 'Farli conservare senza altro uso'],
            ['Farli cancellare', 'Quando non servono più o il trattamento non è lecito'],
            ['Riceverli o trasferirli', 'In un formato strutturato e leggibile da dispositivo automatico'],
            ['Proporre reclamo', 'Al Garante per la protezione dei dati personali (garanteprivacy.it) o all’autorità del proprio paese'],
          ],
        },
        {
          title: 'Come esercitarli',
          body: [
            'Basta scrivere al titolare, all’indirizzo in cima a questa pagina. La richiesta è gratuita e riceve risposta entro un mese (art. 12 del GDPR); se è complessa il termine può allungarsi di due mesi, comunicandolo prima.',
          ],
        },
        {
          title: 'Ulteriori informazioni',
          body: [
            'I dati possono essere usati per difendere i diritti del titolare in giudizio o nelle fasi che lo precedono, e comunicati alle autorità che li richiedano per legge.',
            'Le icone in fondo a ogni pagina portano ai profili Instagram, YouTube, TikTok e LinkedIn. Sono semplici collegamenti, e finché non si clicca nessun dato raggiunge quelle piattaforme. Una volta usciti dal sito valgono le loro informative.',
          ],
        },
        {
          title: 'Modifiche all’informativa',
          body: [
            'Se il sito cambierà, per esempio con statistiche di visita o un modulo di contatto, questa pagina sarà aggiornata prima che la novità entri in funzione, e la data in fondo lo indicherà. Dove serve un nuovo consenso, verrà chiesto di nuovo. Vale sempre la versione pubblicata qui.',
          ],
        },
        {
          title: 'Definizioni',
          body: ['I termini usati in questa pagina hanno il significato che gli dà il GDPR.'],
          facts: [
            ['Dati personali', 'Qualunque informazione che riguarda una persona fisica identificata o identificabile'],
            ['Dati di utilizzo', 'Le informazioni tecniche che il browser invia a ogni richiesta, come IP, data e pagina'],
            ['Tracker', 'Qualunque tecnologia, cookie compresi, che salva o legge informazioni nel dispositivo'],
            ['Interessato', 'La persona a cui i dati si riferiscono'],
            ['Titolare', 'Chi decide finalità e mezzi del trattamento'],
            ['Responsabile', 'Chi tratta i dati per conto del titolare'],
          ],
        },
      ],
    },

    seo: {
      homeTitle: (signature, role) => `${signature} · ${role} a Reggio Emilia`,
      homeDesc: (signature, role, place, period) =>
        `${signature}, ${role} a ${place}. Portfolio ${period}: prodotto, arredo, packaging e grafica.`,
      archiveTitle: (signature) => `Archivio progetti · ${signature}`,
      archiveDesc: (n, signature, period) =>
        `Tutti i ${n} progetti di ${signature}, divisi in product design e graphic design. Portfolio ${period}.`,
      archiveName: 'Archivio progetti',
      areaTitle: (label, signature) => `${label} · Archivio · ${signature}`,
      areaDesc: (count, label, signature, period, desc) =>
        `${count} di ${label} di ${signature}, ${period}. ${desc}`,
      areaName: (label) => `${label} · Archivio progetti`,
      areaImageAlt: (label, name) => `${label} — progetti di ${name}`,
      aboutTitle: (signature, role) => `Chi sono · ${signature} · ${role}`,
      projectDesc: (title, cat, year, name, role, place) =>
        `${title} — ${cat}${year}. Progetto di ${name}, ${role} a ${place}.`,
      // In inglese anche nella serie italiana: "designed by" è la formula d'uso.
      projectSignature: (name) => `Designed by ${name}`,
      privacyTitle: (signature) => `Informativa privacy · ${signature}`,
      privacyDesc: (signature) =>
        `Come il sito di ${signature} tratta i dati di chi lo visita: nessun cookie proprio, nessuna statistica, e i video di YouTube solo con il consenso.`,
      notFoundTitle: (signature) => `Pagina non trovata · ${signature}`,
      notFoundDesc: (signature) => `L'indirizzo non corrisponde a nessuna pagina del sito di ${signature}.`,
      siteDesc: (name, role, place) => `Portfolio di ${name}, ${role} a ${place}.`,
      breadcrumbHome: 'Home',
      breadcrumbArchive: 'Archivio',
      disciplines: ['Product design', 'Industrial design', 'Packaging design', 'Graphic design'],
    },

    /* Marchio "AI GENERATED"/"AI MODIFIED": la scritta dentro è disegnata e in
       inglese, quindi la frase per intero la dà il testo alternativo. */
    ai: {
      generated: 'Immagine generata con l’intelligenza artificiale',
      modified: 'Immagine modificata con l’intelligenza artificiale',
    },

    // Li usano le pagine e la sitemap immagini: una foto si descrive in un posto solo.
    alt: {
      cover: (title, cat, name) => `${title}, ${cat} — progetto di ${name}`,
      gallery: (title, cat, i, total) => `${title}, ${cat} — immagine ${i} di ${total}`,
      drawing: (title, cat) => `Disegno tecnico quotato di ${title}, ${cat}`,
      backdrop: (title) => `${title} — ambientazione`,
      video: (title) => `${title} — fotogramma del video di progetto`,
    },
  },

  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    schemaLang: 'en',
    label: 'English',

    nav: {
      home: 'Home',
      archive: 'Archive',
      about: 'About',
      logo: 'Joe Sarchiolla — home',
      instagram: (handle) => `${handle} on Instagram`,
      language: 'Language',
      goTo: 'Italian version',
    },

    home: {
      scroll: 'Scroll',
      selectedWorks: 'Selected works',
      fullArchive: 'Full archive →',
    },

    archive: {
      title: 'Archive',
      openArea: 'Open the area →',
      otherArea: 'The other area →',
      incomingPhoto: 'Photos coming',
      count: (n) => `${n} ${n === 1 ? 'project' : 'projects'}`,
    },

    project: {
      card: 'Project',
      year: 'Year',
      designer: 'Designer',
      iWorks: 'The works',
      previous: '← Previous',
      next: 'Next →',
      backTo: '← Back to',
      archive: 'Archive',
      incomingPhoto: 'Photos coming',
      videoPlay: (title) => `Play the video of ${title}`,
      videoTitle: (title) => `Video of the ${title} project`,
    },

    about: {
      eyebrow: 'About',
      heroName: 'I’m Joe',
      heroNameEm: 3.53,
      heroRole: 'Product designer',
      heroRoleEm: 10.001,
      skills: 'Skills',
      sketchbook: 'Sketchbook',
      sketchbookAria: 'Pages from the personal sketchbook of Joe Sarchiolla',
      sketchbookRole: 'flippable sketchbook',
      drawingTitle: 'Drawing is the vision of the final product.',
      drawingText:
        'It is where the object takes shape, is reworked and refined, until it defines what the product will become.',
      theWork: 'The work',
      goToArchive: 'Go to the Archive →',
      writeMe: 'Write to me',
    },

    carousel: {
      imagesOf: (title) => `Images of ${title}`,
      previous: 'Previous image',
      next: 'Next image',
      resume: 'Resume the slideshow',
      pause: 'Pause the slideshow',
      goToSlide: (n) => `Go to image ${n}`,
    },

    footer: {
      pages: 'Site pages',
      writeTo: (email) => `Write to ${email}`,
      instagram: (handle) => `@${handle} on Instagram`,
      youtube: 'Joe Sarchiolla on YouTube',
      tiktok: 'Joe Sarchiolla on TikTok',
      linkedin: 'Giovanni Sarchiolla on LinkedIn',
      row: (role, country) => `${role}, ${country}.`,
      rights: 'All rights reserved',
      privacy: 'Privacy',
      backToTop: 'Back to top',
    },

    banner: {
      eyebrow: 'Cookies and privacy',
      aria: 'Cookies and privacy',
      text: 'The site sets no cookies of its own and collects no statistics. Consent is needed only to show YouTube videos on some project pages.',
      detail:
        'If you accept, the videos start by themselves and Google receives your IP address and may store trackers in the browser. If you refuse, an image stays in their place and each video starts only when play is pressed. The choice can be changed at any time from the privacy policy.',
      enable: 'Accept',
      decline: 'Refuse',
      policy: 'Privacy policy',
    },

    service: {
      index: '← Index',
      home: 'Home',
      allProjects: 'All projects →',
      archive: 'Archive',
      error404: 'Error 404',
      title404: ['Page', 'not found'],
      text404:
        'This address matches no page on the site. It may have been moved, or it never existed. From here the way back leads to the index or to the full project archive.',
      error: 'Error',
      errorTitle: ['Something', 'went wrong'],
      errorText:
        'This page failed to load. The rest of the site works, and from here the way back leads to the index or to the full project archive.',
    },

    privacy: {
      eyebrow: 'Privacy',
      title: ['Privacy', 'policy'],
      intro:
        'In short, the site sets no cookies of its own, collects no statistics and has no forms. The only data processed is the server’s technical logs, the emails someone chooses to write and, only with consent or on pressing play, what YouTube receives to show the videos. Each processing activity is detailed below.',
      updated: 'Last updated: 18 September 2026',
      choice: {
        on: 'Videos are on and open by themselves on the pages that have one.',
        off: 'Videos are off and start only when play is pressed.',
        notChosen: 'No answer has been given yet, so videos stay off and start only when play is pressed.',
        enable: 'Turn videos on',
        turnOff: 'Turn videos off',
      },
      sections: [
        {
          title: 'Data controller',
          body: [
            'Giovanni Sarchiolla, Reggio Emilia (Italy). To exercise your rights, or for any question about this policy, write to the address below.',
          ],
          contact: true,
        },
        {
          title: 'Types of data collected',
          body: [
            'The site is static. It has no forms, no private areas and no sign-up, and it asks visitors for nothing.',
            'Three kinds of data are processed. There is the usage data the server records by itself on each visit, the data contained in emails written to the controller and, only if a video is started, the data the browser sends to YouTube. Each activity is described below, with its purpose.',
            'No data is mandatory. Writing to the controller is a choice, and nothing of a person arrives beyond what they decide to write; without an email there can be no reply, but the whole site stays available.',
          ],
        },
        {
          title: 'Mode and place of processing',
          body: [
            'Data is processed with electronic tools and protected by the security measures required by art. 32 of Regulation (EU) 2016/679 (GDPR), so that no one may access, disclose, alter or destroy it without being entitled to. It is never sold or handed over, and it is not used for automated decisions or to profile anyone.',
            'The controller operates in Italy. The providers listed for each activity may store data outside the European Economic Area as well, and where they do the transfer relies on the safeguards stated for that activity.',
            'Data is kept for as long as the purpose it was collected for requires, stated activity by activity. After that it is deleted.',
          ],
        },
        {
          title: 'Purposes and legal bases',
          body: ['Each activity has a single purpose and rests on a legal basis under art. 6 GDPR.'],
          facts: [
            ['Running and securing the site', 'System logs · legitimate interest (art. 6(1)(f))'],
            ['Replying to enquiries', 'Email · pre-contractual steps and legitimate interest (art. 6(1)(b) and (f))'],
            ['Showing videos', 'YouTube · consent (art. 6(1)(a))'],
          ],
        },
        {
          title: 'System logs and maintenance',
          body: [
            'As with any website, the server hosting it records the technical details of every request. They keep the site running and protect it from abuse; they are not used to identify anyone and are never cross-referenced with other information. You may object at any time, giving your reason.',
          ],
          facts: [
            ['Provider', 'Netlify, Inc., data processor'],
            ['Data processed', 'IP address, browser and device type, date, time and page requested'],
            ['Legal basis', 'Legitimate interest of the controller'],
            ['Place', 'United States · European Commission standard contractual clauses'],
            ['Retention', 'The short period set by the provider, then automatic deletion'],
          ],
        },
        {
          title: 'Contact by email',
          body: [
            'Whoever writes to the controller’s address shares the data contained in the message, which serves only to reply and, should a collaboration follow, to carry it forward.',
          ],
          facts: [
            ['Provider', 'Google Ireland Limited (Gmail)'],
            ['Data processed', 'Name, email address and whatever the message contains'],
            ['Legal basis', 'Pre-contractual steps requested by the data subject and legitimate interest in replying'],
            ['Place', 'Ireland; any transfer to the United States falls under the EU–US Data Privacy Framework'],
            ['Retention', 'As long as it takes to reply and, should work follow, to document it'],
          ],
        },
        {
          title: 'YouTube videos',
          body: [
            'Some project pages carry a short video hosted by YouTube, the only content that comes from outside. Until it is started, an image belonging to the site stands in its place. The player loads in two cases only. The first is consent given by answering the question that appears when the site opens, and then the video starts by itself, muted. The second is pressing play on that single video.',
            'The player uses privacy-enhanced mode (youtube-nocookie.com), which defers advertising identifiers but does not remove them. From that moment Google receives the data listed below and handles it under its own policy, and the controller has no control over it. Without consent and without a click, none of this happens.',
          ],
          facts: [
            ['Provider', 'Google Ireland Limited (YouTube), independent controller'],
            ['Data processed', 'IP address, technical details of the request, referring page and trackers stored in the browser'],
            ['Legal basis', 'Consent, which may be withdrawn at any time'],
            ['Place', 'Ireland; any transfer to the United States falls under the EU–US Data Privacy Framework'],
            ['Privacy policy', 'policies.google.com/privacy'],
          ],
        },
        {
          title: 'Cookies and other trackers',
          body: [
            'The site sets no cookies, neither technical nor profiling ones, and uses no analytics tools. Typefaces, stylesheets and scripts all come from the site itself, never from third-party domains.',
            'The browser’s local storage keeps only your answer to the question about videos, so it need not be asked on every page. It never leaves the device, does not expire and is erased along with the site’s data.',
            'Consent may be freely given, refused or withdrawn, and refusing it takes nothing away, since photographs, drawings and text stay whole. Withdrawal applies from that moment onwards and does not make earlier processing unlawful (art. 7(3) GDPR). The choice can be changed with the button below.',
          ],
          choice: true,
        },
        {
          title: 'Rights of the data subject',
          body: ['Under the conditions of articles 15 to 22 GDPR, visitors hold the rights listed below.'],
          facts: [
            ['Withdraw consent', 'At any time, from the cookies section above'],
            ['Object to processing', 'Where it rests on legitimate interest, giving the reason'],
            ['Access the data', 'Learn whether and which data is processed, and receive a copy'],
            ['Rectify it', 'Have it corrected or completed'],
            ['Restrict processing', 'Have it stored without any other use'],
            ['Have it erased', 'Where it is no longer needed or the processing is unlawful'],
            ['Receive or transfer it', 'In a structured, machine-readable format'],
            ['Lodge a complaint', 'With the Italian Garante per la protezione dei dati personali (garanteprivacy.it) or the authority of one’s own country'],
          ],
        },
        {
          title: 'How to exercise them',
          body: [
            'Write to the controller at the address at the top of this page. Requests are free of charge and answered within one month (art. 12 GDPR); where a request is complex, that term may be extended by two months, with notice given beforehand.',
          ],
        },
        {
          title: 'Further information',
          body: [
            'Data may be used to defend the controller’s rights in court or in the steps leading up to it, and disclosed to public authorities that request it by law.',
            'The icons at the foot of every page lead to the Instagram, YouTube, TikTok and LinkedIn profiles. They are plain links, and until one is clicked no data reaches those platforms. Once you leave the site, their own policies apply.',
          ],
        },
        {
          title: 'Changes to this policy',
          body: [
            'Should the site change, by adding visit statistics or a contact form for instance, this page will be updated before the new feature goes live, and the date at the bottom will show it. Where new consent is needed, it will be asked for again. The version published here is always the one that applies.',
          ],
        },
        {
          title: 'Definitions',
          body: ['The terms used on this page carry the meaning the GDPR gives them.'],
          facts: [
            ['Personal data', 'Any information relating to an identified or identifiable natural person'],
            ['Usage data', 'The technical details the browser sends with each request, such as IP, date and page'],
            ['Tracker', 'Any technology, cookies included, that stores or reads information on the device'],
            ['Data subject', 'The person the data relates to'],
            ['Controller', 'Whoever decides the purposes and means of processing'],
            ['Processor', 'Whoever processes data on the controller’s behalf'],
          ],
        },
      ],
    },



    seo: {
      homeTitle: (signature, role) => `${signature} · ${role} in Reggio Emilia`,
      homeDesc: (signature, role, place, period) =>
        `${signature}, ${role} in ${place}. Portfolio ${period}: product, furniture, packaging and graphics.`,
      archiveTitle: (signature) => `Project archive · ${signature}`,
      archiveDesc: (n, signature, period) =>
        `All ${n} projects by ${signature}, split into product design and graphic design. Portfolio ${period}.`,
      archiveName: 'Project archive',
      areaTitle: (label, signature) => `${label} · Archive · ${signature}`,
      areaDesc: (count, label, signature, period, desc) =>
        `${count} of ${label} by ${signature}, ${period}. ${desc}`,
      areaName: (label) => `${label} · Project archive`,
      areaImageAlt: (label, name) => `${label} — projects by ${name}`,
      aboutTitle: (signature, role) => `About · ${signature} · ${role}`,
      projectDesc: (title, cat, year, name, role, place) =>
        `${title} — ${cat}${year}. Project by ${name}, ${role} in ${place}.`,
      projectSignature: (name) => `Designed by ${name}`,
      privacyTitle: (signature) => `Privacy policy · ${signature}`,
      privacyDesc: (signature) =>
        `How the site of ${signature} handles visitors’ data: no cookies of its own, no analytics, and YouTube videos only with consent.`,
      notFoundTitle: (signature) => `Page not found · ${signature}`,
      notFoundDesc: (signature) => `This address matches no page on the site of ${signature}.`,
      siteDesc: (name, role, place) => `Portfolio of ${name}, ${role} in ${place}.`,
      breadcrumbHome: 'Home',
      breadcrumbArchive: 'Archive',
      disciplines: ['Product design', 'Industrial design', 'Packaging design', 'Graphic design'],
    },

    ai: {
      generated: 'Image generated with artificial intelligence',
      modified: 'Image edited with artificial intelligence',
    },

    alt: {
      cover: (title, cat, name) => `${title}, ${cat} — project by ${name}`,
      gallery: (title, cat, i, total) => `${title}, ${cat} — image ${i} of ${total}`,
      drawing: (title, cat) => `Dimensioned technical drawing of ${title}, ${cat}`,
      backdrop: (title) => `${title} — in context`,
      video: (title) => `${title} — still frame from the project video`,
    },
  },
}

export function texts(lang) {
  return TEXTS[normalizeLang(lang)]
}
