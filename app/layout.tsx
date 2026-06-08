import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Keyline Colombia — Diseño Regenerativo de Paisajes',
  description:
    'Transformamos tu tierra con la metodología Keyline: agua, fertilidad y biodiversidad en armonía. Colombia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-[#0a120a] text-white antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
