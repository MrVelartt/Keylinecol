// ── Catálogo de herramientas del sitio ──
// Fuente única para el menú «Herramientas ▾» del Nav (y, más adelante, para
// el índice /herramientas y las rutas /herramientas/[slug]).
// Mientras las calculadoras viven como secciones de /herramientas, `href`
// apunta a su ancla; al migrar a rutas propias solo cambia `href`.

export interface Tool {
  slug: string
  numero: string
  nombre: string
  descripcion: string
  href: string
}

export const TOOLS: Tool[] = [
  {
    slug: 'demanda-hidrica',
    numero: '01',
    nombre: 'Demanda hídrica',
    descripcion: 'Agua que necesita el hato y días de autonomía.',
    href: '/herramientas#herramientas',
  },
  {
    slug: 'movimiento-de-tierra',
    numero: '02',
    nombre: 'Movimiento de tierra',
    descripcion: 'Volumen, horas-máquina y costo de un reservorio.',
    href: '/herramientas#herramientas',
  },
  {
    slug: 'analisis-de-suelo',
    numero: '03',
    nombre: 'Análisis de suelo',
    descripcion: 'Índice de fertilidad a partir del laboratorio.',
    href: '/herramientas#calculadora-suelo',
  },
  {
    slug: 'balance-hidrico',
    numero: '04',
    nombre: 'Balance hídrico',
    descripcion: 'Lluvia, ETo y déficit mes a mes.',
    href: '/herramientas#calculadora-clima',
  },
  {
    slug: 'diseno-keyline-predial',
    numero: '05',
    nombre: 'Diseño Keyline Predial',
    descripcion: 'La finca completa capa por capa, con cotización.',
    href: '/herramientas/diseno-keyline-predial',
  },
  {
    slug: 'escala-de-permanencia',
    numero: '06',
    nombre: 'Escala de Permanencia',
    descripcion: 'Diagnóstico de la finca en 8 capas.',
    href: '/herramientas#escala-permanencia',
  },
  {
    slug: 'escorrentia',
    numero: '07',
    nombre: 'Escorrentía GUARDAR / EVACUAR',
    descripcion: 'Volumen anual para reservorios o caudal pico.',
    href: '/herramientas#calculadora-escorrentia',
  },
  {
    slug: 'analitica',
    numero: '08',
    nombre: 'Analítica climática',
    descripcion: 'Series históricas de la finca de Baranoa.',
    href: '/analitica',
  },
]

/** Rutas que pertenecen a la sección Herramientas (para marcar el Nav activo). */
export const isToolsPath = (pathname: string) => pathname.startsWith('/herramientas') || pathname === '/analitica'
