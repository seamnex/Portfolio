/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#070A12', // fondo profundo
          800: '#0B0F19', // fondo principal
          700: '#111827', // superficies
          600: '#1B2333', // bordes / cards
          500: '#28324a',
        },
        accent: {
          DEFAULT: '#06B6D4', // cyan — precisión / tecnología
          soft: '#14B8A6',
        },
        ok: '#10B981',      // estado online / SLO cumplido
        warn: '#F59E0B',    // degradado
        crit: '#FB7185',    // incidente P1 / coral
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.35', transform: 'scale(.85)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        'fade-up': 'fadeUp .7s ease-out both',
        scanline: 'scanline 6s linear infinite',
        blink: 'blink 1.1s step-end infinite',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(6,182,212,.25), 0 12px 40px -12px rgba(6,182,212,.35)',
      },
    },
  },
  plugins: [],
}
