'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { palette } from '@/lib/theme'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'

const pillars = [
  {
    number: '01',
    title: 'Lectura del Terreno',
    description:
      'Analizamos las líneas clave del agua, la topografía y los patrones naturales del suelo para entender cómo la tierra realmente funciona antes de intervenir.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path
          d="M4 22 L9 14 L15 19 L22 8 L31 17"
          stroke={palette.brand.DEFAULT}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="8" r="2.5" fill={palette.brand.DEFAULT} opacity="0.5" />
        <path d="M4 29 L32 29" stroke={palette.brand.DEFAULT} strokeWidth="0.5" strokeDasharray="2 5" opacity="0.35" />
        <path d="M4 25 L32 25" stroke={palette.brand.DEFAULT} strokeWidth="0.5" strokeDasharray="2 5" opacity="0.25" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Diseño Regenerativo',
    description:
      'Creamos sistemas de cultivo y manejo del agua que trabajan con los ciclos naturales, aumentando la fertilidad y la biodiversidad año tras año.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="7" stroke={palette.brand.DEFAULT} strokeWidth="1.4" opacity="0.85" />
        <path
          d="M18 4 C18 4 23 10 23 18 C23 26 18 32 18 32"
          stroke={palette.brand.DEFAULT}
          strokeWidth="0.8"
          opacity="0.45"
          strokeDasharray="2 4"
        />
        <path
          d="M4 18 C4 18 10 13 18 13 C26 13 32 18 32 18"
          stroke={palette.brand.DEFAULT}
          strokeWidth="0.8"
          opacity="0.45"
          strokeDasharray="2 4"
        />
        <circle cx="18" cy="18" r="2.5" fill={palette.brand.DEFAULT} />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Implementación Guiada',
    description:
      'Acompañamos cada fase del proceso en campo: desde el primer trazado hasta la consolidación del sistema, asegurando resultados reales y medibles.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path
          d="M6 30 L6 9 L16 4 L26 9 L26 30"
          stroke={palette.brand.DEFAULT}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 30 L11 20 L16 17 L21 20 L21 30"
          stroke={palette.brand.DEFAULT}
          strokeWidth="1"
          opacity="0.6"
        />
        <circle cx="16" cy="13" r="2" fill={palette.brand.DEFAULT} opacity="0.75" />
        <path d="M6 14 L26 14" stroke={palette.brand.DEFAULT} strokeWidth="0.5" strokeDasharray="2 5" opacity="0.35" />
      </svg>
    ),
  },
]

function PillarCard({ pillar, index }: { pillar: (typeof pillars)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 64 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
      className="relative p-8 lg:p-10 border border-subtle rounded-2xl bg-surface-raised hover:bg-surface-hover hover:border-brand/25 transition-all duration-500 group overflow-hidden"
    >
      {/* Background number */}
      <div className="font-display text-[6rem] font-bold text-primary/[0.03] absolute -top-2 right-6 leading-none select-none group-hover:text-primary/[0.055] transition-colors duration-500 pointer-events-none">
        {pillar.number}
      </div>

      <div className="mb-7">{pillar.icon}</div>

      <h3 className="font-display text-2xl lg:text-[1.65rem] font-semibold mb-4 leading-snug">
        {pillar.title}
      </h3>

      <p className="text-secondary leading-relaxed text-[0.95rem]">{pillar.description}</p>

      {/* Bottom accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, delay: index * 0.14 + 0.5 }}
        className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-brand/35 via-brand/15 to-transparent origin-left"
      />
    </motion.div>
  )
}

export default function Pillars() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="metodologia" className="relative py-32 lg:py-44 px-6 overflow-hidden">
      {/* Patrón de anillos de marca */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/brand/patron-anillos.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '520px',
          opacity: 0.05,
        }}
      />
      <div className="relative max-w-7xl mx-auto">
        <div ref={ref} className="mb-20">
          <SectionHeader
            inView={inView}
            className=""
            eyebrow="Nuestra Metodología"
            title={
              <>
                Tres pilares que{' '}
                <Accent>transforman</Accent>
                {' '}cada finca
              </>
            }
          />
        </div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {pillars.map((pillar, i) => (
            <PillarCard key={pillar.number} pillar={pillar} index={i} />
          ))}
        </div>
      </div>
    </section>

  )
}
