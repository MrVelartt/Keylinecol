'use client'

import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { Accent } from '@/components/ui/SectionHeader'
import ChartFrame from '@/components/charts/ChartFrame'
import { areaFill, barCursor, gridProps, lineCursor, series, xAxisProps, yAxisProps } from '@/lib/chart-theme'
import { totalSemestre, type ModoCronograma } from '@/lib/calculos/inversion'
import { CAPAS } from '@/lib/calculos/predial'
import { cop, copC, nf, nf1 } from '../fmt'
import { Card, Grid, Num, NumField, PanelHeader, SelectField, Stat, Stats, Table, type PanelProps } from '../ui'

const MODOS: { value: ModoCronograma; label: string }[] = [
  { value: 'escala', label: 'Escala de permanencia (recomendado)' },
  { value: 'lineal', label: 'Distribución lineal' },
  { value: 'carga-inicial', label: 'Carga inicial — 60 % en el primer año' },
]

type Fila = { sem: string; total: number; acumulado: number; capas: { nombre: string; valor: number }[] }

function TooltipSemestre({ active, payload, acumulado }: { active?: boolean; payload?: { payload: Fila }[]; acumulado: boolean }) {
  if (!active || !payload?.length) return null
  const f = payload[0].payload
  return (
    <div className="rounded-lg border border-subtle bg-surface-raised px-3 py-2 shadow-xl font-mono min-w-[200px]">
      <div className="text-[10px] text-mono mb-1">{acumulado ? `Acumulado al ${f.sem}` : `Semestre ${f.sem.slice(1)}`}</div>
      <div className="text-sm text-primary mb-1">{cop(acumulado ? f.acumulado : f.total)}</div>
      {!acumulado &&
        f.capas.map((c) => (
          <div key={c.nombre} className="flex justify-between gap-4 text-[11px] text-secondary">
            <span>{c.nombre}</span>
            <span className="text-primary">{copC(c.valor)}</span>
          </div>
        ))}
    </div>
  )
}

