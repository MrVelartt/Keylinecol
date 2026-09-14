'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

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
          className="rounded-3xl border border-[#95C11F]/25 bg-gradient-to-r from-[#1D1D1B] to-[#20281a] p-9 lg:p-12 flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12"
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1.5 rounded-full bg-[#95C11F] text-[#1D1D1B] text-[11px] font-semibold tracking-wide uppercase">
                Gratis
              </span>
              <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase">
                Miércoles 16 de septiembre · virtual en vivo
              </span>
            </div>

            <h2 className="font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-tight text-white mb-3">
              Masterclass gratuita: cosecha de{' '}
              <em className="text-[#95C11F] not-italic">agua lluvia</em>
            </h2>

            <p className="text-white/55 leading-relaxed max-w-2xl">
              Una sesión en vivo antes de que arranque el curso completo el 23 de septiembre —
              cómo captar y almacenar agua lluvia en tu finca con principios de diseño Keyline.
              Cupo limitado.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={`https://wa.me/573113650567?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-8 py-4 bg-[#95C11F] text-[#1D1D1B] rounded-full font-semibold text-sm whitespace-nowrap hover:bg-[#a6d42a] transition-all duration-200 hover:shadow-[0_0_32px_rgba(149,193,31,0.4)] hover:scale-[1.02]"
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
