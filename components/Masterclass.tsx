'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'

const waMessage = encodeURIComponent(
  'Hola, quiero inscribirme a la masterclass gratuita de cosecha de agua lluvia del miércoles 16 de septiembre.'
)

export default function Masterclass() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="masterclass" className="px-6 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-brand/25 bg-gradient-to-r from-surface to-landscape-glow p-9 lg:p-12 flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12"
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1.5 rounded-full bg-brand text-surface text-[11px] font-semibold tracking-wide uppercase">
                Gratis
              </span>
              <span className="font-mono text-[11px] text-mono tracking-widest uppercase">
                Miércoles 16 de septiembre · virtual en vivo
              </span>
            </div>

            <SectionHeader
              inView={inView}
              size="sm"
              className=""
              title={
                <>
                  Masterclass gratuita: cosecha de <Accent>agua lluvia</Accent>
                </>
              }
              subtitle={
                <>
                  Una sesión en vivo antes de que arranque el curso completo el 23 de septiembre —
                  cómo captar y almacenar agua lluvia en tu finca con principios de diseño Keyline.
                  Cupo limitado.
                </>
              }
            />
          </div>

          <div className="shrink-0">
            <a
              href={`https://wa.me/573113650567?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-8 py-4 bg-brand text-surface rounded-full font-semibold text-sm whitespace-nowrap hover:bg-brand-hover transition-all duration-200 hover:shadow-glow-lg hover:scale-[1.02]"
            >
              Reservar mi cupo gratis
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path
                  d="M2.5 7.5H12.5M12.5 7.5L9 4M12.5 7.5L9 11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
