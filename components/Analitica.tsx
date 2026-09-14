'use client'

import { useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { climateData, DEFAULT_RUNOFF_CN, MONTH_LABELS_ES } from '@/lib/climateData'
import { scsCnMonthlyRunoffMm } from '@/lib/hydrology'

const BLUE = '#38bdf8'
const GREEN = '#95C11F'
const AMBER = '#fbbf24'
const RED = '#f87171'
const PURPLE = '#c084fc'

const WET_MONTHS = new Set([4, 5, 6, 7, 8, 9]) // Mayo–Octubre

const climate = climateData.baranoa

const nf1 = (v: number) => v.toLocaleString('es-CO', { maximumFractionDigits: 1 })
const nf0 = (v: number) => v.toLocaleString('es-CO', { maximumFractionDigits: 0 })

// ── Íconos vectoriales (reemplazan emoji — legibles en lectores de pantalla,
// consistentes con el tono técnico del resto del sitio) ──
function LeafIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 13C3 7 7 3 13 3C13 9 9 13 3 13Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.5 12.5C5.5 9.5 7.5 7.5 10 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CloudRainIcon({ className }: { className?: string }) {
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

function SunIcon({ className }: { className?: string }) {
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

function ScaleIcon({ className }: { className?: string }) {
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

function DropletIcon({ className }: { className?: string }) {
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

const subTabs = [
  { id: 'precipitacion', Icon: CloudRainIcon, label: 'Precipitación' },
  { id: 'eto', Icon: SunIcon, label: 'ETo & Clima' },
  { id: 'balance', Icon: ScaleIcon, label: 'Balance Hídrico' },
  { id: 'escorrentia', Icon: DropletIcon, label: 'Escorrentía Keyline' },
] as const

type SubTabId = (typeof subTabs)[number]['id']

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: { value: number; dataKey: string }[]
  label?: string
  unit: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#1D1D1B] px-3 py-2 shadow-xl">
      <div className="font-mono text-[10px] text-white/40 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="font-mono text-sm text-white">
          {nf1(p.value)} {unit}
        </div>
      ))}
    </div>
  )
}

function SummaryCard({
  border,
  eyebrow,
  value,
  caption,
}: {
  border: string
  eyebrow: string
  value: string
  caption: string
}) {
  return (
    <div
      className="p-5 rounded-2xl border border-white/[0.07] border-t-4 bg-[#2C2C2A]"
      style={{ borderTopColor: border }}
    >
      <div className="font-mono text-[9px] text-white/30 tracking-widest uppercase mb-3">{eyebrow}</div>
      <div className="font-display text-2xl font-semibold text-white mb-1.5 leading-none">{value}</div>
      <div className="text-white/35 text-[12px] leading-snug">{caption}</div>
    </div>
  )
}

