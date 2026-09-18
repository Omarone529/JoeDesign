// srcset dalle varianti da 800px (photo-variants.js). Senza variante: undefined, attributo omesso.
import { variants, VARIANT_SUFFIX } from './data/variants'

export function srcSetDi(src) {
  const width = variants[src]
  if (!width) return undefined
  const variant = src.replace(/\.webp$/, `${VARIANT_SUFFIX}.webp`)
  return `${variant} 800w, ${src} ${width}w`
}

// `sizes` per layout: senza, il browser assume 100vw e scarica sempre l'originale.
export const SIZES = {
  // Carousel: colonna destra della scheda progetto, piena su mobile.
  carousel: '(min-width: 768px) 55vw, 100vw',
  // SelectedWorks: 1 → 2 → 3 → 5 colonne.
  selected: '(min-width: 1024px) 20vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw',
  // Archive: 2 → 3 → 4 colonne.
  archive: '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  // Card d'area: 1 → 2 colonne, dentro un contenitore da 980 (sm) e 1200 (lg).
  areas: '(min-width: 1024px) 580px, (min-width: 640px) 470px, 100vw',
  // Fascia e sfondo di chiusura: sempre a tutta larghezza.
  filled: '100vw',
  // Disegno tecnico e ritratto in home: mezza colonna da tablet in su.
  half: '(min-width: 768px) 55vw, 100vw',
  // Card degli strumenti in "Chi sono": mezza card da sm in su, piena sotto.
  skillCards: '(min-width: 640px) 45vw, 100vw',
  // Ritratto della testata di "Chi sono": le stesse misure che ha in pagina.
  // Cambiando quelle classi va cambiato anche questo.
  portrait: '(min-width: 768px) 46vw, 88vw',
}
