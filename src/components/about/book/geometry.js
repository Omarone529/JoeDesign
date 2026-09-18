// Forma di una pagina piegata: matematica pura, niente React/Three/DOM. Test in tests/geometry.test.js.

/* ── Le misure del mondo, condivise con la scena e col gesto ── */

// In quanti quadrilateri è divisa una pagina: è la risoluzione della piega.
export const M_COLUMNS = 48
export const WORLD_WIDTH = 2
export const WORLD_HEIGHT = WORLD_WIDTH * (1415 / 1000)
// Distanza fra un foglio e il successivo nelle due pile.
export const STACK_GAP = 0.02

/* ── I parametri della piega, che non escono da qui ── */

const CURVE_MAX = (22 * Math.PI) / 180 // arco sobrio: una pagina vera non si piega a tubo
// Verso giusto per un giro all'indietro; andando avanti lo ribalta `arcDirection`.
const CURVE_SIGN = -1
const COVER_STIFFNESS = 0.35 // le copertine sono cartone: si flettono molto meno della carta

// `curveAmp`: flessione totale, negativa se piega nell'altro verso.
// `lift`: sollevamento di volo in unità mondo, a rampa lungo la pagina.
export function computeColumns(curveAmp, lift = 0) {
  const posX = new Float32Array(M_COLUMNS + 1)
  const posZ = new Float32Array(M_COLUMNS + 1)
  const segmentAngles = new Float32Array(M_COLUMNS)
  let x = 0
  let z = 0
  for (let s = 0; s < M_COLUMNS; s += 1) {
    const uHalf = (s + 0.5) / M_COLUMNS
    // Antisimmetrica: a gobba singola la profondità accumulata non tornerebbe
    // a zero e il bordo libero andrebbe alla deriva invece di richiudersi.
    const localCurve = CURVE_MAX * curveAmp * Math.sin(2 * Math.PI * uHalf) * CURVE_SIGN
    segmentAngles[s] = localCurve
    x += (1 / M_COLUMNS) * Math.cos(localCurve)
    z += -(1 / M_COLUMNS) * Math.sin(localCurve)
    posX[s + 1] = x
    posZ[s + 1] = z
  }
  // Nella geometria e non sul gruppo: a rampa dalla cerniera, così la radice
  // resta incollata alla costa e si alza solo il corpo della pagina.
  if (lift !== 0) {
    for (let v = 1; v <= M_COLUMNS; v += 1) {
      posZ[v] += (lift / WORLD_WIDTH) * Math.min(1, (v / M_COLUMNS) * 2.2)
    }
  }
  return { posX, posZ, segmentAngles }
}
/* Primo e ultimo foglio sono cartone: ogni flessione gli arriva ridotta.
   `n` è quante pagine ha il libro: le copertine sono la prima e l'ultima. */
export function stiffness(index, n) {
  return index === 0 || index === n - 1 ? COVER_STIFFNESS : 1
}

export function toVertexAngles(segmentAngles) {
  const out = new Float32Array(M_COLUMNS + 1)
  for (let v = 0; v <= M_COLUMNS; v += 1) {
    if (v === 0) out[v] = segmentAngles[0]
    else if (v === M_COLUMNS) out[v] = segmentAngles[M_COLUMNS - 1]
    else out[v] = (segmentAngles[v - 1] + segmentAngles[v]) / 2
  }
  return out
}

