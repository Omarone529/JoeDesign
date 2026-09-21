// Contenuti del sito: fonte di verità unica. Immagini in public/images/products/<slug>/.

import { texts } from '../i18n.js'
import { aboutEn, areasEn, manifestoPhotoEn, profileEn, projectsEn } from './contentEn.js'

export const profile = {
  name: 'Giovanni Sarchiolla',
  displayName: 'Joe Sarchiolla',
  nick: 'Joe',
  role: 'Product Designer',
  place: 'Reggio Emilia, Italia',
  education: 'Accademia di Belle Arti, Bologna',
  handle: 'joesarchiolla.design',
  instagram: 'https://instagram.com/joesarchiolla.design',
  youtube: 'https://www.youtube.com/@design.by.joesarchiolla',
  tiktok: 'https://www.tiktok.com/@design.by.joesarchiolla',
  linkedin: 'https://www.linkedin.com/in/giovanni-sarchiolla-a80659232/',
  email: 'joe.artedesign@gmail.com',
  emailHref: 'https://mail.google.com/mail/?view=cm&fs=1&to=joe.artedesign@gmail.com',
  manifesto:
    'L’ispirazione arriva dall’arte, dalla moda e dalla grafica, e da lì prende forma il prodotto. La ricerca è sempre quella della forma che non ha bisogno di parole.',
  summary:
    'Lampade, sedute e oggetti d’uso: forme che uniscono estetica, funzione e dimensione emotiva.',
}

/* Decorativo, quindi `alt` vuoto: la sfocatura la mette il CSS. */
export const homeHero = {
  src: '/images/home/joe-hero.webp',
  alt: '',
  width: 1080,
  height: 1351,
}

// Non più in pagina: resta la sorgente delle anteprime social dell'archivio (og-image.js).
export const familyBand = {
  src: '/images/home/family-band.webp',
}

// Foto di Joe con la lampada DADO, in home sotto il manifesto. La usa anche og-image.js per "Chi sono".
export const manifestoPhoto = {
  src: '/images/about/joe-lab.webp',
  alt: 'La lampada DADO accesa, tenuta in mano',
  width: 1900,
  height: 1425,
}

export const about = {
  intro:
    'Sono Joe, designer con la curiosità di trasformare ciò che mi circonda in nuove idee. Mi interessa progettare oggetti che uniscono funzionalità, ricerca e identità, dal primo schizzo al prototipo.',
  // Per Google e JSON-LD, al posto dell'intro in prima persona.
  description:
    'Product designer di Reggio Emilia. Oggetti che uniscono estetica, funzione e dimensione emotiva, con attenzione alla produzione e al rapporto tra forma e utente.',
  // Elenco piatto per il JSON-LD. Uno strumento nuovo va anche in `skillCards`.
  skills: [
    'Illustrator',
    'Photoshop',
    'InDesign',
    'Rhino 3D',
    'Shapr3D',
    'Affinity',
    'Mobilturi 3D',
    'Metron (Imab)',
    '3CAD',
    'GSG',
    'PowerPoint',
    'Keynote',
    'Canva',
  ],
  // Traduzione in `aboutEn.skillCards`, per `key`. `photos: null` lascia il grigio.
  skillCards: [
    {
      key: 'printing',
      title: 'Stampa 3D',
      text: 'Dalla progettazione digitale alla realizzazione fisica del prodotto.',
      tools: [],
      photos: {
        src: '/images/about/skills/printing.webp',
        alt: 'Stampante 3D Bambu Lab al lavoro su contenitori rossi DOSE',
      },
    },
    {
      key: 'graphics',
      title: 'Graphic design',
      text:
        'Sviluppo di progetti grafici, loghi e identità visive per concorsi, bandi e progetti personali.',
      tools: ['Illustrator', 'Photoshop', 'InDesign', 'Affinity', 'Canva'],
      photos: {
        src: '/images/about/skills/graphics.webp',
        alt: 'Rivista aperta sulla sezione Graphic design, con illustrazioni in nero, rosso e giallo',
      },
    },
    {
      key: 'modeling',
      title: 'Modellazione 3D',
      text: 'Sviluppo e modellazione di prodotti e progetti tridimensionali.',
      tools: ['Rhino 3D', 'Shapr3D'],
      photos: {
        src: '/images/about/skills/modeling.webp',
        alt: 'Lampade e componenti modulari neri a sezione scanalata, con dettagli rossi',
      },
    },
    {
      key: 'prototypes',
      title: 'Prototipi e modellini',
      text:
        'Realizzazione di prototipi e modelli fisici attraverso la lavorazione del legno e la sperimentazione dei materiali.',
      tools: [],
      photos: {
        src: '/images/about/skills/prototypes.webp',
        alt: 'Joe Sarchiolla monta un prototipo di tubi arancioni con tappi bianchi e neri',
      },
    },
  ],
  // `hero` è scontornato; `sketches` ha fondo bianco e va in mix-blend-multiply.
  photos: {
    hero: { src: '/images/about/joe-hero.webp', alt: 'Ritratto di Joe Sarchiolla, cappello e occhiali' },
    sketches: {
      src: '/images/about/sketches.webp',
      alt: 'Tavola di schizzi a mano: lampade, sedute, vasi, imbottiti e sistemi di illuminazione',
    },
  },
  // Tavole dello sketchbook (scripts/sketchbook-pages.js): fronte e retro per pagina, la 09 da sola.
  sketchbook: [
    {
      front: { src: '/images/about/sketchbook/01.webp', alt: 'Copertina dello sketchbook personale di Joe Sarchiolla' },
      back: { src: '/images/about/sketchbook/02.webp', alt: 'Frontespizio Vol.1 Archivio' },
    },
    {
      front: { src: '/images/about/sketchbook/03.webp', alt: 'Indice dei progetti del 2024, con miniature' },
      back: { src: '/images/about/sketchbook/04.webp', alt: 'Griglia di prodotti in miniatura' },
    },
    {
      front: { src: '/images/about/sketchbook/05.webp', alt: 'Joe con alcuni dei suoi oggetti in mano' },
      back: { src: '/images/about/sketchbook/06.webp', alt: 'Dettaglio del progetto Bullone, un portapenne' },
    },
    {
      front: { src: '/images/about/sketchbook/07.webp', alt: 'Foto scenografica del progetto Flue' },
      back: { src: '/images/about/sketchbook/08.webp', alt: 'Scheda del progetto Mari Chair CAD, disegno tecnico e foto' },
    },
    {
      front: { src: '/images/about/sketchbook/09.webp', alt: 'Scultura Sedia a tempo determinato, contest In-sicurezza' },
      back: null,
    },
  ],
}

