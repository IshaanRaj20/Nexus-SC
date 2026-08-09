/** @type {import('tailwindcss').Config} */

// Design system tokens for Nexus Student Companion.
// Palette rationale (see DESIGN.md for the full rationale):
//   - "signal" blue is the single accent used for anything actionable or "alive"
//   - ink / paper are near-black / near-white bases, never pure #000 / #fff
//   - surfaces are the elevated-card colors for light + dark mode
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        signal: {
          50: '#EEF4FF',
          100: '#DBE7FF',
          200: '#B8CFFF',
          300: '#8FB1FF',
          400: '#5C8CFF',
          500: '#2F68F5',
          600: '#155DFC', // primary brand blue
          700: '#0F46C4',
          800: '#0D389D',
          900: '#0B2C79'
        },
        ink: {
          950: '#05070D',
          900: '#0B1220',
          800: '#121A2B',
          700: '#1B2537',
          600: '#2A3550',
          500: '#414F6F',
          400: '#69769A'
        },
        paper: {
          50: '#FFFFFF',
          100: '#F7F9FC',
          200: '#EEF2F9',
          300: '#E3E9F4',
          400: '#CBD5E6'
        },
        success: '#1FAE6E',
        warning: '#F0A61F',
        danger: '#EF4444',
        streak: '#FF8A2B'
      },
      fontFamily: {
        display: ['"Lexend"', '"Sora"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        xl2: '1.25rem',
        card: '1.25rem',
        pill: '999px'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11,18,32,0.04), 0 8px 24px -8px rgba(11,18,32,0.10)',
        'soft-dark': '0 1px 2px rgba(0,0,0,0.3), 0 12px 28px -10px rgba(0,0,0,0.55)',
        glow: '0 0 0 1px rgba(21,93,252,0.15), 0 8px 30px -6px rgba(21,93,252,0.35)'
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'slide-in-right': { from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        'pop': { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } },
        'shimmer': { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } }
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-up': 'slide-up 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'pop': 'pop 0.35s ease-out',
        'shimmer': 'shimmer 1.6s linear infinite'
      }
    }
  },
  plugins: []
}
