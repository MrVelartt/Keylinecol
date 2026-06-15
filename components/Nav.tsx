'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const links = [
  { label: 'Metodología', href: '#metodologia' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Cursos', href: '#cursos' },
  { label: 'Nosotros', href: '#nosotros' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      const sections = links.map((l) => l.href.replace('#', ''))
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 140) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'backdrop-blur-2xl border-b border-white/[0.05]'
            : 'bg-transparent'
        }`}
        style={scrolled ? { backgroundColor: 'rgba(7,16,7,0.88)' } : {}}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between gap-8">
          {/* Logo real */}
          <a href="#" className="shrink-0 flex items-center" aria-label="Keyline Colombia">
            <Image
              src="/brand/logo-dark.png"
              alt="Keyline Colombia"
              width={160}
              height={48}
              className="h-9 w-auto object-contain"
              priority
            />
          </a>

          {/* Center: coordinates (tech accent) */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-white/20 tracking-widest select-none">
            <span className="w-1 h-1 rounded-full bg-[#8DC63F] animate-pulse" />
            04°09′N&nbsp;·&nbsp;73°38′O&nbsp;·&nbsp;ELV 467m
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const id = link.href.replace('#', '')
              const isActive = active === id
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 text-[13px] tracking-wide transition-colors duration-200 rounded-lg ${
                    isActive ? 'text-[#8DC63F]' : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#8DC63F]/[0.08] border border-[#8DC63F]/20 rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/573113650567"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#8DC63F] text-[#0a120a] rounded-full text-[13px] font-semibold hover:bg-[#9ed44f] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(141,198,63,0.35)]"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.12 1.532 5.847L.057 23.617l5.9-1.548A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.026-1.387l-.36-.215-3.494.917.93-3.4-.234-.375A9.818 9.818 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818 5.421 0 9.818 4.397 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z" />
              </svg>
              WhatsApp
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-5 h-px bg-white/70 block origin-center"
                transition={{ duration: 0.25 }}
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, x: -6 } : { opacity: 1, x: 0 }}
                className="w-5 h-px bg-white/70 block"
                transition={{ duration: 0.25 }}
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-5 h-px bg-white/70 block origin-center"
                transition={{ duration: 0.25 }}
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-[#080f08]/95 backdrop-blur-2xl border-b border-white/[0.05]"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3.5 px-4 text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-200 text-sm tracking-wide border border-transparent hover:border-white/[0.06]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://wa.me/573113650567"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 py-3.5 bg-[#8DC63F] text-[#0a120a] rounded-full font-semibold text-sm"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
