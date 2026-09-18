// Proprietà fisiche della piega, non numeri: se un test cade, la pagina non si comporta più come carta.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  WORLD_HEIGHT,
  WORLD_WIDTH,
  M_COLUMNS,
  toVertexAngles,
  computeColumns,
  stiffness,
} from '../src/components/about/book/geometry.js'

const M = M_COLUMNS
const CURVE = [-1.15, -0.8, -0.5, -0.2, 0, 0.2, 0.5, 0.8, 1.15]

const length = (r) => {
  let l = 0
  for (let i = 0; i < M; i += 1) l += Math.hypot(r.posX[i + 1] - r.posX[i], r.posZ[i + 1] - r.posZ[i])
  return l
}

test('a riposo la pagina è piatta', () => {
  const r = computeColumns(0)
  assert.ok(r.posZ.every((z) => z === 0), 'nessuna profondità')
  assert.ok(r.segmentAngles.every((a) => a === 0), 'nessuna inclinazione')
  assert.equal(Number(r.posX[M].toFixed(10)), 1, 'lunga esattamente una pagina')
})

test('la radice resta incollata alla costa, comunque si pieghi', () => {
  for (const c of CURVE) {
    for (const lift of [0, 0.14, 0.28]) {
      const r = computeColumns(c, lift)
      assert.equal(r.posX[0], 0, `curva ${c}`)
      assert.equal(r.posZ[0], 0, `curva ${c}, alzata ${lift}`)
    }
  }
})

test('il bordo libero torna sul piano: è il senso della curva antisimmetrica', () => {
  // La profondità torna a zero: il bordo esterno si richiude sulla pila.
  for (const c of CURVE) {
    assert.ok(Math.abs(computeColumns(c, 0).posZ[M]) < 1e-12, `curva ${c}`)
  }
})

test('la carta non si allunga: la piega accorcia la campata, non il foglio', () => {
  for (const c of CURVE) {
    assert.ok(Math.abs(length(computeColumns(c, 0)) - 1) < 1e-6, `curva ${c}`)
  }
  // E più si piega, meno campata occupa: è quello che si vede a schermo.
  assert.ok(computeColumns(1.15, 0).posX[M] < computeColumns(0.5, 0).posX[M])
  assert.ok(computeColumns(0.5, 0).posX[M] < computeColumns(0, 0).posX[M])
})

test('flessioni opposte danno pieghe speculari', () => {
  const more = computeColumns(0.5, 0)
  const minus = computeColumns(-0.5, 0)
  for (let i = 0; i <= M; i += 1) {
    assert.ok(Math.abs(more.posZ[i] + minus.posZ[i]) < 1e-12, `vertice ${i}`)
    assert.ok(Math.abs(more.posX[i] - minus.posX[i]) < 1e-12, `vertice ${i}`)
  }
})

test('il sollevamento di volo alza il corpo e non la cerniera', () => {
  const still = computeColumns(0, 0)
  const raised = computeColumns(0, 0.28)
  assert.equal(raised.posZ[0], still.posZ[0], 'la cerniera non si muove')
  assert.ok(raised.posZ[M] > 0, 'il bordo sale')
  // A rampa: cresce lungo la pagina e non tutto in blocco.
  for (let i = 1; i <= M / 2; i += 1) assert.ok(raised.posZ[i] >= raised.posZ[i - 1], `vertice ${i}`)
})

test('gli angoli dei vertici mediano quelli dei segmenti, e ai bordi li copiano', () => {
  const { segmentAngles } = computeColumns(0.8, 0)
  const v = toVertexAngles(segmentAngles)
  assert.equal(v.length, M + 1)
  assert.equal(v[0], segmentAngles[0])
  assert.equal(v[M], segmentAngles[M - 1])
  // Tolleranza 1e-7: Float32Array, lo scarto di arrotondamento misurato è 1.5e-8.
  for (let i = 1; i < M; i += 1) {
    assert.ok(Math.abs(v[i] - (segmentAngles[i - 1] + segmentAngles[i]) / 2) < 1e-7, `vertice ${i}`)
  }
})

test('le copertine sono cartone: si flettono meno dei fogli', () => {
  const n = 5
  assert.ok(stiffness(0, n) < 1, 'la prima è copertina')
  assert.ok(stiffness(n - 1, n) < 1, "l'ultima è copertina")
  for (let i = 1; i < n - 1; i += 1) assert.equal(stiffness(i, n), 1, `foglio ${i}`)
})

test('la pagina ha le proporzioni delle tavole (1000×1415)', () => {
  assert.ok(Math.abs(WORLD_HEIGHT / WORLD_WIDTH - 1415 / 1000) < 1e-12)
})
