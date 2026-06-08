'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const paths = [
  {
    badge: 'Servicio Presencial',
    type: 'Propietarios de Tierra',
    headline: 'Tengo una finca. Quiero transformarla.',
    description:
      'Trabajamos directamente en tu predio para diseñar e implementar el sistema Keyline adaptado a tu terreno, clima y objetivos productivos.',
    features: [
      'Diagnóstico completo del terreno',
      'Plan maestro de diseño Keyline',
      'Trazado e implementación en campo',
      'Acompañamiento durante 12 meses',
    ],
    cta: 'Consulta tu Finca',
    href: 'https://wa.me/573001234567',
    primary: true,
  },
  {
    badge: 'Online + Presencial',
    type: 'Estudiantes y Profesionales',
    headline: 'Quiero dominar el método.',
    description:
      'Aprende a leer el terreno y diseñar sistemas regenerativos con nuestros cursos teórico-prácticos. Formación real, en campo colombiano.',
    features: [
      'Fundamentos teóricos del diseño Keyline',
      'Prácticas de campo supervisadas',
      'Herramientas de análisis topográfico',
      'Certificación Keyline Colombia',
    ],
    cta: 'Ver Cursos',
    href: '#cursos',
    primary: false,
  },
]

export default function ClientPaths() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="py-32 lg:py-44 px-6 bg-[#0b160b]/50">
      <div className="max-w-7xl mx-auto">
        <div ref={ref} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="w-7 h-px bg-[#8DB76A]/70" />
            <span className="text-[#8DB76A] text-[10px] tracking-[0.32em] uppercase font-medium">
              ¿Cuál es tu camino?
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-tight max-w-3xl"
          >
            Dos caminos,{' '}
            <em className="text-[#8DB76A] not-italic">un mismo destino</em>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {paths.map((path, i) => (
            <motion.div
              key={path.type}
              initial={{ opacity: 0, x: i === 0 ? -48 : 48 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.95, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`relative p-10 lg:p-14 rounded-3xl border transition-all duration-500 overflow-hidden ${
                path.primary
                  ? 'bg-[#8DB76A]/[0.06] border-[#8DB76A]/20 hover:bg-[#8DB76A]/[0.1]'
                  : 'bg-white/[0.015] border-white/[0.06] hover:border-white/10 hover:bg-white/[0.03]'
              }`}
            >
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] tracking-[0.18em] uppercase mb-8 ${
                  path.primary
                    ? 'bg-[#8DB76A]/20 text-[#8DB76A]'
                    : 'bg-white/[0.06] text-white/40'
                }`}
              >
                {path.badge}
              </div>

              <div className="text-[#8DB76A] text-[10px] tracking-[0.28em] uppercase mb-3 font-medium">
                {path.type}
              </div>

              <h3 className="font-display text-[clamp(1.7rem,3vw,2.2rem)] font-semibold mb-5 leading-tight">
                {path.headline}
              </h3>

              <p className="text-white/45 leading-relaxed mb-8 text-[0.95rem]">{path.description}</p>

              <ul className="space-y-3 mb-10">
                {path.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8DB76A] shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href={path.href}
                target={path.href.startsWith('http') ? '_blank' : undefined}
                rel={path.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                  path.primary
                    ? 'bg-[#8DB76A] text-[#0a120a] hover:bg-[#a0ca7e] hover:shadow-[0_0_24px_rgba(141,183,106,0.35)]'
                    : 'border border-white/15 text-white/80 hover:border-white/30 hover:bg-white/[0.05]'
                }`}
              >
                {path.cta}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* Decorative corner glow for primary */}
              {path.primary && (
                <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-[#8DB76A]/[0.07] blur-2xl pointer-events-none" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
