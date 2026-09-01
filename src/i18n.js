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
      tornaSu: 'Torna su',
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
      tornaSu: 'Back to top',
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
    },
  },
}

export function testi(lang) {
  return TESTI[normalizzaLingua(lang)]
}
