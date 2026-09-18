import { useEffect, useRef } from 'react'

import { aboutIn } from '../../data/siteData'
import { testi } from '../../i18n'
import { useLang } from '../../router'
import { srcSetDi, MISURE } from '../../immagini'
import { altezzaSchermo } from '../../altezzaSchermo'

// Card degli strumenti impilate: sticky + scala scritta da un listener di scroll, senza librerie.
// ⚠️ Niente `window` nel render: le card escono dall'HTML statico a scala 1.

// Riduzione per ogni card sopra; l'ultima arriva all'88%, quella in cima non si tocca.
const PASSO = 0.04

/* L'altezza della navbar: le card si fermano sotto, non sotto di lei. La barra
   si ritira scorrendo in giù ma torna scorrendo in su, ed è sopra di loro. */
const BARRA = '4rem'

/* Di quanto ogni card si ferma più in basso della precedente: è la striscia di
   quelle sotto che resta in vista. */
const SCALINO = '0.85rem'

/* Sosta dopo che l'ultima card si è posata. Elemento vero e non padding: lo sticky
   è limitato dal content box del padre. */
const CODA = 'calc(var(--schermo,100svh)*0.5)'

export default function Competenze() {
  const lang = useLang()
  const T = testi(lang)
  const { competenze } = aboutIn(lang)
  const pila = useRef(null)

  useEffect(() => {
    const contenitore = pila.current
    if (!contenitore) return

    const carte = Array.from(contenitore.querySelectorAll(':scope > article'))
    let inCoda = false

    const aggiorna = () => {
      inCoda = false
      const riquadro = contenitore.getBoundingClientRect()
      // Scroll disponibile dentro la pila; senza corsa si esce per non dividere per zero.
      // `altezzaSchermo()` e non innerHeight: con le barre che si ritirano la scala saltava.
      // La coda è sosta, non corsa: contandola la pila si comprimerebbe da ferma.
      const coda = contenitore.lastElementChild?.getBoundingClientRect().height || 0
      const corsa = riquadro.height - coda - altezzaSchermo()
      if (corsa <= 0) {
        carte.forEach((carta) => {
          carta.style.transform = ''
        })
        return
      }

      const avanzamento = Math.min(Math.max(-riquadro.top / corsa, 0), 1)
      carte.forEach((carta, i) => {
        /* Ogni card cede dalla sua frazione di pila fino in fondo: è la pila
           che si comprime, non quattro animazioni separate. */
        const inizio = i / carte.length
        const quota = avanzamento <= inizio ? 0 : (avanzamento - inizio) / (1 - inizio)
        const scala = 1 - quota * (carte.length - 1 - i) * PASSO
        carta.style.transform = scala === 1 ? '' : `scale(${scala.toFixed(4)})`
      })
    }

    const alloScroll = () => {
      if (inCoda) return
      inCoda = true
      requestAnimationFrame(aggiorna)
    }

    aggiorna()
    window.addEventListener('scroll', alloScroll, { passive: true })
    window.addEventListener('resize', alloScroll)
    return () => {
      window.removeEventListener('scroll', alloScroll)
      window.removeEventListener('resize', alloScroll)
    }
  }, [competenze])

  return (
    <section className="px-5 pb-16 pt-14 sm:px-8 lg:px-[72px] lg:pb-24 lg:pt-20">
      {/* La freccia porta U+FE0E (VS-15), che forza la resa testuale: le
          diagonali hanno una variante emoji e su iOS uscirebbero a colori. */}
      <div className="mb-8 flex items-center gap-2 lg:mb-12">
        <span aria-hidden className="text-[15px] leading-none lg:text-[17px]">{'↘︎'}</span>
        <h2 className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] lg:text-[15px]">
          {T.chiSono.skills}
        </h2>
      </div>

      {/* Nessuno stacco fra le card: la corsa di scroll di ognuna è la propria altezza. */}
      <div ref={pila}>
        {competenze.map((c, i) => (
          <article
            key={c.chiave}
            style={{
              top: `calc(${BARRA} + ${i} * ${SCALINO})`,
              /* Chi viene dopo passa sopra: senza, l'ordine lo deciderebbe il
                 DOM e la pila si rovescerebbe. */
              zIndex: i + 1,
            }}
            className="sticky flex h-[calc(var(--schermo,100svh)*0.72)] origin-top flex-col overflow-hidden border-2 border-ink bg-paper [will-change:transform] sm:h-[calc(var(--schermo,100svh)*0.64)] sm:flex-row lg:h-[calc(var(--schermo,100svh)*0.62)]"
          >
            <div className="flex shrink-0 flex-col justify-center px-6 py-7 sm:w-1/2 sm:px-8 sm:py-9 lg:px-12 lg:py-14">
              <h3 className="m-0 text-[clamp(24px,3.4vw,44px)] font-bold uppercase leading-[0.95] tracking-[-0.02em]">
                {c.titolo}
              </h3>
              <p className="m-0 mt-3 max-w-[40ch] text-[clamp(14px,1.4vw,18px)] leading-[1.5] lg:mt-5">
                {c.testo}
              </p>
              {c.strumenti.length > 0 && (
                <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0 lg:mt-8">
                  {c.strumenti.map((s) => (
                    <li
                      key={s}
                      className="border border-line px-3 py-1 text-[13px] tracking-[0.02em] lg:px-4 lg:py-1.5 lg:text-[15px]"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="min-h-0 flex-1 border-t border-line bg-placeholder sm:border-l sm:border-t-0">
              {c.foto && (
                <img
                  src={c.foto.src}
                  srcSet={srcSetDi(c.foto.src)}
                  sizes={MISURE.competenze}
                  alt={c.foto.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </article>
        ))}

        {/* Va tenuto ultimo: `aggiorna` lo sconta dalla corsa. */}
        <div aria-hidden="true" style={{ height: CODA }} />
      </div>
    </section>
  )
}
