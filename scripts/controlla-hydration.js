/*
 * Controlla che l'aggancio di React alle pagine pre-renderizzate non si rompa.
 *
 *   npm run hydration          # tutte le rotte
 *   npm run hydration -- --rompi   # autotest: rompe apposta, DEVE fallire
 *
 * Cos'è l'hydration. Il sito viene servito due volte: prima l'HTML statico
 * scritto in build (che è ciò che vede Google e ciò che si legge subito), poi
 * React si aggancia a quel markup invece di ridisegnarlo, per attaccarci i
 * gestori di eventi. L'aggancio riesce a una condizione: quello che React
 * disegna in memoria deve combaciare con l'HTML che trova. Se non combacia,
 * React butta via il markup buono e ridisegna tutto nel browser — la pagina
 * lampeggia, il lavoro del pre-rendering è sprecato, e se un componente lancia
 * durante l'aggancio la pagina resta bianca (per quello c'è `ErrorBoundary`).
 *
 * Perché serve un controllo. Il codice è pieno di decisioni prese apposta per
 * non romperlo, e nessuna di esse è evidente guardando il file: l'anno del
 * copyright fissato alla build (`__ANNO_BUILD__` in vite.config.js), il
 * consenso che in pre-rendering vale sempre `null` (`versioneServer` in
 * consenso.js), il banner che non entra nell'HTML statico (`useMontato`), la
 * navbar che parte visibile, la prima slide del carosello che è l'unica con un
 * `src`. Basta un `new Date()` dentro un componente, o uno stato iniziale che
 * legge `localStorage`, e uno di quei contratti salta senza che nulla protesti.
 *
 * Come li vede. In produzione React non stampa gli avvisi leggibili dello
 * sviluppo: segnala gli errori recuperabili con `reportError`, che emette un
 * evento 'error' su window, e li si riconosce dai codici React #418 (l'HTML
 * non combacia), #423 e #425. Si ascoltano quelli, più le eccezioni.
 *
 * ⚠️ NON è agganciato a `prebuild`: gli serve un browser e un server avviato,
 * che su Netlify non ci sono. Va lanciato a mano dopo aver toccato qualcosa di
 * sensibile all'aggancio. Dura un paio di minuti.
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
  /*
   * Autotest. Altera il DOM pre-renderizzato PRIMA che React si agganci, così
   * quello che trova non è più quello che si aspetta. Serve a dimostrare che
   * il rilevatore vede davvero: un controllo che non fallisce mai non
   * controlla niente. Con `--rompi` OGNI pagina deve risultare rotta.
   */
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
