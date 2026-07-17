'use client'

import { useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { climateData, MONTH_LABELS_ES } from '@/lib/climateData'

const BLUE = '#38bdf8'
const GREEN = '#95C11F'
const AMBER = '#fbbf24'
const RED = '#f87171'
const PURPLE = '#c084fc'

const WET_MONTHS = new Set([4, 5, 6, 7, 8, 9]) // Mayo–Octubre

const climate = climateData.baranoa

const nf1 = (v: number) => v.toLocaleString('es-CO', { maximumFractionDigits: 1 })
const nf0 = (v: number) => v.toLocaleString('es-CO', { maximumFractionDigits: 0 })

const subTabs = [
  { id: 'precipitacion', emoji: '🌧️', label: 'Precipitación' },
  { id: 'eto', emoji: '🟠', label: 'ETo & Clima' },
  { id: 'balance', emoji: '⚖️', label: 'Balance Hídrico' },
  { id: 'escorrentia', emoji: '💧', label: 'Escorrentía Keyline' },
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

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="py-24 px-6 rounded-2xl border border-dashed border-white/[0.1] text-center">
      <div className="text-white/30 text-sm leading-relaxed max-w-md mx-auto">
        <span className="text-[#95C11F]/60">{label}</span> está en construcción. Pronto podrás ver esta
        vista con datos calibrados de campo.
      </div>
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
                  <h3 className="font-display text-2xl font-semibold text-white">
                    🌿 Dashboard Climático — {climate.name}
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
                  <span className="mr-1.5">{tab.emoji}</span>
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
                  <div className="font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                    🔵 Precipitación mensual
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
                  <div className="font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                    🟢 Tendencia anual ({climate.period})
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
                <div className="font-mono text-[11px] text-white/40 tracking-wide uppercase mb-4">
                  🟠 Precipitación máxima diaria por mes
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

          {activeTab === 'eto' && <ComingSoon label="ETo & Clima" />}
          {activeTab === 'balance' && <ComingSoon label="Balance Hídrico" />}
          {activeTab === 'escorrentia' && <ComingSoon label="Escorrentía Keyline" />}

          <p className="mt-6 text-white/20 text-[11px] text-center">
            Proyecto: {climate.name} · más proyectos y vista general próximamente — datos ilustrativos
            pendientes de calibración con la serie histórica oficial.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
