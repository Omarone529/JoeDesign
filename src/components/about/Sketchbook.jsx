import { useEffect, useRef, useState } from 'react'
import { about } from '../../data/siteData'
import { animazioniRidotte } from '../../motion'
const { sketchbook } = about
const N = sketchbook.length
const SOGLIA_CLIC = 6
const SOGLIA_VOLO = 0.55
const SOGLIA_COMPLETAMENTO = 0.32
const VELOCITA_MAX = 3.2 // gradi/ms
const VELOCITA_STANTIA_MS = 90 // dito fermo da più di così al rilascio → niente slancio
const CEDIMENTO_LIBRO = (3 * Math.PI) / 180 // oltre le copertine cede tutto il libro, non la pagina
const M_COLONNE = 48
const CURVA_MAX = (22 * Math.PI) / 180 // arco sobrio: una pagina vera non si piega a tubo
// Verso giusto per un giro all'indietro; andando avanti lo ribalta `versoArco`.
const CURVA_SEGNO = -1
const LARGHEZZA_MONDO = 2
const ALTEZZA_MONDO = LARGHEZZA_MONDO * (1415 / 1000)
const SCARTO_PILA = 0.02
const RIGIDITA_COPERTINA = 0.35 // le copertine sono cartone: si flettono molto meno della carta
// Quanto il corpo della pagina si alza a metà giro, per scavalcare le pile.
const SOLLEVAMENTO_VOLO = 0.28
const FOV_VERTICALE = 18 // obiettivo leggermente tele: meno "bombatura" prospettica della pagina in volo
const ROT_X_LIBRO = -0.1
const ROT_Y_LIBRO = 0.07
// Piega dinamica: il foglio si flette in proporzione alla velocità del gesto,
// oltre alla campana geometrica del giro, e con lo stesso segno.
const PIEGA_GUADAGNO = 0.2 // flessione extra per (grado/ms) di velocità
const PIEGA_MAX = 0.32
const PIEGA_TOTALE_MAX = 1.15
const PIEGA_INERZIA_MS = 40 // costante di tempo con cui la flessione insegue la velocità
const GUTTER_OPACITA = 0.2 // ombra d'incavo lungo la costa, solo a libro aperto
// Deve combaciare con l'aspect-ratio CSS del widget: la camera è fissa e il
// libro non cambia mai scala.
const ASPETTO_LIBRO = 2000 / 1415
const K_LARGHEZZA = 2 * Math.tan((FOV_VERTICALE * Math.PI) / 360) * ASPETTO_LIBRO
const MARGINE_CAMERA = 1.12
// Il canvas sborda (-inset-[12%] nel JSX): a metà giro la pagina si proietta
// più grande del libro e senza sbordo verrebbe tagliata sopra e sotto.
const MARGINE_TELA = 1.24
const DISTANZA_CAMERA = (2 * LARGHEZZA_MONDO * MARGINE_CAMERA * MARGINE_TELA) / K_LARGHEZZA

// `curvaAmp`: flessione totale, negativa se piega nell'altro verso.
// `alzata`: sollevamento di volo in unità mondo, a rampa lungo la pagina.
function calcolaColonne(curvaAmp, alzata = 0) {
  const posX = new Float32Array(M_COLONNE + 1)
  const posZ = new Float32Array(M_COLONNE + 1)
  const angoliSegmento = new Float32Array(M_COLONNE)
  let x = 0
  let z = 0
  for (let s = 0; s < M_COLONNE; s += 1) {
    const uMetà = (s + 0.5) / M_COLONNE
    // Antisimmetrica: a gobba singola la profondità accumulata non tornerebbe
    // a zero e il bordo libero andrebbe alla deriva invece di richiudersi.
    const curvaLocale = CURVA_MAX * curvaAmp * Math.sin(2 * Math.PI * uMetà) * CURVA_SEGNO
    angoliSegmento[s] = curvaLocale
    x += (1 / M_COLONNE) * Math.cos(curvaLocale)
    z += -(1 / M_COLONNE) * Math.sin(curvaLocale)
    posX[s + 1] = x
    posZ[s + 1] = z
  }
  // Nella geometria e non sul gruppo: a rampa dalla cerniera, così la radice
  // resta incollata alla costa e si alza solo il corpo della pagina.
  if (alzata !== 0) {
    for (let v = 1; v <= M_COLONNE; v += 1) {
      posZ[v] += (alzata / LARGHEZZA_MONDO) * Math.min(1, (v / M_COLONNE) * 2.2)
    }
  }
  return { posX, posZ, angoliSegmento }
}
/* Primo e ultimo foglio sono cartone: ogni flessione gli arriva ridotta. */
function rigidita(indice) {
  return indice === 0 || indice === N - 1 ? RIGIDITA_COPERTINA : 1
}

