/*
 * Verifica che React si agganci alle pagine pre-renderizzate senza ridisegnarle (errori #418,
 * #423, #425). npm run hydration; `-- --break` è l'autotest e deve fallire.
 * Serve build e Chromium: non è in prebuild. Vedi CLAUDE.md.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BREAK = process.argv.includes('--break')
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/* Un Chromium qualsiasi: quello di Playwright se c'è, o CHROME_PATH, o Chrome. */
const CACHE_PLAYWRIGHT = [
  path.join(os.homedir(), 'Library/Caches/ms-playwright'),
  path.join(process.env.LOCALAPPDATA || os.homedir(), 'ms-playwright'),
  path.join(os.homedir(), '.cache/ms-playwright'),
]
const INSIDE_CACHE = [
  'chrome-headless-shell-mac-arm64/chrome-headless-shell',
  'chrome-headless-shell-mac-x64/chrome-headless-shell',
  'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
  'chrome-headless-shell-win64/chrome-headless-shell.exe',
  'chrome-win64/chrome.exe',
  'chrome-win/chrome.exe',
  'chrome-headless-shell-linux/chrome-headless-shell',
  'chrome-linux/chrome',
]
const SYSTEM_CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]

function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  for (const cache of CACHE_PLAYWRIGHT) {
    if (!fs.existsSync(cache)) continue
    for (const d of fs.readdirSync(cache)) {
      for (const rel of INSIDE_CACHE) {
        const p = path.join(cache, d, rel)
        if (fs.existsSync(p)) return p
      }
    }
  }
  return SYSTEM_CHROME.find((p) => fs.existsSync(p)) || null
}

const BIN = findBrowser()
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
const routes = allRoutes()

/* Server di anteprima: lo avvia e lo spegne da sé. */
// Il bin di Vite con questo stesso Node, non `npx`: su Windows npx è un .cmd, che Node rifiuta di eseguire.
const VITE = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
const server = spawn(process.execPath, [VITE, 'preview', '--port', '4178', '--strictPort'], { cwd: root, stdio: 'ignore' })
const BASE = 'http://localhost:4178'
let isUp = false
for (let i = 0; i < 60 && !isUp; i += 1) {
  await wait(250)
  try { isUp = (await fetch(BASE + '/')).ok } catch { /* non ancora */ }
}
if (!isUp) { server.kill(); console.error('Il server di anteprima non è partito.'); process.exit(2) }

const browser = spawn(BIN, ['--remote-debugging-port=9351', '--headless=new', '--no-sandbox',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  `--user-data-dir=${path.join(os.tmpdir(), 'joe-hydration')}`, '--window-size=1400,1000', 'about:blank'], { stdio: 'ignore' })

const close = (code) => {
  try { browser.kill() } catch { /* già morto */ }
  try { server.kill() } catch { /* già morto */ }
  process.exit(code)
}

let debugTarget
for (let i = 0; i < 40 && !debugTarget; i += 1) {
  await wait(250)
  try { debugTarget = (await (await fetch('http://127.0.0.1:9351/json/list')).json()).find((x) => x.type === 'page') } catch { /* non ancora */ }
}
if (!debugTarget) { console.error('Il browser non risponde.'); close(2) }

const ws = new WebSocket(debugTarget.webSocketDebuggerUrl)
await new Promise((r) => { ws.onopen = r })
let id = 0
const pending = new Map()
let collected = []
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
    collected.push('console.error: ' + m.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
  if (m.method === 'Runtime.exceptionThrown')
    collected.push('eccezione: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text))
}
const cdp = (method, params = {}) =>
  new Promise((res) => { const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method: method, params })) })
const js = async (e) =>
  (await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result?.result?.value

await cdp('Runtime.enable')
await cdp('Page.enable')

// `reportError` emette un evento 'error' su window: è lì che React 18 in
// produzione segnala gli errori recuperabili dell'aggancio.
let injection = `window.__hy=[];addEventListener('error',e=>{window.__hy.push('window.error: '+((e.error&&(e.error.message||e.error))||e.message))});`
if (BREAK) {
  // Autotest: altera il DOM prima dell'aggancio. Con --break ogni pagina deve risultare rotta.
  injection += `new MutationObserver((m,o)=>{const r=document.getElementById('root');
    if(r&&r.firstElementChild){const h=r.querySelector('h1,h2,div');
      if(h){h.append(document.createTextNode(' GUASTO'));o.disconnect()}}}).observe(document,{childList:true,subtree:true});`
}
await cdp('Page.addScriptToEvaluateOnNewDocument', { source: injection })

// I codici con cui React 18 minificato segnala un aggancio fallito.
const SIGNAL = /hydrat|did not match|Minified React error #(418|422|423|425)|text content|server.*client/i

const broken = []
for (const r of routes) {
  collected = []
  await cdp('Page.navigate', { url: BASE + (r === '/' ? '/' : r + '/') })
  for (let i = 0; i < 60; i += 1) {
    await wait(100)
    if (await js('document.readyState==="complete"')) break
  }
  await wait(700) // margine perché l'aggancio finisca
  const fromPage = JSON.parse((await js('JSON.stringify(window.__hy||[])')) || '[]')
  const problems = [...collected, ...fromPage].filter((m) => SIGNAL.test(m))
  if (problems.length) broken.push({ route: r, problems })
}

console.log(`  pagine controllate: ${routes.length}`)
if (broken.length) {
  console.error(`  ✗ aggancio rotto su ${broken.length} pagine:`)
  for (const x of broken.slice(0, 10)) console.error(`      ${x.route}\n        ${x.problems[0].slice(0, 160)}`)
  if (broken.length > 10) console.error(`      … e altre ${broken.length - 10}`)
  if (BREAK) { console.log('\n  (autotest: il rilevatore vede il guasto simulato, è il risultato atteso)'); close(0) }
  close(1)
}
if (BREAK) {
  console.error('\n  ✗ AUTOTEST FALLITO: il guasto è stato iniettato e nessuno se n’è accorto.')
  console.error('    Il rilevatore non funziona più: non fidarsi dei suoi esiti verdi.')
  close(1)
}
console.log('  ✓ nessun disallineamento: React si aggancia a tutte le pagine pre-renderizzate')
close(0)
