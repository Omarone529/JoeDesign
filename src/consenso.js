import { useSyncExternalStore } from 'react'

/*
 * Scelta sui video YouTube: null (non scelto), 'si', 'no'. In localStorage, letta con
 * useSyncExternalStore: in pre-rendering vale null, così l'HTML statico è uguale per tutti.
 */
const CHIAVE = 'joe:consenso-video'

const ascoltatori = new Set()
let valore = null
let letto = false

function versioneServer() {
  return null
}

export function consensoVideo() {
  if (!letto) {
    letto = true
    try {
      valore = window.localStorage.getItem(CHIAVE)
    } catch {
      valore = null // navigazione privata o memoria negata: vale per la sessione
    }
  }
  return valore
}

export function impostaConsensoVideo(scelta) {
  letto = true
  valore = scelta
  try {
    window.localStorage.setItem(CHIAVE, scelta)
  } catch {
    // Non memorizzabile: la scelta vale comunque per questa visita.
  }
  ascoltatori.forEach((avvisa) => avvisa())
}

function iscrivi(avvisa) {
  ascoltatori.add(avvisa)
  return () => ascoltatori.delete(avvisa)
}

export function useConsensoVideo() {
  return useSyncExternalStore(iscrivi, consensoVideo, versioneServer)
}

// false in pre-rendering e al primo render, true dopo l'hydration.
const nonCambiaMai = () => () => {}
const vero = () => true
const falso = () => false

export function useMontato() {
  return useSyncExternalStore(nonCambiaMai, vero, falso)
}

// Banner in pagina (dopo l'hydration, senza risposta). Lo legge anche il tasto mail, che si nasconde.
export function useBannerAperto() {
  const montato = useMontato()
  const consenso = useConsensoVideo()
  return montato && consenso === null
}
