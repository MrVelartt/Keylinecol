'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface LandscapeBreakProps {
  image: string
  quote: string
  sub?: string
}

export default function LandscapeBreak({ image, quote, sub }: LandscapeBreakProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [imgError, setImgError] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <div ref={ref} className="relative h-[55vh] min-h-[340px] overflow-hidden">
      {/* Parallax image */}
      {!imgError ? (
        <motion.div className="absolute inset-[-10%]" style={{ y }}>
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-[#0c180c]" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#1D1D1B]/65" />

      {/* Keyline grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(149,193,31,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(149,193,31,0.025) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#95C11F]/50 to-[#95C11F]/20 mx-auto mb-8" />
          <blockquote className="font-display text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white leading-tight max-w-3xl">
            {quote}
          </blockquote>
          {sub && (
            <p className="mt-5 font-mono text-[#95C11F]/60 text-[10px] tracking-[0.35em] uppercase">
              {sub}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
