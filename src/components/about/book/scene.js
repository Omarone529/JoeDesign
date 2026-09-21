import {
  WORLD_HEIGHT,
  WORLD_WIDTH,
  M_COLUMNS,
  STACK_GAP,
  toVertexAngles,
  computeColumns,
} from './geometry'

// Renderer, camera, luci, texture e `dispose()`. Niente React né gesti.

const VERTICAL_FOV = 18 // quasi tele: meno deformazione della pagina in volo
const BOOK_ROT_X = -0.1
export const BOOK_ROT_Y = 0.07
// Uguale all'aspect-ratio CSS del riquadro.
const BOOK_ASPECT = 2000 / 1415
const K_WIDTH = 2 * Math.tan((VERTICAL_FOV * Math.PI) / 360) * BOOK_ASPECT
// Anche il gesto la usa, per convertire i pixel del dito in unità del mondo.
export const CAMERA_MARGIN = 1.12
// Il canvas sborda (-inset-[12%]): a metà giro la pagina esce dal libro.
const CANVAS_MARGIN = 1.24
const CAMERA_DISTANCE = (2 * WORLD_WIDTH * CAMERA_MARGIN * CANVAS_MARGIN) / K_WIDTH
// Frazione del canvas occupata da una pagina: dà i pixel reali, e quindi il filtro della texture.
const PAGE_SHARE = WORLD_WIDTH / (2 * WORLD_WIDTH * CAMERA_MARGIN * CANVAS_MARGIN)
const PLATE_WIDTH = { finger: 500, mouse: 1000 }
export const plateFor = (src, finger) => (finger ? src.replace(/\.webp$/, '-half.webp') : src)
// Sotto questo rapporto texture/schermo i mipmap tolgono solo dettaglio.
const MIPMAP_THRESHOLD = 1.4

// `pointer: coarse` = GPU da telefono: le misure qui sotto si abbassano.
export const onTouch = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true

// La mappa d'ombra è un secondo render della scena a ogni fotogramma.
const SHADOW_PX = { finger: 1024, mouse: 2048 }
// Il libro si guarda quasi di faccia: l'anisotropia serve poco.
const ANISOTROPY = { finger: 4, mouse: 16 }
// 1.5 è il minimo per il testo piccolo delle tavole.
const PIXEL_MAX = { finger: 1.5, mouse: 2 }

