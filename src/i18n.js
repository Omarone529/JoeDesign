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
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      contacts: 'Contacts',
      sketchbook: 'Sketchbook',
      sketchbookAria: 'Tavole dello sketchbook personale di Joe Sarchiolla',
      sketchbookRuolo: 'sketchbook sfogliabile',
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
        'Una cosa sola ha bisogno di un consenso: alcune schede di progetto contengono reel ospitati da YouTube. Accettando si aprono da sé, e Google può conservare informazioni nel browser. Rifiutando restano figure del sito, e ogni filmato parte lo stesso premendo play.',
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
     * vuole le sezioni «Cookie e statistiche», «Finalità e base giuridica»,
     * «A chi vengono comunicati» e «Link esterni» riscritte PRIMA che entri in
     * funzione, e `aggiornato` con esse.
     */
    privacy: {
      occhiello: 'Privacy',
      titolo: ['Informativa', 'privacy'],
      intro:
        'Il sito non ha cookie propri, non raccoglie statistiche e non chiede dati a chi lo visita. Restano i log tecnici del server, i video di YouTube che si aprono nelle schede di progetto soltanto se lo si consente, e le email inviate spontaneamente: qui è spiegato come vengono trattati.',
      aggiornato: 'Ultimo aggiornamento: 2 settembre 2026',
      scelta: {
        attivi: 'I video sono attivi: si aprono da soli nelle schede che ne hanno uno.',
        spenti: 'I video sono spenti: partono solo premendo play.',
        nonScelto: 'Non è ancora stata data una risposta: i video restano spenti, e partono solo premendo play.',
        attiva: 'Attiva i video',
        spegni: 'Spegni i video',
      },
      sezioni: [
        {
          titolo: 'Titolare del trattamento',
          corpo: [
            'Il titolare del trattamento è Giovanni Sarchiolla, Reggio Emilia (Italia). Per esercitare i propri diritti, o per qualunque domanda su questa informativa, si può scrivere a:',
          ],
          contatto: true,
        },
        {
          titolo: 'Dati raccolti dal sito',
          corpo: [
            'Il sito è statico: non ha moduli da compilare, né aree riservate o registrazione, e non chiede alcun dato a chi lo visita.',
            'Come accade per qualsiasi sito, il server che lo ospita registra da sé i dati tecnici di ogni visita — indirizzo IP, tipo di browser e di dispositivo, data, ora e pagina richiesta. Sono i normali log di funzionamento: non servono a identificare le persone e non vengono incrociati con altre informazioni.',
          ],
        },
        {
          titolo: 'Cookie e statistiche',
          corpo: [
            'Il sito non usa cookie, né tecnici né di profilazione. L’unica cosa che salva nella memoria del browser è la risposta alla domanda sui video, per non doverla richiedere a ogni pagina: resta sul dispositivo, non viene trasmessa a nessuno e non serve a riconoscere chi torna.',
            'Non è installato alcuno strumento di statistica o di tracciamento, e nessuna risorsa di impaginazione — carattere tipografico, foglio di stile, script, mappa — viene caricata da domini di terze parti.',
            'Alcune schede di progetto contengono un breve video ospitato da YouTube: è l’unico contenuto del sito che arriverebbe da un dominio di terze parti. Non si carica da sé. Al suo posto c’è una figura del sito, e YouTube viene contattato in due soli casi: se lo si è consentito rispondendo alla domanda che compare su quelle schede — e allora il filmato parte da sé, muto, a pagina caricata — oppure premendo play su quel singolo video. Chi non fa né l’una né l’altra cosa guarda l’intero sito senza che nessun terzo ne sappia nulla.',
            'Quando il player viene caricato è nella modalità senza cookie che YouTube mette a disposizione, la quale rimanda gli identificatori pubblicitari ma non li elimina: da quel momento vale l’informativa di Google.',
            'Le pagine senza video — la home, l’archivio, «Chi sono», questa stessa — restano composte con i soli file del sito, e su di esse non viene contattato nessun terzo.',
          ],
        },
        {
          titolo: 'La scelta sui video',
          corpo: [
            'La risposta data alla domanda sui video resta nel browser di chi visita e non viene trasmessa a nessuno: serve soltanto a ricordare di non caricare YouTube senza permesso. Si cambia da qui, in qualsiasi momento, e cancellando i dati del sito dal browser sparisce con essi.',
          ],
          scelta: true,
        },
        {
          titolo: 'Finalità e base giuridica',
          corpo: [
            'I log tecnici servono a far funzionare il sito e a proteggerlo dagli abusi: la base giuridica è il legittimo interesse del titolare (art. 6, par. 1, lett. f del Regolamento UE 2016/679).',
            'I dati contenuti in un messaggio inviato spontaneamente per email — nome, indirizzo e quanto altro si sceglie di scrivere — vengono trattati solo per rispondere e, se ne nasce una collaborazione, per gestirla (art. 6, par. 1, lett. b ed f).',
            'Il caricamento del player di YouTube, e i dati che ne derivano, hanno come base giuridica il consenso (art. 6, par. 1, lett. a): lo si dà rispondendo alla domanda che compare sulle schede con video, oppure premendo play su un singolo filmato, e si può ritirare in ogni momento dalla sezione «La scelta sui video» di questa pagina. Negandolo non si perde nulla del resto: fotografie, disegno tecnico e testi restano interi.',
          ],
        },
        {
          titolo: 'A chi vengono comunicati',
          corpo: [
            'Il sito è ospitato da Netlify, Inc. (Stati Uniti), che agisce come responsabile del trattamento ed è il soggetto che conserva i log del server. Il trasferimento dei dati fuori dallo Spazio economico europeo avviene sulla base delle clausole contrattuali standard approvate dalla Commissione europea.',
            'La posta elettronica è gestita da Google Ireland Limited (Gmail).',
            'I video delle schede di progetto sono ospitati su YouTube (Google Ireland Limited). Nel momento in cui il player viene caricato — dopo il consenso, o premendo play — il browser si collega ai server di Google, che ricevono l’indirizzo IP, i dati tecnici della richiesta e l’indirizzo della pagina da cui arriva, e possono conservare informazioni nel dispositivo secondo la propria informativa. Su questi dati il titolare non ha alcun controllo: valgono le condizioni di Google. Senza consenso e senza clic, nulla di tutto questo accade.',
            'Nessun dato viene ceduto o venduto a terzi, e non è previsto alcun processo decisionale automatizzato.',
          ],
        },
        {
          titolo: 'Per quanto tempo',
          corpo: [
            'I log del server restano disponibili per il breve periodo previsto dal fornitore di hosting, poi vengono cancellati da sé. Le email si conservano per il tempo necessario a rispondere e a documentare l’eventuale rapporto professionale.',
          ],
        },
        {
          titolo: 'Diritti',
          corpo: [
            'A chi visita il sito spettano i diritti previsti dagli articoli da 15 a 22 del Regolamento: accesso ai propri dati, rettifica, cancellazione, limitazione, opposizione al trattamento e portabilità. Per esercitarli basta scrivere al titolare, all’indirizzo indicato in cima a questa pagina.',
            'Resta sempre possibile presentare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).',
          ],
        },
        {
          titolo: 'Link esterni',
          corpo: [
            'Le icone in fondo a ogni pagina portano ai profili Instagram, YouTube, TikTok e LinkedIn: sono semplici collegamenti, e finché non si clicca nessun dato li raggiunge. Il video delle schede di progetto è invece un contenuto incorporato, e finché non lo si consente resta una figura del sito.',
            'Una volta lasciato il sito, o avviato il video, valgono le informative di quelle piattaforme, sulle quali il titolare non ha alcun controllo.',
          ],
        },
        {
          titolo: 'Modifiche',
          corpo: [
            'Se il sito cambierà — per esempio con l’aggiunta di statistiche di visita o di un modulo di contatto — questa informativa verrà aggiornata prima che la novità entri in funzione. Vale sempre la versione pubblicata in questa pagina.',
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
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      contacts: 'Contacts',
      sketchbook: 'Sketchbook',
      sketchbookAria: 'Pages from the personal sketchbook of Joe Sarchiolla',
      sketchbookRuolo: 'flippable sketchbook',
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
        'One thing alone needs consent: some project pages carry reels hosted on YouTube. Accepted, they open by themselves, and Google may store information in the browser. Refused, they stay images belonging to the site, and each clip still starts when play is pressed.',
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
        'This site sets no cookies of its own, collects no statistics and asks visitors for no data. What remains are the server’s technical logs, the YouTube videos that open on the project pages only if you allow them, and any email sent spontaneously: this page explains how they are handled.',
      aggiornato: 'Last updated: 2 September 2026',
      scelta: {
        attivi: 'Videos are on: they open by themselves on the pages that have one.',
        spenti: 'Videos are off: they start only when play is pressed.',
        nonScelto: 'No answer has been given yet: videos stay off, and start only when play is pressed.',
        attiva: 'Turn videos on',
        spegni: 'Turn videos off',
      },
      sezioni: [
        {
          titolo: 'Data controller',
          corpo: [
            'The data controller is Giovanni Sarchiolla, Reggio Emilia (Italy). To exercise your rights, or for any question about this policy, write to:',
          ],
          contatto: true,
        },
        {
          titolo: 'Data collected by the site',
          corpo: [
            'The site is static: it has no forms, no private areas and no sign-up, and it asks visitors for no data at all.',
            'As happens with any website, the server hosting it records the technical details of each visit by itself — IP address, browser and device type, date, time and page requested. These are ordinary operational logs: they are not used to identify people and are not cross-referenced with other information.',
          ],
        },
        {
          titolo: 'Cookies and statistics',
          corpo: [
            'The site sets no cookies, neither technical nor profiling ones. The only thing it stores in the browser’s memory is your answer to the question about videos, so it need not be asked on every page: it stays on the device, is sent to no one, and is not used to recognise anyone who returns.',
            'No analytics or tracking tool is installed, and no layout resource — typeface, stylesheet, script, map — is loaded from third-party domains.',
            'Some project pages carry a short video hosted by YouTube: it is the only content on the site that would come from a third-party domain. It does not load by itself. In its place there is an image belonging to the site, and YouTube is contacted in two cases only: if you have allowed it by answering the question that appears on those pages — in which case the clip starts by itself, muted, once the page has loaded — or by pressing play on that single video. Anyone who does neither browses the whole site without any third party learning anything.',
            'When the player is loaded it runs in the cookie-free mode YouTube provides, which defers advertising identifiers but does not remove them: from that moment Google’s own policy applies.',
            'Pages without a video — the home, the archive, “About”, this very one — are still built from the site’s own files alone, and on those no third party is contacted at all.',
          ],
        },
        {
          titolo: 'Your choice about videos',
          corpo: [
            'The answer you give to the question about videos stays in your browser and is sent to no one: it serves only to remember not to load YouTube without permission. It can be changed here at any time, and clearing the site’s data from the browser clears it too.',
          ],
          scelta: true,
        },
        {
          titolo: 'Purposes and legal basis',
          corpo: [
            'The technical logs serve to keep the site running and to protect it from abuse: the legal basis is the controller’s legitimate interest (art. 6(1)(f) of Regulation (EU) 2016/679).',
            'The data contained in an email sent spontaneously — name, address and whatever else you choose to write — is processed only to reply and, should a collaboration follow, to manage it (art. 6(1)(b) and (f)).',
            'The loading of the YouTube player, and the data that follows from it, rest on consent as their legal basis (art. 6(1)(a)): it is given by answering the question that appears on pages with a video, or by pressing play on a single clip, and it can be withdrawn at any time from the “Your choice about videos” section of this page. Refusing costs nothing else: photographs, technical drawing and text stay whole.',
          ],
        },
        {
          titolo: 'Who receives the data',
          corpo: [
            'The site is hosted by Netlify, Inc. (United States), which acts as data processor and is the party keeping the server logs. Transfers outside the European Economic Area rely on the standard contractual clauses approved by the European Commission.',
            'Email is handled by Google Ireland Limited (Gmail).',
            'The videos on the project pages are hosted on YouTube (Google Ireland Limited). At the moment the player is loaded — after consent, or on pressing play — the browser connects to Google’s servers, and they receive the IP address, the technical details of the request and the address of the page it comes from, and may store information on the device under their own policy. The controller has no control over this data: Google’s terms apply. Without consent and without a click, none of this happens.',
            'No data is sold or handed over to third parties, and no automated decision-making takes place.',
          ],
        },
        {
          titolo: 'How long it is kept',
          corpo: [
            'Server logs remain available for the short period set by the hosting provider, then are deleted automatically. Emails are kept for as long as needed to reply and to document any professional relationship.',
          ],
        },
        {
          titolo: 'Your rights',
          corpo: [
            'Visitors hold the rights set out in articles 15 to 22 of the Regulation: access to their data, rectification, erasure, restriction, objection to processing and portability. To exercise them, simply write to the controller at the address given at the top of this page.',
            'It is always possible to lodge a complaint with the Italian Data Protection Authority, the Garante per la protezione dei dati personali (garanteprivacy.it).',
          ],
        },
        {
          titolo: 'External links',
          corpo: [
            'The icons at the foot of every page lead to the Instagram, YouTube, TikTok and LinkedIn profiles: they are plain links, and until one is clicked no data reaches them. The video on the project pages is embedded content, and until it is allowed it stays an image belonging to the site.',
            'Once you leave the site, or start the video, the policies of those platforms apply, over which the controller has no control.',
          ],
        },
        {
          titolo: 'Changes',
          corpo: [
            'Should the site change — by adding visit statistics or a contact form, for instance — this policy will be updated before the new feature goes live. The version published on this page is always the one that applies.',
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