/*
 * Campi: `photos` foto di galleria · `drawing`/`backdrop` file presenti · `area` 'product'|'graphic'
 * · `video` id Short verticale · `film` id video orizzontale · `noPhotos` immagini in arrivo
 * · `ai` immagini di sintesi (vedi `aiPhoto`) · `plate` numero nell'area, 01 = il più vecchio.
 * L'ordine qui non conta: lo applica `archive`.
 */
const projects = [
  {
    slug: 'dose',
    title: 'DOSE',
    cat: 'Portaccendino',
    year: '2026',
    photos: 8,
    video: 'UYS6ik4XTV0',
    drawing: true,
    backdrop: true,
    ai: { generated: [1, 3, 5, 8], backdrop: 'generated' },
    plate: 20,
    desc: 'DOSE è un portaccendino pensato per chi il proprio accendino non lo trova mai, fra le tasche dei cargo, le borse e gli oggetti che si portano con sé ogni giorno: nasce dall’esigenza di averlo sempre a portata di mano, trasformandolo in un accessorio da indossare e non semplicemente da riporre. La forma a pillola ne definisce l’identità, mentre l’estetica pop e i colori industriali accesi ne costruiscono un linguaggio visivo deciso e riconoscibile. Un sistema di calamite permette di scegliere e combinare liberamente i diversi elementi, che si intercambiano con facilità: ogni DOSE è componibile e personalizzabile nelle sue configurazioni cromatiche. L’aggancio lo fissa ai pantaloni o alla borsa e tiene l’accendino sempre visibile e accessibile: un piccolo accessorio per rendere più semplice un gesto quotidiano.',
    spec: {
      Oggetto: 'Portaccendino · Portachiavi',
      Contesto: 'Progetto Personale',
      Materiale: 'PLA',
      Colore: 'Rosso / Bianco',
    },
  },

  {
    slug: 'directional-arrow',
    title: 'DIRECTIONAL ARROW',
    cat: 'Appendiabiti',
    year: '2026',
    photos: 5,
    drawing: true,
    backdrop: true,
    ai: { generated: [2, 3, 4, 5], backdrop: 'generated' },
    plate: 11,
    desc: 'Arrow è un progetto pensato per chi ama lo stile industriale e il design essenziale. La freccia direzionale, elemento grafico ricorrente, diventa qui il fulcro del prodotto, conferendogli un forte valore geometrico, grafico e industriale.',
    spec: {
      Oggetto: 'Appendiabiti',
      Contesto: 'Concorso Design Wanted',
      Materiale: 'Acciaio',
      Colore: 'Nero / Rosso',
    },
  },
  {
    slug: 'dado-lamp',
    title: 'DADO LAMP',
    cat: 'Lampada da tavolo',
    year: '2026',
    photos: 6,
    drawing: true,
    backdrop: true,
    video: 'G5DdfSOzRIo',
    // Il reel apre il carosello, quindi qui i numeri slittano di uno rispetto
    // alle slide: 01 e 04 sono la seconda e la quinta cosa che si vede.
    ai: { modified: [1, 4], backdrop: 'modified' },
    plate: 12,
    desc: 'DADO LAMP è una lampada realizzata in stampa 3D che unisce funzionalità e linguaggio estetico contemporaneo. Il manico integrato diventa parte della forma e ne facilita il trasporto, mentre il cavo elettrico è trasformato in un elemento grafico visibile. La struttura scanalata contrasta con la sfera in vetro fumé, creando un equilibrio tra materia tecnica e leggerezza luminosa.',
    spec: {
      Oggetto: 'Lampada',
      Contesto: 'Progetto Personale',
      Materiale: 'PLA (stampa 3D)',
      Colore: 'Nero / Rosso',
    },
  },
  {
    slug: 'sedia-tempo-determinato',
    title: 'SEDIA A TEMPO DETERMINATO',
    cat: 'Scultura design',
    year: '2026',
    photos: 5,
    drawing: true,
    backdrop: true,
    ai: { generated: [1], backdrop: 'modified' },
    plate: 13,
    desc: 'Sedia a tempo determinato è un oggetto di design in cartone, materiale fragile e temporaneo che diventa metafora della precarietà lavorativa. La sedia, simbolo di stabilità, qui è instabile: un posto su cui nessuno si sentirebbe davvero al sicuro, come chi vive contratti a termine, stipendi insufficienti e futuro incerto. L’opera invita a riflettere sulla dignità del lavoro e sul diritto a un posto stabile dove poter restare.',
    spec: {
      Oggetto: 'Scultura design',
      Contesto: 'Concorso In Sicurezza · UIL Ravenna',
      Materiale: 'Cartone / Scotch',
      Colore: 'Marrone',
    },
  },
  {
    slug: 'orbit',
    title: 'ORBIT',
    cat: 'Servomuto · HIRO',
    year: '2026',
    photos: 6,
    drawing: true,
    backdrop: true,
    ai: { generated: 'all', backdrop: 'generated' },
    plate: 14,
    desc: 'ORBIT è un servomuto progettato per il concorso promosso da HIRO Design, sviluppato a partire dall’esplorazione della geometria circolare come principio generatore della forma. Il progetto riflette una ricerca personale sul rapporto tra geometria, struttura e processo produttivo applicato al design di arredi in metallo.',
    spec: {
      Oggetto: 'Servomuto',
      Contesto: 'Concorso HIRO Design · Concept design',
      Materiale: 'Acciaio',
      Colore: 'Arancione / Nero',
    },
  },
  {
    slug: 'fuori-asse',
    title: 'FUORI ASSE',
    cat: 'Sgabello · Legno',
    year: '2026',
    photos: 6,
    drawing: true,
    backdrop: true,
    ai: { generated: [1], modified: [2, 3, 4, 5, 6], backdrop: 'generated' },
    plate: 15,
    desc: 'Fuori asse è uno sgabello realizzato accostando tavole in legno recuperato, mantenute volutamente separate da una distanza funzionale di 30 mm. La fessura centrale diventa una presa integrata e, allo stesso tempo, il segno visibile dell’incontro tra elementi diversi: una condizione tipica del riuso trasformata in principio costruttivo e identitario.',
    spec: {
      Oggetto: 'Sgabello',
      Contesto: 'Concorso RiLegno · MasterWood · Concept design',
      Materiale: 'Legno recuperato',
      Colore: 'Legno chiaro',
    },
  },
  {
    slug: 'mari-chair',
    title: 'MARI CHAIR',
    cat: 'Seduta · Autoprogettazione',
    year: '2026',
    photos: 6,
    drawing: true,
    backdrop: true,
    video: 'JuKGsEUnmUM',
    plate: 16,
    desc: 'La sedia Autoprogettazione di Enzo Mari è reinterpretata attraverso un linguaggio tecnico e contemporaneo, ispirato all’estetica dei disegni CAD 3D. Le numerazioni identificano ogni componente e ne semplificano l’assemblaggio, rendendo visibile il processo costruttivo. Un omaggio al principio di Mari: un design accessibile, comprensibile e replicabile.',
    spec: {
      Oggetto: 'Sedia',
      Contesto: 'Progetto Personale · omaggio a Enzo Mari',
      Materiale: 'Legno di abete',
      Colore: 'Nero / Bianco',
    },
  },
  {
    slug: 'flue',
    title: 'FLUE',
    cat: 'Sistema di illuminazione',
    year: '2026',
    photos: 5,
    drawing: true,
    backdrop: true,
    ai: { generated: [1, 3, 5], modified: [2, 4], backdrop: 'generated' },
    plate: 17,
    desc: 'FLUE nasce dall’osservazione del cambio di diametro nelle linee di estrusione, una fase produttiva che genera elementi fuori standard destinati allo smaltimento. Attraverso un approccio di upcycling strutturale, il progetto valorizza questi scarti preservandone forma, dimensione e identità industriale. I diametri standard diventano così il principio generativo di una collezione modulare di sistemi di illuminazione.',
    spec: {
      Oggetto: 'Lampade · Sistema di illuminazione',
      Contesto: 'Tesi di Laurea · Accademia di Belle Arti di Bologna',
      Materiale: 'PVC / PLA',
      Colore: 'Arancione / Bianco / Nero',
    },
  },
  {
    slug: 'exit-tie',
    title: 'EXIT TIE',
    cat: 'Cravatta',
    year: '2026',
    photos: 1,
    drawing: true,
    backdrop: true,
    ai: { modified: [1], backdrop: 'generated' },
    plate: 18,
    desc: 'EXIT TIE è una cravatta realizzata in occasione della laurea, nata dalla reinterpretazione di un accessorio formale attraverso il linguaggio visivo della grafica industriale e della segnaletica stradale. La forma tradizionale resta, ma viene trasformata da pochi elementi essenziali: il nero, le scritte tecniche e soprattutto la freccia bianca rivolta verso il basso. La freccia diventa l’elemento comunicativo del progetto, un segnale di uscita inteso sia letteralmente sia come metafora della conclusione di un percorso: un oggetto ironico in cui design, comunicazione visiva e abbigliamento si incontrano, e una cravatta si trasforma in un segnale da indossare.',
    spec: {
      Oggetto: 'Cravatta',
      Contesto: 'Progetto Personale',
      Colore: 'Nero / Bianco',
    },
  },
  {
    slug: 'bloom',
    title: 'BLOOM',
    cat: 'Portafiori',
    year: '2026',
    photos: 8,
    video: 'VR8ZsS-mHAA',
    drawing: true,
    backdrop: true,
    plate: 19,
    desc: 'BLOOM è un concept di portafiori che nasce dall’idea di recuperare un elemento industriale esistente e trasformarlo in un oggetto d’uso quotidiano. Un mattone industriale a dieci fori viene reinterpretato attraverso un semplice accessorio a incastro, che lo rende un portafiori senza modificarne la struttura originale. L’intervento lascia visibile l’identità del mattone e ne valorizza la matericità e il carattere industriale: sul fronte una grafica ispirata alle ricerche sul Futurismo, recuperata da testi e pubblicazioni storiche, con il Fauno Giallo come elemento distintivo; nella parte inferiore una numerazione che richiama il linguaggio delle edizioni limitate e fa di ogni mattone recuperato un pezzo identificabile e da collezione.',
    spec: {
      Oggetto: 'Portafiori',
      Contesto: 'Concept design',
      Materiale: 'Laterizio',
      Colore: 'Terracotta / Nero',
    },
  },
  {
    slug: 'zeta-3',
    title: 'ZETA 3',
    cat: 'Postazione di lavoro',
    year: '2025',
    photos: 8,
    drawing: true,
    backdrop: true,
    film: 'gzLI2nMSQi4',
    ai: { backdrop: 'modified' },
    plate: 6,
    designer: 'Giovanni Sarchiolla, Sara Marchini, Elena Vecchi',
    desc: 'ZETA 3 è una postazione di lavoro sviluppata come progetto universitario e progettata per essere presentata al SaloneSatellite 2025 all’interno dello stand fieristico dell’Accademia di Belle Arti di Bologna. Il progetto nasce dalla volontà di creare un elemento compatto e versatile capace di integrare tre diverse funzioni in un unico oggetto: postazione per PC, seduta e contenitore per il materiale di lavoro. La struttura combina un linguaggio contemporaneo con elementi legati all’artigianato e alla lavorazione del materiale, valorizzando la costruzione dell’oggetto e la sua componente funzionale.',
    spec: {
      Oggetto: 'Postazione di lavoro',
      Contesto: 'Salone Satellite, Milano · prodotto da Meco / Mobilferro',
      Materiale: 'Legno / Acciaio',
      Colore: 'Legno / Nero',
    },
  },
  {
    slug: 'bullone',
    title: 'BULLONE',
    cat: 'Portapenne · Desk',
    year: '2025',
    photos: 6,
    drawing: true,
    backdrop: true,
    plate: 7,
    desc: 'Bullone è un portapenne ispirato alla forma iconica del bullone industriale, reinterpretato in chiave contemporanea per portare alla luce quegli oggetti nascosti ma essenziali che spesso passano inosservati. Molti oggetti funzionali restano dietro le quinte: Bullone vuole dare loro voce, trasformandoli in protagonisti dello spazio quotidiano.',
    spec: {
      Oggetto: 'Portapenne',
      Contesto: 'Progetto Personale',
      Materiale: 'PLA',
      Colore: 'Bianco / Blu / Rosso',
    },
  },
  {
    slug: 'trave',
    title: 'TRAVE DESIGN',
    cat: 'Gioielli · Fashion',
    year: '2025',
    photos: 4,
    drawing: true,
    backdrop: true,
    plate: 8,
    desc: 'TRAVE è un progetto di fashion design che reinterpreta l’elemento strutturale della trave trasformandolo in un gioiello da indossare. Il progetto prende forma in un orecchino pendente realizzato in argento 925, caratterizzato da una struttura essenziale e da un’incisione che diventa parte integrante del messaggio del gioiello. La trave rappresenta solidità, sostegno e costruzione: una metafora del percorso personale e della costruzione del proprio progetto di vita. L’incisione sulla superficie rende questa struttura un vero e proprio messaggio da portare con sé.',
    spec: {
      Oggetto: 'Orecchini',
      Contesto: 'Collaborazione QAIA Laboratorio',
      Materiale: 'Argento 925',
      Colore: 'Argento',
    },
  },
  {
    slug: 'zero-sfrido',
    title: 'ZERO SFRIDO',
    cat: 'Seduta · Eco design',
    year: '2025',
    photos: 3,
    drawing: true,
    backdrop: true,
    ai: { generated: [1, 2], backdrop: 'generated' },
    plate: 9,
    desc: 'Un complemento d’arredo risultato di un processo di riduzione ed essenzialità, ispirato al linguaggio dell’architettura. Conta l’idea che la struttura non sia nascosta ma diventi espressione, che il materiale possa raccontarsi attraverso la sua logica costruttiva.',
    spec: {
      Oggetto: 'Seduta',
      Contesto: 'Progetto Universitario · Eco design · Concept design',
      Materiale: 'Legno di okumè',
      Colore: 'Okumè',
    },
  },
  {
    slug: 'stanza-nella-stanza',
    title: 'STANZA NELLA STANZA',
    cat: 'Architettura · Interior',
    year: '2025',
    photos: 6,
    drawing: true,
    backdrop: true,
    ai: { backdrop: 'generated' },
    plate: 10,
    designer: 'Giovanni Sarchiolla, Giacomo Codeluppi',
    desc: 'Il progetto si basa sull’idea che lo spazio nasca da un’esperienza abitativa più che da un singolo oggetto. Il fulcro della composizione è la zona bagno, trasformata in un’area di relax con una piscina incassata e una doccia a cascata dal soffitto: aperta e luminosa grazie all’assenza di barriere e a una vetrata a privacy controllata.',
    spec: {
      Oggetto: 'Architettura / Interior',
      Contesto: 'Progetto Universitario · Concept design',
      Materiale: 'Cemento / Legno',
    },
  },
  {
    slug: 'dog-lamp',
    title: 'DOG LAMP',
    cat: 'Lampada da terra',
    year: '2024',
    photos: 5,
    drawing: true,
    backdrop: true,
    film: 'vElQ6tz9LtU',
    plate: 1,
    desc: 'DOG LAMP è una lampada pensata per il mondo dell’infanzia, progettata per unire funzionalità, semplicità costruttiva e un linguaggio giocoso. Il progetto è stato sviluppato per essere realizzato attraverso la stampa 3D, utilizzando un sistema di componenti ad incastro che permette di assemblare la lampada senza l’utilizzo di colle o sistemi di fissaggio complessi. La forma ispirata a un cane trasforma la lampada in un piccolo elemento domestico capace di entrare in relazione con il bambino, rendendo la luce parte dell’esperienza quotidiana. DOG LAMP nasce dall’incontro tra progettazione digitale, fabbricazione additiva e design per l’infanzia.',
    spec: {
      Oggetto: 'Lampada per bambini',
      Contesto: 'Progetto Universitario',
      Materiale: 'PLA',
      Colore: 'Bianco',
    },
  },
  {
    slug: 'anelli',
    title: 'ANELLI',
    cat: 'Portariviste',
    year: '2024',
    photos: 5,
    drawing: true,
    backdrop: true,
    ai: { generated: 'all', backdrop: 'generated' },
    plate: 2,
    desc: 'ANELLI è un concept di design sviluppato durante il percorso universitario, nato dalla reinterpretazione del portariviste attraverso un’estetica pop e un sistema dinamico. Il progetto è composto da una serie di anelli rotanti che permettono di orientare le singole sezioni del portariviste e di accedere alle riviste da più direzioni.',
    spec: {
      Oggetto: 'Portariviste',
      Contesto: 'Progetto Universitario · Concept design',
      Materiale: 'PLA',
      Colore: 'Nero',
    },
  },
  {
    slug: 'pistone',
    title: 'PISTONE',
    cat: 'Coprivaso',
    year: '2024',
    photos: 4,
    drawing: true,
    backdrop: true,
    ai: { generated: 'all', backdrop: 'generated' },
    plate: 3,
    desc: 'Pistone è un coprivaso in plastica realizzato tramite stampaggio a iniezione, progettato per unire funzionalità e carattere estetico. Il design prende ispirazione dalla forma dei pistoni dei motori, reinterpretata in chiave morbida e contemporanea per adattarsi agli ambienti domestici.',
    spec: {
      Oggetto: 'Coprivaso',
      Contesto: 'Progetto Universitario · Concept design',
      Materiale: 'PLA',
      Colore: 'Blu / Grigio',
    },
  },
  {
    slug: 'food',
    title: 'LUNCH BOX',
    cat: 'Portapranzo',
    year: '2024',
    photos: 4,
    drawing: true,
    backdrop: true,
    plate: 4,
    desc: 'LUNCH BOX è un concept di design sviluppato durante il percorso universitario, nato dalla volontà di semplificare e rendere più funzionale la pausa pranzo in qualsiasi situazione. Il progetto ripensa la classica lunch box attraverso un sistema pensato per organizzare e trasportare il pasto in modo semplice, pratico e intuitivo, adattandosi alle diverse esigenze della quotidianità. L’obiettivo è progettare un oggetto capace di accompagnare l’utente fuori casa, al lavoro, all’università o durante gli spostamenti, rendendo più immediata la gestione del momento del pranzo.',
    spec: {
      Oggetto: 'Lunch box',
      Contesto: 'Progetto Universitario · Concept design',
      Materiale: 'PLA',
      Colore: 'Grigio / Bianco',
    },
  },
  {
    slug: 'nymphe',
    title: 'NYMPHĒ',
    cat: 'Packaging · Davines',
    year: '2024',
    photos: 4,
    drawing: true,
    backdrop: true,
    ai: { generated: 'all', backdrop: 'generated' },
    plate: 5,
    desc: 'Nymphē è un progetto di packaging e identità visiva sviluppato per Davines, ispirato al mondo mitologico delle ninfe e al loro legame con la natura. Le silhouette delle boccette prendono ispirazione dai flaconi delle essenze chimiche, reinterpretati in chiave elegante per evocare l’idea di formule naturali e ingredienti puri.',
    spec: {
      Oggetto: 'Packaging · Prodotti per capelli',
      Contesto: 'Contest Universitario · Lavoro di gruppo · Concept design',
      Materiale: 'PLA (prototipo)',
      Colore: 'Nero / Trasparente',
    },
  },
  {
    slug: 'rilegno',
    title: 'IL VALORE DEL LEGNO',
    cat: 'Illustrazione',
    area: 'graphic',
    year: '2026',
    photos: 4,
    plate: 7,
    desc: 'Una sedia in equilibrio su una catasta di scarti: il legno che torna materia e poi di nuovo oggetto. Illustrazione di copertina per Walden, la rivista di Rilegno dedicata all’economia circolare.',
    spec: {
      Oggetto: 'Illustrazione · Copertina',
      Contesto: 'Walden · rivista di Rilegno',
    },
  },
  {
    slug: 'direzione-tolleranza',
    title: 'DIREZIONE TOLLERANZA',
    cat: 'Manifesto',
    area: 'graphic',
    year: '2025',
    photos: 2,
    plate: 6,
    desc: 'Frecce e segnaletica urbana: ogni elemento mantiene la propria direzione ma convive in un unico sistema. La parola TOLLERANZA contiene le differenze.',
    spec: {
      Oggetto: 'Manifesto',
      Contesto: 'Concorso · Friuli-Venezia Giulia',
    },
  },
  {
    slug: 'il-fauno',
    title: 'IL FAUNO',
    cat: 'Mascotte',
    area: 'graphic',
    year: '2025',
    photos: 3,
    plate: 5,
    desc: 'Omaggio a Fortunato Depero, maestro del Futurismo, reinterpretato in chiave contemporanea con linee nette e forme geometriche.',
    spec: {
      Oggetto: 'Mascotte · Identità visiva',
      Contesto: 'Concorso · Emilia-Romagna',
    },
  },
  {
    slug: 'europa-unisce',
    title: 'UN’EUROPA CHE UNISCE',
    cat: 'Manifesto',
    area: 'graphic',
    year: '2025',
    photos: 4,
    plate: 4,
    desc: 'Un pacco da spedizione che ruota attorno a un mondo stilizzato: metafora di un’Europa in movimento che unisce persone, culture e valori.',
    spec: {
      Oggetto: 'Manifesto',
      Contesto: 'Concorso · Emilia-Romagna',
      Esito: 'Vincitore · 3° posto',
    },
  },
  {
    slug: 'citta-parla',
    title: 'LA CITTÀ PARLA E TU?',
    cat: 'Manifesto',
    area: 'graphic',
    year: '2025',
    photos: 3,
    plate: 3,
    desc: 'Due sedie vuote e un giallo acceso per richiamare il dialogo che manca e invitare i giovani a fermarsi, incontrarsi e tornare a parlare.',
    spec: {
      Oggetto: 'Manifesto',
      Contesto: 'IGPDecaux Graphic Award, Milano',
    },
  },
  {
    slug: 'in-the-box',
    title: 'IN THE BOX',
    cat: 'Manifesto',
    area: 'graphic',
    year: '2025',
    photos: 4,
    plate: 2,
    desc: 'Una riflessione sulla condizione abitativa del futuro: la città racchiusa in uno scatolone, simbolo di spazi sempre più piccoli e temporanei.',
    spec: {
      Oggetto: 'Manifesto',
      Contesto: 'Sketch your Deck · Bonobolabo, Bologna',
    },
  },
  {
    slug: 'fiori',
    title: 'POSSIAMO ANCORA FAR CRESCERE I FIORI',
    cat: 'Manifesto',
    area: 'graphic',
    year: '2024',
    photos: 3,
    plate: 1,
    desc: 'Un invito a credere nella rinascita anche nei momenti più oscuri: i fiori come simboli fragili ma ostinati di vita, contro l’ombra della guerra.',
    spec: {
      Oggetto: 'Manifesto',
      Contesto: 'Concorso · Emilia-Romagna',
      Esito: '4° posto',
    },
  },
]

