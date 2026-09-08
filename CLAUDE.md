# CLAUDE.md — JoeDesign

Contesto del progetto per Claude Code. Leggilo a inizio sessione prima di modificare il codice.

## Cos'è

Sito portfolio di **Giovanni "Joe" Sarchiolla**, product designer di Reggio Emilia.
Estetica editoriale "Direzione A": carta/inchiostro, tipografia grande, molto bianco,
griglie con bordi sottili. Mobile-first. Il sito è **bilingue** (italiano e inglese);
codice e commenti restano in **italiano**.

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
npm test           # test di rotte, meta description e aiutanti dei dati (node:test)
npm run verifica   # controlla che i dati combacino con i file su disco
npm run hydration  # carica le 66 pagine in un browser e verifica l'aggancio di React
```

**`npm run hydration`** è il controllo che nessun altro strumento fa. Il sito serve HTML
già scritto e poi React ci si **aggancia** invece di ridisegnarlo: se quello che React
disegna in memoria non combacia con quel markup, butta via il lavoro del pre-rendering e
ridisegna tutto nel browser — la pagina lampeggia, e se un componente lancia durante
l'aggancio resta bianca (è il motivo per cui esiste `ErrorBoundary`).

Il codice è pieno di scelte fatte apposta per non romperlo, e nessuna si vede leggendo il
file: l'anno del copyright fissato alla build (`__ANNO_BUILD__`), il consenso che in
pre-rendering vale sempre `null` (`versioneServer`), il banner fuori dall'HTML statico
(`useMontato`), la navbar che parte visibile, la sola prima slide del carosello con un
`src`. **Basta un `new Date()` dentro un componente, o uno stato iniziale che legge
`localStorage`, e uno di quei contratti salta in silenzio.**

Vuole la build fatta (`npm run build`) e un Chromium — quello di Playwright se c'è,
altrimenti `CHROME_PATH=/percorso npm run hydration`. Dura un paio di minuti, e **non** è
in `prebuild`: su Netlify non c'è né browser né server. Va lanciato a mano dopo aver
toccato qualcosa di sensibile all'aggancio.

⚠️ `npm run hydration -- --rompi` è l'autotest: rompe l'aggancio di proposito e **deve**
segnalare le pagine come rotte. Se con `--rompi` risulta tutto verde, il rilevatore si è
guastato e i suoi esiti normali non valgono più niente.

`npm test` e `npm run verifica` girano **da soli prima di ogni build** (script
`prebuild`), quindi una rotta rotta, una foto dichiarata e non presente, un'anteprima
social non rigenerata o un'etichetta AI che punta a una foto inesistente **fermano la
build** invece di uscire in produzione — anche su Netlify, che è il posto da cui il sito
esce davvero. Vale la pena lanciare `verifica` a mano dopo aver toccato `siteData.js` o
`public/images/`.

I test girano con `node:test`, senza dipendenze: sono la rete di sicurezza su `rotte.js`
(ogni indirizzo generato dev'essere rileggibile come la pagina che è, in tutte e due le
lingue), su `clip()` in `seo.js`, sugli aiutanti di `siteData`, sulla geometria del libro
e sulla **parità fra le due lingue** di `i18n.js`.

Quest'ultimo merita una riga, perché protegge da un guasto che non somiglia a un guasto
di traduzione. `testi(lang)` restituisce l'oggetto della lingua e basta: non ripiega
sull'italiano voce per voce. Una chiave dimenticata in `en` non è quindi una scritta
italiana in una pagina inglese — è `undefined`, e trenta di quelle voci sono funzioni.
`T.archivio.conteggio(n)` su `undefined` lancia in pieno render: **pagina bianca**. Il
test confronta l'intera forma dei due alberi (chiavi, tipi, numero di argomenti,
lunghezza degli elenchi) e dice quale voce manca e dove.

⚠️ **`npm run preview` va usato con lo slash finale** (`/progetto/anelli/`, non
`/progetto/anelli`): senza, Vite fa il fallback SPA e serve la home al posto
della pagina pre-renderizzata, con conseguenti falsi errori di hydration in
console. Netlify risolve le directory da sé e non ha il problema.

`npm run build` fa tre cose in sequenza: `vite build` (bundle client) → `vite build --ssr`
(bundle server in `dist-ssr/`) → `node scripts/prerender.js` (scrive gli HTML statici + sitemap + robots).

## Architettura

### Routing (`src/router.jsx`)
URL reali, non hash. Ogni pagina esiste in due indirizzi, uno per lingua:

| Rotta     | Italiano                  | Inglese                    |
| --------- | ------------------------- | -------------------------- |
| home      | `/`                       | `/en`                      |
| about     | `/chi-sono`               | `/en/about`                |
| archivio  | `/archivio`               | `/en/archive`              |
| area      | `/archivio/<area>`        | `/en/archive/<area>`       |
| scheda    | `/progetto/<slug>`        | `/en/project/<slug>`       |
| privacy   | `/privacy`                | `/en/privacy`              |

Gli slug di area (`product-design`, `graphic-design`), di progetto e `privacy` **non** si
traducono: sono nomi propri e tradurli spezzerebbe i link già in giro. Area o slug
sconosciuti → 404.

Il calcolo degli indirizzi (`SEGMENTI`, `percorso`, `percorsoTradotto`, `parsePath`) sta in
**`src/rotte.js`, che non importa React**; `src/router.jsx` tiene la parte React — contesto,
`navigate`, `<Link>` — e riesporta le tre funzioni, quindi `import … from './router'`
continua a funzionare. Lo split serve a `seo.js`, agli script node e ai test, che di React
non hanno bisogno. In quei due file le estensioni `.js` degli import sono esplicite perché
li legge anche Node, che senza non risolve.

`parsePath()` restituisce anche `lang`; `App.jsx` legge la rotta con `useRoute()` e monta
la pagina giusta. Funziona sia nel browser sia in SSR (in build) tramite `RouterProvider`
con `initialPath`.

**Per costruire un link usa sempre `percorso(nome, params, lang)`** (da `router.jsx`),
mai una stringa scritta a mano: è l'unico punto che sa come si chiamano i segmenti in
ogni lingua. `percorsoTradotto(route, lang)` dà la gemella della pagina aperta — la usano
il selettore in navbar e gli hreflang.

### Lingue (`src/i18n.js` + `src/data/contenutiEn.js`)
La lingua **sta nell'URL**, non in uno stato del browser: una pagina inglese dev'essere
indicizzabile, condivisibile e apribile a freddo come quella italiana.

- `src/i18n.js` — i testi dell'**interfaccia** nelle due lingue (menù, etichette, frecce,
  404, aria-label, alt delle foto, titoli e descrizioni SEO). Non importa niente, così lo
  usano sia i componenti sia `seo.js` sia gli script node. `testi(lang)` restituisce il
  blocco giusto.
- `src/data/contenutiEn.js` — i **contenuti** in inglese: profilo, bio, aree e, per slug,
  `cat`/`desc`/`spec` di ogni progetto. `siteData.js` resta la fonte di verità: qui ci
  sono solo i campi che cambiano lingua.
- In `siteData.js` gli accessori `archivioIn(lang)`, `areeIn(lang)`, `progettiAreaIn()`,
  `profiloIn()`, `aboutIn()`, `focusItemsIn()`, `areaPerSlugIn()` danno la versione giusta
  (calcolata una volta sola, quindi l'oggetto è sempre lo stesso e React non rimonta).
- Nei componenti: `const lang = useLang()` e `const T = testi(lang)`.
- Le chiavi della tabella di scheda cambiano con la lingua (`Oggetto` → `Object`) perché
  stanno dentro `spec`: la scheda non traduce nulla, mostra quello che riceve.
- **Un progetto nuovo senza voce in `contenutiEn.js` resta in italiano dentro il sito
  inglese**: aggiungere la traduzione fa parte dell'inserimento di un progetto.

### Anteprime social e icona — file già pronti, NON si rigenerano a ogni build
Due script si lanciano **a mano** e salvano il risultato dentro `public/`, come le altre immagini:

```bash
node scripts/og-image.js   # public/images/og/*.jpg — anteprime dei link (1200×630)
node scripts/favicon.js    # favicon.ico/.svg, apple-touch-icon, icon-192/512, site.webmanifest
```

- **`og-image.js` va rilanciato dopo aver aggiunto un progetto o cambiato una copertina**,
  altrimenti la scheda nuova punta a un JPEG che non esiste. È l'unico passo manuale
  quando cresce l'archivio.
- Genera **due serie**: le italiane in `public/images/og/`, le inglesi in
  `public/images/og/en/`. Il testo dell'anteprima è quello della pagina, quindi un link
  inglese condiviso non può mostrare un riquadro che dice "Archivio".
- Le anteprime sono in **JPEG e non in WebP**: LinkedIn e WhatsApp non mostrano le WebP,
  e il link condiviso uscirebbe senza immagine. Non ricondurle al WebP del sito.
- `favicon.js` serve solo se cambia il marchio.

### Pre-rendering / SEO (`scripts/prerender.js` + `src/seo.js` + `src/entry-server.jsx`)
Ogni rotta viene renderizzata in un **HTML statico già completo** (es. `dist/progetto/flue/index.html`),
con title, meta description, author, Open Graph, Twitter card e JSON-LD schema.org **per pagina**.
Le rotte sono generate in **entrambe le lingue** (66 pagine): ogni HTML porta il proprio
`<html lang>`, il proprio `og:locale` e i `hreflang` verso la gemella e verso `x-default`
(l'italiano). Le 404 sono due, `dist/404.html` e `dist/en/404.html`, e `netlify.toml`
serve la seconda a chi sbaglia un indirizzo sotto `/en`.
Vengono generati anche `sitemap.xml` (con gli `xhtml:link` di traduzione per ogni URL) e
`robots.txt`. Google e le anteprime dei link vedono
il contenuto senza eseguire JS. Nel browser React si "aggancia" via hydration (`src/main.jsx`).

`src/seo.js` è il posto dei metadati: title/description/immagine per rotta, l'elenco
delle rotte da generare, **i dati strutturati** e **le immagini da mettere in sitemap**.
`prerender.js` non decide niente, li serializza soltanto.

**Dati strutturati** — un `@graph` per pagina, non frammenti sciolti. Sito e persona
hanno un `@id` fisso (`#sito`, `#persona`) e le altre entità li richiamano invece di
ridescriverli: così tutte le schede risultano di *una* persona, non di 25 omonimi.
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
  `progettiAreaIn(chiave, lang)` filtra (**sempre questo**: la variante senza `lang`
  è stata tolta perché restituiva l'archivio italiano anche dentro il sito inglese),
  `areaPerSlug(slug)` risolve l'URL — gli slug non si traducono, quindi non ha `lang`
- `manifestoFoto` — la foto di Joe con la lampada DADO accesa, in home sotto il
  manifesto (`profile.manifesto`): la fascia scura che chiude la pagina prima del
  nastro delle skills. Stava in fondo a "Chi sono", sotto la stessa frase, ed è
  passata in home con essa; `scripts/og-image.js` la usa ancora per l'anteprima
  social di "Chi sono", che è comunque un ritratto di Joe
- `familyBand` — la foto della famiglia di prodotti. **Non è più in pagina**: al suo
  posto, in home, sono tornati il manifesto e la foto qui sopra. Resta la sorgente
  delle anteprime social dell'archivio (`scripts/og-image.js`), che è la pagina dove
  quei prodotti si guardano davvero, quindi il file non si cancella e `verifica.js`
  continua a pretenderlo. Non avendo più un alt da mostrare, non ha una gemella
  inglese. Il ticker "Skills" in home riusa `about.skills`
- `projectImages(item)` — costruisce i percorsi immagine di un progetto
- `video` (facoltativo, per progetto) — id di uno Short YouTube: il reel apre il
  carosello e parte da solo. Vuole `video.webp` accanto alle foto, vedi sotto
- `titoloLeggibile(t)` — i titoli sono scritti in maiuscolo e il CSS li mostra così;
  fuori dal markup (alt, `<title>`, dati strutturati) serve la forma leggibile.
  Maiuscola solo all'iniziale, come l'italiano vuole
- `altCopertina/altGalleria/altDisegno/altSfondo` — i testi alternativi, usati sia
  dalle pagine sia dalla sitemap immagini: una foto si descrive in un posto solo

## ⚠️ Regole da rispettare (per non rompere SEO/pre-rendering)

1. **Link interni** → usa `<Link to={percorso('archive', {}, lang)}>` da `src/router.jsx`,
   MAI `<a href>` né un percorso scritto a mano: un `/archivio` fisso dentro il sito
   inglese butta fuori dalla lingua. Per mailto/tel/URL esterni/`#` va bene `<a>`
   (o `Link`, che li gestisce come anchor normali).
   Nessun testo visibile scritto nel markup: sta in `src/i18n.js`, letto con `testi(lang)`.
2. **Niente `fetch`/API a runtime** per contenuti che devono essere indicizzati: tienili in `siteData.js`.
   Il pre-rendering "fotografa" ciò che è nei dati statici.
3. **Nuovo progetto** = aggiungi una voce in `archive` (e le immagini nella sua cartella;
   se è grafica, `area: 'graphic'`), **più la traduzione in `src/data/contenutiEn.js`**,
   poi lancia `node scripts/og-image.js` per l'anteprima social. Se il progetto ha un
   reel, aggiungi `video: '<id>'` e lancia `node scripts/video-poster.js <slug> <id>`;
   se ha un filmato orizzontale, `filmato: '<id>'` e lo stesso script con
   `--orizzontale`, poi `varianti-foto.js` (vedi "Video"). Pre-rendering, sitemap e meta
   tag si aggiornano da soli.
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

  (segmentazione AI → WebP con canale alpha, e **maschera netta**: la soglia toglie
  l'alone semitrasparente che la segmentazione lascia sui bordi morbidi, senza il quale
  un testo dietro il ritaglio traspare). ⚠️ La libreria
  `@imgly/background-removal-node` **non è in `package.json`**: pesa 174 MB e Netlify
  la scaricherebbe a ogni build senza che serva al sito. Va installata solo quando serve
  davvero, senza salvarla: `npm i --no-save @imgly/background-removal-node`.

- Per **scontornare un tratto su fondo bianco** (firme, schizzi, scansioni: il fondo
  diventa trasparente e il tratto prende il nero `ink` del sito):

  ```bash
  node scripts/ink-alpha.js "<sorgente>" public/images/<dest>.webp [larghezzaMax] [colore]
  ```

  (solo `sharp`, nessuna dipendenza extra).

## Video (i reel e i filmati di YouTube)

Due formati, due posti, due comportamenti. Il **reel** verticale (`video`) apre il
carosello e con il consenso parte da solo; il **filmato** orizzontale (`filmato`) sta in
una fascia in fondo alla scheda e parte solo premendo play. Un progetto può avere l'uno,
l'altro o tutti e due. Il player è lo stesso componente (`VideoYouTube.jsx`), che di
formati non sa niente: riempie il riquadro che trova.

### Il reel verticale (`video`)

Un progetto che ha un reel porta `video: '<id>'` in `siteData` — solo l'id, la coda di
`youtube.com/shorts/<id>` — e il filmato **apre il carosello e parte da solo**, non è una
sezione a sé: il verticale è l'unico formato non quadrato della pagina e in una sezione
propria lasciava mezza griglia vuota. Nella cornice quadrata si mostra intero su fondo
`night`, che è il modo in cui i reel si guardano.

**Ma solo con il consenso.** Senza risposta al banner, o con un "no", non parte niente e
non si contatta nessuno: resta la miniatura del sito col tasto play, e premerlo vale come
consenso per quel singolo video. Il banner decide se un video possa partire **da solo**,
non se si possa guardare.

**Parte muto, e non può essere altrimenti**: Chrome, Safari e Firefox bloccano l'autoplay
con audio, quindi senza `mute=1` il player resterebbe fermo sul primo fotogramma. Già che
è muto cicla (`loop=1` + `playlist=<id>`, che YouTube pretende in coppia). Premuto a mano
invece parte con il sonoro. Parte **dopo il `load`** della pagina, non insieme: il player
pesa quasi un megabyte e toglierebbe banda alla prima immagine. E parte **una volta
sola** per apertura di scheda — `avviatoDaSolo` in `Carousel.jsx` — o a ogni giro del
carosello ricomincerebbe da capo.

Con l'autoplay lo scorrimento automatico resta fermo finché il reel è in riproduzione:
scivolare via da un video che sta giocando è peggio che aspettare. Le foto partono quando
chi guarda passa avanti con freccia, pallino o dito.

**Col player montato le frecce del carosello restano visibili, anche sul telefono.**
L'iframe è di un altro dominio: il dito che scorre sopra il video non arriva mai al
carosello, quindi lo swipe — l'unico modo di cambiare slide sotto `sm`, dove le frecce
sono nascoste — lì non funziona. Sommato al `loop`, che tiene il reel in riproduzione
all'infinito e con esso fermo lo scorrimento automatico, il risultato era una scheda in
cui dal telefono non si arrivava più alle foto. `frecceFisse` in `Carousel.jsx` tiene le
frecce in vista finché `videoAttivo`; toglierlo rimette la trappola.

Lo scorrimento automatico prosegue come sulle foto, ma su quella slide aspetta 6 secondi
invece di 2: a due il tasto play non è colpibile. Premendolo il carosello si ferma —
senza toccare `paused`, che resta la scelta di chi guarda — e riparte da sé uscendo dalla
slide. Lo Short **non** parte da solo: sarebbe l'iframe caricato a ogni apertura di
scheda, cioè il contrario di quello che si legge qui sotto.

La miniatura si genera una volta sola e vive nel sito come le altre immagini:

```bash
node scripts/video-poster.js <slug> <idVideo>   # → products/<slug>/video.webp
```

Prende `oardefault.jpg`, l'unica misura in cui YouTube conserva il fotogramma verticale
(1080×1920): le altre sono 16:9 e nella cornice 9:16 tornerebbero con le bande.

### Il filmato orizzontale (`filmato`)

`filmato: '<id>'` — l'id di un video normale, la coda di `?v=<id>` — mette una **fascia
16:9 in fondo alla scheda, sopra lo sfondo** (`components/FilmatoProgetto.jsx`). È la
gemella della fascia dello sfondo: stesso filetto, stessa colonna, nessuna scritta in
mezzo. Sono le due chiusure della pagina, e una cornice diversa le farebbe sembrare di
due pagine diverse. Ce l'hanno **`dog-lamp`** e **`zeta-3`**.

Non sta nel carosello, e non per distrazione: un 16:9 nella cornice quadrata tornerebbe
con due bande, ed è un video da guardare per intero, non una slide fra le altre.

⚠️ **Parte solo premendo play, anche quando il consenso è stato dato** — è l'unica cosa
in cui si comporta diversamente dal reel, ed è voluta: quaggiù si arriva scorrendo, e un
video che parte da solo sotto la piega giocherebbe senza che nessuno lo veda, dopo aver
contattato Google per farlo. Per questo `FilmatoProgetto` non legge `useConsensoVideo`:
non ha una partenza automatica da autorizzare. Premere play vale come consenso per quel
filmato soltanto, esattamente come sul reel.

Ed è anche il motivo per cui **l'informativa privacy non è stata toccata**: dice quando
YouTube viene contattato — col consenso, o premendo play — e resta vera parola per
parola. Dare l'autoplay a questa fascia vorrebbe dire riscriverla.

La miniatura è la stessa faccenda del reel, con il fotogramma dell'altro formato:

```bash
node scripts/video-poster.js <slug> <idVideo> --orizzontale   # → products/<slug>/filmato.webp
```

Prende `maxresdefault.jpg` (1280×720). Uscendo sopra i 900px vuole anche
`node scripts/varianti-foto.js` per la variante da 800, che il reel a 720 non ha.

### L'iframe

**L'iframe di YouTube non va messo direttamente nella pagina.** `VideoYouTube.jsx` mostra
il player solo dopo il click; finché non si preme, in pagina c'è una figura del sito.
Sono due i motivi, e valgono entrambi: l'iframe pesa quasi un megabyte su una scheda che
serve WebP da 60 KB, e piazza identificatori nel browser all'apertura della pagina — il
che obbligherebbe a un banner di consenso (vedi "Privacy"). Il pre-rendering fotografa la
miniatura, quindi nell'HTML statico non finisce nessun iframe: è una cosa da
ricontrollare se si tocca il componente, e si vede con `grep iframe dist/progetto/*/index.html`.

## Etichette AI (AI Act)

Diversi render e ambientazioni dell'archivio sono fatti — in tutto o in parte — con
l'intelligenza artificiale, e l'art. 50 del regolamento europeo chiede che si vedano come
tali. Ogni immagine interessata porta sopra il marchio standard **AI GENERATED** o
**AI MODIFIED** (`components/EtichettaAI.jsx`), in basso a sinistra.

Riguarda le immagini della **scheda progetto**: le slide del carosello e lo `sfondo.webp`
in fondo alla pagina. Non le copertine della griglia d'archivio e della home, che sono
anteprime: chi apre la scheda trova la dichiarazione sulla foto grande.

Quali immagini lo siano si dichiara **in `siteData.js`**, sul progetto, nel campo `ai`:

```js
ai: { generate: [1, 3, 5], modificate: [2, 4], sfondo: 'generata' },
ai: { generate: 'tutte', sfondo: 'generata' },   // quando lo sono tutte
```

`generate`/`modificate` elencano i **numeri delle foto di galleria** (1 = `01.webp`), non
le slide del carosello: dove c'è un reel, quello è la prima slide ma non è una foto.
`sfondo` vale `'generata'` o `'modificata'`. Quello che non è elencato non porta
etichetta, quindi **il silenzio dichiara che la foto è vera**: un progetto nuovo con
immagini di sintesi va dichiarato qui, o esce senza. `aiFoto(item, n)` in `siteData.js`
risolve il campo, `ProjectDetail` lo passa alle slide.

Il marchio sta in `public/images/etichette/` (`ai-generata.svg`, `ai-modificata.svg`).
Sono i file del kit ufficiale, con due sole modifiche: il `viewBox` ritagliato sulla
pastiglia — così la posizione la decide il CSS e non il margine incorporato nel file — e
la pastiglia ritinta con l'`ink` del sito all'85%, la stessa del contatore del carosello.
Due targhette diverse sulla stessa foto sarebbero due voci. La scritta dentro è disegnata
e in inglese: la frase per intero, e nella lingua della pagina, la dà l'`alt` (`ai` in
`src/i18n.js`).

