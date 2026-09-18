# "Chi sono": sketchbook, testata col ritratto, card degli strumenti

Dettagli della pagina più delicata del sito. Le regole essenziali stanno in CLAUDE.md;
qui il perché di ogni misura, da leggere prima di toccare `About.jsx`,
`about/Sketchbook.jsx`, `about/book/` o `about/Skills.jsx`.

## Sketchbook

**Lo sketchbook è diviso in tre file**, e la regola per non rimescolarli è che
`geometry` non sa che esiste una scena, `scene` non sa che esiste un dito, e in
`Sketchbook.jsx` non si scrive mai `new THREE.…`:

| File | Cosa fa |
| --- | --- |
| `about/book/geometry.js` | dove finiscono i vertici di una pagina piegata. Niente React, niente Three, niente DOM — e dei test in `tests/geometry.test.js` che ne fissano gli invarianti fisici (il bordo libero torna sul piano, la carta non si allunga, la cerniera non si muove) |
| `about/book/scene.js` | renderer, camera, luci, ombre, tavole come texture, e `dispose()`. È la parte che alloca memoria video, che nessuno libera al posto suo |
| `about/Sketchbook.jsx` | stato, trascinamento, molle di Anime.js, markup |

⚠️ I test di `geometria.js` non verificano dei numeri, verificano delle **proprietà**:
fissare i numeri fisserebbe anche gli errori. Cambiando la formula della piega, i test
che devono continuare a passare sono quelli — se uno cade, la pagina ha smesso di
comportarsi come carta.

**Lo sketchbook sul telefono gira con un terzo del lavoro.** La scena è la stessa, ma
quattro misure si abbassano quando `pointer: coarse` (una GPU da telefono, non una
finestra stretta), e sono tutte in testa a `book/scene.js`:

| | mouse | dito |
| --- | --- | --- |
| mappa d'ombra | 2048² PCF morbido | 1024² PCF |
| rapporto pixel del canvas | fino a 2 | 1.5 |
| anisotropia delle tavole | 16 | 4 |
| tavole | `NN.webp`, 1000px | `NN-half.webp`, 500px |

La mappa d'ombra è un secondo render dell'intera scena a ogni fotogramma, e a 2048² sono
quattro milioni di texel per un libro che sullo schermo ne occupa settantamila. Le tavole
grandi sono nove texture da 1000×1415: **una cinquantina di megabyte di memoria video**,
che su un telefono si paga in scatti — le mezze ne occupano tredici e pesano un terzo da
scaricare. In tutto il lavoro per fotogramma passa da ~4,9 a ~1,5 milioni di pixel.

Le due misure delle tavole le produce `scripts/sketchbook-pages.js` in un colpo solo:
rigenerandole, **escono sempre in coppia**, e `plateFor()` sceglie quale caricare. Anche
la copertina di scorta nel markup passa dalla mezza, con un `<source media="(pointer:
coarse)">`.

**Lo sketchbook** ha il riquadro quadrato sotto `sm` e panoramico sopra, e la camera
inquadra quello che c'è: una pagina sola a libro chiuso, due da aperto (`fitCamera()` in
`Sketchbook.jsx`, chiamata a ogni frame da `positionBook` e dopo ogni resize). Prima era
ferma sulla doppia pagina: la copertina chiusa stava nella metà destra e sul telefono
sembrava un elemento messo storto. Lo zoom lo detta il lato più stretto, quindi il
riquadro quadrato è ciò che permette alla copertina di crescere davvero — cambiando il
formato del riquadro cambia di conseguenza quanto il libro si vede.

## Testata e ritratto

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

⚠️ **La testata entra da due parti, e la E di "Sono Joe" finisce dietro la manica.**
Il titolo arriva da sinistra, il ritratto da destra, sfalsati — keyframe in
`tailwind.config.js`, ritardi nel blocco `animation` lì accanto:

| | animazione | parte a | dura | da dove |
| --- | --- | --- | --- | --- |
| "Sono Joe" | `titleIn` | .2s | 1.25s | −32% della propria larghezza |
| "Product designer" | `roleIn` | .38s | 1.25s | −32%, un beat dopo la riga grande |
| ritratto | `photoIn` | .3s | 1.5s | +34%, più lento perché pesa di più |

