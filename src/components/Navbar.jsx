import { profile } from '../data/siteData'

/*
 * Voce di navigazione. La sottolineatura è posizionata in assoluto
 * (non occupa spazio nel flusso): compare sulla pagina attiva e in hover,
 * senza mai spostare il testo. Animata da sinistra a destra.
 */
function NavLink({ href, active = false, muted = false, children }) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`group relative py-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
        muted ? 'text-muted hover:text-ink' : 'text-ink'
      }`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-left bg-ink transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </a>
  )
}

/*
 * Barra di navigazione condivisa.
 * Sticky con sfondo semi-trasparente e blur, bordo inferiore inchiostro.
 * La voce attiva è evidenziata in base alla rotta corrente.
 * "Studio" verrà collegata quando la pagina sarà pronta.
 */
export default function Navbar({ route }) {
  const name = route?.name ?? 'home'
  const links = [
    { label: 'Home', href: '#top', active: name === 'home' },
    { label: 'Archivio', href: '#archivio', active: name === 'archive' || name === 'project' },
    { label: 'Chi sono', href: '#', active: false },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-paper/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-[72px]">
        {/* Brand */}
        <a href="#top" className="flex items-baseline gap-3">
          <span className="text-[19px] font-bold tracking-[0.14em]">SARCHIOLLA</span>
          <span className="hidden text-[9px] tracking-[0.24em] text-muted sm:inline">
            STUDIO · IT
          </span>
        </a>

        {/* Navigazione */}
        <nav className="flex items-center gap-4 sm:gap-6 lg:gap-10">
          {links.map((l) => (
            <NavLink key={l.label} href={l.href} active={l.active}>
              {l.label}
            </NavLink>
          ))}
          <NavLink href={`mailto:${profile.email}`} muted>
            Contatti
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
