import Hero from '../components/home/Hero'
import SelectedWorks from '../components/home/SelectedWorks'
import FamilyBand from '../components/home/FamilyBand'
import SkillsTicker from '../components/home/SkillsTicker'

export default function Home() {
  return (
    <main className="animate-viewIn">
      <Hero />
      <SelectedWorks />
      <FamilyBand />
      <SkillsTicker />
    </main>
  )
}
