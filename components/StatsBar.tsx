'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'

const stats = [
  { value: 47, suffix: '', label: 'Proyectos realizados' },
  { value: 12, suffix: '', label: 'Departamentos atendidos' },
  { value: 3200, suffix: '', label: 'Hectáreas diseñadas' },
  { value: 94, suffix: '%', label: 'Clientes satisfechos' },
]

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    const controls = animate(0, target, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setCount(Math.round(v)),
    })
    return () => controls.stop()
  }, [active, target])

  return (
    <>
      {count.toLocaleString('es-CO')}
      {suffix}
    </>
  )
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="py-24 border-y border-white/[0.06] bg-[#0c180c]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-[clamp(2.8rem,5vw,4rem)] font-bold text-[#8DC63F] mb-3 leading-none tabular-nums">
                <CountUp target={stat.value} suffix={stat.suffix} active={inView} />
              </div>
              <div className="text-white/35 text-sm tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
