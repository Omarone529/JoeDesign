// Quando `--schermo` si ricalcola: le barre del browser non devono mai muovere la pagina.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ASSESTAMENTO, QUIETE, daRicalcolare } from '../src/altezzaSchermo.js'

const fermo = { larghezzaCambiata: false, altezzaCambiata: true, msDallaRotazione: Infinity, msDalloScroll: Infinity }

test('le barre che si ritirano scorrendo non ricalcolano, qualunque sia il puntatore', () => {
  for (const dito of [true, false]) {
    assert.equal(daRicalcolare({ ...fermo, msDalloScroll: 0, dito }), false)
    assert.equal(daRicalcolare({ ...fermo, msDalloScroll: QUIETE, dito }), false)
  }
})

test('col dito la sola altezza non ricalcola mai, nemmeno a pagina ferma', () => {
  assert.equal(daRicalcolare({ ...fermo, dito: true }), false)
})

test('la finestra desktop ridimensionata a pagina ferma ricalcola', () => {
  assert.equal(daRicalcolare({ ...fermo, dito: false }), true)
})

test('cambiando larghezza (rotazione, finestra) si ricalcola sempre', () => {
  for (const dito of [true, false]) {
    assert.equal(daRicalcolare({ ...fermo, larghezzaCambiata: true, msDalloScroll: 0, dito }), true)
  }
})

test('subito dopo una rotazione si accetta anche la sola altezza, poi non più', () => {
  assert.equal(daRicalcolare({ ...fermo, msDallaRotazione: ASSESTAMENTO - 1, msDalloScroll: 0, dito: true }), true)
  assert.equal(daRicalcolare({ ...fermo, msDallaRotazione: ASSESTAMENTO, msDalloScroll: 0, dito: true }), false)
})

test('senza variazioni non si riscrive niente', () => {
  assert.equal(daRicalcolare({ ...fermo, altezzaCambiata: false, dito: false }), false)
})
