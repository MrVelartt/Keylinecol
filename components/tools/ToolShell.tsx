'use client'

import type { ReactNode } from 'react'
import { TOOLS } from '@/lib/tools'
import { EnPaginaDeHerramienta } from './ToolFrame'

// ── Página de herramienta ──
// Índice lateral de las herramientas en escritorio y barra compacta
// desplazable en móvil. El contenido se marca como «en página» para que el
// título de la herramienta sea el H1.

export default function ToolShell({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <div className="relative pt-28 lg:pt-32 pb-24 px-4 sm:px-6">
      <div className="absolute inset-0 pointer-events-none dot-grid" />
      <div className="max-w-[1400px] mx-auto relative">
        <nav aria-label="Ruta" className="mb-6 font-mono text-[11px] text-mono">
          <a href="/herramientas" className="hover:text-brand transition-colors">
            Herramientas
          </a>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-secondary">{TOOLS.find((t) => t.slug === slug)?.nombre}</span>
        </nav>

        {/* Móvil: barra compacta */}
        <nav aria-label="Herramientas" className="xl:hidden -mx-4 px-4 mb-8 overflow-x-auto">
          <ul className="flex gap-2 w-max">
            {TOOLS.map((t) => {
              const on = t.slug === slug
              return (
                <li key={t.slug}>
                  <a
                    href={t.href}
                    aria-current={on ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] whitespace-nowrap transition-colors ${
                      on ? 'border-brand/40 bg-brand/10 text-brand' : 'border-subtle text-secondary hover:text-primary'
                    }`}
                  >
                    <span className="font-mono text-[10px] tabular-nums opacity-80">{t.numero}</span>
                    {t.nombre}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="grid xl:grid-cols-[220px_minmax(0,1fr)] gap-10 items-start">
          {/* Escritorio: índice lateral */}
          <nav aria-label="Herramientas" className="hidden xl:block sticky top-28">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-faint mb-3 px-3">Herramientas</div>
            <ul className="space-y-0.5">
              {TOOLS.map((t) => {
                const on = t.slug === slug
                return (
                  <li key={t.slug}>
                    <a
                      href={t.href}
                      aria-current={on ? 'page' : undefined}
                      className={`flex gap-3 px-3 py-2 rounded-lg transition-colors ${on ? 'bg-brand/10' : 'hover:bg-veil'}`}
                    >
                      <span className={`font-mono text-[11px] tabular-nums pt-0.5 ${on ? 'text-brand' : 'text-mono'}`}>{t.numero}</span>
                      <span className={`text-sm leading-snug ${on ? 'text-brand' : 'text-secondary hover:text-primary'}`}>{t.nombre}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="min-w-0">
            <EnPaginaDeHerramienta.Provider value={true}>{children}</EnPaginaDeHerramienta.Provider>
          </div>
        </div>
      </div>
    </div>
  )
}
