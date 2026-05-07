/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Avis kırmızı paleti
        avis: {
          50:  '#fef2f3',
          100: '#fde3e6',
          200: '#fbccd1',
          300: '#f7a3ae',
          400: '#f17184',
          500: '#e64560',
          600: '#d22148', // Avis ana kırmızı
          700: '#b1163d',
          800: '#94143a',
          900: '#7e1437',
          950: '#460619',
        },
        // Yardımcı renkler
        ink: {
          900: '#1a1a1a',
          700: '#3d3d3d',
          500: '#6b6b6b',
          300: '#a8a8a8',
          100: '#e5e5e5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px -8px rgba(0,0,0,0.1)',
        'card-hover': '0 8px 32px -8px rgba(0,0,0,0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      }
    },
  },
  plugins: [],
}