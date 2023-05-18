const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx,ejs}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        sky: colors.sky,
        cyan: colors.cyan,
        primary: '#5B96F7',
      },
      boxShadow: {
        DEFAULT: '0px 0px 4px rgba(0, 0, 0, 0.25)',
        result: '0px 1px 6px -4px rgba(0, 0, 0, 0.25)',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      fontSize: {
        icon: ['1.5rem', '1'],
      },
      fontFamily: {
        manrope: ['Marope'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