/* `year` è testo libero: può essere un intervallo o mancare. */
export function yearsOf(item) {
  return (String(item?.year || '').match(/\d{4}/g) || []).map(Number)
}

const latestYear = (item) => Math.max(0, ...yearsOf(item))

// Dal più recente: anno, poi `plate` decrescente (dentro l'anno la data precisa non c'è).
export const archive = [...projects].sort(
  (a, b) => latestYear(b) - latestYear(a) || (b.plate ?? 0) - (a.plate ?? 0),
)

export function countProjects(n, lang) {
  return texts(lang).archive.count(n)
}

export function periodOf(items) {
  const years = items.flatMap(yearsOf)
  return years.length ? { first: Math.min(...years), last: Math.max(...years) } : null
}

export const archivePeriod = periodOf(archive)

// Le aree dell'archivio. Un progetto senza `area` è product design.
export const DEFAULT_AREA = 'product'

export function areaOf(item) {
  return item?.area || DEFAULT_AREA
}

export const areas = [
  {
    slug: 'product-design',
    key: 'product',
    label: 'Product design',
    desc: 'Oggetti di arredo, bigiotteria, illuminazione e packaging.',
  },
  {
    slug: 'graphic-design',
    key: 'graphic',
    label: 'Graphic design',
    desc: 'Manifesti, mascotte e identità visive per concorsi e bandi.',
  },
]

