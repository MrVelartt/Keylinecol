// ── Catálogos de obra: almacenamiento y movimiento de tierras ──
// Fuentes: USDA-NRCS CPS 378 Pond (2022); FAO I&D Paper 64 (small earth
// dams); SpikeVM (esponjamiento/contracción); Licon Ingeniería (rendimientos);
// TuMaquinaYa (tarifas de alquiler en Colombia).

/** Fondos del vaso — infiltración (mm/día). */
export interface FondoVaso {
  nombre: string
  infiltracion: number
}

export const FONDOS: FondoVaso[] = [
  { nombre: 'Geomembrana HDPE bien instalada', infiltracion: 0.05 },
  { nombre: 'Arcilla compactada (liner 20-30 cm)', infiltracion: 1.5 },
  { nombre: 'Suelo-cemento o bentonita', infiltracion: 1.0 },
  { nombre: 'Suelo arcilloso natural', infiltracion: 3.0 },
  { nombre: 'Suelo franco', infiltracion: 9.0 },
  { nombre: 'Suelo franco-arenoso', infiltracion: 25.0 },
  { nombre: 'Suelo arenoso (no apto)', infiltracion: 60.0 },
]

/** Índice del fondo que representa la geomembrana (impermeabilización). */
export const FONDO_GEOMEMBRANA = 0

/** Tipologías de almacenamiento — m³ de tierra movida por m³ almacenado. */
export interface Tipologia {
  id: string
  nombre: string
  ratio: number
  ratioMin: number
  ratioMax: number
}

export const TIPOLOGIAS: Tipologia[] = [
  { id: 'vaguada', nombre: 'Presa de tierra en vaguada estrecha', ratio: 0.26, ratioMin: 0.12, ratioMax: 0.4 },
  { id: 'valle', nombre: 'Presa en valle amplio y poco profundo', ratio: 0.55, ratioMin: 0.4, ratioMax: 0.7 },
  { id: 'ladera', nombre: 'Reservorio mixto en media ladera', ratio: 0.7, ratioMin: 0.5, ratioMax: 0.9 },
  { id: 'jaguey', nombre: 'Reservorio excavado en terreno plano (jagüey)', ratio: 1.15, ratioMin: 1.0, ratioMax: 1.3 },
]

/** Esponjamiento (swell) y contracción (shrink) por material, fracción 0–1. */
export interface Material {
  id: string
  nombre: string
  esponjamiento: number
  contraccion: number
}

export const MATERIALES: Material[] = [
  { id: 'arcilla-densa', nombre: 'Arcilla densa', esponjamiento: 0.36, contraccion: 0.25 },
  { id: 'arcilla-humeda', nombre: 'Arcilla húmeda', esponjamiento: 0.5, contraccion: 0.1 },
  { id: 'arcilla-seca', nombre: 'Arcilla seca', esponjamiento: 0.42, contraccion: 0.1 },
  { id: 'limo', nombre: 'Limo', esponjamiento: 0.35, contraccion: 0.18 },
  { id: 'arena-humeda', nombre: 'Arena húmeda', esponjamiento: 0.05, contraccion: 0.1 },
  { id: 'arena-seca', nombre: 'Arena seca', esponjamiento: 0.11, contraccion: 0.1 },
  { id: 'grava', nombre: 'Grava', esponjamiento: 0.17, contraccion: 0.07 },
  { id: 'tierra-vegetal', nombre: 'Tierra vegetal', esponjamiento: 0.55, contraccion: 0.25 },
]

export type FrenteId = 'descapote' | 'corte' | 'terraplen' | 'acarreo'

/** Maquinaria — tarifa COP/hora con operador y combustible, y rendimiento. */
export interface FrenteMaquinaria {
  id: FrenteId
  rol: string
  equipo: string
  /** COP por hora. */
  tarifa: number
  rendimiento: number
  unidad: 'm²/h' | 'm³/h'
}

export const MAQUINARIA: FrenteMaquinaria[] = [
  { id: 'descapote', rol: 'Descapote', equipo: 'Bulldozer D6 / minicargador', tarifa: 200000, rendimiento: 500, unidad: 'm²/h' },
  { id: 'corte', rol: 'Excavación y corte', equipo: 'Excavadora 20-22 t (CAT 320)', tarifa: 250000, rendimiento: 75, unidad: 'm³/h' },
  {
    id: 'terraplen',
    rol: 'Conformación y compactación',
    equipo: 'Vibrocompactador + motoniveladora',
    tarifa: 320000,
    rendimiento: 220,
    unidad: 'm³/h',
  },
  { id: 'acarreo', rol: 'Acarreo interno', equipo: 'Volqueta doble troque 12-14 m³', tarifa: 150000, rendimiento: 35, unidad: 'm³/h' },
]

/** Rango colombiano de referencia para obra agrícola (COP por m³ almacenado). */
export const RANGO_COP_M3_ALMACENADO = [1200, 30000] as const
