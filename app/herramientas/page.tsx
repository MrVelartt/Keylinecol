import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Herramientas from '@/components/Herramientas'
import CalculadoraSuelo from '@/components/CalculadoraSuelo'
import CalculadoraClima from '@/components/CalculadoraClima'
import EscalaPermanencia from '@/components/EscalaPermanencia'
import CalculadoraEscorrentia from '@/components/CalculadoraEscorrentia'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Herramientas Técnicas — Keyline Colombia',
  description:
    'Calcula la demanda hídrica de tu hato, el movimiento de tierra, el índice de fertilidad de tu suelo, el balance hídrico de tu finca, diagnostica tu finca con la Escala de Permanencia y dimensiona reservorios o vertederos con la fórmula GUARDAR/EVACUAR — con rangos de referencia y cotización descargable en PDF.',
}

export default function HerramientasPage() {
  return (
    <main className="overflow-x-hidden relative">
      <Nav />
      <Herramientas />
      <CalculadoraSuelo />
      <CalculadoraClima />
      <EscalaPermanencia />
      <CalculadoraEscorrentia />
      <Footer />
    </main>
  )
}
