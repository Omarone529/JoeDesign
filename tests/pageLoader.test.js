// Ogni rotta che parsePath può dare ha la sua pagina da caricare, e il sorgente esiste.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { SOURCES } from '../src/pageLoader.js'

const ROUTES = ['home', 'about', 'privacy', 'archive', 'project', 'notfound']

test('ogni nome di rotta ha una pagina, e nessuna pagina è orfana', () => {
  assert.deepEqual(Object.keys(SOURCES).sort(), [...ROUTES].sort())
})

test('i sorgenti dichiarati per il precaricamento esistono', () => {
  for (const file of Object.values(SOURCES)) assert.ok(fs.existsSync(file), file)
})