## Da telefono

Il sito si guarda soprattutto sul telefono, e le pagine sono verificate a 320, 360, 390 e
430px: nessuna sborda in orizzontale e ogni comando si prende col dito.

**Bersagli da 24px.** Le icone social sono venti pixel, le due lingue in navbar larghe due
caratteri, i pallini del carosello sei: col dito non si prendono. L'area sensibile si
allarga con uno pseudo-elemento — `relative` sul comando e
`before:absolute before:-inset-… before:content-['']` — e **non** con il padding: il
padding sposta il testo, e dove c'è una sottolineatura ancorata al fondo (navbar, footer)
la farebbe scendere sotto lo spazio vuoto. Il disegno resta identico, cresce solo quello
che si tocca.

Due aree allargate non devono accavallarsi: nella striscia in comune il tocco finisce
sempre sull'ultimo elemento del DOM, che è quasi sempre quello sbagliato. Dove capitava è
cresciuto lo stacco invece dell'area — i pallini del carosello stanno a 20px l'uno
dall'altro, "Privacy" e "Torna su" a 16 — quindi **cambiando quegli stacchi va rifatto il
conto**, non solo guardata la pagina.

**La barra sotto `sm`** non porta il nome (lo dice già il marchio) e mette Instagram in
fondo alla riga, prima delle lingue. Il gruppo di destra è `contents`, quindi menù,
Instagram e lingue sono figli diretti della barra e `justify-between` li distribuisce da
solo: senza, restava un buco dopo il marchio e tutto il resto ammassato contro il bordo.

