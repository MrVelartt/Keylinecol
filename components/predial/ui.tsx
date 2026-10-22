'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { toneClass, type Tone } from '@/lib/tones'
import type { PredialResultado, PredialState } from '@/lib/calculos/predial'

// ── Piezas de interfaz compartidas por los paneles de Diseño Keyline Predial ──

export interface PanelProps {
  s: PredialState
  r: PredialResultado
  /** Actualización inmutable: recibe una copia del estado para mutarla. */
  set: (recipe: (draft: PredialState) => void) => void
}

const fieldBase =
  'w-full px-3 py-2.5 rounded-lg bg-surface border border-subtle text-primary text-sm placeholder:text-faint ' +
  'focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors'

const cellBase =
  'w-full min-w-0 px-2 py-1.5 rounded-md bg-transparent border border-transparent text-primary text-sm ' +
  'hover:border-subtle focus:outline-none focus:border-brand/50 focus:bg-surface transition-colors'

export function PanelHeader({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return <SectionHeader inView size="sm" eyebrow={eyebrow} title={title} subtitle={children} className="mb-8" />
}

export function Card({ title, tag, hint, children }: { title?: ReactNode; tag?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="p-5 lg:p-6 rounded-2xl border border-subtle bg-surface-raised">
      {title && (
        <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-lg font-semibold text-primary mb-1">
          {title}
          {tag && <span className="font-mono text-[10px] font-normal tracking-wide text-mono border border-subtle rounded-full px-2 py-0.5">{tag}</span>}
        </h3>
      )}
      {hint && <p className="text-secondary text-sm leading-relaxed mb-4 max-w-3xl">{hint}</p>}
      {!hint && title && <div className="mb-4" />}
      {children}
    </div>
  )
}

export function Grid({ cols = 3, children, className = '' }: { cols?: 2 | 3 | 4; children: ReactNode; className?: string }) {
  const c = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[cols]
  return <div className={`grid grid-cols-1 ${c} gap-4 ${className}`}>{children}</div>
}

function Label({ id, label, unit }: { id: string; label: string; unit?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 mb-1.5">
      <label htmlFor={id} className="text-secondary text-[13px] leading-snug">
        {label}
      </label>
      {unit && <span className="font-mono text-[10px] text-mono tracking-wide whitespace-nowrap">{unit}</span>}
    </div>
  )
}

/**
 * Entrada numérica con texto local: permite escribir "", "0," o "-" sin que el
 * estado salte a NaN. Confirma el número cuando es válido.
 */
function useNumText(value: number, onChange: (n: number) => void) {
  const [text, setText] = useState(String(value))
  const [focus, setFocus] = useState(false)
  useEffect(() => {
    if (!focus) setText(Number.isFinite(value) ? String(value) : '')
  }, [value, focus])
  return {
    value: text,
    onFocus: () => setFocus(true),
    onBlur: () => {
      setFocus(false)
      setText(String(value))
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value)
      const n = parseFloat(e.target.value.replace(',', '.'))
      if (Number.isFinite(n)) onChange(n)
    },
  }
}

export function NumField({
  label,
  unit,
  value,
  onChange,
  step,
  min,
  max,
  readOnly,
}: {
  label: string
  unit?: string
  value: number
  onChange?: (n: number) => void
  step?: number
  min?: number
  max?: number
  readOnly?: boolean
}) {
  const id = useId()
  const props = useNumText(value, onChange ?? (() => {}))
  return (
    <div>
      <Label id={id} label={label} unit={unit} />
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step ?? 'any'}
        min={min}
        max={max}
        readOnly={readOnly}
        className={`${fieldBase} font-mono-data ${readOnly ? 'text-mono bg-veil' : ''}`}
        {...props}
      />
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  readOnly?: boolean
}) {
  const id = useId()
  return (
    <div>
      <Label id={id} label={label} />
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${fieldBase} ${readOnly ? 'text-mono bg-veil' : ''}`}
      />
    </div>
  )
}

export function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <div>
      <Label id={id} label={label} />
      <select
        id={id}
        value={String(value)}
        onChange={(e) => {
          const o = options.find((x) => String(x.value) === e.target.value)
          if (o) onChange(o.value)
        }}
        className={`${fieldBase} appearance-none cursor-pointer`}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)} className="bg-surface">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Celdas editables de tabla ──
export function NumCell({ value, onChange, step, label }: { value: number; onChange: (n: number) => void; step?: number; label: string }) {
  const props = useNumText(value, onChange)
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step ?? 'any'}
      aria-label={label}
      className={`${cellBase} font-mono-data text-right`}
      {...props}
    />
  )
}

export function TextCell({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={cellBase} />
}

export function SelectCell({
  value,
  options,
  onChange,
  label,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  label: string
}) {
  const known = options.some((o) => o.value === value)
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${cellBase} cursor-pointer`}>
      {!known && <option value={value}>{value}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-surface">
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Table({ children, minWidth = 640 }: { children: ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-sm border-collapse [&_th]:font-mono [&_th]:text-[10px] [&_th]:tracking-wide [&_th]:uppercase [&_th]:text-mono [&_th]:font-normal [&_th]:text-left [&_th]:px-2 [&_th]:py-2 [&_th]:border-b [&_th]:border-subtle [&_td]:px-2 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-subtle [&_td]:align-middle [&_tfoot_td]:border-b-0 [&_tfoot_td]:text-primary [&_tfoot_td]:font-semibold [&_tfoot_tr:first-child_td]:border-t [&_tfoot_tr:first-child_td]:border-strong"
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  )
}

/** Celda numérica de solo lectura. */
export function Num({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <td className={`text-right font-mono-data whitespace-nowrap ${muted ? 'text-mono' : 'text-primary'}`}>{children}</td>
}

export function DelButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-7 h-7 rounded-md text-mono hover:text-signal-deficit hover:bg-veil transition-colors"
    >
      ×
    </button>
  )
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 px-3 py-1.5 rounded-lg border border-dashed border-strong text-secondary text-[13px] hover:border-brand/50 hover:text-brand transition-colors"
    >
      + {children}
    </button>
  )
}

// ── Indicadores ──
export function Stat({
  k,
  v,
  sub,
  accent,
  tone,
}: {
  k: string
  v: ReactNode
  sub?: ReactNode
  /** Indicador principal del panel: borde y valor en verde de marca. */
  accent?: boolean
  tone?: Tone
}) {
  const border = tone ? toneClass[tone] : accent ? 'border-brand/30 bg-brand/[0.05]' : 'border-subtle bg-surface-raised'
  return (
    <div className={`p-4 rounded-xl border ${border}`}>
      <div className="font-mono text-[10px] tracking-wide uppercase text-mono mb-1.5">{k}</div>
      <div className={`font-mono-data text-lg leading-tight ${accent ? 'text-brand' : 'text-primary'}`}>{v}</div>
      {sub && <div className="text-mono text-[11px] mt-1 leading-snug">{sub}</div>}
    </div>
  )
}

export function Stats({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3">{children}</div>
}

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`inline-block px-2 py-0.5 rounded-full border font-mono text-[10px] ${toneClass[tone]}`}>{children}</span>
}

export function Note({ tone, children }: { tone?: Tone; children: ReactNode }) {
  const cls = tone === 'warn' || tone === 'bad' ? toneClass[tone] : 'border-subtle bg-veil text-secondary'
  return <div className={`mt-4 p-4 rounded-xl border text-sm leading-relaxed [&_strong]:text-primary ${cls}`}>{children}</div>
}
