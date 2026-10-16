'use client'

// Tooltip único para todas las gráficas del sitio: fondo surface-raised, borde
// subtle, tipografía mono. Muestra el nombre de la serie cuando hay más de una.

const nf1 = (v: number) => v.toLocaleString('es-CO', { maximumFractionDigits: 1 })

type Payload = { value: number; dataKey: string | number; name?: string; color?: string }

export default function ChartTooltip({
  active,
  payload,
  label,
  unit,
  format = nf1,
}: {
  active?: boolean
  payload?: Payload[]
  label?: string
  unit?: string
  format?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  const multi = payload.length > 1
  return (
    <div className="rounded-lg border border-subtle bg-surface-raised px-3 py-2 shadow-xl font-mono">
      <div className="text-[10px] text-mono mb-1">{label}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2 text-sm text-primary">
          {multi && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />}
          {multi && p.name && <span className="text-mono text-[11px]">{p.name}</span>}
          <span>
            {format(p.value)}
            {unit ? ` ${unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
