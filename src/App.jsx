import { Suspense } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingMailButton from './components/FloatingMailButton'
import ErrorBoundary from './components/ErrorBoundary'
import PrivacyBanner from './components/PrivacyBanner'
import { useRoute } from './router'
import { loadPage, loadedPage } from './pageLoader'

// Già caricata prima dell'hydration e di ogni cambio pagina: la sospensione è solo una rete.
function CurrentPage({ route }) {
  const Page = loadedPage(route.name)
  if (!Page) throw loadPage(route.name)
  // Riferimento stabile preso da una cache, non creato qui.
  // eslint-disable-next-line react-hooks/static-components
  return <Page area={route.area} slug={route.slug} />
}

export default function App() {
  const route = useRoute()

  return (
    <div id="top" className="min-h-[var(--screen-height,100vh)] bg-paper">
      <Navbar route={route} />
      <ErrorBoundary route={route.path} lang={route.lang}>
        <Suspense fallback={null}>
          <CurrentPage route={route} />
        </Suspense>
      </ErrorBoundary>
      <Footer />
      <FloatingMailButton />
      {/* Su tutte le pagine: la domanda va fatta all'ingresso. */}
      <PrivacyBanner />
    </div>
  )
}
