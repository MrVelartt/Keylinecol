import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Herramientas from '@/components/Herramientas'
import CalculadoraSuelo from '@/components/CalculadoraSuelo'
import DemandaAgricola from '@/components/DemandaAgricola'
import EscalaPermanencia from '@/components/EscalaPermanencia'
import CalculadoraEscorrentia from '@/components/CalculadoraEscorrentia'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Herramientas Técnicas — Keyline Colombia',
  description:
    'Calcula la demanda hídrica pecuaria de tu hato, el movimiento de tierra, el índice de fertilidad de tu suelo, la demanda de riego de tus cultivos frente a la escorrentía, diagnostica tu finca con la Escala de Permanencia y dimensiona reservorios o vertederos con la fórmula GUARDAR/EVACUAR — con rangos de referencia y cotización descargable en PDF.',
}

export default function HerramientasPage() {
  return (
    <main className="overflow-x-hidden relative">
      <Nav />
      <Herramientas />
      <CalculadoraSuelo />
      <DemandaAgricola />
      <EscalaPermanencia />
      <CalculadoraEscorrentia />
      <Footer />
    </main>
  )
}
