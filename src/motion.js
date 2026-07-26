/*
 * Preferenza di sistema "riduci le animazioni".
 *
 * Va interrogata al momento dell'uso e non durante il render: in fase di
 * pre-rendering `window` non esiste, e il valore può comunque cambiare mentre
 * la pagina è aperta. Fuori dal browser risponde `false`, che è innocuo perché
 * lì non si anima nulla.
 */
export function animazioniRidotte() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/* Comportamento da passare a scrollTo/scrollIntoView, rispettando la preferenza. */
export function scorrimento() {
  return animazioniRidotte() ? 'auto' : 'smooth'
}
