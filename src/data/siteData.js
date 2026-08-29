/*
 * Contenuti del sito - fonte di verità unica: testi e dati stanno qui, non nel
 * markup. Le immagini di ogni progetto vivono in public/images/products/<slug>/
 * (cover.webp + 01.webp…NN.webp); i percorsi li costruisce `projectImages()`.
 */

export const profile = {
  name: 'Giovanni Sarchiolla',
  displayName: 'Joe Sarchiolla', // nome "d'arte" mostrato nel sito (home, chi sono)
  nick: 'Joe',
  role: 'Product Designer',
  place: 'Reggio Emilia, Italia',
  formazione: 'Accademia di Belle Arti, Bologna',
  handle: 'joesarchiolla.design',
  instagram: 'https://instagram.com/joesarchiolla.design',
  youtube: 'https://www.youtube.com/@design.by.joesarchiolla',
  tiktok: 'https://www.tiktok.com/@design.by.joesarchiolla',
  linkedin: 'https://www.linkedin.com/in/giovanni-sarchiolla-a80659232/',
  email: 'joe.artedesign@gmail.com',
  // Apre la compose di Gmail (web) invece dell'app di posta predefinita del sistema.
  emailHref: 'https://mail.google.com/mail/?view=cm&fs=1&to=joe.artedesign@gmail.com',
  manifesto:
    'L’ispirazione arriva dall’arte, dalla moda e dalla grafica, e da lì prende forma il prodotto. La ricerca è sempre quella della forma che non ha bisogno di parole.',
}

/* Decorativo, quindi `alt` vuoto: la sfocatura la mette il CSS. */
export const homeHero = {
  src: '/images/home/joe-hero.webp',
  alt: '',
  width: 1080,
  height: 1351,
}

export const familyBand = {
  src: '/images/home/family-band.webp',
  alt: 'La famiglia di prodotti',
}

export const about = {
  intro:
    'Product designer di Reggio Emilia. Oggetti che uniscono estetica, funzione e dimensione emotiva, con attenzione alla produzione e al rapporto tra forma e utente.',
  experience: [
    { anno: '2020–2021', titolo: 'Arredatore', luogo: 'Emilia Casa SRL' },
    { anno: '2021–2022', titolo: 'Arredatore', luogo: 'Casa Midì' },
    { anno: '2025', titolo: 'Partecipazione Salone Satellite', luogo: 'Milano' },
    { anno: '2025–2026', titolo: 'Concorsi Grafica & Product Design', luogo: '' },
  ],
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
  education: [
    { anno: '2021', titolo: 'Istituto Superiore G. Chierici', luogo: 'Reggio Emilia' },
    { anno: '2026', titolo: 'Accademia di Belle Arti di Bologna', luogo: 'ABABO' },
  ],
  photos: {
    hero: { src: '/images/about/joe-cutout.webp', alt: 'Ritratto di Joe Sarchiolla a braccia conserte' },
    lab: { src: '/images/about/joe-lab.webp', alt: 'La lampada DADO accesa, tenuta in mano' },
  },
  /*
   * Pagine dello sketchbook personale (da "ARCHIVE JOE SARCHIOLLA.pdf", vedi
   * scripts/sketchbook-pages.js), mostrato come libro sfogliabile in 3D sotto
   * la fascia "lab". Ogni voce è una pagina fisica con fronte e retro (le
   * tavole 01-08 sono accoppiate due a due, così come stanno nel PDF
   * originale, es. indice/griglia miniature); la 09 chiude lo sketchbook da
   * sola, col retro bianco. Stessa proporzione per tutte le tavole
   * (1000×1415, ~A4).
   */
  sketchbook: [
    {
      front: { src: '/images/about/sketchbook/01.webp', alt: 'Copertina dello sketchbook personale di Joe Sarchiolla' },
      back: { src: '/images/about/sketchbook/02.webp', alt: 'Frontespizio “Vol.1 Archivio”' },
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
      front: { src: '/images/about/sketchbook/09.webp', alt: 'Scultura “Sedia a tempo determinato”, contest In-sicurezza' },
      back: null,
    },
  ],
}

