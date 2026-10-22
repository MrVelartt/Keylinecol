'use client'

import { useMemo, useRef, useState, type ComponentType } from 'react'
import { motion, useInView } from 'framer-motion'
import { Bar, BarChart, Cell, CartesianGrid, ComposedChart, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { proyectos, MONTH_LABELS_ES } from '@/data/proyectos'
import { balanceHidrico } from '@/lib/calculos/balance'
import { SUELO_TEXTURA_LABEL, CONFIABILIDAD_LABEL } from '@/lib/calculos/escorrentia'
import {
  series,
  xAxisProps,
  yAxisProps,
  gridProps,
  barCursor,
  lineCursor,
  zeroLine,
  neutralLine,
  axisTickSmall,
} from '@/lib/chart-theme'
import ChartFrame from '@/components/charts/ChartFrame'
import ChartTooltip from '@/components/charts/ChartTooltip'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'
import ExportarPDF from '@/components/pdf/ExportarPDF'
import { graficasAPng } from '@/lib/pdf/grafica'
import type { Bloque, Reporte } from '@/lib/pdf/reporte'

const WET_MONTHS = new Set([4, 5, 6, 7, 8, 9]) // Mayo–Octubre

const climate = proyectos.baranoa

const nf1 = (v: number) => v.toLocaleString('es-CO', { maximumFractionDigits: 1 })
const nf0 = (v: number) => v.toLocaleString('es-CO', { maximumFractionDigits: 0 })
const pct = (v: number) => `${nf1(v * 100)} %`

const CHART_MARGIN = { top: 8, right: 8, left: -16, bottom: 0 }

// ── Íconos vectoriales (legibles en lectores de pantalla, tono técnico) ──
type IconProps = { className?: string }

function LeafIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 13C3 7 7 3 13 3C13 9 9 13 3 13Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 12.5C5.5 9.5 7.5 7.5 10 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CloudRainIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 8.5a2.5 2.5 0 010-5 3.5 3.5 0 016.8-1.1A2.75 2.75 0 0111.5 8H4.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 10.5L5 12M8 10.5L7.5 12M10.5 10.5L10 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function SunIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.5 3.5L11.4 4.6M4.6 11.4L3.5 12.5M12.5 12.5L11.4 11.4M4.6 4.6L3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ScaleIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 2.5V13.5M8 2.5L3 4M8 2.5L13 4M3 4L1.2 7.4A2 2 0 004.8 7.4L3 4ZM13 4L11.2 7.4A2 2 0 0014.8 7.4L13 4ZM5 13.5H11"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DropletIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 2C8 2 12.5 7.2 12.5 10.2A4.5 4.5 0 013.5 10.2C3.5 7.2 8 2 8 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M8 13V3M8 3L4 7M8 3L12 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M8 3V13M8 13L4 9M8 13L12 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BoltIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M9 1.5L3.5 9H8L7 14.5L12.5 7H8L9 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 6.5H14M5 1.5V4M11 1.5V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function AreaIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M2 12L6 4L10 9L14 5V13H2V12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

const subTabs = [
  { id: 'precipitacion', Icon: CloudRainIcon, label: 'Precipitación' },
  { id: 'eto', Icon: SunIcon, label: 'ETo & Clima' },
  { id: 'balance', Icon: ScaleIcon, label: 'Balance Hídrico' },
  { id: 'escorrentia', Icon: DropletIcon, label: 'Escorrentía Keyline' },
] as const

type SubTabId = (typeof subTabs)[number]['id']

/**
 * Tarjeta KPI: todas con el mismo tratamiento. La diferencia la dan el ícono
 * y la jerarquía tipográfica, no el color.
 */
function SummaryCard({
  Icon,
  eyebrow,
  value,
  caption,
}: {
  Icon: ComponentType<IconProps>
  eyebrow: string
  value: string
  caption: string
}) {
  return (
    <div className="p-5 rounded-2xl border border-subtle bg-surface-raised">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="text-mono shrink-0" />
        <div className="font-mono text-[9px] text-mono tracking-widest uppercase">{eyebrow}</div>
      </div>
      <div className="font-display text-2xl font-semibold text-primary mb-1.5 leading-none">{value}</div>
      <div className="text-mono text-[12px] leading-snug">{caption}</div>
    </div>
  )
}

export default function Analitica() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [activeTab, setActiveTab] = useState<SubTabId>('precipitacion')
  const [selectedYear, setSelectedYear] = useState<'avg' | number>('avg')

  const balance = useMemo(
    () =>
      balanceHidrico({
        areaHa: climate.areaHa,
        precipAnualMm: climate.kpis.precipMmYear,
        etoAnualMm: climate.kpis.etoMmYear,
        cAnual: climate.runoff.cAnual,
        precipShape: climate.monthlyPrecipAvg,
        etoShape: climate.monthlyEtoAvg,
      }),
    []
  )

  const monthlyData = useMemo(
    () =>
      balance.meses.map((m) => ({
        month: MONTH_LABELS_ES[m.mes],
        p: m.p,
        eto: m.eto,
        deficit: m.deficit,
        pEfectivaM3: m.pEfectivaM3,
        coberturaPct: m.coberturaPct,
        m3: Math.round(m.escorrentiaM3),
      })),
    [balance]
  )

  const annualTrendData = useMemo(
    () => climate.annualSeries.map((r) => ({ year: String(r.year), mm: r.precipMm })),
    []
  )

  const maxDailyData = useMemo(() => {
    const selectedRecord =
      selectedYear === 'avg' ? null : climate.annualSeries.find((r) => r.year === selectedYear)
    const scaleFactor = selectedRecord ? selectedRecord.precipMm / climate.kpis.precipMmYear : 1
    return MONTH_LABELS_ES.map((label, i) => ({
      month: label,
      mm: Math.round(climate.monthlyMaxDailyAvg[i] * scaleFactor * 10) / 10,
      wet: WET_MONTHS.has(i),
    }))
  }, [selectedYear])

  const etoStats = useMemo(() => {
    const withLabel = MONTH_LABELS_ES.map((label, i) => ({ label, mm: climate.monthlyEtoAvg[i] }))
    return {
      max: withLabel.reduce((a, b) => (b.mm > a.mm ? b : a)),
      min: withLabel.reduce((a, b) => (b.mm < a.mm ? b : a)),
    }
  }, [])

  const closestToBalance = monthlyData.reduce((a, b) => (Math.abs(b.deficit) < Math.abs(a.deficit) ? b : a))
  const maxRunoffMonth = monthlyData.reduce((a, b) => (b.m3 > a.m3 ? b : a))
  const { runoff } = climate
  const vistaRef = useRef<HTMLDivElement>(null)

  const construirPDF = async (): Promise<Reporte> => {
    const graficas = await graficasAPng(vistaRef.current)
    const vista = subTabs.find((t) => t.id === activeTab)?.label ?? ''
    const bloques: Bloque[] = [
      {
        tipo: 'kpis',
        items: [
          { k: 'Precipitación', v: `${nf1(climate.kpis.precipMmYear)} mm/año`, sub: climate.period },
          { k: 'ETo (FAO-56)', v: `${nf0(climate.kpis.etoMmYear)} mm/año`, sub: climate.etoSource },
          { k: 'Escorrentía', v: `${nf0(climate.kpis.runoffM3Year)} m³/año`, sub: `C ${pct(runoff.cAnual)} · GUARDAR` },
        ],
      },
      {
        tipo: 'kv',
        filas: [
          ['Ubicación', `${climate.location} · ${climate.coords} · ${climate.elevation}`],
          ['Área de la finca', `${climate.areaHa} ha`],
          ['Estación', climate.station],
          ['Suelo · confiabilidad (tabla 2.3)', `${SUELO_TEXTURA_LABEL[runoff.suelo]} · ${CONFIABILIDAD_LABEL[runoff.confiabilidad]}`],
          ['Máximo anual histórico', `${nf0(climate.historicMaxAnnual.mm)} mm (${climate.historicMaxAnnual.year})`],
          ['Mínimo anual histórico', `${nf0(climate.historicMinAnnual.mm)} mm (${climate.historicMinAnnual.year})`],
          ['Máximo diario histórico', `${nf0(climate.historicMaxDaily.mm)} mm (${climate.historicMaxDaily.date})`],
        ],
      },
      ...(graficas.length ? [{ tipo: 'titulo' as const, texto: `Vista: ${vista}` }] : []),
      ...graficas.map((g) => ({ tipo: 'grafica' as const, png: g.png, ratio: g.ratio })),
      { tipo: 'titulo', texto: 'Balance mensual' },
      {
        tipo: 'tabla',
        head: ['Mes', 'Precipitación mm', 'ETo mm', 'P − ETo mm', 'Escorrentía m³', 'P / ETo'],
        body: monthlyData.map((m) => [m.month, nf1(m.p), nf1(m.eto), nf1(m.deficit), nf0(m.m3), `${nf1(m.coberturaPct)} %`]),
      },
      { tipo: 'titulo', texto: 'Precipitación anual' },
      {
        tipo: 'tabla',
        head: ['Año', 'Precipitación mm'],
        body: climate.annualSeries.map((r) => [String(r.year), nf0(r.precipMm)]),
      },
    ]
    return {
      herramienta: 'Analítica climática',
      titulo: `Dashboard climático — ${climate.name}`,
      subtitulo: 'Series históricas de precipitación, evapotranspiración y escorrentía (método GUARDAR).',
      cliente: climate.name,
      slug: 'analitica',
      disclaimer: 'Datos históricos de referencia de la estación indicada. La escorrentía usa el método oficial GUARDAR (Regrarians §2.19) con parámetros pendientes de validación en campo.',
      bloques,
    }
  }

  return (
    <section id="analitica" className="py-32 lg:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none tech-grid" />

      <div className="max-w-7xl mx-auto relative">
        <div ref={ref}>
          <SectionHeader
            inView={inView}
            as="h1"
            className="mb-12"
            eyebrow="Analítica de Campo"
            title={
              <>
                El clima, <Accent>medido</Accent>
              </>
            }
            subtitle="Series históricas de precipitación, evapotranspiración y escorrentía por finca — la base de datos sobre la que diseñamos cada sistema Keyline."
          />
        </div>

        <motion.div
          ref={vistaRef}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Barra superior del proyecto */}
          <div className="p-7 lg:p-8 rounded-2xl border border-subtle bg-surface-raised mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="font-display text-2xl font-semibold text-primary flex items-center gap-2.5">
                    <LeafIcon className="text-brand shrink-0" />
                    Dashboard Climático — {climate.name}
                  </h2>
                  <span className="px-2.5 py-1 rounded-full bg-brand-muted border border-brand/30 text-brand text-[10px] tracking-[0.15em] uppercase font-medium">
                    Diseño Keyline
                  </span>
                </div>
                <div className="font-mono text-mono text-[11px] tracking-wide">
                  {climate.location} · {climate.coords} · {climate.elevation} · Finca {climate.areaHa} ha
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 shrink-0">
                {[
                  { label: 'Precipitación', value: nf1(climate.kpis.precipMmYear), unit: 'mm/año' },
                  { label: 'ETo (FAO-56)', value: nf0(climate.kpis.etoMmYear), unit: 'mm/año' },
                  { label: 'Escorrentía', value: nf0(climate.kpis.runoffM3Year), unit: 'm³/año' },
                  { label: 'Área total finca', value: `${climate.areaHa}`, unit: 'ha' },
                ].map((kpi) => (
                  <div key={kpi.label}>
                    <div className="font-mono text-lg text-brand font-semibold leading-none mb-1.5">
                      {kpi.value}
                      <span className="text-mono text-[10px] ml-1">{kpi.unit}</span>
                    </div>
                    <div className="text-mono text-[11px] tracking-wide">{kpi.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <ExportarPDF
              className="mt-6 pt-6 border-t border-subtle sm:justify-end"
              conCliente={false}
              variante="secundario"
              etiqueta="Descargar informe (PDF)"
              construir={construirPDF}
            />
          </div>

          {/* Sub-nav */}
          <div className="flex flex-wrap items-center gap-2 mb-8" role="tablist" aria-label="Vistas del dashboard">
            {subTabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-full text-[13px] tracking-wide transition-all duration-200 border ${
                    isActive
                      ? 'bg-brand-muted border-brand/30 text-brand'
                      : 'border-subtle text-mono hover:text-secondary hover:border-strong'
                  }`}
                >
                  <tab.Icon className="inline-block mr-1.5 -mt-0.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'precipitacion' && (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <SummaryCard
                  Icon={CloudRainIcon}
                  eyebrow="Precipitación anual media"
                  value={`${nf1(climate.kpis.precipMmYear)} mm/año`}
                  caption={`Serie histórica ${climate.period}`}
                />
                <SummaryCard
                  Icon={CalendarIcon}
                  eyebrow="Mes más lluvioso"
                  value={climate.wettestMonth.label}
                  caption={`${nf1(climate.wettestMonth.mm)} mm promedio · lidera el régimen bimodal`}
                />
                <SummaryCard
                  Icon={ArrowUpIcon}
                  eyebrow="Máximo anual histórico"
                  value={`${nf0(climate.historicMaxAnnual.mm)} mm`}
                  caption={`Año ${climate.historicMaxAnnual.year} · ${climate.historicMaxAnnual.note}`}
                />
                <SummaryCard
                  Icon={ArrowDownIcon}
                  eyebrow="Mínimo anual histórico"
                  value={`${nf0(climate.historicMinAnnual.mm)} mm`}
                  caption={`Año ${climate.historicMinAnnual.year} · ${climate.historicMinAnnual.note}`}
                />
                <SummaryCard
                  Icon={BoltIcon}
                  eyebrow="Máx. diario histórico"
                  value={`${nf0(climate.historicMaxDaily.mm)} mm en un día`}
                  caption={`${climate.historicMaxDaily.date} · ${climate.historicMaxDaily.note}`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <label className="flex items-center gap-3 text-secondary text-sm">
                  Año para detalle mensual:
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value === 'avg' ? 'avg' : Number(e.target.value))}
                    className="px-3 py-2 rounded-lg bg-surface border border-subtle text-primary text-sm focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="avg">— Promedio histórico —</option>
                    {climate.annualSeries.map((r) => (
                      <option key={r.year} value={r.year}>
                        {r.year}
                      </option>
                    ))}
                  </select>
                </label>

                <span className="font-mono text-[11px] text-mono tracking-wide px-3 py-1.5 rounded-full border border-subtle bg-veil">
                  Estación: {climate.station}
                </span>
                <span className="font-mono text-[11px] text-mono tracking-wide px-3 py-1.5 rounded-full border border-subtle bg-veil">
                  Período: {climate.period}
                </span>
              </div>

              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                <ChartFrame
                  title="Precipitación mensual"
                  icon={<CloudRainIcon className="text-mono shrink-0" />}
                  note="Régimen bimodal con pico principal en agosto–septiembre."
                >
                  <BarChart data={monthlyData} margin={CHART_MARGIN}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="month" {...xAxisProps} />
                    <YAxis domain={[0, 120]} {...yAxisProps} />
                    <Tooltip content={<ChartTooltip unit="mm" />} cursor={barCursor} />
                    <Bar dataKey="p" name="Precipitación" fill={series.water} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartFrame>

                <ChartFrame
                  title={`Tendencia anual (${climate.period})`}
                  icon={<CalendarIcon className="text-mono shrink-0" />}
                  legend={[
                    { role: 'water', label: 'Precipitación anual' },
                    { role: 'neutral', label: 'Promedio histórico', dashed: true },
                  ]}
                >
                  <LineChart data={annualTrendData} margin={CHART_MARGIN}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="year" {...xAxisProps} tick={axisTickSmall} interval={2} />
                    <YAxis domain={[0, 1800]} {...yAxisProps} />
                    <Tooltip content={<ChartTooltip unit="mm/año" />} cursor={lineCursor} />
                    <ReferenceLine y={climate.kpis.precipMmYear} {...neutralLine} />
                    <Line
                      type="monotone"
                      dataKey="mm"
                      name="Precipitación"
                      stroke={series.water}
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: series.water }}
                      activeDot={{ r: 4.5 }}
                    />
                  </LineChart>
                </ChartFrame>
              </div>

              <ChartFrame
                height={240}
                title={
                  <>
                    Precipitación máxima diaria por mes
                    <span className="text-mono normal-case tracking-normal ml-2">
                      ({selectedYear === 'avg' ? 'promedio histórico' : selectedYear})
                    </span>
                  </>
                }
                icon={<BoltIcon className="text-mono shrink-0" />}
                note="Tono pleno: temporada de lluvias (may–oct). Tono atenuado: temporada seca."
              >
                <BarChart data={maxDailyData} margin={CHART_MARGIN}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" {...xAxisProps} />
                  <YAxis domain={[0, (max: number) => Math.max(120, Math.ceil(max / 10) * 10)]} {...yAxisProps} />
                  <Tooltip content={<ChartTooltip unit="mm" />} cursor={barCursor} />
                  <Bar dataKey="mm" name="Máx. diaria" radius={[4, 4, 0, 0]}>
                    {maxDailyData.map((entry) => (
                      <Cell key={entry.month} fill={series.water} fillOpacity={entry.wet ? 1 : 0.4} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartFrame>
            </div>
          )}

          {activeTab === 'eto' && (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SummaryCard
                  Icon={SunIcon}
                  eyebrow="ETo anual (FAO-56 PM)"
                  value={`${nf0(climate.kpis.etoMmYear)} mm/año`}
                  caption={climate.etoSource}
                />
                <SummaryCard
                  Icon={ArrowUpIcon}
                  eyebrow="Mes de mayor demanda"
                  value={etoStats.max.label}
                  caption={`${nf1(etoStats.max.mm)} mm · pico de evapotranspiración`}
                />
                <SummaryCard
                  Icon={ArrowDownIcon}
                  eyebrow="Mes de menor demanda"
                  value={etoStats.min.label}
                  caption={`${nf1(etoStats.min.mm)} mm · mínima del año`}
                />
                <SummaryCard
                  Icon={ScaleIcon}
                  eyebrow="Cobertura de precipitación"
                  value={`${nf0((climate.kpis.precipMmYear / climate.kpis.etoMmYear) * 100)}%`}
                  caption="de la demanda evapotranspirativa anual"
                />
              </div>

              <ChartFrame
                height={300}
                title="Precipitación vs. ETo mensual"
                icon={<SunIcon className="text-mono shrink-0" />}
                legend={[
                  { role: 'water', label: 'Precipitación' },
                  { role: 'demand', label: 'ETo (FAO-56 PM)' },
                ]}
                note="ETo estimada con climatología satelital NASA POWER (2001–2020, resolución ~50 km) sobre las coordenadas de la finca — no reemplaza una estación meteorológica en sitio."
              >
                <ComposedChart data={monthlyData} margin={CHART_MARGIN}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip content={<ChartTooltip unit="mm" />} cursor={barCursor} />
                  <Bar dataKey="p" name="Precipitación" fill={series.water} radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="eto"
                    name="ETo"
                    stroke={series.demand}
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: series.demand }}
                  />
                </ComposedChart>
              </ChartFrame>
            </div>
          )}

          {activeTab === 'balance' && (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SummaryCard
                  Icon={ScaleIcon}
                  eyebrow="Déficit hídrico anual"
                  value={`${nf0(balance.deficitAnualMm)} mm/año`}
                  caption={`P (${nf0(climate.kpis.precipMmYear)}) − ETo (${nf0(climate.kpis.etoMmYear)})`}
                />
                <SummaryCard
                  Icon={CalendarIcon}
                  eyebrow="Meses con superávit"
                  value={`${balance.mesesSuperavit}`}
                  caption="meses del año con P > ETo"
                />
                <SummaryCard
                  Icon={ArrowUpIcon}
                  eyebrow="Mes más cercano al equilibrio"
                  value={closestToBalance.month}
                  caption={`${nf0(closestToBalance.deficit)} mm de déficit`}
                />
                <SummaryCard
                  Icon={CloudRainIcon}
                  eyebrow="Precipitación efectiva anual"
                  value={`${nf0(balance.precipEfectivaM3)} m³`}
                  caption={`sobre ${climate.areaHa} ha de finca`}
                />
              </div>

              <ChartFrame
                height={240}
                className="mb-5"
                title="Déficit hídrico mensual (P − ETo)"
                icon={<ScaleIcon className="text-mono shrink-0" />}
                legend={[
                  { role: 'water', label: 'Superávit' },
                  { role: 'deficit', label: 'Déficit' },
                ]}
              >
                <BarChart data={monthlyData} margin={CHART_MARGIN}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip content={<ChartTooltip unit="mm" />} cursor={barCursor} />
                  <ReferenceLine y={0} {...zeroLine} />
                  <Bar dataKey="deficit" name="P − ETo" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((d) => (
                      <Cell key={d.month} fill={d.deficit >= 0 ? series.water : series.deficit} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartFrame>

              <div className="p-6 lg:p-7 rounded-2xl border border-subtle bg-surface-raised overflow-x-auto">
                <div className="font-mono text-[11px] text-mono tracking-wide uppercase mb-4">
                  Balance hídrico mensual detallado
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-mono text-[11px] uppercase tracking-wide border-b border-subtle">
                      <th className="text-left py-2 font-normal">Mes</th>
                      <th className="text-right py-2 font-normal">P (mm)</th>
                      <th className="text-right py-2 font-normal">ETo (mm)</th>
                      <th className="text-right py-2 font-normal">Déficit (mm)</th>
                      <th className="text-right py-2 font-normal">P efectiva (m³)</th>
                      <th className="text-right py-2 font-normal">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((d) => (
                      <tr key={d.month} className="border-b border-subtle text-secondary">
                        <td className="py-2">{d.month}</td>
                        <td className="text-right py-2 font-mono">{nf1(d.p)}</td>
                        <td className="text-right py-2 font-mono">{nf1(d.eto)}</td>
                        <td className={`text-right py-2 font-mono ${d.deficit >= 0 ? 'text-brand' : 'text-signal-deficit'}`}>
                          {nf0(d.deficit)}
                        </td>
                        <td className="text-right py-2 font-mono">{nf0(d.pEfectivaM3)}</td>
                        <td className="text-right py-2 font-mono">{nf1(d.coberturaPct)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-mono text-[11px] leading-relaxed">
                Déficit calculado contra la ETo de referencia (FAO-56) sobre el área total de la finca — no contra
                la ETc con coeficiente de cultivo (Kc) del área productiva, que daría un déficit menor y más
                realista. Pendiente afinar por tipo de cobertura/cultivo.
              </p>
            </div>
          )}

          {activeTab === 'escorrentia' && (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SummaryCard
                  Icon={DropletIcon}
                  eyebrow="Escorrentía anual (GUARDAR)"
                  value={`${nf0(climate.kpis.runoffM3Year)} m³/año`}
                  caption={`C anual = ${pct(runoff.cAnual)} (rango ${pct(runoff.cRango[0])}–${pct(runoff.cRango[1])}) · mismo cálculo que /herramientas`}
                />
                <SummaryCard
                  Icon={ScaleIcon}
                  eyebrow="Cobertura de la demanda ETo"
                  value={`${nf1(balance.coberturaEscorrentiaPct)}%`}
                  caption="del volumen ETo anual capturable en reservorios"
                />
                <SummaryCard
                  Icon={CalendarIcon}
                  eyebrow="Mes de mayor escorrentía"
                  value={maxRunoffMonth.month}
                  caption={`${nf0(maxRunoffMonth.m3)} m³`}
                />
                <SummaryCard Icon={AreaIcon} eyebrow="Área de captación" value={`${climate.areaHa} ha`} caption="superficie total de la finca" />
              </div>

              <ChartFrame
                height={260}
                title="Escorrentía capturable por mes"
                icon={<DropletIcon className="text-mono shrink-0" />}
                note={`Fórmula unificada, modo GUARDAR: V = 10 · C · A · P (Regrarians §2.19, tabla 2.3). Suelo: ${SUELO_TEXTURA_LABEL[runoff.suelo].toLowerCase()}, confiabilidad ${CONFIABILIDAD_LABEL[runoff.confiabilidad]} — el mismo método que usan las calculadoras de /herramientas.`}
              >
                <BarChart data={monthlyData} margin={CHART_MARGIN}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip content={<ChartTooltip unit="m³" format={nf0} />} cursor={barCursor} />
                  <Bar dataKey="m3" name="Escorrentía" fill={series.water} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartFrame>
            </div>
          )}

          <p className="mt-6 text-mono text-[11px] text-center leading-relaxed">
            Proyecto: {climate.name} — más proyectos próximamente. Precipitación: estación IDEAM Montebello ·
            ETo: NASA POWER + FAO-56 Penman-Monteith · Escorrentía: fórmula unificada GUARDAR (C anual{' '}
            {pct(runoff.cAnual)}). La serie histórica anual (1997–2025) sigue pendiente de control de calidad.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
