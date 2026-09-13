// Indirizzi e lingue. Il test chiave: ogni rotta generata da `percorso()` si rilegge con `parsePath()`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parsePath, percorso, percorsoTradotto } from '../src/rotte.js'
import { archive, aree, areaDi } from '../src/data/siteData.js'

const LINGUE = ['it', 'en']

test('la radice è la home italiana, /en la home inglese', () => {
  assert.equal(parsePath('/').name, 'home')
  assert.equal(parsePath('/').lang, 'it')
  assert.equal(parsePath('/en').name, 'home')
  assert.equal(parsePath('/en').lang, 'en')
})

test('le pagine di servizio si riconoscono in tutte e due le lingue', () => {
  assert.equal(parsePath('/chi-sono').name, 'about')
  assert.equal(parsePath('/en/about').name, 'about')
  assert.equal(parsePath('/privacy').name, 'privacy')
  assert.equal(parsePath('/en/privacy').lang, 'en')
})

test('lo slash finale non cambia la pagina', () => {
  assert.deepEqual(parsePath('/chi-sono/').name, parsePath('/chi-sono').name)
  assert.equal(parsePath('/en/about///').name, 'about')
})

test("l'area si riconosce solo se esiste davvero", () => {
  assert.equal(parsePath('/archivio').area, null)
  assert.equal(parsePath('/archivio/product-design').area, 'product-design')
  // Un'area inventata non è una griglia vuota: è una pagina che non c'è.
  assert.equal(parsePath('/archivio/scultura').name, 'notfound')
})

test('uno slug di progetto sconosciuto è una 404, non una scheda vuota', () => {
  assert.equal(parsePath(`/progetto/${archive[0].slug}`).name, 'project')
  assert.equal(parsePath('/progetto/non-esiste').name, 'notfound')
})

test('la 404 sotto /en resta inglese', () => {
  const r = parsePath('/en/qualunque-cosa')
  assert.equal(r.name, 'notfound')
  assert.equal(r.lang, 'en')
})

test('gli slug percent-encoded si decodificano', () => {
  const slug = archive[0].slug
  assert.equal(parsePath(`/progetto/${encodeURIComponent(slug)}`).slug, slug)
})

test('percorsoTradotto dà la gemella, e per la 404 la home', () => {
  const it = parsePath('/chi-sono')
  assert.equal(percorsoTradotto(it, 'en'), '/en/about')
  assert.equal(percorsoTradotto(parsePath('/en/refuso'), 'it'), '/')
})

test('una lingua non valida ripiega sull’italiano invece di rompere', () => {
  assert.equal(percorso('about', {}, 'de'), '/chi-sono')
  assert.equal(percorso('about', {}, undefined), '/chi-sono')
})

test('ogni indirizzo generato viene riletto come la pagina che è', () => {
  for (const lang of LINGUE) {
    const casi = [
      ['home', {}],
      ['about', {}],
      ['archive', {}],
      ['privacy', {}],
      ...aree.map((a) => ['archive', { area: a.slug }]),
      ...archive.map((p) => ['project', { slug: p.slug }]),
    ]
    for (const [nome, params] of casi) {
      const url = percorso(nome, params, lang)
      const letta = parsePath(url)
      assert.equal(letta.name, nome, `${url} letta come "${letta.name}" invece di "${nome}"`)
      assert.equal(letta.lang, lang, `${url} letta in "${letta.lang}" invece di "${lang}"`)
      if (params.area) assert.equal(letta.area, params.area, url)
      if (params.slug) assert.equal(letta.slug, params.slug, url)
    }
  }
})

test('nessuno slug di progetto collide con un segmento di pagina', () => {
  // Uno slug "privacy" o "about" renderebbe irraggiungibile quella pagina.
  const riservati = new Set(['chi-sono', 'about', 'archivio', 'archive', 'privacy', 'progetto', 'project', 'en'])
  for (const p of archive) {
    assert.ok(!riservati.has(p.slug), `lo slug "${p.slug}" è anche un segmento di pagina`)
  }
})

test('ogni progetto sta in un’area che esiste', () => {
  const chiavi = new Set(aree.map((a) => a.chiave))
  for (const p of archive) {
    assert.ok(chiavi.has(areaDi(p)), `"${p.slug}" dichiara l'area "${areaDi(p)}"`)
  }
})
