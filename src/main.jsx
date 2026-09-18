import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { RouterProvider, parsePath } from './router.jsx'
import { loadPage } from './pageLoader'
import { setScreenHeight } from './screenHeight'
import './index.css'

// Sull'<html>, fuori dall'albero di React: non tocca l'hydration.
setScreenHeight()

const root = document.getElementById('root')

const app = (
  <React.StrictMode>
    <RouterProvider initialPath={window.location.pathname}>
      <App />
    </RouterProvider>
  </React.StrictMode>
)

// Prima la pagina aperta: se l'aggancio la trovasse da scaricare, React ridisegnerebbe.
loadPage(parsePath(window.location.pathname).name).then(() => {
  if (root.hasChildNodes()) {
    hydrateRoot(root, app)
  } else {
    createRoot(root).render(app)
  }
})
