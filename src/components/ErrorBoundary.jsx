import { Component } from 'react'
import { Link } from '../router'

/*
 * Le pagine sono pre-renderizzate, quindi l'HTML arriva già leggibile: se un
 * componente lancia durante l'hydration React scarta quel markup buono e
 * lascia la pagina bianca. Il boundary mostra un'uscita invece del vuoto.
 * Avvolge solo la pagina — Navbar e Footer restano navigabili.
 */
export default class ErrorBoundary extends Component {
  state = { errore: false }

  static getDerivedStateFromError() {
    return { errore: true }
  }

  componentDidCatch(errore, info) {
    // Nessun servizio di raccolta errori: resta in console.
    console.error('Errore in pagina:', errore, info?.componentStack)
  }

  // Senza reset, una pagina andata in errore lascerebbe il boundary sporco e
  // ogni navigazione successiva mostrerebbe il messaggio al posto della pagina.
  componentDidUpdate(propsPrec) {
    if (this.state.errore && propsPrec.rotta !== this.props.rotta) {
      this.setState({ errore: false })
    }
  }

  render() {
    if (!this.state.errore) return this.props.children

    return (
      <main className="animate-viewIn">
        <section className="px-5 pb-10 pt-12 sm:px-8 sm:pb-16 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Errore</div>

          <div className="mt-6 grid grid-cols-1 items-end gap-6 md:grid-cols-[1.35fr_.65fr] lg:mt-10 lg:gap-16">
            <h1 className="m-0 text-[clamp(40px,8vw,120px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
              Qualcosa
              <br />
              non ha funzionato
            </h1>
            <p className="m-0 max-w-[42ch] pb-2 text-[clamp(15px,1.4vw,19px)] leading-[1.5]">
              Questa pagina non è riuscita a caricarsi. Il resto del sito
              funziona: da qui si torna all'indice o all'archivio completo dei
              progetti.
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
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
              Tutti i progetti →
            </div>
            <div className="mt-2 text-[clamp(16px,2vw,26px)] font-bold uppercase tracking-[-0.01em]">
              Archivio
            </div>
          </Link>
        </section>
      </main>
    )
  }
}
