/**
 * Préréglage Tailwind commun FLS.
 * Contrainte AdBlock du cahier des charges : toutes les classes générées portent le préfixe « sn- ».
 * Palette réglementaire : #097646, #0A4A2A, #333333, #FFFFFF, #F7F9F6.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'sn-',
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#097646', dark: '#075c37', 50: '#E6F2EC', 100: '#CCE5D8' },
        navy: { DEFAULT: '#0A4A2A', dark: '#073A20', 900: '#10241A', 50: '#FFF7CC' },
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
