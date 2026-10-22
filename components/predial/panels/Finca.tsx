'use client'

import { Accent } from '@/components/ui/SectionHeader'
import { SISTEMAS_PRODUCTIVOS } from '@/data/catalogos/predial'
import { Card, Grid, NumField, PanelHeader, SelectField, TextField, type PanelProps } from '../ui'

export default function Finca({ s, set }: PanelProps) {
  const em = (k: keyof PredialEmpresa) => ({
    value: s.empresa[k],
    onChange: (v: string) => set((d) => void (d.empresa[k] = v)),
  })
  const fk = (k: 'nombre' | 'propietario' | 'vereda') => ({
    value: s.finca[k],
    onChange: (v: string) => set((d) => void (d.finca[k] = v)),
  })

  return (
    <>
      <PanelHeader
        eyebrow="Contexto del proyecto · 00"
        title={
          <>
            Finca y <Accent>empresa</Accent>
          </>
        }
      >
        Lo que se escribe aquí encabeza la cotización. Los datos de la empresa quedan guardados en este navegador.
      </PanelHeader>

      <div className="space-y-5">
        <Card title="Datos de la empresa" tag="aparecen en la cotización" hint="Complete una sola vez: se conservan al recargar la página.">
          <Grid cols={3}>
            <TextField label="Nombre comercial" placeholder="Ej. Keyline Colombia" {...em('nombre')} />
            <TextField label="NIT / C.C." placeholder="900.000.000-0" {...em('nit')} />
            <TextField label="Responsable técnico" placeholder="Ing. agrónomo…" {...em('responsable')} />
            <TextField label="Teléfono / WhatsApp" placeholder="+57 300 000 0000" {...em('telefono')} />
            <TextField label="Correo electrónico" placeholder="contacto@empresa.com" {...em('correo')} />
            <TextField label="Sitio web" placeholder="www.empresa.com" {...em('web')} />
            <TextField label="Dirección" placeholder="Calle 00 # 00-00" {...em('direccion')} />
            <TextField label="Ciudad" placeholder="Bogotá D.C." {...em('ciudad')} />
            <TextField label="Validez de la cotización" {...em('validez')} />
          </Grid>
        </Card>

        <Card title="Datos del predio">
          <Grid cols={3}>
            <TextField label="Nombre de la finca" placeholder="Finca…" {...fk('nombre')} />
            <TextField label="Propietario / cliente" placeholder="Nombre del cliente" {...fk('propietario')} />
            <TextField label="Vereda" placeholder="Vereda…" {...fk('vereda')} />
            <NumField
              label="Área total del predio"
              unit="ha"
              min={0.1}
              step={0.1}
              value={s.finca.areaHa}
              onChange={(v) => set((d) => void (d.finca.areaHa = v))}
            />
            <NumField
              label="Área a intervenir"
              unit="ha"
              min={0}
              step={0.1}
              value={s.finca.areaIntervenirHa}
              onChange={(v) => set((d) => void (d.finca.areaIntervenirHa = v))}
            />
            <SelectField
              label="Sistema productivo principal"
              value={s.finca.sistema}
              options={SISTEMAS_PRODUCTIVOS.map((x) => ({ value: x, label: x }))}
              onChange={(v) => set((d) => void (d.finca.sistema = v))}
            />
          </Grid>
        </Card>

        <Card
          title="Alcance de la cotización"
          hint={
            <>
              La cotización se emite <strong className="text-primary">sin el valor del diseño</strong>. Los rubros marcados como
              honorarios de diseño se calculan y se muestran, pero se excluyen del total cotizado y aparecen como «se cotiza por
              separado».
            </>
          }
        >
          <Grid cols={2}>
            <NumField
              label="AIU — administración, imprevistos y utilidad sobre obra"
              unit="%"
              min={0}
              max={60}
              step={1}
              value={s.cotizacion.aiuPct}
              onChange={(v) => set((d) => void (d.cotizacion.aiuPct = v))}
            />
            <NumField
              label="Contingencia técnica"
              unit="%"
              min={0}
              max={40}
              step={1}
              value={s.cotizacion.contingenciaPct}
              onChange={(v) => set((d) => void (d.cotizacion.contingenciaPct = v))}
            />
          </Grid>
        </Card>
      </div>
    </>
  )
}

type PredialEmpresa = PanelProps['s']['empresa']
