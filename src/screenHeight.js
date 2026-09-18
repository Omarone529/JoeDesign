// `--screen-height`: l'altezza dello schermo in px, che le barre del browser non muovono. Firefox su
// iPhone e i browser dentro le app ridimensionano la pagina quando le barre si ritirano, e con loro `svh`.

// Una rotazione assesta le misure in più eventi: per un attimo si accetta anche la sola altezza.
export const SETTLE_MS = 600
// Le barre si muovono mentre si scorre, o a scorrimento appena finito (inerzia compresa).
export const QUIET_MS = 1000

// Pura, e quindi testata: niente `window` qui dentro.
export function shouldRecompute({ widthChanged, heightChanged, msSinceRotation, msSinceScroll, finger }) {
  if (widthChanged) return true
  if (!heightChanged) return false
  if (msSinceRotation < SETTLE_MS) return true
  // Col dito l'altezza la muovono solo le barre; col mouse è la finestra, se non si sta scorrendo.
  return !finger && msSinceScroll > QUIET_MS
}

export function setScreenHeight() {
  const root = document.documentElement
  const finger = window.matchMedia('(pointer: coarse)')
  let width = root.clientWidth
  let height = root.clientHeight
  let rotation = -Infinity
  let scroll = -Infinity

  const write = () => root.style.setProperty('--screen-height', `${height}px`)

  // clientWidth/Height e non innerWidth/Height: non cambiano con lo zoom a pizzico.
  const update = () => {
    const w = root.clientWidth
    const h = root.clientHeight
    const now = performance.now()
    const decision = shouldRecompute({
      widthChanged: w !== width,
      heightChanged: h !== height,
      msSinceRotation: now - rotation,
      msSinceScroll: now - scroll,
      finger: finger.matches,
    })
    if (w !== width) rotation = now
    if (!decision) return
    width = w
    height = h
    write()
  }

  write()
  window.addEventListener('scroll', () => (scroll = performance.now()), { passive: true })
  window.addEventListener('resize', update)
  // Ultima misura a rotazione finita: su iOS il `resize` può arrivare prima delle dimensioni nuove.
  window.addEventListener('orientationchange', () => setTimeout(update, SETTLE_MS / 2))
}

// Per chi fa conti sull'altezza dello schermo in JS: la stessa di `--screen-height`.
export function screenHeight() {
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--screen-height'))
  return Number.isFinite(value) ? value : window.innerHeight
}
