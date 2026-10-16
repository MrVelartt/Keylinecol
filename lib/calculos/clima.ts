// ── Clima: ETo por altitud y lluvia en época seca ──
import type { ZonaBioclimatica } from '../../data/catalogos/clima'

/**
 * ETo de referencia (mm/día). En zonas con regresión altitudinal se usa
 * Cenicafé 57(4) (2006): ETo = 4,37 · e^(−0,0002 · altitud), acotada al
 * rango de la zona; en las demás, el valor fijo de la zona.
 */
export function etoPorAltitud(altitudM: number, zona: ZonaBioclimatica): number {
  if (!zona.regresionAltitud) return zona.eto
  const r = 4.37 * Math.exp(-0.0002 * altitudM)
  return Math.min(Math.max(r, zona.etoMin), zona.etoMax)
}

/** Días de la época seca (meses secos × 30). */
export const diasEpocaSeca = (mesesSecos: number) => Math.max(mesesSecos, 0) * 30

/**
 * Lluvia que cae durante los meses secos (mm):
 * P_seca = P_anual × (meses secos / 12) × fracción de concentración.
 */
export function lluviaEpocaSecaMm(precipAnualMm: number, mesesSecos: number, fraccion: number): number {
  return precipAnualMm * (mesesSecos / 12) * fraccion
}

/**
 * Agua adicional infiltrada por subir el coeficiente de precipitación
 * efectiva con diseño keyline (m³/ha·año).
 */
export function aguaRetenidaM3Ha(coefActual: number, coefDiseno: number, precipAnualMm: number): number {
  return (coefDiseno - coefActual) * precipAnualMm * 10
}
