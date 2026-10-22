// ── Gráficas para el PDF ──
// Toma el <svg> que Recharts ya dibujó en pantalla, lo recolorea para papel
// (texto claro → tinta, rejillas blancas → gris de regla) y lo rasteriza a PNG.
import { lines, palette } from '@/lib/theme'

const P = palette.print

const RECOLOR: [RegExp, string][] = [
  [new RegExp(palette.ink.primary, 'gi'), P.ink],
  [/#fff\b/gi, P.ink],
  [/\bwhite\b(?!-)/gi, P.ink],
  [new RegExp(palette.ink.secondary, 'gi'), P.muted],
  [new RegExp(palette.ink.mono, 'gi'), P.muted],
  [new RegExp(palette.surface.raised, 'gi'), P.paper],
  [new RegExp(palette.surface.DEFAULT, 'gi'), P.paper],
  ...Object.values(lines).map((c) => [new RegExp(c.replace(/[().]/g, '\\$&'), 'g'), P.rule] as [RegExp, string]),
  [/rgba\(255,\s*255,\s*255,\s*0?\.\d+\)/g, P.rule],
]

export async function graficaAPng(contenedor: HTMLElement | null, escala = 2): Promise<{ png: string; ratio: number } | null> {
  const svg = contenedor?.querySelector<SVGSVGElement>('svg.recharts-surface') ?? contenedor?.querySelector('svg')
  return svg ? svgAPng(svg, escala) : null
}

/** Todas las gráficas de Recharts visibles dentro del contenedor, en orden. */
export async function graficasAPng(contenedor: HTMLElement | null, escala = 2) {
  const svgs = Array.from(contenedor?.querySelectorAll<SVGSVGElement>('svg.recharts-surface') ?? [])
  const out = await Promise.all(svgs.map((s) => svgAPng(s, escala)))
  return out.filter((x): x is { png: string; ratio: number } => x !== null)
}

async function svgAPng(svg: SVGSVGElement, escala: number): Promise<{ png: string; ratio: number } | null> {
  const { width, height } = svg.getBoundingClientRect()
  if (!width || !height) return null

  const clon = svg.cloneNode(true) as SVGSVGElement
  clon.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clon.setAttribute('width', String(width))
  clon.setAttribute('height', String(height))
  let markup = new XMLSerializer().serializeToString(clon)
  for (const [re, to] of RECOLOR) markup = markup.replace(re, to)

  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * escala)
    canvas.height = Math.round(height * escala)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = P.paper
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return { png: canvas.toDataURL('image/png'), ratio: width / height }
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}
