import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import IndiceHerramientas from '@/components/tools/IndiceHerramientas'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Herramientas Técnicas — Keyline Colombia',
  description:
    'Calculadoras gratuitas: demanda hídrica pecuaria y agrícola, movimiento de tierra, análisis de suelo, Diseño Keyline Predial, Escala de Permanencia y escorrentía GUARDAR/EVACUAR — con valores editables, rangos sugeridos y PDF.',
}

export default function HerramientasPage() {
  return (
    <main className="overflow-x-hidden relative">
      <Nav />
      <IndiceHerramientas />
      <Footer />
    </main>
  )
}
