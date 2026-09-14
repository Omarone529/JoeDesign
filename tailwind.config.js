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
        // 4.76:1 su `paper` (AA). ⚠️ Non su `bg-night`: lì si usa `night-soft`.
        muted: '#6f6b67', // grigio testo secondario (su carta)
        line: '#d7d4cf', // bordi chiari
        'line-soft': '#e4e1dd', // bordi molto chiari
        placeholder: '#e9e7e3', // sfondo immagini
        hover: '#ececE8', // hover celle
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
        letterIn: 'letterIn .9s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // `hover-fine:` = dispositivo con puntatore capace di hover; al tocco serve uno stato sempre visibile.
    plugin(({ addVariant }) => {
      addVariant('hover-fine', '@media (any-hover: hover)')
    }),
  ],
}
