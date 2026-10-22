'use client'

import { Accent } from '@/components/ui/SectionHeader'
import { MATERIALES } from '@/data/catalogos/obra'
import { FORMAS_RELIEVE, GRUPOS_HIDROLOGICOS } from '@/data/catalogos/predial'
import CostTable from '../CostTable'
import { Card, Grid, Note, NumField, PanelHeader, SelectField, type PanelProps } from '../ui'

export default function Relieve({ s, set }: PanelProps) {
  const rl = s.relieve
  const pend = rl.pendientePct

  return (
    <>
      <PanelHeader
        eyebrow="Capa 02"
        title={
          <>
            <Accent>Relieve</Accent>
          </>
        }
      >
        La forma del terreno decide el costo por metro cúbico almacenado mucho más que la negociación de tarifas. Un sitio bien
        elegido cuesta entre 3 y 8 veces menos.
      </PanelHeader>

      <div className="space-y-5">
        <Card title="Caracterización del terreno">
          <Grid cols={3}>
            <NumField
              label="Pendiente media"
              unit="%"
              min={0}
              max={100}
              step={1}
              value={pend}
              onChange={(v) => set((d) => void (d.relieve.pendientePct = v))}
            />
            <NumField
              label="Desnivel del predio"
              unit="m"
              min={0}
              step={5}
              value={rl.desnivelM}
              onChange={(v) => set((d) => void (d.relieve.desnivelM = v))}
            />
            <SelectField
              label="Forma dominante"
              value={rl.forma}
              options={FORMAS_RELIEVE.map((x) => ({ value: x, label: x }))}
              onChange={(v) => set((d) => void (d.relieve.forma = v))}
            />
            <SelectField
              label="Material dominante del suelo"
              value={rl.materialId}
              options={MATERIALES.map((m) => ({ value: m.id, label: m.nombre }))}
              onChange={(v) => set((d) => void (d.relieve.materialId = v))}
            />
            <SelectField
              label="Grupo hidrológico de suelo"
              value={rl.grupoHidrologico}
              options={GRUPOS_HIDROLOGICOS.map((g) => ({ value: g.id, label: g.nombre }))}
              onChange={(v) => set((d) => void (d.relieve.grupoHidrologico = v))}
            />
            <NumField
              label="Puntos clave identificados"
              unit="und"
              min={0}
              step={1}
              value={rl.puntosClave}
              onChange={(v) => set((d) => void (d.relieve.puntosClave = v))}
            />
          </Grid>
          <Note>
            {pend < 3
              ? 'Pendiente muy baja: el reservorio será excavado y la relación corte/almacenamiento se acerca a 1,0. Considere concentrar el volumen en menos vasos y más profundos.'
              : pend > 35
                ? 'Pendiente fuerte: priorice retención en el perfil (zanjas, subsolado, cobertura) sobre almacenamiento superficial, y verifique estabilidad antes de cualquier terraplén.'
                : 'Rango de pendiente favorable para el trazado de líneas clave y presas en vaguada, la tipología más eficiente en costo por metro cúbico almacenado.'}
          </Note>
        </Card>

        <Card
          title="Estudios previos"
          tag="honorarios de diseño"
          hint="Los rubros marcados como diseño no entran en el total cotizado de obra: se presentan como servicio profesional aparte."
        >
          <CostTable capa="estudios" s={s} set={set} />
        </Card>
      </div>
    </>
  )
}
