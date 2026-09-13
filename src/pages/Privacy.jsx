import { profiloIn } from '../data/siteData'
import { impostaConsensoVideo, useConsensoVideo, useMontato } from '../consenso'
import { testi } from '../i18n'
import { useLang } from '../router'

// Impaginazione dell'informativa (testo in i18n.js): titolo a sinistra, corpo a destra.
export default function Privacy() {
  const lang = useLang()
  const T = testi(lang)
  const profile = profiloIn(lang)
  const consenso = useConsensoVideo()
  const montato = useMontato()

  return (
    <main className="animate-viewIn">
      <section className="px-5 pb-10 pt-12 sm:px-8 sm:pb-16 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
          {T.privacy.occhiello}
        </div>

        <div className="mt-6 grid grid-cols-1 items-end gap-6 md:grid-cols-[1.35fr_.65fr] lg:mt-10 lg:gap-16">
          <h1 className="m-0 text-[clamp(40px,8vw,120px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
            {T.privacy.titolo[0]}
            <br />
            {T.privacy.titolo[1]}
          </h1>
          <p className="m-0 max-w-[42ch] pb-2 text-[clamp(15px,1.4vw,19px)] leading-[1.5]">
            {T.privacy.intro}
          </p>
        </div>
      </section>

      <section className="border-t-2 border-ink px-5 sm:px-8 lg:px-[72px]">
        {T.privacy.sezioni.map((s) => (
          <article
            key={s.titolo}
            className="grid grid-cols-1 gap-x-10 gap-y-3 border-b border-line py-8 md:grid-cols-[minmax(0,.28fr)_minmax(0,.72fr)] lg:gap-x-16 lg:py-12"
          >
            <h2 className="m-0 text-[11px] uppercase tracking-[0.24em] text-muted">{s.titolo}</h2>
            <div className="max-w-[68ch] space-y-4 text-[15px] leading-[1.6] lg:text-[16px]">
              {s.corpo.map((p) => (
                <p key={p.slice(0, 40)} className="m-0">
                  {p}
                </p>
              ))}
              {/* Il consenso ai video si ritira qui, e lo stato attuale è sempre mostrato. */}
              {s.scelta && montato && (
                <div className="flex flex-col items-start gap-4 pt-1">
                  <div className="text-[13px] text-muted">
                    {consenso === 'si'
                      ? T.privacy.scelta.attivi
                      : consenso === 'no'
                        ? T.privacy.scelta.spenti
                        : T.privacy.scelta.nonScelto}
                  </div>
                  <button
                    type="button"
                    onClick={() => impostaConsensoVideo(consenso === 'si' ? 'no' : 'si')}
                    className="border border-ink px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-paper"
                  >
                    {consenso === 'si' ? T.privacy.scelta.spegni : T.privacy.scelta.attiva}
                  </button>
                </div>
              )}

              {/* Stesso indirizzo del footer: si scrive in un posto solo. */}
              {s.contatto && (
                <a
                  href={profile.emailHref}
                  target="_blank"
                  rel="noreferrer"
                  className="block break-all font-bold hover:underline"
                >
                  {profile.email}
                </a>
              )}
            </div>
          </article>
        ))}

        <p className="m-0 py-8 text-[10px] uppercase tracking-[0.2em] text-muted lg:py-12">
          {T.privacy.aggiornato}
        </p>
      </section>
    </main>
  )
}
