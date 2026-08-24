'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'

interface ParamDef {
  key: string
  label: string
  short: string
  unit: string
  default: number
  min: number
  max: number
  step: number
  invert?: boolean
  weight: number
}

// ── Parámetros principales — rangos adecuados de referencia (suelo tropical) ──
// TODO: calibrar rangos por textura/región antes de usarlos como diagnóstico formal.
const MAIN_PARAMS: ParamDef[] = [
  { key: 'ph', label: 'pH del suelo', short: 'pH', unit: '', default: 4.3, min: 5.5, max: 6.5, step: 0.1, weight: 0.2 },
  { key: 'mo', label: 'Materia orgánica', short: 'M.O.', unit: '%', default: 2.64, min: 5.0, max: 10.0, step: 0.1, weight: 0.15 },
  { key: 'p', label: 'Fósforo (Bray II)', short: 'P', unit: 'ppm', default: 3.1, min: 15, max: 40, step: 0.1, weight: 0.2 },
  { key: 'cic', label: 'CIC', short: 'CIC', unit: 'meq/100g', default: 19.0, min: 10, max: 25, step: 0.1, weight: 0.04 },
  { key: 'ca', label: 'Calcio (Ca)', short: 'Ca', unit: 'meq/100g', default: 5.8, min: 3, max: 10, step: 0.1, weight: 0.08 },
  { key: 'mg', label: 'Magnesio (Mg)', short: 'Mg', unit: 'meq/100g', default: 3.8, min: 1.5, max: 3.0, step: 0.1, weight: 0.05 },
  { key: 'k', label: 'Potasio (K)', short: 'K', unit: 'meq/100g', default: 0.33, min: 0.2, max: 0.4, step: 0.01, weight: 0.05 },
  {
    key: 'al',
    label: 'Saturación de aluminio',
    short: 'Al',
    unit: '%',
    default: 29.99,
    min: 0,
    max: 15,
    step: 0.1,
    invert: true,
    weight: 0.15,
  },
]

const MICRO_PARAMS: ParamDef[] = [
  { key: 'n', label: 'Nitrógeno total', short: 'N', unit: '%', default: 0.08, min: 0.1, max: 0.2, step: 0.01, weight: 0 },
  { key: 'b', label: 'Boro (B)', short: 'B', unit: 'ppm', default: 0.09, min: 0.3, max: 0.6, step: 0.01, weight: 0.08 / 3 },
  { key: 'zn', label: 'Zinc (Zn)', short: 'Zn', unit: 'ppm', default: 1.4, min: 2, max: 4, step: 0.1, weight: 0.08 / 3 },
  { key: 'cu', label: 'Cobre (Cu)', short: 'Cu', unit: 'ppm', default: 0.6, min: 1, max: 3, step: 0.1, weight: 0.08 / 3 },
]

const ALL_PARAMS = [...MAIN_PARAMS, ...MICRO_PARAMS]

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function scoreOf(value: number, min: number, max: number, invert?: boolean) {
  if (invert) {
    if (value <= max) return 100
    return clamp(100 - ((value - max) / max) * 100, 0, 100)
  }
  if (value >= min && value <= max) return 100
  if (value < min) return clamp((value / min) * 100, 0, 100)
  return clamp(100 - ((value - max) / max) * 100, 0, 100)
}

type Tone = 'good' | 'warn' | 'bad'

function toneOf(score: number): Tone {
  if (score >= 90) return 'good'
  if (score >= 55) return 'warn'
  return 'bad'
}

function statusOf(value: number, def: ParamDef): { label: string; tone: Tone } {
  const score = scoreOf(value, def.min, def.max, def.invert)
  const tone = toneOf(score)
  if (tone === 'good') return { label: 'Óptimo', tone }
  if (def.invert) return { label: tone === 'warn' ? 'Alto' : 'Crítico', tone }
  const low = value < def.min
  return { label: low ? (tone === 'warn' ? 'Bajo' : 'Crítico') : 'Alto', tone }
}

function simpleStatus(value: number, min: number, max: number): { label: string; tone: Tone } {
  const score = scoreOf(value, min, max)
  const tone = toneOf(score)
  if (tone === 'good') return { label: 'Óptimo', tone }
  return { label: value < min ? 'Bajo' : 'Alto', tone }
}

const toneClass: Record<Tone, string> = {
  good: 'text-[#95C11F] bg-[#95C11F]/10 border-[#95C11F]/25',
  warn: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
  bad: 'text-red-400 bg-red-400/10 border-red-400/25',
}

