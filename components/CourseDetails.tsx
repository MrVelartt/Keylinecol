'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { palette } from '@/lib/theme'
import { Accent, Eyebrow } from '@/components/ui/SectionHeader'

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
          <Eyebrow className="mb-4">Para quién es</Eyebrow>
          <p className="text-secondary text-xl lg:text-2xl leading-snug">
            Prioridad para <span className="text-primary">agrónomos y dueños de tierra</span>, abierto a cualquier
            interesado. Sin requisitos previos de topografía ni SIG — pero sí computador, QGIS no corre en celular.
          </p>
        </motion.div>

        {/* Unidades */}
        <div className="mb-20 lg:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-10"
          >
            <Eyebrow>Las cuatro unidades</Eyebrow>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {units.map((unit, i) => (
              <motion.div
                key={unit.number}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-subtle bg-surface-raised p-8 lg:p-9 flex flex-col"
              >
                <div className="flex items-baseline justify-between mb-5">
                  <span className="font-display text-3xl font-bold text-brand/40">{unit.number}</span>
                  <span className="font-mono text-[10px] text-mono tracking-widest uppercase">
                    {unit.weeks}
                  </span>
                </div>
                <h3 className="font-display text-2xl lg:text-[1.7rem] font-semibold text-primary mb-4">{unit.title}</h3>
                <p className="text-secondary text-base leading-relaxed mb-6 flex-1">{unit.description}</p>
                <div className="flex items-start gap-2.5 pt-5 border-t border-subtle">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                    <path
                      d="M2 8.5l3.5 3.5L14 3"
                      stroke={palette.brand.DEFAULT}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-primary text-sm leading-relaxed">
                    <span className="text-mono uppercase tracking-wide">Entregable — </span>
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
            className="rounded-2xl border border-brand/20 bg-surface-raised p-9 lg:p-10"
          >
            <Eyebrow className="mb-4">La promesa central</Eyebrow>
            <p className="font-display text-xl lg:text-2xl leading-snug text-primary">
              Cada participante trabaja las 8 semanas sobre su propio predio y sale con{' '}
              <Accent>plano, presupuesto y video de replanteo</Accent> — no con
              apuntes.
            </p>
            <p className="text-mono text-sm mt-4">Quien no tenga predio recibe un caso de estudio completo.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-subtle bg-surface-raised p-9 lg:p-10"
          >
            <Eyebrow className="mb-4">Lo que lo diferencia</Eyebrow>
            <p className="font-display text-xl lg:text-2xl leading-snug text-primary">
              El único curso en español que combina{' '}
              <Accent>en vivo, software libre y el diseño de tu propia tierra</Accent>{' '}
              como entregable.
            </p>
            <p className="text-mono text-sm mt-4">
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
          <div className="rounded-2xl border border-subtle p-8">
            <div className="text-mono text-[10px] tracking-[0.28em] uppercase mb-3">Fechas</div>
            <p className="text-secondary text-sm leading-relaxed">
              Inicia miércoles 23 de septiembre, cierra sábado 14 de noviembre de 2026.
            </p>
          </div>
          <div className="rounded-2xl border border-subtle p-8">
            <div className="text-mono text-[10px] tracking-[0.28em] uppercase mb-3">Certificación</div>
            <p className="text-secondary text-sm leading-relaxed">
              60 horas. Asistencia al 80% de las sesiones; aprobación con los cuatro entregables más el proyecto
              final.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
