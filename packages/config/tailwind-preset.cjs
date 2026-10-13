/**
 * Préréglage Tailwind commun FLS.
 * Contrainte AdBlock du cahier des charges : toutes les classes générées portent le préfixe « sn- ».
 * Palette réglementaire : #006633, #003366, #333333, #FFFFFF, #F7F9F6.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'sn-',
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#006633', dark: '#00512a', 50: '#E7F1EB', 100: '#CFE4D7' },
        navy: { DEFAULT: '#003366', dark: '#00264d', 900: '#001a35', 50: '#E8EEF5' },
        ink: '#333333',
        muted: '#5B655F',
        line: '#DCE3DD',
        paper: '#F7F9F6',
      },
      fontFamily: {
        sans: ['"Figtree Variable"', 'Figtree', 'system-ui', 'sans-serif'],
        num: ['Sora', '"Figtree Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { s: '6px', m: '12px', l: '20px' },
    },
  },
  plugins: [],
};
