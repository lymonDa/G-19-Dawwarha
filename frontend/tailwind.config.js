/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F8F6',
          100: '#DCEFEA',
          500: '#3F9582',
          600: '#2F806F',
          700: '#237361',
          800: '#1B5E50',
          900: '#164E41',
          DEFAULT: '#2F806F',
        },
        sand: {
          50: '#FBF6F0',
          100: '#F5E8D8',
          500: '#C98A4B',
          600: '#B87942',
          700: '#9A6538',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#F8FAF9',
          100: '#F2F5F3',
          200: '#DCE3E0',
          300: '#8A9792',
          500: '#66756F',
          700: '#394640',
          900: '#17211E',
        },
        success: {
          DEFAULT: '#27845F',
          bg: '#EAF5F0',
        },
        warning: {
          DEFAULT: '#B7791F',
          bg: '#FDF8ED',
        },
        danger: {
          DEFAULT: '#C94A4A',
          bg: '#FDF2F2',
        },
        info: {
          DEFAULT: '#3978A8',
          bg: '#EEF5FA',
        },
      },
      borderRadius: {
        'card': '14px',
      },
    },
  },
  plugins: [],
};
