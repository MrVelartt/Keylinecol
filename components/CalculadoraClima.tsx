'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// ── Distribución mensual de referencia (patrón bimodal tropical, Caribe) ──
// Se reescala proporcionalmente a los totales anuales que ingrese el usuario.
const PP_SHAPE = [3.18, 5.93, 13.46, 59.63, 88.79, 87.48, 84.97, 108.1, 106.07, 97.59, 79.07, 30.41]
const ETO_SHAPE = [142.6, 142.0, 161.8, 147.9, 138.0, 134.1, 146.3, 144.2, 123.6, 115.9, 112.8, 128.3]
const PP_SHAPE_SUM = PP_SHAPE.reduce((a, b) => a + b, 0)
const ETO_SHAPE_SUM = ETO_SHAPE.reduce((a, b) => a + b, 0)

const DEFAULTS = { areaHa: 28, precipAnual: 751.9, etoAnual: 1637, cn: 68 }

const BLUE = '#38bdf8'
const GREEN = '#95C11F'
const RED = '#f87171'

type Tone = 'good' | 'warn' | 'bad'

const toneClass: Record<Tone, string> = {
  good: 'text-[#95C11F] bg-[#95C11F]/10 border-[#95C11F]/25',
  warn: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
  bad: 'text-red-400 bg-red-400/10 border-red-400/25',
}

const nf0 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-[#1D1D1B] border border-white/[0.08] text-white placeholder-white/20 text-sm ' +
  'focus:outline-none focus:border-[#95C11F]/50 focus:ring-2 focus:ring-[#95C11F]/20 transition-all'

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor={id} className="text-white/60 text-sm">
          {label}
        </label>
        {hint && <span className="font-mono text-[10px] text-white/25 tracking-wide">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

interface TooltipPayloadItem {
  dataKey: string
  name?: string
  value: number
  unit?: string
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#1D1D1B] px-3 py-2 shadow-xl">
      <div className="font-mono text-[10px] text-white/40 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="font-mono text-xs text-white">
          {p.name}: {nf1.format(p.value)}
          {p.unit ?? ''}
        </div>
      ))}
    </div>
  )
}

