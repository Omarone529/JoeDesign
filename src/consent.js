import { useSyncExternalStore } from 'react'

/*
 * Scelta sui video YouTube: null (non scelto), 'yes', 'no'. In localStorage, letta con
 * useSyncExternalStore: in pre-rendering vale null, così l'HTML statico è uguale per tutti.
 */
const STORAGE_KEY = 'joe:video-consent'

const listeners = new Set()
let value = null
let hasRead = false

function serverSnapshot() {
  return null
}

export function videoConsent() {
  if (!hasRead) {
    hasRead = true
    try {
      value = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      value = null // navigazione privata o memoria negata: vale per la sessione
    }
  }
  return value
}

export function setVideoConsent(choice) {
  hasRead = true
  value = choice
  try {
    window.localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    // Non memorizzabile: la scelta vale comunque per questa visita.
  }
  listeners.forEach((notify) => notify())
}

function subscribe(notify) {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

export function useVideoConsent() {
  return useSyncExternalStore(subscribe, videoConsent, serverSnapshot)
}

// false in pre-rendering e al primo render, true dopo l'hydration.
const neverChanges = () => () => {}
const alwaysTrue = () => true
const alwaysFalse = () => false

export function useMounted() {
  return useSyncExternalStore(neverChanges, alwaysTrue, alwaysFalse)
}

// Banner in pagina (dopo l'hydration, senza risposta). Lo legge anche il tasto mail, che si nasconde.
export function useBannerOpen() {
  const mounted = useMounted()
  const consent = useVideoConsent()
  return mounted && consent === null
}
