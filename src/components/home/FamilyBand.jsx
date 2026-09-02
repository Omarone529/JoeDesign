import { familyBandIn, profiloIn } from '../../data/siteData'
import { useLang } from '../../router'

/*
 * Il manifesto accanto alla famiglia di prodotti: la frase dice la ricerca, la
 * foto la mostra finita, e messe una di fianco all'altra si spiegano da sole.
 *
 * Testo a sinistra, immagine a destra, e tipografia identica a quella del
 * manifesto in "Chi sono": è lo stesso testo, e non può cambiare voce da una
 * pagina all'altra. Il corpo è in `vw`, quindi è lo stesso anche qui dentro
 * mezza griglia — ma la colonna del testo pesa più del doppio di quella della
 * foto perché a comandare l'a capo torni a essere il `max-w` della citazione,
 * come in "Chi sono", e non la larghezza della colonna: stretta, la stessa
 * frase passava da otto righe a dodici. Fra le due colonne c'è il passo
 * orizzontale delle sezioni, 72px: accostate, il blocco di maiuscole e gli
 * oggetti si leggevano come una cosa sola.
 *
 * Da `sm` la foto sborda a destra del passo della sezione e arriva a filo di
 * schermo: la colonna del testo non può stringersi senza far crescere le righe,
 * quindi lo spazio in più la foto se lo prende dal margine. È la stessa cosa
 * che fa il carosello nella scheda progetto, appoggiato al bordo destro mentre
 * il testo resta dentro il passo.
 *
 * `mix-blend-multiply`: lo scatto ha un fondo bianco vero, non trasparente, e
 * rimpicciolito su `paper` sarebbe un rettangolo bianco appoggiato lì.
 * Moltiplicando, il bianco sparisce nella carta e restano gli oggetti — lo
 * stesso rimedio del ritratto in apertura. Il `bg-paper` sulla sezione serve
 * proprio a questo: quello del `body` finisce sulla tela della pagina, che sta
 * fuori da ogni contesto d'impilamento, e con quello la fusione non avviene.
 */
export default function FamilyBand() {
  const lang = useLang()
  const familyBand = familyBandIn(lang)
  const { manifesto } = profiloIn(lang)

  return (
    <section className="border-t-2 border-ink bg-paper px-5 py-16 sm:px-8 sm:py-20 lg:px-[72px] lg:py-24">
      <div className="grid grid-cols-1 items-center gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-x-[72px]">
        <blockquote className="m-0 max-w-[24ch] text-[clamp(26px,4vw,56px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]">
          “{manifesto}”
        </blockquote>

        <img
          src={familyBand.src}
          alt={familyBand.alt}
          loading="lazy"
          decoding="async"
          width={familyBand.width}
          height={familyBand.height}
          className="h-auto w-full mix-blend-multiply contrast-[1.02] sm:max-w-none sm:w-[calc(100%_+_2rem)] lg:w-[calc(100%_+_72px)]"
        />
      </div>
    </section>
  )
}
