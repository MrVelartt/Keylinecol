'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface Project {
  id: string
  name: string
  location: string
  dept: string
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
    name: 'Hacienda La Ceiba',
    location: 'Villavicencio',
    dept: 'Meta',
    ha: 385,
    elv: '467m',
    type: 'Diseño Keyline completo + implementación',
    year: 2024,
    status: 'Completado',
    coords: '04°04′N · 73°42′O',
    terrain: 'M0,130 C40,110 80,80 130,55 C175,32 210,50 250,65 C275,75 290,100 310,115 L310,165 L0,165Z',
    keypointX: 130,
    keypointY: 55,
    contours: [
      'M10,105 C50,80 90,60 130,62 C170,64 210,75 270,95',
      'M0,120 C40,98 80,78 130,78 C175,78 215,92 275,110',
      'M0,137 C40,118 85,100 135,100 C180,100 220,112 275,128',
    ],
    description: 'Sistema de captación y distribución hídrica en piedemonte llanero. Aumento del 340% en retención de agua en suelo al año de implementación.',
  },
  {
    id: 'P-002',
    name: 'Finca El Viento Verde',
    location: 'San Martín',
    dept: 'Meta',
    ha: 142,
    elv: '382m',
    type: 'Sistema hídrico Keyline',
    year: 2025,
    status: 'En progreso',
    coords: '03°42′N · 73°41′O',
    terrain: 'M0,145 C30,130 65,95 110,60 C155,25 185,45 220,70 C250,90 275,120 310,138 L310,165 L0,165Z',
    keypointX: 110,
    keypointY: 60,
    contours: [
      'M15,118 C50,90 85,65 115,68 C150,71 185,85 250,108',
      'M0,132 C40,108 75,85 115,85 C152,85 188,100 255,122',
      'M0,148 C40,128 78,108 118,108 C155,108 190,122 258,140',
    ],
    description: 'Rehabilitación de pasturas degradadas con enfoque en regeneración del ciclo hídrico y recuperación de materia orgánica del suelo.',
  },
  {
    id: 'P-003',
    name: 'Reserva Agua Viva',
    location: 'Yopal',
    dept: 'Casanare',
    ha: 560,
    elv: '320m',
    type: 'Regeneración de suelos + pasturas',
    year: 2023,
    status: 'Completado',
    coords: '05°21′N · 72°24′O',
    terrain: 'M0,120 C55,85 110,55 160,70 C210,85 250,80 290,105 L310,120 L310,165 L0,165Z',
    keypointX: 160,
    keypointY: 70,
    contours: [
      'M20,100 C65,70 110,58 162,72 C214,86 252,82 295,100',
      'M0,112 C55,82 110,68 162,82 C214,96 255,92 295,112',
      'M0,130 C55,102 112,88 164,98 C216,108 258,106 300,126',
    ],
    description: 'El proyecto más extenso de la firma. Incluye diseño de curvas clave, swales y sistema de siembra de agua para 560 hectáreas de sabana casanareña.',
  },
  {
    id: 'P-004',
    name: 'Predio Los Cedros',
    location: 'Granada',
    dept: 'Meta',
    ha: 98,
    elv: '534m',
    type: 'Agroforestería Keyline',
    year: 2025,
    status: 'En progreso',
    coords: '03°32′N · 73°43′O',
    terrain: 'M0,150 C25,138 55,105 95,68 C128,38 155,52 188,80 C218,102 255,130 310,148 L310,165 L0,165Z',
    keypointX: 95,
    keypointY: 68,
    contours: [
      'M12,125 C40,100 68,75 98,75 C130,75 158,88 215,112',
      'M0,138 C38,115 66,92 100,90 C132,88 162,102 220,126',
      'M0,152 C38,132 68,112 102,108 C135,104 165,118 225,140',
    ],
    description: 'Integración de sistemas silvopastoriles con diseño Keyline. Incorporación de especies nativas del piedemonte en función del agua.',
  },
  {
    id: 'P-005',
    name: 'Hacienda Tres Palmas',
    location: 'Acacías',
    dept: 'Meta',
    ha: 220,
    elv: '445m',
    type: 'Diseño maestro + Levantamiento',
    year: 2026,
    status: 'Planificación',
    coords: '03°59′N · 73°45′O',
    terrain: 'M0,128 C45,105 90,72 135,60 C158,54 175,54 210,62 C248,70 278,100 310,122 L310,165 L0,165Z',
    keypointX: 135,
    keypointY: 60,
    contours: [
      'M15,108 C55,82 92,65 138,66 C178,67 215,80 278,102',
      'M0,118 C50,94 90,78 140,78 C180,78 217,92 280,114',
      'M0,135 C50,112 92,96 142,96 C182,96 220,110 282,130',
    ],
    description: 'Proyecto en diseño. Plan maestro completo con análisis topográfico LiDAR, modelado hídrico y plan de implementación por fases.',
  },
]

const statusConfig = {
  'Completado':  { color: 'text-[#8DB76A]', bg: 'bg-[#8DB76A]/10', border: 'border-[#8DB76A]/25', dot: 'bg-[#8DB76A]' },
  'En progreso': { color: 'text-sky-400',   bg: 'bg-sky-400/10',    border: 'border-sky-400/25',   dot: 'bg-sky-400 animate-pulse' },
  'Planificación':{ color: 'text-amber-400', bg: 'bg-amber-400/10',  border: 'border-amber-400/25', dot: 'bg-amber-400' },
}

