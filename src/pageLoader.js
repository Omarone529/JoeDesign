// Una pagina = un file JS, caricato quando serve. Le chiavi sono i nomi di rotta di routes.js.
const loaders = {
  home: () => import('./pages/Home.jsx'),
  about: () => import('./pages/About.jsx'),
  archive: () => import('./pages/Archive.jsx'),
  project: () => import('./pages/ProjectDetail.jsx'),
  privacy: () => import('./pages/Privacy.jsx'),
  notfound: () => import('./pages/NotFound.jsx'),
}

// I sorgenti, per il modulepreload che prerender.js mette nell'HTML.
export const SOURCES = {
  home: 'src/pages/Home.jsx',
  about: 'src/pages/About.jsx',
  archive: 'src/pages/Archive.jsx',
  project: 'src/pages/ProjectDetail.jsx',
  privacy: 'src/pages/Privacy.jsx',
  notfound: 'src/pages/NotFound.jsx',
}

const loaded = {}
const inProgress = {}

export function loadedPage(name) {
  return loaded[name]
}

export function loadPage(name) {
  inProgress[name] ??= loaders[name]().then(
    (m) => (loaded[name] = m.default),
    (error) => {
      // Dopo un deploy i file vecchi non ci sono più: si ricarica l'indirizzo, già aggiornato.
      if (typeof window === 'undefined') throw error
      window.location.reload()
      return new Promise(() => {})
    },
  )
  return inProgress[name]
}

export function loadAllPages() {
  return Promise.all(Object.keys(loaders).map(loadPage))
}
