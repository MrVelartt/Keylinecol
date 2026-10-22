// ── Finca Alma Luz, Baranoa — parámetros de referencia únicos ──
// Fuente única para /analitica y para los valores precargados de las
// calculadoras de /herramientas. Ninguna página debe recalcular estas cifras
// por su cuenta: si cambia un insumo, cambia aquí y se propaga.
//
// Fuente: «Climatología e hidrología – Finca Alma Luz, Baranoa (Atlántico)»,
// versión corregida (revisión 17-oct-2026). Estación IDEAM MONTEBELLO
// [29040020], serie diaria DHIME 1997–2025 (2024–2025 en nivel preliminar).
// Corrige el 751,9 mm/año anterior: 854 lluvias diarias con decimales venían
// como texto y se perdían (39 % de la lluvia registrada).

import { annualCRange, bandaFromClimate, runoffVolumeM3 } from '@/lib/calculos/escorrentia'
import type { AnnualRecord, ProjectClimate, RunoffParams } from './types'

/** Área del sistema de captación: microcuencas Norte + Nororiente + Oriente + Sur (449.233 m²). */
const areaHa = 44.92

/** Pasturas regadas del balance hídrico del estudio (162.200 m²). */
const irrigatedHa = 16.22

// Lluvia mensual media (mm): suma diaria por mes, solo meses con ≥ 90 % de días con dato.
const monthlyPrecipAvg = [4.38, 11.14, 21.16, 92.42, 150.62, 137.66, 137.89, 180.53, 176.48, 166.04, 131.79, 43.15]

// Año seco: percentil 80 de cada mes (superado 4 de cada 5 años).
const monthlyPrecipP80 = [0, 0, 0, 38.4, 112.32, 90.14, 74.96, 102.64, 129.52, 103.92, 76.14, 10.6]

// ETo de referencia mensual (mm) — salida CROPWAT (FAO-56 Penman-Monteith).
const monthlyEtoAvg = [142.6, 141.96, 161.82, 147.9, 137.95, 134.1, 146.32, 144.15, 123.6, 115.94, 112.8, 128.34]

// Temperaturas medias mensuales (°C) usadas por CROPWAT.
const monthlyTmax = [31.8, 32.6, 33.2, 33.4, 32.6, 32.3, 32.7, 32.7, 32.0, 31.2, 31.4, 31.6]
const monthlyTmin = [22.8, 23.0, 23.6, 24.3, 24.4, 24.2, 23.8, 23.8, 23.6, 23.5, 23.7, 23.3]

const round1 = (v: number) => Math.round(v * 10) / 10
const precipMmYear = round1(monthlyPrecipAvg.reduce((a, b) => a + b, 0)) // 1.253,3
const etoMmYear = round1(monthlyEtoAvg.reduce((a, b) => a + b, 0)) // 1.637,5

// ── Escorrentía: método oficial GUARDAR (Regrarians §2.19, tabla 2.3) ──
// La ETo se usa como sustituto de la evaporación anual para elegir la banda.
// SUPUESTO PENDIENTE DE VALIDAR EN CAMPO: textura "arcilla arenosa" y
// confiabilidad 8 de 10 años. Como contraste, el estudio da 30.962 m³/año con
// SCS-CN diario (CN 68, ≈ 5,5 % de la lluvia) y 112.601 m³/año con Ce = 0,2.
const banda = bandaFromClimate(precipMmYear, etoMmYear)
const confiabilidad = '8de10' as const
const suelo = 'arcilla_arenosa' as const
const cRango = annualCRange(banda, confiabilidad, suelo) ?? ([0, 0] as const)
const runoff: RunoffParams = {
  banda,
  confiabilidad,
  suelo,
  cRango,
  cAnual: (cRango[0] + cRango[1]) / 2,
}

