import { setVideoConsent, useBannerOpen } from '../consent'
import { texts } from '../i18n'
import { Link, pathFor, useLang } from '../router'

/*
 * Banner cookie e privacy, su tutte le pagine finché non si risponde. Il sito non usa cookie:
 * il consenso serve solo al reel di YouTube. I due tasti restano identici: un consenso
 * spinto verso "Accetta" non è libero. Nessuna chiusura senza scegliere.
 */
export default function PrivacyBanner() {
  const lang = useLang()
  const T = texts(lang).banner
  const open = useBannerOpen()

  if (!open) return null

  return (
    <div
      role="region"
      aria-label={T.aria}
      className="fixed inset-x-0 bottom-0 z-50 animate-viewIn border-t border-ink bg-paper shadow-[0_-1px_32px_rgba(20,17,15,.07)]"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-12 md:py-6 lg:px-[72px]">
        <div className="max-w-[76ch]">
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">{T.eyebrow}</div>

          <p className="m-0 mt-3 text-[clamp(14px,1.15vw,16px)] leading-[1.45]">{T.text}</p>
          <p className="m-0 mt-2 text-[13px] leading-[1.5] text-ink/70">
            {T.detail}{' '}
            <Link
              to={pathFor('privacy', {}, lang)}
              className="relative whitespace-nowrap underline underline-offset-2 transition-colors before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] hover:text-ink"
            >
              {T.policy}
            </Link>
          </p>
        </div>

        {/* Stessa larghezza minima: i due tasti devono pesare uguale. */}
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setVideoConsent('no')}
            className="min-w-[8rem] flex-1 border border-ink px-5 py-3 text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-hover md:flex-none"
          >
            {T.decline}
          </button>
          <button
            type="button"
            onClick={() => setVideoConsent('yes')}
            className="min-w-[8rem] flex-1 border border-ink px-5 py-3 text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-hover md:flex-none"
          >
            {T.enable}
          </button>
        </div>
      </div>
    </div>
  )
}
