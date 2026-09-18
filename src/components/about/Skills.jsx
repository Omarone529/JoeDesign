import { useEffect, useRef } from 'react'

import { aboutIn } from '../../data/siteData'
import { texts } from '../../i18n'
import { useLang } from '../../router'
import { srcSetDi, SIZES } from '../../images'
import { screenHeight } from '../../screenHeight'

// ⚠️ Niente `window` nel render: le card escono dall'HTML statico a scala 1.

// Riduzione per ogni card sopra; l'ultima arriva all'88%, quella in cima non si tocca.
const STEP = 0.04

// La navbar torna scorrendo in su: le card si fermano sotto di lei.
const BAR = '4rem'

// La striscia di ogni card sotto che resta in vista.
const STEP_OFFSET = '0.85rem'

// Sosta finale. Elemento vero e non padding: lo sticky si ferma al content box del padre.
const TAIL = 'calc(var(--screen-height,100svh)*0.5)'

export default function Skills() {
  const lang = useLang()
  const T = texts(lang)
  const { skillCards } = aboutIn(lang)
  const stack = useRef(null)

  useEffect(() => {
    const stackEl = stack.current
    if (!stackEl) return

    const cards = Array.from(stackEl.querySelectorAll(':scope > article'))
    let queued = false

    const update = () => {
      queued = false
      const frame = stackEl.getBoundingClientRect()
      // `screenHeight()` e non innerHeight: con le barre che si ritirano la scala saltava.
      // La coda è sosta, non corsa: contandola, la pila si comprimerebbe da ferma.
      const tail = stackEl.lastElementChild?.getBoundingClientRect().height || 0
      const travel = frame.height - tail - screenHeight()
      if (travel <= 0) {
        cards.forEach((paper) => {
          paper.style.transform = ''
        })
        return
      }

      const advance = Math.min(Math.max(-frame.top / travel, 0), 1)
      cards.forEach((paper, i) => {
        const start = i / cards.length
        const share = advance <= start ? 0 : (advance - start) / (1 - start)
        const scale = 1 - share * (cards.length - 1 - i) * STEP
        paper.style.transform = scale === 1 ? '' : `scale(${scale.toFixed(4)})`
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
          <article
            key={c.key}
            style={{
              top: `calc(${BAR} + ${i} * ${STEP_OFFSET})`,
              /* Chi viene dopo passa sopra, o la pila si rovescia. */
              zIndex: i + 1,
            }}
            className="sticky flex h-[calc(var(--screen-height,100svh)*0.72)] origin-top flex-col overflow-hidden border-2 border-ink bg-paper [will-change:transform] sm:h-[calc(var(--screen-height,100svh)*0.64)] sm:flex-row lg:h-[calc(var(--screen-height,100svh)*0.62)]"
          >
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
        ))}

        {/* Va tenuto ultimo: `update` lo sconta dalla corsa. */}
        <div aria-hidden="true" style={{ height: TAIL }} />
      </div>
    </section>
  )
}
