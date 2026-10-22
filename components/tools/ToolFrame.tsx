'use client'

import { createContext, useContext, type ReactNode } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'

// ── Marco común de cada herramienta ──
// Dentro de /herramientas/[slug] (ToolShell) el título es el H1 de la página
// y no lleva el relleno de sección de portada. Fuera del shell se comporta
// como una sección más.

export const EnPaginaDeHerramienta = createContext(false)

export default function ToolFrame({
  id,
  eyebrow = 'Herramientas Técnicas',
  number,
  title,
  subtitle,
  fondo = 'dot-grid',
  children,
}: {
  id: string
  eyebrow?: string
  number?: string
  title: ReactNode
  subtitle?: ReactNode
  fondo?: 'dot-grid' | 'tech-grid'
  children: ReactNode
}) {
  const enPagina = useContext(EnPaginaDeHerramienta)

  if (enPagina) {
    return (
      <div id={id} className="scroll-mt-28">
        <SectionHeader as="h1" size="md" inView eyebrow={eyebrow} number={number} title={title} subtitle={subtitle} className="mb-10 max-w-3xl" />
        {children}
      </div>
    )
  }

  return (
    <section id={id} className="py-32 lg:py-44 px-6 relative overflow-hidden">
      <div className={`absolute inset-0 pointer-events-none ${fondo}`} />
      <div className="max-w-7xl mx-auto relative">
        <SectionHeader eyebrow={eyebrow} number={number} title={title} subtitle={subtitle} className="mb-16 max-w-3xl" />
        {children}
      </div>
    </section>
  )
}
