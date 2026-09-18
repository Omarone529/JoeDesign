import { Suspense } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingMailButton from './components/FloatingMailButton'
import ErrorBoundary from './components/ErrorBoundary'
import BannerPrivacy from './components/BannerPrivacy'
import { useRoute } from './router'
import { caricaPagina, paginaCaricata } from './pagine'

// Già caricata prima dell'hydration e di ogni cambio pagina: la sospensione è solo una rete.
function PaginaCorrente({ route }) {
  const Pagina = paginaCaricata(route.name)
  if (!Pagina) throw caricaPagina(route.name)
  // Riferimento stabile preso da una cache, non creato qui.
  // eslint-disable-next-line react-hooks/static-components
  return <Pagina area={route.area} slug={route.slug} />
}

export default function App() {
  const route = useRoute()

  return (
    <div id="top" className="min-h-[var(--schermo,100vh)] bg-paper">
      <Navbar route={route} />
      <ErrorBoundary rotta={route.path} lang={route.lang}>
        <Suspense fallback={null}>
          <PaginaCorrente route={route} />
        </Suspense>
      </ErrorBoundary>
      <Footer />
      <FloatingMailButton />
      {/* Fuori dalla pagina corrente: la domanda arriva all'ingresso, non a chi
          è già dentro una scheda col reel pronto a partire. */}
      <BannerPrivacy />
    </div>
  )
}
