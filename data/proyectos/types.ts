import type { BandaLluviaEvap, Confiabilidad, SueloTextura } from '@/lib/calculos/escorrentia'

export interface AnnualRecord {
  year: number
  precipMm: number
}

/** Parámetros de escorrentía del predio — método oficial GUARDAR (tabla 2.3). */
export interface RunoffParams {
  banda: BandaLluviaEvap
  confiabilidad: Confiabilidad
  suelo: SueloTextura
  /** C anual adoptado (fracción 0–1): punto medio del rango de la tabla. */
  cAnual: number
  cRango: readonly [number, number]
}

export interface ProjectClimate {
  id: string
  name: string
  location: string
  coords: string
  elevation: string
  areaHa: number
  station: string
  period: string
  runoff: RunoffParams
  kpis: {
    precipMmYear: number
    etoMmYear: number
    runoffM3Year: number
  }
  etoSource: string
  monthlyPrecipAvg: number[] // 12 valores, Ene → Dic, mm promedio histórico
  monthlyEtoAvg: number[] // 12 valores, Ene → Dic, mm ETo de referencia (FAO-56 PM)
  monthlyMaxDailyAvg: number[] // 12 valores, Ene → Dic, mm máximo diario promedio
  annualSeries: AnnualRecord[]
  wettestMonth: { label: string; mm: number }
  historicMaxAnnual: { mm: number; year: number; note: string }
  historicMinAnnual: { mm: number; year: number; note: string }
  historicMaxDaily: { mm: number; date: string; note: string }
}
