/*
 * Gli aiutanti di `siteData` che producono testo visibile o dichiarazioni di
 * legge. La coerenza fra dati e file su disco la controlla
 * `scripts/verifica.js`, che gira prima di ogni build: qui c'è solo la logica.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aiFoto, periodoDi, titoloLeggibile } from '../src/data/siteData.js'

test('i titoli in maiuscolo tornano leggibili all’italiana', () => {
  // Non Title Case: darebbe "Sedia A Tempo Determinato".
  assert.equal(titoloLeggibile('SEDIA A TEMPO DETERMINATO'), 'Sedia a tempo determinato')
  assert.equal(titoloLeggibile('DADO LAMP'), 'Dado lamp')
})

test('l’etichetta AI si mette solo dove è dichiarata', () => {
  const item = { ai: { generate: [1, 3], modificate: [2] } }
  assert.equal(aiFoto(item, 1), 'generata')
  assert.equal(aiFoto(item, 2), 'modificata')
  assert.equal(aiFoto(item, 3), 'generata')
  // Il silenzio dichiara che la foto è vera: mai un'etichetta per difetto.
  assert.equal(aiFoto(item, 4), null)
  assert.equal(aiFoto({}, 1), null)
})

test("'tutte' vale per ogni foto della galleria", () => {
  const item = { ai: { generate: 'tutte' } }
  for (const n of [1, 5, 12]) assert.equal(aiFoto(item, n), 'generata')
})

test('il periodo è il minimo e il massimo degli anni presenti', () => {
  assert.deepEqual(periodoDi([{ year: '2024' }, { year: '2026' }, {}]), { primo: 2024, ultimo: 2026 })
  assert.deepEqual(periodoDi([{ year: '2025' }]), { primo: 2025, ultimo: 2025 })
  assert.equal(periodoDi([{}, {}]), null)
})
