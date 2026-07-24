import { familyBand } from '../../data/siteData'

/*
 * Fascia immagine a tutta larghezza tra i lavori e i concorsi.
 * Altezza naturale (niente `object-cover` con altezza imposta): la foto di
 * famiglia si vede intera, senza tagli sopra e sotto. `width`/`height`
 * riservano lo spazio in anticipo ed evitano il salto di layout al caricamento.
 */
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
