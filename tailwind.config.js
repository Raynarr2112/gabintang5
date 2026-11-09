/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFAF2',
          100: '#FFF6E7',
          200: '#FDEFD6',
          300: '#F9DFB0',
        },
        icepink: {
          50: '#FFF0F5',
          100: '#FFE4EC',
          200: '#FFD1DC',
          300: '#FCA5B7',
          400: '#FB7185',
          500: '#F43F5E',
        },
        iceyellow: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
        },
        icechoco: {
          50: '#F7F3F0',
          100: '#EBDED6',
          300: '#B08974',
          600: '#684535',
          800: '#452A1E',
          900: '#2F1B12',
        },
        icemint: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          400: '#4ADE80',
          500: '#22C55E',
        },
        icepurple: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          400: '#C084FC',
        }
      },
      fontFamily: {
        fredoka: ['Fredoka', 'Quicksand', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(244, 63, 94, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'pop': '0 12px 0 0 rgba(0, 0, 0, 0.07)',
        'float': '0 20px 40px -15px rgba(244, 63, 94, 0.18)',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        wiggle: 'wiggle 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      }
    },
  },
  plugins: [],
}