Lo scostamento è in **frazione della propria larghezza**, non in pixel, così vale a ogni
formato.

⚠️ **Tre cose la tengono lontana dal movimento meccanico, e sono tutte e tre necessarie.**
Una corsa **lunga** (un terzo della larghezza: a 12% il movimento si legge come uno
scatto); una curva fatta quasi tutta di **decelerazione** (`cubic-bezier(.16,1,.3,1)`: le
cose si posano invece di fermarsi — dagli ultimi 400ms il titolo guadagna un pixel); e le
due righe **sfalsate fra loro**, non appese al riquadro del titolo che scorre intero.
Rimettere l'animazione sull'`h1` invece che sui due `span` fa tornare il blocco rigido.

Le tre partenze sono diverse apposta, e la pagina resta vuota per due decimi prima che
arrivi qualcosa. **L'opacità si chiude molto prima della corsa** (al 35% per il testo, al
20% per il ritratto): così le cose sono già tutte lì mentre stanno ancora rallentando, e
soprattutto il ritratto — che è l'immagine grande sopra la piega, cioè quella su cui si
misura l'LCP — risulta dipinto quasi da principio invece che alla fine della corsa.
Allungare quelle due percentuali fino al 100% fa sembrare tutto più lento e ritarda l'LCP.

Le traslazioni escono dal riquadro della sezione, di là e di qua; a contenerle è
l'`overflow-hidden` che la sezione ha già. Misurato a 320, 390, 430, 768, 1440 e 2560 e in
otto istanti lungo la sequenza: la pagina non sborda mai in orizzontale, nemmeno mentre si
muove. **Togliendo quell'`overflow-hidden` compare uno scorrimento laterale che a pagina
ferma non si vede**, quindi non lo si cerca guardando il risultato.

Chi ha chiesto meno animazioni (`prefers-reduced-motion`) trova tutto già a posto: la
composizione finale è identica al pixel, cambia solo se la si vede arrivare.

Titolo e ritratto sono appesi alla stessa misura — `--figure`, cioè `min(46vw, (100svh -
4rem) * PORTRAIT_RATIO)`: la larghezza con cui `object-contain` disegna DAVVERO il
ritaglio. Da `md` il titolo è appeso al **fondo** della sezione (`mt-auto` +
`--bottom-row`), non centrato, perché al fondo ci sta anche la figura. Le costanti stanno
in testa a `About.jsx`; il loro perché è in questa sezione.

Grandezza e posizione del titolo sono **due conti separati**, e va tenuto così:
- il **corpo** è il più piccolo fra quello che sta nello spazio rimasto (la colonna meno
  la figura, meno `GAP = 2rem`), la vecchia frazione della colonna e il tetto in
  pixel. Riempiendo lo spazio, il titolo partirebbe sempre dal bordo sinistro;
- la **posizione** la dà il margine destro, `--figure` meno `--outside-figure`: `SLEEVE`
  (1.5% della figura, la striscia trasparente fra il bordo del riquadro e la manica) più
  `OVERLAP` (0.24 em della riga grande). `ml-auto` si prende lo spazio che il corpo ha
  lasciato e il blocco si appoggia alla figura, entrandoci fin sotto la manica.

**`INSET` (2rem) stacca il ritratto dal bordo destro**, e il titolo lo segue della
stessa misura: muovere la foto non cambia di un pixel quanto entra la E, che è una scelta
a parte (`OVERLAP`). Sta dentro `GAP` apposta — è spazio già riservato da `body()`,
quindi il titolo scorre a sinistra senza doversi stringere. **Portandolo oltre quei 2rem
il titolo comincia a rimpicciolirsi** per restare nella colonna, e la cosa si vede come un
corpo che cala invece che come una foto che si sposta.

⚠️ **I due conti non usano lo stesso numero, ed è voluto.** `body()` dimensiona il titolo
come se dovesse stare tutto **fuori** dalla foto, lasciando `GAP`; il margine poi lo
tira **dentro** di `OVERLAP`. Riservare quello spazio e non usarlo è ciò che impedisce al
titolo di uscire dalla colonna: mettendo l'incastro anche dentro `body()`, il margine
diventa più grande dello spazio e il titolo resta inchiodato a sinistra — la scritta si
allunga invece di spostarsi, e cambiare i numeri sembra non fare niente. È successo, a
settembre 2026.

