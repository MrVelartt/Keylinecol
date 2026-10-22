'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'

interface AnimalType {
  id: string
  label: string
  litersPerDay: number
}

interface HerdGroup {
  id: string
  animalTypeId: string
  count: number
  litersPerDay: number
}

// ── Valores de referencia iniciales — estimaciones tomadas del caso Casanare ──
// TODO: calibrar con mediciones reales en campo (consumo por tipo de animal,
// tarifas de maquinaria) antes de usar estos números como cotización formal.
const ANIMAL_TYPES: AnimalType[] = [
  { id: 'bovino', label: 'Bovino', litersPerDay: 50 },
  { id: 'equino', label: 'Equino', litersPerDay: 40 },
  { id: 'ovino-caprino', label: 'Ovino / Caprino', litersPerDay: 8 },
  { id: 'porcino', label: 'Porcino', litersPerDay: 15 },
  { id: 'aves', label: 'Aves de corral', litersPerDay: 0.25 },
]

const DEFAULT_SHRINK_FACTOR = 1.2 // TODO: calibrar 1.20–1.30 según tipo de suelo
const DEFAULT_EXCAVATOR_RATE = 40 // m³/hr · TODO: calibrar con rendimiento real de proveedor
const DEFAULT_MACHINE_HOUR_VALUE = 250000 // COP · TODO: actualizar con tarifa vigente
const DEFAULT_TRANSPORT_COST = 2000000 // COP · TODO: actualizar con cotización vigente
const DEFAULT_CONTINGENCY_PCT = 0 // % · en 0 reproduce exacto el caso de referencia
const DEFAULT_MANUAL_WATER_VOLUME = 4000 // m³ · valor de referencia caso Casanare

