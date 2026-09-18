import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Il manifest dice a prerender.js quale file precaricare per ogni pagina.
  build: { manifest: true },
  // __ANNO_BUILD__: anno del copyright fissato alla build, così HTML statico e hydration coincidono.
  define: {
    __ANNO_BUILD__: new Date().getFullYear(),
  },
})
