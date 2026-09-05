/*
 * Versione inglese dei contenuti. `siteData.js` resta la fonte di verità: qui
 * ci sono solo i campi che cambiano lingua, agganciati per slug o per chiave.
 * Tutto il resto (immagini, anni, numero di foto, aree, ordine) viene da lì.
 *
 * I titoli dei progetti NON si traducono: sono i nomi delle opere, e “Sedia a
 * tempo determinato” su una scheda inglese resta quello che l'autore ha
 * chiamato così. Cambiano categoria, descrizione e voci della tabella.
 *
 * Registro: impersonale come in italiano — niente “I designed”, forme passive
 * o nominali.
 */

export const profileEn = {
  role: 'Product Designer',
  place: 'Reggio Emilia, Italy',
  formazione: 'Academy of Fine Arts, Bologna',
  manifesto:
    'Inspiration comes from art, fashion and graphics, and from there the product takes shape. The search is always for the form that needs no words.',
  sintesi:
    'Lamps, seating and everyday objects: forms that bring together aesthetics, function and an emotional dimension.',
}

export const aboutEn = {
  intro:
    'Product designer from Reggio Emilia. Objects that bring together aesthetics, function and an emotional dimension, with attention to production and to the relationship between form and user.',
  experience: [
    { anno: '2020–2021', titolo: 'Furniture consultant', luogo: 'Emilia Casa SRL' },
    { anno: '2021–2022', titolo: 'Furniture consultant', luogo: 'Casa Midì' },
    { anno: '2025', titolo: 'Exhibitor at Salone Satellite', luogo: 'Milan' },
    { anno: '2025–2026', titolo: 'Graphic & product design competitions', luogo: '' },
  ],
  education: [
    { anno: '2021', titolo: 'Istituto Superiore G. Chierici', luogo: 'Reggio Emilia' },
    { anno: '2026', titolo: 'Bologna Academy of Fine Arts', luogo: 'ABABO' },
  ],
  photos: {
    hero: 'Portrait of Joe Sarchiolla, cap and glasses',
    schizzi: 'Sheet of hand sketches: lamps, seats, vases, upholstery and lighting systems',
    lab: 'The DADO lamp lit, held in one hand',
  },
  // Stesso ordine delle tavole in `about.sketchbook`.
  sketchbook: [
    {
      front: 'Cover of the personal sketchbook of Joe Sarchiolla',
      back: 'Title page Vol.1 Archivio',
    },
    {
      front: 'Index of the 2024 projects, with thumbnails',
      back: 'Grid of products in thumbnail',
    },
    {
      front: 'Joe holding some of his objects',
      back: 'Detail of the Bullone project, a pen holder',
    },
    {
      front: 'Staged photograph of the Flue project',
      back: 'Sheet for the Mari Chair CAD project, technical drawing and photo',
    },
    {
      front: 'Sculpture Sedia a tempo determinato, In-sicurezza contest',
      back: null,
    },
  ],
}

export const familyBandEn = { alt: 'The family of products' }

export const areeEn = {
  'product-design': {
    label: 'Product design',
    desc: 'Furniture, jewellery, lighting and packaging.',
  },
  'graphic-design': {
    label: 'Graphic design',
    desc: 'Posters, mascots and visual identities for competitions and open calls.',
  },
}

/*
 * Per slug: `cat`, `desc` e `spec` (con le chiavi già in inglese, così la
 * tabella non ha bisogno di alcuna traduzione a parte). Chi non compare qui
 * resta in italiano — e va tradotto appena il progetto entra in archivio.
 */
