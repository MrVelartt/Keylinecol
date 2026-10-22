// ── Catálogo de herramientas del sitio ──
// Fuente única para el menú «Herramientas ▾» del Nav, el índice /herramientas
// y las rutas /herramientas/[slug]. Este archivo no importa componentes (lo
// usa el Nav en cada página); el mapa slug → componente vive en
// components/tools/registro.tsx.

export interface Tool {
  slug: string
  numero: string
  nombre: string
  descripcion: string
  href: string
  /** Descripción para buscadores (meta description). */
  seo: string
  /** Ancla de la antigua página única /herramientas (redirige a la ruta nueva). */
  anclaAntigua?: string
  /** true: la herramienta se muestra en /herramientas/[slug]. */
  enRutaDinamica: boolean
}

export const TOOLS: Tool[] = [
  {
    slug: 'demanda-hidrica-pecuaria',
    numero: '01',
    nombre: 'Demanda hídrica pecuaria',
    descripcion: 'Agua que necesita el hato y días de autonomía.',
    href: '/herramientas/demanda-hidrica-pecuaria',
    seo: 'Calcula el agua que consume tu hato por día con 17 categorías animales, factor de temperatura y pérdidas, y el volumen a almacenar según los días de autonomía.',
    anclaAntigua: 'herramientas',
    enRutaDinamica: true,
  },
  {
    slug: 'movimiento-de-tierra',
    numero: '02',
    nombre: 'Movimiento de tierra',
    descripcion: 'Volumen, horas-máquina y costo de un reservorio.',
    href: '/herramientas/movimiento-de-tierra',
    seo: 'Estima el corte, el terraplén, las horas de maquinaria y el costo por metro cúbico almacenado de un reservorio o jagüey, con tarifas editables.',
    enRutaDinamica: true,
  },
  {
    slug: 'analisis-de-suelo',
    numero: '03',
    nombre: 'Análisis de suelo',
    descripcion: 'Índice de fertilidad a partir del laboratorio.',
    href: '/herramientas/analisis-de-suelo',
    seo: 'Ingresa tu análisis de laboratorio y obtén el índice de fertilidad, el estado de cada parámetro frente a su rango adecuado y recomendaciones agronómicas.',
    anclaAntigua: 'calculadora-suelo',
    enRutaDinamica: true,
  },
  {
    slug: 'demanda-hidrica-agricola',
    numero: '04',
    nombre: 'Demanda hídrica agrícola',
    descripcion: 'Riego mes a mes frente a la lluvia que escurre.',
    href: '/herramientas/demanda-hidrica-agricola',
    seo: 'Balance de riego mensual en cualquier lugar: ETc = Kc × ETo, lluvia efectiva, eficiencia, oferta de escorrentía y almacenamiento, con rangos sugeridos.',
    anclaAntigua: 'demanda-agricola',
    enRutaDinamica: true,
  },
  {
    slug: 'diseno-keyline-predial',
    numero: '05',
    nombre: 'Diseño Keyline Predial',
    descripcion: 'La finca completa capa por capa, con cotización.',
    href: '/herramientas/diseno-keyline-predial',
    seo: 'Diseña la finca capa por capa con la escala de permanencia, con cotización y cronograma de inversión por semestres.',
    enRutaDinamica: false,
  },
  {
    slug: 'escala-de-permanencia',
    numero: '06',
    nombre: 'Escala de Permanencia',
    descripcion: 'Diagnóstico de la finca en 10 factores.',
    href: '/herramientas/escala-de-permanencia',
    seo: 'Diagnostica tu finca con la Escala de Permanencia de P.A. Yeomans y descubre qué factor resolver primero.',
    anclaAntigua: 'escala-permanencia',
    enRutaDinamica: true,
  },
  {
    slug: 'escorrentia',
    numero: '07',
    nombre: 'Escorrentía GUARDAR / EVACUAR',
    descripcion: 'Volumen anual para reservorios o caudal pico.',
    href: '/herramientas/escorrentia',
    seo: 'Calcula el volumen anual que escurre para dimensionar reservorios (GUARDAR) o el caudal pico de un aguacero para vertederos y canales (EVACUAR).',
    anclaAntigua: 'calculadora-escorrentia',
    enRutaDinamica: true,
  },
  {
    slug: 'analitica',
    numero: '08',
    nombre: 'Analítica climática',
    descripcion: 'Series históricas de la Finca Alma Luz.',
    href: '/analitica',
    seo: 'Series históricas de precipitación, evapotranspiración y escorrentía por finca.',
    enRutaDinamica: false,
  },
]

export const toolPorSlug = (slug: string) => TOOLS.find((t) => t.slug === slug)

/** Rutas que pertenecen a la sección Herramientas (para marcar el Nav activo). */
export const isToolsPath = (pathname: string) => pathname.startsWith('/herramientas') || pathname === '/analitica'
