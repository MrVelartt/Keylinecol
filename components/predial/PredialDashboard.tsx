'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import dynamic from 'next/dynamic'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'
import { calcPredial, type PredialCatalogos, type PredialState } from '@/lib/calculos/predial'
import { DISCLAIMER_PREDIAL, estadoInicialPredial } from '@/data/catalogos/predial'
import { FONDOS, FONDO_GEOMEMBRANA, MATERIALES } from '@/data/catalogos/obra'
import { PRECIOS } from '@/data/catalogos/precios'
import ExportarPDF from '@/components/pdf/ExportarPDF'
import { copC, nf } from './fmt'
import { reportePredial } from './reporte'
import type { PanelProps } from './ui'

// ── Diseño Keyline Predial — tablero por capas de la escala de permanencia ──
// Un solo estado (PredialState) alimenta el motor puro calcPredial; cada panel
// se carga bajo demanda. El borrador se guarda en este navegador.
// El informe PDF sale de components/predial/reporte.ts. Excel: fuera de alcance por ahora.

const CATALOGOS: PredialCatalogos = {
  fondos: FONDOS,
  fondoGeomembrana: FONDO_GEOMEMBRANA,
  materiales: MATERIALES,
  precios: { geomembrana: PRECIOS.geomembrana, geotextil: PRECIOS.geotextil, anclaje: PRECIOS.anclaje },
}

const Cargando = () => <div className="h-96 rounded-2xl border border-subtle bg-surface-raised animate-pulse" aria-busy="true" />

const Finca = dynamic(() => import('./panels/Finca'), { loading: Cargando })
const Clima = dynamic(() => import('./panels/Clima'), { loading: Cargando })
const Relieve = dynamic(() => import('./panels/Relieve'), { loading: Cargando })
const Agua = dynamic(() => import('./panels/Agua'), { loading: Cargando })
const Capa = dynamic(() => import('./panels/Capa'), { loading: Cargando })
const Inversion = dynamic(() => import('./panels/Inversion'), { loading: Cargando })
const Fuentes = dynamic(() => import('./panels/Fuentes'), { loading: Cargando })

const conCapa = (capa: 'vias' | 'arb' | 'est' | 'sub' | 'suelo') => {
  const C = (p: PanelProps) => <Capa capa={capa} {...p} />
  C.displayName = `Capa-${capa}`
  return C
}

type Panel = { id: string; idx: string; nombre: string; sub: string; grupo: string; C: ComponentType<PanelProps> }

const PANELES: Panel[] = [
  { id: 'finca', idx: '00', nombre: 'Finca y empresa', sub: 'Datos de la cotización', grupo: 'Proyecto', C: Finca },
  { id: 'clima', idx: '01', nombre: 'Clima', sub: 'Lluvia, ETo y sequía', grupo: 'Escala de permanencia', C: Clima },
  { id: 'relieve', idx: '02', nombre: 'Relieve', sub: 'Terreno y estudios', grupo: 'Escala de permanencia', C: Relieve },
  { id: 'agua', idx: '03', nombre: 'Agua', sub: 'Demanda, oferta y reservorios', grupo: 'Escala de permanencia', C: Agua },
  { id: 'vias', idx: '04', nombre: 'Vías de acceso', sub: 'Trazado en cota', grupo: 'Escala de permanencia', C: conCapa('vias') },
  { id: 'arboles', idx: '05', nombre: 'Árboles', sub: 'Agroforestería', grupo: 'Escala de permanencia', C: conCapa('arb') },
  { id: 'estructuras', idx: '06', nombre: 'Estructuras', sub: 'Conducción y bombeo', grupo: 'Escala de permanencia', C: conCapa('est') },
  { id: 'subdivisiones', idx: '07', nombre: 'Subdivisiones', sub: 'Cercas y potreros', grupo: 'Escala de permanencia', C: conCapa('sub') },
  { id: 'suelo', idx: '08', nombre: 'Suelo', sub: 'Labranza y enmiendas', grupo: 'Escala de permanencia', C: conCapa('suelo') },
  { id: 'inversion', idx: '09', nombre: 'Inversión', sub: 'Cronograma por semestres', grupo: 'Resultado', C: Inversion },
  { id: 'fuentes', idx: '10', nombre: 'Fuentes', sub: 'Supuestos y referencias', grupo: 'Resultado', C: Fuentes },
]

