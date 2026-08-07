import { familyBand } from '../../data/siteData'

export default function FamilyBand() {
  return (
    <section className="bg-placeholder">
      <img
        src={familyBand.src}
        alt={familyBand.alt}
        loading="lazy"
        width="4961"
        height="2653"
        className="block h-auto w-full contrast-[1.02]"
      />
    </section>
  )
}
