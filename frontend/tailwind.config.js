/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#050505',
        crimson: {
          DEFAULT: '#FF3366',
          glow: 'rgba(255, 51, 102, 0.45)',
          dark: '#3A0713',
        },
        cyan: {
          DEFAULT: '#00F0FF',
          glow: 'rgba(0, 240, 255, 0.45)',
          dark: '#032533',
        },
        ocean: {
          light: '#D6DCED',
          soft: '#9FA8BF',
          medium: '#5F667A',
          dark: '#383C4D',
          mauve: '#FF3366', // Enhanced to aggressive neon crimson
          peach: '#00F0FF', // Enhanced to glowing cyan
          bg: '#050505',    // Deep void black
          surface: '#0A0D14',
          border: '#1E2538',
          hover: '#131A29',
        }
      },
      boxShadow: {
        'hologram': '0 0 25px rgba(0, 240, 255, 0.25), 0 0 50px rgba(0, 240, 255, 0.1)',
        'hologram-crimson': '0 0 25px rgba(255, 51, 102, 0.35), 0 0 60px rgba(255, 51, 102, 0.15)',
        'levitate': '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.15)',
        'levitate-hover': '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 240, 255, 0.3)',
      },
      animation: {
        'levitate-slow': 'levitate 6s ease-in-out infinite',
        'levitate-medium': 'levitate 4.5s ease-in-out infinite',
        'levitate-delayed': 'levitate 5s ease-in-out 1.5s infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'pulse-crimson': 'pulseCrimson 1.5s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        levitate: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px #00F0FF)' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 2px #00F0FF)' },
        },
        pulseCrimson: {
          '0%, 100%': { boxShadow: '0 0 25px rgba(255, 51, 102, 0.6), inset 0 0 15px rgba(255, 51, 102, 0.4)' },
          '50%': { boxShadow: '0 0 10px rgba(255, 51, 102, 0.2), inset 0 0 5px rgba(255, 51, 102, 0.1)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}