import { useEffect, useState } from 'react'
import { profile } from '../data/siteData'

/*
 * Pulsante flottante che duplica il contatto email del footer (stesso
 * `emailHref`): sempre visibile, sparisce solo quando il footer entra nello
 * schermo, dove il contatto è già in vista.
 */
export default function FloatingMailButton() {
  const [sopraFooter, setSopraFooter] = useState(true)

  useEffect(() => {
    const footer = document.getElementById('contatti')
    if (!footer) return
    const observer = new IntersectionObserver(([entry]) => setSopraFooter(!entry.isIntersecting))
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  const visibile = sopraFooter

  return (
    <a
      href={profile.emailHref}
      target="_blank"
      rel="noreferrer"
      aria-label={`Scrivi a ${profile.email}`}
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

/* Icona busta identica a quella del footer (stesso trattamento, stroke in currentColor). */
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
