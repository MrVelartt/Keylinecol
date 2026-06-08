'use client'

import { motion } from 'framer-motion'

const items = [
  { label: 'PROYECTO ACTIVO', text: 'Finca La Esperanza — Cundinamarca · Diseño Keyline en progreso · 240 ha' },
  { label: 'PROYECTO ACTIVO', text: 'Finca El Roble — Antioquia · Regeneración de suelos · 180 ha' },
  { label: 'EN EVALUACIÓN', text: 'Valle del Cauca · Agroforestería Keyline · 380 ha' },
  { label: 'COMPLETADO', text: 'Finca Santa Clara — Boyacá · Sistema de captación de agua · 92 ha' },
]

export default function Ticker() {
  const doubled = [...items, ...items]

  return (
    <div className="border-y border-white/[0.06] bg-[#0c180c] overflow-hidden py-4">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8DB76A] shrink-0" />
            <span className="text-[#8DB76A] text-[10px] tracking-[0.28em] uppercase font-medium shrink-0">
              {item.label}
            </span>
            <span className="text-white/35 text-[11px] tracking-[0.15em] uppercase shrink-0">
              {item.text}
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
