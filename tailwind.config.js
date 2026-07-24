/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette "Direzione A" — carta / inchiostro
        paper: '#f4f3f1', // sfondo principale
        accent: '#e5341f', // rosso di accento (barra "Chi sono", come nel portfolio)
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
      },
      animation: {
        viewIn: 'viewIn .5s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
}
