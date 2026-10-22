'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { TOOLS, isToolsPath } from '@/lib/tools'

const links = [
  { label: 'Metodología', href: '/#metodologia', type: 'anchor' as const },
  { label: 'Herramientas', href: '/herramientas', type: 'tools' as const },
  { label: 'Proyectos', href: '/#proyectos', type: 'anchor' as const },
  { label: 'Cursos', href: '/#cursos', type: 'anchor' as const },
  { label: 'Nosotros', href: '/#nosotros', type: 'anchor' as const },
]

export default function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(!isHome)
  const [active, setActive] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isHome) {
      setScrolled(true)
      return
    }
    const anchorIds = links.filter((l) => l.type === 'anchor').map((l) => l.href.replace('/#', ''))
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      for (const id of [...anchorIds].reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 140) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  const isLinkActive = (link: (typeof links)[number]) =>
    link.type === 'tools' ? isToolsPath(pathname) : isHome && active === link.href.replace('/#', '')

  // Menú «Herramientas ▾»: se abre con clic o teclado, se cierra con Escape,
  // clic fuera o al navegar.
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)
  const toolsButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setToolsOpen(false)
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!toolsOpen) return
    const onPointer = (e: PointerEvent) => {
      if (!toolsRef.current?.contains(e.target as Node)) setToolsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToolsOpen(false)
        toolsButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [toolsOpen])

  const focusTool = (dir: 1 | -1 | 'first' | 'last') => {
    const items = Array.from(toolsRef.current?.querySelectorAll<HTMLAnchorElement>('[data-tool-item]') ?? [])
    if (!items.length) return
    const i = items.indexOf(document.activeElement as HTMLAnchorElement)
    const next = dir === 'first' ? 0 : dir === 'last' ? items.length - 1 : (i + dir + items.length) % items.length
    items[next].focus()
  }

  const onToolsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!toolsOpen) setToolsOpen(true)
      requestAnimationFrame(() => focusTool(toolsOpen ? 1 : 'first'))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusTool(-1)
    } else if (e.key === 'Home' && toolsOpen) {
      e.preventDefault()
      focusTool('first')
    } else if (e.key === 'End' && toolsOpen) {
      e.preventDefault()
      focusTool('last')
    }
  }

  const isToolActive = (href: string) => href === pathname

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-surface/[0.88] backdrop-blur-2xl border-b border-subtle'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between gap-8">
          {/* Logo real */}
          <a href="/" className="shrink-0 flex items-center" aria-label="Keyline Colombia">
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
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-mono tracking-widest select-none">
            <span className="w-1 h-1 rounded-full bg-brand animate-pulse" />
            04°09′N&nbsp;·&nbsp;73°38′O&nbsp;·&nbsp;ELV 467m
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = isLinkActive(link)
              if (link.type === 'tools') {
                return (
                  <div key={link.label} ref={toolsRef} className="relative" onKeyDown={onToolsKeyDown}>
                    <button
                      ref={toolsButtonRef}
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={toolsOpen}
                      aria-controls="nav-herramientas"
                      onClick={() => setToolsOpen((o) => !o)}
                      className={`relative flex items-center gap-1.5 px-4 py-2 text-[13px] tracking-wide transition-colors duration-200 rounded-lg ${
                        isActive || toolsOpen ? 'text-brand' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-brand/[0.08] border border-brand/20 rounded-lg"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{link.label}</span>
                      <svg
                        aria-hidden="true"
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        className={`relative transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {toolsOpen && (
                        <motion.div
                          id="nav-herramientas"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="absolute top-full right-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 mt-3 w-[min(600px,calc(100vw-48px))] p-3 rounded-2xl border border-subtle bg-surface-raised shadow-2xl"
                        >
                          <ul className="grid sm:grid-cols-2 gap-1">
                            {TOOLS.map((t) => {
                              const on = isToolActive(t.href)
                              return (
                                <li key={t.slug}>
                                  <a
                                    data-tool-item
                                    href={t.href}
                                    aria-current={on ? 'page' : undefined}
                                    onClick={() => setToolsOpen(false)}
                                    className={`flex gap-3 p-3 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                                      on ? 'bg-brand/10' : 'hover:bg-veil focus-visible:bg-veil'
                                    }`}
                                  >
                                    <span className="font-mono text-[11px] text-brand tabular-nums pt-0.5">{t.numero}</span>
                                    <span className="min-w-0">
                                      <span className={`block text-[13px] font-medium ${on ? 'text-brand' : 'text-primary'}`}>{t.nombre}</span>
                                      <span className="block text-[12px] text-mono leading-snug mt-0.5">{t.descripcion}</span>
                                    </span>
                                  </a>
                                </li>
                              )
                            })}
                          </ul>
                          <a
                            data-tool-item
                            href="/herramientas"
                            onClick={() => setToolsOpen(false)}
                            className="mt-2 flex items-center justify-between px-3 py-2.5 rounded-xl border-t border-subtle text-[12px] text-secondary hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 transition-colors"
                          >
                            Ver todas las herramientas
                            <span aria-hidden="true">→</span>
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 text-[13px] tracking-wide transition-colors duration-200 rounded-lg ${
                    isActive ? 'text-brand' : 'text-secondary hover:text-primary'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-brand/[0.08] border border-brand/20 rounded-lg"
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
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-brand text-surface rounded-full text-[13px] font-semibold hover:bg-brand-hover transition-all duration-200 hover:scale-105 hover:shadow-glow"
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
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-veil-strong transition-colors"
              aria-label="Menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-5 h-px bg-ink-secondary block origin-center"
                transition={{ duration: 0.25 }}
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, x: -6 } : { opacity: 1, x: 0 }}
                className="w-5 h-px bg-ink-secondary block"
                transition={{ duration: 0.25 }}
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-5 h-px bg-ink-secondary block origin-center"
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
            className="fixed top-[72px] left-0 right-0 z-40 bg-surface-sunken/95 backdrop-blur-2xl border-b border-subtle"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1">
              {links.map((link) =>
                link.type === 'tools' ? (
                  <div key={link.label}>
                    <button
                      type="button"
                      aria-expanded={mobileToolsOpen}
                      aria-controls="nav-herramientas-movil"
                      onClick={() => setMobileToolsOpen((o) => !o)}
                      className={`w-full flex items-center justify-between py-3.5 px-4 rounded-lg transition-all duration-200 text-sm tracking-wide border border-transparent hover:bg-veil hover:border-subtle ${
                        isLinkActive(link) ? 'text-brand' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      {link.label}
                      <svg
                        aria-hidden="true"
                        width="12"
                        height="12"
                        viewBox="0 0 10 10"
                        className={`transition-transform duration-200 ${mobileToolsOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {mobileToolsOpen && (
                      <ul id="nav-herramientas-movil" className="ml-4 pl-3 border-l border-subtle my-1 space-y-0.5">
                        {TOOLS.map((t) => (
                          <li key={t.slug}>
                            <a
                              href={t.href}
                              aria-current={isToolActive(t.href) ? 'page' : undefined}
                              onClick={() => setMenuOpen(false)}
                              className={`flex gap-3 py-2.5 px-3 rounded-lg text-sm transition-colors hover:bg-veil ${
                                isToolActive(t.href) ? 'text-brand' : 'text-secondary hover:text-primary'
                              }`}
                            >
                              <span className="font-mono text-[11px] text-brand tabular-nums pt-0.5">{t.numero}</span>
                              {t.nombre}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3.5 px-4 text-secondary hover:text-primary hover:bg-veil rounded-lg transition-all duration-200 text-sm tracking-wide border border-transparent hover:border-subtle"
                >
                  {link.label}
                </a>
                )
              )}
              <a
                href="https://wa.me/573113650567"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 py-3.5 bg-brand text-surface rounded-full font-semibold text-sm"
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
