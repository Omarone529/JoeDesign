/*
 * `clip()` scrive le meta description, cioè le righe che si leggono nei
 * risultati di Google. Il taglio è la parte che si sbaglia: una descrizione
 * troncata a metà parola vale meno di una più corta ma finita, e una che
 * sfora viene tagliata da Google dove capita.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clip } from '../src/seo.js'

test('un testo già corto passa intero', () => {
  assert.equal(clip('Lampada da tavolo in PLA.'), 'Lampada da tavolo in PLA.')
})

test('gli a capo e gli spazi doppi si appianano', () => {
  assert.equal(clip('Due   righe\n  e uno spazio.'), 'Due righe e uno spazio.')
})

test('chiude sulla frase intera quando ce n’è una che ci sta', () => {
  const t = 'Prima frase corta. Seconda frase molto più lunga che da sola supererebbe il limite imposto qui.'
  assert.equal(clip(t, 60, 15), 'Prima frase corta.')
})

test('ma una frase troppo corta perde contro il taglio lungo', () => {
  /*
   * È il senso del terzo parametro, `min`. Chiudere su una frase intera vale
   * finché la frase dice qualcosa: «Prima frase corta.» in un risultato di
   * ricerca lascia due terzi di riga vuota, e mezza frase in più — puntini
   * compresi — informa di più. Sotto `min` vince quindi il taglio sulla parola.
   */
  const t = 'Prima frase corta. Seconda frase molto più lunga che da sola supererebbe il limite imposto qui.'
  const out = clip(t, 60, 80)
  assert.ok(out.startsWith('Prima frase corta. Seconda'), out)
  assert.ok(out.endsWith('…'), out)
})

test('se nemmeno la prima frase ci sta, taglia sulla parola e mette i puntini', () => {
  const t = 'Una frase unica senza punteggiatura interna che continua molto oltre il limite consentito.'
  const out = clip(t, 40)
  assert.ok(out.endsWith('…'), out)
  assert.ok(out.length <= 40, `lunga ${out.length}`)
  // Non deve troncare a metà parola: prima dei puntini c'è una parola intera.
  assert.ok(t.startsWith(out.slice(0, -1)), out)
})

test('non supera mai il massimo richiesto', () => {
  const t = 'Frase. '.repeat(80)
  for (const max of [60, 100, 155, 200]) {
    assert.ok(clip(t, max).length <= max, `max ${max}`)
  }
})