export default function CalculadoraClima() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const uid = useId()

  const [areaHa, setAreaHa] = useState(DEFAULTS.areaHa)
  const [precipAnual, setPrecipAnual] = useState(DEFAULTS.precipAnual)
  const [etoAnual, setEtoAnual] = useState(DEFAULTS.etoAnual)
  const [cn, setCn] = useState(DEFAULTS.cn)

  const resetDefaults = () => {
    setAreaHa(DEFAULTS.areaHa)
    setPrecipAnual(DEFAULTS.precipAnual)
    setEtoAnual(DEFAULTS.etoAnual)
    setCn(DEFAULTS.cn)
  }

  const monthly = useMemo(() => {
    const s = 25400 / cn - 254 // retención potencial S (mm), método SCS-CN
    return MESES.map((mes, i) => {
      const p = (PP_SHAPE[i] / PP_SHAPE_SUM) * precipAnual
      const eto = (ETO_SHAPE[i] / ETO_SHAPE_SUM) * etoAnual
      const q = p > 0.2 * s ? Math.pow(p - 0.2 * s, 2) / (p + 0.8 * s) : 0
      return {
        mes,
        p: Math.round(p * 10) / 10,
        eto: Math.round(eto * 10) / 10,
        escorrentia: Math.round(q * areaHa * 10),
      }
    })
  }, [precipAnual, etoAnual, cn, areaHa])

  const deficitAnual = precipAnual - etoAnual
  const precipEfectivaM3 = precipAnual * areaHa * 10
  const demandaEtoM3 = etoAnual * areaHa * 10
  const escorrentiaTotalM3 = monthly.reduce((sum, m) => sum + m.escorrentia, 0)
  const coberturaPct = demandaEtoM3 > 0 ? (escorrentiaTotalM3 / demandaEtoM3) * 100 : 0

  const recommendations = useMemo(() => {
    const list: { tone: Tone; text: string }[] = []
    if (deficitAnual < 0) {
      list.push({
        tone: 'bad',
        text: `Déficit hídrico estructural de ${nf0.format(Math.abs(deficitAnual))} mm/año: la precipitación no alcanza a cubrir la demanda evapotranspirativa. El diseño Keyline busca capturar la escorrentía de la época húmeda para compensar los meses secos.`,
      })
    } else {
      list.push({
        tone: 'good',
        text: `Balance hídrico anual positivo (+${nf0.format(deficitAnual)} mm/año) — prioriza distribuir y retener el excedente antes que buscar fuentes externas.`,
      })
    }
    list.push({
      tone: coberturaPct >= 25 ? 'good' : 'warn',
      text: `La escorrentía anual estimada (${nf0.format(escorrentiaTotalM3)} m³) cubriría ~${nf1.format(coberturaPct)}% de la demanda ETo de la finca — ese es el volumen a capturar en reservorios y suelo.`,
    })
    if (cn >= 80) {
      list.push({
        tone: 'warn',
        text: 'Número de curva alto: suelo compactado o de infiltración lenta. Prioriza subsolado Keyline y cobertura vegetal para reducir la escorrentía perdida y mejorar la infiltración.',
      })
    } else if (cn <= 50) {
      list.push({
        tone: 'good',
        text: 'Número de curva bajo: buena infiltración natural. El diseño puede enfocarse en redistribuir el flujo hacia zonas altas más que en captación masiva.',
      })
    }
    return list
  }, [deficitAnual, coberturaPct, escorrentiaTotalM3, cn])

  const waMessage = encodeURIComponent(
    `Hola, quiero un estudio hidrológico real para mi finca.\n` +
      `Con la calculadora del sitio obtuve:\n` +
      `- Déficit hídrico anual: ${nf0.format(deficitAnual)} mm\n` +
      `- Escorrentía estimada: ${nf0.format(escorrentiaTotalM3)} m³/año\n` +
      `- Área: ${nf0.format(areaHa)} ha`
  )

  return (
    <section id="calculadora-clima" className="py-32 lg:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none tech-grid" />

      <div className="max-w-7xl mx-auto relative">
        <div ref={ref} className="mb-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="w-7 h-px bg-[#95C11F]/60" />
            <span className="font-mono text-[#95C11F] text-[10px] tracking-[0.32em] uppercase">
              Herramientas Técnicas · 04
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,6vw,4.8rem)] font-semibold leading-tight mb-6"
          >
            Balance <em className="text-[#95C11F] not-italic">clima y agua</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/45 leading-relaxed"
          >
            Ingresa la precipitación, evapotranspiración y área de tu finca — o usa los
            valores de referencia precargados — para estimar el déficit hídrico anual y
            la escorrentía capturable por diseño Keyline.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-10 items-start">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 lg:p-8 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]"
            >
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#95C11F]/50 tracking-widest">01</span>
                  <h3 className="font-display text-xl font-semibold">Datos climáticos e hidrológicos</h3>
                </div>
                <button onClick={resetDefaults} className="text-white/30 text-xs hover:text-[#95C11F] transition-colors">
                  Restablecer valores de ejemplo
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <Field id={`${uid}-area`} label="Área de la finca" hint="ha · editable">
                  <input
                    id={`${uid}-area`}
                    type="number"
                    min={0}
                    value={areaHa}
                    onChange={(e) => setAreaHa(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>
                <Field id={`${uid}-precip`} label="Precipitación anual" hint="mm/año · editable">
                  <input
                    id={`${uid}-precip`}
                    type="number"
                    min={0}
                    value={precipAnual}
                    onChange={(e) => setPrecipAnual(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>
                <Field id={`${uid}-eto`} label="ETo anual (FAO-56)" hint="mm/año · editable">
                  <input
                    id={`${uid}-eto`}
                    type="number"
                    min={0}
                    value={etoAnual}
                    onChange={(e) => setEtoAnual(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>
                <Field id={`${uid}-cn`} label="Número de curva (CN)" hint={`${cn} · escorrentía SCS`}>
                  <input
                    id={`${uid}-cn`}
                    type="range"
                    min={30}
                    max={95}
                    step={1}
                    value={cn}
                    onChange={(e) => setCn(Number(e.target.value))}
                    className="w-full accent-[#95C11F] mt-3.5"
                  />
                </Field>
              </div>
              <p className="text-white/25 text-[11px] leading-relaxed">
                CN bajo (30–50): pastos/bosque con buena infiltración. CN medio (50–75): uso mixto o suelo
                moderadamente compactado. CN alto (75–95): suelo compactado o escorrentía rápida. La
                distribución mensual se estima proporcionalmente sobre un patrón bimodal tropical de
                referencia, ajustado a tus totales anuales.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 lg:p-8 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] text-[#95C11F]/50 tracking-widest">02</span>
                <h3 className="font-display text-xl font-semibold">Precipitación vs. ETo mensual</h3>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="mes"
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="p" name="Precipitación" unit=" mm" fill={BLUE} radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="eto" name="ETo" unit=" mm" stroke={RED} strokeWidth={2} dot={{ r: 2.5, fill: RED }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-5 mt-3">
                <span className="flex items-center gap-1.5 text-white/25 text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ background: BLUE }} /> Precipitación
                </span>
                <span className="flex items-center gap-1.5 text-white/25 text-[11px]">
                  <span className="w-2 h-0.5" style={{ background: RED }} /> ETo
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 lg:p-8 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] text-[#95C11F]/50 tracking-widest">03</span>
                <h3 className="font-display text-xl font-semibold">Escorrentía capturable por mes</h3>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="mes"
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="escorrentia" name="Escorrentía" unit=" m³" fill={GREEN} radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="text-white/25 text-[11px] mt-3">
                Estimada con el método del Número de Curva (SCS-CN) sobre la precipitación mensual.
              </p>
            </motion.div>
          </div>

          {/* ── Columna derecha: resumen en vivo ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 p-7 lg:p-8 rounded-2xl border border-[#95C11F]/20 bg-[#2C2C2A]"
          >
            <div className="font-mono text-[10px] text-[#95C11F]/50 tracking-widest uppercase mb-6">
              Resumen en vivo
            </div>

            <div className="space-y-4 mb-6">
              {[
                { label: 'Déficit hídrico anual', value: `${nf0.format(deficitAnual)} mm` },
                { label: 'Precipitación efectiva', value: `${nf0.format(precipEfectivaM3)} m³` },
                { label: 'Demanda ETo total', value: `${nf0.format(demandaEtoM3)} m³` },
                { label: 'Escorrentía capturable', value: `${nf0.format(escorrentiaTotalM3)} m³` },
                { label: 'Cobertura de la demanda', value: `${nf1.format(coberturaPct)} %` },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-white/40 text-sm">{row.label}</span>
                  <span className="font-mono text-lg text-white font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 mb-6">
              <div className="font-mono text-[9px] text-white/30 tracking-widest uppercase mb-1">Lectura Keyline</div>
              {recommendations.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg border text-[12px] leading-relaxed ${toneClass[r.tone]}`}>
                  {r.text}
                </div>
              ))}
            </div>

            <a
              href={`https://wa.me/573113650567?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-[#95C11F] text-[#1D1D1B] rounded-full font-semibold text-sm hover:bg-[#a6d42a] transition-all duration-200 hover:shadow-[0_0_32px_rgba(149,193,31,0.4)] hover:scale-[1.02]"
            >
              Solicitar estudio hidrológico real
            </a>

            <p className="mt-5 text-white/25 text-[11px] leading-relaxed text-center">
              Estimación preliminar — el método CN aplicado a promedios mensuales es una
              aproximación; no reemplaza un estudio hidrológico de campo.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
