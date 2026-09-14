// ── Método único de escorrentía (SCS-CN mensual) ──
// Usado tanto por /analitica (climateData.ts) como por la calculadora de
// /herramientas (CalculadoraClima.tsx), para que ambas páginas reporten la
// misma cifra ante los mismos insumos (área, precipitación, CN).

export function scsCnMonthlyRunoffMm(monthlyPrecipMm: number[], cn: number): number[] {
  const s = 25400 / cn - 254 // retención potencial S (mm), método SCS-CN
  return monthlyPrecipMm.map((p) => (p > 0.2 * s ? Math.pow(p - 0.2 * s, 2) / (p + 0.8 * s) : 0))
}

export function scsCnAnnualRunoffM3(monthlyPrecipMm: number[], areaHa: number, cn: number): number {
  const totalQmm = scsCnMonthlyRunoffMm(monthlyPrecipMm, cn).reduce((sum, q) => sum + q, 0)
  return Math.round(totalQmm * areaHa * 10)
}
