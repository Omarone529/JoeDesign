import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette "Direzione A" — carta / inchiostro
        paper: '#f4f3f1', // sfondo principale
        ink: '#14110f', // testo / nero caldo
        /*
         * Grigio del testo secondario. Il valore sta sotto il nero quanto basta
         * a restare "in tono minore" e non un grado di più: su `paper` fa
         * 4.76:1, oltre il 4.5 che la WCAG AA chiede per il testo sotto i 18pt.
         * È la misura che conta qui, perché `muted` finisce quasi sempre su
         * corpi da 10 a 13 pixel — occhielli, categorie, anni, contatori.
         *
         * ⚠️ Vale solo su fondo chiaro. Sul `night` del footer un grigio così
         * scuro scende a 3.77:1: là il testo secondario è `night-soft`, che è
         * lo stesso ruolo rovesciato. Non usare `text-muted` dentro `bg-night`.
         */
        muted: '#6f6b67', // grigio testo secondario (su carta)
        line: '#d7d4cf', // bordi chiari
        'line-soft': '#e4e1dd', // bordi molto chiari
        placeholder: '#e9e7e3', // sfondo immagini
        hover: '#ececE8', // hover celle
        dot: '#c8c4bf', // separatori ticker
        night: '#0a0908', // sfondo footer
        'night-soft': '#c8c4bf', // testo footer secondario
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      keyframes: {
        viewIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Ticker: il nastro contiene due copie dell'elenco, quindi -50% = una
        // copia esatta e il salto a fine ciclo non si vede.
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        // Ingresso delle lettere del nome in home. Lo scostamento è in em, così
        // resta proporzionato a qualunque corpo assuma il titolo.
        letterIn: {
          from: { opacity: '0', transform: 'translateY(.26em)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Respiro della freccia in fondo alla hero.
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      animation: {
        viewIn: 'viewIn .5s cubic-bezier(.2,.7,.2,1) both',
        marquee: 'marquee 38s linear infinite',
        letterIn: 'letterIn .9s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // `hover-fine:` = c'è almeno un dispositivo capace di sostare su un
    // elemento (mouse, trackpad, anche sui portatili con schermo touch).
    // Sul telefono il :hover non esiste — o peggio resta appiccicato dopo il
    // tap — quindi gli effetti "al passaggio" valgono solo qui, e lì vengono
    // sostituiti da uno stato sempre visibile.
    plugin(({ addVariant }) => {
      addVariant('hover-fine', '@media (any-hover: hover)')
    }),
  ],
}
