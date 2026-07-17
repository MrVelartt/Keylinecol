// ── Datos climáticos por proyecto ──
// TODO: estos valores son ILUSTRATIVOS (placeholder) mientras se importa la serie
// real de la estación IDEAM correspondiente. Reemplazar `annualSeries` y
// `monthlyMaxDaily` por los registros históricos reales cuando estén disponibles.
// La estructura (Record<projectId, ProjectClimate>) ya está lista para sumar
// más proyectos sin tocar el componente que la consume.

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
  monthlyPrecipAvg: number[] // 12 valores, Ene → Dic, mm promedio histórico
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

export const climateData: Record<string, ProjectClimate> = {
  baranoa: {
    id: 'baranoa',
    name: 'Keyline Baranoa',
    location: 'Baranoa, Atlántico, Colombia',
    coords: '10.79°N, -74.92°O',
    elevation: '12 m s.n.m.',
    areaHa: 28,
    station: 'Montebello [29040020]',
    period: '1997–2025',
    kpis: {
      precipMmYear: 751.9,
      etoMmYear: 1637,
      runoffM3Year: 88231,
    },
    monthlyPrecipAvg: [2, 5, 13, 59, 88, 86, 84, 108, 106, 97, 78, 25.9],
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
