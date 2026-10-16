// ── Tema de gráficas (Recharts) ──
// Principio: el color significa algo. Como máximo dos colores con significado
// por gráfica; las series de referencia van en gris punteado.
//
//   water    agua, precipitación, oferta hídrica      → verde institucional
//   demand   demanda, ETo, pérdida                    → arena cálida
//   deficit  déficit, alerta                          → terracota apagado
//   neutral  promedio histórico, series secundarias   → gris punteado
import { palette, lines, veils, alpha } from '@/lib/theme'

export const series = {
  water: palette.signal.water,
  demand: palette.signal.demand,
  deficit: palette.signal.deficit,
  neutral: palette.signal.neutral,
} as const

export type SeriesRole = keyof typeof series

/** Relleno de área: el tono del trazo a baja opacidad (12–18 %). */
export const areaFill = (role: SeriesRole, opacity = 0.15) => alpha(series[role], opacity)

const MONO = "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace"

export const axisTick = { fill: palette.ink.mono, fontSize: 11, fontFamily: MONO }
export const axisTickSmall = { ...axisTick, fontSize: 9 }

/** Props comunes para <XAxis> / <YAxis>. */
export const xAxisProps = {
  tick: axisTick,
  axisLine: { stroke: lines.subtle },
  tickLine: false,
} as const

export const yAxisProps = {
  tick: axisTick,
  axisLine: false,
  tickLine: false,
} as const

/** Props comunes para <CartesianGrid>. */
export const gridProps = {
  stroke: lines.subtle,
  vertical: false,
} as const

export const polarGridStroke = lines.subtle

/** Cursor del tooltip: velo sobre barras, línea fina sobre series continuas. */
export const barCursor = { fill: veils.DEFAULT }
export const lineCursor = { stroke: lines.strong }

/** Línea de cero / referencia neutra. */
export const zeroLine = { stroke: lines.strong }

/** Serie neutra (promedio histórico): gris punteado, sin color. */
export const neutralLine = {
  stroke: series.neutral,
  strokeDasharray: '4 4',
  strokeWidth: 1.25,
} as const

/** Para tooltips nativos de Recharts (cuando no se usa <ChartTooltip />). */
export const nativeTooltipProps = {
  contentStyle: {
    background: palette.surface.raised,
    border: `1px solid ${lines.subtle}`,
    borderRadius: 8,
    fontFamily: MONO,
    fontSize: 12,
  },
  labelStyle: { color: palette.ink.mono },
  itemStyle: { color: palette.ink.primary },
} as const
