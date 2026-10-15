// ── Escala de Permanencia (P.A. Yeomans) ──
// Los factores de diseño de una finca ordenados de mayor a menor permanencia:
// los primeros son los más fijos / costosos de cambiar (clima, geografía) y
// condicionan todas las decisiones posteriores; los últimos son los más
// flexibles y se ajustan de forma continua (economía, estética). El método
// Keyline exige leer y decidir en este orden — no al revés — para no fijar
// una decisión barata (ej. una cerca) sobre una decisión cara que todavía
// no está resuelta (ej. el agua).
//
// Fuente: Yeomans, P.A. — "The Keyline Plan" / "Water for Every Farm".

export type PermanenceStatus = 'resuelto' | 'parcial' | 'pendiente'

export interface PermanenceFactor {
  id: string
  order: number
  title: string
  shortLabel: string
  question: string
  why: string
  examples: string[]
}

export const PERMANENCE_FACTORS: PermanenceFactor[] = [
  {
    id: 'clima',
    order: 1,
    title: 'Clima',
    shortLabel: 'Clima',
    question: '¿Conoces el régimen de lluvias, temperaturas y vientos dominantes de la finca?',
    why: 'Es el factor más permanente de todos — no se diseña contra el clima, se diseña con él. Toda decisión posterior depende de entenderlo primero.',
    examples: ['Lluvia y evapotranspiración mensual (IDEAM)', 'Temporada seca / temporada de lluvias', 'Vientos dominantes y heladas o veranillos'],
  },
  {
    id: 'geografia',
    order: 2,
    title: 'Geografía / Topografía',
    shortLabel: 'Topografía',
    question: '¿Tienes identificadas las líneas clave (keylines), pendientes, valles y crestas del predio?',
    why: 'La forma del terreno es casi tan fija como el clima. Las líneas clave determinan por dónde se mueve el agua y organizan todo el resto del diseño.',
    examples: ['Curvas de nivel y pendiente dominante', 'Puntos clave (keypoints) y líneas clave', 'Cuencas y microcuencas internas'],
  },
  {
    id: 'agua',
    order: 3,
    title: 'Agua',
    shortLabel: 'Agua',
    question: '¿Está definido cómo se capta, almacena y distribuye el agua en toda la finca?',
    why: 'Depende directamente del clima y la topografía. Resolverlo primero evita construir vías, cercas o edificaciones que luego bloqueen el diseño hídrico correcto.',
    examples: ['Reservorios y su ubicación en líneas clave', 'Canales de desvío y zanjas de infiltración', 'Nacimientos, aljibes o pozos'],
  },
  {
    id: 'accesos',
    order: 4,
    title: 'Vías de acceso',
    shortLabel: 'Accesos',
    question: '¿Las vías y caminos internos siguen la lógica del agua y la topografía, no límites arbitrarios?',
    why: 'Una vía mal trazada antes de resolver el agua se convierte en un canal de erosión. Se diseña después del agua y antes de fijar cercas o edificaciones.',
    examples: ['Vías principales en crestas o líneas clave', 'Accesos a reservorios y lotes', 'Puntos de cruce de quebradas'],
  },
  {
    id: 'vegetacion',
    order: 5,
    title: 'Vegetación / Bosques',
    shortLabel: 'Vegetación',
    question: '¿Están definidas las cortinas rompevientos, bosques de protección y corredores?',
    why: 'La vegetación estructural protege el suelo y el agua ya planificados, y debe ubicarse antes de fijar edificaciones o la subdivisión final de potreros.',
    examples: ['Cortinas rompevientos en crestas', 'Bosques de ribera y protección de nacimientos', 'Corredores de conectividad biológica'],
  },
  {
    id: 'edificaciones',
    order: 6,
    title: 'Edificaciones',
    shortLabel: 'Edificaciones',
    question: '¿La ubicación de vivienda, galpones o establos ya considera agua, accesos y vegetación de protección?',
    why: 'Construir antes de resolver los factores anteriores suele dejar la infraestructura mal ubicada frente al agua, el acceso o el viento — un error costoso de revertir.',
    examples: ['Vivienda principal y su orientación', 'Galpones, establos, centros de acopio', 'Cercanía a vías y a la fuente de agua'],
  },
  {
    id: 'subdivision',
    order: 7,
    title: 'Subdivisión (cercas)',
    shortLabel: 'Cercas',
    question: '¿Los potreros y lotes están subdivididos según el manejo del agua y el pastoreo, no según límites históricos?',
    why: 'Las cercas son baratas de mover comparadas con el agua o las vías — por eso se fijan después, siguiendo lo que ya se decidió arriba en la escala.',
    examples: ['Potreros alineados a las líneas clave', 'Carriles de acceso del ganado a los reservorios', 'Subdivisión para pastoreo racional'],
  },
  {
    id: 'suelo',
    order: 8,
    title: 'Suelo',
    shortLabel: 'Suelo',
    question: '¿Hay un plan de manejo de fertilidad y materia orgánica en marcha, no solo un análisis puntual?',
    why: 'El suelo se mejora de forma continua a lo largo de los años — no es una decisión que se "fija" una vez, sino un proceso que depende del diseño hídrico ya resuelto.',
    examples: ['Análisis de suelo y plan de enmiendas', 'Pastoreo racional y rotación', 'Materia orgánica y actividad biológica'],
  },
  {
    id: 'economia',
    order: 9,
    title: 'Economía / infraestructura menor',
    shortLabel: 'Economía',
    question: '¿Las inversiones productivas (cultivos, equipos, infraestructura menor) se ajustan a lo ya construido arriba?',
    why: 'Es el nivel donde el mercado y la escala productiva cambian más rápido — por eso se decide al final, sobre una base física ya resuelta.',
    examples: ['Selección de cultivos o líneas productivas', 'Maquinaria e infraestructura de bajo costo', 'Mercados y canales de comercialización'],
  },
  {
    id: 'estetica',
    order: 10,
    title: 'Estética',
    shortLabel: 'Estética',
    question: '¿El acabado paisajístico y los detalles finales están pendientes de ajuste continuo?',
    why: 'Es el factor más flexible de todos: se afina permanentemente y nunca debería condicionar ninguna decisión de los nueve factores anteriores.',
    examples: ['Jardines y paisajismo cercano a la vivienda', 'Senderos peatonales y miradores', 'Detalles ornamentales y acabados'],
  },
]

