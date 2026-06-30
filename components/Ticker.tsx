'use client'

import { motion } from 'framer-motion'

const items = [
  { label: 'COMPLETADO', text: 'La Guajira · Drone Keyline + Pastoreo Regenerativo · 3 ha' },
  { label: 'COMPLETADO', text: 'Mineros S.A. — El Bagre, Antioquia · Agroforestal Sintrópico · 3 ha' },
  { label: 'COMPLETADO', text: 'Grupo BIOS — Cereté, Córdoba · Piloto Demostrativo · 0,4 ha' },
  { label: 'COMPLETADO', text: 'Villanueva — Casanare · Ganadería Regenerativa · 456 ha' },
  { label: 'COMPLETADO', text: 'Magangué — Bolívar · Ganadería Keyline · 1.000 ha' },
  { label: 'COMPLETADO', text: 'Jericó — Antioquia · Diseño Keyline Cafetero · 0,7 ha' },
  { label: 'COMPLETADO', text: 'Tranquilandia — Mesetas, Meta · Sistema Agrosilvopastoril · 10 ha' },
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
            <span className="w-1.5 h-1.5 rounded-full bg-[#95C11F] shrink-0" />
            <span className="text-[#95C11F] text-[10px] tracking-[0.28em] uppercase font-medium shrink-0">
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