export const progettiEn = {
  'directional-arrow': {
    cat: 'Coat rack',
    desc: 'Arrow is a project for those who love industrial style and essential design. The directional arrow, a recurring graphic element, becomes the core of the product, giving it a strong geometric, graphic and industrial value.',
    spec: {
      Object: 'Coat rack',
      Context: 'Design Wanted competition',
      Material: 'Steel',
      Colour: 'Black / Red',
    },
  },
  'dado-lamp': {
    cat: 'Table lamp',
    desc: 'DADO LAMP is a 3D-printed lamp that brings together function and a contemporary aesthetic language. The integrated handle becomes part of the form and makes the lamp easy to carry, while the power cable is turned into a visible graphic element. The grooved structure contrasts with the smoked glass sphere, striking a balance between technical matter and luminous lightness.',
    spec: {
      Object: 'Lamp',
      Context: 'Personal project',
      Material: 'PLA (3D printing)',
      Colour: 'Black / Red',
    },
  },
  'sedia-tempo-determinato': {
    cat: 'Design sculpture',
    desc: 'Sedia a tempo determinato (fixed-term chair) is a design object made of cardboard, a fragile and temporary material that becomes a metaphor for precarious work. The chair, a symbol of stability, is unstable here: a seat no one would truly feel safe on, like those living on fixed-term contracts, insufficient pay and an uncertain future. The work invites reflection on the dignity of work and on the right to a stable place to stay.',
    spec: {
      Object: 'Design sculpture',
      Context: 'In Sicurezza competition · UIL Ravenna',
      Material: 'Cardboard / Tape',
      Colour: 'Brown',
    },
  },
  orbit: {
    cat: 'Valet stand · HIRO',
    desc: 'ORBIT is a valet stand designed for the competition promoted by HIRO Design, developed from the exploration of circular geometry as the generating principle of the form. The project reflects a personal enquiry into the relationship between geometry, structure and production process applied to metal furniture design.',
    spec: {
      Object: 'Valet stand',
      Context: 'HIRO Design competition · Concept design',
      Material: 'Steel',
      Colour: 'Orange / Black',
    },
  },
  'fuori-asse': {
    cat: 'Stool · Wood',
    desc: 'Fuori asse is a stool made by placing reclaimed wooden boards side by side, deliberately kept apart by a functional 30 mm gap. The central slot becomes an integrated handle and, at the same time, the visible mark of the encounter between different elements: a condition typical of reuse, turned into a constructive and identifying principle.',
    spec: {
      Object: 'Stool',
      Context: 'RiLegno · MasterWood competition · Concept design',
      Material: 'Reclaimed wood',
      Colour: 'Light wood',
    },
  },
  'mari-chair': {
    cat: 'Chair · Autoprogettazione',
    desc: 'Enzo Mari’s Autoprogettazione chair is reinterpreted through a technical, contemporary language inspired by the aesthetics of 3D CAD drawings. The numbering identifies each component and simplifies assembly, making the construction process visible. A tribute to Mari’s principle: design that is accessible, understandable and reproducible.',
    spec: {
      Object: 'Chair',
      Context: 'Personal project · homage to Enzo Mari',
      Material: 'Spruce wood',
      Colour: 'Black / White',
    },
  },
  flue: {
    cat: 'Lighting system',
    desc: 'FLUE stems from the observation of diameter changes in extrusion lines, a stage of production that generates non-standard elements destined for disposal. Through an approach of structural upcycling, the project gives value to this waste while preserving its form, size and industrial identity. Standard diameters thus become the generative principle of a modular collection of lighting systems.',
    spec: {
      Object: 'Lamps · Lighting system',
      Context: 'Degree thesis · Academy of Fine Arts, Bologna',
      Material: 'PVC / PLA',
      Colour: 'Orange / White / Black',
    },
  },
  dose: {
    cat: 'Lighter case',
    desc: 'DOSE is a lighter case designed for anyone who can never find their lighter among cargo pockets, bags and the things carried around every day: it comes from the need to keep it always at hand, turning it into an accessory to be worn rather than simply stored away. The pill shape defines the identity of the product, while the pop aesthetics and bright industrial colours build a sharp, recognisable visual language. A system of magnets allows the different elements to be chosen and combined freely, and swapped with ease: every DOSE is modular and customisable in its colour configurations. The fastening clips it to trousers or to a bag and keeps the lighter always visible and within reach — a small accessory that makes an everyday gesture simpler.',
    spec: {
      Object: 'Lighter case · Keyring',
      Context: 'Personal project',
      Material: 'PLA',
      Colour: 'Red / White',
    },
  },
  'exit-tie': {
    cat: 'Tie',
    desc: 'EXIT TIE is a tie made for the graduation, born from the reinterpretation of a formal accessory through the visual language of industrial graphics and road signage. The traditional shape remains, but it is transformed by a few essential elements: black, technical lettering and above all a white arrow pointing downwards. The arrow becomes the communicative core of the project, an exit sign meant both literally and as a metaphor for the end of a path: an ironic object where design, visual communication and clothing meet, and a tie turns into a sign to be worn.',
    spec: {
      Object: 'Tie',
      Context: 'Personal project',
      Colour: 'Black / White',
    },
  },
  bloom: {
    cat: 'Flower holder',
    desc: 'BLOOM is a concept for a flower holder, born from the idea of salvaging an existing industrial element and turning it into an everyday object. A ten-hole industrial brick is reinterpreted through a simple interlocking accessory that makes it a flower holder without altering its original structure. The intervention leaves the identity of the brick visible and gives value to its materiality and industrial character: on the front, graphics inspired by research on Futurism, recovered from historical texts and publications, with the Yellow Faun as the distinctive element; on the lower part, a numbering that recalls the language of limited editions and makes every salvaged brick an identifiable, collectible piece.',
    spec: {
      Object: 'Flower holder',
      Context: 'Concept design',
      Material: 'Brick',
      Colour: 'Terracotta / Black',
    },
  },
  'zeta-3': {
    cat: 'Workstation',
    desc: 'ZETA 3 is a workstation developed as a university project and designed to be shown at SaloneSatellite 2025, on the stand of the Accademia di Belle Arti di Bologna. The project comes from the wish for a compact, versatile element able to hold three different functions in a single object: a computer station, a seat and a container for work materials. The structure pairs a contemporary language with elements drawn from craft and from the working of the material, bringing out how the object is built and what it does.',
    spec: {
      Object: 'Workstation',
      Context: 'Salone Satellite, Milan · produced by Meco / Mobilferro',
      Material: 'Wood / Steel',
      Colour: 'Wood / Black',
    },
  },
  bullone: {
    cat: 'Pen holder · Desk',
    desc: 'Bullone is a pen holder inspired by the iconic shape of the industrial bolt, reinterpreted in a contemporary key to bring to light those hidden yet essential objects that often go unnoticed. Many functional objects stay behind the scenes: Bullone gives them a voice, turning them into protagonists of everyday space.',
    spec: {
      Object: 'Pen holder',
      Context: 'Personal project',
      Material: 'PLA',
      Colour: 'White / Blue / Red',
    },
  },
  trave: {
    cat: 'Jewellery · Fashion',
    desc: 'TRAVE is a fashion design project that reinterprets the beam, a structural element, turning it into a piece of jewellery to wear. It takes the form of a drop earring in sterling silver 925, with an essential structure and an engraving that becomes part of what the piece says. The beam stands for solidity, support and construction: a metaphor for a personal path and for building a life of your own. The engraving on the surface turns that structure into a message to carry with you.',
    spec: {
      Object: 'Earrings',
      Context: 'Collaboration with QAIA Laboratorio',
      Material: 'Sterling silver 925',
      Colour: 'Silver',
    },
  },
  'zero-sfrido': {
    cat: 'Seat · Eco design',
    desc: 'A piece of furniture resulting from a process of reduction and essentiality, inspired by the language of architecture. What counts is the idea that structure should not be hidden but become expression, and that material can tell its own story through its constructive logic.',
    spec: {
      Object: 'Seat',
      Context: 'University project · Eco design · Concept design',
      Material: 'Okoumé wood',
      Colour: 'Okoumé',
    },
  },
  'stanza-nella-stanza': {
    cat: 'Architecture · Interior',
    desc: 'The project rests on the idea that space is born of an inhabiting experience rather than of a single object. The core of the composition is the bathroom area, turned into a place of relaxation with a sunken pool and a shower falling from the ceiling: open and bright thanks to the absence of barriers and to a glass wall with controlled privacy.',
    spec: {
      Object: 'Architecture / Interior',
      Context: 'University project · Concept design',
      Material: 'Concrete / Wood',
    },
  },
  'dog-lamp': {
    cat: 'Floor lamp',
    desc: 'DOG LAMP is a lamp made for childhood, designed to bring together function, simple construction and a playful language. The project was developed to be made through 3D printing, with a system of interlocking parts that lets the lamp be assembled without glue or complicated fixings. The dog-inspired form turns the lamp into a small domestic presence able to relate to the child, making light part of everyday life. DOG LAMP comes out of the meeting between digital design, additive manufacturing and design for children.',
    spec: {
      Object: 'Children’s lamp',
      Context: 'University project',
      Material: 'PLA',
      Colour: 'White',
    },
  },
  anelli: {
    cat: 'Magazine rack',
    desc: 'ANELLI is a design concept developed during university, born from a reinterpretation of the magazine rack through a pop aesthetic and a moving system. The project is made of a series of rotating rings that let each section of the rack be turned, so the magazines can be reached from more than one direction.',
    spec: {
      Object: 'Magazine rack',
      Context: 'University project · Concept design',
      Material: 'PLA',
      Colour: 'Black',
    },
  },
  pistone: {
    cat: 'Planter cover',
    desc: 'Pistone is a plastic planter cover made by injection moulding, designed to combine function and aesthetic character. The design draws on the shape of engine pistons, reinterpreted in a soft, contemporary key to suit domestic settings.',
    spec: {
      Object: 'Planter cover',
      Context: 'University project · Concept design',
      Material: 'PLA',
      Colour: 'Blue / Grey',
    },
  },
  food: {
    cat: 'Food container',
    desc: 'LUNCH BOX is a design concept developed during university, born from the wish to simplify the lunch break and make it work in any situation. The project rethinks the classic lunch box through a system meant to organise and carry a meal in a simple, practical and intuitive way, adapting to the different needs of everyday life. The aim is an object able to follow its user away from home, at work, at university or on the move, making lunchtime easier to handle.',
    spec: {
      Object: 'Lunch box',
      Context: 'University project · Concept design',
      Material: 'PLA',
      Colour: 'Grey / White',
    },
  },
  nymphe: {
    cat: 'Packaging · Davines',
    desc: 'Nymphē is a packaging and visual identity project developed for Davines, inspired by the mythological world of nymphs and their bond with nature. The silhouettes of the bottles draw on chemical essence flasks, reinterpreted with elegance to evoke the idea of natural formulas and pure ingredients.',
    spec: {
      Object: 'Packaging · Hair products',
      Context: 'University contest · Group work · Concept design',
      Material: 'PLA (prototype)',
      Colour: 'Black / Transparent',
    },
  },
  rilegno: {
    cat: 'Illustration',
    desc: 'A chair balanced on a stack of offcuts: wood that becomes matter again, and then object again. Cover illustration for Walden, the Rilegno magazine devoted to the circular economy.',
    spec: {
      Object: 'Illustration · Cover',
      Context: 'Walden · Rilegno magazine',
    },
  },
  'direzione-tolleranza': {
    cat: 'Poster',
    desc: 'Arrows and urban signage: every element keeps its own direction yet lives within a single system. The word TOLLERANZA holds the differences together.',
    spec: {
      Object: 'Poster',
      Context: 'Competition · Friuli-Venezia Giulia',
    },
  },
  'il-fauno': {
    cat: 'Mascot',
    desc: 'A tribute to Fortunato Depero, master of Futurism, reinterpreted in a contemporary key with sharp lines and geometric forms.',
    spec: {
      Object: 'Mascot · Visual identity',
      Context: 'Competition · Emilia-Romagna',
    },
  },
  'europa-unisce': {
    cat: 'Poster',
    desc: 'A shipping parcel turning around a stylised world: a metaphor for a Europe in movement that brings together people, cultures and values.',
    spec: {
      Object: 'Poster',
      Context: 'Competition · Emilia-Romagna',
      Result: 'Winner · 3rd place',
    },
  },
  'citta-parla': {
    cat: 'Poster',
    desc: 'Two empty chairs and a bright yellow, calling out the dialogue that is missing and inviting young people to stop, meet and speak to one another again.',
    spec: {
      Object: 'Poster',
      Context: 'IGPDecaux Graphic Award, Milan',
    },
  },
  'in-the-box': {
    cat: 'Poster',
    desc: 'A reflection on the housing condition of the future: the city enclosed in a cardboard box, a symbol of ever smaller and more temporary spaces.',
    spec: {
      Object: 'Poster',
      Context: 'Sketch your Deck · Bonobolabo, Bologna',
    },
  },
  fiori: {
    cat: 'Poster',
    desc: 'An invitation to believe in rebirth even in the darkest moments: flowers as fragile yet stubborn symbols of life, against the shadow of war.',
    spec: {
      Object: 'Poster',
      Context: 'Competition · Emilia-Romagna',
      Result: '4th place',
    },
  },
}
