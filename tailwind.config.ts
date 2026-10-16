import type { Config } from 'tailwindcss'
import { palette, lines, veils, alpha } from './lib/theme'

// Tokens semánticos: los valores viven en lib/theme.ts.
//   bg-surface / bg-surface-raised / bg-surface-hover / bg-surface-sunken
//   text-primary / text-secondary / text-mono / text-faint
//   border-subtle / border-strong / border-emphasis
//   bg-brand / text-brand / border-brand/20 / bg-brand-muted
//   bg-veil / bg-veil-strong
//   text-signal-demand / text-signal-deficit (solo con significado)
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: palette.surface,
        brand: {
          ...palette.brand,
          muted: alpha(palette.brand.DEFAULT, 0.1),
        },
        ink: palette.ink,
        signal: palette.signal,
        landscape: palette.landscape,
        line: lines,
        veil: veils,
      },
      textColor: {
        primary: palette.ink.primary,
        secondary: palette.ink.secondary,
        mono: palette.ink.mono,
        faint: palette.ink.faint,
      },
      borderColor: {
        subtle: lines.subtle,
        strong: lines.strong,
        emphasis: lines.emphasis,
      },
      boxShadow: {
        glow: `0 0 24px ${alpha(palette.brand.DEFAULT, 0.35)}`,
        'glow-lg': `0 0 40px ${alpha(palette.brand.DEFAULT, 0.4)}`,
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
