import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette from CLAUDE.md
        bg: {
          deepest: '#0B1220',
          mid: '#1E2533',
        },
        neutral: {
          1: '#FFFFFF',
          2: '#E6EAF2',
          3: '#A7B0C0',
          4: '#6B778C',
          5: '#1E2533',
          6: '#0B1220',
        },
        sunrise: '#FF8A00',
        sunset: '#3AA0FF',
        daylight: '#FFD18A',
        sungglow: '#FFC24D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        widecaps: '0.12em',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}

export default config
