'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import MountainSVG from './MountainSVG'

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const mountainY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.65], ['0%', '-10%'])

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[700px] overflow-hidden flex items-center justify-center"
    >
      {/* Base bg */}
      <div className="absolute inset-0 bg-[#0a120a]" />

      {/* Subtle orthographic grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(141,183,106,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(141,183,106,0.025) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Radial ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full bg-[#8DB76A]/[0.035] blur-[160px]" />
      </div>

      {/* Mountains */}
      <motion.div className="absolute inset-0" style={{ y: mountainY }}>
        <MountainSVG />
      </motion.div>

      {/* Top vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a120a]/65 via-transparent to-[#0a120a] pointer-events-none" />

      {/* ── Technical corner overlays ── */}

      {/* Top-left: coordinates */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 2.2 }}
        className="absolute top-24 left-6 lg:left-12 z-10 font-mono text-[10px] text-[#8DB76A]/50 tracking-widest hidden lg:block"
      >
        <div>LAT · 04°09′N</div>
        <div>LON · 73°38′O</div>
        <div className="mt-1.5 text-white/20">VILLAVICENCIO · META · COL</div>
      </motion.div>

      {/* Top-right: elevation */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 2.4 }}
        className="absolute top-24 right-6 lg:right-12 z-10 font-mono text-[10px] text-[#8DB76A]/50 tracking-widest text-right hidden lg:block"
      >
        <div>ELV · 467m</div>
        <div>PIEDEMONTE LLANERO</div>
        <div className="mt-1.5 text-white/20">SISTEMA KEYLINE ACTIVO</div>
      </motion.div>

      {/* Right-side vertical rule */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2 z-10"
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-px bg-[#8DB76A]"
            style={{ opacity: 0.12 + i * 0.04, width: i % 3 === 0 ? 12 : 6 }}
          />
        ))}
        <span className="text-[#8DB76A]/30 font-mono text-[8px] tracking-widest mt-1" style={{ writingMode: 'vertical-rl' }}>
          ↑ ELEVACIÓN
        </span>
      </motion.div>

      {/* Main content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-16"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="w-10 h-px bg-[#8DB76A]/50" />
          <span className="font-mono text-[#8DB76A] text-[10px] tracking-[0.38em] uppercase">
            Metodología Keyline · Colombia
          </span>
          <div className="w-10 h-px bg-[#8DB76A]/50" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 52 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(3rem,9vw,7.5rem)] font-semibold leading-[0.92] tracking-tight mb-8"
        >
          Diseña el{' '}
          <em className="text-[#8DB76A] not-italic">Paisaje,</em>
          <br />
          Transforma{' '}
          <span className="relative inline-block">
            la Tierra
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#8DB76A]/80 origin-left rounded-full"
            />
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65 }}
          className="text-white/40 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-12"
        >
          Regeneramos fincas y paisajes colombianos a través del diseño Keyline:
          agua, suelo y biodiversidad en perfecta armonía.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#proyectos"
            className="px-8 py-4 bg-[#8DB76A] text-[#0a120a] rounded-full font-semibold text-sm tracking-wide hover:bg-[#9ec87a] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_32px_rgba(141,183,106,0.4)]"
          >
            Ver Proyectos
          </a>
          <a
            href="#metodologia"
            className="px-8 py-4 border border-white/12 text-white/70 rounded-full font-medium text-sm tracking-wide hover:border-white/25 hover:bg-white/[0.04] hover:text-white transition-all duration-200"
          >
            Explorar Método
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-white/25 to-transparent"
        />
        <span className="font-mono text-white/20 text-[9px] tracking-[0.4em] uppercase">Scroll</span>
      </motion.div>
    </section>
  )
}
