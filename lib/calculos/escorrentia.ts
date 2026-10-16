// ── Fórmula unificada de escorrentía: GUARDAR / EVACUAR ──
// Dos preguntas del agua en la finca resueltas con una sola idea
// (lámina de lluvia × área × fracción que escurre), en dos modos:
//
//   GUARDAR  — volumen anual que escurre de una cuenca (Regrarians §2.19,
//              tablas 2.3 y 2.4). Sirve para dimensionar reservorios y
//              cosecha de agua de techos. No dice nada del caudal pico.
//
//   EVACUAR  — caudal pico de un aguacero de diseño (método racional).
//              Sirve para vertederos, canales, zanjas y alcantarillas.
//              No dice cuánta agua se puede guardar en el año.
//
// Fórmula común:
//   V = 10 · C · A · P            (volumen, m³;  A en ha, P en mm)
//   Q = V / (3600 · t)            (caudal medio en el periodo t, horas)
//
// En un aguacero P = i·t (i = intensidad mm/h), por lo que t se cancela y
// queda el método racional:
//   Q = C · A · i / 360           (m³/s, con A en ha, i en mm/h)
//
// Fuentes: Doherty & Jeeves (2015) "The Regrarians Handbook" cap. 2
// (secc. 2.19, tablas 2.3 y 2.4, según Nelson 1985 y Bourchier 1998);
// tabla racional U. de Los Andes (Ramírez 2003 / Chow et al. 1994);
// ASCE (1992); Manual de Drenaje INVÍAS (2009) — ecuación regional de
// Vargas y Díaz-Granados (1998).

export type Rango = readonly [number, number]

const mid = (r: Rango) => (r[0] + r[1]) / 2

// ────────────────────────────────────────────────────────────────────────
// Modo GUARDAR — coeficiente anual (tabla 2.3: cuenca rural por suelo)
// ────────────────────────────────────────────────────────────────────────

export type Confiabilidad = '8de10' | '9de10'
export type SueloTextura = 'arena_franco' | 'arcilla_arenosa' | 'arcilla_elastica' | 'arcilla_inelastica'
export type BandaLluviaEvap =
  | 'mas1100'
  | '900-1099'
  | '500-899-evapBaja'
  | '500-899-evapAlta'
  | '400-499'
  | '250-399-evapBaja'
  | '250-399-evapAlta'

export const CONFIABILIDAD_LABEL: Record<Confiabilidad, string> = {
  '8de10': '8 de 10 años',
  '9de10': '9 de 10 años',
}

export const SUELO_TEXTURA_LABEL: Record<SueloTextura, string> = {
  arena_franco: 'Arena superficial o franco',
  arcilla_arenosa: 'Arcilla arenosa',
  arcilla_elastica: 'Arcilla elástica',
  arcilla_inelastica: 'Arcilla inelástica, costras o pizarra',
}

export const BANDA_LLUVIA_EVAP_LABEL: Record<BandaLluviaEvap, string> = {
  mas1100: 'Lluvia > 1.100 mm/año (cualquier evaporación)',
  '900-1099': 'Lluvia 900–1.099 mm/año (cualquier evaporación)',
  '500-899-evapBaja': 'Lluvia 500–899 mm/año, evaporación < 1.300 mm',
  '500-899-evapAlta': 'Lluvia 500–899 mm/año, evaporación 1.300–1.800 mm',
  '400-499': 'Lluvia 400–499 mm/año, evaporación 1.300–1.800 mm',
  '250-399-evapBaja': 'Lluvia 250–399 mm/año, evaporación < 1.800 mm',
  '250-399-evapAlta': 'Lluvia 250–399 mm/año, evaporación > 1.800 mm',
}

