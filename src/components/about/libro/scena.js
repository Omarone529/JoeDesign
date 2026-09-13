import {
  ALTEZZA_MONDO,
  LARGHEZZA_MONDO,
  M_COLONNE,
  SCARTO_PILA,
  angoliVertici,
  calcolaColonne,
} from './geometria'

// Scena Three.js del libro: renderer, camera, luci, texture e `smaltisci()`. Niente React né gesti.

const FOV_VERTICALE = 18 // obiettivo leggermente tele: meno "bombatura" prospettica della pagina in volo
const ROT_X_LIBRO = -0.1
export const ROT_Y_LIBRO = 0.07
// Deve combaciare con l'aspect-ratio CSS del widget: la camera è fissa e il
// libro non cambia mai scala.
const ASPETTO_LIBRO = 2000 / 1415
const K_LARGHEZZA = 2 * Math.tan((FOV_VERTICALE * Math.PI) / 360) * ASPETTO_LIBRO
// Esportata: la serve anche il trascinamento, per convertire i pixel del
// dito in unità del mondo (vedi `mondoPerPx` in Sketchbook.jsx).
export const MARGINE_CAMERA = 1.12
// Il canvas sborda (-inset-[12%] nel JSX): a metà giro la pagina si proietta
// più grande del libro e senza sbordo verrebbe tagliata sopra e sotto.
const MARGINE_TELA = 1.24
const DISTANZA_CAMERA = (2 * LARGHEZZA_MONDO * MARGINE_CAMERA * MARGINE_TELA) / K_LARGHEZZA
// Nitidezza delle tavole. Una pagina occupa sempre questa frazione della
// larghezza del canvas (la camera è fissa): da qui si ricava in quanti pixel
// reali viene disegnata, e quindi come conviene filtrarne la texture.
const QUOTA_PAGINA = LARGHEZZA_MONDO / (2 * LARGHEZZA_MONDO * MARGINE_CAMERA * MARGINE_TELA)
// Tavole da 1000px col mouse, mezze da 500px col dito (un terzo della memoria video).
const LARGHEZZA_TAVOLA = { dito: 500, mouse: 1000 }
export const tavolaPer = (src, dito) => (dito ? src.replace(/\.webp$/, '-mezza.webp') : src)
// Rapporto texture/schermo sotto il quale i mipmap tolgono solo dettaglio:
// il livello scelto cade tra 0 e 1 e il trilineare ci mescola dentro una copia
// a metà risoluzione. Vicino all'1:1 conviene campionare la texture piena.
const SOGLIA_MIPMAP = 1.4

// `pointer: coarse` = GPU da telefono: ombre, pixel ratio, anisotropia e tavole si abbassano.
export const suDito = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true

// Mappa d'ombra: è un secondo render dell'intera scena, a ogni fotogramma.
// A 2048² sono quattro milioni di texel per un libro che sullo schermo di un
// telefono ne occupa settantamila: il quarto basta e non si vede la differenza.
const OMBRA_PX = { dito: 1024, mouse: 2048 }
// Campioni per pixel sulle tavole. Il libro si guarda quasi di faccia, quindi
// l'anisotropia serve poco: sedici prelievi per frammento sono soldi buttati.
const ANISOTROPIA = { dito: 4, mouse: 16 }
// Il canvas sborda del 24%, quindi su un telefono a 3x un riquadro da 350px
// diventerebbe 1300 pixel per lato. 1.5 è comunque il minimo che il testo
// piccolo delle tavole richiede (vedi `rapportoPixel`).
const PIXEL_MAX = { dito: 1.5, mouse: 2 }