// ── Persistencia local (borrador del proyecto + datos de la empresa) ──
const KEY_BORRADOR = 'keyline.predial.borrador'
const KEY_CONTACTO = 'keyline.contacto'
const VERSION = 1

function leer<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function escribir(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* almacenamiento bloqueado o lleno: el tablero sigue funcionando sin guardar */
  }
}

function borrar(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignorar */
  }
}

/** Fusiona un borrador guardado sobre el estado base, sección por sección. */
function fusionar(base: PredialState, guardado: Partial<PredialState>): PredialState {
  const out = { ...base } as Record<string, unknown>
  for (const k of Object.keys(base) as (keyof PredialState)[]) {
    const b = base[k]
    const g = guardado[k]
    if (g === undefined || g === null) continue
    out[k] = typeof b === 'object' && !Array.isArray(b) && typeof g === 'object' ? { ...b, ...g } : g
  }
  return out as unknown as PredialState
}

export default function PredialDashboard() {
  const [s, setS] = useState<PredialState>(estadoInicialPredial)
  const [panel, setPanel] = useState(PANELES[0].id)
  const [cargado, setCargado] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  // Restaura borrador, empresa y panel desde la URL al montar.
  useEffect(() => {
    const borrador = leer<{ v: number; s: Partial<PredialState> }>(KEY_BORRADOR)
    const contacto = leer<Partial<PredialState['empresa']>>(KEY_CONTACTO)
    setS((base) => {
      let next = borrador?.v === VERSION ? fusionar(base, borrador.s) : base
      if (contacto) next = { ...next, empresa: { ...next.empresa, ...contacto } }
      return next
    })
    const hash = window.location.hash.slice(1)
    if (PANELES.some((p) => p.id === hash)) setPanel(hash)
    setCargado(true)
  }, [])

  // Guarda con un pequeño retardo para no escribir en cada tecla.
  useEffect(() => {
    if (!cargado) return
    const t = window.setTimeout(() => {
      const { empresa, ...resto } = s
      escribir(KEY_BORRADOR, { v: VERSION, s: resto })
      escribir(KEY_CONTACTO, empresa)
    }, 400)
    return () => window.clearTimeout(t)
  }, [s, cargado])

  const set = useCallback((recipe: (draft: PredialState) => void) => {
    setS((prev) => {
      const draft = structuredClone(prev)
      recipe(draft)
      return draft
    })
  }, [])

  const r = useMemo(() => calcPredial(s, CATALOGOS), [s])

  const ir = (id: string) => {
    setPanel(id)
    try {
      window.history.replaceState(null, '', `#${id}`)
    } catch {
      /* ignorar */
    }
    const top = topRef.current
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const restablecer = () => {
    borrar(KEY_BORRADOR)
    setS((prev) => ({ ...estadoInicialPredial(), empresa: prev.empresa }))
  }

  const actual = PANELES.find((p) => p.id === panel) ?? PANELES[0]
  const i = PANELES.indexOf(actual)
  const Activo = actual.C
  const grupos = Array.from(new Set(PANELES.map((p) => p.grupo)))

  const kpis = [
    { k: 'Demanda anual', v: `${nf(r.demandaAnual)} m³` },
    { k: 'Almacenamiento', v: `${nf(r.volumenDiseno)} m³` },
    { k: 'Movimiento de tierras', v: `${nf(r.tierra.corteM3)} m³` },
    { k: 'Inversión total', v: copC(r.total) },
  ]

  return (
    <section className="pt-32 lg:pt-40 pb-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 pointer-events-none tech-grid-faint" />
      <div className="max-w-[1400px] mx-auto relative">
        <SectionHeader
          as="h1"
          size="md"
          eyebrow="Herramientas Técnicas"
          number="05"
          className="mb-10 lg:mb-14"
          title={
            <>
              Diseño Keyline <Accent>Predial</Accent>
            </>
          }
          subtitle="Del clima al suelo, capa por capa: demanda y oferta de agua, reservorios, movimiento de tierras y la inversión por semestres de toda la finca. Todos los precios unitarios son visibles y editables."
        />

        <div ref={topRef} className="scroll-mt-[72px]" />

        {/* Barra de indicadores */}
        <div className="sticky top-[72px] z-30 -mx-4 sm:mx-0 mb-6 px-4 sm:px-5 py-3 sm:rounded-2xl border-y sm:border border-subtle bg-surface/[0.92] backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <dl className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-2 flex-1">
              {kpis.map((x) => (
                <div key={x.k} className="min-w-0">
                  <dt className="font-mono text-[9px] sm:text-[10px] tracking-wide uppercase text-mono">{x.k}</dt>
                  <dd className="font-mono-data text-sm sm:text-[15px] text-primary truncate">{x.v}</dd>
                </div>
              ))}
            </dl>
            <ExportarPDF conCliente={false} etiqueta="Informe PDF" construir={() => reportePredial(s, r)} />
            <button
              type="button"
              onClick={restablecer}
              className="px-3 py-1.5 rounded-lg border border-strong text-secondary text-[12px] hover:border-emphasis hover:text-primary transition-colors"
              title="Vuelve a los valores de referencia. Conserva los datos de la empresa."
            >
              Restablecer valores
            </button>
          </div>
        </div>

        {/* Navegación móvil: barra horizontal */}
        <nav aria-label="Capas del diseño" className="lg:hidden -mx-4 px-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 w-max">
            {PANELES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => ir(p.id)}
                aria-current={p.id === panel ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] whitespace-nowrap transition-colors ${
                  p.id === panel ? 'border-brand/40 bg-brand/10 text-brand' : 'border-subtle text-secondary'
                }`}
              >
                <span className="font-mono text-[10px] tabular-nums opacity-80">{p.idx}</span>
                {p.nombre}
              </button>
            ))}
          </div>
        </nav>

        <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-8 xl:gap-10 items-start">
          {/* Navegación lateral */}
          <nav aria-label="Capas del diseño" className="hidden lg:block sticky top-[160px]">
            {grupos.map((g) => (
              <div key={g} className="mb-5">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-faint mb-2 px-3">{g}</div>
                <ul className="space-y-0.5">
                  {PANELES.filter((p) => p.grupo === g).map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => ir(p.id)}
                        aria-current={p.id === panel ? 'page' : undefined}
                        className={`w-full text-left flex gap-3 px-3 py-2 rounded-lg transition-colors ${
                          p.id === panel ? 'bg-brand/10' : 'hover:bg-veil'
                        }`}
                      >
                        <span className={`font-mono text-[11px] tabular-nums pt-0.5 ${p.id === panel ? 'text-brand' : 'text-mono'}`}>{p.idx}</span>
                        <span className="min-w-0">
                          <span className={`block text-sm ${p.id === panel ? 'text-brand' : 'text-primary'}`}>{p.nombre}</span>
                          <span className="block text-[11px] text-mono leading-snug">{p.sub}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="mt-6 pt-4 border-t border-subtle text-[11px] text-mono leading-relaxed px-3">{DISCLAIMER_PREDIAL}</p>
          </nav>

          {/* Panel activo */}
          <div className="min-w-0">
            <Activo s={s} r={r} set={set} />

            <div className="flex justify-between gap-3 mt-10 pt-6 border-t border-subtle">
              {i > 0 ? (
                <button type="button" onClick={() => ir(PANELES[i - 1].id)} className="text-left group">
                  <span className="block font-mono text-[10px] uppercase tracking-wide text-mono">← Anterior</span>
                  <span className="text-secondary group-hover:text-brand transition-colors">
                    {PANELES[i - 1].idx} · {PANELES[i - 1].nombre}
                  </span>
                </button>
              ) : (
                <span />
              )}
              {i < PANELES.length - 1 && (
                <button type="button" onClick={() => ir(PANELES[i + 1].id)} className="text-right group">
                  <span className="block font-mono text-[10px] uppercase tracking-wide text-mono">Siguiente →</span>
                  <span className="text-secondary group-hover:text-brand transition-colors">
                    {PANELES[i + 1].idx} · {PANELES[i + 1].nombre}
                  </span>
                </button>
              )}
            </div>

            <p className="lg:hidden mt-8 text-[11px] text-mono leading-relaxed">{DISCLAIMER_PREDIAL}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
