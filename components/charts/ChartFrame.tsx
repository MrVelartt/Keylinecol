'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'
import { series, type SeriesRole } from '@/lib/chart-theme'

// Contenedor estándar de gráfica. Resuelve el render vacío de Recharts:
// ResponsiveContainer necesita un padre con alto explícito Y ancho medido > 0.
// Si se monta dentro de un bloque animado (framer-motion) o una pestaña que
// aún no tiene dimensiones, mide 0×0 y no vuelve a dibujar. Aquí el alto es
// fijo en px y el gráfico se monta solo cuando el ResizeObserver reporta ancho.

export type LegendItem = { role: SeriesRole; label: string; dashed?: boolean }

export default function ChartFrame({
  title,
  icon,
  height = 280,
  legend,
  note,
  children,
  className = '',
}: {
  title: ReactNode
  icon?: ReactNode
  height?: number
  legend?: LegendItem[]
  note?: ReactNode
  children: ReactNode
  className?: string
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const check = () => {
      if (el.clientWidth > 0) setReady(true)
    }
    check()
    if (typeof ResizeObserver === 'undefined') {
      setReady(true)
      return
    }
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className={`p-6 lg:p-7 rounded-2xl border border-subtle bg-surface-raised ${className}`}>
      <div className="flex items-center gap-2 font-mono text-[11px] text-mono tracking-wide uppercase mb-4">
        {icon}
        {title}
      </div>
      <div ref={boxRef} style={{ height }} className="w-full min-w-0">
        {ready && (
          <ResponsiveContainer width="100%" height={height}>
            {children as React.ReactElement}
          </ResponsiveContainer>
        )}
      </div>
      {legend && legend.length > 0 && (
        <div className="flex flex-wrap items-center gap-5 mt-3">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-mono text-[11px]">
              {l.dashed ? (
                <span className="w-3 border-t border-dashed" style={{ borderColor: series[l.role] }} />
              ) : (
                <span className="w-2 h-2 rounded-full" style={{ background: series[l.role] }} />
              )}
              {l.label}
            </span>
          ))}
        </div>
      )}
      {note && <p className="text-mono text-[11px] mt-3 leading-relaxed">{note}</p>}
    </div>
  )
}
