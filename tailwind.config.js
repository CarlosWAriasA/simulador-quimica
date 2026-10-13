/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk Variable"', '"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        lab: {
          950: '#040815',
          900: '#070d1f',
          850: '#0a1329',
          800: '#0e1a36',
          700: '#162547',
          600: '#22355f',
          500: '#33497a',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,189,248,0.15), 0 10px 40px -10px rgba(56,189,248,0.25)',
        'glow-violet': '0 0 0 1px rgba(167,139,250,0.2), 0 10px 40px -10px rgba(167,139,250,0.35)',
      },
      keyframes: {
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'spin-slow': 'spin-slow 3s linear infinite',
      },
    },
  },
  plugins: [],
};
