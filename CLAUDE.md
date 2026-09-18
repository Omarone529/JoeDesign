# CLAUDE.md — JoeDesign

Portfolio di **Giovanni "Joe" Sarchiolla**, product designer di Reggio Emilia.
Sito bilingue (it/en), mobile-first, in sviluppo.

Il **codice è in inglese**: nomi, file, chiavi dei dati, classi e variabili CSS. In
**italiano** restano commenti, documentazione, testi del sito e segmenti degli URL
italiani (`/archivio`, `/chi-sono`). Commenti pochi e brevi, solo il perché non ovvio.

## Stack e comandi

React 18 + Vite 8 + Tailwind 3, router custom su History API, pre-rendering statico per la
SEO, deploy su Netlify. Niente librerie UI, niente CSS-in-JS, niente react-router.

```bash
npm run dev        # http://localhost:5173
npm run build      # client + SSR + pre-rendering → dist/ (prima gira test + verify)
npm run lint       # deve restare a zero
npm test           # node:test: rotte, seo, dati, parità it/en
npm run verify     # dati di siteData ↔ file su disco
npm run hydration  # dopo la build: controlla l'aggancio di React sulle 66 pagine (gira anche in CI)
```

Ogni pagina è un file JS caricato a richiesta (`src/pageLoader.js`): una pagina nuova va
aggiunta lì, in `loaders` e in `SOURCES`.

`npm run preview` va aperto con lo slash finale (`/progetto/anelli/`).

## Design system

Estetica editoriale carta/inchiostro: tipografia grande, molto bianco, griglie con bordi
sottili.

| Token         | Colore    | Uso                                  |
| ------------- | --------- | ------------------------------------ |
| `paper`       | `#f4f3f1` | sfondo principale                    |
| `ink`         | `#14110f` | testo / nero caldo                   |
| `muted`       | `#6f6b67` | testo secondario su fondo chiaro     |
| `night-soft`  | `#c8c4bf` | testo secondario su fondo `night`    |
| `line`        | `#d7d4cf` | bordi                                |
| `line-soft`   | `#e4e1dd` | bordi molto chiari                   |
| `placeholder` | `#e9e7e3` | sfondo immagini                      |
| `hover`       | `#ececE8` | hover celle                          |
| `night`       | `#0a0908` | sfondo footer                        |

- Font: **Helvetica Neue ovunque**, pesi 400, 500 e 700. I `@font-face` in `src/index.css`
  usano quella installata (Apple) e altrimenti i WOFF2 in `public/fonts/`
  (`HelveticaNeue-Roman`, `-Medium`, `-Bold`), che richiedono una licenza web.
  Senza i file, fuori da Apple esce Arial e `npm run verify` lo segnala.
- `og-image.js` disegna il testo col font di sistema: va lanciato su un Mac, o le
  anteprime escono in Arial.
- Titoli grandi fluidi con `text-[clamp(...)]`, uppercase, tracking stretto.
- Padding orizzontale delle sezioni: `px-5 sm:px-8 lg:px-[72px]`.
- Ingresso pagina: `animate-viewIn`. Animazioni con curva di decelerazione
  `cubic-bezier(.16,1,.3,1)`; con `prefers-reduced-motion` tutto è già a posto.
- `muted` e `night-soft` non si scambiano: su fondo `night` il testo secondario è
  `night-soft` (contrasto WCAG AA). Cambiando un colore, ricalcolare il contrasto.
- Prima di togliere un token, cercarlo in `src/`: Tailwind non protesta, la classe sparisce.

## Regole

- **Link interni** sempre con `<Link to={pathFor(name, params, lang)}>`, mai `<a href>` o
  stringhe scritte a mano. La lingua sta nell'URL (`/…` italiano, `/en/…` inglese); gli
  slug non si traducono.
- **Nessun testo nel markup**: interfaccia in `src/i18n.js` (`texts(lang)`), contenuti in
  `src/data/siteData.js` (fonte di verità) e inglese in `src/data/contentEn.js`.
  Le due lingue devono avere la stessa forma: una chiave mancante in `en` dà pagina bianca.
- **Niente `fetch` a runtime** per contenuti da indicizzare.
- **Niente `window`/`document`/`new Date()`/`localStorage` durante il render**: solo in
  `useEffect` o handler, o si rompono pre-rendering e hydration.
- **Niente hash routing.**
- Altezze legate allo schermo con `var(--screen-height, 100svh)`, mai `vh`/`svh` nudi.
- Niente sbordi orizzontali (verificare a 320–430px); contenere con `overflow-x-clip`.
- Bersagli al tocco almeno 24px, allargati con uno pseudo-elemento, non col padding.

## Nuovo progetto

Voce in `archive` (`siteData.js`, con `area: 'graphic'` se è grafica) + traduzione in
`contentEn.js` + immagini in `public/images/products/<slug>/` (`cover.webp`,
`01.webp…`, WebP). Poi:

```bash
node scripts/compress-photos.js
node scripts/photo-fit.js
node scripts/og-image.js      # anteprime social (JPEG, non WebP)
```

Immagini di sintesi da dichiarare nel campo `ai` (etichetta AI Act): senza, escono come
foto vere. Reel/filmati YouTube: `video`/`film` + `node scripts/video-poster.js`.
L'iframe di YouTube compare solo dopo il play o il consenso; il filmato orizzontale non
parte mai da solo.

## Privacy

Sito senza cookie propri né statistiche; unico terzo è YouTube, solo col consenso.
Nel banner «Rifiuta» e «Accetta» sono disegnati identici. Mai scrivere «usiamo i cookie
per migliorare l'esperienza». Ogni nuovo trattamento (analitica, form, risorsa esterna)
va aggiunto all'informativa in tutte e due le lingue e alla CSP in `netlify.toml`.

## Tono dei testi

Impersonale: niente "io", niente "Giovanni fa". Costruzioni con "si", passive o nominali
(«Si parte da un vincolo…»).

## Commit

Prefisso + cosa cambia, una riga: `feat:`, `fix:`, `ref:`, `chore:`, `docs:`.
Mai `chore: update`.
