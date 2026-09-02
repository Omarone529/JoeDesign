import { useSyncExternalStore } from 'react'

/*
 * La scelta sui video di YouTube, tenuta fuori da React perché la leggono più
 * componenti (il carosello e la pagina privacy) e non si passa di padre in
 * figlio: non c'è un padre comune.
 *
 * Tre stati: `null` = non ha ancora scelto, 'si' = i video possono partire da
 * soli, 'no' = restano fermi. In `null` e in 'no' il comportamento è lo stesso
 * — nessun contatto con YouTube finché non si preme play — ma vanno distinti,
 * o il banner tornerebbe a chiedere a chi ha già risposto di no.
 *
 * Sta in `localStorage` e non in un cookie: è una preferenza tecnica, serve a
 * NON caricare roba di terzi, e non segue chi naviga da nessuna parte.
 *
 * `useSyncExternalStore` e non uno `useState` in `useEffect`: il pre-rendering
 * non ha `localStorage`, e `versioneServer` gli dà `null`, cioè lo stato in cui
 * nulla di esterno si carica. L'HTML statico è quindi lo stesso per tutti, e in
 * hydration React passa al valore vero senza disallineamenti.
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

/*
 * `false` in pre-rendering e alla prima resa, `true` dopo l'hydration.
 *
 * Serve al banner: l'HTML statico è uno solo per tutti e non sa cosa si è già
 * risposto, quindi disegnandolo lì chi ha già scelto se lo vedrebbe comparire e
 * sparire a ogni visita. E senza JavaScript non si carica nessun video, quindi
 * non c'è niente da consentire e il banner non ha ragione di esserci.
 */
const nonCambiaMai = () => () => {}
const vero = () => true
const falso = () => false

export function useMontato() {
  return useSyncExternalStore(nonCambiaMai, vero, falso)
}
