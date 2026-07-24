import { useEffect, useState } from 'react'

/*
 * Routing minimale basato sull'hash dell'URL — nessuna dipendenza esterna,
 * coerente con la navigazione ad ancore già usata nel template.
 *   #                 → Indice (home)
 *   #archivio         → Archivio
 *   #progetto/<slug>  → Scheda progetto
 */
export function parseHash(hash) {
  const h = (hash || '').replace(/^#/, '')
  if (h === 'archivio') return { name: 'archive' }
  if (h.startsWith('progetto/')) {
    return { name: 'project', slug: decodeURIComponent(h.slice('progetto/'.length)) }
  }
  return { name: 'home' }
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
