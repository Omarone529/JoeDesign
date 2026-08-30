import {
  altCopertina,
  archive,
  aree,
  areaPerSlug,
  contaProgetti,
  periodoArchivio,
  periodoDi,
  progettiArea,
  projectImages,
} from '../data/siteData'
import { fotoFit } from '../data/fotoFit'
import { Link } from '../router'

/* "2024 · 2026", o il solo anno quando l'area ne copre uno. */
function testoPeriodo(periodo) {
  if (!periodo) return ''
  return periodo.primo === periodo.ultimo
    ? `${periodo.primo}`
    : `${periodo.primo} · ${periodo.ultimo}`
}

/* La riga sottile sopra la griglia: quanti progetti e in che anni. */
function Intestazione({ sinistra, destra }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4 border-t border-line pt-5 sm:mb-8">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted">{sinistra}</span>
      {destra && (
        <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-muted">
          {destra}
        </span>
      )}
    </div>
  )
}

/*
 * La forma delle celle della griglia. Le copertine di prodotto sono quadrate o
 * quasi; quelle grafiche sono manifesti verticali (7:10), e in una cella
 * quadrata restavano una striscia stretta fra due fasce vuote. Il bivio invece
 * tiene le due celle quadrate, perché le due carte devono restare uguali: lì
 * il manifesto sta al centro e il colore del suo bordo (`fondo` in `fotoFit`)
 * copre lo spazio che avanza ai lati.
 */
function formaCella(area) {
  return area.chiave === 'graphic' ? 'aspect-[7/10]' : 'aspect-square'
}

function Titolo({ children }) {
  return (
    <section className="px-5 pb-8 pt-12 text-center sm:px-8 sm:pb-12 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
      <h1 className="m-0 text-[clamp(48px,10.5vw,168px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
        {children}
      </h1>
    </section>
  )
}

/*
 * Il bivio: /archivio non mostra più tutto insieme, ma le due aree. La cella
 * porta la copertina del progetto più recente dell'area — la stessa immagine
 * che si ritrova in prima riga entrando, così la scelta è già un'anteprima.
 */