export default function Analitica() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [activeTab, setActiveTab] = useState<SubTabId>('precipitacion')
  const [selectedYear, setSelectedYear] = useState<'avg' | number>('avg')

  const monthlyPrecipData = useMemo(
    () => MONTH_LABELS_ES.map((label, i) => ({ month: label, mm: climate.monthlyPrecipAvg[i] })),
    []
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

  const monthlyEtoData = useMemo(
    () => MONTH_LABELS_ES.map((label, i) => ({ month: label, p: climate.monthlyPrecipAvg[i], eto: climate.monthlyEtoAvg[i] })),
    []
  )

  const etoStats = useMemo(() => {
    const withLabel = MONTH_LABELS_ES.map((label, i) => ({ label, mm: climate.monthlyEtoAvg[i] }))
    return {
      max: withLabel.reduce((a, b) => (b.mm > a.mm ? b : a)),
      min: withLabel.reduce((a, b) => (b.mm < a.mm ? b : a)),
    }
  }, [])

  const balanceData = useMemo(
    () =>
      MONTH_LABELS_ES.map((label, i) => {
        const p = climate.monthlyPrecipAvg[i]
        const eto = climate.monthlyEtoAvg[i]
        const pEfectivaM3 = p * climate.areaHa * 10
        const etoM3 = eto * climate.areaHa * 10
        return {
          month: label,
          p,
          eto,
          deficit: p - eto,
          pEfectivaM3,
          coberturaPct: etoM3 > 0 ? (pEfectivaM3 / etoM3) * 100 : 0,
        }
      }),
    []
  )

  const balanceStats = useMemo(
    () => ({
      deficitAnual: climate.kpis.precipMmYear - climate.kpis.etoMmYear,
      surplusMonths: balanceData.filter((d) => d.deficit >= 0).length,
      closest: balanceData.reduce((a, b) => (Math.abs(b.deficit) < Math.abs(a.deficit) ? b : a)),
      precipEfectivaM3: climate.kpis.precipMmYear * climate.areaHa * 10,
    }),
    [balanceData]
  )

  const escorrentiaData = useMemo(() => {
    const monthlyQmm = scsCnMonthlyRunoffMm(climate.monthlyPrecipAvg, DEFAULT_RUNOFF_CN)
    return MONTH_LABELS_ES.map((label, i) => ({ month: label, m3: Math.round(monthlyQmm[i] * climate.areaHa * 10) }))
  }, [])

  const escorrentiaStats = useMemo(() => {
    const etoM3Year = climate.kpis.etoMmYear * climate.areaHa * 10
    return {
      max: escorrentiaData.reduce((a, b) => (b.m3 > a.m3 ? b : a)),
      coberturaPct: etoM3Year > 0 ? (climate.kpis.runoffM3Year / etoM3Year) * 100 : 0,
    }
  }, [escorrentiaData])

  return (
    <section id="analitica" className="py-32 lg:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none tech-grid" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div ref={ref} className="mb-12 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="w-7 h-px bg-[#95C11F]/60" />
            <span className="font-mono text-[#95C11F] text-[10px] tracking-[0.32em] uppercase">
              Analítica de Campo
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,6vw,4.8rem)] font-semibold leading-tight mb-6"
          >
            El clima, {' '}
            <em className="text-[#95C11F] not-italic">medido</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/45 leading-relaxed"
          >
            Series históricas de precipitación, evapotranspiración y escorrentía por
            finca — la base de datos sobre la que diseñamos cada sistema Keyline.
          </motion.p>
        </div>

        {/* ── Dashboard climático ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Barra superior */}
          <div className="p-7 lg:p-8 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#0B1B2F] to-[#13263D] mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-display text-2xl font-semibold text-white flex items-center gap-2.5">
                    <LeafIcon className="text-[#95C11F] shrink-0" />
                    Dashboard Climático — {climate.name}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-[#95C11F]/15 border border-[#95C11F]/30 text-[#95C11F] text-[10px] tracking-[0.15em] uppercase font-medium">
                    Diseño Keyline
                  </span>
                </div>
                <div className="font-mono text-white/40 text-[11px] tracking-wide">
                  {climate.location} · {climate.coords} · {climate.elevation} · Finca {climate.areaHa} ha
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 shrink-0">
                {[
                  { label: 'Precipitación', value: `${nf1(climate.kpis.precipMmYear)}`, unit: 'mm/año' },
                  { label: 'ETo (FAO-56)', value: `${nf0(climate.kpis.etoMmYear)}`, unit: 'mm/año' },
                  { label: 'Escorrentía', value: `${nf0(climate.kpis.runoffM3Year)}`, unit: 'm³/año' },
                  { label: 'Área total finca', value: `${climate.areaHa}`, unit: 'ha' },
                ].map((kpi) => (
                  <div key={kpi.label}>
                    <div className="font-mono text-lg text-[#95C11F] font-semibold leading-none mb-1.5">
                      {kpi.value}
                      <span className="text-white/30 text-[10px] ml-1">{kpi.unit}</span>
                    </div>
                    <div className="text-white/35 text-[11px] tracking-wide">{kpi.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-nav */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {subTabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-full text-[13px] tracking-wide transition-all duration-200 border ${
                    isActive
                      ? 'bg-[#95C11F]/[0.1] border-[#95C11F]/30 text-[#95C11F]'
                      : 'border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/15'
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
              {/* Tarjetas resumen */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <SummaryCard
                  border={BLUE}
                  eyebrow="Precipitación anual media"
                  value={`${nf1(climate.kpis.precipMmYear)} mm/año`}
                  caption={`Serie histórica ${climate.period}`}
                />
                <SummaryCard
                  border={GREEN}
                  eyebrow="Mes más lluvioso"
                  value={climate.wettestMonth.label}
                  caption={`${nf1(climate.wettestMonth.mm)} mm promedio · lidera el régimen bimodal`}
                />
                <SummaryCard
                  border={AMBER}
                  eyebrow="Máximo anual histórico"
                  value={`${nf0(climate.historicMaxAnnual.mm)} mm`}
                  caption={`Año ${climate.historicMaxAnnual.year} · ${climate.historicMaxAnnual.note}`}
                />
                <SummaryCard
                  border={RED}
                  eyebrow="Mínimo anual histórico"
                  value={`${nf0(climate.historicMinAnnual.mm)} mm`}
                  caption={`Año ${climate.historicMinAnnual.year} · ${climate.historicMinAnnual.note}`}
                />
                <SummaryCard
                  border={PURPLE}
                  eyebrow="Máx. diario histórico"
                  value={`${nf0(climate.historicMaxDaily.mm)} mm en un día`}
                  caption={`${climate.historicMaxDaily.date} · ${climate.historicMaxDaily.note}`}
                />
              </div>

              {/* Controles */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <label className="flex items-center gap-3 text-white/50 text-sm">
                  Año para detalle mensual:
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value === 'avg' ? 'avg' : Number(e.target.value))}
                    className="px-3 py-2 rounded-lg bg-[#1D1D1B] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#95C11F]/50 focus:ring-2 focus:ring-[#95C11F]/20"
                  >
                    <option value="avg">— Promedio histórico —</option>
                    {climate.annualSeries.map((r) => (
                      <option key={r.year} value={r.year}>
                        {r.year}
                      </option>
                    ))}
                  </select>
                </label>

                <span className="font-mono text-[11px] text-white/35 tracking-wide px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                  Estación: {climate.station}
                </span>
                <span className="font-mono text-[11px] text-white/35 tracking-wide px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                  Período: {climate.period}
                </span>
              </div>

              {/* Gráficos superiores */}
              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                <div className="p-6 lg:p-7 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: BLUE }} />
                    Precipitación mensual
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyPrecipData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 120]}
                          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTooltip unit="mm" />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="mm" fill={BLUE} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-white/25 text-[11px] mt-3">
                    Régimen bimodal con pico principal en agosto–septiembre.
                  </p>
                </div>

                <div className="p-6 lg:p-7 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: GREEN }} />
                    Tendencia anual ({climate.period})
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={annualTrendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                          tickLine={false}
                          interval={2}
                        />
                        <YAxis
                          domain={[0, 1800]}
                          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTooltip unit="mm/año" />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                        <ReferenceLine
                          y={climate.kpis.precipMmYear}
                          stroke={RED}
                          strokeDasharray="4 4"
                          strokeOpacity={0.6}
                        />
                        <Line
                          type="monotone"
                          dataKey="mm"
                          stroke={GREEN}
                          strokeWidth={2}
                          dot={{ r: 2.5, fill: GREEN }}
                          activeDot={{ r: 4.5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-5 mt-3">
                    <span className="flex items-center gap-1.5 text-white/25 text-[11px]">
                      <span className="w-2 h-2 rounded-full" style={{ background: GREEN }} /> Precipitación anual
                    </span>
                    <span className="flex items-center gap-1.5 text-white/25 text-[11px]">
                      <span className="w-2 h-0.5" style={{ background: RED }} /> Promedio histórico
                    </span>
                  </div>
                </div>
              </div>

              {/* Gráfico inferior */}
              <div className="p-6 lg:p-7 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]">
                <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: AMBER }} />
                  Precipitación máxima diaria por mes
                  <span className="text-white/25 normal-case tracking-normal ml-2">
                    ({selectedYear === 'avg' ? 'promedio histórico' : selectedYear})
                  </span>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={maxDailyData}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, (max: number) => Math.max(120, Math.ceil(max / 10) * 10)]}
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip unit="mm" />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="mm" radius={[4, 4, 0, 0]}>
                        {maxDailyData.map((entry) => (
                          <Cell key={entry.month} fill={entry.wet ? BLUE : GREEN} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eto' && (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SummaryCard
                  border={AMBER}
                  eyebrow="ETo anual (FAO-56 PM)"
                  value={`${nf0(climate.kpis.etoMmYear)} mm/año`}
                  caption={climate.etoSource}
                />
                <SummaryCard
                  border={RED}
                  eyebrow="Mes de mayor demanda"
                  value={etoStats.max.label}
                  caption={`${nf1(etoStats.max.mm)} mm · pico de evapotranspiración`}
                />
                <SummaryCard
                  border={BLUE}
                  eyebrow="Mes de menor demanda"
                  value={etoStats.min.label}
                  caption={`${nf1(etoStats.min.mm)} mm · mínima del año`}
                />
                <SummaryCard
                  border={PURPLE}
                  eyebrow="Cobertura de precipitación"
                  value={`${nf0((climate.kpis.precipMmYear / climate.kpis.etoMmYear) * 100)}%`}
                  caption="de la demanda evapotranspirativa anual"
                />
              </div>

              <div className="p-6 lg:p-7 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]">
                <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: AMBER }} />
                  Precipitación vs. ETo mensual
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyEtoData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                        tickLine={false}
                      />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip unit="mm" />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="p" fill={BLUE} radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="eto" stroke={RED} strokeWidth={2} dot={{ r: 2.5, fill: RED }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-5 mt-3">
                  <span className="flex items-center gap-1.5 text-white/25 text-[11px]">
                    <span className="w-2 h-2 rounded-full" style={{ background: BLUE }} /> Precipitación
                  </span>
                  <span className="flex items-center gap-1.5 text-white/25 text-[11px]">
                    <span className="w-2 h-0.5" style={{ background: RED }} /> ETo (FAO-56 PM)
                  </span>
                </div>
                <p className="text-white/25 text-[11px] mt-3">
                  ETo estimada con climatología satelital NASA POWER (2001–2020, resolución ~50 km) sobre las
                  coordenadas de la finca — no reemplaza una estación meteorológica en sitio.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'balance' && (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SummaryCard
                  border={RED}
                  eyebrow="Déficit hídrico anual"
                  value={`${nf0(balanceStats.deficitAnual)} mm/año`}
                  caption={`P (${nf0(climate.kpis.precipMmYear)}) − ETo (${nf0(climate.kpis.etoMmYear)})`}
                />
                <SummaryCard
                  border={GREEN}
                  eyebrow="Meses con superávit"
                  value={`${balanceStats.surplusMonths}`}
                  caption="meses del año con P > ETo"
                />
                <SummaryCard
                  border={BLUE}
                  eyebrow="Mes más cercano al equilibrio"
                  value={balanceStats.closest.month}
                  caption={`${nf0(balanceStats.closest.deficit)} mm de déficit`}
                />
                <SummaryCard
                  border={AMBER}
                  eyebrow="Precipitación efectiva anual"
                  value={`${nf0(balanceStats.precipEfectivaM3)} m³`}
                  caption={`sobre ${climate.areaHa} ha de finca`}
                />
              </div>

              <div className="p-6 lg:p-7 rounded-2xl border border-white/[0.07] bg-[#2C2C2A] mb-5">
                <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                  <ScaleIcon className="text-white/40 shrink-0" />
                  Déficit hídrico mensual (P − ETo)
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={balanceData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                        tickLine={false}
                      />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip unit="mm" />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                      <Bar dataKey="deficit" radius={[4, 4, 0, 0]}>
                        {balanceData.map((d) => (
                          <Cell key={d.month} fill={d.deficit >= 0 ? GREEN : RED} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 lg:p-7 rounded-2xl border border-white/[0.07] bg-[#2C2C2A] overflow-x-auto">
                <div className="font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                  Balance hídrico mensual detallado
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/30 text-[11px] uppercase tracking-wide border-b border-white/[0.08]">
                      <th className="text-left py-2 font-normal">Mes</th>
                      <th className="text-right py-2 font-normal">P (mm)</th>
                      <th className="text-right py-2 font-normal">ETo (mm)</th>
                      <th className="text-right py-2 font-normal">Déficit (mm)</th>
                      <th className="text-right py-2 font-normal">P efectiva (m³)</th>
                      <th className="text-right py-2 font-normal">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceData.map((d) => (
                      <tr key={d.month} className="border-b border-white/[0.04] text-white/60">
                        <td className="py-2">{d.month}</td>
                        <td className="text-right py-2 font-mono">{nf1(d.p)}</td>
                        <td className="text-right py-2 font-mono">{nf1(d.eto)}</td>
                        <td className={`text-right py-2 font-mono ${d.deficit >= 0 ? 'text-[#95C11F]' : 'text-red-400/80'}`}>
                          {nf0(d.deficit)}
                        </td>
                        <td className="text-right py-2 font-mono">{nf0(d.pEfectivaM3)}</td>
                        <td className="text-right py-2 font-mono">{nf1(d.coberturaPct)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-white/25 text-[11px] leading-relaxed">
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
                  border={GREEN}
                  eyebrow="Escorrentía anual (CN)"
                  value={`${nf0(climate.kpis.runoffM3Year)} m³/año`}
                  caption={`Método SCS-CN, CN=${DEFAULT_RUNOFF_CN} · mismo cálculo que /herramientas`}
                />
                <SummaryCard
                  border={BLUE}
                  eyebrow="Cobertura de la demanda ETo"
                  value={`${nf1(escorrentiaStats.coberturaPct)}%`}
                  caption="del volumen ETo anual capturable en reservorios"
                />
                <SummaryCard
                  border={AMBER}
                  eyebrow="Mes de mayor escorrentía"
                  value={escorrentiaStats.max.month}
                  caption={`${nf0(escorrentiaStats.max.m3)} m³`}
                />
                <SummaryCard border={PURPLE} eyebrow="Área de captación" value={`${climate.areaHa} ha`} caption="superficie total de la finca" />
              </div>

              <div className="p-6 lg:p-7 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]">
                <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                  <DropletIcon className="text-white/40 shrink-0" />
                  Escorrentía capturable por mes
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={escorrentiaData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                        tickLine={false}
                      />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip unit="m³" />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="m3" fill={GREEN} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-white/25 text-[11px] mt-3">
                  Estimada con el método del Número de Curva (SCS-CN, CN={DEFAULT_RUNOFF_CN}) sobre la
                  precipitación mensual — el mismo método unificado que usa la calculadora de /herramientas.
                </p>
              </div>
            </div>
          )}

          <p className="mt-6 text-white/20 text-[11px] text-center leading-relaxed">
            Proyecto: {climate.name} — más proyectos próximamente. Precipitación: estación IDEAM Montebello ·
            ETo: NASA POWER + FAO-56 Penman-Monteith · Escorrentía: método SCS-CN (CN={DEFAULT_RUNOFF_CN}).
            La serie histórica anual (1997–2025) sigue pendiente de control de calidad.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
