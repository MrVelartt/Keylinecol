'use client'

import { Accent } from '@/components/ui/SectionHeader'
import { DEPARTAMENTOS, ZONAS, type ZonaId } from '@/data/catalogos/clima'
import { climaDeSubzona } from '@/data/catalogos/predial'
import { etoPorAltitud } from '@/lib/calculos/clima'
import { nf, nf1, nf2 } from '../fmt'
import { Card, Grid, Note, NumField, PanelHeader, SelectField, Stat, Stats, TextField, type PanelProps } from '../ui'

export default function Clima({ s, r, set }: PanelProps) {
  const cl = s.clima
  const dep = DEPARTAMENTOS.find((d) => d.nombre === cl.departamento) ?? DEPARTAMENTOS[0]
  const zona = ZONAS[cl.zona as ZonaId] ?? ZONAS.tpl
  const num = (k: 'altitud' | 'precipAnual' | 'mesesSecos' | 'etoDia' | 'evaporacionDia' | 'fraccionSecaPct' | 'coefPeActual' | 'coefPeDiseno') =>
    ({ value: cl[k], onChange: (v: number) => set((d) => void (d.clima[k] = v)) })

  const aplicarSubzona = (departamento: string, subzona: number) =>
    set((d) => {
      const c = climaDeSubzona(departamento, subzona)
      Object.assign(d.clima, {
        departamento,
        subzona,
        altitud: c.altitud,
        precipAnual: c.precipAnual,
        mesesSecos: c.mesesSecos,
        zona: c.zona,
        etoDia: c.etoDia,
        evaporacionDia: c.evaporacionDia,
      })
    })

  const ms = cl.mesesSecos

  return (
    <>
      <PanelHeader
        eyebrow="Capa 01 · la más permanente"
        title={
          <>
            <Accent>Clima</Accent>
          </>
        }
      >
        El clima define todo lo demás. Lo que decide el dimensionamiento no es la lluvia anual sino cuántos meses secos hay y
        qué tan profunda es la sequía.
      </PanelHeader>

      <div className="space-y-5">
        <Card title="Localización bioclimática">
          <Grid cols={3}>
            <SelectField
              label="Departamento"
              value={cl.departamento}
              options={DEPARTAMENTOS.map((d) => ({ value: d.nombre, label: d.nombre }))}
              onChange={(v) => aplicarSubzona(v, 0)}
            />
            <SelectField
              label="Unidad fisiográfica"
              value={cl.subzona}
              options={dep.subzonas.map((z, i) => ({ value: i, label: z.nombre }))}
              onChange={(v) => aplicarSubzona(cl.departamento, v)}
            />
            <TextField
              label="Municipio"
              placeholder="Escriba el municipio"
              value={s.finca.municipio}
              onChange={(v) => set((d) => void (d.finca.municipio = v))}
            />
          </Grid>
          <Grid cols={4} className="mt-4">
            <NumField label="Altitud" unit="m s. n. m." step={10} {...num('altitud')} />
            <NumField label="Precipitación anual" unit="mm/año" step={10} {...num('precipAnual')} />
            <NumField label="Meses secos" unit="mes" min={0} max={10} step={1} {...num('mesesSecos')} />
            <SelectField
              label="Zona bioclimática"
              value={cl.zona as ZonaId}
              options={(Object.keys(ZONAS) as ZonaId[]).map((k) => ({ value: k, label: `${ZONAS[k].nombre} · ${ZONAS[k].altitud}` }))}
              onChange={(z) =>
                set((d) => {
                  d.clima.zona = z
                  d.clima.etoDia = Math.round(etoPorAltitud(d.clima.altitud, ZONAS[z]) * 100) / 100
                  d.clima.evaporacionDia = ZONAS[z].evaporacion
                })
              }
            />
            <NumField label="ETo de referencia" unit="mm/día" step={0.05} {...num('etoDia')} />
            <NumField label="Evaporación lámina libre" unit="mm/día" step={0.1} {...num('evaporacionDia')} />
            <NumField label="Lluvia en meses secos" unit="% del mes medio" min={0} max={100} step={5} {...num('fraccionSecaPct')} />
            <TextField label="Régimen" value={dep.regimen} readOnly />
          </Grid>
          <Note>
            {ms >= 5 ? (
              <>
                <strong>Sequía larga y predecible ({ms} meses).</strong> Es el escenario donde el almacenamiento keyline rinde más: la
                lluvia total puede ser alta, pero se concentra fuera de la ventana crítica.
              </>
            ) : ms <= 1 ? (
              <>
                <strong>Sin estación seca marcada.</strong> Aquí el diseño debe priorizar drenaje, control de erosión e infiltración
                antes que almacenamiento. Verifique si el reservorio se justifica.
              </>
            ) : (
              <>
                <strong>
                  Régimen {dep.regimen} con {ms} meses secos.
                </strong>{' '}
                Dimensione para la sequía más larga del año, no para el promedio.
              </>
            )}
          </Note>
        </Card>

        <Stats>
          <Stat accent k="Zona bioclimática" v={zona.nombre} sub={zona.altitud} />
          <Stat k="Época seca" v={`${r.dias} días`} sub={`${ms} meses secos`} />
          <Stat k="Lluvia en época seca" v={`${nf(r.pSecaMm)} mm`} sub={`de ${nf(cl.precipAnual)} mm anuales`} />
          <Stat k="ETo acumulada en la seca" v={`${nf(cl.etoDia * r.dias)} mm`} sub={`${nf2(cl.etoDia)} mm/día`} />
          <Stat k="Evaporación lámina libre" v={`${nf1(cl.evaporacionDia)} mm/d`} sub="pérdida en el espejo de agua" />
        </Stats>

        <Card
          title="Precipitación efectiva"
          hint="El objetivo central del diseño keyline es subir este coeficiente: pasar de escorrentía a infiltración. La diferencia entre el escenario actual y el escenario con diseño es agua que no hay que almacenar ni bombear."
        >
          <Grid cols={2}>
            <NumField label="Coeficiente de Pe — situación actual" unit="0–1" min={0.2} max={0.95} step={0.01} {...num('coefPeActual')} />
            <NumField label="Coeficiente esperado con diseño keyline" unit="0–1" min={0.2} max={0.95} step={0.01} {...num('coefPeDiseno')} />
          </Grid>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <Stat k="Agua adicional infiltrada" v={`${nf(r.aguaRetenidaM3Ha)} m³/ha·año`} sub="por subir el coeficiente de Pe" />
            <Stat
              k="En el área a intervenir"
              v={`${nf(r.aguaRetenidaFincaM3)} m³/año`}
              sub={`${nf1(s.finca.areaIntervenirHa)} ha intervenidas`}
            />
            <Stat
              k="Equivale a"
              v={`${nf1(r.volumenDiseno > 0 ? r.aguaRetenidaFincaM3 / r.volumenDiseno : 0)} ×`}
              sub="el volumen del reservorio proyectado"
            />
          </div>
        </Card>
      </div>
    </>
  )
}
