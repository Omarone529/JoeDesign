import { familyBandIn } from '../../data/siteData'
import { useLang } from '../../router'

export default function FamilyBand() {
  const familyBand = familyBandIn(useLang())

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
