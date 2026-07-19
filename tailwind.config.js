/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F3A5F',
          light: '#2C4F7C',
          dark: '#152A45'
        },
        secondary: {
          DEFAULT: '#4F6F52',
          light: '#658468'
        },
        ink: '#2D2D2D',
        offwhite: '#F8F9FA'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
