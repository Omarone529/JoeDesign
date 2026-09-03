import { familyBandIn } from '../../data/siteData'
import { useLang } from '../../router'

/*
 * La famiglia di prodotti, da bordo a bordo e senza testo accanto: la fila di
 * oggetti è già il riassunto del lavoro, e in mezza griglia non si leggeva.
 *
 * A tutta larghezza il fondo bianco dello scatto riempie la fascia e non serve
 * il `mix-blend-multiply` che serviva alla versione stretta, dove il bianco
 * restava un rettangolo appoggiato sulla carta. `bg-placeholder` si vede solo
 * finché l'immagine non è arrivata.
 *
 * Il manifesto che stava qui di fianco non è andato perso: è lo stesso testo
 * che apre "Chi sono", sopra il libro sfogliabile.
 */
export default function FamilyBand() {
  const familyBand = familyBandIn(useLang())

  return (
    <section className="bg-placeholder">
      <img
        src={familyBand.src}
        alt={familyBand.alt}
        loading="lazy"
        decoding="async"
        width={familyBand.width}
        height={familyBand.height}
        className="block h-auto w-full contrast-[1.02]"
      />
    </section>
  )
}
