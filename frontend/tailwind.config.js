const {
  colors,
  borderRadius,
  boxShadow,
  fontFamily,
  transitionDuration,
  transitionTimingFunction,
  fontSize,
} = require('./src/design-tokens/tokens.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors,
      borderRadius,
      boxShadow,
      fontFamily,
      transitionDuration,
      transitionTimingFunction,
      fontSize,
    },
  },
  plugins: [],
};
