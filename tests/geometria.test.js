/*
 * La forma della pagina che gira. È la parte che si sbaglia in silenzio: un
 * segno invertito non lancia niente, dà una curva appena diversa che si nota
 * solo mettendo le due versioni una accanto all'altra.
 *
 * Questi test non fissano dei numeri — fisserebbero anche gli errori. Fissano
 * le proprietà fisiche che la formula deve avere perché quella cosa sembri un
 * foglio di carta e non un nastro elastico.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ALTEZZA_MONDO,
  LARGHEZZA_MONDO,
  M_COLONNE,
  angoliVertici,
  calcolaColonne,
  rigidita,
} from '../src/components/about/libro/geometria.js'

const M = M_COLONNE
const CURVE = [-1.15, -0.8, -0.5, -0.2, 0, 0.2, 0.5, 0.8, 1.15]

const lunghezza = (r) => {
  let l = 0
  for (let i = 0; i < M; i += 1) l += Math.hypot(r.posX[i + 1] - r.posX[i], r.posZ[i + 1] - r.posZ[i])
  return l
}

test('a riposo la pagina è piatta', () => {
  const r = calcolaColonne(0)
  assert.ok(r.posZ.every((z) => z === 0), 'nessuna profondità')
  assert.ok(r.angoliSegmento.every((a) => a === 0), 'nessuna inclinazione')
  assert.equal(Number(r.posX[M].toFixed(10)), 1, 'lunga esattamente una pagina')
})

test('la radice resta incollata alla costa, comunque si pieghi', () => {
  for (const c of CURVE) {
    for (const alzata of [0, 0.14, 0.28]) {
      const r = calcolaColonne(c, alzata)
      assert.equal(r.posX[0], 0, `curva ${c}`)
      assert.equal(r.posZ[0], 0, `curva ${c}, alzata ${alzata}`)
    }
  }
})

test('il bordo libero torna sul piano: è il senso della curva antisimmetrica', () => {
  /*
   * Con una gobba sola la profondità accumulata non tornerebbe a zero e il
   * bordo esterno se ne andrebbe alla deriva invece di richiudersi sulla pila.
   * È l'invariante che tiene insieme il giro, e vale per ogni flessione.
   */
  for (const c of CURVE) {
    assert.ok(Math.abs(calcolaColonne(c, 0).posZ[M]) < 1e-12, `curva ${c}`)
  }
})

test('la carta non si allunga: la piega accorcia la campata, non il foglio', () => {
  for (const c of CURVE) {
    assert.ok(Math.abs(lunghezza(calcolaColonne(c, 0)) - 1) < 1e-6, `curva ${c}`)
  }
  // E più si piega, meno campata occupa: è quello che si vede a schermo.
  assert.ok(calcolaColonne(1.15, 0).posX[M] < calcolaColonne(0.5, 0).posX[M])
  assert.ok(calcolaColonne(0.5, 0).posX[M] < calcolaColonne(0, 0).posX[M])
})

test('flessioni opposte danno pieghe speculari', () => {
  const piu = calcolaColonne(0.5, 0)
  const meno = calcolaColonne(-0.5, 0)
  for (let i = 0; i <= M; i += 1) {
    assert.ok(Math.abs(piu.posZ[i] + meno.posZ[i]) < 1e-12, `vertice ${i}`)
    assert.ok(Math.abs(piu.posX[i] - meno.posX[i]) < 1e-12, `vertice ${i}`)
  }
})

test('il sollevamento di volo alza il corpo e non la cerniera', () => {
  const fermo = calcolaColonne(0, 0)
  const alzato = calcolaColonne(0, 0.28)
  assert.equal(alzato.posZ[0], fermo.posZ[0], 'la cerniera non si muove')
  assert.ok(alzato.posZ[M] > 0, 'il bordo sale')
  // A rampa: cresce lungo la pagina e non tutto in blocco.
  for (let i = 1; i <= M / 2; i += 1) assert.ok(alzato.posZ[i] >= alzato.posZ[i - 1], `vertice ${i}`)
})

test('gli angoli dei vertici mediano quelli dei segmenti, e ai bordi li copiano', () => {
  const { angoliSegmento } = calcolaColonne(0.8, 0)
  const v = angoliVertici(angoliSegmento)
  assert.equal(v.length, M + 1)
  assert.equal(v[0], angoliSegmento[0])
  assert.equal(v[M], angoliSegmento[M - 1])
  /*
   * Tolleranza a 1e-7 e non zero: questi vettori sono `Float32Array` — è la
   * forma che la scheda grafica vuole, e ricopiarli in doppia precisione per
   * poi riconvertirli sarebbe lavoro per niente. La media viene calcolata a 64
   * bit e riposta a 32, quindi si arrotonda: lo scarto misurato è 1.5e-8,
   * dentro l'epsilon del formato (~1.2e-7). Se un giorno superasse questa
   * soglia non sarebbe più arrotondamento, sarebbe un errore di formula.
   */
  for (let i = 1; i < M; i += 1) {
    assert.ok(Math.abs(v[i] - (angoliSegmento[i - 1] + angoliSegmento[i]) / 2) < 1e-7, `vertice ${i}`)
  }
})

test('le copertine sono cartone: si flettono meno dei fogli', () => {
  const n = 5
  assert.ok(rigidita(0, n) < 1, 'la prima è copertina')
  assert.ok(rigidita(n - 1, n) < 1, "l'ultima è copertina")
  for (let i = 1; i < n - 1; i += 1) assert.equal(rigidita(i, n), 1, `foglio ${i}`)
})

test('la pagina ha le proporzioni delle tavole (1000×1415)', () => {
  assert.ok(Math.abs(ALTEZZA_MONDO / LARGHEZZA_MONDO - 1415 / 1000) < 1e-12)
})
