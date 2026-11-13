/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Blanco apenas frío: el #FFF puro sobre este azul vibraba en los
        // titulares. Es el mismo matiz del fondo, casi sin croma.
        white: '#F4F7FB',
        base: {
          900: '#070A12', // fondo profundo
          800: '#0B0F19', // fondo principal
          700: '#111827', // superficies
          600: '#1B2333', // bordes / cards
          500: '#28324a',
        },
        // Grises de texto secundario. Los slate-500/600 de Tailwind
        // (#64748B, #475569) quedaban en 4,0:1 y 2,5:1 sobre el fondo:
        // por debajo del 4,5:1 que pide WCAG AA para texto chico. Se
        // aclaran acá y no clase por clase (son más de cien usos), y se
        // conserva la jerarquía 400 > 500 > 600. Ambos superan 4,5:1
        // sobre base-900, base-800 y base-700.
        slate: {
          500: '#8494A9',
          600: '#7A8AA0',
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
        sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      keyframes: {
        // El punto de estado emite un anillo, como un sondeo que sale: el
        // punto sólido de encima no cambia, así el estado se lee igual en
        // cualquier cuadro de la animación.
        pulseDot: {
          '0%': { opacity: '.55', transform: 'scale(1)' },
          '70%, 100%': { opacity: '0', transform: 'scale(2.6)' },
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
        // Entrada de un aviso flotante: desde la derecha en escritorio y
        // desde abajo en móvil, que es de donde cuelga la pila en cada caso.
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // El paquete del diagrama de topología. Dos keyframes y no uno con
        // transform porque el conector cambia de eje según el breakpoint:
        // vertical apilado en móvil, horizontal en escritorio.
        // La línea del incidente se traza de izquierda a derecha una sola
        // vez, como se lee el tiempo. Es el único movimiento de la portada.
        trazo: {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        flowX: {
          '0%': { left: '0%', opacity: '0' },
          '12%, 88%': { opacity: '1' },
          '100%': { left: '100%', opacity: '0' },
        },
        flowY: {
          '0%': { top: '0%', opacity: '0' },
          '12%, 88%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 2.2s cubic-bezier(0,0,.2,1) infinite',
        'fade-up': 'fadeUp .8s cubic-bezier(.16,1,.3,1) both',
        scanline: 'scanline 6s linear infinite',
        blink: 'blink 1.1s step-end infinite',
        'slide-in': 'slideIn .35s cubic-bezier(.2,.8,.2,1) both',
        trazo: 'trazo 1.6s cubic-bezier(.16,1,.3,1) .45s both',
        // El simulacro avanza a velocidad de reloj: lineal, y la duración la pone el componente.
        avance: 'trazo 10s linear both',
        'flow-x': 'flowX 2.4s linear infinite',
        'flow-y': 'flowY 2.4s linear infinite',
      },
      boxShadow: {
        // Ya no es un halo cian: una sombra con caída, que es lo que
        // despega la tarjeta del fondo, y un filo de luz arriba.
        glow: 'inset 0 1px 0 rgba(255,255,255,.06), 0 2px 4px rgba(0,0,0,.3), 0 24px 48px -24px rgba(0,0,0,.85)',
      },
    },
  },
  plugins: [],
}