**Lo sketchbook è diviso in tre file**, e la regola per non rimescolarli è che
`geometria` non sa che esiste una scena, `scena` non sa che esiste un dito, e in
`Sketchbook.jsx` non si scrive mai `new THREE.…`:

| File | Cosa fa |
| --- | --- |
| `about/libro/geometria.js` | dove finiscono i vertici di una pagina piegata. Niente React, niente Three, niente DOM — e dei test in `tests/geometria.test.js` che ne fissano gli invarianti fisici (il bordo libero torna sul piano, la carta non si allunga, la cerniera non si muove) |
| `about/libro/scena.js` | renderer, camera, luci, ombre, tavole come texture, e `smaltisci()`. È la parte che alloca memoria video, che nessuno libera al posto suo |
| `about/Sketchbook.jsx` | stato, trascinamento, molle di Anime.js, markup |

⚠️ I test di `geometria.js` non verificano dei numeri, verificano delle **proprietà**:
fissare i numeri fisserebbe anche gli errori. Cambiando la formula della piega, i test
che devono continuare a passare sono quelli — se uno cade, la pagina ha smesso di
comportarsi come carta.

**Lo sketchbook sul telefono gira con un terzo del lavoro.** La scena è la stessa, ma
quattro misure si abbassano quando `pointer: coarse` (una GPU da telefono, non una
finestra stretta), e sono tutte in testa a `libro/scena.js`:

| | mouse | dito |
| --- | --- | --- |
| mappa d'ombra | 2048² PCF morbido | 1024² PCF |
| rapporto pixel del canvas | fino a 2 | 1.5 |
| anisotropia delle tavole | 16 | 4 |
| tavole | `NN.webp`, 1000px | `NN-mezza.webp`, 500px |

La mappa d'ombra è un secondo render dell'intera scena a ogni fotogramma, e a 2048² sono
quattro milioni di texel per un libro che sullo schermo ne occupa settantamila. Le tavole
grandi sono nove texture da 1000×1415: **una cinquantina di megabyte di memoria video**,
che su un telefono si paga in scatti — le mezze ne occupano tredici e pesano un terzo da
scaricare. In tutto il lavoro per fotogramma passa da ~4,9 a ~1,5 milioni di pixel.

Le due misure delle tavole le produce `scripts/sketchbook-pages.js` in un colpo solo:
rigenerandole, **escono sempre in coppia**, e `tavolaPer()` sceglie quale caricare. Anche
la copertina di scorta nel markup passa dalla mezza, con un `<source media="(pointer:
coarse)">`.

**Lo sketchbook** ha il riquadro quadrato sotto `sm` e panoramico sopra, e la camera
inquadra quello che c'è: una pagina sola a libro chiuso, due da aperto (`inquadra()` in
`Sketchbook.jsx`, chiamata a ogni frame da `posizionaLibro` e dopo ogni resize). Prima era
ferma sulla doppia pagina: la copertina chiusa stava nella metà destra e sul telefono
sembrava un elemento messo storto. Lo zoom lo detta il lato più stretto, quindi il
riquadro quadrato è ciò che permette alla copertina di crescere davvero — cambiando il
formato del riquadro cambia di conseguenza quanto il libro si vede.

