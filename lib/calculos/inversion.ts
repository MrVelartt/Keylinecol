// ── Cronograma de inversión por semestres ──

export type ModoCronograma = 'escala' | 'lineal' | 'carga-inicial'

export interface ItemInversion {
  k: string
  nombre: string
  valor: number
}

export interface Cronograma {
  semestres: Record<string, number>[]
  items: ItemInversion[]
  total: number
  capacidad: number
}

/**
 * Distribuye la inversión en semestres.
 * - escala: llena cada semestre hasta el tope, en el orden de la escala de
 *   permanencia (una capa no empieza hasta que la anterior se financia).
 * - lineal: reparte cada capa en partes iguales en ⌈total/tope⌉ semestres.
 * - carga-inicial: 60 % en el primer año (30 % + 30 %), el resto al tope.
 */
export function cronograma(itemsIn: ItemInversion[], capacidadSemestre: number, modo: ModoCronograma): Cronograma {
  const items = itemsIn.filter((i) => i.valor > 0)
  const total = items.reduce((s, i) => s + i.valor, 0)
  const capacidad = Math.max(capacidadSemestre, 1)
  const semestres: Record<string, number>[] = []

  if (modo === 'lineal') {
    const n = Math.max(1, Math.ceil(total / capacidad))
    for (let s = 0; s < n; s++) {
      const o: Record<string, number> = {}
      items.forEach((i) => (o[i.k] = i.valor / n))
      semestres.push(o)
    }
  } else {
    const presupuestos = modo === 'carga-inicial' ? [total * 0.3, total * 0.3] : null
    const cola = items.map((i) => ({ ...i, resto: i.valor }))
    let s = 0
    while (cola.some((i) => i.resto > 1) && s < 40) {
      let libre = presupuestos && s < presupuestos.length ? presupuestos[s] : capacidad
      const o: Record<string, number> = {}
      for (const i of cola) {
        if (i.resto <= 1 || libre <= 0) continue
        const t = Math.min(i.resto, libre)
        o[i.k] = (o[i.k] || 0) + t
        i.resto -= t
        libre -= t
      }
      semestres.push(o)
      s++
    }
    if (!semestres.length) semestres.push({})
  }
  return { semestres, items, total, capacidad }
}

export const totalSemestre = (s: Record<string, number>) => Object.values(s).reduce((a, b) => a + b, 0)
