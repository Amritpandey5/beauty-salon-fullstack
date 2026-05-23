/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        arabic: ['"Noto Naskh Arabic"', 'serif'],
      },
      colors: {
        gold: {
          50: '#fdfbf0',
          100: '#faf5d3',
          200: '#f4e88a',
          300: '#edd84f',
          400: '#e4c52a',
          500: '#c9a227',
          600: '#a67c1e',
          700: '#7d5a16',
          800: '#5a3f10',
          900: '#3d2a0a',
        },
        obsidian: {
          50: '#f5f5f4',
          100: '#e8e6e3',
          200: '#d1cdc8',
          300: '#b0a89f',
          400: '#8a7f74',
          500: '#6b6059',
          600: '#524943',
          700: '#3c342f',
          800: '#1e1a17',
          900: '#0f0d0b',
          950: '#080604',
        },
        ivory: {
          50: '#fdfcf8',
          100: '#f9f6ee',
          200: '#f2ead8',
          300: '#e8d9b8',
          400: '#d9c090',
          500: '#c9a46a',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a227 0%, #e4c52a 50%, #a67c1e 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0f0d0b 0%, #1e1a17 100%)',
        'luxury-gradient': 'linear-gradient(to bottom right, #0f0d0b, #3c342f)',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'shimmer': 'shimmer 2.5s infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(201, 162, 39, 0.3)',
        'gold-lg': '0 8px 40px rgba(201, 162, 39, 0.4)',
        'luxury': '0 20px 60px rgba(0,0,0,0.4)',
        'glass': '0 8px 32px rgba(0,0,0,0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
