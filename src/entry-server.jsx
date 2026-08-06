import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { RouterProvider, parsePath } from './router.jsx'

export function render(path) {
  const html = renderToString(
    <RouterProvider initialPath={path}>
      <App />
    </RouterProvider>,
  )
  return { html }
}

export { allRoutes, metaForRoute, SITE } from './seo.js'
export { profile } from './data/siteData'
export { parsePath }
