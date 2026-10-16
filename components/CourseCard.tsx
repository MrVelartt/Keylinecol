'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { palette } from '@/lib/theme'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'

const includes = [
  '32 h en vivo (miércoles y sábados) + 28 h autónomas con PDF y videos',
  'Grabaciones de todas las sesiones',
  'Software QGIS — libre y gratuito',
  'Diseñas el plano keyline de tu propio predio',
  'Certificado oficial Keyline Colombia (60 horas)',
]

const details = [
  { label: 'Duración', value: '8 semanas · 60 h' },
  { label: 'Modalidad', value: '100% virtual en vivo' },
  { label: 'Requisitos', value: 'Ninguno · sí computador' },
  { label: 'Inicia', value: '23 sep 2026' },
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
              stroke={palette.brand.DEFAULT}
              strokeWidth="0.6"
              strokeDasharray="3 7"
              opacity={0.8 - i * 0.08}
            />
          ))}
          <circle cx="185" cy="105" r="5" fill={palette.brand.DEFAULT} opacity="0.9" />
          <circle cx="185" cy="105" r="14" stroke={palette.brand.DEFAULT} strokeWidth="0.5" opacity="0.35" />
          <circle cx="185" cy="105" r="26" stroke={palette.brand.DEFAULT} strokeWidth="0.3" opacity="0.15" />
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
          alt="Diseño Keyline en campo"
          className="w-full h-full object-cover"
          onError={() => handleError(0)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-raised/60 via-transparent to-transparent" />
      </div>

      {/* Thumbnails row */}
      {visibleThumbs.length > 0 && (
        <div className={`grid gap-1.5 h-24 shrink-0`} style={{ gridTemplateColumns: `repeat(${visibleThumbs.length}, 1fr)` }}>
          {visibleThumbs.map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg">
              <img
                src={src}
                alt={`Diseño Keyline en campo ${i + 2}`}
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
          <SectionHeader
            inView={inView}
            className=""
            eyebrow="Formación"
            title={
              <>
                Del terreno al plano,{' '}
                <Accent>del plano al campo</Accent>
              </>
            }
          />
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 64 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-subtle bg-surface-raised overflow-hidden"
        >
          <div className="grid lg:grid-cols-2">
            {/* Left: gallery panel */}
            <div className="relative min-h-[420px] lg:min-h-[540px] overflow-hidden bg-landscape-moss">
              <CourseGallery />

              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-raised/20 pointer-events-none" />

              {/* Badge over image */}
              <div className="absolute top-6 left-6 z-10">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-sm border border-brand/20 text-brand text-xs tracking-wide">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand" />
                  </span>
                  Inscripciones abiertas
                </div>
              </div>

              {/* Course label bottom */}
              <div className="absolute bottom-6 left-6 z-10">
                <div className="font-mono text-[10px] text-brand/60 tracking-widest uppercase mb-1">
                  Curso virtual en vivo
                </div>
                <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-tight text-primary drop-shadow-lg">
                  Diseño Keyline<br />del terreno al plano
                </h3>
              </div>
            </div>

            {/* Right: pricing & details */}
            <div className="p-10 lg:p-16 border-t lg:border-t-0 lg:border-l border-subtle">
              {/* Price */}
              <div className="mb-10">
                <div className="text-mono text-xs tracking-widest uppercase mb-3">Inversión</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[3.5rem] font-bold text-brand leading-none">
                    $550.000
                  </span>
                </div>
                <div className="text-mono text-sm mt-1.5">
                  COP &nbsp;·&nbsp; cupos limitados · máx. 50 personas
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-10">
                {details.map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-mono text-[9px] tracking-[0.22em] uppercase mb-1.5">
                      {label}
                    </div>
                    <div className="text-primary font-medium text-sm">{value}</div>
                  </div>
                ))}
              </div>

              {/* Includes */}
              <div className="space-y-3 mb-10">
                {includes.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-secondary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="7" stroke={palette.brand.DEFAULT} strokeWidth="1" opacity="0.4" />
                      <path d="M5 8L7 10L11 6" stroke={palette.brand.DEFAULT} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="https://wa.me/573113650567?text=Hola%2C%20quiero%20inscribirme%20al%20curso%20de%20Dise%C3%B1o%20Keyline%20que%20inicia%20el%2023%20de%20septiembre"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-brand text-surface rounded-full font-semibold text-sm hover:bg-brand-hover transition-all duration-200 hover:shadow-glow-lg hover:scale-[1.02]"
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
