# CLAUDE.md — JoeDesign

Contesto del progetto per Claude Code. Leggilo a inizio sessione prima di modificare il codice.

## Cos'è

Sito portfolio di **Giovanni "Joe" Sarchiolla**, product designer di Reggio Emilia.
Estetica editoriale "Direzione A": carta/inchiostro, tipografia grande, molto bianco,
griglie con bordi sottili. Mobile-first. Lingua del sito e dei commenti: **italiano**.

Stato: **in sviluppo, incompleto** — ci sono ancora sezioni e pagine da costruire (vedi "Da fare").

## Stack

- **React 18** + **Vite 5** (nessun framework tipo Next)
- **Tailwind CSS 3** per lo stile (nessun CSS-in-JS, nessuna libreria UI)
- **Router custom** basato su History API (`src/router.jsx`) — niente react-router
- **Pre-rendering statico** in fase di build per la SEO
- Deploy: **Netlify**

## Comandi

```bash
npm run dev        # sviluppo → http://localhost:5173
npm run build      # build client + build SSR + pre-rendering di tutte le pagine → dist/
npm run preview    # anteprima della build di produzione
npm run prerender  # solo lo step di pre-rendering (dopo una build)
npm run lint       # ESLint (react, react-hooks, jsx-a11y). Deve restare a zero.
```

⚠️ **`npm run preview` va usato con lo slash finale** (`/progetto/anelli/`, non
`/progetto/anelli`): senza, Vite fa il fallback SPA e serve la home al posto
della pagina pre-renderizzata, con conseguenti falsi errori di hydration in
console. Netlify risolve le directory da sé e non ha il problema.

`npm run build` fa tre cose in sequenza: `vite build` (bundle client) → `vite build --ssr`
(bundle server in `dist-ssr/`) → `node scripts/prerender.js` (scrive gli HTML statici + sitemap + robots).

## Architettura

### Routing (`src/router.jsx`)
URL reali, non hash:
- `/` → Home
- `/chi-sono` → About (pagina "Chi sono")
- `/archivio` → Archive: il bivio fra le due aree (product design / graphic design)
- `/archivio/<area>` → Archive: la griglia dei progetti di quell'area
  (`/archivio/product-design`, `/archivio/graphic-design`). Area sconosciuta → 404
- `/progetto/<slug>` → ProjectDetail

`App.jsx` legge la rotta con `useRoute()` e monta la pagina giusta. Funziona sia nel
browser sia in SSR (in build) tramite `RouterProvider` con `initialPath`.

### Anteprime social e icona — file già pronti, NON si rigenerano a ogni build
Due script si lanciano **a mano** e salvano il risultato dentro `public/`, come le altre immagini:

```bash
node scripts/og-image.js   # public/images/og/*.jpg — anteprime dei link (1200×630)
node scripts/favicon.js    # favicon.ico/.svg, apple-touch-icon, icon-192/512, site.webmanifest
```

- **`og-image.js` va rilanciato dopo aver aggiunto un progetto o cambiato una copertina**,
  altrimenti la scheda nuova punta a un JPEG che non esiste. È l'unico passo manuale
  quando cresce l'archivio.
- Le anteprime sono in **JPEG e non in WebP**: LinkedIn e WhatsApp non mostrano le WebP,
  e il link condiviso uscirebbe senza immagine. Non ricondurle al WebP del sito.
- `favicon.js` serve solo se cambia il marchio.

### Pre-rendering / SEO (`scripts/prerender.js` + `src/seo.js` + `src/entry-server.jsx`)
Ogni rotta viene renderizzata in un **HTML statico già completo** (es. `dist/progetto/flue/index.html`),
con title, meta description, author, Open Graph, Twitter card e JSON-LD schema.org **per pagina**.
Vengono generati anche `sitemap.xml` e `robots.txt`. Google e le anteprime dei link vedono
il contenuto senza eseguire JS. Nel browser React si "aggancia" via hydration (`src/main.jsx`).

`src/seo.js` è il posto dei metadati: title/description/immagine per rotta, l'elenco
delle rotte da generare, **i dati strutturati** e **le immagini da mettere in sitemap**.
`prerender.js` non decide niente, li serializza soltanto.

