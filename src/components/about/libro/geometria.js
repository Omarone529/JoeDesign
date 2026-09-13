// Forma di una pagina piegata: matematica pura, niente React/Three/DOM. Test in tests/geometria.test.js.

/* ── Le misure del mondo, condivise con la scena e col gesto ── */

// In quanti quadrilateri è divisa una pagina: è la risoluzione della piega.
export const M_COLONNE = 48
export const LARGHEZZA_MONDO = 2
export const ALTEZZA_MONDO = LARGHEZZA_MONDO * (1415 / 1000)
// Distanza fra un foglio e il successivo nelle due pile.
export const SCARTO_PILA = 0.02

/* ── I parametri della piega, che non escono da qui ── */

const CURVA_MAX = (22 * Math.PI) / 180 // arco sobrio: una pagina vera non si piega a tubo
// Verso giusto per un giro all'indietro; andando avanti lo ribalta `versoArco`.
const CURVA_SEGNO = -1
const RIGIDITA_COPERTINA = 0.35 // le copertine sono cartone: si flettono molto meno della carta

// `curvaAmp`: flessione totale, negativa se piega nell'altro verso.
// `alzata`: sollevamento di volo in unità mondo, a rampa lungo la pagina.
export function calcolaColonne(curvaAmp, alzata = 0) {
  const posX = new Float32Array(M_COLONNE + 1)
  const posZ = new Float32Array(M_COLONNE + 1)
  const angoliSegmento = new Float32Array(M_COLONNE)
  let x = 0
  let z = 0
  for (let s = 0; s < M_COLONNE; s += 1) {
    const uMetà = (s + 0.5) / M_COLONNE
    // Antisimmetrica: a gobba singola la profondità accumulata non tornerebbe
    // a zero e il bordo libero andrebbe alla deriva invece di richiudersi.
    const curvaLocale = CURVA_MAX * curvaAmp * Math.sin(2 * Math.PI * uMetà) * CURVA_SEGNO
    angoliSegmento[s] = curvaLocale
    x += (1 / M_COLONNE) * Math.cos(curvaLocale)
    z += -(1 / M_COLONNE) * Math.sin(curvaLocale)
    posX[s + 1] = x
    posZ[s + 1] = z
  }
  // Nella geometria e non sul gruppo: a rampa dalla cerniera, così la radice
  // resta incollata alla costa e si alza solo il corpo della pagina.
  if (alzata !== 0) {
    for (let v = 1; v <= M_COLONNE; v += 1) {
      posZ[v] += (alzata / LARGHEZZA_MONDO) * Math.min(1, (v / M_COLONNE) * 2.2)
    }
  }
  return { posX, posZ, angoliSegmento }
}
/* Primo e ultimo foglio sono cartone: ogni flessione gli arriva ridotta.
   `n` è quante pagine ha il libro: le copertine sono la prima e l'ultima. */
export function rigidita(indice, n) {
  return indice === 0 || indice === n - 1 ? RIGIDITA_COPERTINA : 1
}

export function angoliVertici(angoliSegmento) {
  const out = new Float32Array(M_COLONNE + 1)
  for (let v = 0; v <= M_COLONNE; v += 1) {
    if (v === 0) out[v] = angoliSegmento[0]
    else if (v === M_COLONNE) out[v] = angoliSegmento[M_COLONNE - 1]
    else out[v] = (angoliSegmento[v - 1] + angoliSegmento[v]) / 2
  }
  return out
}