// tabla 2.3 — % de la lluvia media anual que escurre, por textura de suelo
const TABLA_2_3: Record<BandaLluviaEvap, Record<Confiabilidad, Partial<Record<SueloTextura, Rango>>>> = {
  mas1100: {
    '8de10': { arena_franco: [10, 15], arcilla_arenosa: [10, 15], arcilla_elastica: [15, 20], arcilla_inelastica: [15, 25] },
    '9de10': { arena_franco: [6.5, 10], arcilla_arenosa: [6.5, 10], arcilla_elastica: [10, 13], arcilla_inelastica: [10, 16.5] },
  },
  '900-1099': {
    '8de10': { arena_franco: [10, 12.5], arcilla_arenosa: [10, 15], arcilla_elastica: [12.5, 20], arcilla_inelastica: [15, 20] },
    '9de10': { arena_franco: [6.5, 8], arcilla_arenosa: [6.5, 10], arcilla_elastica: [8, 13], arcilla_inelastica: [10, 13] },
  },
  '500-899-evapBaja': {
    '8de10': { arena_franco: [7.5, 10], arcilla_arenosa: [7.5, 15], arcilla_elastica: [7.5, 15], arcilla_inelastica: [10, 15] },
    '9de10': { arena_franco: [5, 6.5], arcilla_arenosa: [5, 10], arcilla_elastica: [5, 10], arcilla_inelastica: [6.5, 10] },
  },
  '500-899-evapAlta': {
    '8de10': { arena_franco: [5, 7.5], arcilla_arenosa: [5, 12.5], arcilla_elastica: [5, 10], arcilla_inelastica: [10, 15] },
    '9de10': { arena_franco: [3, 5], arcilla_arenosa: [3, 8], arcilla_elastica: [3, 6.5], arcilla_inelastica: [6.5, 10] },
  },
  '400-499': {
    '8de10': { arena_franco: [2.5, 5], arcilla_arenosa: [5, 10], arcilla_elastica: [2.5, 5], arcilla_inelastica: [7.5, 12.5] },
    '9de10': { arena_franco: [1.5, 3], arcilla_arenosa: [3, 6.5], arcilla_elastica: [1.5, 3], arcilla_inelastica: [5, 8] },
  },
  '250-399-evapBaja': {
    '8de10': { arena_franco: [0, 2.5], arcilla_arenosa: [0, 5], arcilla_elastica: [0, 2.5], arcilla_inelastica: [2.5, 7.5] },
    '9de10': { arena_franco: [0, 1.5], arcilla_arenosa: [0, 3], arcilla_elastica: [0, 1.5], arcilla_inelastica: [1.5, 5] },
  },
  '250-399-evapAlta': {
    '8de10': { arcilla_arenosa: [0, 2.5], arcilla_inelastica: [2.5, 5] },
    '9de10': { arcilla_arenosa: [0, 1.5], arcilla_inelastica: [1.5, 3] },
  },
}

/**
 * Banda de la tabla 2.3 a partir de la lluvia y la evaporación anuales (mm).
 * La tabla no tiene fila para lluvias de 500–899 mm con evaporación > 1.800 mm
 * ni para < 250 mm: se asigna la fila más cercana (evapAlta / 250-399).
 */
export function bandaFromClimate(precipMm: number, evapMm: number): BandaLluviaEvap {
  if (precipMm >= 1100) return 'mas1100'
  if (precipMm >= 900) return '900-1099'
  if (precipMm >= 500) return evapMm < 1300 ? '500-899-evapBaja' : '500-899-evapAlta'
  if (precipMm >= 400) return '400-499'
  return evapMm < 1800 ? '250-399-evapBaja' : '250-399-evapAlta'
}

/** Rango de C anual (fracción 0–1) según tabla 2.3; null si la combinación no aplica (celda "—"). */
export function annualCRange(banda: BandaLluviaEvap, confiabilidad: Confiabilidad, suelo: SueloTextura): Rango | null {
  const rangoPct = TABLA_2_3[banda]?.[confiabilidad]?.[suelo]
  if (!rangoPct) return null
  return [rangoPct[0] / 100, rangoPct[1] / 100]
}

// ────────────────────────────────────────────────────────────────────────
// Modo GUARDAR — coeficiente anual por tipo de superficie (tabla 2.4)
// ────────────────────────────────────────────────────────────────────────

export type SuperficieGuardar =
  | 'techo'
  | 'pavimento'
  | 'roca_aflorada'
  | 'via_sin_cobertura_mas300'
  | 'via_sin_cobertura_menos300'
  | 'tierra_cultivada'
  | 'potrero'
  | 'bosque'

