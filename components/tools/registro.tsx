import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

// ── slug → componente de herramienta ──
// Cada herramienta es un fragmento de JS aparte: la ruta /herramientas/[slug]
// solo descarga la que muestra.

const Cargando = () => <div className="h-[60vh] rounded-2xl border border-subtle bg-surface-raised animate-pulse" aria-busy="true" />

export const COMPONENTES: Record<string, ComponentType> = {
  'demanda-hidrica-pecuaria': dynamic(() => import('@/components/DemandaPecuaria'), { loading: Cargando }),
  'movimiento-de-tierra': dynamic(() => import('@/components/MovimientoTierra'), { loading: Cargando }),
  'analisis-de-suelo': dynamic(() => import('@/components/CalculadoraSuelo'), { loading: Cargando }),
  'demanda-hidrica-agricola': dynamic(() => import('@/components/DemandaAgricola'), { loading: Cargando }),
  'escala-de-permanencia': dynamic(() => import('@/components/EscalaPermanencia'), { loading: Cargando }),
  escorrentia: dynamic(() => import('@/components/CalculadoraEscorrentia'), { loading: Cargando }),
}
