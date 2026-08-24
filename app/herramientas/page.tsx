import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Herramientas from '@/components/Herramientas'
import CalculadoraSuelo from '@/components/CalculadoraSuelo'
import CalculadoraClima from '@/components/CalculadoraClima'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Herramientas Técnicas — Keyline Colombia',
  description:
    'Calcula la demanda hídrica de tu hato, el movimiento de tierra, el índice de fertilidad de tu suelo y el balance hídrico de tu finca — con rangos de referencia y cotización descargable en PDF.',
}

export default function HerramientasPage() {
  return (
    <main className="overflow-x-hidden relative">
      <Nav />
      <Herramientas />
      <CalculadoraSuelo />
      <CalculadoraClima />
      <Footer />
    </main>
  )
}
