import { profile } from '../../data/siteData'

/*
 * Striscia di metadati sotto al masthead.
 * 4 celle: Ruolo · Sede · Formazione · Instagram.
 * Mobile-first: 2 colonne su mobile, 4 da md in su.
 */
function Cell({ label, children, className = '' }) {
  return (
    <div className={`px-5 py-[22px] sm:px-7 lg:px-[72px] ${className}`}>
      <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted">{label}</div>
      <div className="text-[15px]">{children}</div>
    </div>
  )
}

export default function MetaStrip() {
  return (
    <>
      {/* linea spessa di separazione */}
      <div className="h-0.5 bg-ink" />
      <section className="grid grid-cols-2 border-b border-line md:grid-cols-4">
        <Cell label="Ruolo" className="border-b border-r border-line md:border-b-0">
          {profile.role}
        </Cell>
        <Cell label="Sede" className="border-b border-line md:border-b-0 md:border-r">
          {profile.place}
        </Cell>
        <Cell label="Formazione" className="border-r border-line">
          {profile.formazione}
        </Cell>
        <Cell label="Instagram">
          <a
            href={profile.instagram}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            @{profile.handle}
          </a>
        </Cell>
      </section>
    </>
  )
}
