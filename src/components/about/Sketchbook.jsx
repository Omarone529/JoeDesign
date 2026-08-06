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
const CURVA_SEGNO = -1
const LARGHEZZA_MONDO = 2
const ALTEZZA_MONDO = LARGHEZZA_MONDO * (1415 / 1000)
const SCARTO_PILA = 0.02
const RIGIDITA_COPERTINA = 0.35 // le copertine sono cartone: si flettono molto meno della carta
// Quanto il CORPO della pagina si alza a metà giro (0 agli estremi). È nella
// geometria, con una rampa che parte da zero alla cerniera (vedi
// calcolaColonne): la radice resta incollata alla costa — la pagina non si
// stacca mai dal libro — e si alza solo quel che serve a scavalcare le pile.
const SOLLEVAMENTO_VOLO = 0.28
const FOV_VERTICALE = 18 // obiettivo leggermente tele: meno "bombatura" prospettica della pagina in volo
const ROT_X_LIBRO = -0.1
const ROT_Y_LIBRO = 0.07
// Piega dinamica: la carta non è rigida, quindi oltre alla campana geometrica
// del giro la pagina si flette in proporzione alla velocità angolare del
// gesto (il bordo libero "resta indietro"), e quando atterra la flessione
// residua si scarica da sola con una vibrazione smorzata (vedi avviaFlutter).
const PIEGA_GUADAGNO = 0.2 // flessione extra per (grado/ms) di velocità
const PIEGA_MAX = 0.32
const PIEGA_TOTALE_MAX = 1.15
const PIEGA_INERZIA_MS = 40 // costante di tempo con cui la flessione insegue la velocità
const GUTTER_OPACITA = 0.2 // ombra d'incavo lungo la costa, solo a libro aperto
// La camera è FISSA sulla costa e inquadra sempre il libro aperto per intero
// (2 larghezze di pagina + margine): il libro non si sposta né cambia scala,
// come un libro vero appoggiato sul tavolo. Deve combaciare con
// l'aspect-ratio CSS del widget (2000/1415, la doppia pagina).
const ASPETTO_LIBRO = 2000 / 1415
const K_LARGHEZZA = 2 * Math.tan((FOV_VERTICALE * Math.PI) / 360) * ASPETTO_LIBRO
const MARGINE_CAMERA = 1.12
// Il canvas SBORDA oltre il riquadro del libro (-inset-[12%] nel JSX → scala
// 1.24): la pagina a metà giro punta verso la camera e in prospettiva si
// proietta più grande del libro — senza sbordo la sua parte alta e bassa
// verrebbe tagliata dal bordo del canvas mentre si sfoglia. Lo sbordo è
// invisibile (canvas trasparente); il libro resta esattamente nel riquadro.
const MARGINE_TELA = 1.24
const DISTANZA_CAMERA = (2 * LARGHEZZA_MONDO * MARGINE_CAMERA * MARGINE_TELA) / K_LARGHEZZA

// `curvaAmp` è la flessione totale (campana del giro + piega dinamica, può
// essere negativa: piega nell'altro verso). `alzata` è il sollevamento di
// volo in unità mondo, applicato con una rampa lungo la pagina.
function calcolaColonne(curvaAmp, alzata = 0) {
  const posX = new Float32Array(M_COLONNE + 1)
  const posZ = new Float32Array(M_COLONNE + 1)
  const angoliSegmento = new Float32Array(M_COLONNE)
  let x = 0
  let z = 0
  for (let s = 0; s < M_COLONNE; s += 1) {
    const uMetà = (s + 0.5) / M_COLONNE
    // Antisimmetrica (si apre nella prima metà, si richiude nella seconda):
    // se fosse a gobba singola, la profondità accumulata non tornerebbe mai
    // a zero e il bordo libero "andrebbe alla deriva" invece di richiudersi
    // sul bordo giusto.
    const curvaLocale = CURVA_MAX * curvaAmp * Math.sin(2 * Math.PI * uMetà) * CURVA_SEGNO
    angoliSegmento[s] = curvaLocale
    x += (1 / M_COLONNE) * Math.cos(curvaLocale)
    z += -(1 / M_COLONNE) * Math.sin(curvaLocale)
    posX[s + 1] = x
    posZ[s + 1] = z
  }
  // Sollevamento nella GEOMETRIA, non sul gruppo: rampa da zero alla
  // cerniera fino al pieno verso il bordo libero, così la radice resta
  // incollata alla costa e ad alzarsi è solo il corpo della pagina.
  // (posZ è in unità normalizzate: si divide per la larghezza mondo.)
  if (alzata !== 0) {
    for (let v = 1; v <= M_COLONNE; v += 1) {
      posZ[v] += (alzata / LARGHEZZA_MONDO) * Math.min(1, (v / M_COLONNE) * 2.2)
    }
  }
  return { posX, posZ, angoliSegmento }
}
// Le copertine (primo e ultimo foglio) sono cartone: ogni flessione — quella
// geometrica del giro e quella dinamica — gli arriva molto ridotta.
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