export function areaBySlug(slug) {
  return areas.find((a) => a.slug === slug) || null
}

// `drawing` e `backdrop` sono null se il file non c'è; `cover` manca con `noPhotos`.
export function projectImages(item) {
  const base = `/images/products/${item.slug}`
  const gallery = Array.from(
    { length: item.photos },
    (_, i) => `${base}/${String(i + 1).padStart(2, '0')}.webp`,
  )
  return {
    cover: item.noPhotos ? null : `${base}/cover.webp`,
    gallery,
    drawing: item.drawing ? `${base}/drawing.webp` : null,
    backdrop: item.backdrop ? `${base}/backdrop.webp` : null,
    videoPoster: item.video ? `${base}/video.webp` : null,
    filmPoster: item.film ? `${base}/film.webp` : null,
  }
}

// Forma leggibile dei titoli (maiuscolo solo all'iniziale) per alt, <title> e dati strutturati.
export function readableTitle(title) {
  const t = title.toLocaleLowerCase('it')
  return t.charAt(0).toLocaleUpperCase('it') + t.slice(1)
}

// Testi alternativi, condivisi fra pagine e sitemap immagini.
export function altCover(item, lang) {
  return texts(lang).alt.cover(readableTitle(item.title), item.cat, profile.name)
}

export function altGallery(item, i, total, lang) {
  return texts(lang).alt.gallery(readableTitle(item.title), item.cat, i + 1, total)
}

