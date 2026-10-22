'use client'

import { Accent } from '@/components/ui/SectionHeader'
import type { CapaCostoId } from '@/lib/calculos/predial'
import CostTable from '../CostTable'
import { Card, PanelHeader, type PanelProps } from '../ui'

// Capas 04–08: una tabla de ítems de obra con texto propio por capa.
const CAPAS: Record<'vias' | 'arb' | 'est' | 'sub' | 'suelo', { eyebrow: string; title: string; intro: string }> = {
  vias: {
    eyebrow: 'Capa 04',
    title: 'Vías de acceso',
    intro:
      'Trazadas sobre la línea clave y en cota, las vías dejan de ser causa de erosión y pasan a ser estructuras de manejo del agua.',
  },
  arb: {
    eyebrow: 'Capa 05',
    title: 'Árboles',
    intro: 'Franjas arbóreas sobre las líneas clave, cercas vivas y sistemas silvopastoriles.',
  },
  est: {
    eyebrow: 'Capa 06',
    title: 'Estructuras',
    intro:
      'Conducción, almacenamiento en tanques, abrevaderos, bombeo y riego. Cuando la topografía permite distribuir por gravedad desde la cota alta, este capítulo se reduce drásticamente.',
  },
  sub: {
    eyebrow: 'Capa 07',
    title: 'Subdivisiones',
    intro: 'Potreros y cercas siguiendo las curvas de nivel, para que el pastoreo no destruya la infraestructura hídrica.',
  },
  suelo: {
    eyebrow: 'Capa 08 · la menos permanente, la que más cambia',
    title: 'Suelo',
    intro:
      'Labranza keyline con arado de cinceles, enmiendas y renovación de praderas. Es la capa que convierte la obra de tierra en fertilidad.',
  },
}

export type CapaSimple = keyof typeof CAPAS

export default function Capa({ capa, s, set }: PanelProps & { capa: CapaSimple & CapaCostoId }) {
  const c = CAPAS[capa]
  const [primera, ...resto] = c.title.split(' ')
  return (
    <>
      <PanelHeader
        eyebrow={c.eyebrow}
        title={
          <>
            <Accent>{primera}</Accent>
            {resto.length > 0 && ` ${resto.join(' ')}`}
          </>
        }
      >
        {c.intro}
      </PanelHeader>
      <Card title="Ítems de la capa" hint="Cantidades y precios unitarios de referencia: ajústelos con cotizaciones locales.">
        <CostTable capa={capa} s={s} set={set} />
      </Card>
    </>
  )
}
