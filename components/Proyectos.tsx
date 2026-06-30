'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

interface Project {
  id: string
  name: string
  location: string
  dept: string
  coverImage: string
  images: string[]
  ha: number
  elv: string
  type: string
  year: number
  status: 'Completado' | 'En progreso' | 'Planificación'
  coords: string
  terrain: string
  keypointX: number
  keypointY: number
  contours: string[]
  description: string
}

const projects: Project[] = [
  {
    id: 'P-001',
    name: 'Proyecto Guajira',
    coverImage: '/projects/la-guajira/lg01.JPG',
    images: [
      '/projects/la-guajira/lg01.JPG',
      '/projects/la-guajira/lg02.jpeg',
      '/projects/la-guajira/lg03.jpeg',
      '/projects/la-guajira/lg05.png',
      '/projects/la-guajira/lg06.png',
      '/projects/la-guajira/lg07.jpg',
      '/projects/la-guajira/lg08.png',
    ],
    location: 'La Guajira',
    dept: 'La Guajira',
    ha: 3,
    elv: '100m',
    type: 'Drone Keyline · Sintrópico · Pastoreo Regenerativo',
    year: 2023,
    status: 'Completado',
    coords: '11°30′N · 72°54′O',
    terrain: 'M0,138 C60,134 125,130 185,133 C240,136 278,135 310,138 L310,165 L0,165Z',
    keypointX: 155,
    keypointY: 131,
    contours: [
      'M0,120 C60,116 125,112 185,115 C240,118 278,117 310,120',
      'M0,108 C60,104 125,100 185,103 C240,106 278,105 310,108',
      'M0,94 C60,90 125,86 185,89 C240,92 278,91 310,94',
    ],
    description: 'Drone Keyline, agricultura sintrópica y pastoreo regenerativo. Sistema integrado de manejo del agua y biodiversidad en condiciones áridas del Caribe colombiano.',
  },
  {
    id: 'P-002',
    name: 'Proyecto Piedra Bonita',
    coverImage: '/projects/piedra-bonita/pb01.png',
    images: [
      '/projects/piedra-bonita/pb01.png',
      '/projects/piedra-bonita/pb02.jpg',
      '/projects/piedra-bonita/pb03.jpg',
      '/projects/piedra-bonita/pb04.png',
      '/projects/piedra-bonita/pb05.jpg',
      '/projects/piedra-bonita/pb06.png',
      '/projects/piedra-bonita/pb07.png',
    ],
    location: 'El Bagre',
    dept: 'Antioquia',
    ha: 3,
    elv: '40m',
    type: 'Drone Keyline · Sistema Agroforestal · Sintrópico',
    year: 2023,
    status: 'Completado',
    coords: '7°35′N · 74°48′O',
    terrain: 'M0,128 C40,115 80,105 125,112 C168,118 215,120 262,115 C282,112 298,118 310,125 L310,165 L0,165Z',
    keypointX: 125,
    keypointY: 112,
    contours: [
      'M0,110 C40,98 80,88 125,95 C168,101 215,103 262,98 C284,95 300,100 310,106',
      'M0,98 C40,86 80,76 125,83 C168,89 215,91 262,86 C284,83 300,88 310,94',
      'M0,86 C40,74 80,64 125,71 C168,77 215,79 262,74 C284,71 300,76 310,82',
    ],
    description: 'Drone Keyline para sistema agroforestal con agricultura sintrópica. Diseño hídrico en ecosistema de selva húmeda tropical del Bajo Cauca antioqueño.',
  },
  {
    id: 'P-003',
    name: 'Mineros S.A.',
    coverImage: '/projects/el-bagre/eb01.png',
    images: [
      '/projects/el-bagre/eb01.png',
      '/projects/el-bagre/eb02.png',
      '/projects/el-bagre/eb03.png',
      '/projects/el-bagre/eb04.png',
      '/projects/el-bagre/eb05.png',
      '/projects/el-bagre/eb06.jpg',
      '/projects/el-bagre/eb07.png',
      '/projects/el-bagre/eb08.png',
      '/projects/el-bagre/eb09.png',
    ],
    location: 'El Bagre',
    dept: 'Antioquia',
    ha: 3,
    elv: '40m',
    type: 'Diseño Keyline · Sistema Agroforestal · Sintrópico',
    year: 2024,
    status: 'Completado',
    coords: '7°35′N · 74°49′O',
    terrain: 'M0,125 C35,110 72,98 118,105 C158,111 200,108 245,112 C272,115 292,118 310,120 L310,165 L0,165Z',
    keypointX: 118,
    keypointY: 105,
    contours: [
      'M0,108 C35,93 72,81 118,88 C158,94 200,91 245,95 C272,98 292,101 310,103',
      'M0,96 C35,81 72,69 118,76 C158,82 200,79 245,83 C272,86 292,89 310,91',
      'M0,84 C35,69 72,57 118,64 C158,70 200,67 245,71 C272,74 292,77 310,79',
    ],
    description: 'Diseño Keyline para sistema agroforestal con agricultura sintrópica. Proyecto de restauración productiva en área de influencia minera del Bajo Cauca antioqueño.',
  },
  {
    id: 'P-006',
    name: 'Proyecto Ebéjico',
    coverImage: '/projects/ebejico/ebe01.png',
    images: [
      '/projects/ebejico/ebe01.png',
      '/projects/ebejico/ebe02.png',
      '/projects/ebejico/ebe03.png',
      '/projects/ebejico/ebe04.png',
    ],
    location: 'Ebéjico',
    dept: 'Antioquia',
    ha: 3,
    elv: '1.400m',
    type: 'Diseño Keyline · Agroforestal Cafetero',
    year: 2024,
    status: 'Completado',
    coords: '6°20′N · 75°45′O',
    terrain: 'M0,145 C28,128 55,95 92,68 C128,42 158,55 192,78 C225,100 265,128 310,142 L310,165 L0,165Z',
    keypointX: 92,
    keypointY: 68,
    contours: [
      'M10,125 C38,108 65,75 102,50 C138,28 168,40 200,62 C232,82 270,108 310,122',
      'M0,133 C28,116 55,83 92,58 C128,36 158,48 192,70 C225,90 265,116 310,130',
      'M0,142 C28,126 55,95 92,70 C128,48 158,60 192,82 C225,102 265,128 310,140',
    ],
    description: 'Diseño Keyline para sistema agroforestal en café. Integración del ciclo del agua y la sombra en la producción cafetera de la zona occidental antioqueña.',
  },
  {
    id: 'P-007',
    name: 'Proyecto Villanueva',
    coverImage: '/projects/villanueva/vi02.jpg',
    images: [
      '/projects/villanueva/vi02.jpg',
    ],
    location: 'Villanueva',
    dept: 'Casanare',
    ha: 456,
    elv: '350m',
    type: 'Diseño Keyline · Ganadería Regenerativa',
    year: 2023,
    status: 'Completado',
    coords: '4°37′N · 72°59′O',
    terrain: 'M0,140 C55,136 112,132 168,134 C215,136 258,138 310,140 L310,165 L0,165Z',
    keypointX: 168,
    keypointY: 133,
    contours: [
      'M0,124 C55,120 112,116 168,118 C215,120 258,122 310,124',
      'M0,112 C55,108 112,104 168,106 C215,108 258,110 310,112',
      'M0,100 C55,96 112,92 168,94 C215,96 258,98 310,100',
    ],
    description: 'Diseño Keyline para ganadería en 456 hectáreas del piedemonte casanareño. Sistema de captación y distribución de agua orientado a la productividad ganadera.',
  },
  {
    id: 'P-009',
    name: 'Proyecto Tauramena',
    coverImage: '/projects/tauramena/ta01.png',
    images: [
      '/projects/tauramena/ta01.png',
      '/projects/tauramena/ta02.png',
      '/projects/tauramena/ta03.jpeg',
      '/projects/tauramena/ta04.jpeg',
    ],
    location: 'Tauramena',
    dept: 'Casanare',
    ha: 100,
    elv: '400m',
    type: 'Diseño Keyline · Ganadería Regenerativa',
    year: 2023,
    status: 'Completado',
    coords: '5°01′N · 72°39′O',
    terrain: 'M0,138 C50,130 102,124 158,127 C208,130 258,134 310,137 L310,165 L0,165Z',
    keypointX: 158,
    keypointY: 126,
    contours: [
      'M0,122 C50,114 102,108 158,111 C208,114 258,118 310,121',
      'M0,110 C50,102 102,96 158,99 C208,102 258,106 310,109',
      'M0,98 C50,90 102,84 158,87 C208,90 258,94 310,97',
    ],
    description: 'Diseño Keyline para ganadería en el piedemonte casanareño. Trazado de líneas clave para maximizar la retención de agua en pasturas de alta productividad.',
  },
  {
    id: 'P-010',
    name: 'Proyecto Prado',
    coverImage: '/projects/prado/pr01.png',
    images: [
      '/projects/prado/pr01.png',
      '/projects/prado/pr02.png',
    ],
    location: 'Prado',
    dept: 'Tolima',
    ha: 22,
    elv: '400m',
    type: 'Diseño Keyline · Ganadería Lechera',
    year: 2024,
    status: 'Completado',
    coords: '3°45′N · 74°55′O',
    terrain: 'M0,132 C28,115 62,90 102,72 C140,55 170,65 208,85 C240,102 275,122 310,132 L310,165 L0,165Z',
    keypointX: 102,
    keypointY: 72,
    contours: [
      'M8,115 C35,98 66,74 108,57 C145,42 174,51 210,70 C242,87 275,106 310,115',
      'M0,122 C28,106 62,82 102,65 C140,50 170,60 208,80 C240,97 275,116 310,122',
      'M0,130 C28,114 62,90 102,74 C140,60 170,70 208,90 C240,107 275,126 310,130',
    ],
    description: 'Diseño Keyline para ganadería lechera en el valle del río Prado. Sistema de distribución hídrica orientado a maximizar la productividad lechera en Tolima.',
  },
  {
    id: 'P-011',
    name: 'Tranquilandia',
    coverImage: '/projects/tranquilandia/tr01.jpg',
    images: [
      '/projects/tranquilandia/tr01.jpg',
      '/projects/tranquilandia/tr02.jpg',
      '/projects/tranquilandia/tr03.jpg',
      '/projects/tranquilandia/tr04.jpg',
      '/projects/tranquilandia/tr05.jpg',
      '/projects/tranquilandia/tr06.jpg',
    ],
    location: 'Mesetas',
    dept: 'Meta',
    ha: 10,
    elv: '600m',
    type: 'Diseño Keyline · Agrosilvopastoril · Cacao + Ganadería',
    year: 2024,
    status: 'Completado',
    coords: '3°22′N · 74°03′O',
    terrain: 'M0,138 C22,122 50,98 85,72 C118,48 148,60 178,82 C208,102 255,128 310,140 L310,165 L0,165Z',
    keypointX: 85,
    keypointY: 72,
    contours: [
      'M8,120 C28,105 55,82 90,58 C122,36 150,48 180,68 C210,88 256,112 310,122',
      'M0,128 C22,112 50,90 85,66 C118,44 148,56 178,76 C208,96 255,120 310,130',
      'M0,136 C22,120 50,98 85,74 C118,52 148,64 178,84 C208,104 255,130 310,138',
    ],
    description: 'Diseño Keyline para sistema agrosilvopastoril con cacao y ganadería regenerativa. Integración productiva en el piedemonte metense con alta biodiversidad.',
  },
  {
    id: 'P-012',
    name: 'La Consentida',
    coverImage: '/projects/guarne/gu01.jpg',
    images: [
      '/projects/guarne/gu01.jpg',
      '/projects/guarne/gu02.jpg',
      '/projects/guarne/gu03.jpg',
      '/projects/guarne/gu04.jpg',
      '/projects/guarne/gu05.jpg',
      '/projects/guarne/gu06.jpg',
      '/projects/guarne/gu07.jpg',
      '/projects/guarne/gu08.jpg',
      '/projects/guarne/gu09.jpg',
      '/projects/guarne/gu10.jpg',
      '/projects/guarne/gu11.jpg',
    ],
    location: 'Guarne',
    dept: 'Antioquia',
    ha: 0,
    elv: '2.150m',
    type: 'Diseño Keyline · Agroforestal',
    year: 2024,
    status: 'Completado',
    coords: '6°16′N · 75°27′O',
    terrain: 'M0,145 C22,128 48,98 82,68 C115,40 145,52 175,75 C205,96 250,126 310,142 L310,165 L0,165Z',
    keypointX: 82,
    keypointY: 68,
    contours: [
      'M8,126 C28,110 52,82 86,54 C118,28 147,40 176,62 C206,82 250,110 310,124',
      'M0,134 C22,118 48,90 82,62 C115,36 145,48 175,70 C205,90 250,118 310,132',
      'M0,142 C22,126 48,98 82,70 C115,44 145,56 175,78 C205,98 250,128 310,140',
    ],
    description: 'Diseño Keyline en las laderas del oriente antioqueño. Sistema agroforestal integrado en zona de alta pluviosidad y biodiversidad del altiplano.',
  },
]