// Monta la scena; `null` se manca WebGL o il componente è stato smontato.
export async function creaScena({ THREE, contenitore, tavole, paginaIniziale, attivo }) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  } catch {
    return null // niente WebGL: resta la copertina statica di scorta
  }

  const scena = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV_VERTICALE, ASPETTO_LIBRO, DISTANZA_CAMERA - 3.5, DISTANZA_CAMERA + 2.5)
  camera.position.set(-LARGHEZZA_MONDO / 2, 0, DISTANZA_CAMERA)
  camera.lookAt(-LARGHEZZA_MONDO / 2, 0, 0)

  // Almeno 1.5 per il testo piccolo delle tavole; oltre 2 non si vede differenza.
  const dito = suDito()
  const rapportoPixel = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), dito ? PIXEL_MAX.dito : PIXEL_MAX.mouse)
  renderer.setPixelRatio(rapportoPixel)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  // Il filtro morbido moltiplica i prelievi sulla mappa: sul telefono il PCF
  // semplice, che ha il bordo appena più netto e costa una frazione.
  renderer.shadowMap.type = dito ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap
  renderer.setClearColor(0x000000, 0)
  contenitore.appendChild(renderer.domElement)

  // Un render per frame: col mouse arrivano 125–1000 eventi al secondo, e
  // senza coalescenza si renderizza più volte per frame e scatta.
  let frameRichiesto = 0
  const richiediRender = () => {
    if (frameRichiesto) return
    frameRichiesto = requestAnimationFrame(() => {
      frameRichiesto = 0
      renderer.render(scena, camera)
    })
  }
  const fermaRender = () => cancelAnimationFrame(frameRichiesto)

  scena.add(new THREE.AmbientLight(0xffffff, 0.55))
  scena.add(new THREE.HemisphereLight(0xfff7ee, 0xd7d4cf, 0.4))
  // Quasi frontale: angolata, la pagina a metà giro sparerebbe un'ombra
  // lontano dal libro.
  const direzionale = new THREE.DirectionalLight(0xfff9f0, 1.35)
  direzionale.position.set(0.9, 1.4, 4.0)
  direzionale.castShadow = true
  direzionale.shadow.mapSize.set(
    dito ? OMBRA_PX.dito : OMBRA_PX.mouse,
    dito ? OMBRA_PX.dito : OMBRA_PX.mouse,
  )
  // Deve contenere la pila girata a sinistra e la pagina in volo: più
  // stretto e le ombre spariscono ai bordi, più largo e si sprecano texel.
  direzionale.shadow.camera.left = -LARGHEZZA_MONDO * 1.8
  direzionale.shadow.camera.right = LARGHEZZA_MONDO * 1.1
  direzionale.shadow.camera.top = ALTEZZA_MONDO * 0.8
  direzionale.shadow.camera.bottom = -ALTEZZA_MONDO * 0.95
  direzionale.shadow.camera.near = 0.5
  direzionale.shadow.camera.far = 12
  // Contro l'acne e le ombre "trapelate" tra fogli sottili e ravvicinati.
  direzionale.shadow.bias = -0.0002
  direzionale.shadow.normalBias = 0.02
  scena.add(direzionale)

  const libroGruppo = new THREE.Group()
  libroGruppo.rotation.x = ROT_X_LIBRO
  libroGruppo.rotation.y = ROT_Y_LIBRO
  scena.add(libroGruppo)

  // Alone pre-sfumato e non un piano che riceve le ombre vere: quella della
  // pagina in volo finirebbe lontano dal libro. Nemmeno un drop-shadow CSS,
  // che va ricalcolato a ogni frame e su mobile scatta.
  const telaAlone = document.createElement('canvas')
  telaAlone.width = 256
  telaAlone.height = 256
  const ctxAlone = telaAlone.getContext('2d')
  const gradAlone = ctxAlone.createRadialGradient(128, 128, 30, 128, 128, 128)
  gradAlone.addColorStop(0, 'rgba(20,17,15,0.38)')
  gradAlone.addColorStop(0.5, 'rgba(20,17,15,0.22)')
  gradAlone.addColorStop(0.75, 'rgba(20,17,15,0.08)')
  gradAlone.addColorStop(1, 'rgba(20,17,15,0)')
  ctxAlone.fillStyle = gradAlone
  ctxAlone.fillRect(0, 0, 256, 256)
  const alone = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(telaAlone),
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  )
  // Opposto alla luce, come una vera ombra di contatto.
  alone.position.set(-LARGHEZZA_MONDO / 2 - 0.12, -0.16, -0.05)
  libroGruppo.add(alone)

  // Incavo lungo la costa: a libro aperto la luce lì non arriva.
  const telaGutter = document.createElement('canvas')
  telaGutter.width = 256
  telaGutter.height = 4
  const ctxGutter = telaGutter.getContext('2d')
  const gradiente = ctxGutter.createLinearGradient(0, 0, telaGutter.width, 0)
  gradiente.addColorStop(0, '#000')
  gradiente.addColorStop(0.3, '#111')
  gradiente.addColorStop(0.42, '#666')
  gradiente.addColorStop(0.5, '#fff')
  gradiente.addColorStop(0.58, '#666')
  gradiente.addColorStop(0.7, '#111')
  gradiente.addColorStop(1, '#000')
  ctxGutter.fillStyle = gradiente
  ctxGutter.fillRect(0, 0, telaGutter.width, telaGutter.height)
  const gutterMat = new THREE.MeshBasicMaterial({
    color: 0x14110f,
    alphaMap: new THREE.CanvasTexture(telaGutter),
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
  const gutter = new THREE.Mesh(new THREE.PlaneGeometry(LARGHEZZA_MONDO * 0.45, ALTEZZA_MONDO), gutterMat)
  gutter.position.set(-LARGHEZZA_MONDO / 2, 0, tavole.length * SCARTO_PILA + 0.01)
  gutter.renderOrder = 2
  libroGruppo.add(gutter)

  const spinaGruppo = new THREE.Group()
  spinaGruppo.position.x = -LARGHEZZA_MONDO / 2
  libroGruppo.add(spinaGruppo)

  // Pixel reali di una pagina, misurati una volta all'avvio.
  const larghezzaTavola = dito ? LARGHEZZA_TAVOLA.dito : LARGHEZZA_TAVOLA.mouse
  const pxPagina = (contenitore.getBoundingClientRect().width || 0) * rapportoPixel * QUOTA_PAGINA
  const senzaMipmap = pxPagina > 0 && larghezzaTavola < pxPagina * SOGLIA_MIPMAP

  const caricatore = new THREE.TextureLoader()
  const caricaTexture = (src) =>
    new Promise((risolvi) => {
      caricatore.load(
        src,
        (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = Math.min(
        renderer.capabilities.getMaxAnisotropy(),
        dito ? ANISOTROPIA.dito : ANISOTROPIA.mouse,
      )
      if (senzaMipmap) {
        // Vicino all'1:1 il mipmap è solo una copia sfocata in più:
        // meglio campionare la tavola piena.
        tex.generateMipmaps = false
        tex.minFilter = THREE.LinearFilter
      }
      risolvi(tex)
        },
        undefined,
        () => risolvi(null)
      )
    })

  const creaGeometriaFaccia = (specchiaU) => {
    const geo = new THREE.BufferGeometry()
    const nVert = (M_COLONNE + 1) * 2
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nVert * 3), 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nVert * 3), 3))
    const uv = new Float32Array(nVert * 2)
    for (let v = 0; v <= M_COLONNE; v += 1) {
      const u = specchiaU ? 1 - v / M_COLONNE : v / M_COLONNE
      uv[v * 4 + 0] = u
      uv[v * 4 + 1] = 1 // riga alta
      uv[v * 4 + 2] = u
      uv[v * 4 + 3] = 0 // riga bassa
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    const indici = []
    for (let s = 0; s < M_COLONNE; s += 1) {
      const a = s * 2
      const b = s * 2 + 1
      const c = (s + 1) * 2
      const d = (s + 1) * 2 + 1
      indici.push(a, b, c, c, b, d)
    }
    geo.setIndex(indici)
    geo.setDrawRange(0, 0) // niente da disegnare finché applicaGeometria non la riempie
    return geo
  }

  // Fronte e retro condividono la forma: questa riempie una faccia sola.
  const applicaGeometria = (geo, posX, posZ, angoliVert) => {
    const pos = geo.attributes.position.array
    const norm = geo.attributes.normal.array
    for (let v = 0; v <= M_COLONNE; v += 1) {
      const x = posX[v] * LARGHEZZA_MONDO
      const z = posZ[v] * LARGHEZZA_MONDO
      const a = angoliVert[v]
      const nx = Math.sin(a)
      const nz = Math.cos(a)
      const iAlto = v * 6
      const iBasso = v * 6 + 3
      pos[iAlto] = x
      pos[iAlto + 1] = ALTEZZA_MONDO / 2
      pos[iAlto + 2] = z
      pos[iBasso] = x
      pos[iBasso + 1] = -ALTEZZA_MONDO / 2
      pos[iBasso + 2] = z
      norm[iAlto] = nx
      norm[iAlto + 1] = 0
      norm[iAlto + 2] = nz
      norm[iBasso] = nx
      norm[iBasso + 1] = 0
      norm[iBasso + 2] = nz
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.normal.needsUpdate = true
    geo.setDrawRange(0, M_COLONNE * 6)
    geo.computeBoundingSphere()
  }

  const paginaColorePaper = new THREE.Color('#f4f3f1')

  // Dichiarate qui: `ridimensiona()` le legge subito, più in basso sarebbero nella zona morta del `let`.
  let osservatoreResize = null
  let pronta = false

  let ultimaApertura = 0
  const inquadra = (apertura) => {
    ultimaApertura = apertura
    const apriSx = Math.min(1, apertura)
    const apriDx = Math.min(1, tavole.length - apertura)
    const centro = -LARGHEZZA_MONDO / 2 + (apriDx - apriSx) * (LARGHEZZA_MONDO / 2)
    const altezzaVista = 2 * Math.tan((FOV_VERTICALE * Math.PI) / 360) * DISTANZA_CAMERA
    const larghezzaVista = altezzaVista * camera.aspect
    const ingombro = MARGINE_CAMERA * MARGINE_TELA
    const larghezzaLibro = Math.max(apriSx + apriDx, 0.001) * LARGHEZZA_MONDO
    camera.zoom = Math.min(
      larghezzaVista / (larghezzaLibro * ingombro),
      altezzaVista / (ALTEZZA_MONDO * ingombro),
    )
    camera.position.x = centro
    camera.lookAt(centro, 0, 0)
    camera.updateProjectionMatrix()
  }


  const ridimensiona = () => {
    const rect = contenitore.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return
    renderer.setSize(rect.width, rect.height, true)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
    // Il rapporto del riquadro cambia da `sm` in giù: lo zoom va rifatto,
    // o il libro resta inquadrato per il formato di prima.
    inquadra(ultimaApertura)
    if (pronta) richiediRender()
  }
  ridimensiona()


  // Memoria video da liberare a mano: prima il fotogramma in coda, il renderer per ultimo.
  const smaltisci = () => {
    osservatoreResize?.disconnect()
    fermaRender()
    scena.traverse((oggetto) => {
      if (oggetto.isMesh) {
        oggetto.geometry.dispose()
        const materiali = Array.isArray(oggetto.material) ? oggetto.material : [oggetto.material]
        materiali.forEach((m) => {
          m.map?.dispose()
          m.alphaMap?.dispose()
          m.dispose()
        })
      }
    })
    renderer.dispose()
  }

  osservatoreResize = new ResizeObserver(ridimensiona)
  osservatoreResize.observe(contenitore)

  const texturePagine = await Promise.all(
    tavole.map(async (tavola) => ({
      fronte: await caricaTexture(tavolaPer(tavola.front.src, dito)),
      retro: tavola.back ? await caricaTexture(tavolaPer(tavola.back.src, dito)) : null,
    }))
  )
  if (!attivo()) {
    smaltisci()
    return null
  }
  const pagine = texturePagine.map((tex, i) => {
      const gruppo = new THREE.Group()
      gruppo.rotation.y = i < paginaIniziale ? -Math.PI : 0
      spinaGruppo.add(gruppo) // la z la mette posizionaLibro, qui sotto

      const fronteGeo = creaGeometriaFaccia(false)
      const fronteMat = new THREE.MeshStandardMaterial({
        map: tex.fronte,
        roughness: 0.86,
        metalness: 0,
        side: THREE.FrontSide,
      })
      const fronteMesh = new THREE.Mesh(fronteGeo, fronteMat)
      fronteMesh.castShadow = true
      fronteMesh.receiveShadow = true
      gruppo.add(fronteMesh)

      const retroGeo = creaGeometriaFaccia(true)
      const retroMat = tex.retro
        ? new THREE.MeshStandardMaterial({ map: tex.retro, roughness: 0.86, metalness: 0, side: THREE.BackSide })
        : new THREE.MeshStandardMaterial({ color: paginaColorePaper, roughness: 0.92, metalness: 0, side: THREE.BackSide })
      const retroMesh = new THREE.Mesh(retroGeo, retroMat)
      retroMesh.castShadow = true
      retroMesh.receiveShadow = true
      gruppo.add(retroMesh)

      // Applicato subito: niente frame vuoto prima della prima interazione.
      const { posX, posZ, angoliSegmento } = calcolaColonne(0)
      const angoliVert = angoliVertici(angoliSegmento)
      applicaGeometria(fronteGeo, posX, posZ, angoliVert)
      applicaGeometria(retroGeo, posX, posZ, angoliVert)

      return { gruppo, fronteGeo, retroGeo }
    })


  pronta = true
  return {
    THREE,
    renderer,
    scena,
    camera,
    libroGruppo,
    pagine,
    alone,
    gutterMat,
    applicaGeometria,
    richiediRender,
    fermaRender,
    inquadra,
    ridimensiona,
    smaltisci,
  }
}