export function altDrawing(item, lang) {
  return texts(lang).alt.drawing(readableTitle(item.title), item.cat)
}

export function altBackdrop(item, lang) {
  return texts(lang).alt.backdrop(readableTitle(item.title))
}

export function altVideo(item, lang) {
  return texts(lang).alt.video(readableTitle(item.title))
}

/*
 * Etichette AI Act (art. 50). `ai: { generated, modified, backdrop }`: numeri delle foto di
 * galleria o 'all'; `backdrop` 'generated'|'modified'. Ciò che non è elencato è una foto vera.
 */
const marked = (list, n) => list === 'all' || (Array.isArray(list) && list.includes(n))

/* `n` è il numero della foto di galleria, da 1: 1 = 01.webp. */
export function aiPhoto(item, n) {
  if (!item?.ai) return null
  if (marked(item.ai.generated, n)) return 'generated'
  if (marked(item.ai.modified, n)) return 'modified'
  return null
}

// Solo gli slug (uno sbagliato rompe la build). Le anteprime sono in /images/home/selected/<slug>.webp.
const focusSlugs = ['flue', 'orbit', 'directional-arrow', 'dado-lamp', 'dog-lamp']

export const focusItems = focusSlugs.map((slug) => {
  const item = projects.find((p) => p.slug === slug)
  if (!item) throw new Error(`focusItems: nessun progetto con slug "${slug}" nell'archivio`)
  const { title, cat, year } = item
  return { slug, title, cat, year, cover: `/images/home/selected/${slug}.webp` }
})

