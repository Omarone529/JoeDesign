import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { RouterProvider } from './router.jsx'
import './index.css'

const root = document.getElementById('root')

const app = (
  <React.StrictMode>
    <RouterProvider initialPath={window.location.pathname}>
      <App />
    </RouterProvider>
  </React.StrictMode>
)

if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
