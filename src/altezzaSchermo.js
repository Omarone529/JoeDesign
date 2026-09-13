// `--schermo`: l'altezza dello schermo in px, che le barre del browser non muovono. Firefox su
// iPhone e i browser dentro le app ridimensionano la pagina quando le barre si ritirano, e con loro `svh`.

// Una rotazione assesta le misure in più eventi: per un attimo si accetta anche la sola altezza.
export const ASSESTAMENTO = 600
// Le barre si muovono mentre si scorre, o a scorrimento appena finito (inerzia compresa).
export const QUIETE = 1000

// Pura, e quindi testata: niente `window` qui dentro.
export function daRicalcolare({ larghezzaCambiata, altezzaCambiata, msDallaRotazione, msDalloScroll, dito }) {
  if (larghezzaCambiata) return true
  if (!altezzaCambiata) return false
  if (msDallaRotazione < ASSESTAMENTO) return true
  // Col dito l'altezza la muovono solo le barre; col mouse è la finestra, se non si sta scorrendo.
  return !dito && msDalloScroll > QUIETE
}

export function fissaAltezzaSchermo() {
  const radice = document.documentElement
  const dito = window.matchMedia('(pointer: coarse)')
  let larghezza = radice.clientWidth
  let altezza = radice.clientHeight
  let rotazione = -Infinity
  let scroll = -Infinity

  const scrivi = () => radice.style.setProperty('--schermo', `${altezza}px`)

  // clientWidth/Height e non innerWidth/Height: non cambiano con lo zoom a pizzico.
  const aggiorna = () => {
    const w = radice.clientWidth
    const h = radice.clientHeight
    const ora = performance.now()
    const decisione = daRicalcolare({
      larghezzaCambiata: w !== larghezza,
      altezzaCambiata: h !== altezza,
      msDallaRotazione: ora - rotazione,
      msDalloScroll: ora - scroll,
      dito: dito.matches,
    })
    if (w !== larghezza) rotazione = ora
    if (!decisione) return
    larghezza = w
    altezza = h
    scrivi()
  }

  scrivi()
  window.addEventListener('scroll', () => (scroll = performance.now()), { passive: true })
  window.addEventListener('resize', aggiorna)
  // Ultima misura a rotazione finita: su iOS il `resize` può arrivare prima delle dimensioni nuove.
  window.addEventListener('orientationchange', () => setTimeout(aggiorna, ASSESTAMENTO / 2))
}

// Per chi fa conti sull'altezza dello schermo in JS: la stessa di `--schermo`.
export function altezzaSchermo() {
  const valore = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--schermo'))
  return Number.isFinite(valore) ? valore : window.innerHeight
}
