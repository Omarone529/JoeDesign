import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // `if (!visible)` nel JSX: Tailwind lo prenderebbe per una classe.
  blocklist: ['!visible', '!container'],
  theme: {
    extend: {
      colors: {
        paper: '#fafafa',
        ink: '#14110f',
        // 5.06:1 su `paper`. Su `night` si usa `night-soft`.
        muted: '#6f6b67',
        line: '#d7d4cf',
        'line-soft': '#e4e1dd',
        placeholder: '#e9e7e3',
        hover: '#ececE8',
        night: '#0a0908',
        'night-soft': '#c8c4bf',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      keyframes: {
        viewIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // In em: segue il corpo del titolo.
        letterIn: {
          from: { opacity: '0', transform: 'translateY(.26em)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Testata di "Chi sono". L'opacità finisce molto prima della corsa: con una
        // dissolvenza lunga quanto il movimento, l'ingresso sembra meccanico.
        fromLeft: {
          '0%': { opacity: '0', transform: 'translateX(-32%)' },
          '35%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Opaco già al 20%: il ritratto è l'LCP, non deve aspettare la fine della corsa.
        fromRight: {
          '0%': { opacity: '0', transform: 'translateX(34%)' },
          '20%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      animation: {
        // `backwards` e non `both`: finita non lascia un transform su <main>, che su iPhone fa tremare gli sticky.
        viewIn: 'viewIn .5s cubic-bezier(.2,.7,.2,1) backwards',
        letterIn: 'letterIn .9s cubic-bezier(.2,.7,.2,1) both',
        // Partenze sfalsate apposta; la curva è quasi tutta decelerazione.
        titleIn: 'fromLeft 1.25s cubic-bezier(.16,1,.3,1) .2s both',
        roleIn: 'fromLeft 1.25s cubic-bezier(.16,1,.3,1) .38s both',
        photoIn: 'fromRight 1.5s cubic-bezier(.16,1,.3,1) .3s both',
        float: 'float 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // Al tocco non c'è hover: lì serve uno stato sempre visibile.
    plugin(({ addVariant }) => {
      addVariant('hover-fine', '@media (any-hover: hover)')
    }),
  ],
}