const statusConfig = {
  'Completado':   { color: 'text-[#95C11F]', bg: 'bg-[#95C11F]/10', border: 'border-[#95C11F]/25', dot: 'bg-[#95C11F]' },
  'En progreso':  { color: 'text-sky-400',   bg: 'bg-sky-400/10',   border: 'border-sky-400/25',   dot: 'bg-sky-400 animate-pulse' },
  'Planificación':{ color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/25', dot: 'bg-amber-400' },
}

function TerrainSVG({ project }: { project: Project }) {
  return (
    <svg viewBox="0 0 310 165" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="165" fill="#080e08" />
      <pattern id={`g-${project.id}`} width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(149,193,31,0.04)" strokeWidth="0.5" />
      </pattern>
      <rect width="310" height="165" fill={`url(#g-${project.id})`} />
      <path d={project.terrain} fill="#0e1e0e" />
      {project.contours.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#95C11F" strokeWidth="0.6" strokeDasharray="3 7" opacity={0.35 - i * 0.08} />
      ))}
      <line x1="0" y1={project.keypointY + 8} x2="310" y2={project.keypointY + 8} stroke="#95C11F" strokeWidth="0.4" opacity="0.2" strokeDasharray="1 4" />
      <circle cx={project.keypointX} cy={project.keypointY} r="10" fill="rgba(149,193,31,0.08)" />
      <circle cx={project.keypointX} cy={project.keypointY} r="3.5" fill="#95C11F" opacity="0.9" />
      <circle cx={project.keypointX} cy={project.keypointY} r="1.5" fill="#1D1D1B" />
      <circle cx={project.keypointX} cy={project.keypointY} r="0.7" fill="#95C11F" />
      <defs>
        <linearGradient id={`fade-${project.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="60%" stopColor="#080e08" stopOpacity="0" />
          <stop offset="100%" stopColor="#080e08" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="310" height="165" fill={`url(#fade-${project.id})`} />
      <text x="8" y="14" fill="rgba(149,193,31,0.45)" fontSize="7.5" fontFamily="monospace" letterSpacing="0.08em">{project.elv}</text>
      <text x="8" y="24" fill="rgba(149,193,31,0.25)" fontSize="6.5" fontFamily="monospace" letterSpacing="0.06em">{project.id}</text>
    </svg>
  )
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [errors, setErrors] = useState<Set<number>>(new Set())
  const cfg = statusConfig[project.status]

  const displayImages = project.images.filter((_, i) => !errors.has(i))
  const safeIdx = Math.min(activeIdx, Math.max(0, displayImages.length - 1))
  const activeImage = displayImages[safeIdx] ?? null

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setActiveIdx(i => Math.min(i + 1, displayImages.length - 1))
      if (e.key === 'ArrowLeft') setActiveIdx(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose, displayImages.length])

  const handleImgError = (originalIdx: number) => {
    setErrors(prev => new Set(prev).add(originalIdx))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#080e08]/90 backdrop-blur-2xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1D1D1B] border border-white/[0.08] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-black/70 transition-all"
          aria-label="Cerrar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="grid lg:grid-cols-[1fr_360px]">
          {/* ── Image panel ── */}
          <div className="flex flex-col gap-2 p-3 bg-[#0c0f0c] min-h-[320px]">
            {/* Main image */}
            <div className="relative flex-1 min-h-[260px] overflow-hidden rounded-xl bg-[#141814]">
              {activeImage ? (
                <>
                  <img
                    key={activeImage}
                    src={activeImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                    onError={() => {
                      const idx = project.images.indexOf(activeImage)
                      if (idx !== -1) handleImgError(idx)
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                </>
              ) : (
                <TerrainSVG project={project} />
              )}

              {/* Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIdx(i => Math.max(i - 1, 0))}
                    disabled={safeIdx === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white disabled:opacity-20 transition-all"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M8 2L4 6.5L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveIdx(i => Math.min(i + 1, displayImages.length - 1))}
                    disabled={safeIdx === displayImages.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white disabled:opacity-20 transition-all"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M5 2L9 6.5L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}

              {/* Counter */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm font-mono text-[10px] text-white/50">
                  {safeIdx + 1} / {displayImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                {displayImages.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActiveIdx(i)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      i === safeIdx
                        ? 'border-[#95C11F] opacity-100'
                        : 'border-transparent opacity-40 hover:opacity-70'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div className="p-8 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-white/[0.06] overflow-y-auto">
            {/* ID + status */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-white/20 tracking-widest">{project.id}</span>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] tracking-wide font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                {project.status}
              </div>
            </div>

            {/* Name + location */}
            <div>
              <h2 className="font-display text-[1.7rem] font-semibold leading-tight mb-2">{project.name}</h2>
              <div className="flex items-center gap-1.5 text-[12px] text-white/35">
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                  <path d="M5 1C2.79 1 1 2.79 1 5c0 3 4 7 4 7s4-4 4-7c0-2.21-1.79-4-4-4z" stroke="#95C11F" strokeWidth="0.8" fill="none" opacity="0.6" />
                </svg>
                {project.location}, {project.dept}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/[0.06]">
              <div>
                <div className="font-mono text-[9px] text-white/20 tracking-widest uppercase mb-1">Hectáreas</div>
                <div className="font-mono text-[13px] text-[#95C11F] font-medium">
                  {project.ha > 0 ? `${project.ha.toLocaleString('es-CO')} ha` : '—'}
                </div>
              </div>
              <div>
                <div className="font-mono text-[9px] text-white/20 tracking-widest uppercase mb-1">Elevación</div>
                <div className="font-mono text-[13px] text-[#95C11F] font-medium">{project.elv}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] text-white/20 tracking-widest uppercase mb-1">Año</div>
                <div className="font-mono text-[13px] text-[#95C11F] font-medium">{project.year}</div>
              </div>
            </div>

            <div className="font-mono text-[10px] text-[#95C11F]/30 tracking-wide">{project.coords}</div>

            <div className="text-[11px] text-[#95C11F]/50 tracking-wide uppercase font-medium leading-relaxed">{project.type}</div>

            <p className="text-white/45 text-sm leading-[1.85] flex-1">{project.description}</p>

            {/* CTA */}
            <a
              href={`https://wa.me/573113650567?text=Hola%2C%20me%20interesa%20el%20proyecto%20${encodeURIComponent(project.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-[#95C11F] text-[#1D1D1B] rounded-full font-semibold text-sm hover:bg-[#a6d42a] transition-all duration-200 hover:shadow-[0_0_24px_rgba(149,193,31,0.35)] mt-auto"
            >
              Consultar sobre este proyecto
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.12 1.532 5.847L.057 23.617l5.9-1.548A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.026-1.387l-.36-.215-3.494.917.93-3.4-.234-.375A9.818 9.818 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818 5.421 0 9.818 4.397 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ProjectCard({ project, index, onSelect }: { project: Project; index: number; onSelect: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const cfg = statusConfig[project.status]
  const [imgError, setImgError] = useState(false)

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 56 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      className="group relative flex flex-col border border-white/[0.07] rounded-2xl overflow-hidden bg-[#2C2C2A] hover:border-[#95C11F]/30 transition-all duration-500 hover:bg-[#333331] cursor-pointer"
    >
      {/* Visual */}
      <div className="relative h-44 overflow-hidden">
        {!imgError ? (
          <>
            <img
              src={project.coverImage}
              alt={project.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2A] via-[#2C2C2A]/10 to-transparent" />
          </>
        ) : (
          <TerrainSVG project={project} />
        )}

        {/* Status badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] tracking-wide font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
          {project.status}
        </div>

        {/* Photo count */}
        {project.images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/50 text-[10px] font-mono">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="2" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="5" cy="5" r="1.5" stroke="currentColor" strokeWidth="0.7" />
            </svg>
            {project.images.length}
          </div>
        )}

        {/* Hover hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="px-4 py-2 rounded-full bg-[#95C11F]/90 backdrop-blur-sm text-[#1D1D1B] text-xs font-semibold tracking-wide">
            Ver proyecto
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-white/20 tracking-widest">{project.id}</span>
          <span className="font-mono text-[10px] text-[#95C11F]/35 tracking-wide">{project.coords}</span>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold leading-snug mb-1">{project.name}</h3>
          <div className="flex items-center gap-1.5 text-[12px] text-white/35">
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <path d="M5 1C2.79 1 1 2.79 1 5c0 3 4 7 4 7s4-4 4-7c0-2.21-1.79-4-4-4z" stroke="#95C11F" strokeWidth="0.8" fill="none" opacity="0.6" />
            </svg>
            {project.location}, {project.dept}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/[0.05]">
          {[
            { label: 'Hectáreas', value: project.ha > 0 ? `${project.ha.toLocaleString('es-CO')} ha` : '—' },
            { label: 'Elevación', value: project.elv },
            { label: 'Año', value: String(project.year) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-mono text-[9px] text-white/20 tracking-widest uppercase mb-1">{label}</div>
              <div className="font-mono text-[13px] text-[#95C11F] font-medium">{value}</div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-[#95C11F]/50 tracking-wide uppercase font-medium">{project.type}</div>

        <p className="text-white/35 text-[13px] leading-relaxed line-clamp-2 group-hover:text-white/50 transition-colors duration-300">
          {project.description}
        </p>
      </div>
    </motion.article>
  )
}

export default function Proyectos() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [selected, setSelected] = useState<Project | null>(null)

  return (
    <section id="proyectos" className="py-32 lg:py-44 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(149,193,31,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div ref={ref} className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="w-7 h-px bg-[#95C11F]/60" />
            <span className="font-mono text-[#95C11F] text-[10px] tracking-[0.32em] uppercase">
              Proyectos en Campo
            </span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <motion.h2
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.8rem,6vw,4.8rem)] font-semibold leading-tight max-w-2xl"
            >
              Tierra transformada
              <br />
              en{' '}
              <em className="text-[#95C11F] not-italic">datos reales</em>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="flex items-center gap-6 shrink-0"
            >
              {Object.entries(statusConfig).map(([label, cfg]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className="text-white/35 text-xs">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} onSelect={() => setSelected(p)} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 text-center"
        >
          <a
            href="https://wa.me/573113650567?text=Hola%2C%20quisiera%20iniciar%20un%20proyecto%20Keyline%20en%20mi%20finca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-[#95C11F]/30 text-[#95C11F] rounded-full text-sm font-medium hover:bg-[#95C11F]/10 transition-all duration-200 hover:border-[#95C11F]/50 tracking-wide"
          >
            Iniciar un proyecto
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
