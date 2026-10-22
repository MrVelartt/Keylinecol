'use client'

import { useMemo, useRef, useState } from 'react'
import { Accent } from '@/components/ui/SectionHeader'
import ToolFrame from '@/components/tools/ToolFrame'
import ExportarPDF from '@/components/pdf/ExportarPDF'
import { AddButton, Card, DelButton, Grid, Note, NumCell, NumField, SelectCell, SelectField } from '@/components/predial/ui'
import { ANIMALES, FACTORES_TEMPERATURA } from '@/data/catalogos/agua'
import { litrosDiaGrupo, volumenAutonomiaM3 } from '@/lib/calculos/demanda'
import type { Reporte } from '@/lib/pdf/reporte'

// ── Demanda hídrica pecuaria ──
// Consumo por cabeza (catálogo único de 17 categorías) × factor de
// temperatura × (1 + pérdidas). El volumen para N días de autonomía pasa a
// la calculadora de movimiento de tierra con ?volumen=.

const nf0 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })

type Grupo = { id: number; categoria: string; cantidad: number; litrosDia: number }

const INICIAL: Grupo[] = [{ id: 1, categoria: 'bovino-carne', cantidad: 100, litrosDia: 50 }]

export default function DemandaPecuaria() {
  const nextId = useRef(2)
  const [grupos, setGrupos] = useState<Grupo[]>(INICIAL)
  const [factorTemp, setFactorTemp] = useState(1.3)
  const [perdidas, setPerdidas] = useState(10)
  const [dias, setDias] = useState(30)

  const opciones = { factorTemperatura: factorTemp, perdidasPct: perdidas }
  const filas = useMemo(
    () =>
      grupos.map((g) => ({
        ...g,
        cat: ANIMALES.find((a) => a.id === g.categoria),
        totalL: litrosDiaGrupo({ cantidad: g.cantidad, litrosDia: g.litrosDia }, opciones),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grupos, factorTemp, perdidas]
  )
  const cabezas = grupos.reduce((s, g) => s + g.cantidad, 0)
  const litrosDia = filas.reduce((s, f) => s + f.totalL, 0)
  const m3Dia = litrosDia / 1000
  const volumen = volumenAutonomiaM3(m3Dia, dias)
  const factorSel = FACTORES_TEMPERATURA.find((f) => f.valor === factorTemp)

  const editar = (i: number, cambio: Partial<Grupo>) => setGrupos((gs) => gs.map((g, k) => (k === i ? { ...g, ...cambio } : g)))

  const construirPDF = (cliente: string): Reporte => ({
    herramienta: 'Demanda hídrica pecuaria',
    titulo: 'Demanda hídrica del hato',
    subtitulo: 'Consumo diario por categoría con factor de temperatura y pérdidas, y volumen a almacenar según los días de autonomía.',
    cliente,
    slug: 'demanda-hidrica-pecuaria',
    disclaimer:
      'Consumos de referencia (FEDEGÁN, CONtexto Ganadero, 3tres3) a 15–25 °C. Ajuste con mediciones de su finca: el consumo cambia con la dieta, la producción y la calidad del agua.',
    bloques: [
      {
        tipo: 'kpis',
        items: [
          { k: 'Consumo diario', v: `${nf1.format(m3Dia)} m³/día`, sub: `${nf0.format(litrosDia)} L/día · ${nf0.format(cabezas)} animales` },
          { k: 'Días de autonomía', v: `${nf0.format(dias)} días` },
          { k: 'Volumen a almacenar', v: `${nf0.format(volumen)} m³` },
        ],
      },
      {
        tipo: 'tabla',
        head: ['Categoría', 'Cabezas', 'L/animal·día', 'L/día del grupo'],
        body: filas.map((f) => [f.cat?.nombre ?? f.categoria, nf0.format(f.cantidad), nf2.format(f.litrosDia), nf0.format(f.totalL)]),
        foot: [['Total', nf0.format(cabezas), '', nf0.format(litrosDia)]],
      },
      {
        tipo: 'kv',
        filas: [
          ['Factor por temperatura', factorSel?.nombre ?? `× ${nf2.format(factorTemp)}`],
          ['Pérdidas en abrevaderos y conducción', `${nf0.format(perdidas)} %`],
        ],
      },
    ],
  })

  return (
    <ToolFrame
      id="demanda-pecuaria"
      number="01"
      title={
        <>
          Demanda hídrica <Accent>pecuaria</Accent>
        </>
      }
      subtitle="Cuánta agua toma tu hato al día y cuánta debes almacenar para los días sin lluvia. Todos los consumos son editables."
    >
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
        <div className="space-y-6 min-w-0">
          <Card title="Animales">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm border-collapse">
                <thead>
                  <tr className="font-mono text-[10px] uppercase tracking-wide text-mono">
                    <th className="text-left font-normal pb-2">Categoría</th>
                    <th className="text-right font-normal pb-2 w-24">Cabezas</th>
                    <th className="text-right font-normal pb-2 w-28">L/animal·día</th>
                    <th className="text-right font-normal pb-2 w-28">L/día grupo</th>
                    <th className="w-9" />
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, i) => (
                    <tr key={f.id} className="border-t border-subtle">
                      <td className="py-1">
                        <SelectCell
                          label="Categoría"
                          value={f.categoria}
                          options={ANIMALES.map((a) => ({ value: a.id, label: a.nombre }))}
                          onChange={(v) => editar(i, { categoria: v, litrosDia: ANIMALES.find((a) => a.id === v)?.litrosDia ?? f.litrosDia })}
                        />
                      </td>
                      <td>
                        <NumCell label="Cabezas" step={1} value={f.cantidad} onChange={(v) => editar(i, { cantidad: Math.max(0, Math.round(v)) })} />
                      </td>
                      <td>
                        <NumCell label="Litros por animal al día" step={0.1} value={f.litrosDia} onChange={(v) => editar(i, { litrosDia: Math.max(0, v) })} />
                      </td>
                      <td className="text-right font-mono-data text-primary">{nf0.format(f.totalL)}</td>
                      <td>
                        {grupos.length > 1 && <DelButton label="Quitar grupo" onClick={() => setGrupos((gs) => gs.filter((_, k) => k !== i))} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AddButton
              onClick={() => setGrupos((gs) => [...gs, { id: nextId.current++, categoria: 'vaca-leche', cantidad: 10, litrosDia: ANIMALES.find((a) => a.id === 'vaca-leche')!.litrosDia }])}
            >
              Agregar categoría
            </AddButton>
            <p className="mt-3 text-[11px] text-mono leading-snug">
              Consumo de referencia a 15–25 °C. Una vaca lechera de alta producción puede pasar de 100 L/día en clima cálido;
              aves y cerdos varían con la edad y el tipo de bebedero.
            </p>
          </Card>

          <Card title="Condiciones">
            <Grid cols={3}>
              <SelectField
                label="Temperatura media"
                value={factorTemp}
                options={FACTORES_TEMPERATURA.map((f) => ({ value: f.valor as number, label: f.nombre }))}
                onChange={setFactorTemp}
                hint="El consumo sube con el calor: ×1,3 entre 25 y 32 °C, ×1,6 por encima."
              />
              <NumField
                label="Pérdidas en abrevaderos y conducción"
                unit="%"
                min={0}
                max={50}
                step={1}
                value={perdidas}
                onChange={(v) => setPerdidas(Math.max(0, v))}
                hint="5–10 % con flotadores y tubería en buen estado; 20–30 % con canales abiertos o fugas."
              />
              <NumField
                label="Días de autonomía"
                unit="días"
                min={0}
                step={1}
                value={dias}
                onChange={(v) => setDias(Math.max(0, Math.round(v)))}
                hint="Cubra la sequía más larga del año: 30–60 días en régimen bimodal, 90–150 en monomodal (Caribe seco, Orinoquia)."
              />
            </Grid>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-28 p-7 lg:p-8 rounded-2xl border border-brand/20 bg-surface-raised">
          <div className="font-mono text-[10px] text-brand/70 tracking-widest uppercase mb-6">Resumen en vivo</div>
          <div className="flex items-end gap-2 mb-1">
            <span className="font-display text-4xl font-semibold text-primary">{nf0.format(volumen)}</span>
            <span className="text-mono text-sm mb-1">m³</span>
          </div>
          <p className="text-mono text-[12px] mb-6">Volumen a almacenar para {nf0.format(dias)} días</p>
          <div className="space-y-3 mb-6">
            {[
              { label: 'Animales', value: nf0.format(cabezas) },
              { label: 'Consumo diario', value: `${nf0.format(litrosDia)} L · ${nf2.format(m3Dia)} m³` },
              { label: 'Consumo anual', value: `${nf0.format(m3Dia * 365)} m³` },
            ].map((r, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 border-b border-subtle pb-2.5">
                <span className="text-mono text-[13px]">{r.label}</span>
                <span className="font-mono-data text-primary">{r.value}</span>
              </div>
            ))}
          </div>

          <a
            href={`/herramientas/movimiento-de-tierra?volumen=${Math.round(volumen)}`}
            className="mb-4 flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full border border-brand/40 text-brand text-sm font-medium hover:bg-brand/10 transition-colors"
          >
            Calcular el movimiento de tierra →
          </a>
          <ExportarPDF variante="secundario" etiqueta="Descargar demanda (PDF)" construir={construirPDF} />
          <a
            href={`https://wa.me/573113650567?text=${encodeURIComponent(
              `Hola, quiero diseñar el agua para mi hato. Con la calculadora del sitio obtuve ${nf1.format(m3Dia)} m³/día para ${nf0.format(cabezas)} animales y ${nf0.format(volumen)} m³ para ${nf0.format(dias)} días de autonomía.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center w-full px-6 py-4 bg-brand text-surface rounded-full font-semibold text-sm hover:bg-brand-hover transition-all duration-200 hover:shadow-glow"
          >
            Solicitar diseño real
          </a>
          <Note>Estimación preliminar: no reemplaza un diseño técnico Keyline.</Note>
        </aside>
      </div>
    </ToolFrame>
  )
}
