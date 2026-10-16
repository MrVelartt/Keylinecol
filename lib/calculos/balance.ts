// ── Balance hídrico mensual (P vs ETo) + escorrentía capturable ──
// Implementación única: la consumen /analitica (datos de proyecto) y la
// calculadora Balance clima y agua (insumos del usuario). La escorrentía usa
// el método oficial del sitio, modo GUARDAR de lib/calculos/escorrentia.ts:
//   V = 10 · C · A · P   (m³; A en ha, P en mm, C coeficiente anual 0–1)

import { runoffVolumeM3 } from './escorrentia'

export interface BalanceInput {
  areaHa: number
  precipAnualMm: number
  etoAnualMm: number
  /** Coeficiente de escorrentía anual (fracción 0–1), tabla 2.3/2.4. */
  cAnual: number
  /** Distribución mensual de referencia (12 valores, Ene → Dic). Se reescala al total anual. */
  precipShape: readonly number[]
  etoShape: readonly number[]
}

export interface BalanceMes {
  mes: number // 0–11
  p: number // mm
  eto: number // mm
  deficit: number // P − ETo, mm (negativo = déficit)
  pEfectivaM3: number
  coberturaPct: number // P / ETo × 100
  escorrentiaM3: number
}

export interface BalanceResultado {
  meses: BalanceMes[]
  deficitAnualMm: number
  precipEfectivaM3: number
  demandaEtoM3: number
  escorrentiaM3: number
  /** % del volumen ETo anual cubierto por la escorrentía capturable. */
  coberturaEscorrentiaPct: number
  mesesSuperavit: number
}

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0)

/** Reescala una distribución mensual de referencia a un total anual. */
export function rescaleMonthly(shape: readonly number[], total: number): number[] {
  const s = sum(shape)
  return shape.map((v) => (s > 0 ? (v / s) * total : total / 12))
}

/** Lámina (mm) sobre un área (ha) → volumen (m³). */
export const mmHaToM3 = (mm: number, areaHa: number) => mm * areaHa * 10

export function balanceHidrico(input: BalanceInput): BalanceResultado {
  const { areaHa, precipAnualMm, etoAnualMm, cAnual } = input
  const p = rescaleMonthly(input.precipShape, precipAnualMm)
  const eto = rescaleMonthly(input.etoShape, etoAnualMm)

  const meses: BalanceMes[] = p.map((pm, i) => {
    const pEfectivaM3 = mmHaToM3(pm, areaHa)
    const etoM3 = mmHaToM3(eto[i], areaHa)
    return {
      mes: i,
      p: pm,
      eto: eto[i],
      deficit: pm - eto[i],
      pEfectivaM3,
      coberturaPct: etoM3 > 0 ? (pEfectivaM3 / etoM3) * 100 : 0,
      escorrentiaM3: runoffVolumeM3(cAnual, areaHa, pm),
    }
  })

  const demandaEtoM3 = mmHaToM3(etoAnualMm, areaHa)
  // Total sobre el valor anual sin redondear, no sumando las barras mensuales.
  const escorrentiaM3 = runoffVolumeM3(cAnual, areaHa, precipAnualMm)

  return {
    meses,
    deficitAnualMm: precipAnualMm - etoAnualMm,
    precipEfectivaM3: mmHaToM3(precipAnualMm, areaHa),
    demandaEtoM3,
    escorrentiaM3,
    coberturaEscorrentiaPct: demandaEtoM3 > 0 ? (escorrentiaM3 / demandaEtoM3) * 100 : 0,
    mesesSuperavit: meses.filter((m) => m.deficit >= 0).length,
  }
}
