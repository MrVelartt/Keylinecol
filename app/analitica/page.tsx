import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Analitica from '@/components/Analitica'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Analítica Climática — Keyline Colombia',
  description:
    'Series históricas de precipitación, evapotranspiración y escorrentía por finca — la base de datos sobre la que diseñamos cada sistema Keyline.',
}

export default function AnaliticaPage() {
  return (
    <main className="overflow-x-hidden relative">
      <Nav />
      <Analitica />
      <Footer />
    </main>
  )
}
