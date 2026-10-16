// ── Keyline Baranoa — parámetros de referencia únicos ──
// Fuente única para /analitica y para los valores por defecto de las
// calculadoras de /herramientas. Ninguna página debe recalcular estas cifras
// por su cuenta: si cambia un insumo, cambia aquí y se propaga.
//
// TODO: la serie anual (annualSeries) y el máximo diario mensual son
// ILUSTRATIVOS mientras se importa la serie real de la estación IDEAM.

import { annualCRange, bandaFromClimate, runoffVolumeM3 } from '@/lib/calculos/escorrentia'
import type { AnnualRecord, ProjectClimate, RunoffParams } from './types'

const areaHa = 28

const monthlyPrecipAvg = [2, 5, 13, 59, 88, 86, 84, 108, 106, 97, 78, 25.9]

// ETo de referencia mensual (mm) — FAO-56 Penman-Monteith (Allen et al., 1998)
// sobre climatología satelital NASA POWER (SYN1DEG / MERRA2, 2001–2020) en
// 10.79°N, -74.92°O, elevación 12 m. Estimación satelital, no estación en sitio.
const monthlyEtoAvg = [157.9, 159.0, 179.4, 159.5, 142.3, 139.0, 147.3, 145.4, 133.2, 126.1, 118.9, 139.2]

const round1 = (v: number) => Math.round(v * 10) / 10
const precipMmYear = round1(monthlyPrecipAvg.reduce((a, b) => a + b, 0)) // 751,9
const etoMmYear = round1(monthlyEtoAvg.reduce((a, b) => a + b, 0)) // 1.747,2

// ── Escorrentía: método oficial GUARDAR (Regrarians §2.19, tabla 2.3) ──
// La ETo se usa como sustituto de la evaporación anual para elegir la banda.
// SUPUESTO PENDIENTE DE VALIDAR EN CAMPO: textura "arcilla arenosa" y
// confiabilidad 8 de 10 años.
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

const annualSeries: AnnualRecord[] = [
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

export const baranoa: ProjectClimate = {
  id: 'baranoa',
  name: 'Keyline Baranoa',
  location: 'Baranoa, Atlántico, Colombia',
  coords: '10°47′N · 74°55′O',
  elevation: '12 m s.n.m.',
  areaHa,
  station: 'Montebello [29040020]',
  period: '1997–2025',
  runoff,
  kpis: {
    precipMmYear,
    etoMmYear,
    runoffM3Year: Math.round(runoffVolumeM3(runoff.cAnual, areaHa, precipMmYear)),
  },
  etoSource: 'NASA POWER (2001–2020) · FAO-56 Penman-Monteith',
  monthlyPrecipAvg,
  monthlyEtoAvg,
  monthlyMaxDailyAvg: [2, 4, 9, 36, 60, 58, 55, 108, 106, 90, 62, 24],
  annualSeries,
  wettestMonth: { label: 'Ago', mm: 108.1 },
  historicMaxAnnual: { mm: 1658, year: 2010, note: 'Fenómeno La Niña' },
  historicMinAnnual: { mm: 149, year: 1997, note: 'Año más seco registrado' },
  historicMaxDaily: { mm: 140, date: 'Ago 2008', note: 'Evento extremo' },
}
