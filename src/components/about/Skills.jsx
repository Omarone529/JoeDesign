import { useEffect, useRef } from 'react'

import { aboutIn } from '../../data/siteData'
import { texts } from '../../i18n'
import { useLang } from '../../router'
import { srcSetDi, SIZES } from '../../images'

// ⚠️ Niente `window` nel render: le card escono dall'HTML statico a scala 1.

// Riduzione per ogni card sopra; l'ultima arriva all'88%, quella in cima non si tocca.
const STEP = 0.04

// La navbar torna scorrendo in su: le card si fermano sotto di lei.
const BAR = '4rem'

// La striscia di ogni card sotto che resta in vista. Legata allo schermo e non fissa: la
// pila è profonda tre scalini e sui telefoni bassi sfonderebbe il bordo. Il conto è un
// quarto di quel che avanza attorno alla card più alta (0.72 di schermo) tolta la navbar.
const STEP_OFFSET = 'min(3rem, (0.28 * var(--screen-height,100svh) - 4rem) / 4)'

// Sosta finale. Elemento vero e non padding: lo sticky si ferma al content box del padre.
const TAIL = 'calc(var(--screen-height,100svh)*0.5)'

// Ogni card sta sola in una schermata: la successiva sale da sotto e la copre.
// Il `pb` della cornice pareggia lo scarto della navbar, così la card resta centrata.
//
// Le cornici si sganciano tutte sul fondo del contenitore, ma ognuna si aggancia uno scalino
// più in basso: scalando anche l'altezza, `top + altezza` torna uguale per tutte e la pila
// riparte in blocco, con le quattro card ancora sfalsate. Ad altezze uguali l'ultima
// scorrerebbe ancora tre scalini e si mangerebbe le strisce di quelle sotto.
const FRAME = (i) => `calc(var(--screen-height,100svh) - ${i} * ${STEP_OFFSET})`

export default function Skills() {
  const lang = useLang()
  const T = texts(lang)
  const { skillCards } = aboutIn(lang)
  const stack = useRef(null)

  useEffect(() => {
    const stackEl = stack.current
    if (!stackEl) return

    const frames = Array.from(stackEl.querySelectorAll(':scope > [data-card]'))
    let queued = false

    const update = () => {
      queued = false
      // Quanto ogni card è salita sulla precedente: 0 una schermata sotto, 1 ferma in cima.
      const arrival = frames.map((el) => {
        const box = el.getBoundingClientRect()
        const stop = parseFloat(getComputedStyle(el).top) || 0
        return Math.min(Math.max(1 - (box.top - stop) / box.height, 0), 1)
      })

      frames.forEach((el, i) => {
        let covered = 0
        for (let j = i + 1; j < frames.length; j += 1) covered += arrival[j]
        const scale = 1 - covered * STEP
        el.firstElementChild.style.transform = scale === 1 ? '' : `scale(${scale.toFixed(4)})`
      })
    }

    const handleScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [skillCards])

  return (
    <section className="px-5 pb-16 pt-14 sm:px-8 lg:px-[72px] lg:pb-24 lg:pt-20">
      {/* U+FE0E forza la freccia testuale: su iOS uscirebbe come emoji a colori. */}
      <div className="mb-8 flex items-center gap-2 lg:mb-12">
        <span aria-hidden className="text-[15px] leading-none lg:text-[17px]">{'↘︎'}</span>
        <h2 className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] lg:text-[15px]">
          {T.about.skills}
        </h2>
      </div>

      <div ref={stack}>
        {skillCards.map((c, i) => (
          <div
            key={c.key}
            data-card
            style={{
              top: `calc(${BAR} + ${i} * ${STEP_OFFSET})`,
              height: FRAME(i),
              /* Chi viene dopo passa sopra, o la pila si rovescia. */
              zIndex: i + 1,
            }}
            className="sticky flex items-center pb-16"
          >
            <article className="flex h-[calc(var(--screen-height,100svh)*0.72)] w-full origin-top flex-col overflow-hidden border-2 border-ink bg-paper [will-change:transform] sm:h-[calc(var(--screen-height,100svh)*0.64)] sm:flex-row lg:h-[calc(var(--screen-height,100svh)*0.62)]">
              <div className="flex shrink-0 flex-col justify-center px-6 py-7 sm:w-1/2 sm:px-8 sm:py-9 lg:px-12 lg:py-14">
                <h3 className="m-0 text-[clamp(24px,3.4vw,44px)] font-bold uppercase leading-[0.95] tracking-[-0.02em]">
                  {c.title}
                </h3>
                <p className="m-0 mt-3 max-w-[40ch] text-[clamp(14px,1.4vw,18px)] leading-[1.5] lg:mt-5">
                  {c.text}
                </p>
                {c.tools.length > 0 && (
                  <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0 lg:mt-8">
                    {c.tools.map((s) => (
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
                {c.photos && (
                  <img
                    src={c.photos.src}
                    srcSet={srcSetDi(c.photos.src)}
                    sizes={SIZES.skillCards}
                    alt={c.photos.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </article>
          </div>
        ))}

        {/* Sosta dell'ultima card: senza, la pila se ne va appena arrivata. */}
        <div aria-hidden="true" style={{ height: TAIL }} />
      </div>
    </section>
  )
}
