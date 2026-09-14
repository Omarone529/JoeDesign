import Hero from '../components/home/Hero'
import SelectedWorks from '../components/home/SelectedWorks'
import Manifesto from '../components/home/Manifesto'

export default function Home() {
  return (
    <main className="animate-viewIn">
      <Hero />
      <SelectedWorks />
      <Manifesto />
    </main>
  )
}
