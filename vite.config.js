import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  /*
   * Costanti sostituite con il loro valore alla compilazione.
   *
   * __ANNO_BUILD__ - anno del copyright nel footer. Va deciso qui e non nel
   * componente perché le pagine sono statiche: se l'anno venisse calcolato
   * durante il render, l'HTML pre-renderizzato porterebbe l'anno della build e
   * il browser, il primo gennaio, ne calcolerebbe un altro. React troverebbe
   * due testi diversi e l'aggancio alla pagina (hydration) fallirebbe.
   * Fissandolo qui, HTML statico e browser dicono sempre la stessa cosa.
   */
  define: {
    __ANNO_BUILD__: new Date().getFullYear(),
  },
})
