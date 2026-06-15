'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import KeylineLogo from './KeylineLogo'

const values = [
  {
    code: '01',
    title: 'Evidencia sobre intuición',
    desc: 'Cada decisión de diseño parte del análisis topográfico, hidrológico y edafológico del terreno. No improvisamos — leemos la tierra.',
  },
  {
    code: '02',
    title: 'Escala real, impacto real',
    desc: 'Trabajamos en campo, no en oficina. Nuestros diseños se prueban con agua de lluvia, suelos vivos y años de observación.',
  },
  {
    code: '03',
    title: 'Regenerar, no solo conservar',
    desc: 'Creemos que el paisaje puede mejorar activamente con cada ciclo de lluvia. El objetivo no es el equilibrio — es la abundancia.',
  },
  {
    code: '04',
    title: 'Conocimiento compartido',
    desc: 'Formamos a quienes trabajan la tierra. El diseño Keyline pierde poder si solo lo practican los consultores.',
  },
]

const timeline = [
  { year: '2020', event: 'Primeros levantamientos topográficos en el Piedemonte Llanero' },
  { year: '2021', event: 'Certificación Regrarians Keyline® — primer equipo certificado en Colombia' },
  { year: '2022', event: 'Implementación del sistema piloto en 92 ha · Boyacá' },
  { year: '2023', event: 'Expansión a Casanare · Proyecto Reserva Agua Viva (560 ha)' },
  { year: '2024', event: 'Lanzamiento del primer curso Keyline Colombia en español' },
  { year: '2025', event: '+1.400 ha bajo diseño activo en cuatro departamentos' },
]

export default function Nosotros() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const tlRef = useRef<HTMLDivElement>(null)
  const tlInView = useInView(tlRef, { once: true, margin: '-60px' })

  return (
    <section id="nosotros" className="py-32 lg:py-44 px-6 relative overflow-hidden">
      {/* Bg accent */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#8DC63F]/[0.025] rounded-full blur-[180px] pointer-events-none -translate-x-1/2 -translate-y-1/4" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={ref} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="w-7 h-px bg-[#8DC63F]/60" />
            <span className="font-mono text-[#8DC63F] text-[10px] tracking-[0.32em] uppercase">
              Sobre Nosotros
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,6vw,4.8rem)] font-semibold leading-tight max-w-3xl"
          >
            Leemos la tierra
            <br />
            <em className="text-[#8DC63F] not-italic">con precisión.</em>
          </motion.h2>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-28">
          {/* Left: narrative */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div className="flex items-start gap-5">
              <div className="mt-1 shrink-0">
                <KeylineLogo size={48} />
              </div>
              <div>
                <div className="font-mono text-[10px] text-[#8DC63F]/50 tracking-widest uppercase mb-2">
                  Villavicencio · Meta · Colombia
                </div>
                <p className="text-white/70 text-lg leading-relaxed">
                  Somos un equipo de diseñadores de paisajes y consultores Keyline
                  basados en el Piedemonte Llanero colombiano.
                </p>
              </div>
            </div>

            <p className="text-white/45 leading-relaxed">
              Fundamos Keyline Colombia con una certeza: los suelos y el agua de este país
              pueden recuperarse. El Meta, el Casanare, el piedemonte andino — estas tierras
              tienen la capacidad de regenerarse si el diseño trabaja a favor de sus patrones
              naturales, no en su contra.
            </p>

            <p className="text-white/45 leading-relaxed">
              Aplicamos la metodología Keyline desarrollada por P.A. Yeomans en los años 50
              en Australia, adaptada a las condiciones tropicales y subtropicales de Colombia:
              alta pluviosidad, suelos lateríticos, gradientes de alta variabilidad y
              ecosistemas de transición savana-bosque.
            </p>

            <div className="pt-4 border-t border-white/[0.06]">
              <div className="font-mono text-[10px] text-white/20 tracking-widest uppercase mb-4">Certificaciones</div>
              <div className="space-y-2">
                {[
                  'Regrarians Keyline® Design — Certified Practitioners',
                  'Diseño de Paisajes Regenerativos — ANDES Institute',
                  'Hidrología de Cuencas Aplicada — IDEAM Colombia',
                ].map((cert) => (
                  <div key={cert} className="flex items-start gap-3 text-sm text-white/40">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#8DC63F]/60 shrink-0" />
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: values */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {values.map((v, i) => (
              <motion.div
                key={v.code}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.35 + i * 0.09 }}
                className="group p-6 rounded-2xl border border-white/[0.05] bg-white/[0.015] hover:border-[#8DC63F]/15 hover:bg-[#8DC63F]/[0.03] transition-all duration-400"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-[11px] text-[#8DC63F]/40 tracking-widest mt-0.5 shrink-0">
                    {v.code}
                  </span>
                  <div>
                    <div className="text-white/90 font-medium mb-2 text-[15px]">{v.title}</div>
                    <p className="text-white/35 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Timeline */}
        <div ref={tlRef}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={tlInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-7 h-px bg-[#8DC63F]/60" />
            <span className="font-mono text-[#8DC63F] text-[10px] tracking-[0.32em] uppercase">
              Trayectoria
            </span>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={tlInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute left-[4.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-[#8DC63F]/30 via-[#8DC63F]/15 to-transparent origin-top hidden md:block"
            />

            <div className="space-y-6">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -24 }}
                  animate={tlInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex items-center gap-6 md:gap-8 group"
                >
                  {/* Year */}
                  <div className="font-mono text-[13px] text-[#8DC63F] w-14 shrink-0 text-right md:text-right">
                    {item.year}
                  </div>

                  {/* Dot */}
                  <div className="relative shrink-0 hidden md:block">
                    <div className="w-2 h-2 rounded-full bg-[#8DC63F]/40 group-hover:bg-[#8DC63F] transition-colors duration-300" />
                  </div>

                  {/* Event */}
                  <p className="text-white/45 text-sm leading-relaxed group-hover:text-white/65 transition-colors duration-300">
                    {item.event}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