// Accessori per lingua: calcolati una volta, così React riceve sempre lo stesso oggetto.
const english = (lang) => lang === 'en'

// `spec` si sostituisce in blocco: le sue chiavi cambiano lingua, fonderle darebbe righe doppie.
function englishProject(item) {
  const en = projectsEn[item.slug]
  return en ? { ...item, ...en } : item
}

const archiveEn = archive.map(englishProject)

export function archiveIn(lang) {
  return english(lang) ? archiveEn : archive
}

const areasEnList = areas.map((a) => ({ ...a, ...(areasEn[a.slug] || {}) }))

export function areasIn(lang) {
  return english(lang) ? areasEnList : areas
}

export function areaBySlugIn(slug, lang) {
  return areasIn(lang).find((a) => a.slug === slug) || null
}

export function areaProjectsIn(key, lang) {
  return archiveIn(lang).filter((p) => areaOf(p) === key)
}

const focusItemsEn = focusItems.map((f) => {
  const en = projectsEn[f.slug]
  return en ? { ...f, cat: en.cat } : f
})

export function focusItemsIn(lang) {
  return english(lang) ? focusItemsEn : focusItems
}

const profileEnFull = { ...profile, ...profileEn }

export function profileIn(lang) {
  return english(lang) ? profileEnFull : profile
}

const aboutEnFull = {
  ...about,
  intro: aboutEn.intro,
  description: aboutEn.description,
  // Per `key`, non per posizione: senza gemella la card resta in italiano.
  skillCards: about.skillCards.map((c) => {
    const en = aboutEn.skillCards.find((v) => v.key === c.key)
    return en
      ? { ...c, title: en.title, text: en.text, photos: c.photos && { ...c.photos, alt: en.alt } }
      : c
  }),
  photos: {
    hero: { ...about.photos.hero, alt: aboutEn.photos.hero },
    sketches: { ...about.photos.sketches, alt: aboutEn.photos.sketches },
  },
  sketchbook: about.sketchbook.map((plate, i) => ({
    front: plate.front ? { ...plate.front, alt: aboutEn.sketchbook[i]?.front } : null,
    back: plate.back ? { ...plate.back, alt: aboutEn.sketchbook[i]?.back } : null,
  })),
}

export function aboutIn(lang) {
  return english(lang) ? aboutEnFull : about
}

const manifestoPhotoEnFull = { ...manifestoPhoto, ...manifestoPhotoEn }

export function manifestoPhotoIn(lang) {
  return english(lang) ? manifestoPhotoEnFull : manifestoPhoto
}
