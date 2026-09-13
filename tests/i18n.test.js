/*
 * Parità it/en di i18n.js: chiavi, tipi, argomenti, lunghezze. `testi(lang)` non ripiega
 * sull'italiano, e una funzione mancante lancia in render (pagina bianca).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LINGUE, LINGUA_PREDEFINITA, testi } from '../src/i18n.js'

// Ogni foglia come `percorso → tipo`, indici compresi.
function percorsi(valore, prefisso = '', dentro = new Map()) {
  if (typeof valore === 'function') {
    dentro.set(prefisso, `funzione(${valore.length} argomenti)`)
  } else if (Array.isArray(valore)) {
    dentro.set(prefisso, `elenco di ${valore.length}`)
    valore.forEach((v, i) => percorsi(v, `${prefisso}.${i}`, dentro))
  } else if (valore && typeof valore === 'object') {
    for (const [k, v] of Object.entries(valore)) {
      percorsi(v, prefisso ? `${prefisso}.${k}` : k, dentro)
    }
  } else {
    dentro.set(prefisso, typeof valore)
  }
  return dentro
}

const it = percorsi(testi('it'))
const en = percorsi(testi('en'))

test('le due lingue dicono le stesse cose: nessuna voce solo da una parte', () => {
  const soloIt = [...it.keys()].filter((k) => !en.has(k))
  const soloEn = [...en.keys()].filter((k) => !it.has(k))
  assert.deepEqual(soloIt, [], `voci senza traduzione inglese: ${soloIt.join(', ')}`)
  assert.deepEqual(soloEn, [], `voci inglesi che non esistono in italiano: ${soloEn.join(', ')}`)
})

test('e le dicono nella stessa forma: stesso tipo, stessi argomenti, stessa lunghezza', () => {
  const diverse = [...it]
    .filter(([k, forma]) => en.has(k) && en.get(k) !== forma)
    .map(([k, forma]) => `${k}: it è ${forma}, en è ${en.get(k)}`)
  assert.deepEqual(diverse, [], `forma diversa fra le lingue:\n  ${diverse.join('\n  ')}`)
})

test('nessuna voce è rimasta vuota', () => {
  const vuote = [...LINGUE].flatMap((lang) =>
    [...percorsi(testi(lang))]
      .filter(([, forma]) => forma === 'string')
      .filter(([k]) => !valoreDi(testi(lang), k).trim())
      .map((v) => `${lang}.${v[0]}`),
  )
  assert.deepEqual(vuote, [], `voci vuote: ${vuote.join(', ')}`)
})

/* Segue un percorso puntato (`privacy.sezioni.0.titolo`) fin dentro gli array. */
function valoreDi(radice, percorso) {
  return percorso.split('.').reduce((o, k) => o[k], radice)
}

test('ogni lingua dichiara come si chiama, per <html lang> e per i meta', () => {
  for (const lang of LINGUE) {
    const T = testi(lang)
    // `htmlLang` lo leggono le sintesi vocali, `ogLocale` le anteprime dei link,
    // `schemaLang` i dati strutturati: mancandone uno il difetto si vede fuori dal sito.
    for (const campo of ['htmlLang', 'ogLocale', 'schemaLang', 'etichetta']) {
      assert.equal(typeof T[campo], 'string', `${lang}: manca ${campo}`)
      assert.ok(T[campo].trim(), `${lang}: ${campo} è vuoto`)
    }
  }
})

test('una lingua che non esiste ripiega sull’italiano invece di rompere', () => {
  // Dall'URL può arrivare di tutto: `testi()` non deve mai tornare undefined,
  // o il primo `T.nav.home` lancia.
  for (const sbagliata of [undefined, null, '', 'fr', 'IT', 'en-US']) {
    assert.equal(testi(sbagliata), testi(LINGUA_PREDEFINITA))
  }
})
