// Aiutanti di siteData (titoli, etichette AI, periodi). Dati ↔ file li controlla verify.js.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aiPhoto, periodOf, readableTitle } from '../src/data/siteData.js'

test('i titoli in maiuscolo tornano leggibili all’italiana', () => {
  // Non Title Case: darebbe "Sedia A Tempo Determinato".
  assert.equal(readableTitle('SEDIA A TEMPO DETERMINATO'), 'Sedia a tempo determinato')
  assert.equal(readableTitle('DADO LAMP'), 'Dado lamp')
})

test('l’etichetta AI si mette solo dove è dichiarata', () => {
  const item = { ai: { generated: [1, 3], modified: [2] } }
  assert.equal(aiPhoto(item, 1), 'generated')
  assert.equal(aiPhoto(item, 2), 'modified')
  assert.equal(aiPhoto(item, 3), 'generated')
  // Il silenzio dichiara che la foto è vera: mai un'etichetta per difetto.
  assert.equal(aiPhoto(item, 4), null)
  assert.equal(aiPhoto({}, 1), null)
})

test("'all' vale per ogni foto della galleria", () => {
  const item = { ai: { generated: 'all' } }
  for (const n of [1, 5, 12]) assert.equal(aiPhoto(item, n), 'generated')
})

test('il periodo è il minimo e il massimo degli anni presenti', () => {
  assert.deepEqual(periodOf([{ year: '2024' }, { year: '2026' }, {}]), { first: 2024, last: 2026 })
  assert.deepEqual(periodOf([{ year: '2025' }]), { first: 2025, last: 2025 })
  assert.equal(periodOf([{}, {}]), null)
})
