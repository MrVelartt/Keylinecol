'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { areaFill, axisTick, nativeTooltipProps, neutralLine, polarGridStroke, series } from '@/lib/chart-theme'
import { toneClass, toneColor, type Tone } from '@/lib/tones'
import { Accent } from '@/components/ui/SectionHeader'
import ToolFrame from '@/components/tools/ToolFrame'
import ExportarPDF from '@/components/pdf/ExportarPDF'
import { graficaAPng } from '@/lib/pdf/grafica'
import type { Bloque, Reporte } from '@/lib/pdf/reporte'

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

const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg bg-surface border border-subtle text-primary text-sm ' +
  'focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all'

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
  editRange,
  onRange,
}: {
  def: ParamDef
  value: number
  onChange: (v: number) => void
  uid: string
  editRange: boolean
  onRange: (r: { min: number; max: number }) => void
}) {
  const status = statusOf(value, def)
  return (
    <div className="p-4 rounded-xl bg-surface/60 border border-subtle">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <label htmlFor={`${uid}-${def.key}`} className="text-secondary text-[13px]">
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
        {def.unit && <span className="text-mono text-[11px] shrink-0 w-16">{def.unit}</span>}
      </div>
      {editRange ? (
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-mono">
          <span>Rango</span>
          {def.invert ? (
            <span>{'<'}</span>
          ) : (
            <>
              <input
                type="number"
                step={def.step}
                aria-label={`Mínimo adecuado de ${def.label}`}
                value={def.min}
                onChange={(e) => onRange({ min: Number(e.target.value) || 0, max: def.max })}
                className="w-16 px-1.5 py-1 rounded bg-surface border border-subtle text-primary"
              />
              <span>–</span>
            </>
          )}
          <input
            type="number"
            step={def.step}
            aria-label={`Máximo adecuado de ${def.label}`}
            value={def.max}
            onChange={(e) => onRange({ min: def.min, max: Number(e.target.value) || 0 })}
            className="w-16 px-1.5 py-1 rounded bg-surface border border-subtle text-primary"
          />
          <span>{def.unit}</span>
        </div>
      ) : (
        <div className="font-mono text-[10px] text-mono tracking-wide">
          Rango adecuado: {def.invert ? `< ${nf.format(def.max)}` : `${nf.format(def.min)} – ${nf.format(def.max)}`}{' '}
          {def.unit}
        </div>
      )}
    </div>
  )
}