// Monta la scena; `null` se manca WebGL o il componente è stato smontato.
export async function createScene({ THREE, container, plates, initialPage, active }) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  } catch {
    return null
  }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(VERTICAL_FOV, BOOK_ASPECT, CAMERA_DISTANCE - 3.5, CAMERA_DISTANCE + 2.5)
  camera.position.set(-WORLD_WIDTH / 2, 0, CAMERA_DISTANCE)
  camera.lookAt(-WORLD_WIDTH / 2, 0, 0)

  // Almeno 1.5 per il testo piccolo delle tavole; oltre 2 non si vede differenza.
  const finger = onTouch()
  const pixelRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), finger ? PIXEL_MAX.finger : PIXEL_MAX.mouse)
  renderer.setPixelRatio(pixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  // Il PCF morbido moltiplica i prelievi: sul telefono basta quello semplice.
  renderer.shadowMap.type = finger ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  // Un render per frame: il mouse manda fino a 1000 eventi al secondo.
  let frameRequested = 0
  const requestRender = () => {
    if (frameRequested) return
    frameRequested = requestAnimationFrame(() => {
      frameRequested = 0
      renderer.render(scene, camera)
    })
  }
  const stopRender = () => cancelAnimationFrame(frameRequested)

  scene.add(new THREE.AmbientLight(0xffffff, 0.55))
  scene.add(new THREE.HemisphereLight(0xfff7ee, 0xd7d4cf, 0.4))
  // Quasi frontale: angolata, l'ombra della pagina in volo finirebbe lontano dal libro.
  const directional = new THREE.DirectionalLight(0xfff9f0, 1.35)
  directional.position.set(0.9, 1.4, 4.0)
  directional.castShadow = true
  directional.shadow.mapSize.set(
    finger ? SHADOW_PX.finger : SHADOW_PX.mouse,
    finger ? SHADOW_PX.finger : SHADOW_PX.mouse,
  )
  // Contiene pila e pagina in volo: più stretto perde le ombre ai bordi.
  directional.shadow.camera.left = -WORLD_WIDTH * 1.8
  directional.shadow.camera.right = WORLD_WIDTH * 1.1
  directional.shadow.camera.top = WORLD_HEIGHT * 0.8
  directional.shadow.camera.bottom = -WORLD_HEIGHT * 0.95
  directional.shadow.camera.near = 0.5
  directional.shadow.camera.far = 12
  // Contro l'acne e le ombre "trapelate" tra fogli sottili e ravvicinati.
  directional.shadow.bias = -0.0002
  directional.shadow.normalBias = 0.02
  scene.add(directional)

  const bookGroup = new THREE.Group()
  bookGroup.rotation.x = BOOK_ROT_X
  bookGroup.rotation.y = BOOK_ROT_Y
  scene.add(bookGroup)

  // Alone pre-sfumato: un piano con le ombre vere mostrerebbe quella della pagina in volo lontano dal libro.
  const haloCanvas = document.createElement('canvas')
  haloCanvas.width = 256
  haloCanvas.height = 256
  const ctxHalo = haloCanvas.getContext('2d')
  const haloGradient = ctxHalo.createRadialGradient(128, 128, 30, 128, 128, 128)
  haloGradient.addColorStop(0, 'rgba(20,17,15,0.38)')
  haloGradient.addColorStop(0.5, 'rgba(20,17,15,0.22)')
  haloGradient.addColorStop(0.75, 'rgba(20,17,15,0.08)')
  haloGradient.addColorStop(1, 'rgba(20,17,15,0)')
  ctxHalo.fillStyle = haloGradient
  ctxHalo.fillRect(0, 0, 256, 256)
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(haloCanvas),
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  )
  // Opposto alla luce, come una vera ombra di contatto.
  halo.position.set(-WORLD_WIDTH / 2 - 0.12, -0.16, -0.05)
  bookGroup.add(halo)

  // Incavo lungo la costa: a libro aperto la luce lì non arriva.
  const gutterCanvas = document.createElement('canvas')
  gutterCanvas.width = 256
  gutterCanvas.height = 4
  const ctxGutter = gutterCanvas.getContext('2d')
  const gradient = ctxGutter.createLinearGradient(0, 0, gutterCanvas.width, 0)
  gradient.addColorStop(0, '#000')
  gradient.addColorStop(0.3, '#111')
  gradient.addColorStop(0.42, '#666')
  gradient.addColorStop(0.5, '#fff')
  gradient.addColorStop(0.58, '#666')
  gradient.addColorStop(0.7, '#111')
  gradient.addColorStop(1, '#000')
  ctxGutter.fillStyle = gradient
  ctxGutter.fillRect(0, 0, gutterCanvas.width, gutterCanvas.height)
  const gutterMat = new THREE.MeshBasicMaterial({
    color: 0x14110f,
    alphaMap: new THREE.CanvasTexture(gutterCanvas),
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
  const gutter = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_WIDTH * 0.45, WORLD_HEIGHT), gutterMat)
  gutter.position.set(-WORLD_WIDTH / 2, 0, plates.length * STACK_GAP + 0.01)
  gutter.renderOrder = 2
  bookGroup.add(gutter)

  const spineGroup = new THREE.Group()
  spineGroup.position.x = -WORLD_WIDTH / 2
  bookGroup.add(spineGroup)

  const plateWidth = finger ? PLATE_WIDTH.finger : PLATE_WIDTH.mouse
  const pagePx = (container.getBoundingClientRect().width || 0) * pixelRatio * PAGE_SHARE
  const noMipmap = pagePx > 0 && plateWidth < pagePx * MIPMAP_THRESHOLD

  const loader = new THREE.TextureLoader()
  const loadTexture = (src) =>
    new Promise((resolve) => {
      loader.load(
        src,
        (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = Math.min(
        renderer.capabilities.getMaxAnisotropy(),
        finger ? ANISOTROPY.finger : ANISOTROPY.mouse,
      )
      if (noMipmap) {
        tex.generateMipmaps = false
        tex.minFilter = THREE.LinearFilter
      }
      resolve(tex)
        },
        undefined,
        () => resolve(null)
      )
    })

  const createFaceGeometry = (mirrorU) => {
    const geo = new THREE.BufferGeometry()
    const nVert = (M_COLUMNS + 1) * 2
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nVert * 3), 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nVert * 3), 3))
    const uv = new Float32Array(nVert * 2)
    for (let v = 0; v <= M_COLUMNS; v += 1) {
      const u = mirrorU ? 1 - v / M_COLUMNS : v / M_COLUMNS
      uv[v * 4 + 0] = u
      uv[v * 4 + 1] = 1
      uv[v * 4 + 2] = u
      uv[v * 4 + 3] = 0
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    const indices = []
    for (let s = 0; s < M_COLUMNS; s += 1) {
      const a = s * 2
      const b = s * 2 + 1
      const c = (s + 1) * 2
      const d = (s + 1) * 2 + 1
      indices.push(a, b, c, c, b, d)
    }
    geo.setIndex(indices)
    geo.setDrawRange(0, 0) // vuota finché `applyGeometry` non la riempie
    return geo
  }

  const applyGeometry = (geo, posX, posZ, vertexAngles) => {
    const pos = geo.attributes.position.array
    const norm = geo.attributes.normal.array
    for (let v = 0; v <= M_COLUMNS; v += 1) {
      const x = posX[v] * WORLD_WIDTH
      const z = posZ[v] * WORLD_WIDTH
      const a = vertexAngles[v]
      const nx = Math.sin(a)
      const nz = Math.cos(a)
      const iHigh = v * 6
      const iLow = v * 6 + 3
      pos[iHigh] = x
      pos[iHigh + 1] = WORLD_HEIGHT / 2
      pos[iHigh + 2] = z
      pos[iLow] = x
      pos[iLow + 1] = -WORLD_HEIGHT / 2
      pos[iLow + 2] = z
      norm[iHigh] = nx
      norm[iHigh + 1] = 0
      norm[iHigh + 2] = nz
      norm[iLow] = nx
      norm[iLow + 1] = 0
      norm[iLow + 2] = nz
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.normal.needsUpdate = true
    geo.setDrawRange(0, M_COLUMNS * 6)
    geo.computeBoundingSphere()
  }

  const pageColor = new THREE.Color('#f7f7f7')

  // Qui e non più in basso: `resize()` le legge subito.
  let resizeObserver = null
  let ready = false

  let lastOpening = 0
  const fitCamera = (opening) => {
    lastOpening = opening
    const openLeft = Math.min(1, opening)
    const openRight = Math.min(1, plates.length - opening)
    const center = -WORLD_WIDTH / 2 + (openRight - openLeft) * (WORLD_WIDTH / 2)
    const viewHeight = 2 * Math.tan((VERTICAL_FOV * Math.PI) / 360) * CAMERA_DISTANCE
    const viewWidth = viewHeight * camera.aspect
    const footprint = CAMERA_MARGIN * CANVAS_MARGIN
    const bookWidth = Math.max(openLeft + openRight, 0.001) * WORLD_WIDTH
    camera.zoom = Math.min(
      viewWidth / (bookWidth * footprint),
      viewHeight / (WORLD_HEIGHT * footprint),
    )
    camera.position.x = center
    camera.lookAt(center, 0, 0)
    camera.updateProjectionMatrix()
  }


  const resize = () => {
    const rect = container.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return
    renderer.setSize(rect.width, rect.height, true)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
    // Sotto `sm` il riquadro cambia rapporto: lo zoom va rifatto.
    fitCamera(lastOpening)
    if (ready) requestRender()
  }
  resize()


  // Memoria video da liberare a mano; il renderer per ultimo.
  const dispose = () => {
    resizeObserver?.disconnect()
    stopRender()
    scene.traverse((object3d) => {
      if (object3d.isMesh) {
        object3d.geometry.dispose()
        const materials = Array.isArray(object3d.material) ? object3d.material : [object3d.material]
        materials.forEach((m) => {
          m.map?.dispose()
          m.alphaMap?.dispose()
          m.dispose()
        })
      }
    })
    renderer.dispose()
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)

  const pageTextures = await Promise.all(
    plates.map(async (plate) => ({
      front: await loadTexture(plateFor(plate.front.src, finger)),
      rear: plate.back ? await loadTexture(plateFor(plate.back.src, finger)) : null,
    }))
  )
  if (!active()) {
    dispose()
    return null
  }
  const pages = pageTextures.map((tex, i) => {
      const group = new THREE.Group()
      group.rotation.y = i < initialPage ? -Math.PI : 0
      spineGroup.add(group) // la z la mette `positionBook`

      const frontGeo = createFaceGeometry(false)
      const frontMat = new THREE.MeshStandardMaterial({
        map: tex.front,
        roughness: 0.86,
        metalness: 0,
        side: THREE.FrontSide,
      })
      const frontMesh = new THREE.Mesh(frontGeo, frontMat)
      frontMesh.castShadow = true
      frontMesh.receiveShadow = true
      group.add(frontMesh)

      const rearGeo = createFaceGeometry(true)
      const rearMat = tex.rear
        ? new THREE.MeshStandardMaterial({ map: tex.rear, roughness: 0.86, metalness: 0, side: THREE.BackSide })
        : new THREE.MeshStandardMaterial({ color: pageColor, roughness: 0.92, metalness: 0, side: THREE.BackSide })
      const rearMesh = new THREE.Mesh(rearGeo, rearMat)
      rearMesh.castShadow = true
      rearMesh.receiveShadow = true
      group.add(rearMesh)

      const { posX, posZ, segmentAngles } = computeColumns(0)
      const vertexAngles = toVertexAngles(segmentAngles)
      applyGeometry(frontGeo, posX, posZ, vertexAngles)
      applyGeometry(rearGeo, posX, posZ, vertexAngles)

      return { group, frontGeo, rearGeo }
    })


  ready = true
  return {
    THREE,
    renderer,
    scene,
    camera,
    bookGroup,
    pages,
    halo,
    gutterMat,
    applyGeometry,
    requestRender,
    stopRender,
    fitCamera,
    resize,
    dispose,
  }
}
