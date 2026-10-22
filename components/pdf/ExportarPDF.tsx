'use client'

import { useEffect, useId, useState } from 'react'
import type { Reporte } from '@/lib/pdf/reporte'

// ── Botón común «Descargar PDF» ──
// Opcionalmente muestra el campo «Finca o cliente», compartido entre todas las
// herramientas (se recuerda en este navegador) y usado en la cabecera y el
// nombre del archivo.

const KEY_CLIENTE = 'keyline.cliente'

export function useCliente() {
  const [cliente, setCliente] = useState('')
  useEffect(() => {
    try {
      setCliente(window.localStorage.getItem(KEY_CLIENTE) ?? '')
    } catch {
      /* almacenamiento no disponible */
    }
  }, [])
  const guardar = (v: string) => {
    setCliente(v)
    try {
      window.localStorage.setItem(KEY_CLIENTE, v)
    } catch {
      /* ignorar */
    }
  }
  return [cliente, guardar] as const
}

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

export default function ExportarPDF({
  construir,
  conCliente = true,
  etiqueta = 'Descargar PDF',
  variante = 'primario',
  className = '',
}: {
  /** Arma el informe con el cliente escrito (puede ser async para rasterizar gráficas). */
  construir: (cliente: string) => Reporte | Promise<Reporte>
  /** Muestra el campo «Finca o cliente». */
  conCliente?: boolean
  etiqueta?: string
  variante?: 'primario' | 'secundario'
  className?: string
}) {
  const id = useId()
  const [cliente, setCliente] = useCliente()
  const [estado, setEstado] = useState<'listo' | 'generando' | 'error'>('listo')

  const descargar = async () => {
    setEstado('generando')
    try {
      const { descargarPDF } = await import('@/lib/pdf/reporte')
      await descargarPDF(await construir(cliente))
      setEstado('listo')
    } catch (e) {
      console.error('[PDF]', e)
      setEstado('error')
    }
  }

  const btn =
    variante === 'primario'
      ? 'bg-brand text-surface hover:bg-brand-hover hover:shadow-glow font-semibold'
      : 'border border-strong text-primary hover:border-brand/50 hover:text-brand'

  return (
    <div className={`flex flex-col sm:flex-row sm:items-end gap-3 ${className}`}>
      {conCliente && (
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="block text-secondary text-[13px] mb-1.5">
            Finca o cliente <span className="text-mono text-[11px]">· opcional, va en el PDF</span>
          </label>
          <input
            id={id}
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ej. Finca La Esperanza"
            className="w-full px-3 py-2.5 rounded-lg bg-surface border border-subtle text-primary text-sm placeholder:text-faint focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
      )}
      <button
        type="button"
        onClick={descargar}
        disabled={estado === 'generando'}
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] transition-all disabled:opacity-60 disabled:cursor-wait ${btn}`}
      >
        <DownloadIcon />
        {estado === 'generando' ? 'Generando…' : etiqueta}
      </button>
      {estado === 'error' && (
        <p role="alert" className="text-signal-deficit text-[12px]">
          No se pudo generar el PDF. Intente de nuevo.
        </p>
      )}
    </div>
  )
}
