'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'

// ── Encabezado de sección único del sitio ──
// Eyebrow (línea + mayúsculas mono en verde), H2 serif con palabra acentuada
// (<Accent>, cursiva verde) y subtítulo en text-secondary con ancho de línea
// fijo. Ningún título del sitio debe declarar estilos propios: si hace falta
// una variante, se agrega aquí.

const EASE = [0.22, 1, 0.36, 1] as const

const TITLE_SIZE = {
  lg: 'text-[clamp(2.6rem,6vw,4.8rem)]',
  md: 'text-[clamp(2rem,4vw,3.2rem)]',
  sm: 'text-[clamp(1.8rem,3.6vw,2.6rem)]',
} as const

/** Palabra acentuada del título: cursiva serif en verde institucional. */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="font-display italic text-brand">{children}</em>
}

/** Numeración de submódulos (01, 02…): un solo estilo mono. */
export function ModuleNumber({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono text-[11px] text-brand tracking-[0.2em] tabular-nums ${className}`}>{children}</span>
}

/** Eyebrow suelto (para bloques internos que no llevan H2). */
export function Eyebrow({ children, number, className = '' }: { children: ReactNode; number?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="w-7 h-px bg-brand/60" aria-hidden="true" />
      <span className="font-mono text-brand text-[10px] tracking-[0.32em] uppercase">
        {children}
        {number && <span className="text-mono"> · {number}</span>}
      </span>
    </div>
  )
}

export default function SectionHeader({
  eyebrow,
  number,
  title,
  subtitle,
  aside,
  size = 'lg',
  as = 'h2',
  inView: inViewProp,
  className = 'mb-16',
}: {
  eyebrow?: ReactNode
  number?: string
  title: ReactNode
  subtitle?: ReactNode
  /** Contenido alineado a la derecha del título en desktop (leyendas, filtros). */
  aside?: ReactNode
  size?: keyof typeof TITLE_SIZE
  as?: 'h1' | 'h2'
  /** Si la sección ya controla su propio useInView, pásalo aquí. */
  inView?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const ownInView = useInView(ref, { once: true, margin: '-60px' })
  const inView = inViewProp ?? ownInView
  const Title = as === 'h1' ? motion.h1 : motion.h2

  return (
    <div ref={ref} className={className}>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className={size === 'sm' ? 'mb-4' : 'mb-7'}
        >
          <Eyebrow number={number}>{eyebrow}</Eyebrow>
        </motion.div>
      )}

      <div className={aside ? 'flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8' : undefined}>
        <Title
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, delay: 0.1, ease: EASE }}
          className={`font-display ${TITLE_SIZE[size]} font-semibold leading-tight text-primary text-balance max-w-3xl`}
        >
          {title}
        </Title>
        {aside && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="shrink-0"
          >
            {aside}
          </motion.div>
        )}
      </div>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`text-secondary leading-relaxed max-w-2xl ${size === 'sm' ? 'mt-3' : 'mt-6'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
