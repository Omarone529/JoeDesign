import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingMailButton from './components/FloatingMailButton'
import Home from './pages/Home'
import About from './pages/About'
import Archive from './pages/Archive'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'
import { useRoute } from './router'

export default function App() {
  const route = useRoute()

  return (
    <div id="top" className="min-h-screen bg-paper">
      <Navbar route={route} />
      {route.name === 'about' && <About />}
      {route.name === 'archive' && <Archive />}
      {route.name === 'project' && <ProjectDetail slug={route.slug} />}
      {route.name === 'notfound' && <NotFound />}
      {route.name === 'home' && <Home />}
      <Footer />
      <FloatingMailButton />
    </div>
  )
}
