import { about } from '../../data/siteData'

/*
 * Ticker "Skills" a scorrimento continuo (fonte: about.skills). Due copie
 * identiche che traslano del 50%: al riavvio la seconda è dov'era la prima,
 * il giro è impercettibile; la seconda è aria-hidden (niente doppio annuncio).
 * Non si ferma mai, nemmeno con "riduci animazioni" (su Windows spesso spenta,
 * bloccava il nastro). `will-change` manda la transform sul compositore.
 */
export default function SkillsTicker() {
  return (
    <section className="overflow-hidden border-b border-t-2 border-b-line border-t-ink py-7 sm:py-10 lg:py-12">
      <div className="mb-[22px] px-5 text-[10px] uppercase tracking-[0.24em] text-muted sm:px-8 lg:px-[72px]">
        Skills
      </div>
      <div className="flex w-max animate-marquee [will-change:transform]">
        <SkillList />
        <SkillList aria-hidden />
      </div>
    </section>
  )
}

/* Una copia dell'elenco. Il punto chiude anche l'ultima voce: nel nastro
   continuo non esiste una "fine", ogni voce ha sempre un seguito. */
function SkillList({ 'aria-hidden': ariaHidden }) {
  return (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="m-0 flex shrink-0 list-none gap-x-3.5 p-0 pl-3.5"
    >
      {about.skills.map((skill) => (
        <li
          key={skill}
          className="whitespace-nowrap text-[clamp(16px,2.4vw,30px)] font-bold uppercase tracking-[-0.01em]"
        >
          {skill}
          <span className="text-dot" aria-hidden="true">
            &nbsp;·
          </span>
        </li>
      ))}
    </ul>
  )
}
