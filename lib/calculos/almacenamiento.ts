// ── Dimensionamiento del almacenamiento (reservorios) ──

/** Factor de forma tronco-piramidal: V = espejo × profundidad × 0,7. */
export const FACTOR_FORMA = 0.7
/** Área del vaso con taludes y anclaje respecto al espejo de agua. */
export const FACTOR_AREA_VASO = 1.18

export const espejoM2 = (volumenM3: number, profundidadM: number) =>
  volumenM3 / (Math.max(profundidadM, 0.5) * FACTOR_FORMA)

export const areaVasoM2 = (espejo: number) => espejo * FACTOR_AREA_VASO

export interface AlmacenamientoInput {
  /** Déficit de la época seca a cubrir con almacenamiento (m³). */
  deficitM3: number
  evaporacionMmDia: number
  infiltracionMmDia: number
  diasSecos: number
  profundidadM: number
  factorSeguridad: number
}

export interface AlmacenamientoResultado {
  volumenUtilM3: number
  espejoM2: number
  perdidasM3: number
  perdidasPct: number
}

/**
 * V = (déficit + pérdidas por evaporación e infiltración) × factor de
 * seguridad. Las pérdidas dependen del espejo, que depende de V: se itera
 * hasta converger (24 pasos bastan para los rangos de diseño).
 */
export function dimensionarAlmacenamiento(i: AlmacenamientoInput): AlmacenamientoResultado {
  const tasa = i.evaporacionMmDia + i.infiltracionMmDia
  let v = i.deficitM3
  let espejo = 0
  for (let k = 0; k < 24; k++) {
    espejo = espejoM2(v, i.profundidadM)
    const perdidas = (tasa * espejo * i.diasSecos) / 1000
    v = (i.deficitM3 + perdidas) * i.factorSeguridad
  }
  const perdidasM3 = (tasa * espejo * i.diasSecos) / 1000
  return {
    volumenUtilM3: v,
    espejoM2: espejo,
    perdidasM3,
    perdidasPct: v > 0 ? (perdidasM3 / v) * 100 : 0,
  }
}
