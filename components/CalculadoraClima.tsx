'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { climateData, DEFAULT_RUNOFF_CN } from '@/lib/climateData'
import { scsCnAnnualRunoffM3, scsCnMonthlyRunoffMm } from '@/lib/hydrology'
import { toneClass, type Tone } from '@/lib/tones'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'
import ExportarPDF from '@/components/pdf/ExportarPDF'
import { graficaAPng } from '@/lib/pdf/grafica'
import type { Bloque, Reporte } from '@/lib/pdf/reporte'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// ── Distribución mensual de referencia (serie real Baranoa, patrón bimodal Caribe) ──
// Se reescala proporcionalmente a los totales anuales que ingrese el usuario.
// Misma serie que /analitica (lib/climateData.ts), para que ambas páginas
// coincidan cuando se usan los valores de referencia por defecto.
const PP_SHAPE = climateData.baranoa.monthlyPrecipAvg
const ETO_SHAPE = climateData.baranoa.monthlyEtoAvg
const PP_SHAPE_SUM = PP_SHAPE.reduce((a, b) => a + b, 0)
const ETO_SHAPE_SUM = ETO_SHAPE.reduce((a, b) => a + b, 0)

const DEFAULTS = {
  areaHa: climateData.baranoa.areaHa,
  precipAnual: climateData.baranoa.kpis.precipMmYear,
  etoAnual: climateData.baranoa.kpis.etoMmYear,
  cn: DEFAULT_RUNOFF_CN,
}

/** Escala un patrón mensual a un total anual (si el actual suma 0, usa el patrón de referencia). */
function escalar(m: readonly number[], sumaActual: number, total: number, ref: readonly number[] = m, sumaRef = sumaActual) {
  if (sumaActual > 0) return m.map((x) => (x / sumaActual) * total)
  return ref.map((x) => (sumaRef > 0 ? (x / sumaRef) * total : total / 12))
}

const BLUE = '#38bdf8'
const GREEN = '#95C11F'
const RED = '#f87171'


