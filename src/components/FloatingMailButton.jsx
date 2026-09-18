import { useEffect, useState } from 'react'
import { profile } from '../data/siteData'
import { texts } from '../i18n'
import { useLang } from '../router'
import { useBannerOpen } from '../consent'

/* Duplica il contatto del footer; sparisce quando il footer entra in schermo. */
export default function FloatingMailButton() {
  const T = texts(useLang())
  const [aboveFooter, setAboveFooter] = useState(true)
  // Sotto il banner questo tasto è irraggiungibile: chi lo cercasse col dito
  // premerebbe "Accetta". Sparisce finché la fascia è in pagina.
  const bannerOpen = useBannerOpen()

  useEffect(() => {
    const footer = document.getElementById('contact')
    if (!footer) return
    const observer = new IntersectionObserver(([entry]) => setAboveFooter(!entry.isIntersecting))
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  const visible = aboveFooter && !bannerOpen

  return (
    <a
      href={profile.emailHref}
      target="_blank"
      rel="noreferrer"
      aria-label={T.footer.writeTo(profile.email)}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-lg transition-all duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:bg-night sm:right-8 lg:right-[72px] ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
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
