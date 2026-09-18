import { useEffect, useRef, useState } from 'react'
import { about, aboutIn } from '../../data/siteData'
import { texts } from '../../i18n'
import { useLang } from '../../router'
import { reducedMotion } from '../../motion'
import {
  WORLD_HEIGHT,
  WORLD_WIDTH,
  STACK_GAP,
  toVertexAngles,
  computeColumns,
  stiffness,
} from './book/geometry'
import { CAMERA_MARGIN, BOOK_ROT_Y, createScene, plateFor } from './book/scene'
const { sketchbook } = about
const N = sketchbook.length
const CLICK_THRESHOLD = 6
const FLIGHT_THRESHOLD = 0.55
const COMPLETION_THRESHOLD = 0.32
const MAX_VELOCITY = 3.2 // gradi/ms
const STALE_VELOCITY_MS = 90 // dito fermo da più di così al rilascio → niente slancio
const BOOK_SAG = (3 * Math.PI) / 180 // oltre le copertine cede tutto il libro, non la pagina
// Alzata a metà giro, per scavalcare le pile.
const FLIGHT_LIFT = 0.28
// Flessione extra proporzionale alla velocità del gesto, sopra la campana del giro.
const BEND_GAIN = 0.2 // per grado/ms
const BEND_MAX = 0.32
const BEND_TOTAL_MAX = 1.15
const BEND_INERTIA_MS = 40
const GUTTER_OPACITY = 0.2 // ombra lungo la costa, solo a libro aperto
// Stato, gesto e molle. Forma in book/geometry.js, scena in book/scene.js: qui mai `new THREE.…`.
export default function Sketchbook() {
  const lang = useLang()
  const T = texts(lang)
  const plates = aboutIn(lang).sketchbook

  const [page, setPage] = useState(0) // quante pagine sono già girate a sinistra
  const [ready, setReady] = useState(false)
  const animateRef = useRef(null)
  const springRef = useRef(null)
  const threeRef = useRef(null)
  const angles = useRef(Array(N).fill(0)) // rotateY di ogni pagina
  const inProgress = useRef(false) // una molla è in corso
  const drag = useRef(null)
  const bend = useRef({ extra: 0, lastAngle: 0, lastTime: 0 })
  const flutter = useRef(null)
  const wrapperRef = useRef(null)
  const mountRef = useRef(null)

  // Libro a riposo per un'apertura (0 chiuso davanti, N chiuso dietro); `skip` è la pagina in volo.
  const positionBook = (opening, skip = null) => {
    const three = threeRef.current
    if (!three) return
    three.fitCamera(opening)
    // L'alone segue l'impronta del libro: mezza pagina da chiuso, due da aperto.
    const openLeft = Math.min(1, opening)
    const openRight = Math.min(1, N - opening)
    three.halo.scale.set((openLeft + openRight) * WORLD_WIDTH * 1.25, WORLD_HEIGHT * 1.3, 1)
    three.halo.position.x = -WORLD_WIDTH / 2 + (openRight - openLeft) * (WORLD_WIDTH / 2) - 0.12
    three.pages.forEach((p, i) => {
      if (i === skip) return
      const turned = angles.current[i] < -90
      p.group.position.z = (turned ? i + 1 : N - i) * STACK_GAP
    })
    three.gutterMat.opacity = GUTTER_OPACITY * Math.min(1, Math.max(0, Math.min(opening, N - opening) / 0.9))
  }

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    let active = true

    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || !active) return
        loadObserver.disconnect()
        start()
      },
      { rootMargin: '600px 0px' }
    )
    if (wrapperRef.current) loadObserver.observe(wrapperRef.current)

    async function start() {
      const [THREE, { animate, spring }] = await Promise.all([import('three'), import('animejs')])
      if (!active || !mountRef.current) return
      animateRef.current = animate
      springRef.current = spring

      // `null` se WebGL non c'è, o se nel frattempo il componente è sparito:
      // in tutti e due i casi resta la copertina statica di scorta.
      const three = await createScene({
        THREE,
        container: mountRef.current,
        plates: sketchbook,
        initialPage: page,
        active: () => active,
      })
      if (!three) return
      threeRef.current = three
      positionBook(page)
      three.resize()
      three.renderer.render(three.scene, three.camera)
      setReady(true)
    }

    return () => {
      active = false
      loadObserver.disconnect()
      flutter.current?.anim?.cancel?.()
      flutter.current = null
      const three = threeRef.current
      // Prima di smaltire: gli onUpdate ancora vivi trovano il ref vuoto.
      threeRef.current = null
      three?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const three = threeRef.current
    if (!three) return
    positionBook(page)
    three.requestRender()
  }, [page])

  // Ruota e piega la pagina; `direction` (1 avanti, -1 indietro) sceglie da che parte inarcarla.
  const applyAngle = (index, angle, direction) => {
    // Oltre 0° e -180° ci sono le pile: la molla in overshoot le attraverserebbe.
    const rotation = Math.min(0, Math.max(-180, angle))
    const three = threeRef.current
    if (!three) {
      angles.current[index] = rotation
      return
    }
    const progress = -rotation / 180
    const fullness = Math.sin(progress * Math.PI) // 0→1→0: quanto si è "a metà giro" ora

    // Col segno della velocità istantanea: tornando indietro col dito, l'arco si inverte.
    const now = performance.now()
    const dt = now - bend.current.lastTime
    if (dt > 0 && dt < 200) {
      const angularVelocity = (rotation - bend.current.lastAngle) / dt
      const goal = Math.max(-BEND_MAX, Math.min(BEND_MAX, angularVelocity * BEND_GAIN))
      bend.current.extra += (goal - bend.current.extra) * Math.min(1, dt / BEND_INERTIA_MS)
    }
    bend.current.lastAngle = rotation
    bend.current.lastTime = now
    angles.current[index] = rotation

    const basePage = index === page ? page : page - 1
    const opening = basePage + progress
    positionBook(opening, index)

    const p = three.pages[index]
    if (p) {
      p.group.rotation.y = (rotation * Math.PI) / 180
      const zRight = (N - index) * STACK_GAP
      const zLeft = (index + 1) * STACK_GAP
      p.group.position.z = zRight + (zLeft - zRight) * progress
      // Il corpo resta indietro rispetto al bordo che tira, quindi il ventre
      // punta dalla parte opposta al moto. Senza, i due giri sono uguali.
      const arcDirection = -direction
      const curveAmp =
        Math.max(-BEND_TOTAL_MAX, Math.min(BEND_TOTAL_MAX, arcDirection * fullness + bend.current.extra)) *
        stiffness(index, N)
      const lift = FLIGHT_LIFT * Math.sin(progress * Math.PI) * stiffness(index, N)
      const { posX, posZ, segmentAngles } = computeColumns(curveAmp, lift)
      const vertexAngles = toVertexAngles(segmentAngles)
      three.applyGeometry(p.frontGeo, posX, posZ, vertexAngles)
      three.applyGeometry(p.rearGeo, posX, posZ, vertexAngles)
    }

    three.requestRender()
  }

  const applyResidualBend = (index, extra) => {
    const three = threeRef.current
    if (!three) return
    const p = three.pages[index]
    if (!p) return
    const { posX, posZ, segmentAngles } = computeColumns(extra * stiffness(index, N))
    const vertexAngles = toVertexAngles(segmentAngles)
    three.applyGeometry(p.frontGeo, posX, posZ, vertexAngles)
    three.applyGeometry(p.rearGeo, posX, posZ, vertexAngles)
    three.requestRender()
  }

  // Molla poco smorzata che scarica la flessione dell'atterraggio.
  const startFlutter = (index) => {
    const fromExtra = bend.current.extra
    bend.current.extra = 0
    if (Math.abs(fromExtra) < 0.04 || !animateRef.current || !springRef.current || reducedMotion()) {
      applyResidualBend(index, 0)
      return
    }
    flutter.current?.anim?.cancel?.()
    const state = { extra: fromExtra }
    const anim = animateRef.current(state, {
      extra: 0,
      ease: springRef.current({ mass: 1, stiffness: 240, damping: 12 }),
      onUpdate: () => applyResidualBend(index, state.extra),
      onComplete: () => {
        flutter.current = null
      },
    })
    flutter.current = { anim, state, index }
  }

  // Ferma un flutter; se riguarda la pagina da muovere, ne eredita la flessione.
  const stopFlutter = (index) => {
    const f = flutter.current
    if (!f) return
    f.anim?.cancel?.()
    if (f.index === index) bend.current.extra = f.state.extra
    flutter.current = null
  }

  // Oltre le copertine cede tutto il libro, non la copertina attraverso la pila.
  const applyBookSag = (rad) => {
    const three = threeRef.current
    if (!three) return
    three.bookGroup.rotation.y = BOOK_ROT_Y + rad
    three.requestRender()
  }

  const settleBook = () => {
    const three = threeRef.current
    const fromValue = three ? three.bookGroup.rotation.y - BOOK_ROT_Y : 0
    if (!animateRef.current || !springRef.current || reducedMotion() || fromValue === 0) {
      applyBookSag(0)
      return
    }
    inProgress.current = true
    const state = { sag: fromValue }
    animateRef.current(state, {
      sag: 0,
      ease: springRef.current({ mass: 1, stiffness: 280, damping: 26 }),
      onUpdate: () => applyBookSag(state.sag),
      onComplete: () => {
        inProgress.current = false
      },
    })
  }

  const settle = (index, direction, toAngle, changePage, velocity = 0) => {
    const fromValue = angles.current[index]
    const close = () => {
      inProgress.current = false
      if (changePage) setPage((p) => p + direction)
    }
    if (!animateRef.current || !springRef.current || reducedMotion() || fromValue === toAngle) {
      bend.current.extra = 0
      applyAngle(index, toAngle, direction)
      close()
      return
    }
    inProgress.current = true
    // La molla lavora sul progresso 0→1: la velocità in gradi/ms va convertita
    // in unità di corsa al secondo, o parte all'indietro a ogni rilascio.
    const normalizedVelocity = Math.max(-20, Math.min(20, (velocity * 1000) / (toAngle - fromValue)))
    const state = { angle: fromValue }
    animateRef.current(state, {
      angle: toAngle,
      ease: springRef.current({ mass: 1, stiffness: 280, damping: 32, velocity: normalizedVelocity }),
      onUpdate: () => applyAngle(index, state.angle, direction),
      onComplete: () => {
        close()
        startFlutter(index)
      },
    })
  }

  // Serve `threeRef`: Anime.js arriva prima delle texture.
  const turn = (direction) => {
    if (!threeRef.current) return
    if (inProgress.current || drag.current) return
    const index = direction === 1 ? page : page - 1
    if (index < 0 || index >= N) return
    stopFlutter(index)
    bend.current.lastAngle = angles.current[index]
    bend.current.lastTime = performance.now()
    settle(index, direction, direction === 1 ? -180 : 0, true)
  }

  const startDrag = (e) => {
    if (!threeRef.current) return
    if (inProgress.current || drag.current) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const direction = e.clientX - rect.left > rect.width / 2 ? 1 : -1
    const index = direction === 1 ? page : page - 1
    e.currentTarget.setPointerCapture?.(e.pointerId)
    if (index < 0 || index >= N) {
      // Oltre le copertine: niente giro, ma un cedimento elastico del libro.
      drag.current = {
        pointerId: e.pointerId,
        limit: true,
        direction,
        startX: e.clientX,
        width: rect.width,
      }
      return
    }
    stopFlutter(index)
    bend.current.lastAngle = angles.current[index]
    bend.current.lastTime = performance.now()
    drag.current = {
      pointerId: e.pointerId,
      index,
      direction,
      startX: e.clientX,
      width: rect.width,
      // Presa diretta, il bordo segue il dito 1:1: x = L·cos(angolo), quindi
      // angolo = -acos(x/L).
      worldPerPx: (2 * WORLD_WIDTH * CAMERA_MARGIN) / rect.width,
      initialEdgeX: WORLD_WIDTH * Math.cos((Math.abs(angles.current[index]) * Math.PI) / 180),
      progress: 0,
      moved: false,
      velocity: 0, // gradi/ms, media mobile
      lastAngle: angles.current[index],
      lastTime: performance.now(),
    }
  }

  const dragProgress = (t, clientX) => {
    const dx = clientX - t.startX
    const raw = t.direction === 1 ? -dx : dx
    return Math.min(Math.max(raw / t.width, 0), 1)
  }

  const moveDrag = (e) => {
    const t = drag.current
    if (!t || e.pointerId !== t.pointerId) return
    if (t.limit) {
      // Resistenza che si esaurisce (tanh): cede all'inizio, poi sempre meno,
      // come spingere un libro chiuso.
      const sagAmount = BOOK_SAG * Math.tanh(dragProgress(t, e.clientX) * 2.2)
      applyBookSag(t.direction === 1 ? -sagAmount : sagAmount)
      return
    }
    const dx = e.clientX - t.startX
    if (Math.abs(dx) > CLICK_THRESHOLD) t.moved = true
    const edgeX = Math.max(-WORLD_WIDTH, Math.min(WORLD_WIDTH, t.initialEdgeX + dx * t.worldPerPx))
    const angle = (-Math.acos(edgeX / WORLD_WIDTH) * 180) / Math.PI
    t.progress = t.direction === 1 ? -angle / 180 : 1 + angle / 180
    // Campionata a ~60fps al massimo: fra due eventi troppo vicini salterebbe.
    const now = performance.now()
    const dt = now - t.lastTime
    if (dt > 8) {
      t.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, (angle - t.lastAngle) / dt))
      t.lastAngle = angle
      t.lastTime = now
    }
    applyAngle(t.index, angle, t.direction)
  }

  const endDrag = (e) => {
    const t = drag.current
    if (!t || e.pointerId !== t.pointerId) return
    drag.current = null
    if (t.limit) {
      settleBook()
      return
    }
    // Lo slancio vale solo se il dito si muoveva davvero al rilascio.
    if (performance.now() - t.lastTime > STALE_VELOCITY_MS) t.velocity = 0
    const inFlight = t.direction === 1 ? t.velocity < -FLIGHT_THRESHOLD : t.velocity > FLIGHT_THRESHOLD
    const counterFlight = t.direction === 1 ? t.velocity > FLIGHT_THRESHOLD : t.velocity < -FLIGHT_THRESHOLD
    // Poco trascinamento vale come clic e gira comunque. Un flick opposto
    // annulla il giro anche oltre la soglia, come una pagina rilanciata.
    const complete = !t.moved || (!counterFlight && (t.progress > COMPLETION_THRESHOLD || inFlight))
    const toAngle = complete ? (t.direction === 1 ? -180 : 0) : (t.direction === 1 ? 0 : -180)
    settle(t.index, t.direction, toAngle, complete, t.velocity)
  }

  const cancelDrag = (e) => {
    const t = drag.current
    if (!t || e.pointerId !== t.pointerId) return
    drag.current = null
    if (t.limit) {
      settleBook()
      return
    }
    settle(t.index, t.direction, t.direction === 1 ? 0 : -180, false)
  }

  return (
    // `clip` e non `hidden`: taglia lo sbordo del canvas ai lati, non la pagina che gira sopra e sotto.
    <section className="overflow-x-clip border-t border-line px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
      <div className="mb-10 text-[11px] uppercase tracking-[0.24em] text-muted">
        {T.about.sketchbook}
      </div>

      <div className="flex flex-col items-center">
        {/* `tabIndex` e frecce sono l'unico modo di sfogliare senza mouse: il
            libro si gira trascinando. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          ref={wrapperRef}
          className="relative w-[96%] max-w-[538px] touch-pan-y select-none sm:max-w-[749px] lg:max-w-[960px] xl:max-w-[1075px]"
          role="group"
          tabIndex={0}
          aria-roledescription={T.about.sketchbookRole}
          aria-label={T.about.sketchbookAria}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') turn(1)
            if (e.key === 'ArrowLeft') turn(-1)
          }}
        >
          <div className="relative aspect-square w-full sm:aspect-[2000/1415]">
            {/* Scorta finché la scena non è pronta, o senza WebGL. */}
            <picture>
              {/* La mezza misura: è quella che poi carica la scena, quindi resta in cache. */}
              <source media="(pointer: coarse)" srcSet={plateFor(plates[0].front.src, true)} />
              <img
                src={plates[0].front.src}
                alt={plates[0].front.alt}
                width={1000}
                height={1415}
                loading="eager"
                decoding="async"
                className={`pointer-events-none absolute left-1/2 top-[5%] h-[90%] w-auto -translate-x-1/2 border border-line bg-paper object-cover transition-opacity duration-300 [filter:drop-shadow(0_18px_26px_rgba(20,17,15,0.18))] ${
                  ready ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </picture>

            {/* Il canvas sborda del 12% per lato (CANVAS_MARGIN) e non riceve eventi. */}
            <div
              ref={mountRef}
              className={`pointer-events-none absolute -inset-[12%] ${ready ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            />

            {/* `touch-pan-y` e non `touch-none`: lo scroll verticale resta
                possibile anche partendo dal libro, l'orizzontale sfoglia. */}
            <div
              className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={cancelDrag}
            />
          </div>
        </div>

        <span className="mt-6 text-[13px] tabular-nums tracking-[0.04em] text-muted">
          {String(Math.min(page + 1, N)).padStart(2, '0')} / {String(N).padStart(2, '0')}
        </span>
      </div>
    </section>
  )
}
