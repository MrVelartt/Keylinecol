'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  PERMANENCE_FACTORS,
  STATUS_LABEL,
  assessPermanence,
  type PermanenceStatus,
} from '@/lib/permanenceScale'
import { toneClass, toneColor, type Tone } from '@/lib/tones'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'
import ExportarPDF from '@/components/pdf/ExportarPDF'
import type { Reporte } from '@/lib/pdf/reporte'


const STATUS_TONE: Record<PermanenceStatus, Tone> = {
  resuelto: 'good',
  parcial: 'warn',
  pendiente: 'bad',
}

const STATUS_ORDER: PermanenceStatus[] = ['pendiente', 'parcial', 'resuelto']

const DEFAULT_STATUSES: Record<string, PermanenceStatus> = Object.fromEntries(
  PERMANENCE_FACTORS.map((f) => [f.id, 'pendiente' as PermanenceStatus])
)

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg bg-surface border border-subtle text-primary placeholder:text-mono text-[13px] ' +
  'focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all'

function StatusToggle({
  value,
  onChange,
  idPrefix,
}: {
  value: PermanenceStatus
  onChange: (v: PermanenceStatus) => void
  idPrefix: string
}) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Estado del factor">
      {STATUS_ORDER.map((status) => {
        const active = value === status
        const tone = STATUS_TONE[status]
        return (
          <button
            key={status}
            type="button"
            id={`${idPrefix}-${status}`}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(status)}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-medium tracking-wide transition-all ${
              active ? toneClass[tone] : 'text-mono bg-transparent border-subtle hover:border-strong hover:text-secondary'
            }`}
          >
            {STATUS_LABEL[status]}
          </button>
        )
      })}
    </div>
  )
}

export default function EscalaPermanencia() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const uid = useId()

  const [statuses, setStatuses] = useState<Record<string, PermanenceStatus>>(DEFAULT_STATUSES)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const setStatus = (id: string, status: PermanenceStatus) =>
    setStatuses((prev) => ({ ...prev, [id]: status }))

  const setNote = (id: string, note: string) => setNotes((prev) => ({ ...prev, [id]: note }))

  const resetAll = () => {
    setStatuses(DEFAULT_STATUSES)
    setNotes({})
  }

  const assessment = useMemo(() => assessPermanence(statuses), [statuses])
  const { readinessPct, bottleneck, atRiskFactors } = assessment

  const readinessTone: Tone = readinessPct >= 80 ? 'good' : readinessPct >= 40 ? 'warn' : 'bad'
  const readinessColor = toneColor[readinessTone]

  const construirPDF = (cliente: string): Reporte => ({
    herramienta: 'Escala de Permanencia',
    titulo: 'Diagnóstico con la Escala de Permanencia',
    subtitulo: 'Los 10 factores de diseño de P.A. Yeomans, de lo más fijo a lo más flexible, con el estado real de la finca.',
    cliente,
    slug: 'escala-de-permanencia',
    disclaimer: 'Autoevaluación orientativa: no reemplaza una visita técnica ni un diseño Keyline en campo.',
    bloques: [
      {
        tipo: 'kpis',
        items: [
          { k: 'Avance', v: `${readinessPct} % resuelto` },
          { k: 'Prioridad', v: bottleneck ? `${String(bottleneck.order).padStart(2, '0')} · ${bottleneck.title}` : 'Todo resuelto' },
          { k: 'Decisiones prematuras', v: String(atRiskFactors.length), sub: atRiskFactors.map((f) => f.shortLabel).join(', ') || undefined },
        ],
      },
      ...(bottleneck
        ? [{ tipo: 'nota' as const, tono: 'warn' as const, texto: `Resolver primero: ${bottleneck.title}. ${bottleneck.why}` }]
        : [{ tipo: 'nota' as const, tono: 'good' as const, texto: 'Los 10 factores están resueltos: la finca tiene una base sólida para afinar economía y estética.' }]),
      ...(atRiskFactors.length > 0
        ? [
            {
              tipo: 'parrafo' as const,
              texto: `Marcados como resueltos antes de resolver ${bottleneck?.title ?? ''}: ${atRiskFactors.map((f) => f.title).join(', ')}. Conviene revisarlos cuando ese factor cambie.`,
            },
          ]
        : []),
      { tipo: 'titulo', texto: 'Los 10 factores, en orden' },
      {
        tipo: 'tabla',
        head: ['#', 'Factor', 'Estado', 'Nota de la finca'],
        body: PERMANENCE_FACTORS.map((f) => [
          String(f.order).padStart(2, '0'),
          f.title,
          STATUS_LABEL[statuses[f.id] ?? 'pendiente'],
          notes[f.id]?.trim() || '—',
        ]),
        alinear: ['left', 'left', 'left', 'left'],
        anchos: [6, 24, 14, 56],
      },
    ],
  })

  const waMessage = encodeURIComponent(
    `Hola, quiero un diagnóstico real de mi finca con la Escala de Permanencia.\n` +
      `Con la herramienta del sitio obtuve un avance de ${readinessPct}% y el factor pendiente ` +
      `de mayor prioridad es: ${bottleneck ? bottleneck.title : 'ninguno — todo resuelto'}.`
  )

  return (
    <section id="escala-permanencia" className="py-32 lg:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none dot-grid" />

      <div className="max-w-7xl mx-auto relative">
        <div ref={ref} className="mb-16 max-w-3xl">
          <SectionHeader
            inView={inView}
            className=""
            eyebrow="Herramientas Técnicas"
            number="05"
            title={
              <>
                Ordena tu <Accent>finca</Accent>
              </>
            }
            subtitle={
              <>
                La Escala de Permanencia de P.A. Yeomans ordena las decisiones de diseño
                de lo más fijo (clima, topografía) a lo más flexible (economía, estética).
                Marca el estado real de cada factor en tu finca y descubre cuál necesitas
                resolver primero antes de fijar los siguientes.
              </>
            }
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-10 items-start">
          {/* ── Columna izquierda: los 10 factores ── */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-brand/50 tracking-widest">01</span>
                <h3 className="font-display text-xl font-semibold">Los 10 factores, en orden</h3>
              </div>
              <button onClick={resetAll} className="text-mono text-xs hover:text-brand transition-colors">
                Reiniciar diagnóstico
              </button>
            </motion.div>

            {PERMANENCE_FACTORS.map((factor, idx) => {
              const status = statuses[factor.id] ?? 'pendiente'
              const isBottleneck = bottleneck?.id === factor.id
              const isAtRisk = atRiskFactors.some((f) => f.id === factor.id)

              return (
                <motion.div
                  key={factor.id}
                  initial={{ opacity: 0, y: 32 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.12 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative p-6 lg:p-7 rounded-2xl border bg-surface-raised transition-colors duration-300 ${
                    isBottleneck
                      ? 'border-brand/40'
                      : isAtRisk
                      ? 'border-signal-demand/30'
                      : 'border-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-mono tracking-widest w-6 shrink-0">
                        {String(factor.order).padStart(2, '0')}
                      </span>
                      <h4 className="font-display text-lg font-semibold">{factor.title}</h4>
                      {isBottleneck && (
                        <span className="px-2.5 py-0.5 rounded-full border border-brand/35 bg-brand/10 text-brand text-[10px] font-medium tracking-wide">
                          Prioridad
                        </span>
                      )}
                      {isAtRisk && !isBottleneck && (
                        <span className="px-2.5 py-0.5 rounded-full border border-signal-demand/30 bg-signal-demand/10 text-signal-demand text-[10px] font-medium tracking-wide">
                          Decidido antes de tiempo
                        </span>
                      )}
                    </div>
                    <StatusToggle
                      value={status}
                      onChange={(v) => setStatus(factor.id, v)}
                      idPrefix={`${uid}-${factor.id}`}
                    />
                  </div>

                  <p className="text-secondary text-sm leading-relaxed mb-2">{factor.question}</p>
                  <p className="text-mono text-[12px] leading-relaxed mb-4">{factor.why}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {factor.examples.map((ex) => (
                      <span
                        key={ex}
                        className="px-2.5 py-1 rounded-full bg-surface/60 border border-subtle text-mono text-[11px]"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Nota sobre el estado de este factor en tu finca (opcional)"
                    value={notes[factor.id] ?? ''}
                    onChange={(e) => setNote(factor.id, e.target.value)}
                    className={inputClass}
                  />
                </motion.div>
              )
            })}
          </div>

          {/* ── Columna derecha: diagnóstico ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 p-7 lg:p-8 rounded-2xl border border-brand/20 bg-surface-raised"
          >
            <div className="font-mono text-[10px] text-brand/50 tracking-widest uppercase mb-6">
              Diagnóstico en vivo
            </div>

            <div className="flex items-end gap-2 mb-2">
              <span className="font-display text-5xl font-semibold" style={{ color: readinessColor }}>
                {readinessPct}
              </span>
              <span className="text-mono text-sm mb-1.5">% resuelto</span>
            </div>
            <div className="h-2 rounded-full bg-veil-strong overflow-hidden mb-6">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${readinessPct}%`, background: readinessColor }}
              />
            </div>

            <div className="mb-6">
              <div className="font-mono text-[9px] text-mono tracking-widest uppercase mb-2.5">
                Prioridad según la escala
              </div>
              {bottleneck ? (
                <div className={`p-4 rounded-xl border text-[13px] leading-relaxed ${toneClass.bad}`}>
                  <div className="font-semibold mb-1.5">
                    {String(bottleneck.order).padStart(2, '0')} · {bottleneck.title}
                  </div>
                  <p className="text-secondary text-[12px]">{bottleneck.why}</p>
                </div>
              ) : (
                <div className={`p-4 rounded-xl border text-[13px] leading-relaxed ${toneClass.good}`}>
                  Los 10 factores están resueltos. La finca tiene una base sólida para
                  afinar economía y estética con libertad.
                </div>
              )}
            </div>

            {atRiskFactors.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-surface/60 border border-signal-demand/20 space-y-1.5">
                <div className="font-mono text-[9px] text-signal-demand/70 tracking-widest uppercase mb-1">
                  Posibles decisiones prematuras
                </div>
                <p className="text-mono text-[12px] leading-relaxed">
                  Estos factores se marcaron como resueltos antes de resolver{' '}
                  <span className="text-secondary">{bottleneck?.title}</span> — vale la pena
                  revisarlos cuando ese factor cambie:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {atRiskFactors.map((f) => (
                    <span
                      key={f.id}
                      className="px-2.5 py-1 rounded-full bg-signal-demand/10 border border-signal-demand/25 text-signal-demand text-[11px]"
                    >
                      {f.shortLabel}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <a
              href={`https://wa.me/573113650567?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-brand text-surface rounded-full font-semibold text-sm hover:bg-brand-hover transition-all duration-200 hover:shadow-glow-lg hover:scale-[1.02]"
            >
              Solicitar diagnóstico Keyline real
            </a>

            <ExportarPDF className="mt-5" variante="secundario" etiqueta="Descargar diagnóstico (PDF)" construir={construirPDF} />

            <p className="mt-5 text-mono text-[11px] leading-relaxed text-center">
              Autoevaluación orientativa — no reemplaza una visita técnica ni un diseño Keyline en campo.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