// Totales anuales de años completos (12 meses válidos). 1999 (9 meses) y
// 2004 (6 meses) quedan fuera por incompletos.
const annualSeries: AnnualRecord[] = [
  { year: 1997, precipMm: 828.7 },
  { year: 1998, precipMm: 997.5 },
  { year: 2000, precipMm: 1092.8 },
  { year: 2001, precipMm: 802.2 },
  { year: 2002, precipMm: 791.1 },
  { year: 2003, precipMm: 1169.0 },
  { year: 2005, precipMm: 1119.7 },
  { year: 2006, precipMm: 1279.6 },
  { year: 2007, precipMm: 1562.6 },
  { year: 2008, precipMm: 1800.9 },
  { year: 2009, precipMm: 987.2 },
  { year: 2010, precipMm: 1826.2 },
  { year: 2011, precipMm: 1683.0 },
  { year: 2012, precipMm: 1026.6 },
  { year: 2013, precipMm: 1342.8 },
  { year: 2014, precipMm: 922.7 },
  { year: 2015, precipMm: 773.5 },
  { year: 2016, precipMm: 1518.7 },
  { year: 2017, precipMm: 1511.6 },
  { year: 2018, precipMm: 1059.8 },
  { year: 2019, precipMm: 1070.0 },
  { year: 2020, precipMm: 1603.4 },
  { year: 2021, precipMm: 1232.0 },
  { year: 2022, precipMm: 1742.3 },
  { year: 2023, precipMm: 1003.7 },
  { year: 2024, precipMm: 1515.3 },
  { year: 2025, precipMm: 1179.6 },
]

// Lluvia máxima diaria de cada mes por año (mm), años completos.
const monthlyMaxDailyByYear: Record<number, number[]> = {
  1997: [0.0, 11.3, 0.0, 9.3, 56.0, 44.5, 7.3, 20.5, 34.6, 44.4, 91.7, 0.0],
  1998: [2.5, 0.0, 18.5, 0.0, 52.0, 34.3, 84.0, 14.3, 32.0, 50.0, 17.6, 34.8],
  2000: [18.0, 5.7, 0.0, 81.1, 61.8, 56.0, 37.0, 39.0, 41.5, 31.0, 20.5, 5.0],
  2001: [0.0, 0.0, 3.0, 50.0, 61.0, 44.5, 56.5, 17.0, 79.0, 21.0, 27.5, 26.0],
  2002: [0.0, 2.5, 29.5, 19.0, 63.0, 17.0, 28.5, 32.0, 34.5, 49.0, 10.0, 11.0],
  2003: [0.0, 8.0, 58.0, 68.0, 58.7, 35.8, 19.0, 22.2, 40.0, 20.7, 52.5, 60.5],
  2005: [0.0, 0.0, 9.5, 35.5, 27.7, 32.0, 43.0, 49.0, 16.5, 39.0, 28.0, 20.0],
  2006: [23.0, 27.0, 0.0, 48.9, 95.0, 28.1, 52.1, 85.2, 24.6, 57.2, 68.6, 36.0],
  2007: [0.0, 0.0, 16.0, 76.2, 32.2, 40.2, 52.0, 54.0, 67.0, 36.0, 14.5, 41.0],
  2008: [0.0, 0.0, 27.0, 57.0, 75.0, 39.0, 45.0, 140.0, 55.2, 77.0, 27.2, 20.0],
  2009: [1.2, 2.4, 12.4, 8.7, 51.5, 29.2, 20.0, 35.0, 25.0, 45.0, 45.0, 10.0],
  2010: [0.0, 2.4, 12.4, 45.0, 18.0, 51.0, 80.5, 58.0, 54.0, 52.0, 28.0, 41.0],
  2011: [0.0, 35.0, 39.5, 34.0, 28.0, 65.0, 8.0, 75.5, 23.0, 57.5, 38.0, 52.0],
  2012: [5.0, 5.0, 25.0, 47.0, 62.3, 14.2, 38.5, 61.2, 75.0, 49.0, 33.2, 14.0],
  2013: [0.0, 0.0, 23.2, 44.2, 55.5, 40.0, 40.0, 51.5, 26.0, 46.0, 114.0, 5.0],
  2014: [0.0, 5.7, 0.0, 20.0, 34.0, 58.0, 3.1, 63.0, 34.3, 82.0, 20.0, 31.6],
  2015: [0.0, 24.0, 10.0, 12.0, 14.4, 29.0, 27.0, 64.0, 100.0, 32.0, 50.0, 4.0],
  2016: [0.0, 0.0, 0.0, 33.0, 112.0, 67.0, 85.0, 29.0, 34.0, 84.3, 46.0, 9.0],
  2017: [11.5, 14.0, 34.0, 28.0, 62.0, 67.0, 49.0, 70.0, 26.3, 36.0, 54.0, 39.0],
  2018: [20.0, 0.0, 0.0, 60.0, 58.0, 32.0, 31.0, 71.0, 55.0, 38.0, 75.0, 0.0],
  2019: [6.0, 0.0, 0.0, 132.0, 24.0, 42.0, 42.0, 47.0, 17.0, 48.0, 44.0, 28.0],
  2020: [0.0, 0.0, 0.0, 44.0, 36.0, 46.0, 87.4, 95.8, 85.5, 50.3, 41.3, 21.0],
  2021: [0.0, 1.0, 16.0, 20.5, 49.0, 30.0, 41.8, 61.3, 38.8, 44.0, 79.0, 33.4],
  2022: [0.0, 0.0, 36.7, 95.8, 125.8, 53.2, 31.2, 65.0, 57.0, 44.0, 73.3, 13.0],
  2023: [9.3, 0.0, 11.5, 23.0, 32.0, 38.0, 16.7, 44.6, 50.3, 54.5, 45.0, 15.3],
  2024: [0.0, 10.4, 13.3, 20.0, 29.8, 54.2, 48.0, 49.6, 94.9, 37.2, 100.6, 17.0],
  2025: [9.2, 0.0, 5.0, 48.6, 23.7, 43.4, 34.9, 25.6, 33.0, 17.8, 26.8, 96.0],
}

