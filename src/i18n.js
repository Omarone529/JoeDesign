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
      row: (role, place) => `${role}, di ${place}.`,
      rights: 'Tutti i diritti riservati',
      privacy: 'Privacy',
      backToTop: 'Torna su',
    },

    // Banner cookie e privacy: dice solo ciò che succede davvero.
    banner: {
      eyebrow: 'Cookie e privacy',
      aria: 'Cookie e privacy',
      text: 'Il sito non usa cookie propri e non raccoglie statistiche: nulla di quanto si fa qui viene misurato.',
      detail:
        'Una cosa sola ha bisogno di un consenso: alcune schede di progetto contengono reel ospitati da YouTube. Accettando si aprono da sé, e Google può conservare informazioni nel browser. Rifiutando restano figure del sito, e ogni filmato parte lo stesso premendo play. La risposta si cambia quando si vuole.',
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
        "L'indirizzo non corrisponde a nessuna pagina del sito: può essere stato spostato, oppure non è mai esistito. Da qui si torna all'indice o all'archivio completo dei progetti.",
      error: 'Errore',
      errorTitle: ['Qualcosa', 'non ha funzionato'],
      errorText:
        "Questa pagina non è riuscita a caricarsi. Il resto del sito funziona: da qui si torna all'indice o all'archivio completo dei progetti.",
    },


    /*
     * Informativa privacy, allineata al sito di oggi. ⚠️ Ogni nuovo trattamento (analitica, modulo,
     * video) richiede di riscriverla, e di spostare `updated`, prima di entrare in funzione.
     */
    privacy: {
      eyebrow: 'Privacy',
      title: ['Informativa', 'privacy'],
      intro:
        'Il sito non usa cookie propri, non raccoglie statistiche e non chiede dati a chi lo visita. Restano tre cose: i log tecnici del server, i video di YouTube che si aprono nelle schede di progetto solo se lo si consente, e le email che qualcuno decide di scrivere. Qui c’è spiegato come vengono trattate.',
      updated: 'Ultimo aggiornamento: 3 settembre 2026',
      choice: {
        on: 'I video sono attivi: si aprono da soli nelle schede che ne hanno uno.',
        off: 'I video sono spenti: partono solo premendo play.',
        notChosen: 'Non è ancora stata data una risposta: i video restano spenti, e partono solo premendo play.',
        enable: 'Attiva i video',
        turnOff: 'Spegni i video',
      },
      sections: [
        {
          title: 'Chi tratta i dati',
          body: [
            'Il titolare del trattamento è Giovanni Sarchiolla, Reggio Emilia (Italia). Per far valere i propri diritti, o per qualsiasi domanda su questa pagina, si può scrivere a:',
          ],
          contact: true,
        },
        {
          title: 'Cosa raccoglie il sito',
          body: [
            'Il sito è statico: non ha moduli da compilare, né aree riservate, né registrazione. A chi lo visita non chiede niente.',
            'Come ogni sito, il server che lo ospita registra da sé i dati tecnici di ogni visita: indirizzo IP, tipo di browser e di dispositivo, data, ora e pagina aperta. Sono i normali log di funzionamento. Non servono a identificare nessuno e non vengono incrociati con altre informazioni.',
            'I dati sono trattati con strumenti informatici, protetti dalle misure di sicurezza che chiede l’articolo 32 del Regolamento perché nessuno vi acceda, li diffonda, li cambi o li distrugga senza averne titolo. Scrivere al titolare resta libero: non c’è nessun campo obbligatorio, perché non c’è nessun modulo, e di una persona arriva solo quello che sceglie di scrivere.',
          ],
        },
        {
          title: 'Cookie e statistiche',
          body: [
            'Il sito non usa cookie, né tecnici né di profilazione. L’unica cosa che salva nella memoria del browser è la risposta alla domanda sui video, per non doverla richiedere a ogni pagina. Resta sul dispositivo, non va a nessuno e non serve a riconoscere chi torna.',
            'Non c’è nessuno strumento di statistica o di tracciamento. Anche i caratteri tipografici, i fogli di stile e gli script con cui le pagine sono composte arrivano tutti dal sito, mai da domini di terze parti.',
            'Alcune schede di progetto contengono un breve video ospitato da YouTube, l’unico contenuto che arriverebbe da fuori. Non si carica da sé: al suo posto c’è una figura del sito. YouTube viene contattato in due soli casi. Il primo è se lo si è consentito rispondendo alla domanda che compare aprendo il sito, e allora il filmato parte da solo, muto, a pagina caricata. Il secondo è premendo play su quel singolo video. Chi non fa né l’una né l’altra cosa guarda tutto il sito senza che nessun terzo ne sappia niente.',
            'Il player si carica nella modalità senza cookie che YouTube mette a disposizione, la quale rimanda gli identificatori pubblicitari ma non li toglie. Da quel momento vale l’informativa di Google.',
            'Le pagine senza video, cioè la home, l’archivio, «Chi sono» e questa stessa, restano fatte con i soli file del sito, e lì nessun terzo viene contattato.',
          ],
        },
        {
          title: 'La scelta sui video',
          body: [
            'La risposta alla domanda sui video resta nel browser di chi visita e non va da nessuna parte: serve solo a ricordare di non caricare YouTube senza permesso. Si cambia da qui quando si vuole, e cancellando i dati del sito dal browser sparisce con essi.',
            'Il consenso si può dare, negare o ritirare liberamente, e negarlo non costa niente: il sito resta intero. Il ritiro vale da quel momento in avanti e non rende illecito quello che è già successo mentre il consenso c’era (art. 7, par. 3 del Regolamento). La risposta non scade: resta finché non la si cambia.',
          ],
          choice: true,
        },
        {
          title: 'Perché, e con quale diritto',
          body: [
            'I log tecnici servono a far funzionare il sito e a difenderlo dagli abusi. La base giuridica è il legittimo interesse del titolare (art. 6, par. 1, lett. f del Regolamento UE 2016/679).',
            'Quello che si scrive in un’email, cioè il nome, l’indirizzo e il resto del messaggio, serve solo a rispondere e, se ne nasce una collaborazione, a portarla avanti (art. 6, par. 1, lett. b ed f).',
            'Il player di YouTube, e i dati che ne derivano, poggiano sul consenso (art. 6, par. 1, lett. a). Lo si dà rispondendo alla domanda che compare aprendo il sito, oppure premendo play su un singolo filmato, e si può ritirare quando si vuole dalla sezione «La scelta sui video». Negandolo non si perde nient’altro: fotografie, disegno tecnico e testi restano interi.',
          ],
        },
        {
          title: 'Chi altro li vede',
          body: [
            'Il sito è ospitato da Netlify, Inc. (Stati Uniti), che è responsabile del trattamento ed è chi conserva i log del server. I dati escono dallo Spazio economico europeo sulla base delle clausole contrattuali standard approvate dalla Commissione europea.',
            'La posta elettronica è gestita da Google Ireland Limited (Gmail).',
            'I video delle schede di progetto sono su YouTube (Google Ireland Limited). Quando il player si carica, dopo il consenso o premendo play, il browser si collega ai server di Google. Google riceve l’indirizzo IP, i dati tecnici della richiesta e l’indirizzo della pagina da cui si arriva, e può conservare informazioni nel dispositivo secondo la propria informativa. Su questi dati il titolare non ha alcun controllo: valgono le condizioni di Google. Senza consenso e senza clic non accade niente di tutto questo.',
            'Nessun dato viene ceduto o venduto, e non c’è nessuna decisione presa in automatico.',
          ],
        },
        {
          title: 'Per quanto tempo',
          body: [
            'I log del server restano per il breve periodo previsto da chi ospita il sito, poi si cancellano da soli. Le email si conservano il tempo che serve a rispondere e, se ne nasce un lavoro, a documentarlo.',
          ],
        },
        {
          title: 'Cosa si può chiedere',
          body: [
            'A chi visita il sito spettano i diritti degli articoli da 15 a 22 del Regolamento: sapere quali dati ci sono, farli correggere, farli cancellare, limitarne l’uso, opporsi al trattamento e farseli consegnare in un formato leggibile. Per esercitarli basta scrivere al titolare, all’indirizzo in cima a questa pagina.',
            'Dove il trattamento poggia sul legittimo interesse, e qui riguarda i soli log tecnici, ci si può opporre quando si vuole, spiegando il motivo. Il titolare risponde entro un mese, come chiede l’articolo 12. Se la richiesta è complicata il termine può allungarsi di due mesi, dicendolo prima.',
            'Resta sempre la possibilità di presentare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it), o di rivolgersi a un giudice.',
          ],
        },
        {
          title: 'Link esterni',
          body: [
            'Le icone in fondo a ogni pagina portano ai profili Instagram, YouTube, TikTok e LinkedIn. Sono collegamenti normali: finché non si clicca, nessun dato li raggiunge. Il video delle schede di progetto è invece un contenuto incorporato, e finché non lo si consente resta una figura del sito.',
            'Una volta usciti dal sito, o avviato il video, valgono le informative di quelle piattaforme, sulle quali il titolare non può niente.',
          ],
        },
        {
          title: 'Se qualcosa cambia',
          body: [
            'Se il sito cambierà, per esempio con delle statistiche di visita o un modulo di contatto, questa pagina verrà aggiornata prima che la novità entri in funzione. Vale sempre la versione pubblicata qui.',
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
      row: (role, place) => `${role}, based in ${place}.`,
      rights: 'All rights reserved',
      privacy: 'Privacy',
      backToTop: 'Back to top',
    },

    banner: {
      eyebrow: 'Cookies and privacy',
      aria: 'Cookies and privacy',
      text: 'The site sets no cookies of its own and collects no statistics: nothing done here is measured.',
      detail:
        'One thing alone needs consent: some project pages carry reels hosted on YouTube. Accepted, they open by themselves, and Google may store information in the browser. Refused, they stay images belonging to the site, and each clip still starts when play is pressed. The answer can be changed whenever you like.',
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
        'This address matches no page on the site: it may have been moved, or it never existed. From here the way back leads to the index or to the full project archive.',
      error: 'Error',
      errorTitle: ['Something', 'went wrong'],
      errorText:
        'This page failed to load. The rest of the site works: from here the way back leads to the index or to the full project archive.',
    },

    privacy: {
      eyebrow: 'Privacy',
      title: ['Privacy', 'policy'],
      intro:
        'This site sets no cookies of its own, collects no statistics and asks visitors for no data. Three things remain: the server’s technical logs, the YouTube videos that open on the project pages only if you allow them, and any email someone decides to write. This page explains how they are handled.',
      updated: 'Last updated: 3 September 2026',
      choice: {
        on: 'Videos are on: they open by themselves on the pages that have one.',
        off: 'Videos are off: they start only when play is pressed.',
        notChosen: 'No answer has been given yet: videos stay off, and start only when play is pressed.',
        enable: 'Turn videos on',
        turnOff: 'Turn videos off',
      },
      sections: [
        {
          title: 'Who handles the data',
          body: [
            'The data controller is Giovanni Sarchiolla, Reggio Emilia (Italy). To exercise your rights, or for any question about this page, write to:',
          ],
          contact: true,
        },
        {
          title: 'What the site collects',
          body: [
            'The site is static: no forms to fill in, no private areas, no sign-up. It asks visitors for nothing.',
            'As with any website, the server hosting it records the technical details of each visit by itself: IP address, browser and device type, date, time and page opened. These are ordinary operational logs. They identify no one and are never cross-referenced with other information.',
            'The data is handled with electronic tools and protected by the security measures article 32 of the Regulation requires, so that no one may access, disclose, alter or destroy it without being entitled to. Writing to the controller stays entirely free: there is no required field, because there is no form at all, and nothing of a person arrives beyond what they choose to write.',
          ],
        },
        {
          title: 'Cookies and statistics',
          body: [
            'The site sets no cookies, neither technical nor profiling ones. The only thing it keeps in the browser’s memory is your answer to the question about videos, so it need not be asked on every page. It stays on the device, goes to no one, and is not used to recognise anyone who returns.',
            'There is no analytics or tracking tool of any kind. The typefaces, stylesheets and scripts the pages are built from all come from the site itself, never from third-party domains.',
            'Some project pages carry a short video hosted by YouTube, the only content that would come from outside. It does not load by itself: in its place there is an image belonging to the site. YouTube is contacted in two cases only. The first is if you have allowed it by answering the question that appears when the site opens, and then the clip starts by itself, muted, once the page has loaded. The second is by pressing play on that single video. Anyone who does neither browses the whole site without any third party learning anything.',
            'The player loads in the cookie-free mode YouTube provides, which defers advertising identifiers but does not remove them. From that moment Google’s own policy applies.',
            'The pages without a video, that is the home, the archive, “About” and this one, are built from the site’s own files alone, and there no third party is contacted.',
          ],
        },
        {
          title: 'Your choice about videos',
          body: [
            'The answer you give to the question about videos stays in your browser and goes nowhere: it serves only to remember not to load YouTube without permission. You can change it here whenever you like, and clearing the site’s data from the browser clears it too.',
            'Consent may be freely given, refused or withdrawn, and refusing it costs nothing: the site stays whole. Withdrawal takes effect from that moment onwards and does not make unlawful what already happened while consent was in place (art. 7(3) of the Regulation). The answer does not expire: it stays until you change it.',
          ],
          choice: true,
        },
        {
          title: 'Why, and on what basis',
          body: [
            'The technical logs keep the site running and protect it from abuse. The legal basis is the controller’s legitimate interest (art. 6(1)(f) of Regulation (EU) 2016/679).',
            'What you write in an email, that is your name, your address and the rest of the message, serves only to reply and, should a collaboration follow, to carry it forward (art. 6(1)(b) and (f)).',
            'The YouTube player, and the data that follows from it, rest on consent (art. 6(1)(a)). You give it by answering the question that appears when the site opens, or by pressing play on a single clip, and you can withdraw it whenever you like from the “Your choice about videos” section. Refusing costs nothing else: photographs, technical drawing and text stay whole.',
          ],
        },
        {
          title: 'Who else sees it',
          body: [
            'The site is hosted by Netlify, Inc. (United States), which acts as data processor and is the party keeping the server logs. Data leaves the European Economic Area on the basis of the standard contractual clauses approved by the European Commission.',
            'Email is handled by Google Ireland Limited (Gmail).',
            'The videos on the project pages are on YouTube (Google Ireland Limited). When the player loads, after consent or on pressing play, the browser connects to Google’s servers. Google receives the IP address, the technical details of the request and the address of the page you come from, and may keep information on the device under its own policy. The controller has no control over this data: Google’s terms apply. Without consent and without a click, none of it happens.',
            'No data is sold or handed over, and nothing is decided automatically.',
          ],
        },
        {
          title: 'How long it is kept',
          body: [
            'Server logs stay for the short period set by whoever hosts the site, then delete themselves. Emails are kept for as long as it takes to reply and, should work follow, to document it.',
          ],
        },
        {
          title: 'What you can ask for',
          body: [
            'Visitors hold the rights set out in articles 15 to 22 of the Regulation: to know what data there is, to have it corrected, to have it erased, to limit its use, to object to the processing and to be handed it in a readable format. To exercise them, write to the controller at the address at the top of this page.',
            'Where processing rests on legitimate interest, which here means the technical logs alone, you may object whenever you like, giving your reason. The controller answers within one month, as article 12 requires. Where a request is complicated that term may be extended by two months, said so in advance.',
            'It is always possible to lodge a complaint with the Italian Data Protection Authority, the Garante per la protezione dei dati personali (garanteprivacy.it), or to go before a court.',
          ],
        },
        {
          title: 'External links',
          body: [
            'The icons at the foot of every page lead to the Instagram, YouTube, TikTok and LinkedIn profiles. They are ordinary links: until one is clicked, no data reaches them. The video on the project pages is embedded content, and until it is allowed it stays an image belonging to the site.',
            'Once you leave the site, or start the video, the policies of those platforms apply, over which the controller can do nothing.',
          ],
        },
        {
          title: 'If something changes',
          body: [
            'Should the site change, by adding visit statistics or a contact form for instance, this page will be updated before the new feature goes live. The version published here is always the one that applies.',
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
