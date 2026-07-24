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
```

`npm run build` fa tre cose in sequenza: `vite build` (bundle client) → `vite build --ssr`
(bundle server in `dist-ssr/`) → `node scripts/prerender.js` (scrive gli HTML statici + sitemap + robots).

## Architettura

### Routing (`src/router.jsx`)
URL reali, non hash:
- `/` → Home
- `/chi-sono` → About (pagina "Chi sono")
- `/archivio` → Archive
- `/progetto/<slug>` → ProjectDetail

`App.jsx` legge la rotta con `useRoute()` e monta la pagina giusta. Funziona sia nel
browser sia in SSR (in build) tramite `RouterProvider` con `initialPath`.

### Pre-rendering / SEO (`scripts/prerender.js` + `src/seo.js` + `src/entry-server.jsx`)
Ogni rotta viene renderizzata in un **HTML statico già completo** (es. `dist/progetto/flue/index.html`),
con title, meta description, Open Graph, Twitter card e JSON-LD schema.org **per pagina**.
Vengono generati anche `sitemap.xml` e `robots.txt`. Google e le anteprime dei link vedono
il contenuto senza eseguire JS. Nel browser React si "aggancia" via hydration (`src/main.jsx`).
`src/seo.js` definisce title/description/immagine per ogni rotta e l'elenco delle rotte da generare.

### Contenuti (`src/data/siteData.js`) — FONTE DI VERITÀ
Tutti i testi e i dati stanno qui, non nel markup:
- `profile` — dati di Joe (nome, ruolo, contatti, manifesto)
- `focusItems` — le schede "Lavori selezionati" in homepage
- `archive` — TUTTI i progetti (slug, title, cat, year, photos, desc, spec, opzionale `works`)
- `familyBand`, `contests` — altre sezioni home
- `projectImages(item)` — costruisce i percorsi immagine di un progetto

## ⚠️ Regole da rispettare (per non rompere SEO/pre-rendering)

1. **Link interni** → usa `<Link to="/...">` da `src/router.jsx`, MAI `<a href>` per rotte interne.
   Per mailto/tel/URL esterni/`#` va bene `<a>` (o `Link`, che li gestisce come anchor normali).
2. **Niente `fetch`/API a runtime** per contenuti che devono essere indicizzati: tienili in `siteData.js`.
   Il pre-rendering "fotografa" ciò che è nei dati statici.
3. **Nuovo progetto** = aggiungi una voce in `archive` (e le immagini nella sua cartella).
   Entra automaticamente in pre-rendering, sitemap e con i suoi meta tag. Nessun altro passo.
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
- Home: `public/images/home/` · Chi sono: `public/images/about/`

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

  (segmentazione AI via `@imgly/background-removal-node` → WebP con canale alpha).

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
├── components/
│   ├── Navbar.jsx        # nav sticky (Home · Chi sono · Archivio · Contatti)
│   ├── Footer.jsx
│   ├── Carousel.jsx      # carosello immagini scheda progetto (autoplay + controlli)
│   └── home/             # sezioni homepage: Masthead, MetaStrip, SelectedWorks,
│                         #   FamilyBand, ContestsTicker
└── pages/
    ├── Home.jsx
    ├── About.jsx         # "Chi sono": ritratto, bio, foto di Joe
    ├── Archive.jsx       # griglia di tutti i progetti
    └── ProjectDetail.jsx # scheda singola con galleria + prev/next

scripts/
├── prerender.js         # pre-rendering + sitemap + robots (parte di `npm run build`)
├── optimize-image.js    # jpg/png → webp ottimizzato (per le foto da media/)
└── remove-bg.js         # ritaglio soggetto → webp con trasparenza (segmentazione AI)
```

## Tono dei testi

I testi delle pagine sono in **tono impersonale** (no prima persona "io", no terza
persona "Giovanni fa"): costruzioni con "si", passive o nominali. Es. «Product designer,
con base a Reggio Emilia», «Si parte da un vincolo…». Mantenere questo registro ovunque.

## Deploy (Netlify)

- `netlify.toml`: build = `npm run build`, publish = `dist`.
- **Dominio dinamico**: `SITE` in `src/seo.js` legge la env `URL` (che Netlify imposta al deploy),
  con fallback `https://joedesign.netlify.app`. Canonical/sitemap/OG si adeguano da soli al dominio reale.
  Quando Joe comprerà un dominio, basta aggiungerlo in Netlify — nessuna modifica al codice.
  Per forzarlo in locale: `SITE_URL=https://miodominio.it npm run build`.

## Da fare (noto)

- Il sito è ancora in costruzione: aspettarsi nuove sezioni, contenuti e progetti.
- Le foto di molti progetti d'archivio vanno ancora inserite (galleria `01.webp…` dalla
  cartella `ARCHIVIO WEBP`).

## Fonte dei contenuti (bio, CV, testi)

Oltre alle immagini, in `C:\Generale\Lavori\Joe design\` ci sono due PDF che sono la
**fonte di verità** per testi e progetti:
- `PORTFOLIO GIOVANNI SARCHIOLLA 2026.pdf` — presentazione: la pagina "MI PRESENTO" ha
  intro, EXPERIENCE, SKILLS, EDUCATION, la card Instagram e i QR replicati in "Chi sono".
- `ARCHIVE JOE SARCHIOLLA.pdf` — archivio progetti.

Per leggerli senza poppler: estrai il testo con `pdfjs-dist` o rendi le pagine a PNG con
`pdf-to-img` (entrambi installabili con `npm i --no-save`), poi apri i PNG con Read.

Nota nomi: `profile.name` = "Giovanni Sarchiolla" (formale, usato nei title SEO);
`profile.displayName` = "Joe Sarchiolla" (mostrato in home e "Chi sono").

> Nota: il `README.md` è più vecchio e descrive solo la homepage iniziale. Per il contesto
> aggiornato fa fede questo `CLAUDE.md`.
