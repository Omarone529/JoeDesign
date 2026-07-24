import Masthead from '../components/home/Masthead'
import SelectedWorks from '../components/home/SelectedWorks'
import FamilyBand from '../components/home/FamilyBand'
import ContestsTicker from '../components/home/ContestsTicker'

/*
 * Homepage / Indice - riproduzione della "Direzione A".
 * La classe animate-viewIn replica la transizione d'ingresso `.view`
 * del template originale.
 */
export default function Home() {
  return (
    <main className="animate-viewIn">
      <Masthead />
      <SelectedWorks />
      <FamilyBand />
      <ContestsTicker />
    </main>
  )
}
