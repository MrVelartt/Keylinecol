// ── Demanda hídrica: pecuaria, agrícola, doméstica y de reforestación ──
// Implementación única del sitio. La calculadora "Demanda hídrica" usa la
// pecuaria; Diseño Keyline Predial usa las cuatro.

// ── Pecuaria ──
export interface GrupoAnimal {
  cantidad: number
  /** Consumo por cabeza (L/día) a 15–25 °C. */
  litrosDia: number
}

export interface OpcionesPecuaria {
  /** Factor por temperatura media (0,8 / 1,0 / 1,3 / 1,6). */
  factorTemperatura?: number
  /** Pérdidas en abrevaderos y conducción (%). */
  perdidasPct?: number
}

/** Litros por día de un grupo, con factor de temperatura y pérdidas. */
export function litrosDiaGrupo(g: GrupoAnimal, { factorTemperatura = 1, perdidasPct = 0 }: OpcionesPecuaria = {}): number {
  return g.cantidad * g.litrosDia * factorTemperatura * (1 + perdidasPct / 100)
}

/** Demanda pecuaria diaria (m³/día). */
export function demandaPecuariaDiaM3(grupos: GrupoAnimal[], opciones: OpcionesPecuaria = {}): number {
  return grupos.reduce((s, g) => s + litrosDiaGrupo(g, opciones), 0) / 1000
}

/** Volumen para cubrir N días de autonomía (m³). */
export const volumenAutonomiaM3 = (demandaDiaM3: number, dias: number) => demandaDiaM3 * Math.max(dias, 0)

// ── Agrícola (ETc = Kc × ETo) ──
export interface CultivoInput {
  ha: number
  kc: number
  /** Eficiencia del sistema de riego (0–1); 0 = secano, no se riega. */
  eficiencia: number
}

export interface ContextoAgricola {
  etoDia: number // mm/día
  diasSecos: number
  /** Lluvia efectiva durante la época seca con diseño (mm). */
  pEfectivaSecaMm: number
  precipAnualMm: number
  coefPeDiseno: number
}

export interface CultivoResultado {
  etcDia: number // mm/día
  etcAnual: number // mm/año
  deficitSecaMm: number
  brutoSecaM3: number
  brutoAnualM3: number
}

/**
 * Sólo se contabiliza el déficit: lo que la lluvia efectiva no cubre durante
 * los meses secos, dividido por la eficiencia del riego.
 */
export function demandaCultivo(c: CultivoInput, ctx: ContextoAgricola): CultivoResultado {
  const etcDia = c.kc * ctx.etoDia
  const etcAnual = etcDia * 365
  const deficitSecaMm = Math.max(0, etcDia * ctx.diasSecos - ctx.pEfectivaSecaMm)
  if (c.eficiencia <= 0) return { etcDia, etcAnual, deficitSecaMm, brutoSecaM3: 0, brutoAnualM3: 0 }
  const brutoSecaM3 = (deficitSecaMm / c.eficiencia) * 10 * c.ha
  const deficitAnualMm = Math.max(0, etcAnual - ctx.precipAnualMm * ctx.coefPeDiseno)
  const brutoAnualM3 = Math.max((deficitAnualMm / c.eficiencia) * 10 * c.ha, brutoSecaM3)
  return { etcDia, etcAnual, deficitSecaMm, brutoSecaM3, brutoAnualM3 }
}

// ── Doméstica y de proceso ──
export interface DomesticaInput {
  personas: number
  /** Dotación neta (L/hab·día). */
  dotacionNeta: number
  /** Pérdidas técnicas (%): dotación bruta = neta / (1 − pérdidas). */
  perdidasPct: number
  /** Usos de proceso: ordeño, beneficio, huerta (L/día). */
  procesoLDia: number
}

export function demandaDomesticaDiaM3(d: DomesticaInput): number {
  const bruta = d.perdidasPct < 100 ? d.dotacionNeta / (1 - d.perdidasPct / 100) : 0
  return (d.personas * bruta + d.procesoLDia) / 1000
}

// ── Riego de soporte a reforestación ──
export interface ReforestacionInput {
  ha: number
  densidad: number // árboles/ha
  litrosPorRiego: number
  riegos: number
  mortalidadPct: number
}

export const arbolesReforestacion = (r: ReforestacionInput) => r.ha * r.densidad

export function demandaReforestacionM3(r: ReforestacionInput): number {
  return (arbolesReforestacion(r) * r.litrosPorRiego * r.riegos * (1 + r.mortalidadPct / 100)) / 1000
}
