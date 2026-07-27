/*
 * Preferenza "riduci animazioni". Da leggere all'uso, non al render: in
 * pre-rendering `window` non esiste (risponde `false`, innocuo) e il valore
 * può cambiare a pagina aperta.
 */
export function animazioniRidotte() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/* Comportamento da passare a scrollTo/scrollIntoView, rispettando la preferenza. */
export function scorrimento() {
  return animazioniRidotte() ? 'auto' : 'smooth'
}
