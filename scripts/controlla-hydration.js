/*
 * Verifica che React si agganci alle pagine pre-renderizzate senza ridisegnarle (errori #418,
 * #423, #425). npm run hydration; `-- --rompi` è l'autotest e deve fallire.
 * Serve build e Chromium: non è in prebuild. Vedi CLAUDE.md.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ROMPI = process.argv.includes('--rompi')
const attesa = (ms) => new Promise((r) => setTimeout(r, ms))

/* Un Chromium qualsiasi: quello di Playwright se c'è, o CHROME_PATH, o Chrome. */
function trovaBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright')
  if (fs.existsSync(cache)) {
    for (const d of fs.readdirSync(cache)) {
      for (const rel of ['chrome-headless-shell-mac-arm64/chrome-headless-shell',
                         'chrome-headless-shell-mac-x64/chrome-headless-shell',
                         'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
        const p = path.join(cache, d, rel)
        if (fs.existsSync(p)) return p
      }
    }
  }
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  return fs.existsSync(chrome) ? chrome : null
}

const BIN = trovaBrowser()
if (!BIN) {
  console.error('Nessun browser trovato. Indicane uno con CHROME_PATH=/percorso/al/binario,')
  console.error('oppure installa Chromium: npx --yes playwright install chromium')
  process.exit(2)
}

const distSsr = path.join(root, 'dist-ssr', 'entry-server.js')
if (!fs.existsSync(distSsr) || !fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('Manca la build. Lancia prima `npm run build`.')
  process.exit(2)
}
const { allRoutes } = await import(pathToFileURL(distSsr).href)
const rotte = allRoutes()

/* Server di anteprima: lo avvia e lo spegne da sé. */
const server = spawn('npx', ['vite', 'preview', '--port', '4178', '--strictPort'], { cwd: root, stdio: 'ignore' })
const BASE = 'http://localhost:4178'
let su = false
for (let i = 0; i < 60 && !su; i += 1) {
  await attesa(250)
  try { su = (await fetch(BASE + '/')).ok } catch { /* non ancora */ }
}
if (!su) { server.kill(); console.error('Il server di anteprima non è partito.'); process.exit(2) }

const browser = spawn(BIN, ['--remote-debugging-port=9351', '--headless=new', '--no-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  `--user-data-dir=${path.join(os.tmpdir(), 'joe-hydration')}`, '--window-size=1400,1000', 'about:blank'], { stdio: 'ignore' })

const chiudi = (codice) => {
  try { browser.kill() } catch { /* già morto */ }
  try { server.kill() } catch { /* già morto */ }
  process.exit(codice)
}

let bersaglio
for (let i = 0; i < 40 && !bersaglio; i += 1) {
  await attesa(250)
  try { bersaglio = (await (await fetch('http://127.0.0.1:9351/json/list')).json()).find((x) => x.type === 'page') } catch { /* non ancora */ }
}
if (!bersaglio) { console.error('Il browser non risponde.'); chiudi(2) }

const ws = new WebSocket(bersaglio.webSocketDebuggerUrl)
await new Promise((r) => { ws.onopen = r })
let id = 0
const pendenti = new Map()
let raccolta = []
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pendenti.has(m.id)) { pendenti.get(m.id)(m); pendenti.delete(m.id); return }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
    raccolta.push('console.error: ' + m.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
  if (m.method === 'Runtime.exceptionThrown')
    raccolta.push('eccezione: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text))
}
const cdp = (metodo, params = {}) =>
  new Promise((res) => { const n = ++id; pendenti.set(n, res); ws.send(JSON.stringify({ id: n, method: metodo, params })) })
const js = async (e) =>
  (await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result?.result?.value

await cdp('Runtime.enable')
await cdp('Page.enable')

// `reportError` emette un evento 'error' su window: è lì che React 18 in
// produzione segnala gli errori recuperabili dell'aggancio.
let iniezione = `window.__hy=[];addEventListener('error',e=>{window.__hy.push('window.error: '+((e.error&&(e.error.message||e.error))||e.message))});`
if (ROMPI) {
  // Autotest: altera il DOM prima dell'aggancio. Con --rompi ogni pagina deve risultare rotta.
  iniezione += `new MutationObserver((m,o)=>{const r=document.getElementById('root');
    if(r&&r.firstElementChild){const h=r.querySelector('h1,h2,div');
      if(h){h.append(document.createTextNode(' GUASTO'));o.disconnect()}}}).observe(document,{childList:true,subtree:true});`
}
await cdp('Page.addScriptToEvaluateOnNewDocument', { source: iniezione })

// I codici con cui React 18 minificato segnala un aggancio fallito.
const SEGNALE = /hydrat|did not match|Minified React error #(418|422|423|425)|text content|server.*client/i

const rotti = []
for (const r of rotte) {
  raccolta = []
  await cdp('Page.navigate', { url: BASE + (r === '/' ? '/' : r + '/') })
  for (let i = 0; i < 60; i += 1) {
    await attesa(100)
    if (await js('document.readyState==="complete"')) break
  }
  await attesa(700) // margine perché l'aggancio finisca
  const daPagina = JSON.parse((await js('JSON.stringify(window.__hy||[])')) || '[]')
  const problemi = [...raccolta, ...daPagina].filter((m) => SEGNALE.test(m))
  if (problemi.length) rotti.push({ rotta: r, problemi })
}

console.log(`  pagine controllate: ${rotte.length}`)
if (rotti.length) {
  console.error(`  ✗ aggancio rotto su ${rotti.length} pagine:`)
  for (const x of rotti.slice(0, 10)) console.error(`      ${x.rotta}\n        ${x.problemi[0].slice(0, 160)}`)
  if (rotti.length > 10) console.error(`      … e altre ${rotti.length - 10}`)
  if (ROMPI) { console.log('\n  (autotest: il rilevatore vede il guasto simulato — è il risultato atteso)'); chiudi(0) }
  chiudi(1)
}
if (ROMPI) {
  console.error('\n  ✗ AUTOTEST FALLITO: il guasto è stato iniettato e nessuno se n’è accorto.')
  console.error('    Il rilevatore non funziona più — non fidarsi dei suoi esiti verdi.')
  chiudi(1)
}
console.log('  ✓ nessun disallineamento: React si aggancia a tutte le pagine pre-renderizzate')
chiudi(0)