Il ritratto di "Chi sono" (`about/joe-hero.webp`) è ritagliato **attorno alla figura**,
con appena un margine di respiro. Con un quinto di trasparente per lato, sul telefono —
dove riempie la colonna per intero — la figura resterebbe piccola in mezzo a due bande
vuote. Un ritaglio nuovo va rifatto così, e `width`/`height` in `About.jsx` aggiornati
con esso.

⚠️ **Il ritaglio non passa più sopra il titolo** — la testata si ferma prima della figura
(vedi qui sotto) — ma la **maschera netta** di `remove-bg.js` resta quella giusta e non va
tolta: la segmentazione lascia il soggetto opaco al 90% e ne sfuma i bordi morbidi su
decine di pixel, e il giorno in cui qualcosa tornasse a passare dietro la figura si
leggerebbe in filigrana attraverso la manica. Era il guasto di prima, quando il titolo ci
finiva sotto apposta.

⚠️ Da `md` quel ritratto sta **fuori dal flusso** (`md:absolute` sull'`img`), e non è un
vezzo: in colonna, `h-full` è una percentuale che al momento di misurare la riga non ha
ancora un riferimento, e il browser ripiega sulle proporzioni vere del file — la sezione
diventava alta quanto la foto invece che quanto lo schermo. **È una trappola che scatta
cambiando immagine, non codice.**

⚠️ La foto è **larga** una frazione della finestra (`md:w-[46vw]`), non **alta** una
frazione della sezione: legata all'altezza, su una finestra bassa e larga la figura si
allargava fin dentro il titolo. Ed è in `vw` e non in `%` perché fuori dal flusso la
percentuale si risolve sul riquadro intero della sezione mentre il margine del titolo si
risolve sulla colonna di testo: due basi diverse, e lo stacco fra i due si spostava a ogni
cambio di padding.

⚠️ **Testo e figura NON si sovrappongono, e lo stacco è calcolato, non tarato a occhio.**
Titolo e ritratto sono appesi alla stessa misura — `--figura`, cioè `min(46vw, (100svh -
4rem) * PROPORZIONE_RITRATTO)`: la larghezza con cui `object-contain` disegna DAVVERO il
ritaglio. Il margine destro del titolo è quella misura **più** quanto la riga piccola
sporge oltre quella grande (`SPORGENZA`, in em sul corpo del titolo) **più** il respiro
fisso `STACCO`: si misura dalla coda della frase, che è il bordo destro vero della
testata, non dal riquadro del titolo. Da `md` il titolo è appeso al **fondo** della
sezione (`mt-auto` + `--riga-bassa`), non centrato, perché al fondo ci sta anche la
figura. Le costanti stanno in testa a `About.jsx` con il perché di ciascuna.

Fino a settembre 2026 era il contrario: la coda finiva **sotto** la manica apposta
(`INCASTRO = 0.22`), ed era l'incastro della reference. Il cliente ha cambiato idea e ora
il testo non va mai sotto la foto. Chi rimettesse un margine col meno rimette la
sovrapposizione.

⚠️ Da `md` **anche il corpo del titolo esce da quel conto**: è il più piccolo fra quello
che sta nello spazio rimasto (la colonna meno la figura e meno lo stacco), la vecchia
frazione della colonna e il tetto in pixel. Senza il primo dei tre, sotto i ~1700px la
testata sbatte contro il bordo sinistro, `ml-auto` non ha più margine da distribuire e la
coda si allunga sotto la figura da sola — cioè torna la sovrapposizione, e per giunta
dipendente dalla misura della finestra.

Prima erano due frazioni indipendenti della finestra — `46vw` per la foto, `39vw` per il
titolo — e si sfioravano per caso: con `object-contain` la foto si rimpicciolisce quando a
limitare è l'altezza, e la distanza fra i due cambiava con **la sola altezza della
finestra**. Misurato su una trentina di formati fra 768 e 3440px, adesso fra la coda della
frase e il bordo del ritratto restano sempre almeno 38px, e la frase si legge per intero
in tutte e due le lingue.

⚠️ Due conseguenze che si rompono in silenzio: `PROPORZIONE_RITRATTO` sono le proporzioni
di `joe-hero.webp` (1200×1364) e **va rifatta cambiando ritaglio**; e la foto è alta
`--figura-riquadro` e non `h-full`, perché da `md` la testata può essere più bassa della
finestra — su una finestra alta e stretta si accorcia fino alla figura invece di lasciare
mezzo schermo vuoto sopra a un titolo schiacciato in fondo.

## Design system (`tailwind.config.js`)

Palette "carta / inchiostro":

| Token         | Colore    | Uso                     |
| ------------- | --------- | ----------------------- |
| `paper`       | `#f4f3f1` | sfondo principale       |
| `ink`         | `#14110f` | testo / nero caldo      |
| `muted`       | `#6f6b67` | testo secondario **su fondo chiaro** |
| `night-soft`  | `#c8c4bf` | testo secondario **su fondo notte** |
| `line`        | `#d7d4cf` | bordi                   |
| `line-soft`   | `#e4e1dd` | bordi molto chiari      |
| `placeholder` | `#e9e7e3` | sfondo immagini         |
| `hover`       | `#ececE8` | hover celle             |
| `night`       | `#0a0908` | sfondo footer           |

⚠️ **`muted` e `night-soft` sono lo stesso ruolo su fondi opposti, e non si scambiano.**
`muted` finisce quasi sempre su corpi da 10 a 13 pixel, dove la WCAG AA chiede 4.5:1: sulla
carta ne fa 4.76, sul `night` del footer scenderebbe a 3.77. `night-soft` fa l'opposto
(11.47 sul nero, 1.56 sulla carta). Dentro `bg-night` — cioè nel footer — il testo
secondario è `night-soft`. Cambiando uno dei due valori, il rapporto va **ricalcolato**,
non guardato a occhio.

- Font: **Helvetica Neue / Helvetica / Arial** (`font-sans`)
- Animazione d'ingresso pagina: classe `animate-viewIn`
- Padding orizzontale standard delle sezioni: `px-5 sm:px-8 lg:px-[72px]`
- Titoli grandi fluidi con `text-[clamp(...)]`, uppercase, `tracking` stretto

## Struttura file

```
src/
├── main.jsx              # entry: hydration (o mount in dev)
├── App.jsx               # layout: Navbar + pagina corrente + Footer
├── rotte.js              # indirizzi e lettura degli URL (niente React: la usano seo, node, i test)
├── router.jsx            # routing History API + <Link> + useRoute/useLang + ripristino scroll
├── consenso.js           # la scelta sui video di YouTube (localStorage + hook)
├── seo.js                # meta per rotta + elenco rotte (usato dal pre-rendering)
├── i18n.js               # testi dell'interfaccia nelle due lingue (it/en)
├── entry-server.jsx      # render(path) per la build SSR (mai spedito al browser)
├── index.css             # Tailwind + stili base
├── data/siteData.js      # TUTTI i contenuti (fonte di verità)
├── data/contenutiEn.js   # i campi che cambiano lingua: versione inglese
├── data/fotoFit.js       # generato: come ogni foto entra nel carosello
├── components/
│   ├── Navbar.jsx        # nav sticky (Home · Archivio · Chi sono) + selettore IT/EN
│   │                     #   sotto sm cade il nome, Instagram passa prima delle lingue
│   │                     #   e il gruppo di destra è `contents`: menù, IG e lingue
│   │                     #   diventano figli della barra e si distribuiscono da soli
│   ├── Footer.jsx        # fa anche da pagina contatti
│   ├── Carousel.jsx      # carosello scheda progetto (autoplay + controlli)
│   ├── BannerPrivacy.jsx # banner cookie e privacy (in App, su tutte le pagine)
│   ├── VideoYouTube.jsx  # il player: iframe nocookie + tasto play, per tutti e due i video
│   ├── FilmatoProgetto.jsx # fascia 16:9 in fondo alla scheda: parte SOLO col play
│   ├── EtichettaAI.jsx   # marchio AI GENERATED / AI MODIFIED sulle immagini di sintesi
│   ├── ErrorBoundary.jsx # rete di sicurezza attorno alla pagina corrente
│   ├── FloatingMailButton.jsx
│   ├── about/
│   │   ├── Sketchbook.jsx  # libro sfogliabile 3D: stato, trascinamento, molle, markup
│   │   └── libro/
│   │       ├── geometria.js  # la forma della piega — matematica pura, ha dei test
│   │       └── scena.js      # Three.js: renderer, camera, luci, texture, smaltimento
│   └── home/             # sezioni homepage: Hero, SelectedWorks,
│                         #   Manifesto (frase + foto di Joe), SkillsTicker
└── pages/
    ├── Home.jsx
    ├── About.jsx         # "Chi sono": testata col ritratto, bio, sketchbook
    │                     #   e la tavola di schizzi
    ├── Archive.jsx       # griglia di tutti i progetti
    ├── Privacy.jsx       # informativa privacy (testo in i18n.js)
    └── ProjectDetail.jsx # scheda singola con galleria + prev/next

tests/                   # node:test, nessuna dipendenza — `npm test`
├── rotte.test.js        # indirizzi, lingue, 404, round-trip percorso↔parsePath
├── seo.test.js          # clip(): il taglio delle meta description
├── dati.test.js         # titoloLeggibile, aiFoto (etichette AI Act), periodoDi
├── geometria.test.js    # la piega del libro dello sketchbook
└── i18n.test.js         # parità it/en: chiavi, tipi, argomenti, lunghezze

.github/workflows/
└── verifica.yml         # CI: lint + test + verifica + build a ogni push e PR su main

scripts/
├── verifica.js          # dati ↔ file su disco (gira da solo prima di `npm run build`)
├── controlla-hydration.js # carica le 66 pagine e verifica l'aggancio di React (a mano)
├── prerender.js         # pre-rendering + sitemap + robots (parte di `npm run build`)
├── og-image.js          # anteprime social 1200×630 → public/images/og/ (a mano)
├── favicon.js           # icona del sito in tutti i formati → public/ (a mano)
├── pdf-disegno.js       # disegni tecnici dall'archivio PDF → products/<slug>/disegno.webp (a mano)
├── video-poster.js      # miniatura di un video YouTube (a mano): video.webp dal reel,
│                        #   filmato.webp col flag --orizzontale
│                        #   (fit-foto.js li salta: il fit lo decidono i loro riquadri)
├── comprimi-foto.js     # riduce a 1600px e ricomprime public/images/ (a mano)
├── fit-foto.js          # come ogni foto entra nel carosello → src/data/fotoFit.js (a mano)
├── optimize-image.js    # jpg/png → webp ottimizzato (per le foto da media/)
├── remove-bg.js         # ritaglio soggetto → webp con trasparenza (segmentazione AI)
└── ink-alpha.js         # tratto su fondo bianco → webp con alpha (firme, scansioni)
```

## Privacy

Il testo dell'informativa sta in `src/i18n.js` (blocco `privacy`, due lingue), come la
404: è un testo di servizio, non un contenuto del portfolio. Descrive il sito **com'è
oggi** — statico, senza cookie propri, senza statistiche, e con i video di YouTube che si
caricano **solo dopo un consenso**. Il testo è allineato al codice.

Il consenso si dà in due modi, ed è la stessa cosa detta due volte: rispondendo al banner
(`components/BannerPrivacy.jsx`, montato in `App.jsx` e quindi presente su tutte le pagine
finché non si risponde — la domanda va fatta all'ingresso, in home, non quando si è già
dentro una scheda col reel pronto a partire), oppure premendo play su un singolo filmato.

Il banner è intestato «Cookie e privacy» e dice il quadro intero: che cookie propri non ce
ne sono, che non si misura niente, e che l'unica cosa che un consenso lo richiede davvero
è il reel. Non scrivere mai «usiamo i cookie per migliorare l'esperienza»: su questo sito
sarebbe falso, ed è la ragione per cui il banner esiste.

È una fascia in fondo alla pagina, allineata al passo orizzontale delle sezioni — il sito
è fatto di righe da bordo a bordo, e un riquadro appoggiato in un angolo ci sta come un
adesivo. Il testo è diviso in `testo` (la frase che apre) e `dettaglio` (il corpo in tono
minore): è la gerarchia occhiello/corpo usata ovunque nel sito, e regge meglio di un
paragrafo unico. Si ritira dalla sezione «La scelta
sui video» dell'informativa: darlo senza poterlo togliere non sarebbe un consenso.

⚠️ **«Rifiuta» e «Accetta» sono disegnati identici** — stesso filetto, stesso corpo, stessa
larghezza minima — e non per estetica: un «accetta» nero pieno accanto a un «rifiuta» in
punta di filo è il modo consueto di far pendere la risposta da una parte, e un consenso
ottenuto così non è libero. Non rimetterci un tasto primario.

⚠️ **Finché la fascia è in pagina il tasto mail flottante sparisce.** La fascia è alta un
terzo di schermo su un telefono e il tasto le finiva sotto: chi lo cercava col dito
premeva «Accetta». Un consenso preso per sbaglio è peggio di un consenso non chiesto. Chi
è aperto e chi no lo dice `useBannerAperto()` in `src/consenso.js`, che è l'unico posto in
cui la condizione è scritta — vale sia per la fascia sia per il tasto.

⚠️ **L'informativa è scritta in italiano corrente, e nei suoi testi non ci sono trattini
lunghi.** Le sostanze legali ci sono tutte, con i loro riferimenti di articolo, ma dette
come le direbbe una persona: i titoli delle sezioni sono domande («Cosa raccoglie il
sito», «Chi altro li vede», «Cosa si può chiedere»), non formule da modulo. Riscrivendone
un pezzo, non tornare al lessico da generatore: è una pagina che qualcuno deve capire, non
un adempimento da esibire.

L'informativa copre le voci che un'informativa deve avere — titolare, dati raccolti,
modalità e misure di sicurezza (art. 32), cookie e statistiche, la scelta sui video,
finalità e base giuridica, destinatari e trasferimento fuori dallo SEE, tempi di
conservazione, diritti (artt. 15–22, termine di risposta dell'art. 12, opposizione al
legittimo interesse, reclamo al Garante), link esterni, modifiche. **Aggiungendo o
togliendo una sezione, va fatto in tutte e due le lingue e va spostato `aggiornato`.**

Da un generatore tipo iubenda si prende la *lista* delle voci, non le frasi: «noi e terze
parti selezionate utilizziamo cookie…» qui sarebbe falso, e il banner esiste proprio per
non dirlo. Le formule che invece servono davvero — che il consenso si può dare, negare e
ritirare liberamente, e che ritirarlo non tocca quello che è già successo (art. 7, par. 3)
— stanno nella sezione «La scelta sui video», e la revocabilità è ripetuta nel banner:
un banner che non dice che si può cambiare idea non è a norma.

La risposta sta in `localStorage` (`src/consenso.js`), non in un cookie: è una preferenza
tecnica che serve a NON caricare roba di terzi, non lascia il dispositivo e non riconosce
chi torna. L'informativa lo dice, perché salvare qualcosa nel browser senza dirlo è
esattamente ciò che non si vuole fare.

⚠️ Il banner si disegna **solo dopo l'hydration** (`useMontato`): l'HTML statico è uno per
tutti e non sa cosa si è già risposto, quindi metterlo lì lo farebbe lampeggiare a ogni
visita a chi ha già scelto. Senza JavaScript nessun video si carica, quindi non c'è nulla
da consentire e la sua assenza è corretta, non una mancanza.

Se un giorno si passasse a uno spezzone video **ospitato in proprio** (un `<video>` da
`public/`, nessun terzo coinvolto), il banner tornerebbe a non servire e l'informativa
andrebbe riscritta un'altra volta. Vale per ogni novità che tocchi i trattamenti — un'
analitica anche cookieless tipo Plausible, un modulo di contatto: si riscrivono «Cookie e
statistiche», «Perché, e con quale diritto», «Chi altro li vede» e «Link esterni», e
`aggiornato` con esse, PRIMA che entri in funzione.

Nell'informativa non compare la partita IVA: Joe non ce l'ha. Quando l'aprirà, va
aggiunta nella sezione «Titolare del trattamento».

## Tono dei testi

I testi delle pagine sono in **tono impersonale** (no prima persona "io", no terza
persona "Giovanni fa"): costruzioni con "si", passive o nominali. Es. «Product designer,
 di Reggio Emilia», «Si parte da un vincolo…». Mantenere questo registro ovunque.

## Controlli automatici e commit

**CI**: `.github/workflows/verifica.yml` gira a ogni push e a ogni pull request su `main`,
su Node 20 come `netlify.toml`. Fa `npm ci` → `lint` → `test` → `verifica` → `build`: gli
stessi comandi che si lanciano in locale, così se passa qui passa sul portatile e
viceversa. **Non** lancia `npm run hydration`, che vuole un Chromium e un paio di minuti:
quello resta un controllo da fare a mano dopo aver toccato qualcosa di sensibile
all'aggancio.

Se la CI si ferma, si legge quale dei cinque passi è rosso: sono separati apposta, per
non dover aprire il log della build per scoprire che era un test.

**Messaggi di commit**: descrivere *cosa cambia*, non che qualcosa è cambiato. Metà della
storia del progetto si chiama `chore: update`, il che rende `git bisect` inutile e
impossibile capire quando è entrata una regressione senza aprire ogni diff. D'ora in
avanti, prefisso e oggetto:

```
feat: etichette AI Act sulle slide del carosello
fix: lo scroll non si ripristinava chiudendo una scheda progetto
ref: Hero diviso in componente e dati
chore: aggiornate le anteprime social dopo i nuovi progetti
docs: CLAUDE.md, sezione immagini
```

Una riga sola basta; il corpo serve solo quando *perché* non si capisce dal codice — e in
questo progetto il perché sta quasi sempre nei commenti, che è il posto dove resta
leggibile.

**File dell'editor**: `.idea/`, `.vscode/` e `*.iml` sono in `.gitignore`. Erano
versionati per sbaglio e sono stati tolti dall'indice (restano sul disco di chi ci
lavora): non rimetterli.