const nf0 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-surface border border-subtle text-primary placeholder:text-mono text-sm ' +
  'focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all'

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
        <label htmlFor={id} className="text-secondary text-sm">
          {label}
        </label>
        {hint && <span className="font-mono text-[10px] text-mono tracking-wide">{hint}</span>}
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
    <div className="rounded-lg border border-strong bg-surface px-3 py-2 shadow-xl">
      <div className="font-mono text-[10px] text-mono mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="font-mono text-xs text-primary">
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
  const [cn, setCn] = useState(DEFAULTS.cn)
  // Lluvia y ETo mes a mes (editables). Los totales anuales reescalan el patrón.
  const [pMes, setPMes] = useState(() => escalar(PP_SHAPE, PP_SHAPE_SUM, DEFAULTS.precipAnual))
  const [etoMes, setEtoMes] = useState(() => escalar(ETO_SHAPE, ETO_SHAPE_SUM, DEFAULTS.etoAnual))
  const [editarMeses, setEditarMeses] = useState(false)
  const graficaLluviaRef = useRef<HTMLDivElement>(null)
  const graficaEscRef = useRef<HTMLDivElement>(null)

  const suma = (a: number[]) => a.reduce((x, y) => x + y, 0)
  const precipAnual = Math.round(suma(pMes))
  const etoAnual = Math.round(suma(etoMes))
  const setPrecipAnual = (v: number) => setPMes((m) => escalar(m, suma(m), v, PP_SHAPE, PP_SHAPE_SUM))
  const setEtoAnual = (v: number) => setEtoMes((m) => escalar(m, suma(m), v, ETO_SHAPE, ETO_SHAPE_SUM))
  const setMes = (arr: 'p' | 'eto', i: number, v: number) =>
    (arr === 'p' ? setPMes : setEtoMes)((m) => m.map((x, k) => (k === i ? Math.max(0, v) : x)))

  const resetDefaults = () => {
    setAreaHa(DEFAULTS.areaHa)
    setPMes(escalar(PP_SHAPE, PP_SHAPE_SUM, DEFAULTS.precipAnual))
    setEtoMes(escalar(ETO_SHAPE, ETO_SHAPE_SUM, DEFAULTS.etoAnual))
    setCn(DEFAULTS.cn)
  }

  const monthly = useMemo(() => {
    const monthlyQ = scsCnMonthlyRunoffMm(pMes, cn)
    return MESES.map((mes, i) => ({
      mes,
      p: Math.round(pMes[i] * 10) / 10,
      eto: Math.round(etoMes[i] * 10) / 10,
      escorrentia: Math.round(monthlyQ[i] * areaHa * 10),
    }))
  }, [pMes, etoMes, cn, areaHa])

  const deficitAnual = precipAnual - etoAnual
  const precipEfectivaM3 = precipAnual * areaHa * 10
  const demandaEtoM3 = etoAnual * areaHa * 10
  // Escorrentía total calculada sobre los mm sin redondear (no sumando las
  // barras del gráfico, ya redondeadas mes a mes) — misma cifra exacta que /analitica.
  const escorrentiaTotalM3 = useMemo(() => scsCnAnnualRunoffM3(pMes, areaHa, cn), [pMes, cn, areaHa])
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

  const construirPDF = async (cliente: string): Promise<Reporte> => {
    const [g1, g2] = await Promise.all([graficaAPng(graficaLluviaRef.current), graficaAPng(graficaEscRef.current)])
    const bloques: Bloque[] = [
      {
        tipo: 'kpis',
        items: [
          { k: 'Balance anual P − ETo', v: `${nf0.format(deficitAnual)} mm`, sub: deficitAnual < 0 ? 'déficit' : 'excedente' },
          { k: 'Escorrentía capturable', v: `${nf0.format(escorrentiaTotalM3)} m³/año`, sub: `CN ${cn}` },
          { k: 'Cobertura de la demanda', v: `${nf1.format(coberturaPct)} %`, sub: `de ${nf0.format(demandaEtoM3)} m³ de ETo` },
        ],
      },
      { tipo: 'titulo', texto: 'Datos de entrada' },
      {
        tipo: 'kv',
        filas: [
          ['Área de la finca', `${nf1.format(areaHa)} ha`],
          ['Precipitación anual', `${nf0.format(precipAnual)} mm`],
          ['ETo anual (FAO-56)', `${nf0.format(etoAnual)} mm`],
          ['Número de curva (CN)', String(cn)],
        ],
      },
      ...(g1 ? [{ tipo: 'grafica' as const, titulo: 'Precipitación (barras) vs. ETo (línea) por mes, mm', png: g1.png, ratio: g1.ratio }] : []),
      { tipo: 'titulo', texto: 'Balance mensual' },
      {
        tipo: 'tabla',
        head: ['Mes', 'Precipitación mm', 'ETo mm', 'P − ETo mm', 'Escorrentía m³'],
        body: monthly.map((m) => [m.mes, nf1.format(m.p), nf1.format(m.eto), nf1.format(m.p - m.eto), nf0.format(m.escorrentia)]),
        foot: [['Año', nf0.format(precipAnual), nf0.format(etoAnual), nf0.format(deficitAnual), nf0.format(escorrentiaTotalM3)]],
      },
      ...(g2 ? [{ tipo: 'grafica' as const, titulo: 'Escorrentía capturable por mes, m³', png: g2.png, ratio: g2.ratio }] : []),
      { tipo: 'titulo', texto: 'Lectura Keyline' },
      ...recommendations.map((r) => ({ tipo: 'nota' as const, texto: r.text, tono: r.tone === 'good' ? ('good' as const) : ('warn' as const) })),
    ]
    return {
      herramienta: 'Balance hídrico',
      titulo: 'Balance de clima y agua',
      subtitulo: 'Precipitación, evapotranspiración y escorrentía capturable mes a mes.',
      cliente,
      slug: 'balance-hidrico',
      disclaimer:
        'Estimación preliminar: el método CN aplicado a promedios mensuales es una aproximación y no reemplaza un estudio hidrológico de campo.',
      bloques,
    }
  }

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
          <SectionHeader
            inView={inView}
            className=""
            eyebrow="Herramientas Técnicas"
            number="04"
            title={
              <>
                Balance <Accent>clima y agua</Accent>
              </>
            }
            subtitle={
              <>
                Ingresa la precipitación, evapotranspiración y área de tu finca — o usa los
                valores de referencia precargados — para estimar el déficit hídrico anual y
                la escorrentía capturable por diseño Keyline.
              </>
            }
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-10 items-start">
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
                  <h3 className="font-display text-xl font-semibold">Datos climáticos e hidrológicos</h3>
                </div>
                <button onClick={resetDefaults} className="text-mono text-xs hover:text-brand transition-colors">
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
                    className="w-full accent-brand mt-3.5"
                  />
                </Field>
              </div>
              <button
                type="button"
                aria-expanded={editarMeses}
                onClick={() => setEditarMeses((v) => !v)}
                className="mb-4 text-xs text-mono hover:text-brand transition-colors"
              >
                {editarMeses ? 'Ocultar valores mensuales' : 'Editar lluvia y ETo mes a mes'}
              </button>
              {editarMeses && (
                <div className="mb-5 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-[12px] font-mono">
                    <thead>
                      <tr>
                        <th className="text-left text-mono font-normal pb-2 pr-2">mm</th>
                        {MESES.map((m) => (
                          <th key={m} className="text-mono font-normal pb-2 px-0.5">
                            {m}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ['p', 'Lluvia', pMes],
                          ['eto', 'ETo', etoMes],
                        ] as const
                      ).map(([k, label, arr]) => (
                        <tr key={k}>
                          <td className="text-secondary pr-2 py-1">{label}</td>
                          {arr.map((v, i) => (
                            <td key={i} className="px-0.5 py-1">
                              <input
                                type="number"
                                min={0}
                                aria-label={`${label} de ${MESES[i]}`}
                                value={Math.round(v)}
                                onChange={(e) => setMes(k, i, Number(e.target.value) || 0)}
                                className="w-full min-w-[44px] px-1 py-1.5 rounded bg-surface border border-subtle text-primary text-right focus:outline-none focus:border-brand/50"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-mono text-[11px] leading-relaxed">
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
              className="p-7 lg:p-8 rounded-2xl border border-subtle bg-surface-raised"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] text-brand/50 tracking-widest">02</span>
                <h3 className="font-display text-xl font-semibold">Precipitación vs. ETo mensual</h3>
              </div>
              <div ref={graficaLluviaRef} className="h-[280px]">
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
                <span className="flex items-center gap-1.5 text-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ background: BLUE }} /> Precipitación
                </span>
                <span className="flex items-center gap-1.5 text-mono text-[11px]">
                  <span className="w-2 h-0.5" style={{ background: RED }} /> ETo
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 lg:p-8 rounded-2xl border border-subtle bg-surface-raised"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] text-brand/50 tracking-widest">03</span>
                <h3 className="font-display text-xl font-semibold">Escorrentía capturable por mes</h3>
              </div>
              <div ref={graficaEscRef} className="h-[220px]">
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
              <p className="text-mono text-[11px] mt-3">
                Estimada con el método del Número de Curva (SCS-CN) sobre la precipitación mensual.
              </p>
            </motion.div>
          </div>

          {/* ── Columna derecha: resumen en vivo ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 p-7 lg:p-8 rounded-2xl border border-brand/20 bg-surface-raised"
          >
            <div className="font-mono text-[10px] text-brand/50 tracking-widest uppercase mb-6">
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
                <div key={row.label} className="flex items-baseline justify-between border-b border-subtle pb-3">
                  <span className="text-mono text-sm">{row.label}</span>
                  <span className="font-mono text-lg text-primary font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 mb-6">
              <div className="font-mono text-[9px] text-mono tracking-widest uppercase mb-1">Lectura Keyline</div>
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
              Solicitar estudio hidrológico real
            </a>

            <ExportarPDF className="mt-5" variante="secundario" etiqueta="Descargar balance (PDF)" construir={construirPDF} />

            <p className="mt-5 text-mono text-[11px] leading-relaxed text-center">
              Estimación preliminar — el método CN aplicado a promedios mensuales es una
              aproximación; no reemplaza un estudio hidrológico de campo.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
