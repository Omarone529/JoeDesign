import { familyBand } from '../../data/siteData'

/* Fascia immagine a tutta larghezza tra i lavori e i concorsi. */
export default function FamilyBand() {
  return (
    <section className="bg-placeholder">
      <img
        src={familyBand.src}
        alt={familyBand.alt}
        loading="lazy"
        className="h-[clamp(280px,52vh,620px)] w-full object-cover contrast-[1.02]"
      />
    </section>
  )
}
