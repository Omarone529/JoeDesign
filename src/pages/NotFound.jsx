import { testi } from '../i18n'
import { Link, percorso, useLang } from '../router'

/*
 * Serve sia alla navigazione client-side sia a dist/404.html, che Netlify
 * restituisce con lo status 404 vero.
 */
export default function NotFound() {
  const lang = useLang()
  const T = testi(lang)

  return (
    <main className="animate-viewIn">
      <section className="px-5 pb-10 pt-12 sm:px-8 sm:pb-16 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
          {T.servizio.errore404}
        </div>

        <div className="mt-6 grid grid-cols-1 items-end gap-6 md:grid-cols-[1.35fr_.65fr] lg:mt-10 lg:gap-16">
          <h1 className="m-0 text-[clamp(40px,8vw,120px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
            {T.servizio.titolo404[0]}
            <br />
            {T.servizio.titolo404[1]}
          </h1>
          <p className="m-0 max-w-[42ch] pb-2 text-[clamp(15px,1.4vw,19px)] leading-[1.5]">
            {T.servizio.testo404}
          </p>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 border-t border-line sm:mt-8">
        <Link
          to={percorso('home', {}, lang)}
          className="border-r border-line px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.servizio.indice}
          </div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            {T.servizio.home}
          </div>
        </Link>
        <Link
          to={percorso('archive', {}, lang)}
          className="px-5 py-10 text-right transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {T.servizio.tuttiProgetti}
          </div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            {T.servizio.archivio}
          </div>
        </Link>
      </section>
    </main>
  )
}
