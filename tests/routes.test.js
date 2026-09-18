// Indirizzi e lingue. Il test chiave: ogni rotta generata da `pathFor()` si rilegge con `parsePath()`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parsePath, pathFor, translatedPath } from '../src/routes.js'
import { archive, areas, areaOf } from '../src/data/siteData.js'

const LANGS = ['it', 'en']

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
  assert.equal(translatedPath(it, 'en'), '/en/about')
  assert.equal(translatedPath(parsePath('/en/refuso'), 'it'), '/')
})

test('una lingua non valida ripiega sull’italiano invece di rompere', () => {
  assert.equal(pathFor('about', {}, 'de'), '/chi-sono')
  assert.equal(pathFor('about', {}, undefined), '/chi-sono')
})

test('ogni indirizzo generato viene riletto come la pagina che è', () => {
  for (const lang of LANGS) {
    const cases = [
      ['home', {}],
      ['about', {}],
      ['archive', {}],
      ['privacy', {}],
      ...areas.map((a) => ['archive', { area: a.slug }]),
      ...archive.map((p) => ['project', { slug: p.slug }]),
    ]
    for (const [name, params] of cases) {
      const url = pathFor(name, params, lang)
      const wasRead = parsePath(url)
      assert.equal(wasRead.name, name, `${url} letta come "${wasRead.name}" invece di "${name}"`)
      assert.equal(wasRead.lang, lang, `${url} letta in "${wasRead.lang}" invece di "${lang}"`)
      if (params.area) assert.equal(wasRead.area, params.area, url)
      if (params.slug) assert.equal(wasRead.slug, params.slug, url)
    }
  }
})

test('nessuno slug di progetto collide con un segmento di pagina', () => {
  // Uno slug "privacy" o "about" renderebbe irraggiungibile quella pagina.
  const reserved = new Set(['chi-sono', 'about', 'archivio', 'archive', 'privacy', 'progetto', 'project', 'en'])
  for (const p of archive) {
    assert.ok(!reserved.has(p.slug), `lo slug "${p.slug}" è anche un segmento di pagina`)
  }
})

test('ogni progetto sta in un’area che esiste', () => {
  const keyList = new Set(areas.map((a) => a.key))
  for (const p of archive) {
    assert.ok(keyList.has(areaOf(p)), `"${p.slug}" dichiara l'area "${areaOf(p)}"`)
  }
})