const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg bg-[#1D1D1B] border border-white/[0.08] text-white text-sm ' +
  'focus:outline-none focus:border-[#95C11F]/50 focus:ring-2 focus:ring-[#95C11F]/20 transition-all'

function Pill({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium tracking-wide shrink-0 ${toneClass[tone]}`}>
      {label}
    </span>
  )
}

function ParamField({
  def,
  value,
  onChange,
  uid,
}: {
  def: ParamDef
  value: number
  onChange: (v: number) => void
  uid: string
}) {
  const status = statusOf(value, def)
  return (
    <div className="p-4 rounded-xl bg-[#1D1D1B]/60 border border-white/[0.06]">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <label htmlFor={`${uid}-${def.key}`} className="text-white/60 text-[13px]">
          {def.label}
        </label>
        <Pill tone={status.tone} label={status.label} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <input
          id={`${uid}-${def.key}`}
          type="number"
          step={def.step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={inputClass}
        />
        {def.unit && <span className="text-white/30 text-[11px] shrink-0 w-16">{def.unit}</span>}
      </div>
      <div className="font-mono text-[10px] text-white/25 tracking-wide">
        Rango adecuado: {def.invert ? `< ${nf.format(def.max)}` : `${nf.format(def.min)} – ${nf.format(def.max)}`}{' '}
        {def.unit}
      </div>
    </div>
  )
}

export default function CalculadoraSuelo() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const uid = useId()

  const defaults = useMemo(() => Object.fromEntries(ALL_PARAMS.map((p) => [p.key, p.default])), [])
  const [values, setValues] = useState<Record<string, number>>(defaults)

  const resetDefaults = () => setValues(defaults)
  const update = (key: string, v: number) => setValues((prev) => ({ ...prev, [key]: v }))

  const fertilityIndex = useMemo(() => {
    const total = ALL_PARAMS.reduce((sum, p) => sum + scoreOf(values[p.key], p.min, p.max, p.invert) * p.weight, 0)
    return Math.round(clamp(total, 0, 100))
  }, [values])

  const caMg = values.mg > 0 ? values.ca / values.mg : 0
  const caMgStatus = simpleStatus(caMg, 3.0, 5.0)

  const radarData = useMemo(
    () =>
      MAIN_PARAMS.map((p) => ({
        subject: p.short,
        actual: Math.round(scoreOf(values[p.key], p.min, p.max, p.invert)),
        optimo: 100,
      })),
    [values]
  )

  const indexTone: Tone = fertilityIndex >= 70 ? 'good' : fertilityIndex >= 40 ? 'warn' : 'bad'
  const indexColor = indexTone === 'good' ? '#95C11F' : indexTone === 'warn' ? '#fbbf24' : '#f87171'

  const recommendations = useMemo(() => {
    const list: { tone: Tone; text: string }[] = []
    const phMin = MAIN_PARAMS[0].min
    const alMax = MAIN_PARAMS.find((p) => p.key === 'al')!.max
    const pMin = MAIN_PARAMS.find((p) => p.key === 'p')!.min
    const moMin = MAIN_PARAMS.find((p) => p.key === 'mo')!.min
    const bMin = MICRO_PARAMS.find((p) => p.key === 'b')!.min
    const znMin = MICRO_PARAMS.find((p) => p.key === 'zn')!.min
    const cuMin = MICRO_PARAMS.find((p) => p.key === 'cu')!.min

    if (values.ph < phMin) {
      list.push({
        tone: 'bad',
        text: 'pH ácido: encalar con Cal Calcítica (CaCO₃) para subir hacia 5.5–6.5. Referencia de campo: 2.5–3.0 ton/ha, 60–90 días antes de siembra. Evita cal dolomítica si el Mg ya está alto.',
      })
    }
    if (values.al > alMax) {
      list.push({
        tone: 'bad',
        text: 'Aluminio en niveles tóxicos: corrige primero el pH — el Al³⁺ bloquea el crecimiento radicular y la absorción de P, Ca y Mg.',
      })
    }
    if (values.p < pMin) {
      list.push({
        tone: 'warn',
        text: 'Fósforo bajo: aplica una fuente fosfatada (ej. MAP) junto con micorrizas — sin corregir el pH antes, el P aplicado tiende a inmovilizarse.',
      })
    }
    if (values.mo < moMin) {
      list.push({
        tone: 'warn',
        text: 'Materia orgánica baja: incorpora humus de lombriz o compost (referencia 5–8 ton/ha) para mejorar la CIC efectiva, la retención de agua y la actividad biológica.',
      })
    }
    if (caMg < 3.0) {
      list.push({
        tone: 'warn',
        text: `Relación Ca/Mg baja (${nf.format(caMg)}, ideal 3.0–5.0): usa fuentes de calcio sin magnesio (cal calcítica, yeso agrícola) para no acentuar el desbalance.`,
      })
    }
    if (values.b < bMin) {
      list.push({ tone: 'warn', text: 'Boro deficiente: aplicar Borax (referencia ~5 kg/ha) — es inmóvil en la planta y debe reponerse en cada ciclo.' })
    }
    if (values.zn < znMin) {
      list.push({ tone: 'warn', text: 'Zinc bajo: sulfato de zinc edáfico o foliar mejora la síntesis de clorofila y el metabolismo del nitrógeno.' })
    }
    if (values.cu < cuMin) {
      list.push({ tone: 'warn', text: 'Cobre bajo: sulfato de cobre en dosis bajas (mezcla Bordelesa) aporta Cu y protección fúngica simultánea.' })
    }
    if (list.length === 0) {
      list.push({ tone: 'good', text: 'Los parámetros principales están dentro de rango. Mantén el monitoreo anual y las prácticas actuales.' })
    }
    return list
  }, [values, caMg])

  const waMessage = encodeURIComponent(
    `Hola, quiero un análisis de suelo real para mi finca.\n` +
      `Con la calculadora del sitio obtuve un índice de fertilidad estimado de ${fertilityIndex}/100 ` +
      `(pH ${nf.format(values.ph)}, M.O. ${nf.format(values.mo)}%, P ${nf.format(values.p)} ppm).`
  )

  return (
    <section id="calculadora-suelo" className="py-32 lg:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none dot-grid" />

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
              Herramientas Técnicas · 03
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,6vw,4.8rem)] font-semibold leading-tight mb-6"
          >
            Analiza tu <em className="text-[#95C11F] not-italic">suelo</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/45 leading-relaxed"
          >
            Ingresa los valores de tu análisis de laboratorio — o usa los de referencia
            precargados — y obtén el índice de fertilidad, el estado de cada parámetro
            frente a su rango adecuado y recomendaciones agronómicas inmediatas.
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
                  <h3 className="font-display text-xl font-semibold">Parámetros químicos principales</h3>
                </div>
                <button onClick={resetDefaults} className="text-white/30 text-xs hover:text-[#95C11F] transition-colors">
                  Restablecer valores de ejemplo
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MAIN_PARAMS.map((p) => (
                  <ParamField key={p.key} def={p} value={values[p.key]} onChange={(v) => update(p.key, v)} uid={uid} />
                ))}
              </div>
              <div className="mt-5 px-1 flex items-center gap-2 text-[12px] text-white/30 flex-wrap">
                <span>
                  Relación Ca/Mg: <span className="font-mono text-white/60">{nf.format(caMg)}</span>
                </span>
                <Pill tone={caMgStatus.tone} label={caMgStatus.label} />
                <span className="text-white/20">· ideal 3.0 – 5.0</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 lg:p-8 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] text-[#95C11F]/50 tracking-widest">02</span>
                <h3 className="font-display text-xl font-semibold">Micronutrientes y nitrógeno</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MICRO_PARAMS.map((p) => (
                  <ParamField key={p.key} def={p} value={values[p.key]} onChange={(v) => update(p.key, v)} uid={uid} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Columna derecha: índice + recomendaciones ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 p-7 lg:p-8 rounded-2xl border border-[#95C11F]/20 bg-[#2C2C2A]"
          >
            <div className="font-mono text-[10px] text-[#95C11F]/50 tracking-widest uppercase mb-6">
              Índice de fertilidad
            </div>

            <div className="flex items-end gap-2 mb-2">
              <span className="font-display text-5xl font-semibold" style={{ color: indexColor }}>
                {fertilityIndex}
              </span>
              <span className="text-white/30 text-sm mb-1.5">/100</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-6">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${fertilityIndex}%`, background: indexColor }}
              />
            </div>

            <div className="h-[220px] mb-6 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Radar name="Óptimo" dataKey="optimo" stroke="rgba(255,255,255,0.15)" fill="transparent" strokeDasharray="4 4" />
                  <Radar name="Actual" dataKey="actual" stroke="#95C11F" fill="#95C11F" fillOpacity={0.18} />
                  <Tooltip
                    contentStyle={{ background: '#1D1D1B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                    itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 mb-6">
              <div className="font-mono text-[9px] text-white/30 tracking-widest uppercase mb-1">Recomendaciones</div>
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
              Solicitar análisis real de tu finca
            </a>

            <p className="mt-5 text-white/25 text-[11px] leading-relaxed text-center">
              Estimación orientativa — no reemplaza un análisis de laboratorio ni un diseño técnico Keyline.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