export const STATUS_LABEL: Record<PermanenceStatus, string> = {
  resuelto: 'Resuelto',
  parcial: 'Parcial',
  pendiente: 'Pendiente',
}

export const STATUS_WEIGHT: Record<PermanenceStatus, number> = {
  resuelto: 1,
  parcial: 0.5,
  pendiente: 0,
}

export interface PermanenceAssessment {
  readinessPct: number
  bottleneck: PermanenceFactor | null
  atRiskFactors: PermanenceFactor[]
}

/**
 * Evalúa el estado de la finca frente a la Escala de Permanencia.
 * El "cuello de botella" es el primer factor (menor orden) que no está
 * resuelto — según el método, ningún factor posterior debería fijarse en
 * firme hasta resolver ese. Los factores posteriores al cuello de botella
 * que SÍ se marcaron como resueltos quedan señalados como "en riesgo" de
 * haberse decidido antes de tiempo.
 */
export function assessPermanence(
  statuses: Record<string, PermanenceStatus>
): PermanenceAssessment {
  const sorted = [...PERMANENCE_FACTORS].sort((a, b) => a.order - b.order)

  const totalWeight = sorted.reduce((sum, f) => sum + STATUS_WEIGHT[statuses[f.id] ?? 'pendiente'], 0)
  const readinessPct = Math.round((totalWeight / sorted.length) * 100)

  const bottleneck = sorted.find((f) => (statuses[f.id] ?? 'pendiente') !== 'resuelto') ?? null

  const atRiskFactors = bottleneck
    ? sorted.filter((f) => f.order > bottleneck.order && (statuses[f.id] ?? 'pendiente') === 'resuelto')
    : []

  return { readinessPct, bottleneck, atRiskFactors }
}
