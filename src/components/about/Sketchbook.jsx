import { useEffect, useRef, useState } from 'react'
import { about, aboutIn } from '../../data/siteData'
import { testi } from '../../i18n'
import { useLang } from '../../router'
import { animazioniRidotte } from '../../motion'
import {
  ALTEZZA_MONDO,
  LARGHEZZA_MONDO,
  SCARTO_PILA,
  angoliVertici,
  calcolaColonne,
  rigidita,
} from './libro/geometria'
import { MARGINE_CAMERA, ROT_Y_LIBRO, creaScena, tavolaPer } from './libro/scena'
const { sketchbook } = about
const N = sketchbook.length
const SOGLIA_CLIC = 6
const SOGLIA_VOLO = 0.55
const SOGLIA_COMPLETAMENTO = 0.32
const VELOCITA_MAX = 3.2 // gradi/ms
const VELOCITA_STANTIA_MS = 90 // dito fermo da più di così al rilascio → niente slancio
const CEDIMENTO_LIBRO = (3 * Math.PI) / 180 // oltre le copertine cede tutto il libro, non la pagina
// Quanto il corpo della pagina si alza a metà giro, per scavalcare le pile.
const SOLLEVAMENTO_VOLO = 0.28
// Piega dinamica: il foglio si flette in proporzione alla velocità del gesto,
// oltre alla campana geometrica del giro, e con lo stesso segno.
const PIEGA_GUADAGNO = 0.2 // flessione extra per (grado/ms) di velocità
const PIEGA_MAX = 0.32
const PIEGA_TOTALE_MAX = 1.15
const PIEGA_INERZIA_MS = 40 // costante di tempo con cui la flessione insegue la velocità
const GUTTER_OPACITA = 0.2 // ombra d'incavo lungo la costa, solo a libro aperto
/*
 * Libro sfogliabile 3D: stato, trascinamento, molle, markup. Three.js e Anime.js si caricano
 * vicino al viewport; senza WebGL resta la copertina. Forma in libro/geometria.js, scena in
 * libro/scena.js: qui non si scrive mai `new THREE.…`.
 */
export default function Sketchbook() {
  // Le tavole sono le stesse in entrambe le lingue: cambiano i testi alternativi.
  const lang = useLang()
  const T = testi(lang)
  const tavole = aboutIn(lang).sketchbook

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

  // Libro a riposo per un'apertura (0 chiuso davanti, N chiuso dietro); `salta` è la pagina in volo.
  const posizionaLibro = (apertura, salta = null) => {
    const tre = treRef.current
    if (!tre) return
    tre.inquadra(apertura)
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

    const osservatoreCarico = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || !attivo) return
        osservatoreCarico.disconnect()
        avvia()
      },
      { rootMargin: '600px 0px' }
    )
    if (wrapperRef.current) osservatoreCarico.observe(wrapperRef.current)

    async function avvia() {
      const [THREE, { animate, spring }] = await Promise.all([import('three'), import('animejs')])
      if (!attivo || !mountRef.current) return
      animateRef.current = animate
      springRef.current = spring

      // `null` se WebGL non c'è, o se nel frattempo il componente è sparito:
      // in tutti e due i casi resta la copertina statica di scorta.
      const tre = await creaScena({
        THREE,
        contenitore: mountRef.current,
        tavole: sketchbook,
        paginaIniziale: pagina,
        attivo: () => attivo,
      })
      if (!tre) return
      treRef.current = tre
      posizionaLibro(pagina)
      tre.ridimensiona()
      tre.renderer.render(tre.scena, tre.camera)
      setPronto(true)
    }

    return () => {
      attivo = false
      osservatoreCarico.disconnect()
      flutter.current?.anim?.cancel?.()
      flutter.current = null
      const tre = treRef.current
      // Azzerato prima dello smaltimento: gli onUpdate ancora vivi trovano
      // treRef nullo e non toccano il renderer già smontato.
      treRef.current = null
      tre?.smaltisci()
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

  // Ruota e piega la pagina; `verso` (1 avanti, -1 indietro) sceglie da che parte inarcarla.
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
        rigidita(indice, N)
      const alzata = SOLLEVAMENTO_VOLO * Math.sin(progresso * Math.PI) * rigidita(indice, N)
      const { posX, posZ, angoliSegmento } = calcolaColonne(curvaAmp, alzata)
      const angoliVert = angoliVertici(angoliSegmento)
      tre.applicaGeometria(p.fronteGeo, posX, posZ, angoliVert)
      tre.applicaGeometria(p.retroGeo, posX, posZ, angoliVert)
    }

    tre.richiediRender()
  }

  // Solo la flessione residua di una pagina ferma (per il flutter).
  const applicaPiegaResidua = (indice, extra) => {
    const tre = treRef.current
    if (!tre) return
    const p = tre.pagine[indice]
    if (!p) return
    const { posX, posZ, angoliSegmento } = calcolaColonne(extra * rigidita(indice, N))
    const angoliVert = angoliVertici(angoliSegmento)
    tre.applicaGeometria(p.fronteGeo, posX, posZ, angoliVert)
    tre.applicaGeometria(p.retroGeo, posX, posZ, angoliVert)
    tre.richiediRender()
  }

  // Molla poco smorzata che scarica la flessione dell'atterraggio. Non blocca l'interazione.
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

  // Ferma un flutter; se riguarda la pagina da muovere, ne eredita la flessione.
  const fermaFlutter = (indice) => {
    const f = flutter.current
    if (!f) return
    f.anim?.cancel?.()
    if (f.indice === indice) piega.current.extra = f.stato.extra
    flutter.current = null
  }

  // Oltre le copertine cede tutto il libro, non la copertina attraverso la pila.
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

  // Molla Anime.js fino ad `aAngolo`, innescata dalla velocità del gesto.
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

  // Giro completo da tastiera o clic. Serve `treRef`: Anime.js arriva prima delle texture.
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
      <div className="mb-10 text-[11px] uppercase tracking-[0.24em] text-muted">
        {T.chiSono.sketchbook}
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
          aria-roledescription={T.chiSono.sketchbookRuolo}
          aria-label={T.chiSono.sketchbookAria}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') gira(1)
            if (e.key === 'ArrowLeft') gira(-1)
          }}
        >
          <div className="relative aspect-square w-full sm:aspect-[2000/1415]">
            {/* Copertina di scorta finché la scena non è pronta (o senza WebGL), allineata a `inquadra()`. */}
            <picture>
              {/* Sul telefono anche la scorta prende la tavola a mezza misura:
                  è la stessa che poi userà la scena, quindi è già in cache. */}
              <source media="(pointer: coarse)" srcSet={tavolaPer(tavole[0].front.src, true)} />
              <img
                src={tavole[0].front.src}
                alt={tavole[0].front.alt}
                width={1000}
                height={1415}
                loading="eager"
                decoding="async"
                className={`pointer-events-none absolute left-1/2 top-[5%] h-[90%] w-auto -translate-x-1/2 border border-line bg-paper object-cover transition-opacity duration-300 [filter:drop-shadow(0_18px_26px_rgba(20,17,15,0.18))] ${
                  pronto ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </picture>

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