export const baranoa: ProjectClimate = {
  id: 'baranoa',
  name: 'Finca Alma Luz',
  location: 'Baranoa, Atlántico, Colombia',
  coords: '10°47′N · 74°55′O',
  elevation: '≈ 110 m s.n.m.',
  areaHa,
  irrigatedHa,
  latitude: 10.79,
  station: 'Montebello [29040020]',
  period: '1997–2025',
  runoff,
  kpis: {
    precipMmYear,
    etoMmYear,
    runoffM3Year: Math.round(runoffVolumeM3(runoff.cAnual, areaHa, precipMmYear)),
  },
  precipSource: 'IDEAM DHIME · estación Montebello [29040020] · serie diaria 1997–2025',
  etoSource: 'CROPWAT · FAO-56 Penman-Monteith',
  monthlyPrecipAvg,
  monthlyPrecipP80,
  monthlyEtoAvg,
  monthlyTmax,
  monthlyTmin,
  // Media de la lluvia máxima diaria de cada mes (mm).
  monthlyMaxDailyAvg: [3.77, 7.53, 15.12, 42.99, 51.41, 41.4, 42.28, 54.54, 47.16, 46.47, 46.76, 25.32],
  monthlyMaxDailyByYear,
  annualSeries,
  wettestMonth: { label: 'Ago', mm: 180.5 },
  historicMaxAnnual: { mm: 1826.2, year: 2010, note: 'Fenómeno La Niña' },
  historicMinAnnual: { mm: 773.5, year: 2015, note: 'Año completo más seco (El Niño)' },
  historicMaxDaily: { mm: 140, date: 'Ago 2008', note: 'Máximo diario de la serie' },
}
