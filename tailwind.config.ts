import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './widgets/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './entities/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#111111',
          white: '#ffffff',
          gray: '#f5f5f5',
          'gray-dark': '#e8e8e8',
          muted: '#6b6b6b',
          border: '#d4d4d4',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
      },
    },
  },
  plugins: [],
}

export default config
