// ── Formatos numéricos de Diseño Keyline Predial (es-CO) ──

const nf0 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const nf1f = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })
const nf2f = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })

const safe = (v: number) => (Number.isFinite(v) ? v : 0)

export const nf = (v: number) => nf0.format(safe(v))
export const nf1 = (v: number) => nf1f.format(safe(v))
export const nf2 = (v: number) => nf2f.format(safe(v))

/** Pesos completos: $ 12.450.000 */
export const cop = (v: number) => `$ ${nf0.format(Math.round(safe(v)))}`

/** Pesos compactos: $ 245,3 M · $ 1.250 M · $ 850 mil */
export function copC(v: number) {
  const x = safe(v)
  if (Math.abs(x) >= 1e6) return `$ ${nf1f.format(x / 1e6)} M`
  if (Math.abs(x) >= 1e3) return `$ ${nf0.format(x / 1e3)} mil`
  return cop(x)
}
