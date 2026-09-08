import { manifestoFotoIn, profiloIn } from '../../data/siteData'
import { useLang } from '../../router'
import { srcSetDi, MISURE } from '../../immagini'

/*
 * Il manifesto e, sotto, la foto di Joe con la lampada accesa.
 *
 * Vengono da "Chi sono", dove chiudevano la pagina: in home dicono con che
 * criterio i progetti appena mostrati sono fatti, e prendono il posto della
 * fascia con la famiglia di prodotti — che resta la sorgente delle anteprime
 * social dell'archivio, la pagina in cui quegli oggetti si guardano davvero.
 *
 * La frase sta su fondo carta, la foto su `bg-night`: è lo stesso stacco che
 * porta al footer, e il filetto grosso in cima la separa dai lavori
 * selezionati, che finiscono senza bordo.
 */
export default function Manifesto() {
  const lang = useLang()
  const profile = profiloIn(lang)
  const foto = manifestoFotoIn(lang)

  return (
    <>
      <section className="border-t-2 border-ink px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
        <blockquote className="m-0 max-w-[24ch] text-[clamp(26px,4vw,56px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]">
          “{profile.manifesto}”
        </blockquote>
      </section>

      <section className="bg-night">
        <img
          src={foto.src}
          srcSet={srcSetDi(foto.src)}
          sizes={MISURE.piena}
          alt={foto.alt}
          loading="lazy"
          decoding="async"
          width={foto.width}
          height={foto.height}
          className="block aspect-[16/9] w-full object-cover object-top"
        />
      </section>
    </>
  )
}