## Deploy (Netlify)

- `netlify.toml`: build = `npm run build`, publish = `dist`.
- **Header di sicurezza**, tutti in `netlify.toml` e commentati lì: oltre a `nosniff`,
  `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy` ci sono
  `Strict-Transport-Security` (un anno, **senza `preload`**: quella è una porta che non si
  richiude, va scelta apposta) e una **CSP** che elenca per intero le origini ammesse.
  L'unico terzo è `https://www.youtube-nocookie.com` in `frame-src`. ⚠️ Aggiungendo una
  risorsa esterna — un font Google, un'analitica, un altro player — **va aggiunta anche
  alla CSP**, o il browser la blocca in silenzio. Per diagnosticare senza bloccare:
  rinominare l'header in `Content-Security-Policy-Report-Only`.
- **Dominio dinamico**: `SITE` in `src/seo.js` legge la env `URL` (che Netlify imposta al deploy),
  con fallback `https://joesarchiolla.com`, che è il dominio del sito (comprato su
  Cloudflare). Canonical/sitemap/OG/JSON-LD si adeguano da soli al dominio reale.
  Il fallback serve alle build fatte a mano, dove la env non c'è, e **deve combaciare con
  il dominio primario impostato su Netlify**: se là il primario diventasse `www`, va
  cambiato anche in `seo.js`. Per forzarlo in locale: `SITE_URL=https://altro.it npm run build`.

  ⚠️ **Il dominio è cotto dentro l'HTML al momento della build.** Cambiarlo su Netlify non
  riscrive le pagine già pubblicate: dopo aver impostato il dominio primario serve un
  «Trigger deploy → Clear cache and deploy site», o il sito risponde sul dominio nuovo
  mentre canonical, sitemap e anteprime social continuano a dire quello vecchio.

  DNS su Cloudflare, due CNAME verso `<nome-sito>.netlify.app` (apex e `www`), **nuvola
  grigia**: col proxy acceso Netlify non riesce a emettere il certificato, e con SSL/TLS
  in «Flexible» si finisce in un loop di redirect. Netlify ha già CDN e certificato suoi;
  Cloudflare resta registrar e DNS.