/*
 * Archivio: tutti i progetti. `photos` = numero di foto galleria (NN.webp);
 * `disegno: true` = esiste disegno.webp (da `scripts/pdf-disegno.js`).
 * `sfondo: true` = esiste sfondo.webp, immagine di sfondo mostrata in fondo
 * alla scheda progetto (sopra la navigazione prev/next).
 * `area` = area dell'archivio ('product' o 'graphic'); assente = 'product'.
 * `senzaFoto: true` = scheda pubblicata prima che le immagini arrivino.
 * `tavola` = numero della tavola nell'archivio sorgente (cartella "COPERTINE
 * - dettaglio archivio"); mostrato in hover sulle celle di /archivio.
 * `cat` e `year` sono stime da confermare; l'anno incerto è omesso.
 * L'ordine in cui sono scritti qui non conta: quello vero lo applica
 * `archive`, per numero di tavola decrescente.
 */
const progetti = [

  {
    slug: 'directional-arrow',
    title: 'DIRECTIONAL ARROW',
    cat: 'Appendiabiti',
    year: '2026',
    photos: 5,
    disegno: true,
    sfondo: true,
    tavola: 11,
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
    disegno: true,
    sfondo: true,
    tavola: 12,
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
    disegno: true,
    sfondo: true,
    tavola: 13,
    desc: '“Sedia a tempo determinato” è un oggetto di design in cartone, materiale fragile e temporaneo che diventa metafora della precarietà lavorativa. La sedia, simbolo di stabilità, qui è instabile: un posto su cui nessuno si sentirebbe davvero al sicuro, come chi vive contratti a termine, stipendi insufficienti e futuro incerto. L’opera invita a riflettere sulla dignità del lavoro e sul diritto a un posto stabile dove poter restare.',
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
    disegno: true,
    sfondo: true,
    tavola: 14,
    desc: 'ORBIT è un servomuto progettato per il concorso promosso da HIRO Design, sviluppato a partire dall’esplorazione della geometria circolare come principio generatore della forma. Il progetto riflette una ricerca personale sul rapporto tra geometria, struttura e processo produttivo applicato al design di arredi in metallo.',
    spec: {
      Oggetto: 'Servomuto',
      Contesto: 'Concorso HIRO Design',
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
    disegno: true,
    sfondo: true,
    tavola: 15,
    desc: 'Fuori asse è uno sgabello realizzato accostando tavole in legno recuperato, mantenute volutamente separate da una distanza funzionale di 30 mm. La fessura centrale diventa una presa integrata e, allo stesso tempo, il segno visibile dell’incontro tra elementi diversi: una condizione tipica del riuso trasformata in principio costruttivo e identitario.',
    spec: {
      Oggetto: 'Sgabello',
      Contesto: 'Concorso RiLegno · MasterWood',
      Materiale: 'Legno recuperato',
      Colore: 'Legno chiaro',
    },
  },
  {
    slug: 'mari-chair',
    title: 'MARI CHAIR',
    cat: 'Seduta · Autoprogettazione',
    year: '2026',
    photos: 4,
    disegno: true,
    sfondo: true,
    tavola: 16,
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
    photos: 13,
    disegno: true,
    sfondo: true,
    tavola: 17,
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
    disegno: true,
    tavola: 18,
    desc: '',
    spec: {
      Oggetto: 'Cravatta',
      Colore: 'Nero / Bianco',
    },
  },
  {
    slug: 'bloom',
    title: 'BLOOM',
    cat: 'Portafiori',
    year: '2026',
    photos: 7,
    tavola: 19,
    desc: '',
    spec: {
      Oggetto: 'Portafiori',
      Materiale: 'Laterizio',
      Colore: 'Terracotta / Nero',
    },
  },
  {
    slug: 'zeta-3',
    title: 'ZETA 3',
    cat: 'Postazione di lavoro',
    year: '2025',
    photos: 9,
    disegno: true,
    sfondo: true,
    tavola: 6,
    desc: 'ZetaTre è una workstation compatta progettata per rispondere alle esigenze degli artigiani che lavorano in spazi ridotti. Integra tre funzioni principali: postazione per computer, seduta e contenitore per strumenti, in un unico elemento realizzato in legno.',
    spec: {
      Oggetto: 'Postazione di lavoro',
      Contesto: 'Salone Satellite Milano · Meco / Mobilferro',
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
    disegno: true,
    sfondo: true,
    tavola: 7,
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
    disegno: true,
    sfondo: true,
    tavola: 8,
    desc: 'Pendente unisex in argento disegnato per QAIA. Un orecchino pendente a forma di trave, simbolo di solidità e costruzione. La parola “Structure” incisa diventa un messaggio dedicato a chi sta progettando il proprio futuro, costruendo fondamenta solide fatte di studio, creatività e collaborazione.',
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
    photos: 2,
    disegno: true,
    sfondo: true,
    tavola: 9,
    desc: 'Un complemento d’arredo risultato di un processo di riduzione ed essenzialità, ispirato al linguaggio dell’architettura. Conta l’idea che la struttura non sia nascosta ma diventi espressione, che il materiale possa raccontarsi attraverso la sua logica costruttiva.',
    spec: {
      Oggetto: 'Seduta',
      Contesto: 'Progetto Universitario · Eco design',
      Materiale: 'Legno di okumè',
      Colore: 'Okumè',
    },
  },
  {
    slug: 'stanza-nella-stanza',
    title: 'STANZA NELLA STANZA',
    cat: 'Architettura · Interior',
    year: '2025',
    photos: 3,
    disegno: true,
    sfondo: true,
    tavola: 10,
    desc: 'Il progetto si basa sull’idea che lo spazio nasca da un’esperienza abitativa più che da un singolo oggetto. Il fulcro della composizione è la zona bagno, trasformata in un’area di relax con una piscina incassata e una doccia a cascata dal soffitto: aperta e luminosa grazie all’assenza di barriere e a una vetrata a privacy controllata.',
    spec: {
      Oggetto: 'Architettura / Interior',
      Contesto: 'Progetto Universitario',
      Materiale: 'Cemento / Legno',
    },
  },
  {
    slug: 'dog-lamp',
    title: 'DOG LAMP',
    cat: 'Lampada da terra',
    year: '2024',
    photos: 5,
    disegno: true,
    sfondo: true,
    tavola: 1,
    desc: 'La Dog Lamp è pensata per essere molto più di una semplice fonte di luce: un vero e proprio compagno a quattro zampe capace di portare allegria e comfort nelle camere dei bambini. Ispirata all’idea di un animale domestico che non tutti i bambini possono avere, ha una forma morbida e pop che mescola gioco ed eleganza.',
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
    disegno: true,
    sfondo: true,
    tavola: 2,
    desc: '“Anelli” è un portariviste ispirato all’estetica pop degli anni ’60 e ’70, reinterpretata in chiave contemporanea. La struttura è composta da tre anelli allungati sovrapposti che creano una forma morbida e dinamica, pensata per contenere riviste di diverse dimensioni mantenendole ordinate e facilmente accessibili.',
    spec: {
      Oggetto: 'Portariviste',
      Contesto: 'Progetto Universitario',
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
    disegno: true,
    sfondo: true,
    tavola: 3,
    desc: 'Pistone è un coprivaso in plastica realizzato tramite stampaggio a iniezione, progettato per unire funzionalità e carattere estetico. Il design prende ispirazione dalla forma dei pistoni dei motori, reinterpretata in chiave morbida e contemporanea per adattarsi agli ambienti domestici.',
    spec: {
      Oggetto: 'Coprivaso',
      Contesto: 'Progetto Universitario',
      Materiale: 'PLA',
      Colore: 'Blu / Grigio',
    },
  },
  {
    slug: 'food',
    title: 'FOOD',
    cat: 'Lunch box',
    year: '2024',
    photos: 4,
    disegno: true,
    sfondo: true,
    tavola: 4,
    desc: 'Questa lunch box è progettata non solo come contenitore per il cibo, ma come un oggetto pratico e affidabile per accompagnare la vita quotidiana. Il design morbido ed elegante la rende facile da portare in borse e zaini, mentre la sua versatilità la rende perfetta anche per chi pranza velocemente o in piedi.',
    spec: {
      Oggetto: 'Lunch box',
      Contesto: 'Progetto Universitario',
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
    disegno: true,
    sfondo: true,
    tavola: 5,
    desc: 'Nymphē è un progetto di packaging e identità visiva sviluppato per Davines, ispirato al mondo mitologico delle ninfe e al loro legame con la natura. Le silhouette delle boccette prendono ispirazione dai flaconi delle essenze chimiche, reinterpretati in chiave elegante per evocare l’idea di formule naturali e ingredienti puri.',
    spec: {
      Oggetto: 'Packaging · Prodotti per capelli',
      Contesto: 'Contest Universitario',
      Materiale: 'PLA (prototipo)',
      Colore: 'Nero / Trasparente',
    },
  },
  {
    slug: 'direzione-tolleranza',
    title: 'DIREZIONE TOLLERANZA',
    cat: 'Manifesto',
    area: 'graphic',
    year: '2026',
    photos: 0,
    senzaFoto: true,
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
    photos: 1,
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
    photos: 1,
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
    photos: 1,
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
    photos: 0,
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
    photos: 1,
    desc: 'Un invito a credere nella rinascita anche nei momenti più oscuri: i fiori come simboli fragili ma ostinati di vita, contro l’ombra della guerra.',
    spec: {
      Oggetto: 'Manifesto',
      Contesto: 'Concorso · Emilia-Romagna',
      Esito: '4° posto',
    },
  },
]

/* `year` è testo libero: può essere un intervallo o mancare. */
export function anniDi(item) {
  return (String(item?.year || '').match(/\d{4}/g) || []).map(Number)
}

const annoRecente = (item) => Math.max(0, ...anniDi(item))

/*
 * Ordine cronologico rovesciato: prima l'ultimo progetto, in fondo il primo.
 *
 * Prima l'anno, poi il numero di `tavola` decrescente. La tavola serve perché
 * dentro l'anno la data precisa non c'è, e la numerazione dell'archivio
 * sorgente è l'unico dato che la conserva (1–5 sono del 2024, 6–10 del 2025,
 * 11–19 del 2026). I progetti grafici non hanno tavola: a parità d'anno vale
 * l'ordine in cui stanno scritti qui sopra, perché `sort` è stabile.
 */
export const archive = [...progetti].sort(
  (a, b) => annoRecente(b) - annoRecente(a) || (b.tavola ?? 0) - (a.tavola ?? 0),
)

/* "1 progetto" / "19 progetti": il singolare capita, e "1 progetti" no. */
export function contaProgetti(n) {
  return `${n} ${n === 1 ? 'progetto' : 'progetti'}`
}

/* Il periodo coperto da un gruppo di progetti, o null se nessuno ha un anno. */
export function periodoDi(lista) {
  const anni = lista.flatMap(anniDi)
  return anni.length ? { primo: Math.min(...anni), ultimo: Math.max(...anni) } : null
}

export const periodoArchivio = periodoDi(archive)

/*
 * L'archivio si apre su due aree: /archivio le presenta, e ognuna ha la sua
 * pagina (/archivio/product-design, /archivio/graphic-design) con la stessa
 * griglia di prima, ristretta ai suoi progetti.
 *
 * L'area sta sul progetto, nel campo `area`. Chi non la dichiara è product
 * design: è la regola, e ripeterla su ogni voce sarebbe solo rumore.
 */
export const AREA_PREDEFINITA = 'product'

export function areaDi(item) {
  return item?.area || AREA_PREDEFINITA
}

export const aree = [
  {
    slug: 'product-design',
    chiave: 'product',
    label: 'Product design',
    desc: 'Oggetti di arredo, bigiotteria, illuminazione e packaging.',
  },
  {
    slug: 'graphic-design',
    chiave: 'graphic',
    label: 'Graphic design',
    desc: 'Manifesti, mascotte e identità visive per concorsi e bandi.',
  },
]

export function areaPerSlug(slug) {
  return aree.find((a) => a.slug === slug) || null
}

/* Ordinati come `archive`: dal più recente. */
export function progettiArea(chiave) {
  return archive.filter((p) => areaDi(p) === chiave)
}

/*
 * `drawing` e `sfondo` sono `null` dove il file non c'è: la scheda salta il
 * blocco. Anche `cover` può mancare: `senzaFoto` marca i progetti pubblicati
 * prima che le immagini arrivino, e chi la usa mostra un riquadro in attesa
 * invece di un'immagine rotta.
 */
export function projectImages(item) {
  const base = `/images/products/${item.slug}`
  const gallery = Array.from(
    { length: item.photos },
    (_, i) => `${base}/${String(i + 1).padStart(2, '0')}.webp`,
  )
  return {
    cover: item.senzaFoto ? null : `${base}/cover.webp`,
    gallery,
    drawing: item.disegno ? `${base}/disegno.webp` : null,
    sfondo: item.sfondo ? `${base}/sfondo.webp` : null,
  }
}

/*
 * I titoli sono scritti in maiuscolo e il CSS li mostra così; fuori dal markup
 * (alt, `<title>`, dati strutturati) serve la forma leggibile. Maiuscola solo
 * all'iniziale, come l'italiano vuole: il Title Case inglese darebbe "Sedia A
 * Tempo Determinato". Per rimettere il maiuscolo pieno ovunque basta far
 * restituire `titolo` da qui.
 */
export function titoloLeggibile(titolo) {
  const t = titolo.toLocaleLowerCase('it')
  return t.charAt(0).toLocaleUpperCase('it') + t.slice(1)
}

/*
 * Testi alternativi delle immagini di prodotto. Stanno qui perché li usano sia
 * le pagine sia la sitemap immagini: una foto si descrive in un posto solo.
 *
 * Dicono oggetto e categoria invece del solo titolo. Descrizioni per singola
 * foto non ce ne sono, e inventarle sarebbe peggio del generico: la posizione
 * nella serie è quanto si può dire di vero.
 */
export function altCopertina(item) {
  return `${titoloLeggibile(item.title)}, ${item.cat} — progetto di ${profile.name}`
}

export function altGalleria(item, i, totale) {
  return `${titoloLeggibile(item.title)}, ${item.cat} — immagine ${i + 1} di ${totale}`
}

export function altDisegno(item) {
  return `Disegno tecnico quotato di ${titoloLeggibile(item.title)}, ${item.cat}`
}

export function altSfondo(item) {
  return `${titoloLeggibile(item.title)} — ambientazione`
}

/*
 * Solo gli slug: il resto viene dall'archivio, così non si duplica niente e uno
 * slug errato rompe la build. L'ordine qui è la numerazione 01–05 mostrata.
 */
const focusSlugs = ['flue', 'orbit', 'directional-arrow', 'dado-lamp', 'dog-lamp']

export const focusItems = focusSlugs.map((slug) => {
  const item = progetti.find((p) => p.slug === slug)
  if (!item) throw new Error(`focusItems: nessun progetto con slug "${slug}" nell'archivio`)
  const { title, cat, year } = item
  return { slug, title, cat, year, cover: projectImages(item).cover }
})
