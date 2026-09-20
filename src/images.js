import { variants, VARIANT_SUFFIX } from './data/variants'

export function srcSetDi(src) {
  const width = variants[src]
  if (!width) return undefined
  const variant = src.replace(/\.webp$/, `${VARIANT_SUFFIX}.webp`)
  return `${variant} 800w, ${src} ${width}w`
}

// `sizes` per layout: senza, il browser assume 100vw e scarica sempre l'originale.
export const SIZES = {
  carousel: '(min-width: 768px) 55vw, 100vw',
  selected: '(min-width: 1024px) 20vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw',
  archive: '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  areas: '(min-width: 1024px) 580px, (min-width: 640px) 470px, 100vw',
  filled: '100vw',
  // Il player di ProjectFilm.jsx non supera mai i 1200px: sotto i 1344 di finestra riempie la colonna.
  film: '(min-width: 1344px) 1200px, 100vw',
  half: '(min-width: 768px) 55vw, 100vw',
  skillCards: '(min-width: 640px) 45vw, 100vw',
  // Da tenere allineato alle classi del ritratto in About.jsx.
  portrait: '(min-width: 768px) 46vw, 88vw',
}
