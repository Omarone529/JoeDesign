import { about } from '../../data/siteData'

/*
 * "Skills" - ticker a scorrimento continuo, stessi strumenti elencati in
 * "Chi sono" (fonte unica: about.skills).
 *
 * Il nastro contiene due copie identiche dell'elenco e trasla del 50%: quando
 * l'animazione riparte la seconda copia si trova esattamente dove stava la
 * prima, quindi il giro è impercettibile. La seconda copia è aria-hidden,
 * altrimenti i lettori di schermo annuncerebbero ogni voce due volte.
 *
 * Lo scorrimento non si interrompe mai: nessuna pausa all'hover e nessuna resa
 * statica con "riduci animazioni" di sistema (scelta esplicita: su Windows
 * quell'impostazione è spesso spenta per prestazioni e bloccava il nastro).
 * Velocità costante (linear); will-change manda la traslazione sul compositore,
 * così resta fluida anche mentre si scrolla la pagina.
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