**Dati strutturati** — un `@graph` per pagina, non frammenti sciolti. Sito e persona
hanno un `@id` fisso (`#sito`, `#persona`) e le altre entità li richiamano invece di
ridescriverli: così le 18 schede risultano di *una* persona, non di 18 omonimi.
Per rotta: home `WebSite`+`Person`, `/archivio` e `/archivio/<area>`
`CollectionPage`+`ItemList` (l'area aggiunge il `BreadcrumbList`),
`/chi-sono` `ProfilePage`, scheda `CreativeWork`+`BreadcrumbList`. La 404 non ne ha
(è `noindex`: descrivere un errore a un motore non ha senso).

**Sitemap immagini** — ogni URL dichiara le immagini che contiene (174 in tutto).
Per un portfolio Google Immagini pesa quanto la ricerca per testo. Dentro
`<image:image>` va **solo** `<image:loc>`: `image:title`, `image:caption`,
`image:license` e `image:geo_location` sono deprecati da Google dal 2022 e ignorati —
la descrizione la prende dall'`alt` nella pagina, ed è per questo che gli `alt` sono
scritti per bene in `siteData` (`altCopertina`, `altGalleria`, `altDisegno`, `altSfondo`).

### Contenuti (`src/data/siteData.js`) — FONTE DI VERITÀ
Tutti i testi e i dati stanno qui, non nel markup:
- `profile` — dati di Joe (nome, ruolo, contatti, manifesto)
- `focusItems` — le schede "Lavori selezionati" in homepage
- `archive` — TUTTI i progetti (slug, title, cat, year, photos, desc, spec, opzionale `works`)
- `aree` — le due aree dell'archivio (slug d'URL, etichetta, descrizione). L'area di un
  progetto sta nel suo campo `area`; chi non ce l'ha è product design (`AREA_PREDEFINITA`).
  `progettiArea(chiave)` filtra, `areaPerSlug(slug)` risolve l'URL
- `familyBand` — altra sezione home (il ticker "Skills" in home riusa `about.skills`)
- `projectImages(item)` — costruisce i percorsi immagine di un progetto
- `titoloLeggibile(t)` — i titoli sono scritti in maiuscolo e il CSS li mostra così;
  fuori dal markup (alt, `<title>`, dati strutturati) serve la forma leggibile.
  Maiuscola solo all'iniziale, come l'italiano vuole
- `altCopertina/altGalleria/altDisegno/altSfondo` — i testi alternativi, usati sia
  dalle pagine sia dalla sitemap immagini: una foto si descrive in un posto solo

## ⚠️ Regole da rispettare (per non rompere SEO/pre-rendering)

1. **Link interni** → usa `<Link to="/...">` da `src/router.jsx`, MAI `<a href>` per rotte interne.
   Per mailto/tel/URL esterni/`#` va bene `<a>` (o `Link`, che li gestisce come anchor normali).
2. **Niente `fetch`/API a runtime** per contenuti che devono essere indicizzati: tienili in `siteData.js`.
   Il pre-rendering "fotografa" ciò che è nei dati statici.
3. **Nuovo progetto** = aggiungi una voce in `archive` (e le immagini nella sua cartella;
   se è grafica, `area: 'graphic'`),
   poi lancia `node scripts/og-image.js` per l'anteprima social. Pre-rendering, sitemap
   e meta tag si aggiornano da soli.
4. **Non reintrodurre l'hash routing** (`#progetto/...`): romperebbe SEO e link profondi.
5. Evita di usare `window`/`document` durante il render dei componenti (solo dentro `useEffect`/handler),
   altrimenti il pre-rendering fallisce.

## Immagini

Le immagini vivono in `public/images/`, referenziate come **stringhe di path**
(es. `/images/products/flue/cover.webp`), non importate. Formato **WebP**. Metti sempre
`alt` descrittivi e `loading="lazy"` (tranne la prima immagine "above the fold").

Organizzazione:
- Prodotti: una cartella per progetto `public/images/products/<slug>/`
  - `cover.webp` → copertina (griglia + testata dettaglio)
  - `01.webp … NN.webp` → galleria (in ordine). `photos` in `siteData` = quante foto galleria ci sono.
  - `disegno.webp` → disegno tecnico quotato, mostrato nella scheda sotto al carosello.
    Non viene da `ARCHIVIO WEBP`: nell'archivio PDF è vettoriale, quindi si estrae
    rendendo la pagina della scheda (`node scripts/pdf-disegno.js <slug>`, vedi sotto).
    In `siteData` il progetto che ce l'ha porta `disegno: true`.
- Home: `public/images/home/` · Chi sono: `public/images/about/`

**Dopo aver aggiunto o sostituito foto di prodotto vanno rilanciati, in quest'ordine:**

```bash
node scripts/comprimi-foto.js   # riduce a 1600px e ricomprime (--prova per vedere e basta)
node scripts/fit-foto.js        # → src/data/fotoFit.js
```