export default function Sketchbook() {
  const [pagina, setPagina] = useState(0) // quante pagine sono già girate a sinistra
  const [pronto, setPronto] = useState(false) // scena 3D montata: si può nascondere la copertina di scorta
  const animateRef = useRef(null)
  const springRef = useRef(null)
  const treRef = useRef(null) // { THREE, renderer, scena, camera, libroGruppo, pagine, gutterMat, applicaGeometria, richiediRender, fermaRender }
  const angoli = useRef(Array(N).fill(0)) // angolo rotateY corrente di ogni pagina
  const inCorso = useRef(false) // un assestamento (molla) è in corso
  const trascinamento = useRef(null) // { indice, verso, startX, mosso, velocita, ... }
  const piega = useRef({ extra: 0, ultimoAngolo: 0, ultimoTempo: 0 }) // flessione dinamica della pagina attiva
  const flutter = useRef(null) // { anim, stato, indice }: la vibrazione di assestamento in corso
  const wrapperRef = useRef(null)
  const mountRef = useRef(null) // div in cui Three.js monta il proprio <canvas>

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

      // Più eventi (pointermove ad alta frequenza, molla, resize) possono
      // chiedere un ridisegno nello stesso frame: si coalizza tutto in UN
      // render per frame via requestAnimationFrame, altrimenti col mouse
      // (125–1000 Hz di eventi) si renderizza più volte a frame e scatta.
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
      // Luce QUASI frontale: l'offset di un'ombra proiettata cresce con
      // l'altezza del corpo che la getta per la pendenza della luce — con una
      // luce molto angolata la pagina a metà giro (che si alza parecchio
      // verso la camera) getterebbe ombre che "sparano" lontano dal libro,
      // dove non ci si aspetta nulla. Quasi frontale, le ombre interne
      // (pagina su pila, pagina su pagina) restano attaccate a chi le fa.
      const direzionale = new THREE.DirectionalLight(0xfff9f0, 1.35)
      direzionale.position.set(0.9, 1.4, 4.0)
      direzionale.castShadow = true
      direzionale.shadow.mapSize.set(2048, 2048)
      // Il frustum deve contenere anche la pila girata a sinistra (fino a
      // x = -1.5 larghezze pagina) e la pagina in volo. Più stretto di così
      // le ombre spariscono di colpo ai bordi; molto più largo si sprecano
      // texel.
      direzionale.shadow.camera.left = -LARGHEZZA_MONDO * 1.8
      direzionale.shadow.camera.right = LARGHEZZA_MONDO * 1.1
      direzionale.shadow.camera.top = ALTEZZA_MONDO * 0.8
      direzionale.shadow.camera.bottom = -ALTEZZA_MONDO * 0.95
      direzionale.shadow.camera.near = 0.5
      direzionale.shadow.camera.far = 12
      // normalBias (e un bias minimo): niente acne né ombre "trapelate" tra
      // superfici sottili e ravvicinate come i fogli della pila.
      direzionale.shadow.bias = -0.0002
      direzionale.shadow.normalBias = 0.02
      scena.add(direzionale)

      const libroGruppo = new THREE.Group()
      libroGruppo.rotation.x = ROT_X_LIBRO
      libroGruppo.rotation.y = ROT_Y_LIBRO
      scena.add(libroGruppo)

      // L'"appoggio" del libro è un alone morbido pre-sfumato che segue
      // l'impronta del volume (lo posiziona posizionaLibro: metà destra a
      // libro chiuso, doppia pagina da aperto). NON è un piano che riceve le
      // ombre vere: la pagina in volo si alza parecchio e la sua ombra
      // proiettata finirebbe lontano dal libro, dove non ci si aspetta
      // nulla. E niente drop-shadow CSS sul canvas: quel filtro andrebbe
      // ricalcolato a ogni frame ed è una causa classica di scatti su mobile.
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
      // Spostato verso il basso-sinistra, opposto alla luce, come una vera
      // ombra di contatto (la x la aggiorna posizionaLibro col travaso).
      alone.position.set(-LARGHEZZA_MONDO / 2 - 0.12, -0.16, -0.05)
      libroGruppo.add(alone)

      // Ombra d'incavo lungo la costa: in un libro vero aperto le pagine si
      // incurvano verso la rilegatura e lì la luce non arriva. Una striscia
      // sfumata sopra le pile, visibile solo quando il libro è aperto
      // (opacità aggiornata in applicaAngolo/effetto pagina: 0 sulle
      // copertine, piena a libro aperto).
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

      // Riempie posizione e normali di UNA geometria (fronte o retro,
      // condividono la stessa forma) con la catena calcolata per `curvaAmp`.
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

          // Stato a riposo: piatta (curva=0), applicata subito così non c'è
          // un frame vuoto prima della prima interazione.
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
      // Azzerato PRIMA del dispose: eventuali onUpdate di molle ancora vive
      // trovano treRef nullo e non toccano più il renderer smaltito.
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

  // Dispone il libro a riposo per una data apertura (0 = chiuso sulla
  // copertina, N = chiuso sul retro): pagine ferme appoggiate sulla propria
  // pila (il lato lo dice il loro angolo), alone d'appoggio, ombra d'incavo.
  // `salta` è la pagina in volo, che posiziona applicaAngolo. Tutto è
  // funzione continua dell'apertura: nessun valore salta quando lo stato
  // React si aggiorna a fine giro.
  const posizionaLibro = (apertura, salta = null) => {
    const tre = treRef.current
    if (!tre) return
    // L'alone d'appoggio segue l'impronta del libro: solo la metà destra a
    // libro chiuso, tutta la doppia pagina da aperto, solo la sinistra alla
    // fine — con continuità.
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

  // Ogni volta che cambia quante pagine sono già girate, si rinormalizza lo
  // stato di riposo. La pagina appena girata è già alla z giusta (vedi
  // applicaAngolo): qui non c'è nessuno scatto.
  useEffect(() => {
    const tre = treRef.current
    if (!tre) return
    posizionaLibro(pagina)
    tre.richiediRender()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina])

  // Applica l'angolo alla pagina `indice`: ruota il suo gruppo (come un vero
  // libro), ridisegna la sua geometria piegata e chiede un ridisegno.
  // La camera NON si tocca: è fissa sulla costa.
  const applicaAngolo = (indice, angolo) => {
    // Fine corsa fisico: oltre 0° e -180° ci sono le pile di pagine — la
    // rotazione si ferma lì anche se la molla in overshoot chiede di più,
    // altrimenti la pagina attraverserebbe quelle sotto.
    const rotazione = Math.min(0, Math.max(-180, angolo))
    const tre = treRef.current
    if (!tre) {
      angoli.current[indice] = rotazione
      return
    }
    const progresso = -rotazione / 180
    const pieno = Math.sin(progresso * Math.PI) // 0→1→0: quanto si è "a metà giro" ora

    // Flessione dinamica: quanto più veloce gira, tanto più il bordo libero
    // resta indietro. Insegue la velocità con un po' di inerzia (la carta
    // non scatta), e il segno si inverte da solo girando all'indietro.
    const ora = performance.now()
    const dt = ora - piega.current.ultimoTempo
    if (dt > 0 && dt < 200) {
      const velocitaAngolare = (rotazione - piega.current.ultimoAngolo) / dt
      const obiettivo = Math.max(-PIEGA_MAX, Math.min(PIEGA_MAX, -velocitaAngolare * PIEGA_GUADAGNO))
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
      // Quota del volo: interpola tra il riposo sulla pila destra e quello
      // sulla sinistra — la cerniera non si alza mai (il sollevamento è
      // nella geometria, a rampa), quindi decollo e atterraggio sono esatti
      // e la radice della pagina resta sempre attaccata alla rilegatura.
      const zDestra = (N - indice) * SCARTO_PILA
      const zSinistra = (indice + 1) * SCARTO_PILA
      p.gruppo.position.z = zDestra + (zSinistra - zDestra) * progresso
      const curvaAmp =
        Math.max(-PIEGA_TOTALE_MAX, Math.min(PIEGA_TOTALE_MAX, pieno + piega.current.extra)) * rigidita(indice)
      const alzata = SOLLEVAMENTO_VOLO * Math.sin(progresso * Math.PI) * rigidita(indice)
      const { posX, posZ, angoliSegmento } = calcolaColonne(curvaAmp, alzata)
      const angoliVert = angoliVertici(angoliSegmento)
      tre.applicaGeometria(p.fronteGeo, posX, posZ, angoliVert)
      tre.applicaGeometria(p.retroGeo, posX, posZ, angoliVert)
    }

    tre.richiediRender()
  }

  // Applica SOLO la flessione residua alla pagina `indice` ferma a fine
  // corsa: usata dalla vibrazione di assestamento (flutter), quando angolo e
  // profondità sono già quelli di riposo.
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

  // All'atterraggio la pagina arriva con la flessione dell'ultimo istante di
  // volo: la scarica con una molla poco smorzata — il fruscio della carta
  // che si assesta. Non blocca l'interazione (inCorso resta falso): chi
  // riprende subito la pagina la trova dove sta, senza scatti (vedi
  // iniziaTrascinamento, che eredita la flessione corrente del flutter).
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

  // Ferma un eventuale flutter prima di una nuova interazione; se riguardava
  // proprio la pagina che si sta per muovere, la sua flessione corrente
  // viene ereditata così la geometria non salta.
  const fermaFlutter = (indice) => {
    const f = flutter.current
    if (!f) return
    f.anim?.cancel?.()
    if (f.indice === indice) piega.current.extra = f.stato.extra
    flutter.current = null
  }

  // Cedimento elastico di TUTTO il libro quando si prova a sfogliare oltre le
  // copertine: un libro vero non fa ruotare la copertina attraverso la pila,
  // al massimo si sposta un po' tutto insieme.
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

  // Assesta la pagina `indice` fino ad `aAngolo` con una molla fisica reale
  // (Anime.js `spring`), innescata dalla velocità del gesto (0 se non c'è,
  // es. tastiera o clic): parte di slancio se il gesto era veloce, e la
  // durata dell'assestamento la decide la molla stessa, non un tempo fisso.
  const assesta = (indice, verso, aAngolo, cambiaPagina, velocita = 0) => {
    const da = angoli.current[indice]
    const chiudi = () => {
      inCorso.current = false
      if (cambiaPagina) setPagina((p) => p + verso)
    }
    if (!animateRef.current || !springRef.current || animazioniRidotte() || da === aAngolo) {
      piega.current.extra = 0
      applicaAngolo(indice, aAngolo)
      chiudi()
      return
    }
    inCorso.current = true
    // La molla di Anime.js (solver WebKit) lavora sul progresso normalizzato
    // 0→1 della corsa: la velocità del gesto (gradi/ms) va convertita in
    // unità di corsa al secondo, positiva se il gesto andava VERSO il target.
    // Passarla grezza (come unità diverse e col segno dell'asse dei gradi)
    // farebbe partire la molla all'indietro per un istante a ogni rilascio.
    const velocitaNormalizzata = Math.max(-20, Math.min(20, (velocita * 1000) / (aAngolo - da)))
    const stato = { angolo: da }
    animateRef.current(stato, {
      angolo: aAngolo,
      ease: springRef.current({ mass: 1, stiffness: 280, damping: 32, velocity: velocitaNormalizzata }),
      onUpdate: () => applicaAngolo(indice, stato.angolo),
      onComplete: () => {
        chiudi()
        avviaFlutter(indice)
      },
    })
  }

  // Giro completo (tastiera, o clic senza trascinamento).
  const gira = (verso) => {
    // Anime.js può essere pronto (dinamicamente importato) qualche istante
    // prima che le texture della scena 3D finiscano di caricare: senza
    // questo controllo, in quella finestra partirebbe comunque una molla
    // che anima `pagina` a vuoto — lo stato avanza ma la rotazione 3D non
    // si applica mai, perché la pagina non esiste ancora in scena.
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
      // Si prova a sfogliare oltre la copertina o l'ultima pagina: nessun
      // vero giro, ma un piccolo cedimento elastico di tutto il libro
      // (assestato in fineTrascinamento/annullaTrascinamento), non il nulla.
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
      // Presa diretta: il bordo libero della pagina segue il dito 1:1.
      // Si converte lo spostamento del puntatore in unità mondo (il piano
      // del libro riempie 1/MARGINE_CAMERA del widget) e si ricava l'angolo
      // dalla posizione orizzontale del bordo: x = L·cos(angolo), quindi
      // angolo = -acos(x/L) — la cinematica vera di un lembo incernierato.
      mondoPerPx: (2 * LARGHEZZA_MONDO * MARGINE_CAMERA) / rect.width,
      bordoXIniziale: LARGHEZZA_MONDO * Math.cos((Math.abs(angoli.current[indice]) * Math.PI) / 180),
      progresso: 0,
      mosso: false,
      velocita: 0, // gradi/ms, media mobile presa durante il trascinamento
      ultimoAngolo: angoli.current[indice],
      ultimoTempo: performance.now(),
    }
  }

  // Progresso 0→1 del gesto ai limiti del libro (solo caso `limite`).
  const progressoTrascinamento = (t, clientX) => {
    const dx = clientX - t.startX
    const grezzo = t.verso === 1 ? -dx : dx
    return Math.min(Math.max(grezzo / t.larghezza, 0), 1)
  }

  const muoviTrascinamento = (e) => {
    const t = trascinamento.current
    if (!t || e.pointerId !== t.pointerId) return
    if (t.limite) {
      // Resistenza che si esaurisce (tanh): tanta cedevolezza all'inizio,
      // poi sempre meno — come spingere un libro chiuso, che accompagna
      // appena e poi non va più in là.
      const cedimento = CEDIMENTO_LIBRO * Math.tanh(progressoTrascinamento(t, e.clientX) * 2.2)
      applicaCedimentoLibro(t.verso === 1 ? -cedimento : cedimento)
      return
    }
    const dx = e.clientX - t.startX
    if (Math.abs(dx) > SOGLIA_CLIC) t.mosso = true
    const bordoX = Math.max(-LARGHEZZA_MONDO, Math.min(LARGHEZZA_MONDO, t.bordoXIniziale + dx * t.mondoPerPx))
    const angolo = (-Math.acos(bordoX / LARGHEZZA_MONDO) * 180) / Math.PI
    t.progresso = t.verso === 1 ? -angolo / 180 : 1 + angolo / 180
    // Velocità reale del gesto, per il rilascio "al volo" — campionata non più
    // spesso di ~60fps per non farla saltare tra due eventi troppo vicini.
    const ora = performance.now()
    const dt = ora - t.ultimoTempo
    if (dt > 8) {
      t.velocita = Math.max(-VELOCITA_MAX, Math.min(VELOCITA_MAX, (angolo - t.ultimoAngolo) / dt))
      t.ultimoAngolo = angolo
      t.ultimoTempo = ora
    }
    applicaAngolo(t.indice, angolo)
  }

  const fineTrascinamento = (e) => {
    const t = trascinamento.current
    if (!t || e.pointerId !== t.pointerId) return
    trascinamento.current = null
    if (t.limite) {
      assestaLibro()
      return
    }
    // Lo slancio vale solo se il dito si muoveva davvero al rilascio: se ci
    // si ferma un attimo e POI si lascia, la velocità di prima non conta più.
    if (performance.now() - t.ultimoTempo > VELOCITA_STANTIA_MS) t.velocita = 0
    const alVolo = t.verso === 1 ? t.velocita < -SOGLIA_VOLO : t.velocita > SOGLIA_VOLO
    const controVolo = t.verso === 1 ? t.velocita > SOGLIA_VOLO : t.velocita < -SOGLIA_VOLO
    // Poco trascinamento = vale come clic: gira comunque per intero. Un flick
    // nella direzione opposta invece annulla il giro anche oltre la soglia,
    // come una pagina vera rilanciata indietro.
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
        <div
          ref={wrapperRef}
          className="relative w-full max-w-[520px] touch-pan-y select-none sm:max-w-[680px] lg:max-w-[840px]"
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
            {/* Copertina di scorta: sempre nel markup (corretta senza JS e
                nel pre-rendering — senza JS la pagina non si è mai potuta
                sfogliare, quindi si vede comunque solo la copertina, chiusa
                sulla metà destra della doppia pagina, dove sta anche nella
                scena 3D). Sparisce quando la scena 3D è pronta; resta se
                WebGL non è disponibile. Posizione e misure derivano da
                MARGINE_CAMERA (1/1.12 ≈ 89.3% del riquadro per il libro),
                corrette per la prospettiva: la copertina chiusa sta in cima
                alla pila, un filo più vicina alla camera, e si proietta
                ~1% più grande. */}
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

            {/* La scena 3D vera: Three.js monta qui il proprio <canvas>.
                Sborda del 12% per lato (vedi MARGINE_TELA): la pagina in volo
                si proietta più grande del libro e ha bisogno di aria per non
                venire tagliata dal bordo del canvas. Non riceve eventi: sotto
                c'è il livello di interazione, grande quanto il libro. */}
            <div
              ref={mountRef}
              className={`pointer-events-none absolute -inset-[12%] ${pronto ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            />

            {/* Livello di interazione, allineato al riquadro del libro.
                touch-pan-y (non touch-none): lo scroll verticale della pagina
                resta possibile anche partendo dal libro; il trascinamento
                orizzontale sfoglia. */}
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