⚠️ **`OVERLAP` è in em perché copre una frazione di lettera, non un numero di pixel.**
La E è larga **0.618 em**, e da lì si legge tutto: 0.24 ne copre il 39% (il valore di
adesso), 0.309 la metà, 0.618 la fa sparire, oltre comincia a mangiare la O. Misurato da
768 a 2560px con un `Range` sull'ultimo carattere, il 39% torna a ogni larghezza e in
tutte e due le lingue — anche "I'm Joe" finisce in E, e lì la lettera è più grande perché
il titolo è più corto, quindi in pixel la copertura va da 21 a 58 contro i 15–50
dell'italiano, ma la frazione è la stessa. In pixel fissi la frazione tornerebbe a una
sola larghezza. **Sotto `md` l'incastro non c'è**: la foto sta in colonna sotto il titolo.

⚠️ **A muoversi quando cresce `OVERLAP` è il titolo, non la foto.** Il blocco scivola a
destra dentro la figura; il ritratto resta dov'è. Quello che sposta la foto è `INSET`, e
siccome il titolo lo segue della stessa misura, `INSET` non cambia la copertura di un
pixel: una manopola dice dove sta la coppia titolo+foto nella pagina, l'altra quanto si
incastrano fra loro.

**"Product designer" è centrato sotto "Sono Joe"** (`ROLE = 0.8`), e ci si centra da sé:
essendo `ROLE` minore di 1, la riga grande resta la più larga, quindi il `w-fit` del
titolo è la sua larghezza e alla riga piccola basta `text-center`. Da ciò discende anche
che **è la riga grande a toccare la foto**, e infatti l'incastro è in em suoi.
**Portando `ROLE` sopra 1 il conto si rovescia** — il riquadro diventa largo quanto la
riga piccola, "Sono Joe" si centra dentro di lei, e a finire dietro la manica è la R di
"designer" invece della E. Misurato a 390, 768, 1440 e 2560, nelle due lingue: lo scarto
fra i due lati è zero.

⚠️ Due conseguenze che si rompono in silenzio: `PORTRAIT_RATIO` sono le proporzioni
di `joe-hero.webp` (1200×1364) e **va rifatta cambiando ritaglio**; e la foto è alta
`--figure-frame` e non `h-full`, perché da `md` la testata può essere più bassa della
finestra — su una finestra alta e stretta si accorcia fino alla figura invece di lasciare
mezzo schermo vuoto sopra a un titolo schiacciato in fondo.

## Le card degli strumenti (`about/Skills.jsx`)

Si impilano con `position: sticky`: ognuna si ferma `STEP_OFFSET` (0.85rem) più in basso della
precedente, e chi viene dopo passa sopra. Quei 13 pixel di scarto sono le strisce che
restano in vista, ed è da lì che si conta quante card ci sono senza averle ancora viste.

⚠️ **In fondo alla pila c'è un elemento vuoto alto `TAIL` (mezzo schermo), e non è spazio
decorativo.** Senza, la corsa della pila finiva nell'istante esatto in cui l'ultima card
arrivava: quella non si posava mai al suo `top`, restava qualche pixel più su e copriva le
strisce di tutte le altre, poi il blocco scorreva via. La pila completa non si vedeva mai.

⚠️ **La coda dev'essere un elemento vero, non `padding-bottom` sul contenitore.** Lo sticky
di un figlio è limitato dal **content box** del padre, e il padding gli sta fuori: col
padding la corsa non si allunga di un pixel, e in più le card vengono spinte tutte sullo
stesso punto invece che ai loro scalini — cioè proprio il guasto che si voleva togliere,
ma anticipato. Provato e misurato: con `padding-bottom: 450px` le tre card finivano tutte a
65px invece che a 78, 91 e 105.

`update()` sconta la coda dalla corsa (`stackEl.lastElementChild`), o la pila
continuerebbe a comprimersi mentre è già ferma; e legge le card con `:scope > article`, così
la coda non finisce fra quelle da scalare. **Aggiungendo un figlio alla pila, va messo prima
della coda**, che deve restare l'ultimo.

