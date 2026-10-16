'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import SectionHeader, { Accent } from '@/components/ui/SectionHeader'

const clients = [
  { name: 'Mineros S.A.', logo: null as string | null, initials: 'MS' },
  { name: 'Grupo BIOS', logo: null as string | null, initials: 'GB' },
  { name: 'Fundación BIOS', logo: null as string | null, initials: 'FB' },
]

function ClientLogo({ client }: { client: (typeof clients)[0] }) {
  return (
    <div className="flex flex-col items-center gap-3 px-10 shrink-0 group">
      <div className="w-20 h-20 rounded-2xl border border-subtle bg-surface-raised flex items-center justify-center group-hover:border-brand/25 transition-all duration-400">
        {client.logo ? (
          <Image
            src={client.logo}
            alt={client.name}
            width={64}
            height={64}
            className="w-14 h-14 object-contain"
          />
        ) : (
          <span className="font-display text-xl font-semibold text-brand/40 select-none group-hover:text-brand/60 transition-colors duration-300">
            {client.initials}
          </span>
        )}
      </div>
      <span className="text-mono text-[11px] tracking-wide whitespace-nowrap group-hover:text-secondary transition-colors duration-300">
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
    <section className="py-24 border-y border-subtle overflow-hidden">
      <div ref={ref} className="max-w-7xl mx-auto px-6 mb-12">
        <SectionHeader
          inView={inView}
          className=""
          eyebrow="Nos han confiado su tierra"
          size="md"
          title={
            <>
              Organizaciones que{' '}
              <Accent>confían en el método</Accent>
            </>
          }
        />
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
