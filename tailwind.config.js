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
        // Comparsa della testata di "Chi sono": il titolo entra da sinistra, il ritratto
        // da destra. Lo scostamento è in frazione della propria larghezza, così vale a
        // ogni formato. Il titolo sfuma entrando; il ritratto no, perché è l'immagine
        // grande sopra la piega, cioè quella su cui si misura l'LCP: da `opacity: 0`
        // risulterebbe dipinta quasi un secondo più tardi. A farlo comparire basta
        // `viewIn`, che copre già tutta la pagina.
        // L'opacità si chiude presto e la corsa continua: le cose sono già tutte lì
        // mentre stanno ancora rallentando. Al contrario — dissolvenza lunga quanto la
        // corsa — il movimento si vede solo a metà e sembra meccanico.
        daSinistra: {
          '0%': { opacity: '0', transform: 'translateX(-32%)' },
          '35%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Il ritratto arriva da fuori e si scopre subito: l'opacità è finita al 20%,
        // così è dipinto quasi da principio e l'LCP non aspetta la fine della corsa.
        daDestra: {
          '0%': { opacity: '0', transform: 'translateX(34%)' },
          '20%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
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
        // Quattro tempi diversi apposta: pagina vuota per due decimi, poi le due righe
        // una dopo l'altra e il ritratto che arriva più lento, perché pesa di più.
        // La curva è quasi tutta decelerazione: le cose si posano invece di fermarsi.
        titoloIn: 'daSinistra 1.25s cubic-bezier(.16,1,.3,1) .2s both',
        ruoloIn: 'daSinistra 1.25s cubic-bezier(.16,1,.3,1) .38s both',
        fotoIn: 'daDestra 1.5s cubic-bezier(.16,1,.3,1) .3s both',
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
