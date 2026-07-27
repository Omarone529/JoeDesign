import { Link } from '../router'

/*
 * 404. Mostrata sia in navigazione client-side sia come dist/404.html, che
 * Netlify serve con lo status 404 vero. Testata a due colonne + celle di uscita.
 */
export default function NotFound() {
  return (
    <main className="animate-viewIn">
      <section className="px-5 pb-10 pt-12 sm:px-8 sm:pb-16 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Errore 404</div>

        <div className="mt-6 grid grid-cols-1 items-end gap-6 md:grid-cols-[1.35fr_.65fr] lg:mt-10 lg:gap-16">
          <h1 className="m-0 text-[clamp(40px,8vw,120px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
            Pagina
            <br />
            non trovata
          </h1>
          <p className="m-0 max-w-[42ch] pb-2 text-[clamp(15px,1.4vw,19px)] leading-[1.5]">
            L'indirizzo non corrisponde a nessuna pagina del sito: può essere
            stato spostato, oppure non è mai esistito. Da qui si torna
            all'indice o all'archivio completo dei progetti.
          </p>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 border-t border-line sm:mt-8">
        <Link
          to="/"
          className="border-r border-line px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">← Indice</div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            Home
          </div>
        </Link>
        <Link
          to="/archivio"
          className="px-5 py-10 text-right transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Tutti i progetti →</div>
          <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
            Archivio
          </div>
        </Link>
      </section>
    </main>
  )
}
