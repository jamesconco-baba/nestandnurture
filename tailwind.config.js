/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          DEFAULT: '#7E5B8E',
          50: '#F5F1F6',
          100: '#EBE2ED',
          200: '#D3BFDA',
          300: '#BB9CC6',
          400: '#A379B0',
          500: '#7E5B8E',
          600: '#654A72',
          700: '#4C3856',
          800: '#33253A',
          900: '#1A131D',
        },
        gold: {
          DEFAULT: '#C5A059',
          50: '#FBF7EF',
          100: '#F3E7CE',
          200: '#E8D3A5',
          300: '#DCBF7C',
          400: '#D1AB56',
          500: '#C5A059',
          600: '#A98240',
          700: '#816231',
          800: '#584322',
          900: '#302413',
        },
        charcoal: '#2C2C2C',
        cream: '#FAF6EF',
        blush: '#E9C9D6',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'nest-radial': 'radial-gradient(circle at 50% 0%, #F5F1F6 0%, #FAF6EF 60%)',
      },
    },
  },
  plugins: [],
};
