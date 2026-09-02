import { useEffect, useState } from 'react'
import { profile } from '../data/siteData'
import { testi } from '../i18n'
import { useLang } from '../router'
import { useBannerAperto } from '../consenso'

/* Duplica il contatto del footer; sparisce quando il footer entra in schermo. */
export default function FloatingMailButton() {
  const T = testi(useLang())
  const [sopraFooter, setSopraFooter] = useState(true)
  // Il banner è una fascia alta un terzo di schermo, e questo tasto le finirebbe
  // sotto: chi lo cercasse col dito premerebbe "Accetta". Sparisce finché c'è.
  const bannerAperto = useBannerAperto()

  useEffect(() => {
    const footer = document.getElementById('contatti')
    if (!footer) return
    const observer = new IntersectionObserver(([entry]) => setSopraFooter(!entry.isIntersecting))
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  const visibile = sopraFooter && !bannerAperto

  return (
    <a
      href={profile.emailHref}
      target="_blank"
      rel="noreferrer"
      aria-label={T.footer.scriviA(profile.email)}
      aria-hidden={!visibile}
      tabIndex={visibile ? 0 : -1}
      className={`fixed bottom-6 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-lg transition-all duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:bg-night sm:right-8 lg:right-[72px] ${
        visibile ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <LogoGmail className="h-5 w-5" />
    </a>
  )
}

function LogoGmail({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="2.5" />
      <path d="M3.5 6.75l8.5 6.5 8.5-6.5" />
    </svg>
  )
}
