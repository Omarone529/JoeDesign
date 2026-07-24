import { profile } from '../data/siteData'

/* Footer condiviso su sfondo notte. */
export default function Footer() {
  return (
    <footer className="bg-night px-5 py-12 text-paper sm:px-8 sm:py-16 lg:px-[72px] lg:py-24">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1.4fr_.6fr]">
        {/* Contatti */}
        <div>
          <div className="mb-5 text-[10px] uppercase tracking-[0.24em] text-muted">
            Contatti
          </div>
          <a
            href={`mailto:${profile.email}`}
            className="text-[clamp(24px,4vw,56px)] font-bold tracking-[-0.01em] hover:underline"
          >
            {profile.email}
          </a>
          <div className="mt-6 flex flex-wrap gap-7">
            <a
              href={profile.phoneHref}
              className="text-[13px] tracking-[0.1em] text-night-soft transition-colors hover:text-white"
            >
              {profile.phone}
            </a>
            <a
              href={profile.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] tracking-[0.1em] text-night-soft transition-colors hover:text-white"
            >
              @{profile.handle}
            </a>
          </div>
        </div>

        {/* Marchio */}
        <div className="md:text-right">
          <div className="text-[19px] font-bold tracking-[0.14em]">SARCHIOLLA</div>
          <div className="mt-2 text-[10px] tracking-[0.2em] text-muted">
            Product Design · Reggio Emilia, IT
          </div>
          <div className="mt-6 text-[10px] tracking-[0.2em] text-muted">
            © 2026 · Design by Joe Sarchiolla
          </div>
        </div>
      </div>
    </footer>
  )
}