function angoliVertici(angoliSegmento) {
  const out = new Float32Array(M_COLONNE + 1)
  for (let v = 0; v <= M_COLONNE; v += 1) {
    if (v === 0) out[v] = angoliSegmento[0]
    else if (v === M_COLONNE) out[v] = angoliSegmento[M_COLONNE - 1]
    else out[v] = (angoliSegmento[v - 1] + angoliSegmento[v]) / 2
  }
  return out
}

/*
 * Libro sfogliabile in 3D. Three.js e Anime.js (~190 kB gzip) si caricano solo
 * quando il widget si avvicina al viewport; finché la scena non è pronta — e
 * per sempre, se manca WebGL — resta la copertina statica.
 *
 * Ogni pagina è una striscia di M_COLONNE quadrilateri che ruota attorno alla
 * costa; al rilascio assesta una molla vera innescata dalla velocità del dito.
 */
export default function Sketchbook() {
  const [pagina, setPagina] = useState(0) // quante pagine sono già girate a sinistra
  const [pronto, setPronto] = useState(false) // scena 3D montata: si può nascondere la copertina di scorta
  const animateRef = useRef(null)
  const springRef = useRef(null)
  const treRef = useRef(null) // tutta la scena Three.js, montata da avvia()
  const angoli = useRef(Array(N).fill(0)) // angolo rotateY corrente di ogni pagina
  const inCorso = useRef(false) // un assestamento (molla) è in corso
  const trascinamento = useRef(null) // { indice, verso, startX, mosso, velocita, ... }
  const piega = useRef({ extra: 0, ultimoAngolo: 0, ultimoTempo: 0 }) // flessione dinamica della pagina attiva
  const flutter = useRef(null) // { anim, stato, indice }: la vibrazione di assestamento in corso
  const wrapperRef = useRef(null)
  const mountRef = useRef(null) // div in cui Three.js monta il proprio <canvas>

  /*
   * Libro a riposo per una data apertura (0 = chiuso davanti, N = chiuso
   * dietro); `salta` è la pagina in volo, che posiziona applicaAngolo. Tutto è
   * funzione continua dell'apertura, così niente scatta a fine giro.
   */
  const posizionaLibro = (apertura, salta = null) => {
    const tre = treRef.current
    if (!tre) return
    // L'alone segue l'impronta del libro: mezza pagina da chiuso, due da aperto.
    const apriSx = Math.min(1, apertura)
    const apriDx = Math.min(1, N - apertura)
    tre.alone.scale.set((apriSx + apriDx) * LARGHEZZA_MONDO * 1.25, ALTEZZA_MONDO * 1.3, 1)
    tre.alone.position.x = -LARGHEZZA_MONDO / 2 + (apriDx - apriSx) * (LARGHEZZA_MONDO / 2) - 0.12
    tre.pagine.forEach((p, i) => {
      if (i === salta) return
      const girata = angoli.current[i] < -90
      p.gruppo.position.z = (girata ? i + 1 : N - i) * SCARTO_PILA
    })
    tre.gutterMat.opacity = GUTTER_OPACITA * Math.min(1, Math.max(0, Math.min(apertura, N - apertura) / 0.9))
  }

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    let attivo = true
    let osservatoreResize = null
    let annullato = false

    const osservatoreCarico = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || annullato) return
        osservatoreCarico.disconnect()
        avvia()
      },
      { rootMargin: '600px 0px' }
    )
    if (wrapperRef.current) osservatoreCarico.observe(wrapperRef.current)

    function avvia() {
      Promise.all([import('three'), import('animejs')]).then(([THREE, { animate, spring }]) => {
      if (!attivo || !mountRef.current) return
      animateRef.current = animate
      springRef.current = spring

      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
      } catch {
        return // niente WebGL: resta la copertina statica di scorta
      }

      const scena = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(FOV_VERTICALE, ASPETTO_LIBRO, DISTANZA_CAMERA - 3.5, DISTANZA_CAMERA + 2.5)
      camera.position.set(-LARGHEZZA_MONDO / 2, 0, DISTANZA_CAMERA)
      camera.lookAt(-LARGHEZZA_MONDO / 2, 0, 0)

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.setClearColor(0x000000, 0)
      mountRef.current.appendChild(renderer.domElement)

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
      direzionale.shadow.mapSize.set(2048, 2048)
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
      gutter.position.set(-LARGHEZZA_MONDO / 2, 0, N * SCARTO_PILA + 0.01)
      gutter.renderOrder = 2
      libroGruppo.add(gutter)

      const spinaGruppo = new THREE.Group()
      spinaGruppo.position.x = -LARGHEZZA_MONDO / 2
      libroGruppo.add(spinaGruppo)

      const caricatore = new THREE.TextureLoader()
      const caricaTexture = (src) =>
        new Promise((risolvi) => {
          caricatore.load(
            src,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace
              tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
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

      Promise.all(
        sketchbook.map(async (tavola) => ({
          fronte: await caricaTexture(tavola.front.src),
          retro: tavola.back ? await caricaTexture(tavola.back.src) : null,
        }))
      ).then((texturePagine) => {
        if (!attivo) return
        const pagineMesh = texturePagine.map((tex, i) => {
          const gruppo = new THREE.Group()
          gruppo.rotation.y = i < pagina ? -Math.PI : 0
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

        treRef.current = { THREE, renderer, scena, camera, libroGruppo, pagine: pagineMesh, alone, gutterMat, applicaGeometria, richiediRender, fermaRender }
        posizionaLibro(pagina)
        ridimensiona()
        renderer.render(scena, camera)
        setPronto(true)
      })

      const ridimensiona = () => {
        const rect = mountRef.current?.getBoundingClientRect()
        if (!rect || !rect.width || !rect.height) return
        renderer.setSize(rect.width, rect.height, true)
        camera.aspect = rect.width / rect.height
        camera.updateProjectionMatrix()
        if (treRef.current) richiediRender()
      }
      ridimensiona()

      osservatoreResize = new ResizeObserver(ridimensiona)
      osservatoreResize.observe(mountRef.current)
      })
    }

    return () => {
      attivo = false
      annullato = true
      osservatoreCarico.disconnect()
      osservatoreResize?.disconnect()
      flutter.current?.anim?.cancel?.()
      flutter.current = null
      const tre = treRef.current
      // Azzerato prima del dispose: gli onUpdate ancora vivi trovano treRef
      // nullo e non toccano il renderer smaltito.
      treRef.current = null
      if (tre) {
        tre.fermaRender()
        tre.scena.traverse((oggetto) => {
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
        tre.renderer.dispose()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // La pagina appena girata è già alla z giusta: non scatta niente.
  useEffect(() => {
    const tre = treRef.current
    if (!tre) return
    posizionaLibro(pagina)
    tre.richiediRender()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina])

  /*
   * Ruota la pagina e ne ridisegna la geometria piegata. `verso` (1 avanti, -1
   * indietro) la inarca dalla parte giusta: i due giri non sono lo stesso.
   */
  const applicaAngolo = (indice, angolo, verso) => {
    // Oltre 0° e -180° ci sono le pile: la molla in overshoot le attraverserebbe.
    const rotazione = Math.min(0, Math.max(-180, angolo))
    const tre = treRef.current
    if (!tre) {
      angoli.current[indice] = rotazione
      return
    }
    const progresso = -rotazione / 180
    const pieno = Math.sin(progresso * Math.PI) // 0→1→0: quanto si è "a metà giro" ora

    // Con un po' di inerzia, la carta non scatta. Prende il segno della
    // velocità istantanea: tornando indietro col dito, l'imbarcatura si inverte.
    const ora = performance.now()
    const dt = ora - piega.current.ultimoTempo
    if (dt > 0 && dt < 200) {
      const velocitaAngolare = (rotazione - piega.current.ultimoAngolo) / dt
      const obiettivo = Math.max(-PIEGA_MAX, Math.min(PIEGA_MAX, velocitaAngolare * PIEGA_GUADAGNO))
      piega.current.extra += (obiettivo - piega.current.extra) * Math.min(1, dt / PIEGA_INERZIA_MS)
    }
    piega.current.ultimoAngolo = rotazione
    piega.current.ultimoTempo = ora
    angoli.current[indice] = rotazione

    // Apertura continua del libro: guida il travaso di spessore tra le pile,
    // la quota della pagina in volo e l'ombra d'incavo.
    const paginaBase = indice === pagina ? pagina : pagina - 1
    const apertura = paginaBase + progresso
    posizionaLibro(apertura, indice)

    const p = tre.pagine[indice]
    if (p) {
      p.gruppo.rotation.y = (rotazione * Math.PI) / 180
      // Interpola tra le due pile. La cerniera non si alza mai, quindi decollo
      // e atterraggio cadono esatti.
      const zDestra = (N - indice) * SCARTO_PILA
      const zSinistra = (indice + 1) * SCARTO_PILA
      p.gruppo.position.z = zDestra + (zSinistra - zDestra) * progresso
      // Il corpo resta indietro rispetto al bordo che tira, quindi il ventre
      // punta dalla parte opposta al moto. Senza, i due giri sono uguali.
      const versoArco = -verso
      const curvaAmp =
        Math.max(-PIEGA_TOTALE_MAX, Math.min(PIEGA_TOTALE_MAX, versoArco * pieno + piega.current.extra)) *
        rigidita(indice)
      const alzata = SOLLEVAMENTO_VOLO * Math.sin(progresso * Math.PI) * rigidita(indice)
      const { posX, posZ, angoliSegmento } = calcolaColonne(curvaAmp, alzata)
      const angoliVert = angoliVertici(angoliSegmento)
      tre.applicaGeometria(p.fronteGeo, posX, posZ, angoliVert)
      tre.applicaGeometria(p.retroGeo, posX, posZ, angoliVert)
    }

    tre.richiediRender()
  }

  /*
   * Applica SOLO la flessione residua a una pagina ferma a fine corsa: la usa
   * il flutter, quando angolo e profondità sono già quelli di riposo.
   */
  const applicaPiegaResidua = (indice, extra) => {
    const tre = treRef.current
    if (!tre) return
    const p = tre.pagine[indice]
    if (!p) return
    const { posX, posZ, angoliSegmento } = calcolaColonne(extra * rigidita(indice))
    const angoliVert = angoliVertici(angoliSegmento)
    tre.applicaGeometria(p.fronteGeo, posX, posZ, angoliVert)
    tre.applicaGeometria(p.retroGeo, posX, posZ, angoliVert)
    tre.richiediRender()
  }

  /*
   * Scarica la flessione residua dell'atterraggio con una molla poco smorzata:
   * il fruscio della carta. Non blocca l'interazione, `inCorso` resta falso.
   */
  const avviaFlutter = (indice) => {
    const daExtra = piega.current.extra
    piega.current.extra = 0
    if (Math.abs(daExtra) < 0.04 || !animateRef.current || !springRef.current || animazioniRidotte()) {
      applicaPiegaResidua(indice, 0)
      return
    }
    flutter.current?.anim?.cancel?.()
    const stato = { extra: daExtra }
    const anim = animateRef.current(stato, {
      extra: 0,
      ease: springRef.current({ mass: 1, stiffness: 240, damping: 12 }),
      onUpdate: () => applicaPiegaResidua(indice, stato.extra),
      onComplete: () => {
        flutter.current = null
      },
    })
    flutter.current = { anim, stato, indice }
  }

  /*
   * Ferma un flutter prima di una nuova interazione. Se riguardava la pagina
   * che si sta per muovere ne eredita la flessione, o la geometria salterebbe.
   */
  const fermaFlutter = (indice) => {
    const f = flutter.current
    if (!f) return
    f.anim?.cancel?.()
    if (f.indice === indice) piega.current.extra = f.stato.extra
    flutter.current = null
  }

  /*
   * Cedimento elastico di TUTTO il libro quando si sfoglia oltre le copertine:
   * un libro vero non ruota la copertina attraverso la pila, al massimo si
   * sposta un po' tutto insieme.
   */
  const applicaCedimentoLibro = (rad) => {
    const tre = treRef.current
    if (!tre) return
    tre.libroGruppo.rotation.y = ROT_Y_LIBRO + rad
    tre.richiediRender()
  }

  const assestaLibro = () => {
    const tre = treRef.current
    const da = tre ? tre.libroGruppo.rotation.y - ROT_Y_LIBRO : 0
    if (!animateRef.current || !springRef.current || animazioniRidotte() || da === 0) {
      applicaCedimentoLibro(0)
      return
    }
    inCorso.current = true
    const stato = { ced: da }
    animateRef.current(stato, {
      ced: 0,
      ease: springRef.current({ mass: 1, stiffness: 280, damping: 26 }),
      onUpdate: () => applicaCedimentoLibro(stato.ced),
      onComplete: () => {
        inCorso.current = false
      },
    })
  }

  /*
   * Assesta la pagina `indice` fino ad `aAngolo` con una molla fisica reale
   * (Anime.js `spring`), innescata dalla velocità del gesto — 0 da tastiera o
   * da clic. La durata la decide la molla, non un tempo fisso.
   */
  const assesta = (indice, verso, aAngolo, cambiaPagina, velocita = 0) => {
    const da = angoli.current[indice]
    const chiudi = () => {
      inCorso.current = false
      if (cambiaPagina) setPagina((p) => p + verso)
    }
    if (!animateRef.current || !springRef.current || animazioniRidotte() || da === aAngolo) {
      piega.current.extra = 0
      applicaAngolo(indice, aAngolo, verso)
      chiudi()
      return
    }
    inCorso.current = true
    // La molla lavora sul progresso 0→1: la velocità in gradi/ms va convertita
    // in unità di corsa al secondo, o parte all'indietro a ogni rilascio.
    const velocitaNormalizzata = Math.max(-20, Math.min(20, (velocita * 1000) / (aAngolo - da)))
    const stato = { angolo: da }
    animateRef.current(stato, {
      angolo: aAngolo,
      ease: springRef.current({ mass: 1, stiffness: 280, damping: 32, velocity: velocitaNormalizzata }),
      onUpdate: () => applicaAngolo(indice, stato.angolo, verso),
      onComplete: () => {
        chiudi()
        avviaFlutter(indice)
      },
    })
  }

  /*
   * Giro completo, da tastiera o da clic. Il controllo su `treRef`: Anime.js
   * carica prima delle texture, e in quella finestra la molla animerebbe
   * `pagina` a vuoto — lo stato avanza, la rotazione non si applica.
   */
  const gira = (verso) => {
    if (!treRef.current) return
    if (inCorso.current || trascinamento.current) return
    const indice = verso === 1 ? pagina : pagina - 1
    if (indice < 0 || indice >= N) return
    fermaFlutter(indice)
    piega.current.ultimoAngolo = angoli.current[indice]
    piega.current.ultimoTempo = performance.now()
    assesta(indice, verso, verso === 1 ? -180 : 0, true)
  }

  const iniziaTrascinamento = (e) => {
    if (!treRef.current) return // vedi il commento in gira()
    if (inCorso.current || trascinamento.current) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const verso = e.clientX - rect.left > rect.width / 2 ? 1 : -1
    const indice = verso === 1 ? pagina : pagina - 1
    e.currentTarget.setPointerCapture?.(e.pointerId)
    if (indice < 0 || indice >= N) {
      // Oltre la copertina o l'ultima pagina: nessun giro, ma un cedimento
      // elastico di tutto il libro invece del nulla.
      trascinamento.current = {
        pointerId: e.pointerId,
        limite: true,
        verso,
        startX: e.clientX,
        larghezza: rect.width,
      }
      return
    }
    fermaFlutter(indice)
    piega.current.ultimoAngolo = angoli.current[indice]
    piega.current.ultimoTempo = performance.now()
    trascinamento.current = {
      pointerId: e.pointerId,
      indice,
      verso,
      startX: e.clientX,
      larghezza: rect.width,
      // Presa diretta, il bordo segue il dito 1:1: x = L·cos(angolo), quindi
      // angolo = -acos(x/L).
      mondoPerPx: (2 * LARGHEZZA_MONDO * MARGINE_CAMERA) / rect.width,
      bordoXIniziale: LARGHEZZA_MONDO * Math.cos((Math.abs(angoli.current[indice]) * Math.PI) / 180),
      progresso: 0,
      mosso: false,
      velocita: 0, // gradi/ms, media mobile presa durante il trascinamento
      ultimoAngolo: angoli.current[indice],
      ultimoTempo: performance.now(),
    }
  }

  /* Progresso 0→1 del gesto ai limiti del libro (solo caso `limite`). */
  const progressoTrascinamento = (t, clientX) => {
    const dx = clientX - t.startX
    const grezzo = t.verso === 1 ? -dx : dx
    return Math.min(Math.max(grezzo / t.larghezza, 0), 1)
  }

  const muoviTrascinamento = (e) => {
    const t = trascinamento.current
    if (!t || e.pointerId !== t.pointerId) return
    if (t.limite) {
      // Resistenza che si esaurisce (tanh): cede all'inizio, poi sempre meno,
      // come spingere un libro chiuso.
      const cedimento = CEDIMENTO_LIBRO * Math.tanh(progressoTrascinamento(t, e.clientX) * 2.2)
      applicaCedimentoLibro(t.verso === 1 ? -cedimento : cedimento)
      return
    }
    const dx = e.clientX - t.startX
    if (Math.abs(dx) > SOGLIA_CLIC) t.mosso = true
    const bordoX = Math.max(-LARGHEZZA_MONDO, Math.min(LARGHEZZA_MONDO, t.bordoXIniziale + dx * t.mondoPerPx))
    const angolo = (-Math.acos(bordoX / LARGHEZZA_MONDO) * 180) / Math.PI
    t.progresso = t.verso === 1 ? -angolo / 180 : 1 + angolo / 180
    // Velocità reale del gesto, per il rilascio "al volo". Campionata al
    // massimo a ~60fps, o salterebbe tra due eventi troppo vicini.
    const ora = performance.now()
    const dt = ora - t.ultimoTempo
    if (dt > 8) {
      t.velocita = Math.max(-VELOCITA_MAX, Math.min(VELOCITA_MAX, (angolo - t.ultimoAngolo) / dt))
      t.ultimoAngolo = angolo
      t.ultimoTempo = ora
    }
    applicaAngolo(t.indice, angolo, t.verso)
  }

  const fineTrascinamento = (e) => {
    const t = trascinamento.current
    if (!t || e.pointerId !== t.pointerId) return
    trascinamento.current = null
    if (t.limite) {
      assestaLibro()
      return
    }
    // Lo slancio vale solo se il dito si muoveva davvero al rilascio.
    if (performance.now() - t.ultimoTempo > VELOCITA_STANTIA_MS) t.velocita = 0
    const alVolo = t.verso === 1 ? t.velocita < -SOGLIA_VOLO : t.velocita > SOGLIA_VOLO
    const controVolo = t.verso === 1 ? t.velocita > SOGLIA_VOLO : t.velocita < -SOGLIA_VOLO
    // Poco trascinamento vale come clic e gira comunque. Un flick opposto
    // annulla il giro anche oltre la soglia, come una pagina rilanciata.
    const completa = !t.mosso || (!controVolo && (t.progresso > SOGLIA_COMPLETAMENTO || alVolo))
    const aAngolo = completa ? (t.verso === 1 ? -180 : 0) : (t.verso === 1 ? 0 : -180)
    assesta(t.indice, t.verso, aAngolo, completa, t.velocita)
  }

  const annullaTrascinamento = (e) => {
    const t = trascinamento.current
    if (!t || e.pointerId !== t.pointerId) return
    trascinamento.current = null
    if (t.limite) {
      assestaLibro()
      return
    }
    assesta(t.indice, t.verso, t.verso === 1 ? 0 : -180, false)
  }

  return (
    <section className="border-t border-line px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
      <div className="mb-10 text-[11px] uppercase tracking-[0.24em] text-muted">Sketchbook</div>

      <div className="flex flex-col items-center">
        {/* `tabIndex` e frecce sono l'unico modo di sfogliare senza mouse: il
            libro si gira trascinando. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          ref={wrapperRef}
          className="relative w-full max-w-[560px] touch-pan-y select-none sm:max-w-[780px] lg:max-w-[1000px] xl:max-w-[1120px]"
          role="group"
          tabIndex={0}
          aria-roledescription="sketchbook sfogliabile"
          aria-label="Tavole dello sketchbook personale di Joe Sarchiolla"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') gira(1)
            if (e.key === 'ArrowLeft') gira(-1)
          }}
        >
          <div className="relative aspect-[2000/1415] w-full">
            {/* Copertina di scorta, sempre nel markup: senza JS il libro non
                si sfoglia comunque, quindi mostrarla chiusa sulla metà destra
                — dov'è anche nella scena 3D — è corretto. Sparisce quando la
                scena è pronta, resta se manca WebGL. Misure derivate da
                MARGINE_CAMERA (≈89.3% del riquadro) più l'1% di prospettiva:
                sta in cima alla pila, un filo più vicina alla camera. */}
            <img
              src={sketchbook[0].front.src}
              alt={sketchbook[0].front.alt}
              width={1000}
              height={1415}
              loading="eager"
              decoding="async"
              className={`pointer-events-none absolute left-1/2 top-[5%] h-[90%] w-[45%] border border-line bg-paper object-cover transition-opacity duration-300 [filter:drop-shadow(0_18px_26px_rgba(20,17,15,0.18))] ${
                pronto ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Three.js monta qui il suo <canvas>. Sborda del 12% per lato
                (vedi MARGINE_TELA) e non riceve eventi: quelli li prende il
                livello sotto, grande quanto il libro. */}
            <div
              ref={mountRef}
              className={`pointer-events-none absolute -inset-[12%] ${pronto ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            />

            {/* `touch-pan-y` e non `touch-none`: lo scroll verticale resta
                possibile anche partendo dal libro, l'orizzontale sfoglia. */}
            <div
              className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
              onPointerDown={iniziaTrascinamento}
              onPointerMove={muoviTrascinamento}
              onPointerUp={fineTrascinamento}
              onPointerCancel={annullaTrascinamento}
            />
          </div>
        </div>

        <span className="mt-6 text-[13px] tabular-nums tracking-[0.04em] text-muted">
          {String(Math.min(pagina + 1, N)).padStart(2, '0')} / {String(N).padStart(2, '0')}
        </span>
      </div>
    </section>
  )
}
