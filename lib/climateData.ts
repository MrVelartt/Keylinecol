// ── Datos climáticos por proyecto ──
// TODO: estos valores son ILUSTRATIVOS (placeholder) mientras se importa la serie
// real de la estación IDEAM correspondiente. Reemplazar `annualSeries` y
// `monthlyMaxDaily` por los registros históricos reales cuando estén disponibles.
// La estructura (Record<projectId, ProjectClimate>) ya está lista para sumar
// más proyectos sin tocar el componente que la consume.

import { scsCnAnnualRunoffM3 } from './hydrology'

// CN de referencia usado para la escorrentía reportada en /analitica — debe
// coincidir con el CN por defecto de la calculadora en /herramientas para que
// ambas páginas muestren la misma cifra ante los mismos insumos.
export const DEFAULT_RUNOFF_CN = 68

export interface AnnualRecord {
  year: number
  precipMm: number
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
  kpis: {
    precipMmYear: number
    etoMmYear: number
    runoffM3Year: number
  }
  etoSource: string
  monthlyPrecipAvg: number[] // 12 valores, Ene → Dic, mm promedio histórico
  monthlyEtoAvg: number[] // 12 valores, Ene → Dic, mm ETo de referencia (FAO-56 PM)
  monthlyMaxDailyAvg: number[] // 12 valores, Ene → Dic, mm máximo diario promedio
  annualSeries: AnnualRecord[] // 1997–2025
  wettestMonth: { label: string; mm: number }
  historicMaxAnnual: { mm: number; year: number; note: string }
  historicMinAnnual: { mm: number; year: number; note: string }
  historicMaxDaily: { mm: number; date: string; note: string }
}

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const baranoaAnnualSeries: AnnualRecord[] = [
  { year: 1997, precipMm: 149 },
  { year: 1998, precipMm: 620 },
  { year: 1999, precipMm: 680 },
  { year: 2000, precipMm: 590 },
  { year: 2001, precipMm: 710 },
  { year: 2002, precipMm: 770 },
  { year: 2003, precipMm: 640 },
  { year: 2004, precipMm: 820 },
  { year: 2005, precipMm: 900 },
  { year: 2006, precipMm: 680 },
  { year: 2007, precipMm: 760 },
  { year: 2008, precipMm: 850 },
  { year: 2009, precipMm: 700 },
  { year: 2010, precipMm: 1658 },
  { year: 2011, precipMm: 950 },
  { year: 2012, precipMm: 830 },
  { year: 2013, precipMm: 690 },
  { year: 2014, precipMm: 610 },
  { year: 2015, precipMm: 560 },
  { year: 2016, precipMm: 1450 },
  { year: 2017, precipMm: 1400 },
  { year: 2018, precipMm: 780 },
  { year: 2019, precipMm: 650 },
  { year: 2020, precipMm: 800 },
  { year: 2021, precipMm: 820 },
  { year: 2022, precipMm: 880 },
  { year: 2023, precipMm: 680 },
  { year: 2024, precipMm: 620 },
  { year: 2025, precipMm: 590 },
]

const baranoaAreaHa = 28
const baranoaMonthlyPrecipAvg = [2, 5, 13, 59, 88, 86, 84, 108, 106, 97, 78, 25.9]

// ETo de referencia mensual (mm) — método FAO-56 Penman-Monteith (Allen et al.,
// 1998) calculado sobre climatología satelital NASA POWER (fuentes SYN1DEG /
// MERRA2, 2001–2020) en 10.79°N, -74.92°O, elevación 12 m. Es una estimación
// satelital, no la estación en sitio — calibrar cuando exista serie IDEAM local
// con temperatura, humedad, viento y brillo solar de Baranoa.
const baranoaMonthlyEtoAvg = [157.9, 159.0, 179.4, 159.5, 142.3, 139.0, 147.3, 145.4, 133.2, 126.1, 118.9, 139.2]
const baranoaEtoSource = 'NASA POWER (2001–2020) · FAO-56 Penman-Monteith'

export const climateData: Record<string, ProjectClimate> = {
  baranoa: {
    id: 'baranoa',
    name: 'Keyline Baranoa',
    location: 'Baranoa, Atlántico, Colombia',
    coords: '10°47′N · 74°55′O',
    elevation: '12 m s.n.m.',
    areaHa: baranoaAreaHa,
    station: 'Montebello [29040020]',
    period: '1997–2025',
    kpis: {
      precipMmYear: 751.9,
      etoMmYear: Math.round(baranoaMonthlyEtoAvg.reduce((a, b) => a + b, 0) * 10) / 10,
      // Método CN (SCS) sobre precipitación mensual — mismo método y CN que
      // la calculadora de /herramientas, ver lib/hydrology.ts.
      runoffM3Year: scsCnAnnualRunoffM3(baranoaMonthlyPrecipAvg, baranoaAreaHa, DEFAULT_RUNOFF_CN),
    },
    etoSource: baranoaEtoSource,
    monthlyPrecipAvg: baranoaMonthlyPrecipAvg,
    monthlyEtoAvg: baranoaMonthlyEtoAvg,
    monthlyMaxDailyAvg: [2, 4, 9, 36, 60, 58, 55, 108, 106, 90, 62, 24],
    annualSeries: baranoaAnnualSeries,
    wettestMonth: { label: 'Ago', mm: 108.1 },
    historicMaxAnnual: { mm: 1658, year: 2010, note: 'Fenómeno La Niña' },
    historicMinAnnual: { mm: 149, year: 1997, note: 'Año más seco registrado' },
    historicMaxDaily: { mm: 140, date: 'Ago 2008', note: 'Evento extremo' },
  },
}

export const MONTH_LABELS_ES = MONTH_LABELS

export const climateProjectIds = Object.keys(climateData)
