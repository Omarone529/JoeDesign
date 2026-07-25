/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette "Direzione A" — carta / inchiostro
        paper: '#f4f3f1', // sfondo principale
        ink: '#14110f', // testo / nero caldo
        muted: '#8f8b86', // grigio testo secondario
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
      },
      animation: {
        viewIn: 'viewIn .5s cubic-bezier(.2,.7,.2,1) both',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
}