const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })
const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-surface border border-subtle text-primary placeholder:text-mono text-sm ' +
  'focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all ' +
  'disabled:opacity-40 disabled:cursor-not-allowed'

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

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.12 1.532 5.847L.057 23.617l5.9-1.548A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.026-1.387l-.36-.215-3.494.917.93-3.4-.234-.375A9.818 9.818 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818 5.421 0 9.818 4.397 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 1.5v9M8 10.5L4.5 7M8 10.5L11.5 7M2 12.5v1a1 1 0 001 1h10a1 1 0 001-1v-1"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M2.5 4.5h11M6 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5M12.5 4.5l-.6 8.4a1 1 0 01-1 .93H5.1a1 1 0 01-1-.93l-.6-8.4"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function Herramientas() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const uid = useId()
  const nextGroupId = useRef(2)

  const [projectName, setProjectName] = useState('')

  // ── Calculadora 1: demanda hídrica (hato mixto) ──
  const [groups, setGroups] = useState<HerdGroup[]>([
    { id: 'g1', animalTypeId: 'bovino', count: 100, litersPerDay: 50 },
  ])
  const [autonomyDays, setAutonomyDays] = useState(30)

  const addGroup = () => {
    const id = `g${nextGroupId.current++}`
    setGroups((prev) => [...prev, { id, animalTypeId: 'bovino', count: 0, litersPerDay: ANIMAL_TYPES[0].litersPerDay }])
  }

  const removeGroup = (id: string) => {
    setGroups((prev) => (prev.length > 1 ? prev.filter((g) => g.id !== id) : prev))
  }

  const updateGroup = (id: string, patch: Partial<HerdGroup>) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }

  const handleAnimalTypeChange = (id: string, animalTypeId: string) => {
    const type = ANIMAL_TYPES.find((a) => a.id === animalTypeId)
    updateGroup(id, { animalTypeId, litersPerDay: type ? type.litersPerDay : 0 })
  }

  const totalAnimals = useMemo(() => groups.reduce((sum, g) => sum + g.count, 0), [groups])
  const totalDailyLiters = useMemo(
    () => groups.reduce((sum, g) => sum + g.litersPerDay * g.count, 0),
    [groups]
  )
  const waterVolumeM3 = (totalDailyLiters / 1000) * autonomyDays

  // ── Calculadora 2: movimiento de tierra ──
  const [syncWithCalc1, setSyncWithCalc1] = useState(true)
  const [manualWaterVolume, setManualWaterVolume] = useState(DEFAULT_MANUAL_WATER_VOLUME)
  const [shrinkFactor, setShrinkFactor] = useState(DEFAULT_SHRINK_FACTOR)
  const [excavatorRate, setExcavatorRate] = useState(DEFAULT_EXCAVATOR_RATE)
  const [machineHourValue, setMachineHourValue] = useState(DEFAULT_MACHINE_HOUR_VALUE)
  const [transportCost, setTransportCost] = useState(DEFAULT_TRANSPORT_COST)
  const [contingencyPct, setContingencyPct] = useState(DEFAULT_CONTINGENCY_PCT)

  const effectiveWaterVolume = syncWithCalc1 ? waterVolumeM3 : manualWaterVolume
  const excavationVolumeM3 = effectiveWaterVolume * shrinkFactor
  const machineHours = excavatorRate > 0 ? excavationVolumeM3 / excavatorRate : 0
  const machineCost = machineHours * machineHourValue
  const subtotal = machineCost + transportCost
  const contingencyAmount = subtotal * (contingencyPct / 100)
  const totalBudget = subtotal + contingencyAmount

  const waMessage = encodeURIComponent(
    `Hola, quiero una cotización real${projectName.trim() ? ` para ${projectName.trim()}` : ' para mi finca'}.\n` +
      'Esta es una estimación preliminar hecha con la calculadora del sitio:\n' +
      `- Agua requerida: ${nf.format(effectiveWaterVolume)} m³\n` +
      `- Tierra a excavar: ${nf.format(excavationVolumeM3)} m³\n` +
      `- Horas de máquina: ${nf.format(machineHours)} hr\n` +
      `- Presupuesto estimado: ${cop.format(totalBudget)}`
  )

  const handleDownloadPdf = async () => {
    const { descargarPDF } = await import('@/lib/pdf/reporte')
    await descargarPDF({
      herramienta: 'Demanda hídrica pecuaria y movimiento de tierra',
      titulo: 'Cotización preliminar de reservorio',
      subtitulo: 'Demanda hídrica del hato, volumen a almacenar, movimiento de tierra y presupuesto estimado.',
      cliente: projectName,
      slug: 'demanda-y-movimiento',
      disclaimer:
        'Estimación preliminar: no reemplaza un diseño técnico Keyline. Los consumos, tarifas y rendimientos son de referencia y deben calibrarse con datos reales de campo.',
      bloques: [
        {
          tipo: 'kpis',
          items: [
            { k: 'Agua a almacenar', v: `${nf.format(effectiveWaterVolume)} m³`, sub: syncWithCalc1 ? `${autonomyDays} días de autonomía` : 'volumen fijado a mano' },
            { k: 'Tierra a excavar', v: `${nf.format(excavationVolumeM3)} m³`, sub: `factor ${shrinkFactor.toFixed(2)}` },
            { k: 'Presupuesto estimado', v: cop.format(totalBudget), sub: `${nf.format(machineHours)} h de máquina` },
          ],
        },
        { tipo: 'titulo', texto: '1. Demanda hídrica pecuaria' },
        {
          tipo: 'tabla',
          head: ['Tipo de animal', 'Cantidad', 'L/día por animal', 'L/día total'],
          body: groups.map((g) => [
            ANIMAL_TYPES.find((a) => a.id === g.animalTypeId)?.label ?? g.animalTypeId,
            nf.format(g.count),
            nf.format(g.litersPerDay),
            nf.format(g.litersPerDay * g.count),
          ]),
          foot: [['Total', nf.format(totalAnimals), '', nf.format(totalDailyLiters)]],
        },
        {
          tipo: 'kv',
          filas: [
            ['Días de autonomía deseados', String(autonomyDays)],
            ['Volumen de agua requerido', `${nf.format(waterVolumeM3)} m³`],
          ],
        },
        { tipo: 'titulo', texto: '2. Movimiento de tierra' },
        {
          tipo: 'kv',
          filas: [
            ['Volumen de agua a almacenar', `${nf.format(effectiveWaterVolume)} m³`],
            ['Factor de esponjamiento', shrinkFactor.toFixed(2)],
            ['Volumen de excavación', `${nf.format(excavationVolumeM3)} m³`],
            ['Rendimiento de excavadora', `${nf.format(excavatorRate)} m³/h`],
            ['Horas de máquina estimadas', `${nf.format(machineHours)} h`],
          ],
        },
        { tipo: 'titulo', texto: '3. Presupuesto estimado' },
        {
          tipo: 'tabla',
          head: ['Concepto', 'Valor'],
          body: [
            [`Excavación (${nf.format(machineHours)} h × ${cop.format(machineHourValue)})`, cop.format(machineCost)],
            ['Transporte', cop.format(transportCost)],
            ['Subtotal', cop.format(subtotal)],
            [`Contingencia (${contingencyPct} %)`, cop.format(contingencyAmount)],
          ],
          foot: [['TOTAL ESTIMADO', cop.format(totalBudget)]],
        },
      ],
    })
  }

  return (
    <section id="herramientas" className="py-32 lg:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none dot-grid" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div ref={ref} className="mb-16 max-w-3xl">
          <SectionHeader
            inView={inView}
            className=""
            eyebrow="Herramientas Técnicas"
            title={
              <>
                Estima tu{' '}
                <Accent>reserva de agua</Accent>
              </>
            }
            subtitle={
              <>
                Calcula cuánta agua necesita tu hato y cuánta tierra hay que mover para
                almacenarla. Ajusta los valores según tu finca, descarga la cotización o
                escríbenos directamente por WhatsApp.
              </>
            }
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-10 items-start">
          {/* ── Columna izquierda: calculadoras ── */}
          <div className="space-y-6">
            {/* Datos del proyecto */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="p-6 lg:p-7 rounded-2xl border border-subtle bg-surface-raised"
            >
              <Field id={`${uid}-project-name`} label="Nombre de la finca o cliente" hint="opcional · para tu cotización">
                <input
                  id={`${uid}-project-name`}
                  type="text"
                  placeholder="Ej. Finca La Esperanza"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </motion.div>

            {/* Calculadora 1 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 lg:p-8 rounded-2xl border border-subtle bg-surface-raised"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] text-brand/50 tracking-widest">01</span>
                <h3 className="font-display text-xl font-semibold">Demanda hídrica pecuaria</h3>
              </div>

              <div className="space-y-4 mb-5">
                {groups.map((group, idx) => (
                  <div
                    key={group.id}
                    className="relative p-5 rounded-xl bg-surface/60 border border-subtle"
                  >
                    {groups.length > 1 && (
                      <button
                        onClick={() => removeGroup(group.id)}
                        aria-label={`Quitar grupo de animales ${idx + 1}`}
                        className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-mono hover:text-signal-deficit hover:bg-signal-deficit/10 transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    )}
                    <div className="grid sm:grid-cols-3 gap-4 pr-8">
                      <Field id={`${uid}-${group.id}-type`} label="Tipo de animal">
                        <select
                          id={`${uid}-${group.id}-type`}
                          value={group.animalTypeId}
                          onChange={(e) => handleAnimalTypeChange(group.id, e.target.value)}
                          className={inputClass}
                        >
                          {ANIMAL_TYPES.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field id={`${uid}-${group.id}-count`} label="Cantidad">
                        <input
                          id={`${uid}-${group.id}-count`}
                          type="number"
                          min={0}
                          value={group.count}
                          onChange={(e) => updateGroup(group.id, { count: Number(e.target.value) || 0 })}
                          className={inputClass}
                        />
                      </Field>

                      <Field
                        id={`${uid}-${group.id}-liters`}
                        label="Consumo (L/día)"
                        hint="por animal · editable"
                      >
                        <input
                          id={`${uid}-${group.id}-liters`}
                          type="number"
                          min={0}
                          step={0.1}
                          value={group.litersPerDay}
                          onChange={(e) => updateGroup(group.id, { litersPerDay: Number(e.target.value) || 0 })}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addGroup}
                className="w-full mb-5 py-3 rounded-xl border border-dashed border-strong text-mono text-sm hover:text-brand hover:border-brand/40 transition-colors"
              >
                + Agregar grupo de animales
              </button>

              <div className="flex items-baseline justify-between mb-5 px-1 text-[12px]">
                <span className="text-mono">
                  {nf.format(totalAnimals)} animales en total
                </span>
                <span className="font-mono text-mono">{nf.format(totalDailyLiters)} L/día</span>
              </div>

              <div className="max-w-xs">
                <Field id={`${uid}-autonomy-days`} label="Días de autonomía deseados">
                  <input
                    id={`${uid}-autonomy-days`}
                    type="number"
                    min={0}
                    value={autonomyDays}
                    onChange={(e) => setAutonomyDays(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </motion.div>

            {/* Calculadora 2 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 lg:p-8 rounded-2xl border border-subtle bg-surface-raised"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] text-brand/50 tracking-widest">02</span>
                <h3 className="font-display text-xl font-semibold">Movimiento de tierra</h3>
              </div>

              <div className="mb-5 flex items-center gap-3">
                <input
                  id={`${uid}-sync-calc`}
                  type="checkbox"
                  checked={syncWithCalc1}
                  onChange={(e) => setSyncWithCalc1(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand"
                />
                <label htmlFor={`${uid}-sync-calc`} className="text-secondary text-sm">
                  Usar el resultado de la calculadora de demanda hídrica pecuaria
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field id={`${uid}-water-volume`} label="Volumen de agua a almacenar" hint="m³">
                  <input
                    id={`${uid}-water-volume`}
                    type="number"
                    min={0}
                    disabled={syncWithCalc1}
                    value={syncWithCalc1 ? Math.round(waterVolumeM3 * 100) / 100 : manualWaterVolume}
                    onChange={(e) => setManualWaterVolume(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>

                <Field
                  id={`${uid}-shrink-factor`}
                  label="Factor de esponjamiento"
                  hint={`${shrinkFactor.toFixed(2)} · rango 1.20–1.30`}
                >
                  <input
                    id={`${uid}-shrink-factor`}
                    type="range"
                    min={1.2}
                    max={1.3}
                    step={0.01}
                    value={shrinkFactor}
                    onChange={(e) => setShrinkFactor(Number(e.target.value))}
                    className="w-full accent-brand mt-3.5"
                  />
                </Field>

                <Field id={`${uid}-excavator-rate`} label="Rendimiento de excavadora" hint="m³/hr · editable">
                  <input
                    id={`${uid}-excavator-rate`}
                    type="number"
                    min={1}
                    value={excavatorRate}
                    onChange={(e) => setExcavatorRate(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>

                <Field id={`${uid}-machine-hour-value`} label="Valor hora/máquina" hint="COP · editable">
                  <input
                    id={`${uid}-machine-hour-value`}
                    type="number"
                    min={0}
                    value={machineHourValue}
                    onChange={(e) => setMachineHourValue(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>

                <Field id={`${uid}-transport-cost`} label="Costo de transporte" hint="COP · editable">
                  <input
                    id={`${uid}-transport-cost`}
                    type="number"
                    min={0}
                    value={transportCost}
                    onChange={(e) => setTransportCost(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>

                <Field id={`${uid}-contingency`} label="Contingencia" hint="% · opcional, default 0%">
                  <input
                    id={`${uid}-contingency`}
                    type="number"
                    min={0}
                    max={50}
                    value={contingencyPct}
                    onChange={(e) => setContingencyPct(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </motion.div>
          </div>

          {/* ── Columna derecha: dashboard ── */}
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
                { label: 'Agua requerida', value: `${nf.format(effectiveWaterVolume)} m³` },
                { label: 'Tierra a excavar', value: `${nf.format(excavationVolumeM3)} m³` },
                { label: 'Horas de máquina', value: `${nf.format(machineHours)} hr` },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between border-b border-subtle pb-3"
                >
                  <span className="text-mono text-sm">{row.label}</span>
                  <span className="font-mono text-lg text-primary font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Presupuesto itemizado */}
            <div className="mb-6 p-4 rounded-xl bg-surface/60 border border-subtle space-y-2.5">
              <div className="font-mono text-[9px] text-mono tracking-widest uppercase mb-1">
                Presupuesto itemizado
              </div>
              {[
                { label: 'Excavación', value: cop.format(machineCost) },
                { label: 'Transporte', value: cop.format(transportCost) },
                ...(contingencyPct > 0
                  ? [{ label: `Contingencia (${contingencyPct}%)`, value: cop.format(contingencyAmount) }]
                  : []),
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between text-[13px]">
                  <span className="text-mono">{row.label}</span>
                  <span className="font-mono text-secondary">{row.value}</span>
                </div>
              ))}
              <div className="pt-2.5 mt-1 border-t border-subtle flex items-baseline justify-between">
                <span className="text-secondary text-sm font-medium">Total estimado</span>
                <span className="font-display text-2xl font-semibold text-brand">
                  {cop.format(totalBudget)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-full border border-strong text-secondary text-sm font-medium hover:border-brand/40 hover:text-brand transition-all duration-200"
              >
                Descargar cotización (PDF)
                <DownloadIcon />
              </button>

              <a
                href={`https://wa.me/573113650567?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-brand text-surface rounded-full font-semibold text-sm hover:bg-brand-hover transition-all duration-200 hover:shadow-glow-lg hover:scale-[1.02]"
              >
                Solicitar cotización real
                <WhatsAppIcon />
              </a>
            </div>

            <p className="mt-5 text-mono text-[11px] leading-relaxed text-center">
              Estimación preliminar — no reemplaza un diseño técnico Keyline.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
