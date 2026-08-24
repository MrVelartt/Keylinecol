'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const units = [
  {
    number: '01',
    weeks: 'Semanas 1–2',
    title: 'Principios de Topografía',
    description:
      'Leer el terreno: cotas, curvas de nivel, pendiente, formas del paisaje. Descarga del modelo de elevación del propio predio desde fuentes gratuitas. Métodos de levantamiento, precisión y costo — qué necesita cada decisión.',
    deliverable: 'Ficha topográfica del predio',
  },
  {
    number: '02',
    weeks: 'Semanas 3–4',
    title: 'Bases del diseño en línea clave',
    description:
      'Yeomans y la escala de permanencia. Anatomía del keypoint y la keyline, identificada primero a mano sobre el plano. Patrón de cultivo keyline, canales de desviación, reservorios y dimensionamiento preliminar del agua.',
    deliverable: 'Diagnóstico de escala de permanencia y keypoints identificados',
  },
  {
    number: '03',
    weeks: 'Semanas 5–6',
    title: 'Software para diseño keyline',
    description:
      'QGIS desde cero: sistemas de referencia en Colombia, procesamiento del terreno, mapas de pendiente y curvas, análisis hidrológico, trazado de la keyline y sus paralelas, maquetación final.',
    deliverable: 'Plano de diseño keyline del predio en PDF',
  },
  {
    number: '04',
    weeks: 'Semanas 7–8',
    title: 'Del diseño digital al diseño en campo',
    description:
      'Del plano al celular y al GPS. Replanteo con nivel A y manguera. Maquinaria, rendimientos, volúmenes y presupuesto. Presentación final de proyectos.',
    deliverable: 'Proyecto completo + video del replanteo en terreno',
  },
]

export default function CourseDetails() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="px-6 pb-32 lg:pb-44">
      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Público */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mb-16 lg:mb-20"
        >
          <div className="text-[#95C11F] text-[10px] tracking-[0.32em] uppercase font-medium mb-4">
            Para quién es
          </div>
          <p className="text-white/65 text-xl lg:text-2xl leading-snug">
            Prioridad para <span className="text-white">agrónomos y dueños de tierra</span>, abierto a cualquier
            interesado. Sin requisitos previos de topografía ni SIG — pero sí computador, QGIS no corre en celular.
          </p>
        </motion.div>

        {/* Unidades */}
        <div className="mb-20 lg:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-7 h-px bg-[#95C11F]/70" />
            <span className="text-[#95C11F] text-[10px] tracking-[0.32em] uppercase font-medium">
              Las cuatro unidades
            </span>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {units.map((unit, i) => (
              <motion.div
                key={unit.number}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-white/[0.07] bg-[#2C2C2A] p-8 lg:p-9 flex flex-col"
              >
                <div className="flex items-baseline justify-between mb-5">
                  <span className="font-display text-3xl font-bold text-[#95C11F]/40">{unit.number}</span>
                  <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase">
                    {unit.weeks}
                  </span>
                </div>
                <h3 className="font-display text-2xl lg:text-[1.7rem] font-semibold text-white mb-4">{unit.title}</h3>
                <p className="text-white/60 text-base leading-relaxed mb-6 flex-1">{unit.description}</p>
                <div className="flex items-start gap-2.5 pt-5 border-t border-white/[0.06]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                    <path
                      d="M2 8.5l3.5 3.5L14 3"
                      stroke="#95C11F"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-white/80 text-sm leading-relaxed">
                    <span className="text-white/40 uppercase tracking-wide">Entregable — </span>
                    {unit.deliverable}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Promesa + Diferenciador */}
        <div className="grid lg:grid-cols-2 gap-5 mb-20 lg:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-[#95C11F]/20 bg-[#2C2C2A] p-9 lg:p-10"
          >
            <div className="text-[#95C11F] text-[10px] tracking-[0.32em] uppercase font-medium mb-4">
              La promesa central
            </div>
            <p className="font-display text-xl lg:text-2xl leading-snug text-white">
              Cada participante trabaja las 8 semanas sobre su propio predio y sale con{' '}
              <em className="text-[#95C11F] not-italic">plano, presupuesto y video de replanteo</em> — no con
              apuntes.
            </p>
            <p className="text-white/40 text-sm mt-4">Quien no tenga predio recibe un caso de estudio completo.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/[0.07] bg-[#2C2C2A] p-9 lg:p-10"
          >
            <div className="text-[#95C11F] text-[10px] tracking-[0.32em] uppercase font-medium mb-4">
              Lo que lo diferencia
            </div>
            <p className="font-display text-xl lg:text-2xl leading-snug text-white">
              El único curso en español que combina{' '}
              <em className="text-[#95C11F] not-italic">en vivo, software libre y el diseño de tu propia tierra</em>{' '}
              como entregable.
            </p>
            <p className="text-white/40 text-sm mt-4">
              La competencia es presencial y fuera de Colombia, o grabada y conceptual.
            </p>
          </motion.div>
        </div>

        {/* Fechas + Certificación */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="grid sm:grid-cols-2 gap-5"
        >
          <div className="rounded-2xl border border-white/[0.07] p-8">
            <div className="text-white/30 text-[10px] tracking-[0.28em] uppercase mb-3">Fechas</div>
            <p className="text-white/60 text-sm leading-relaxed">
              Inicia miércoles 16 de septiembre, cierra sábado 7 de noviembre de 2026.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] p-8">
            <div className="text-white/30 text-[10px] tracking-[0.28em] uppercase mb-3">Certificación</div>
            <p className="text-white/60 text-sm leading-relaxed">
              60 horas. Asistencia al 80% de las sesiones; aprobación con los cuatro entregables más el proyecto
              final.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
