/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        water: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.75)',
          frosted: 'rgba(255, 255, 255, 0.88)',
          border: 'rgba(255, 255, 255, 0.85)',
          subtleBorder: 'rgba(224, 242, 254, 0.7)',
        }
      },
      boxShadow: {
        'glass-sm': '0 4px 20px -2px rgba(14, 165, 233, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'glass-md': '0 10px 30px -4px rgba(15, 23, 42, 0.05), 0 4px 10px -2px rgba(14, 165, 233, 0.04)',
        'glass-lg': '0 20px 40px -6px rgba(15, 23, 42, 0.07), 0 8px 16px -4px rgba(14, 165, 233, 0.05)',
        'glass-glow': '0 0 25px rgba(14, 165, 233, 0.18)',
        'glass-modal': '0 25px 60px -12px rgba(15, 23, 42, 0.15), 0 10px 20px -5px rgba(14, 165, 233, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
