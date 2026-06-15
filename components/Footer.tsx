'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <footer className="relative pt-40 pb-14 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141412] via-[#1D1D1B] to-[#1D1D1B]" />

      {/* Patrón de anillos de marca como textura de fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/brand/patron-anillos.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '480px',
          opacity: 0.04,
        }}
      />

      {/* Faint mountain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-56 opacity-[0.04] pointer-events-none">
        <svg viewBox="0 0 1440 224" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,120 C200,30 440,90 680,45 C920,0 1100,70 1280,38 C1370,22 1420,75 1440,95 L1440,224 L0,224 Z"
            fill="#95C11F"
          />
        </svg>
      </div>

      <div ref={ref} className="relative max-w-5xl mx-auto text-center">
        {/* Vertical line */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={inView ? { height: 72, opacity: 1 } : {}}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="w-px bg-gradient-to-b from-[#95C11F]/60 to-transparent mx-auto mb-12"
        />

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 48 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2rem,5vw,3.8rem)] font-semibold leading-tight mb-8"
        >
          "El agua es el{' '}
          <em className="text-[#95C11F] not-italic">alma de la tierra.</em>
          {' '}Keyline la guía."
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-white/25 text-xs tracking-[0.3em] uppercase mb-20"
        >
          — Principio Keyline Design
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-28"
        >
          <a
            href="https://wa.me/573113650567?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Keyline%20Colombia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-[#95C11F] text-[#1D1D1B] rounded-full font-semibold hover:bg-[#a6d42a] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(149,193,31,0.45)]"
          >
            <svg width="19" height="19" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.12 1.532 5.847L.057 23.617l5.9-1.548A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.026-1.387l-.36-.215-3.494.917.93-3.4-.234-.375A9.818 9.818 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818 5.421 0 9.818 4.397 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z" />
            </svg>
            Hablemos por WhatsApp
          </a>
          <a
            href="#cursos"
            className="px-8 py-4 border border-[#444441] text-white/70 rounded-full font-medium hover:border-white/30 hover:bg-white/[0.05] hover:text-white transition-all duration-200"
          >
            Ver todos los cursos
          </a>
        </motion.div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-5 text-sm">
          {/* Logo real */}
          <Image
            src="/brand/logo-dark.png"
            alt="Keyline Colombia"
            width={130}
            height={40}
            className="h-8 w-auto object-contain"
          />

          <div className="text-white/25 text-xs">
            © 2026 Keyline Colombia · Diseño regenerativo de paisajes
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/keylinecolombia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/25 hover:text-[#95C11F] transition-colors duration-200 text-xs tracking-wide"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@keylinecolombia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/25 hover:text-[#95C11F] transition-colors duration-200 text-xs tracking-wide"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