`comprimi-foto.js` porta le immagini alla misura che il sito usa davvero:
l'archivio arriva a 2000×2000 ma il carosello mostra al massimo ~800px CSS,
1600 anche su schermo retina. Tiene più alte le grafiche piatte (quelle che
`fit-foto` marca `contain`) e quelle con trasparenza, che si sgranano prima.
Converge: rilanciarlo non rimastica l'archivio. Va **prima** di `fit-foto.js`,
che misura i file per decidere i ritagli.

Misura ogni immagine e decide come entra nella cornice quadrata del carosello:
riempie (`object-cover`, il caso normale), riempie puntando il ritaglio sul
prodotto (`object-position`), oppure si mostra intera. Le fotografie si tagliano
senza danno; le grafiche piatte (manifesti, disegni al tratto, piante quotate,
render su fondo bianco) e i formati fuori scala no, e vanno mostrate intere.
Il file generato non si modifica a mano; i pochi casi che la misura non prende
si elencano in `SEMPRE_INTERE`, in testa allo script.

### ⚠️ Da dove arrivano le immagini (workflow)
Le sorgenti stanno FUORI dal repo, in due cartelle sul disco:
- `C:\Generale\Lavori\Joe design\ARCHIVIO WEBP` — archivio dei progetti, **già in WebP**.
  Si **copia-incolla** il file nella posizione giusta dell'albero `public/images/products/<slug>/`
  (rinominandolo `cover.webp`, `01.webp`, …). Nessuna conversione necessaria.
- `C:\Generale\Lavori\Joe design\media` — materiali vari (es. `media\FOTO JOE...` = foto di Joe),
  spesso in **jpg/png pesanti**. Vanno **convertiti in WebP ottimizzato** prima di metterli in `public/`:

  ```bash
  node scripts/optimize-image.js "<sorgente>" public/images/<dest>.webp [larghezzaMax] [qualità]
  ```

  (ridimensiona + comprime; le foto originali possono pesare 7–10 MB, in output ~50–80 KB).

- Per **ritagliare il soggetto** (sfondo trasparente, es. il ritratto in "Chi sono"):

  ```bash
  node scripts/remove-bg.js "<sorgente>" public/images/<dest>.webp [larghezzaMax] [qualità]
  ```

  (segmentazione AI → WebP con canale alpha). ⚠️ La libreria
  `@imgly/background-removal-node` **non è in `package.json`**: pesa 174 MB e Netlify
  la scaricherebbe a ogni build senza che serva al sito. Va installata solo quando serve
  davvero, senza salvarla: `npm i --no-save @imgly/background-removal-node`.

- Per **scontornare un tratto su fondo bianco** (firme, schizzi, scansioni: il fondo
  diventa trasparente e il tratto prende il nero `ink` del sito):

  ```bash
  node scripts/ink-alpha.js "<sorgente>" public/images/<dest>.webp [larghezzaMax] [colore]
  ```

  (solo `sharp`, nessuna dipendenza extra).

## Design system (`tailwind.config.js`)

Palette "carta / inchiostro":

| Token         | Colore    | Uso                     |
| ------------- | --------- | ----------------------- |
| `paper`       | `#f4f3f1` | sfondo principale       |
| `ink`         | `#14110f` | testo / nero caldo      |
| `muted`       | `#8f8b86` | testo secondario        |
| `line`        | `#d7d4cf` | bordi                   |
| `line-soft`   | `#e4e1dd` | bordi molto chiari      |
| `placeholder` | `#e9e7e3` | sfondo immagini         |
| `hover`       | `#ececE8` | hover celle             |
| `night`       | `#0a0908` | sfondo footer           |

- Font: **Helvetica Neue / Helvetica / Arial** (`font-sans`)
- Animazione d'ingresso pagina: classe `animate-viewIn`
- Padding orizzontale standard delle sezioni: `px-5 sm:px-8 lg:px-[72px]`
- Titoli grandi fluidi con `text-[clamp(...)]`, uppercase, `tracking` stretto

## Struttura file

