// Una pagina = un file JS, caricato quando serve. Le chiavi sono i nomi di rotta di rotte.js.
const caricatori = {
  home: () => import('./pages/Home.jsx'),
  about: () => import('./pages/About.jsx'),
  archive: () => import('./pages/Archive.jsx'),
  project: () => import('./pages/ProjectDetail.jsx'),
  privacy: () => import('./pages/Privacy.jsx'),
  notfound: () => import('./pages/NotFound.jsx'),
}

// I sorgenti, per il modulepreload che prerender.js mette nell'HTML.
export const SORGENTI = {
  home: 'src/pages/Home.jsx',
  about: 'src/pages/About.jsx',
  archive: 'src/pages/Archive.jsx',
  project: 'src/pages/ProjectDetail.jsx',
  privacy: 'src/pages/Privacy.jsx',
  notfound: 'src/pages/NotFound.jsx',
}

const caricate = {}
const inCorso = {}

export function paginaCaricata(nome) {
  return caricate[nome]
}

export function caricaPagina(nome) {
  inCorso[nome] ??= caricatori[nome]().then(
    (m) => (caricate[nome] = m.default),
    (errore) => {
      // Dopo un deploy i file vecchi non ci sono più: si ricarica l'indirizzo, già aggiornato.
      if (typeof window === 'undefined') throw errore
      window.location.reload()
      return new Promise(() => {})
    },
  )
  return inCorso[nome]
}

export function caricaTutte() {
  return Promise.all(Object.keys(caricatori).map(caricaPagina))
}
