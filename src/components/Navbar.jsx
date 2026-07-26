import { useEffect, useState } from 'react'
import { scorrimento } from '../motion'
import { Link } from '../router'

const SOGLIA = 96 // px di scorrimento sotto i quali la barra resta comunque visibile
const MOVIMENTO_MINIMO = 6 // px di soglia contro micro-scostamenti e rimbalzo elastico

/*
 * Nasconde la barra scorrendo verso il basso, la ripristina scorrendo in su.
 *
 * Lo stato parte da "visibile" perché è quello che finisce nell'HTML statico:
 * un valore diverso creerebbe un disallineamento in idratazione. Gli eventi di
 * scroll sono passivi e accorpati in un requestAnimationFrame, così un render
 * al massimo per frame.
 */
function useNavbarNascosta(route) {
  const [nascosta, setNascosta] = useState(false)

  useEffect(() => {
    let ultimaY = window.scrollY
    let inCoda = false

    const aggiorna = () => {
      const y = window.scrollY
      const delta = y - ultimaY
      if (Math.abs(delta) > MOVIMENTO_MINIMO) {
        setNascosta(delta > 0 && y > SOGLIA)
        ultimaY = y
      }
      inCoda = false
    }

    const onScroll = () => {
      if (inCoda) return
      inCoda = true
      requestAnimationFrame(aggiorna)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Il router riporta in cima a ogni navigazione: la barra va riesposta.
  useEffect(() => setNascosta(false), [route])

  return [nascosta, setNascosta]
}

/*
 * Voce di navigazione. Il padding verticale sta sul link (area di tocco più
 * generosa del solo testo, che su mobile è di 9px), mentre la sottolineatura
 * è ancorata allo span interno: così resta attaccata alla parola invece di
 * scendere in fondo all'area cliccabile. È in assoluto e non occupa spazio nel
 * flusso: compare sulla pagina attiva e in hover, senza mai spostare il testo.
 */
function NavLink({ to, active = false, onClick, className = '', children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group whitespace-nowrap py-2 text-[9px] uppercase tracking-[0.06em] text-ink transition-colors sm:text-[10px] sm:tracking-[0.14em] md:tracking-[0.16em] lg:text-[11px] lg:tracking-[0.2em] ${className}`}
    >
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 -bottom-1 h-0.5 origin-left bg-ink transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] ${
            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
      </span>
    </Link>
  )
}

/*
 * Barra di navigazione condivisa. Sticky: resta nel flusso e occupa i suoi 4rem
 * anche da nascosta, misura su cui è tarata l'altezza della hero in About.
 * La voce attiva deriva dalla rotta corrente.
 */
export default function Navbar({ route }) {
  const name = route?.name ?? 'home'
  const [nascosta, setNascosta] = useNavbarNascosta(name)

  /*
   * "Contatti" non è una rotta: i recapiti stanno nel footer, presente su ogni
   * pagina, quindi la voce è un'ancora interna. Il salto è gestito a mano per
   * rispettare la preferenza sulle animazioni e per portare il focus nel
   * footer; l'href resta valido per il tasto centrale e il "copia indirizzo".
   */
  const vaiAiContatti = (e) => {
    const contatti = document.getElementById('contatti')
    if (!contatti) return // senza footer in pagina resta il salto nativo
    e.preventDefault()
    contatti.scrollIntoView({ behavior: scorrimento(), block: 'start' })
    contatti.focus({ preventScroll: true })
  }

  const links = [
    { label: 'Home', to: '/', active: name === 'home' },
    { label: 'Archivio', to: '/archivio', active: name === 'archive' || name === 'project' },
    { label: 'Chi sono', to: '/chi-sono', active: name === 'about' },
    // Sotto i 640px le quattro voci più il nome escono dalla barra e
    // spingerebbero la pagina in scorrimento orizzontale: lì la voce sparisce,
    // e i recapiti restano comunque in fondo alla pagina.
    { label: 'Contatti', to: '#contatti', onClick: vaiAiContatti, className: 'hidden sm:block' },
  ]

  return (
    <header
      onFocusCapture={() => setNascosta(false)}
      className={`sticky top-0 z-50 border-b border-ink bg-paper/90 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
        nascosta ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="relative flex h-16 items-center justify-between gap-2 px-5 sm:px-8 lg:px-[72px]">
        {/* Logo */}
        <Link to="/" aria-label="Joe Sarchiolla — home" className="flex shrink-0 items-center">
          <img
            src="/images/navbar/logo.webp"
            alt=""
            width="36"
            height="36"
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
        </Link>

        {/* Centrato sulla pagina solo da md: sotto, logo + nome + tre voci non
            entrano nella metà utile, quindi il nome resta in linea nel flusso
            (spinto dal justify-between) invece di finire sotto le voci. */}
        <span className="pointer-events-none shrink-0 whitespace-nowrap text-[11px] font-normal tracking-[0.04em] sm:text-[13px] sm:tracking-[0.06em] md:absolute md:left-1/2 md:-translate-x-1/2 lg:text-[15px] lg:tracking-[0.1em]">
          Joe Sarchiolla
        </span>

        {/* Navigazione */}
        <nav className="flex shrink-0 items-center gap-2 sm:gap-5 md:gap-6 lg:gap-10">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              active={l.active}
              onClick={l.onClick}
              className={l.className}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