export default function Inversion({ s, r, set }: PanelProps) {
  const [acumulado, setAcumulado] = useState(false)
  const [verTabla, setVerTabla] = useState(false)
  const cr = r.cronograma
  const n = cr.semestres.length
  const anios = Math.ceil(n / 2)
  const haInt = s.finca.areaIntervenirHa
  const factor = r.total > 0 ? cr.total / r.total : 1

  let ac = 0
  const filas: Fila[] = cr.semestres.map((sem, k) => {
    const total = totalSemestre(sem)
    ac += total
    return {
      sem: `S${k + 1}`,
      total,
      acumulado: ac,
      capas: cr.items.filter((i) => sem[i.k] > 0).map((i) => ({ nombre: i.nombre, valor: sem[i.k] })),
    }
  })

  const capMillones = Math.round(cr.capacidad / 1e6)
  const sliderMax = Math.max(100, Math.ceil(cr.total / 1e6))

  return (
    <>
      <PanelHeader
        eyebrow="Resultado · 09"
        title={
          <>
            Inversión por <Accent>semestres</Accent>
          </>
        }
      >
        Cuántos semestres toma implementar el diseño según la capacidad de inversión, y en qué orden entra cada capa de la escala
        de permanencia.
      </PanelHeader>

      <div className="space-y-5">
        <Stats>
          <Stat accent k="Inversión total" v={copC(cr.total)} sub="obra, AIU y contingencia incluidos" />
          <Stat k="Semestres necesarios" v={nf(n)} sub={n === 1 ? 'una sola campaña' : `≈ ${anios} año${anios > 1 ? 's' : ''} de ejecución`} />
          <Stat k="Por hectárea intervenida" v={cop(haInt > 0 ? cr.total / haInt : 0)} sub={`${nf1(haInt)} ha`} />
          <Stat k="Capacidad por semestre" v={copC(cr.capacidad)} sub="ajustable abajo" />
          <Stat k="Honorarios de diseño" v={copC(r.diseno)} sub="no incluidos en la cotización" />
        </Stats>

        <Card title="Parámetros del cronograma">
          <Grid cols={3}>
            <div>
              <NumField
                label="Inversión total de obra (editable)"
                unit="COP"
                step={1_000_000}
                value={Math.round(cr.total)}
                onChange={(v) => set((d) => void (d.inversion.totalManual = v))}
              />
              {s.inversion.totalManual !== null && (
                <button
                  type="button"
                  onClick={() => set((d) => void (d.inversion.totalManual = null))}
                  className="mt-1.5 text-[12px] text-brand hover:underline"
                >
                  Usar el total calculado
                </button>
              )}
            </div>
            <NumField
              label="Capacidad de inversión por semestre"
              unit="COP"
              step={1_000_000}
              value={Math.round(cr.capacidad)}
              onChange={(v) => set((d) => void (d.inversion.capacidad = v))}
            />
            <SelectField label="Orden de ejecución" value={s.inversion.modo} options={MODOS} onChange={(v) => set((d) => void (d.inversion.modo = v))} />
          </Grid>
          <div className="flex items-center gap-4 mt-5">
            <label htmlFor="cap-slider" className="text-mono text-[12px] whitespace-nowrap">
              Capacidad por semestre
            </label>
            <input
              id="cap-slider"
              type="range"
              min={1}
              max={sliderMax}
              value={Math.min(sliderMax, Math.max(1, capMillones))}
              onChange={(e) => set((d) => void (d.inversion.capacidad = Number(e.target.value) * 1e6))}
              className="flex-1 accent-brand cursor-pointer"
            />
            <span className="font-mono-data text-primary text-sm min-w-[110px] text-right">{copC(cr.capacidad)}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-5" role="group" aria-label="Vista de la gráfica">
            {[
              { on: !acumulado, label: 'Por semestre', click: () => setAcumulado(false) },
              { on: acumulado, label: 'Acumulado', click: () => setAcumulado(true) },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                aria-pressed={b.on}
                onClick={b.click}
                className={`px-3 py-1.5 rounded-lg border text-[13px] transition-colors ${
                  b.on ? 'border-brand/40 bg-brand/10 text-brand' : 'border-strong text-secondary hover:border-emphasis'
                }`}
              >
                {b.label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={verTabla}
              onClick={() => setVerTabla((v) => !v)}
              className={`px-3 py-1.5 rounded-lg border text-[13px] transition-colors ${
                verTabla ? 'border-brand/40 bg-brand/10 text-brand' : 'border-strong text-secondary hover:border-emphasis'
              }`}
            >
              {verTabla ? 'Ocultar tabla' : 'Ver tabla'}
            </button>
          </div>
        </Card>

        <ChartFrame
          title={acumulado ? 'Inversión acumulada' : 'Inversión por semestre'}
          height={300}
          note={
            acumulado
              ? `Capital comprometido al cierre de cada semestre hasta completar ${copC(cr.total)}.`
              : 'Cada barra es un semestre. Pase el cursor para ver qué capas de la escala de permanencia se ejecutan en él.'
          }
        >
          {acumulado ? (
            <AreaChart data={filas} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="sem" {...xAxisProps} />
              <YAxis {...yAxisProps} width={72} tickFormatter={(v: number) => copC(v)} />
              <Tooltip cursor={lineCursor} content={<TooltipSemestre acumulado />} />
              <Area
                type="monotone"
                dataKey="acumulado"
                name="Acumulado"
                stroke={series.water}
                strokeWidth={2}
                fill={areaFill('water')}
                dot={{ r: 4, fill: series.water, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={filas} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="sem" {...xAxisProps} />
              <YAxis {...yAxisProps} width={72} tickFormatter={(v: number) => copC(v)} />
              <Tooltip cursor={barCursor} content={<TooltipSemestre acumulado={false} />} />
              <Bar dataKey="total" name="Inversión" fill={series.water} radius={[4, 4, 0, 0]} maxBarSize={56} />
            </BarChart>
          )}
        </ChartFrame>

        {verTabla && (
          <Card title="Detalle por semestre">
            <Table minWidth={Math.max(640, 140 + cr.items.length * 110)}>
              <thead>
                <tr>
                  <th>Semestre</th>
                  {cr.items.map((i) => (
                    <th key={i.k} className="!text-right">
                      {i.nombre}
                    </th>
                  ))}
                  <th className="!text-right">Total</th>
                  <th className="!text-right">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {cr.semestres.map((sem, k) => (
                  <tr key={k}>
                    <td className="text-primary">{filas[k].sem}</td>
                    {cr.items.map((i) => (
                      <Num key={i.k} muted={!sem[i.k]}>
                        {sem[i.k] ? copC(sem[i.k]) : '—'}
                      </Num>
                    ))}
                    <Num>{copC(filas[k].total)}</Num>
                    <Num>{copC(filas[k].acumulado)}</Num>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        <Card
          title="Resumen de la cotización"
          hint="Los honorarios de diseño quedan por fuera del total: se cotizan como servicio profesional aparte."
        >
          <Table minWidth={520}>
            <thead>
              <tr>
                <th className="w-14">Cap.</th>
                <th>Capítulo — escala de permanencia</th>
                <th className="!text-right">Valor</th>
                <th className="!text-right w-20">%</th>
              </tr>
            </thead>
            <tbody>
              {CAPAS.map((c) => {
                const v = r.capas[c.k]
                return (
                  <tr key={c.k}>
                    <td className="font-mono text-mono">{c.idx}</td>
                    <td className="text-secondary">{c.nombre}</td>
                    <Num>{cop(v)}</Num>
                    <Num muted>{r.subtotal > 0 ? nf1((v / r.subtotal) * 100) : 0} %</Num>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td />
                <td>Subtotal de obra</td>
                <Num>{cop(r.subtotal)}</Num>
                <td />
              </tr>
              <tr>
                <td />
                <td className="!font-normal !text-secondary">AIU {nf(s.cotizacion.aiuPct)} %</td>
                <Num>{cop(r.aiu)}</Num>
                <td />
              </tr>
              <tr>
                <td />
                <td className="!font-normal !text-secondary">Contingencia {nf(s.cotizacion.contingenciaPct)} %</td>
                <Num>{cop(r.contingencia)}</Num>
                <td />
              </tr>
              <tr>
                <td />
                <td className="!text-brand">Total cotizado (sin valor del diseño)</td>
                <td className="text-right font-mono-data whitespace-nowrap !text-brand">{cop(r.total)}</td>
                <td />
              </tr>
              {Math.abs(factor - 1) > 0.001 && (
                <tr>
                  <td />
                  <td className="!font-normal !text-signal-demand">Total ajustado a mano para el cronograma</td>
                  <td className="text-right font-mono-data whitespace-nowrap !text-signal-demand">{cop(cr.total)}</td>
                  <td />
                </tr>
              )}
              <tr>
                <td />
                <td className="!font-normal !text-mono">Diseño keyline y estudios de ingeniería — se cotiza por separado</td>
                <Num muted>{cop(r.diseno)}</Num>
                <td />
              </tr>
            </tfoot>
          </Table>
        </Card>
      </div>
    </>
  )
}
