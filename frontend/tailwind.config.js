const { colors, borderRadius, boxShadow, fontFamily } = require('./src/design-tokens/tokens.cjs');

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
    },
  },
  plugins: [],
};