function Bivio() {
  return (
    <main className="animate-viewIn">
      <Titolo>Archivio</Titolo>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-[72px] lg:pb-28">
        <Intestazione
          sinistra={`${aree.length} aree · ${contaProgetti(archive.length)}`}
          destra={testoPeriodo(periodoArchivio)}
        />

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-6 lg:gap-8">
          {aree.map((area, i) => {
            const progetti = progettiArea(area.chiave)
            // Il più recente FRA QUELLI con la copertina: una scheda in attesa
            // di foto non può fare da vetrina all'area.
            const primo = progetti.find((x) => projectImages(x).cover) ?? progetti[0]
            const { cover } = projectImages(primo)
            const fit = fotoFit[cover]
            return (
              <Link key={area.slug} to={`/archivio/${area.slug}`} className="group block">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="m-0 text-[clamp(26px,4.2vw,52px)] font-bold uppercase leading-[0.95] tracking-[-0.02em]">
                    {area.label}
                  </h2>
                  <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-muted">
                    {contaProgetti(progetti.length)}
                  </span>
                </div>

                <p className="mt-3 max-w-[44ch] text-[14px] leading-[1.5] text-muted">
                  {area.desc}
                </p>

                <div
                  className="relative mt-5 aspect-square overflow-hidden bg-placeholder"
                  style={fit?.fondo ? { backgroundColor: fit.fondo } : undefined}
                >
                  <img
                    src={cover}
                    alt={altCopertina(primo)}
                    fetchpriority={i === 0 ? 'high' : undefined}
                    decoding="async"
                    style={fit?.pos ? { objectPosition: fit.pos } : undefined}
                    className={`h-full w-full contrast-[1.02] transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.03] ${
                      fit?.fit === 'contain' ? 'object-contain' : 'object-cover'
                    }`}
                  />
                </div>

                <div className="mt-3 flex items-baseline justify-between gap-4 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors group-hover:text-ink">
                  <span>Apri l’area →</span>
                  <span className="whitespace-nowrap">{testoPeriodo(periodoDi(progetti))}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}

/* La griglia di sempre, ristretta a un'area. */
function GrigliaArea({ area }) {
  const progetti = progettiArea(area.chiave)
  const altra = aree.find((a) => a.slug !== area.slug)
  const cella = formaCella(area)

  return (
    <main className="animate-viewIn">
      <section className="px-5 pb-8 pt-12 text-center sm:px-8 sm:pb-12 sm:pt-20 lg:px-[72px] lg:pt-[120px]">
        <Link
          to="/archivio"
          className="text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
        >
          ← Archivio
        </Link>
        <h1 className="m-0 mt-5 text-[clamp(40px,8.4vw,132px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
          {area.label}
        </h1>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-[72px] lg:pb-28">
        <Intestazione
          sinistra={contaProgetti(progetti.length)}
          destra={testoPeriodo(periodoDi(progetti))}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {progetti.map((p, i) => {
            const { cover } = projectImages(p)
            // I manifesti sono verticali e il ritaglio quadrato gli mozzerebbe il
            // testo: `fotoFit` dice quali vanno mostrati interi. Le copertine di
            // prodotto non hanno voce lì e riempiono la cella come sempre.
            const fit = fotoFit[cover]
            // Prime due righe (8 celle): in viewport all'apertura, richieste subito.
            const subito = i < 8
            return (
              <Link
                key={p.slug}
                to={`/progetto/${p.slug}`}
                className="group relative block cursor-pointer transition-transform duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] will-change-transform hover:z-10 hover:scale-[1.045]"
              >
                <article>
                  <div
                    className={`relative ${cella} overflow-hidden bg-placeholder`}
                    style={fit?.fondo ? { backgroundColor: fit.fondo } : undefined}
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt={altCopertina(p)}
                        loading={subito ? 'eager' : 'lazy'}
                        fetchpriority={i < 4 ? 'high' : undefined}
                        decoding="async"
                        style={fit?.pos ? { objectPosition: fit.pos } : undefined}
                        className={`h-full w-full contrast-[1.02] ${
                          fit?.fit === 'contain' ? 'object-contain' : 'object-cover'
                        }`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-[10px] uppercase tracking-[0.24em] text-muted">
                          Foto in arrivo
                        </span>
                      </div>
                    )}
                    {p.tavola && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/35 group-hover:opacity-100">
                        <span className="text-[clamp(28px,5vw,52px)] font-bold uppercase leading-none tracking-[-0.02em] text-paper">
                          {String(p.tavola).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <div>
                      <div className="text-[clamp(15px,1.4vw,19px)] font-bold tracking-[0.01em]">
                        {p.title}
                      </div>
                      <div className="mt-[3px] text-[12px] text-muted">{p.cat}</div>
                    </div>
                    {p.year && (
                      <div className="whitespace-nowrap text-[11px] tracking-[0.12em] text-muted">
                        {p.year}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Passaggio diretto all'altra area: tornare indietro e riscegliere è un giro inutile. */}
      {altra && (
        <section className="border-t border-line">
          <Link
            to={`/archivio/${altra.slug}`}
            className="group block px-5 py-10 transition-colors hover:bg-hover sm:px-8 lg:px-[72px] lg:py-16"
          >
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted">
              L’altra area →
            </div>
            <div className="mt-2 text-[clamp(20px,3vw,40px)] font-bold uppercase tracking-[-0.02em]">
              {altra.label}
            </div>
          </Link>
        </section>
      )}
    </main>
  )
}

export default function Archive({ area }) {
  const scelta = area ? areaPerSlug(area) : null
  return scelta ? <GrigliaArea area={scelta} /> : <Bivio />
}