export const SUPERFICIE_GUARDAR_LABEL: Record<SuperficieGuardar, string> = {
  techo: 'Techo',
  pavimento: 'Pavimento, asfalto o plástico',
  roca_aflorada: 'Roca aflorada',
  via_sin_cobertura_mas300: 'Vía o talud sin cobertura (lluvia > 300 mm)',
  via_sin_cobertura_menos300: 'Vía o talud sin cobertura (lluvia < 300 mm)',
  tierra_cultivada: 'Tierra cultivada',
  potrero: 'Potrero',
  bosque: 'Bosque',
}

export const SUPERFICIE_GUARDAR_RANGE: Record<SuperficieGuardar, Rango> = {
  techo: [0.9, 1.0],
  pavimento: [0.75, 0.9],
  roca_aflorada: [0.45, 0.5],
  via_sin_cobertura_mas300: [0.25, 0.4],
  via_sin_cobertura_menos300: [0.05, 0.2],
  tierra_cultivada: [0.02, 0.1],
  potrero: [0.0, 0.08],
  bosque: [0.0, 0.01],
}

// ────────────────────────────────────────────────────────────────────────
// Modo EVACUAR — coeficiente de aguacero (método racional)
// ────────────────────────────────────────────────────────────────────────

export type Cobertura = 'sin_vegetacion' | 'cultivos' | 'pastos_ligera' | 'hierba_grama' | 'bosque_denso'
export type SueloPermeabilidad = 'impermeable' | 'semipermeable' | 'permeable'
export type PendienteBanda = 'mas50' | '20-50' | '8-20' | '1-8' | 'menos1'

export const COBERTURA_LABEL: Record<Cobertura, string> = {
  sin_vegetacion: 'Sin vegetación',
  cultivos: 'Cultivos',
  pastos_ligera: 'Pastos y vegetación ligera',
  hierba_grama: 'Hierba y grama',
  bosque_denso: 'Bosques y vegetación densa',
}

export const SUELO_PERMEABILIDAD_LABEL: Record<SueloPermeabilidad, string> = {
  impermeable: 'Impermeable',
  semipermeable: 'Semipermeable',
  permeable: 'Permeable',
}

export const PENDIENTE_BANDA_LABEL: Record<PendienteBanda, string> = {
  mas50: '> 50 %',
  '20-50': '20–50 %',
  '8-20': '8–20 %',
  '1-8': '1–8 %',
  menos1: '< 1 %',
}

const PENDIENTE_ORDER: PendienteBanda[] = ['mas50', '20-50', '8-20', '1-8', 'menos1']

// tabla racional — C de aguacero por cobertura × suelo × pendiente
const TABLA_RACIONAL: Record<Cobertura, Record<SueloPermeabilidad, number[]>> = {
  sin_vegetacion: { impermeable: [0.8, 0.75, 0.7, 0.65, 0.6], semipermeable: [0.7, 0.65, 0.6, 0.55, 0.5], permeable: [0.5, 0.45, 0.4, 0.35, 0.3] },
  cultivos: { impermeable: [0.7, 0.65, 0.6, 0.55, 0.5], semipermeable: [0.6, 0.55, 0.5, 0.45, 0.4], permeable: [0.4, 0.35, 0.3, 0.25, 0.2] },
  pastos_ligera: { impermeable: [0.65, 0.6, 0.55, 0.5, 0.45], semipermeable: [0.55, 0.5, 0.45, 0.4, 0.35], permeable: [0.35, 0.3, 0.25, 0.2, 0.15] },
  hierba_grama: { impermeable: [0.6, 0.55, 0.5, 0.45, 0.4], semipermeable: [0.5, 0.45, 0.4, 0.35, 0.3], permeable: [0.3, 0.25, 0.2, 0.15, 0.1] },
  bosque_denso: { impermeable: [0.55, 0.5, 0.45, 0.4, 0.35], semipermeable: [0.45, 0.4, 0.35, 0.3, 0.25], permeable: [0.25, 0.2, 0.15, 0.1, 0.05] },
}

/** C base de aguacero (método racional), antes del factor de frecuencia Cf. */
export function rationalCBase(cobertura: Cobertura, suelo: SueloPermeabilidad, pendiente: PendienteBanda): number {
  const idx = PENDIENTE_ORDER.indexOf(pendiente)
  return TABLA_RACIONAL[cobertura][suelo][idx]
}

export type SuperficieDuraEvacuar = 'techo' | 'asfalto_concreto' | 'adoquin_ladrillo'

