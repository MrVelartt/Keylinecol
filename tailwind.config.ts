import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#1D1D1B',
        accent: '#95C11F',
        brand: {
          lime: '#95C11F',
          dark: '#5A7A1E',
          yellow: '#E9EA9B',
          graphite: '#1D1D1B',
          cream: '#F5F5E8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
