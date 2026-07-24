import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { RouterProvider, parsePath } from './router.jsx'

/*
 * Entry di rendering lato server usato SOLO in fase di build dallo script di
 * pre-rendering. Per ogni path restituisce l'HTML della pagina già "disegnata".
 * Non viene mai spedito al browser: serve a generare i file HTML statici.
 */
export function render(path) {
  const html = renderToString(
    <RouterProvider initialPath={path}>
      <App />
    </RouterProvider>,
  )
  return { html }
}

// Ri-esportati così che lo script di pre-rendering importi tutto dal bundle già
// compilato da Vite (niente JSX/CSS da gestire a mano in Node).
export { allRoutes, metaForRoute, SITE } from './seo.js'
export { parsePath }
