'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const includes = [
  'Acceso de por vida a todas las clases',
  '3 sesiones de prácticas de campo en Colombia',
  'Software de análisis topográfico (licencia)',
  'Certificado oficial Keyline Colombia',
  'Comunidad privada de practitioners',
]

const details = [
  { label: 'Duración', value: '8 semanas' },
  { label: 'Modalidad', value: 'Online + Campo' },
  { label: 'Nivel', value: 'Principiante' },
  { label: 'Próxima fecha', value: 'Agosto 2026' },
]

const galleryImages = [
  '/courses/ecuador/ce01.jpg',
  '/courses/ecuador/ce02.jpg',
  '/courses/ecuador/ce03.jpg',
  '/courses/ecuador/ce04.jpg',
  '/courses/ecuador/ce05.jpg',
]

function CourseGallery() {
  const [errors, setErrors] = useState<Record<number, boolean>>({})
  const loaded = galleryImages.filter((_, i) => !errors[i])

  const handleError = (i: number) => setErrors((prev) => ({ ...prev, [i]: true }))

  if (loaded.length === 0) {
    return (
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 500 420" fill="none" preserveAspectRatio="xMidYMid slice">
          {[60, 100, 140, 180, 220, 265, 310, 355].map((y, i) => (
            <path
              key={i}
              d={`M -20 ${y} Q ${125 + Math.sin(i * 0.9) * 40} ${y - 28 + i * 3} ${250 + Math.cos(i * 0.7) * 30} ${y + 10 - i * 2} Q ${380 + Math.sin(i * 0.5) * 20} ${y - 15 + i * 4} 520 ${y + 18}`}
              stroke="#95C11F"
              strokeWidth="0.6"
              strokeDasharray="3 7"
              opacity={0.8 - i * 0.08}
            />
          ))}
          <circle cx="185" cy="105" r="5" fill="#95C11F" opacity="0.9" />
          <circle cx="185" cy="105" r="14" stroke="#95C11F" strokeWidth="0.5" opacity="0.35" />
          <circle cx="185" cy="105" r="26" stroke="#95C11F" strokeWidth="0.3" opacity="0.15" />
        </svg>
      </div>
    )
  }

  const [main, ...thumbs] = galleryImages.filter((_, i) => !errors[i])
  const visibleThumbs = thumbs.slice(0, 4)

  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-1.5">
      {/* Main image */}
      <div className="relative flex-1 overflow-hidden rounded-xl">
        <img
          src={main}
          alt="Curso Keyline Ecuador"
          className="w-full h-full object-cover"
          onError={() => handleError(0)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2A]/60 via-transparent to-transparent" />
      </div>

      {/* Thumbnails row */}
      {visibleThumbs.length > 0 && (
        <div className={`grid gap-1.5 h-24 shrink-0`} style={{ gridTemplateColumns: `repeat(${visibleThumbs.length}, 1fr)` }}>
          {visibleThumbs.map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg">
              <img
                src={src}
                alt={`Curso Ecuador ${i + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={() => handleError(i + 1)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CourseCard() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="cursos" className="py-32 lg:py-44 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={ref} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="w-7 h-px bg-[#95C11F]/70" />
            <span className="text-[#95C11F] text-[10px] tracking-[0.32em] uppercase font-medium">
              Formación
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-tight max-w-3xl"
          >
            El primer paso{' '}
            <em className="text-[#95C11F] not-italic">comienza aquí</em>
          </motion.h2>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 64 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/[0.07] bg-[#2C2C2A] overflow-hidden"
        >
          <div className="grid lg:grid-cols-2">
            {/* Left: gallery panel */}
            <div className="relative min-h-[420px] lg:min-h-[540px] overflow-hidden bg-[#1a1f1a]">
              <CourseGallery />

              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#2C2C2A]/20 pointer-events-none" />

              {/* Badge over image */}
              <div className="absolute top-6 left-6 z-10">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1D1D1B]/80 backdrop-blur-sm border border-[#95C11F]/20 text-[#95C11F] text-xs tracking-wide">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#95C11F] opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#95C11F]" />
                  </span>
                  Inscripciones abiertas
                </div>
              </div>

              {/* Course label bottom */}
              <div className="absolute bottom-6 left-6 z-10">
                <div className="font-mono text-[10px] text-[#95C11F]/60 tracking-widest uppercase mb-1">
                  Curso intensivo · Ecuador
                </div>
                <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-tight text-white drop-shadow-lg">
                  Fundamentos del<br />Diseño Keyline
                </h3>
              </div>
            </div>

            {/* Right: pricing & details */}
            <div className="p-10 lg:p-16 border-t lg:border-t-0 lg:border-l border-white/[0.06]">
              {/* Price */}
              <div className="mb-10">
                <div className="text-white/35 text-xs tracking-widest uppercase mb-3">Inversión</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[3.5rem] font-bold text-[#95C11F] leading-none">
                    $480.000
                  </span>
                </div>
                <div className="text-white/30 text-sm mt-1.5">
                  COP &nbsp;·&nbsp; o 2 pagos de $260.000
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-10">
                {details.map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-white/25 text-[9px] tracking-[0.22em] uppercase mb-1.5">
                      {label}
                    </div>
                    <div className="text-white font-medium text-sm">{value}</div>
                  </div>
                ))}
              </div>

              {/* Includes */}
              <div className="space-y-3 mb-10">
                {includes.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-white/55">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="7" stroke="#95C11F" strokeWidth="1" opacity="0.4" />
                      <path d="M5 8L7 10L11 6" stroke="#95C11F" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="https://wa.me/573113650567?text=Hola%2C%20quiero%20inscribirme%20al%20curso%20de%20Dise%C3%B1o%20Keyline"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-[#95C11F] text-[#1D1D1B] rounded-full font-semibold text-sm hover:bg-[#a6d42a] transition-all duration-200 hover:shadow-[0_0_32px_rgba(149,193,31,0.4)] hover:scale-[1.02]"
              >
                Reservar mi lugar
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M2.5 7.5H12.5M12.5 7.5L9 4M12.5 7.5L9 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
