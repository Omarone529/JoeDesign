/*
 * Il srcset delle foto d'archivio.
 *
 * `varianti-foto.js` mette accanto a ogni foto una copia da 800 px e ne scrive
 * l'elenco in `src/data/varianti.js`. Qui quell'elenco diventa l'attributo che
 * il browser legge: due misure con la loro larghezza reale, e la scelta la fa
 * lui in base a schermo e densità.
 *
 * Chi non è nell'elenco (foto già piccole, og:image) torna `undefined`: React
 * omette l'attributo e l'immagine resta servita così com'è.
 */
import { varianti, SUFFISSO_VARIANTE } from './data/varianti'

export function srcSetDi(src) {
  const larghezza = varianti[src]
  if (!larghezza) return undefined
  const variante = src.replace(/\.webp$/, `${SUFFISSO_VARIANTE}.webp`)
  return `${variante} 800w, ${src} ${larghezza}w`
}

/*
 * Quanto spazio occupa la foto nella pagina, per ogni larghezza di finestra.
 * Il browser lo legge PRIMA di conoscere il layout, quindi va dichiarato a
 * mano: se manca, assume 100vw e su desktop scarica sempre l'originale.
 * I valori seguono i breakpoint di Tailwind (sm 640, md 768, lg 1024).
 */
export const MISURE = {
  // Carousel: colonna destra della scheda progetto, piena su mobile.
  carosello: '(min-width: 768px) 55vw, 100vw',
  // SelectedWorks: 1 → 2 → 3 → 5 colonne.
  selezionati: '(min-width: 1024px) 20vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw',
  // Archive: 2 → 3 → 4 colonne.
  archivio: '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  // Card d'area: 1 → 2 colonne, dentro un contenitore da 980 (sm) e 1200 (lg).
  aree: '(min-width: 1024px) 580px, (min-width: 640px) 470px, 100vw',
  // Fascia e sfondo di chiusura: sempre a tutta larghezza.
  piena: '100vw',
  // Disegno tecnico e ritratto in home: mezza colonna da tablet in su.
  mezza: '(min-width: 768px) 55vw, 100vw',
  // Card degli strumenti in "Chi sono": mezza card da sm in su, piena sotto.
  competenze: '(min-width: 640px) 45vw, 100vw',
  // Ritratto della testata di "Chi sono": le stesse misure che ha in pagina —
  // 46vw da tablet in su, 88 della finestra sotto. Cambiando quelle classi va
  // cambiato anche questo, o il browser sceglie la variante sbagliata.
  ritratto: '(min-width: 768px) 46vw, 88vw',
}