```
src/
├── main.jsx              # entry: hydration (o mount in dev)
├── App.jsx               # layout: Navbar + pagina corrente + Footer
├── router.jsx            # routing History API + <Link> + useRoute/useNavigate
├── seo.js                # meta per rotta + elenco rotte (usato dal pre-rendering)
├── entry-server.jsx      # render(path) per la build SSR (mai spedito al browser)
├── index.css             # Tailwind + stili base
├── data/siteData.js      # TUTTI i contenuti (fonte di verità)
├── data/fotoFit.js       # generato: come ogni foto entra nel carosello
├── components/
│   ├── Navbar.jsx        # nav sticky (Home · Archivio · Chi sono)
│   ├── Footer.jsx        # fa anche da pagina contatti
│   ├── Carousel.jsx      # carosello scheda progetto (autoplay + controlli)
│   ├── ErrorBoundary.jsx # rete di sicurezza attorno alla pagina corrente
│   ├── FloatingMailButton.jsx
│   ├── about/
│   │   └── Sketchbook.jsx  # libro sfogliabile 3D (three + animejs, caricati a vista)
│   └── home/             # sezioni homepage: Hero, SelectedWorks,
│                         #   FamilyBand, SkillsTicker
└── pages/
    ├── Home.jsx
    ├── About.jsx         # "Chi sono": ritratto, bio, foto di Joe
    ├── Archive.jsx       # griglia di tutti i progetti
    └── ProjectDetail.jsx # scheda singola con galleria + prev/next

scripts/
├── prerender.js         # pre-rendering + sitemap + robots (parte di `npm run build`)
├── og-image.js          # anteprime social 1200×630 → public/images/og/ (a mano)
├── favicon.js           # icona del sito in tutti i formati → public/ (a mano)
├── pdf-disegno.js       # disegni tecnici dall'archivio PDF → products/<slug>/disegno.webp (a mano)
├── comprimi-foto.js     # riduce a 1600px e ricomprime public/images/ (a mano)
├── fit-foto.js          # come ogni foto entra nel carosello → src/data/fotoFit.js (a mano)
├── optimize-image.js    # jpg/png → webp ottimizzato (per le foto da media/)
├── remove-bg.js         # ritaglio soggetto → webp con trasparenza (segmentazione AI)
└── ink-alpha.js         # tratto su fondo bianco → webp con alpha (firme, scansioni)
```

## Tono dei testi

I testi delle pagine sono in **tono impersonale** (no prima persona "io", no terza
persona "Giovanni fa"): costruzioni con "si", passive o nominali. Es. «Product designer,
 di Reggio Emilia», «Si parte da un vincolo…». Mantenere questo registro ovunque.

## Deploy (Netlify)

- `netlify.toml`: build = `npm run build`, publish = `dist`.
- **Dominio dinamico**: `SITE` in `src/seo.js` legge la env `URL` (che Netlify imposta al deploy),
  con fallback `https://joedesign.netlify.app`. Canonical/sitemap/OG si adeguano da soli al dominio reale.
  Quando Joe comprerà un dominio, basta aggiungerlo in Netlify — nessuna modifica al codice.
  Per forzarlo in locale: `SITE_URL=https://miodominio.it npm run build`.

## Da fare (noto)

- Il sito è ancora in costruzione: aspettarsi nuove sezioni, contenuti e progetti.
- Le gallerie dei 18 progetti attuali sono **complete** (cover + `01.webp…NN.webp` per
  tutti); mancano solo le foto dei progetti futuri.
- Prima/subito dopo il primo deploy: registrare il sito su **Google Search Console** e
  inviare `/sitemap.xml`. Valutare un'analitica leggera (Plausible/Umami, senza cookie).
- **Decidere il dominio prima di pubblicare**: cambiarlo dopo che Google ha indicizzato
  gli indirizzi `*.netlify.app` obbliga a gestire i redirect.

## Fonte dei contenuti (bio, CV, testi)

Oltre alle immagini, in `C:\Generale\Lavori\Joe design\` ci sono due PDF che sono la
**fonte di verità** per testi e progetti:
- `PORTFOLIO GIOVANNI SARCHIOLLA 2026.pdf` — presentazione: dalla pagina "MI PRESENTO"
  arrivano intro, EXPERIENCE, SKILLS e EDUCATION di "Chi sono". La card Instagram e i QR
  della stessa pagina erano stati replicati e poi tolti: non riproporli senza chiedere.
- `ARCHIVE JOE SARCHIOLLA.pdf` — archivio progetti.

Per leggerli senza poppler: estrai il testo con `pdfjs-dist` o rendi le pagine a PNG con
`pdf-to-img` (entrambi installabili con `npm i --no-save`), poi apri i PNG con Read.

Nota nomi: `profile.name` = "Giovanni Sarchiolla" (formale, usato nei title SEO);
`profile.displayName` = "Joe Sarchiolla" (mostrato in home e "Chi sono").
