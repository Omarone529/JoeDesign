import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Archive from './pages/Archive'
import ProjectDetail from './pages/ProjectDetail'
import { useHashRoute } from './hooks/useHashRoute'

export default function App() {
  const route = useHashRoute()

  return (
    <div id="top" className="min-h-screen bg-paper">
      <Navbar route={route} />
      {route.name === 'archive' && <Archive />}
      {route.name === 'project' && <ProjectDetail slug={route.slug} />}
      {route.name === 'home' && <Home />}
      <Footer />
    </div>
  )
}
