/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tree-green': {
          light: '#86efac',
          DEFAULT: '#22c55e',
          dark: '#15803d',
        },
        'tree-brown': {
          light: '#d4a574',
          DEFAULT: '#92400e',
          dark: '#451a03',
        },
        'tree-snow': {
          light: '#f8fafc',
          DEFAULT: '#e2e8f0',
          dark: '#94a3b8',
        }
      },
      animation: {
        'grow': 'grow 0.5s ease-out',
        'leaf-hover': 'leafHover 0.2s ease-in-out',
      },
      keyframes: {
        grow: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        leafHover: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}