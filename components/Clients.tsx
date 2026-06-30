'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

const clients = [
  { name: 'Mineros S.A.', logo: null as string | null, initials: 'MS' },
  { name: 'Grupo BIOS', logo: null as string | null, initials: 'GB' },
  { name: 'Fundación BIOS', logo: null as string | null, initials: 'FB' },
]

function ClientLogo({ client }: { client: (typeof clients)[0] }) {
  return (
    <div className="flex flex-col items-center gap-3 px-10 shrink-0 group">
      <div className="w-20 h-20 rounded-2xl border border-white/[0.08] bg-[#2C2C2A] flex items-center justify-center group-hover:border-[#95C11F]/25 transition-all duration-400">
        {client.logo ? (
          <Image
            src={client.logo}
            alt={client.name}
            width={64}
            height={64}
            className="w-14 h-14 object-contain"
          />
        ) : (
          <span className="font-display text-xl font-semibold text-[#95C11F]/40 select-none group-hover:text-[#95C11F]/60 transition-colors duration-300">
            {client.initials}
          </span>
        )}
      </div>
      <span className="text-white/30 text-[11px] tracking-wide whitespace-nowrap group-hover:text-white/50 transition-colors duration-300">
        {client.name}
      </span>
    </div>
  )
}

export default function Clients() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const doubled = [...clients, ...clients, ...clients, ...clients]

  return (
    <section className="py-24 border-y border-white/[0.06] overflow-hidden">
      <div ref={ref} className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="w-7 h-px bg-[#95C11F]/60" />
          <span className="font-mono text-[#95C11F] text-[10px] tracking-[0.32em] uppercase">
            Nos han confiado su tierra
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-tight text-white/90"
        >
          Organizaciones que{' '}
          <em className="text-[#95C11F] not-italic">confían en el método</em>
        </motion.h2>
      </div>

      {/* Scrolling row */}
      <motion.div
        className="flex"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((client, i) => (
          <ClientLogo key={i} client={client} />
        ))}
      </motion.div>
    </section>
  )
}
