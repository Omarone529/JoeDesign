// Da leggere all'uso, non al render: in pre-rendering `window` non esiste, e la
// preferenza può cambiare a pagina aperta.
export function animazioniRidotte() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function scorrimento() {
  return animazioniRidotte() ? 'auto' : 'smooth'
}
