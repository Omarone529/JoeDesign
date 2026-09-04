import { useState } from 'react'
import { about } from '../../data/siteData'
import { testi } from '../../i18n'
import { useLang } from '../../router'

/*
 * Nastro continuo: due copie identiche che traslano del 50%, così al riavvio la
 * seconda è dov'era la prima e il giro non si vede.
 *
 * Non si ferma con "riduci animazioni" — su Windows è spesso attiva a insaputa
 * dell'utente e bloccava il nastro per tutti — ma un movimento che parte da
 * solo e dura più di cinque secondi deve poterlo fermare chiunque (WCAG 2.2.2,
 * livello A), e finché il comando non c'era il nastro era semplicemente fuori
 * norma. Ora si ferma in due modi: sostandoci sopra col puntatore, che è il
 * gesto che viene naturale a chi vuole leggere una voce; e con il tasto in
 * riga con l'occhiello, che è quello che vale da tastiera e per chi il
 * puntatore non ce l'ha. Il tasto è l'unico dei due che conta per la norma.
 */
export default function SkillsTicker() {
  const T = testi(useLang())
  // Falso alla prima resa come nell'HTML pre-renderizzato: nessun disallineamento.
  const [fermo, setFermo] = useState(false)

  return (
    <section className="overflow-hidden border-b border-t-2 border-b-line border-t-ink py-7 sm:py-10 lg:py-12">
      {/* Occhiello a sinistra, comando a destra: è la riga d'intestazione che
          l'archivio usa già per conteggio e periodo. */}
      <div className="mb-[22px] flex items-baseline justify-between gap-4 px-5 text-[10px] uppercase tracking-[0.24em] text-muted sm:px-8 lg:px-[72px]">
        <span>{T.home.skills}</span>
        {/* Il testo dice già cosa fa, quindi niente aria-label: `aria-pressed`
            aggiunge lo stato. Il `before` allarga il bersaglio senza spostare
            la riga, come su ogni altro comando piccolo del sito. */}
        <button
          type="button"
          onClick={() => setFermo((f) => !f)}
          aria-pressed={fermo}
          className="relative whitespace-nowrap transition-colors before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] hover:text-ink"
        >
          {fermo ? T.home.riprendiNastro : T.home.fermaNastro}
        </button>
      </div>
      {/* `hover:` sul nastro e non sulla sezione: la sezione è alta e larga
          quanto la pagina, e il nastro si fermerebbe passando lì vicino. */}
      <div
        className={`flex w-max animate-marquee [will-change:transform] hover:[animation-play-state:paused] ${
          fermo ? '[animation-play-state:paused]' : ''
        }`}
      >
        <SkillList />
        <SkillList aria-hidden />
      </div>
    </section>
  )
}

/* Il punto chiude anche l'ultima voce: nel nastro non esiste una fine. */
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
