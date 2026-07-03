/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // ═══ Ana Marka Rengi (Modern Mavi) ═══
        brand: {
          50:  '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1976D2',
          700: '#1565c0',
          800: '#0d47a1',
          900: '#0a3980',
          950: '#052a5c',
        },

        // ═══ Turo tarzı yumuşak nötr renkler ═══
        ink: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // ═══ Aksan renkleri ═══
        accent: {
          success: '#00B67A',
          warning: '#F59E0B',
          danger:  '#EF4444',
        },

        surface: '#FFFFFF',
        'surface-alt': '#FAFAFA',
        border: '#E5E5E5',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display-lg': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display':    ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title-lg':   ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title':      ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
      },

      borderRadius: {
        'card': '16px',
        'card-lg': '24px',
        'button': '9999px',
      },

      boxShadow: {
        'card': '0 2px 8px -2px rgba(0,0,0,0.06), 0 4px 16px -4px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px -4px rgba(0,0,0,0.1), 0 8px 32px -8px rgba(0,0,0,0.08)',
        'button': '0 1px 2px 0 rgba(0,0,0,0.05)',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
      },
    },
  },
  plugins: [],
}