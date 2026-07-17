import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Herramientas from '@/components/Herramientas'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Herramientas Técnicas — Keyline Colombia',
  description:
    'Calcula la demanda hídrica de tu hato y el movimiento de tierra necesario para almacenarla, con presupuesto estimado y cotización descargable en PDF.',
}

export default function HerramientasPage() {
  return (
    <main className="overflow-x-hidden relative">
      <Nav />
      <Herramientas />
      <Footer />
    </main>
  )
}