function TerrainSVG({ project }: { project: Project }) {
  return (
    <svg viewBox="0 0 310 165" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="310" height="165" fill="#080e08" />
      {/* Grid */}
      <pattern id={`g-${project.id}`} width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(141,183,106,0.04)" strokeWidth="0.5" />
      </pattern>
      <rect width="310" height="165" fill={`url(#g-${project.id})`} />

      {/* Terrain fill */}
      <path d={project.terrain} fill="#0e1e0e" />

      {/* Contour lines */}
      {project.contours.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#8DB76A"
          strokeWidth="0.6"
          strokeDasharray="3 7"
          opacity={0.35 - i * 0.08}
        />
      ))}

      {/* Keyline horizontal */}
      <line
        x1="0"
        y1={project.keypointY + 8}
        x2="310"
        y2={project.keypointY + 8}
        stroke="#8DB76A"
        strokeWidth="0.4"
        opacity="0.2"
        strokeDasharray="1 4"
      />

      {/* Keypoint */}
      <circle cx={project.keypointX} cy={project.keypointY} r="10" fill="rgba(141,183,106,0.08)" />
      <circle cx={project.keypointX} cy={project.keypointY} r="3.5" fill="#8DB76A" opacity="0.9" />
      <circle cx={project.keypointX} cy={project.keypointY} r="1.5" fill="#0a120a" />
      <circle cx={project.keypointX} cy={project.keypointY} r="0.7" fill="#8DB76A" />

      {/* Bottom fade */}
      <defs>
        <linearGradient id={`fade-${project.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="60%" stopColor="#080e08" stopOpacity="0" />
          <stop offset="100%" stopColor="#080e08" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="310" height="165" fill={`url(#fade-${project.id})`} />

      {/* Data overlays */}
      <text x="8" y="14" fill="rgba(141,183,106,0.45)" fontSize="7.5" fontFamily="monospace" letterSpacing="0.08em">
        {project.elv}
      </text>
      <text x="8" y="24" fill="rgba(141,183,106,0.25)" fontSize="6.5" fontFamily="monospace" letterSpacing="0.06em">
        {project.id}
      </text>
    </svg>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const cfg = statusConfig[project.status]

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 56 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col border border-white/[0.06] rounded-2xl overflow-hidden bg-[#0b160b]/60 hover:border-[#8DB76A]/20 transition-all duration-500 hover:bg-[#0d1c0d]/80"
    >
      {/* Terrain visual */}
      <div className="relative h-44 overflow-hidden">
        <TerrainSVG project={project} />
        {/* Status badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] tracking-wide font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
          {project.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* ID + coords */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-white/20 tracking-widest">{project.id}</span>
          <span className="font-mono text-[10px] text-[#8DB76A]/35 tracking-wide">{project.coords}</span>
        </div>

        {/* Name + location */}
        <div>
          <h3 className="font-display text-xl font-semibold leading-snug mb-1">{project.name}</h3>
          <div className="flex items-center gap-1.5 text-[12px] text-white/35">
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <path d="M5 1C2.79 1 1 2.79 1 5c0 3 4 7 4 7s4-4 4-7c0-2.21-1.79-4-4-4z" stroke="#8DB76A" strokeWidth="0.8" fill="none" opacity="0.6"/>
            </svg>
            {project.location}, {project.dept}
          </div>
        </div>

        {/* Data grid */}
        <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/[0.05]">
          {[
            { label: 'Hectáreas', value: `${project.ha} ha` },
            { label: 'Elevación', value: project.elv },
            { label: 'Año', value: String(project.year) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-mono text-[9px] text-white/20 tracking-widest uppercase mb-1">{label}</div>
              <div className="font-mono text-[13px] text-[#8DB76A] font-medium">{value}</div>
            </div>
          ))}
        </div>

        {/* Type */}
        <div className="text-[11px] text-[#8DB76A]/50 tracking-wide uppercase font-medium">{project.type}</div>

        {/* Description — revealed on hover */}
        <p className="text-white/35 text-[13px] leading-relaxed line-clamp-3 group-hover:text-white/50 transition-colors duration-300">
          {project.description}
        </p>
      </div>
    </motion.article>
  )
}

export default function Proyectos() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="proyectos" className="py-32 lg:py-44 px-6 relative">
      {/* Subtle dot grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(141,183,106,0.04) 1px, transparent 1px)',
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
            <div className="w-7 h-px bg-[#8DB76A]/60" />
            <span className="font-mono text-[#8DB76A] text-[10px] tracking-[0.32em] uppercase">
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
              <em className="text-[#8DB76A] not-italic">datos reales</em>
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

        {/* Projects grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.slice(0, 3).map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-5 mt-5">
          {projects.slice(3).map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i + 3} />
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
            href="https://wa.me/573001234567?text=Hola%2C%20quisiera%20iniciar%20un%20proyecto%20Keyline%20en%20mi%20finca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-[#8DB76A]/30 text-[#8DB76A] rounded-full text-sm font-medium hover:bg-[#8DB76A]/10 transition-all duration-200 hover:border-[#8DB76A]/50 tracking-wide"
          >
            Iniciar un proyecto
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
