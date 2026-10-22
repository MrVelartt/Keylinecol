import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import PredialDashboard from '@/components/predial/PredialDashboard'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Diseño Keyline Predial — Keyline Colombia',
  description:
    'Diseña la finca capa por capa con la escala de permanencia: clima, relieve, demanda y oferta de agua, reservorios, movimiento de tierras y cronograma de inversión por semestres, con precios unitarios editables.',
}

export default function DisenoKeylinePredialPage() {
  return (
    <main className="overflow-x-clip relative">
      <Nav />
      <PredialDashboard />
      <Footer />
    </main>
  )
}