export default function CalculadoraSuelo() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const uid = useId()

  const defaults = useMemo(() => Object.fromEntries(ALL_PARAMS.map((p) => [p.key, p.default])), [])
  const [values, setValues] = useState<Record<string, number>>(defaults)
  // Rangos adecuados editables (por textura o región).
  const [ranges, setRanges] = useState<Record<string, { min: number; max: number }>>({})
  const [editRanges, setEditRanges] = useState(false)
  const [caMgRange, setCaMgRange] = useState({ min: 3.0, max: 5.0 })
  const radarRef = useRef<HTMLDivElement>(null)
  const eff = (p: ParamDef): ParamDef => ({ ...p, ...ranges[p.key] })
  const MAIN = MAIN_PARAMS.map(eff)
  const MICRO = MICRO_PARAMS.map(eff)
  const ALL = [...MAIN, ...MICRO]
  const setRange = (key: string, r: { min: number; max: number }) => setRanges((prev) => ({ ...prev, [key]: r }))

  const resetDefaults = () => {
    setValues(defaults)
    setRanges({})
    setCaMgRange({ min: 3.0, max: 5.0 })
  }
  const update = (key: string, v: number) => setValues((prev) => ({ ...prev, [key]: v }))

  const fertilityIndex = useMemo(() => {
    const total = ALL.reduce((sum, p) => sum + scoreOf(values[p.key], p.min, p.max, p.invert) * p.weight, 0)
    return Math.round(clamp(total, 0, 100))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, ranges])

  const caMg = values.mg > 0 ? values.ca / values.mg : 0
  const caMgStatus = simpleStatus(caMg, caMgRange.min, caMgRange.max)

  const radarData = useMemo(
    () =>
      MAIN.map((p) => ({
        subject: p.short,
        actual: Math.round(scoreOf(values[p.key], p.min, p.max, p.invert)),
        optimo: 100,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, ranges]
  )

  const indexTone: Tone = fertilityIndex >= 70 ? 'good' : fertilityIndex >= 40 ? 'warn' : 'bad'
  const indexColor = toneColor[indexTone]

  const recommendations = useMemo(() => {
    const list: { tone: Tone; text: string }[] = []
    const phMin = MAIN[0].min
    const alMax = MAIN.find((p) => p.key === 'al')!.max
    const pMin = MAIN.find((p) => p.key === 'p')!.min
    const moMin = MAIN.find((p) => p.key === 'mo')!.min
    const bMin = MICRO.find((p) => p.key === 'b')!.min
    const znMin = MICRO.find((p) => p.key === 'zn')!.min
    const cuMin = MICRO.find((p) => p.key === 'cu')!.min

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
    if (caMg < caMgRange.min) {
      list.push({
        tone: 'warn',
        text: `Relación Ca/Mg baja (${nf.format(caMg)}, ideal ${nf.format(caMgRange.min)}–${nf.format(caMgRange.max)}): usa fuentes de calcio sin magnesio (cal calcítica, yeso agrícola) para no acentuar el desbalance.`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, caMg, ranges, caMgRange])

  const construirPDF = async (cliente: string): Promise<Reporte> => {
    const radar = await graficaAPng(radarRef.current)
    const filas = (ps: ParamDef[]) =>
      ps.map((p) => [
        p.label,
        `${nf.format(values[p.key])} ${p.unit}`.trim(),
        p.invert ? `< ${nf.format(p.max)}` : `${nf.format(p.min)} – ${nf.format(p.max)}`,
        statusOf(values[p.key], p).label,
      ])
    const bloques: Bloque[] = [
      {
        tipo: 'kpis',
        items: [
          { k: 'Índice de fertilidad', v: `${fertilityIndex} / 100` },
          { k: 'Relación Ca/Mg', v: nf.format(caMg), sub: `${caMgStatus.label} · ideal ${nf.format(caMgRange.min)}–${nf.format(caMgRange.max)}` },
          { k: 'pH', v: nf.format(values.ph), sub: statusOf(values.ph, MAIN[0]).label },
        ],
      },
      ...(radar ? [{ tipo: 'grafica' as const, titulo: 'Puntaje por parámetro (100 = dentro del rango)', png: radar.png, ratio: radar.ratio }] : []),
      { tipo: 'titulo', texto: 'Parámetros químicos principales' },
      { tipo: 'tabla', head: ['Parámetro', 'Valor', 'Rango adecuado', 'Estado'], body: filas(MAIN), alinear: ['left', 'right', 'right', 'left'] },
      { tipo: 'titulo', texto: 'Micronutrientes y nitrógeno' },
      { tipo: 'tabla', head: ['Parámetro', 'Valor', 'Rango adecuado', 'Estado'], body: filas(MICRO), alinear: ['left', 'right', 'right', 'left'] },
      { tipo: 'titulo', texto: 'Recomendaciones' },
      ...recommendations.map((r) => ({ tipo: 'nota' as const, texto: r.text, tono: r.tone === 'good' ? ('good' as const) : ('warn' as const) })),
    ]
    return {
      herramienta: 'Análisis de suelo',
      titulo: 'Diagnóstico de fertilidad del suelo',
      subtitulo: 'Estado de cada parámetro frente a su rango adecuado e índice de fertilidad ponderado.',
      cliente,
      slug: 'analisis-de-suelo',
      disclaimer:
        'Estimación orientativa: no reemplaza un análisis de laboratorio ni un diseño técnico Keyline. Rangos de referencia para suelo tropical; ajústelos por textura y región.',
      bloques,
    }
  }

  const waMessage = encodeURIComponent(
    `Hola, quiero un análisis de suelo real para mi finca.\n` +
      `Con la calculadora del sitio obtuve un índice de fertilidad estimado de ${fertilityIndex}/100 ` +
      `(pH ${nf.format(values.ph)}, M.O. ${nf.format(values.mo)}%, P ${nf.format(values.p)} ppm).`
  )

  return (
    <ToolFrame
      id="calculadora-suelo"
      fondo="dot-grid"
      number="03"
      title={
        <>
          Analiza tu <Accent>suelo</Accent>
        </>
      }
      subtitle={
        <>
          Ingresa los valores de tu análisis de laboratorio — o usa los de referencia
          precargados — y obtén el índice de fertilidad, el estado de cada parámetro
          frente a su rango adecuado y recomendaciones agronómicas inmediatas.
        </>
      }
    >
      <div ref={ref} className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-10 items-start">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 lg:p-8 rounded-2xl border border-subtle bg-surface-raised"
            >
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-brand/50 tracking-widest">01</span>
                  <h3 className="font-display text-xl font-semibold">Parámetros químicos principales</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-pressed={editRanges}
                    onClick={() => setEditRanges((v) => !v)}
                    className={`text-xs transition-colors ${editRanges ? 'text-brand' : 'text-mono hover:text-brand'}`}
                  >
                    {editRanges ? 'Listo con los rangos' : 'Editar rangos adecuados'}
                  </button>
                  <button onClick={resetDefaults} className="text-mono text-xs hover:text-brand transition-colors">
                    Restablecer valores de ejemplo
                  </button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MAIN.map((p) => (
                  <ParamField
                    key={p.key}
                    def={p}
                    value={values[p.key]}
                    onChange={(v) => update(p.key, v)}
                    uid={uid}
                    editRange={editRanges}
                    onRange={(r) => setRange(p.key, r)}
                  />
                ))}
              </div>
              <div className="mt-5 px-1 flex items-center gap-2 text-[12px] text-mono flex-wrap">
                <span>
                  Relación Ca/Mg: <span className="font-mono text-secondary">{nf.format(caMg)}</span>
                </span>
                <Pill tone={caMgStatus.tone} label={caMgStatus.label} />
                {editRanges ? (
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    · ideal
                    <input
                      type="number"
                      step={0.1}
                      aria-label="Relación Ca/Mg mínima"
                      value={caMgRange.min}
                      onChange={(e) => setCaMgRange((r) => ({ ...r, min: Number(e.target.value) || 0 }))}
                      className="w-14 px-1.5 py-1 rounded bg-surface border border-subtle text-primary"
                    />
                    –
                    <input
                      type="number"
                      step={0.1}
                      aria-label="Relación Ca/Mg máxima"
                      value={caMgRange.max}
                      onChange={(e) => setCaMgRange((r) => ({ ...r, max: Number(e.target.value) || 0 }))}
                      className="w-14 px-1.5 py-1 rounded bg-surface border border-subtle text-primary"
                    />
                  </span>
                ) : (
                  <span className="text-mono">
                    · ideal {nf.format(caMgRange.min)} – {nf.format(caMgRange.max)}
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 lg:p-8 rounded-2xl border border-subtle bg-surface-raised"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] text-brand/50 tracking-widest">02</span>
                <h3 className="font-display text-xl font-semibold">Micronutrientes y nitrógeno</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MICRO.map((p) => (
                  <ParamField
                    key={p.key}
                    def={p}
                    value={values[p.key]}
                    onChange={(v) => update(p.key, v)}
                    uid={uid}
                    editRange={editRanges}
                    onRange={(r) => setRange(p.key, r)}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Columna derecha: índice + recomendaciones ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 p-7 lg:p-8 rounded-2xl border border-brand/20 bg-surface-raised"
          >
            <div className="font-mono text-[10px] text-brand/50 tracking-widest uppercase mb-6">
              Índice de fertilidad
            </div>

            <div className="flex items-end gap-2 mb-2">
              <span className="font-display text-5xl font-semibold" style={{ color: indexColor }}>
                {fertilityIndex}
              </span>
              <span className="text-mono text-sm mb-1.5">/100</span>
            </div>
            <div className="h-2 rounded-full bg-veil-strong overflow-hidden mb-6">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${fertilityIndex}%`, background: indexColor }}
              />
            </div>

            <div ref={radarRef} className="h-[220px] mb-6 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke={polarGridStroke} />
                  <PolarAngleAxis dataKey="subject" tick={axisTick} />
                  <Radar name="Óptimo" dataKey="optimo" {...neutralLine} fill="transparent" />
                  <Radar name="Actual" dataKey="actual" stroke={series.water} fill={areaFill('water', 0.18)} />
                  <Tooltip {...nativeTooltipProps} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 mb-6">
              <div className="font-mono text-[9px] text-mono tracking-widest uppercase mb-1">Recomendaciones</div>
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
              className="flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-brand text-surface rounded-full font-semibold text-sm hover:bg-brand-hover transition-all duration-200 hover:shadow-glow-lg hover:scale-[1.02]"
            >
              Solicitar análisis real de tu finca
            </a>

            <ExportarPDF className="mt-5" variante="secundario" etiqueta="Descargar diagnóstico (PDF)" construir={construirPDF} />

            <p className="mt-5 text-mono text-[11px] leading-relaxed text-center">
              Estimación orientativa — no reemplaza un análisis de laboratorio ni un diseño técnico Keyline.
            </p>
          </motion.div>
      </div>
    </ToolFrame>
  )
}