export const SUPERFICIE_DURA_EVACUAR_LABEL: Record<SuperficieDuraEvacuar, string> = {
  techo: 'Techo',
  asfalto_concreto: 'Asfalto o concreto',
  adoquin_ladrillo: 'Adoquín o ladrillo',
}

export const SUPERFICIE_DURA_EVACUAR_RANGE: Record<SuperficieDuraEvacuar, Rango> = {
  techo: [0.75, 0.95],
  asfalto_concreto: [0.7, 0.95],
  adoquin_ladrillo: [0.7, 0.85],
}

// Factor de frecuencia Cf — ajusta C de aguacero por periodo de retorno T
export type RetornoT = 10 | 25 | 50 | 100

export const RETORNO_T_LABEL: Record<RetornoT, string> = {
  10: 'hasta 10 años',
  25: '25 años',
  50: '50 años',
  100: '100 años',
}

export const FRECUENCIA_CF: Record<RetornoT, number> = { 10: 1.0, 25: 1.1, 50: 1.2, 100: 1.25 }

/** C de aguacero ajustado por frecuencia, sin pasar de 1.0. */
export function adjustedStormC(cBase: number, retorno: RetornoT): number {
  return Math.min(cBase * FRECUENCIA_CF[retorno], 1.0)
}

// ────────────────────────────────────────────────────────────────────────
// Tiempo de concentración (Kirpich) e intensidad (Vargas y Díaz-Granados)
// ────────────────────────────────────────────────────────────────────────

/** Tiempo de concentración por Kirpich (min). L: longitud del cauce (m), H: desnivel (m). Piso de 10 min. */
export function kirpichTcMin(lengthM: number, dropM: number): number {
  if (lengthM <= 0) return 10
  const slope = Math.max(dropM, 0.0001) / lengthM
  const tc = 0.0195 * Math.pow(lengthM, 0.77) * Math.pow(slope, -0.385)
  return Math.max(tc, 10)
}

export type RegionIdf = 'andina' | 'caribe' | 'pacifico' | 'orinoquia'

export const REGION_IDF_LABEL: Record<RegionIdf, string> = {
  andina: 'Andina',
  caribe: 'Caribe',
  pacifico: 'Pacífico',
  orinoquia: 'Orinoquía',
}

const IDF_COEFS: Record<RegionIdf, { a: number; b: number; c: number; d: number }> = {
  andina: { a: 0.94, b: 0.18, c: 0.66, d: 0.83 },
  caribe: { a: 24.85, b: 0.22, c: 0.5, d: 0.1 },
  pacifico: { a: 13.92, b: 0.19, c: 0.58, d: 0.2 },
  orinoquia: { a: 5.53, b: 0.17, c: 0.63, d: 0.42 },
}

/**
 * Intensidad de diseño (mm/h) por la ecuación regional de Vargas y
 * Díaz-Granados (1998), Manual de Drenaje INVÍAS (2009).
 * T: periodo de retorno (años). tMin: duración = tiempo de concentración (min).
 * M: promedio de las lluvias máximas anuales en 24h de la estación (mm).
 */
export function idfIntensityMmH(region: RegionIdf, retorno: RetornoT, mMax24h: number, tMin: number): number {
  const { a, b, c, d } = IDF_COEFS[region]
  return (a * Math.pow(retorno, b) * Math.pow(mMax24h, d)) / Math.pow(tMin / 60, c)
}

// ────────────────────────────────────────────────────────────────────────
// Fórmula unificada
// ────────────────────────────────────────────────────────────────────────

/** Volumen que escurre en el periodo (m³). A en ha, P en mm. */
export function runoffVolumeM3(c: number, areaHa: number, precipMm: number): number {
  return 10 * c * areaHa * precipMm
}

/** Caudal medio del periodo (m³/s). V en m³, t en horas. */
export function flowFromVolume(volumeM3: number, hours: number): number {
  return hours > 0 ? volumeM3 / (3600 * hours) : 0
}

/** Caudal pico por el método racional (m³/s). A en ha, i en mm/h. */
export function rationalPeakFlowM3s(c: number, areaHa: number, intensityMmH: number): number {
  return (c * areaHa * intensityMmH) / 360
}

export const m3sToLs = (q: number) => q * 1000

export { mid as midOfRange }
