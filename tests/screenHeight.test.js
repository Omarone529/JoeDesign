// Quando `--screen-height` si ricalcola: le barre del browser non devono mai muovere la pagina.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SETTLE_MS, QUIET_MS, shouldRecompute } from '../src/screenHeight.js'

const still = { widthChanged: false, heightChanged: true, msSinceRotation: Infinity, msSinceScroll: Infinity }

test('le barre che si ritirano scorrendo non ricalcolano, qualunque sia il puntatore', () => {
  for (const finger of [true, false]) {
    assert.equal(shouldRecompute({ ...still, msSinceScroll: 0, finger }), false)
    assert.equal(shouldRecompute({ ...still, msSinceScroll: QUIET_MS, finger }), false)
  }
})

test('col dito la sola altezza non ricalcola mai, nemmeno a pagina ferma', () => {
  assert.equal(shouldRecompute({ ...still, finger: true }), false)
})

test('la finestra desktop ridimensionata a pagina ferma ricalcola', () => {
  assert.equal(shouldRecompute({ ...still, finger: false }), true)
})

test('cambiando larghezza (rotazione, finestra) si ricalcola sempre', () => {
  for (const finger of [true, false]) {
    assert.equal(shouldRecompute({ ...still, widthChanged: true, msSinceScroll: 0, finger }), true)
  }
})

test('subito dopo una rotazione si accetta anche la sola altezza, poi non più', () => {
  assert.equal(shouldRecompute({ ...still, msSinceRotation: SETTLE_MS - 1, msSinceScroll: 0, finger: true }), true)
  assert.equal(shouldRecompute({ ...still, msSinceRotation: SETTLE_MS, msSinceScroll: 0, finger: true }), false)
})

test('senza variazioni non si riscrive niente', () => {
  assert.equal(shouldRecompute({ ...still, heightChanged: false, finger: false }), false)
})