## Da fare (noto)

- Il sito è ancora in costruzione: aspettarsi nuove sezioni, contenuti e progetti.
- Le gallerie sono **complete** (cover + `01.webp…NN.webp`) per tutti tranne
  **`direzione-tolleranza`**, pubblicato con `senzaFoto: true` in attesa del manifesto:
  quando il file arriva, basta creare `public/images/products/direzione-tolleranza/`
  con `cover.webp` (più eventuali `01.webp…`), togliere `senzaFoto`, mettere il numero
  giusto in `photos` e rilanciare `fit-foto.js` e `og-image.js`.
- **IN-SICUREZZA** (manifesto per il Congresso UIL Ravenna 2026): l'immagine era in
  archivio ma il progetto non è mai stato descritto, quindi è rimasto fuori. Il file
  sta in `ARCHIVIO WEBP` e nella storia di git (era `products/grafica/06.webp`).
- Le traduzioni inglesi dei progetti sono una prima stesura: **da far rileggere a Joe**.
- Prima/subito dopo il primo deploy: registrare il sito su **Google Search Console** e
  inviare `/sitemap.xml`. Valutare un'analitica leggera (Plausible/Umami, senza cookie).
- **Dominio scelto: `joesarchiolla.com`** (Cloudflare). Restano da fare i passaggi su
  Netlify: aggiungerlo, metterlo primario, i CNAME su Cloudflare, e il redeploy con cache
  pulita perché l'HTML porti il dominio nuovo.

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
