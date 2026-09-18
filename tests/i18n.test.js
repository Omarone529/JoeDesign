/*
 * Parità it/en di i18n.js: chiavi, tipi, argomenti, lunghezze. `texts(lang)` non ripiega
 * sull'italiano, e una funzione mancante lancia in render (pagina bianca).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LANGS, DEFAULT_LANG, texts } from '../src/i18n.js'

// Ogni foglia come `pathFor → kind`, indici compresi.
function paths(value, prefix = '', inside = new Map()) {
  if (typeof value === 'function') {
    inside.set(prefix, `funzione(${value.length} argomenti)`)
  } else if (Array.isArray(value)) {
    inside.set(prefix, `elenco di ${value.length}`)
    value.forEach((v, i) => paths(v, `${prefix}.${i}`, inside))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      paths(v, prefix ? `${prefix}.${k}` : k, inside)
    }
  } else {
    inside.set(prefix, typeof value)
  }
  return inside
}

const it = paths(texts('it'))
const en = paths(texts('en'))

test('le due lingue dicono le stesse cose: nessuna voce solo da una parte', () => {
  const onlyIt = [...it.keys()].filter((k) => !en.has(k))
  const onlyEn = [...en.keys()].filter((k) => !it.has(k))
  assert.deepEqual(onlyIt, [], `voci senza traduzione inglese: ${onlyIt.join(', ')}`)
  assert.deepEqual(onlyEn, [], `voci inglesi che non esistono in italiano: ${onlyEn.join(', ')}`)
})

test('e le dicono nella stessa forma: stesso tipo, stessi argomenti, stessa lunghezza', () => {
  const mismatched = [...it]
    .filter(([k, shape]) => en.has(k) && en.get(k) !== shape)
    .map(([k, shape]) => `${k}: it è ${shape}, en è ${en.get(k)}`)
  assert.deepEqual(mismatched, [], `forma diversa fra le lingue:\n  ${mismatched.join('\n  ')}`)
})

test('nessuna voce è rimasta vuota', () => {
  const empty = [...LANGS].flatMap((lang) =>
    [...paths(texts(lang))]
      .filter(([, shape]) => shape === 'string')
      .filter(([k]) => !readValue(texts(lang), k).trim())
      .map((v) => `${lang}.${v[0]}`),
  )
  assert.deepEqual(empty, [], `voci vuote: ${empty.join(', ')}`)
})

/* Segue un percorso puntato (`privacy.sezioni.0.titolo`) fin dentro gli array. */
function readValue(root, pathFor) {
  return pathFor.split('.').reduce((o, k) => o[k], root)
}

test('ogni lingua dichiara come si chiama, per <html lang> e per i meta', () => {
  for (const lang of LANGS) {
    const T = texts(lang)
    // `htmlLang` lo leggono le sintesi vocali, `ogLocale` le anteprime dei link,
    // `schemaLang` i dati strutturati: mancandone uno il difetto si vede fuori dal sito.
    for (const field of ['htmlLang', 'ogLocale', 'schemaLang', 'label']) {
      assert.equal(typeof T[field], 'string', `${lang}: manca ${field}`)
      assert.ok(T[field].trim(), `${lang}: ${field} è vuoto`)
    }
  }
})

test('una lingua che non esiste ripiega sull’italiano invece di rompere', () => {
  // Dall'URL può arrivare di tutto: `texts()` non deve mai tornare undefined,
  // o il primo `T.nav.home` lancia.
  for (const wrong of [undefined, null, '', 'fr', 'IT', 'en-US']) {
    assert.equal(texts(wrong), texts(DEFAULT_LANG))
  }
})
