# Portfolio Giovanni "Joe" Sarchiolla — Sito web

Riproduzione fedele della **homepage** del template *Direzione A* del portfolio
di Giovanni Sarchiolla (fonte di verità: progetto Claude Design).
Stack: **React + Vite + Tailwind CSS**, approccio **mobile-first**.

## Avvio

```bash
npm install
npm run dev      # server di sviluppo (http://localhost:5173)
npm run build    # build di produzione in /dist
npm run preview  # anteprima della build
```

## Struttura delle cartelle

```
JoeDesignWebsite/
├── index.html
├── package.json
├── tailwind.config.js          # palette e font del progetto
├── postcss.config.js
├── vite.config.js
│
├── public/
│   └── images/                 # tutte le immagini del sito
│       ├── home/
│       │   └── family-band.webp        # fascia "famiglia di prodotti"
│       └── products/           # UNA cartella per prodotto (slug)
│           ├── flue/
│           │   └── cover.webp
│           ├── orbit/
│           │   └── cover.webp
│           ├── directional-arrow/
│           │   └── cover.webp
│           ├── dado-lamp/
│           │   └── cover.webp
│           └── dog-lamp/
│               └── cover.webp
│
└── src/
    ├── main.jsx                # entry point
    ├── App.jsx                 # layout: Navbar + Home + Footer
    ├── index.css               # Tailwind + stili base
    ├── data/
    │   └── siteData.js         # TESTI e contenuti (fonte di verità)
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   └── home/               # sezioni della homepage
    │       ├── Masthead.jsx
    │       ├── MetaStrip.jsx
    │       ├── SelectedWorks.jsx
    │       ├── FamilyBand.jsx
    │       └── ContestsTicker.jsx
    └── pages/
        └── Home.jsx
```

## Immagini — convenzione per l'Archivio (fase successiva)

Ogni prodotto ha **una propria cartella** dentro `public/images/products/<slug>/`.
Quando realizzeremo la pagina **Archivio** con le schede di dettaglio, le foto
del singolo prodotto andranno tutte nella sua cartella, ad esempio:

```
public/images/products/flue/
├── cover.webp      # copertina (già presente, usata in homepage)
├── 01.webp         # foto galleria
├── 02.webp
└── ...
```

In questo modo l'albero resta pulito e ogni scheda prodotto pesca le immagini
dalla propria cartella.

## Palette e tipografia

Definite in `tailwind.config.js`:

| Token        | Colore    | Uso                          |
| ------------ | --------- | ---------------------------- |
| `paper`      | `#f4f3f1` | sfondo principale            |
| `ink`        | `#14110f` | testo / nero caldo           |
| `muted`      | `#8f8b86` | testo secondario             |
| `line`       | `#d7d4cf` | bordi                        |
| `night`      | `#0a0908` | sfondo footer                |

Font: **Helvetica Neue / Helvetica / Arial**.
```
