'use client'

import { useEffect } from 'react'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'
import { TOOLS } from '@/lib/tools'

// ── Índice de herramientas ──
// Tarjetas hacia /herramientas/[slug]. Los enlaces antiguos de la página
// única (/herramientas#calculadora-suelo, etc.) se redirigen a su ruta.

export default function IndiceHerramientas() {
  useEffect(() => {
    const ancla = window.location.hash.slice(1)
    if (!ancla) return
    const destino = TOOLS.find((t) => t.anclaAntigua === ancla)
    if (destino) window.location.replace(destino.href)
  }, [])

  return (
    <section className="pt-36 lg:pt-44 pb-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none dot-grid" />
      <div className="max-w-7xl mx-auto relative">
        <SectionHeader
          as="h1"
          inView
          className="mb-14 max-w-3xl"
          eyebrow="Herramientas Técnicas"
          title={
            <>
              Diseña con <Accent>datos</Accent>
            </>
          }
          subtitle="Calculadoras gratuitas para el agua, la tierra y el suelo de tu finca. Todos los valores son editables, cada casilla sugiere un rango y cada resultado se descarga en PDF."
        />

        <ul className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TOOLS.map((t) => (
            <li key={t.slug}>
              <a
                href={t.href}
                className="group flex flex-col h-full p-6 rounded-2xl border border-subtle bg-surface-raised hover:border-brand/40 hover:bg-surface-hover transition-colors"
              >
                <span className="font-mono text-[11px] text-brand tracking-[0.2em] tabular-nums mb-6">{t.numero}</span>
                <span className="font-display text-xl font-semibold text-primary leading-snug mb-2 group-hover:text-brand transition-colors">
                  {t.nombre}
                </span>
                <span className="text-secondary text-sm leading-relaxed flex-1">{t.descripcion}</span>
                <span className="mt-6 text-[13px] text-mono group-hover:text-brand transition-colors">
                  Abrir <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
