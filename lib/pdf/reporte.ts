// ── Generador común de informes PDF ──
// Todas las herramientas describen su informe como una lista de bloques
// (títulos, tablas, indicadores, notas, gráficas) y este módulo los dibuja con
// la misma cabecera, paleta de impresión, pie de contacto y aviso.
// jsPDF se importa solo al pedir la descarga, para no pesar en la carga inicial.
import { palette, rgb } from '@/lib/theme'

export type Alineacion = 'left' | 'right' | 'center'

export type Bloque =
  | { tipo: 'titulo'; texto: string }
  | { tipo: 'parrafo'; texto: string; tono?: 'muted' }
  | { tipo: 'kpis'; items: { k: string; v: string; sub?: string }[] }
  | { tipo: 'kv'; filas: [string, string][] }
  | {
      tipo: 'tabla'
      head: string[]
      body: string[][]
      foot?: string[][]
      /** Alineación por columna; por defecto la primera a la izquierda y el resto a la derecha. */
      alinear?: Alineacion[]
      /** Anchos relativos por columna (se reparten sobre el ancho útil). */
      anchos?: number[]
    }
  | { tipo: 'nota'; texto: string; tono?: 'warn' | 'good' }
  | { tipo: 'grafica'; titulo?: string; png: string; ratio: number }
  | { tipo: 'salto' }

export interface Reporte {
  /** Nombre de la herramienta, aparece en la cabecera. */
  herramienta: string
  titulo: string
  subtitulo?: string
  /** Finca o cliente (opcional): cabecera y nombre del archivo. */
  cliente?: string
  /** Datos extra de cabecera (empresa, NIT, etc.). */
  meta?: [string, string][]
  bloques: Bloque[]
  disclaimer: string
  /** Prefijo del archivo: keyline-{slug}-{finca-o-fecha}.pdf */
  slug: string
}

export const WHATSAPP = '+57 311 365 0567'
export const WEB = 'keylinecolombia.com'

const P = palette.print
const MARGEN = 16
const ANCHO = 210
const ALTO = 297
const UTIL = ANCHO - MARGEN * 2
const PIE = 18

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export function nombreArchivo(slug: string, cliente?: string) {
  const c = cliente?.trim() ? slugify(cliente) : new Date().toISOString().slice(0, 10)
  return `keyline-${slug}-${c}.pdf`
}

let logoCache: Promise<{ data: string; ratio: number } | null> | null = null
function cargarLogo() {
  logoCache ??= fetch('/brand/logo-light.png')
    .then((r) => (r.ok ? r.blob() : Promise.reject()))
    .then(
      (b) =>
        new Promise<{ data: string; ratio: number }>((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => {
            const data = String(fr.result)
            const img = new Image()
            img.onload = () => resolve({ data, ratio: img.naturalWidth / img.naturalHeight || 3.3 })
            img.onerror = reject
            img.src = data
          }
          fr.onerror = reject
          fr.readAsDataURL(b)
        })
    )
    .catch(() => null)
  return logoCache
}

/** Descarga el informe en el navegador. */
export async function descargarPDF(rep: Reporte) {
  const doc = await generarPDF(rep)
  doc.save(nombreArchivo(rep.slug, rep.cliente))
}

// Helvetica de jsPDF solo trae WinAnsi: los símbolos fuera de ese juego
// (flechas, menos tipográfico, ≈, ≤) se reemplazan para no descuadrar el texto.
const SUSTITUTOS: [RegExp, string][] = [
  [/→/g, '->'],
  [/←/g, '<-'],
  [/[−‒]/g, '-'],
  [/≈/g, '~'],
  [/≤/g, '<='],
  [/≥/g, '>='],
  [/[‐‑]/g, '-'],
  [/ | /g, ' '],
]

function limpiar<T>(v: T): T {
  if (typeof v === 'string') return SUSTITUTOS.reduce((s, [re, to]) => s.replace(re, to), v as string) as T
  if (Array.isArray(v)) return v.map(limpiar) as T
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'png' ? x : limpiar(x)])) as T
  }
  return v
}

/** Arma el documento (sin guardarlo): sirve también para pruebas. */
export async function generarPDF(repIn: Reporte, opciones: { logo?: boolean } = {}) {
  const rep = limpiar(repIn)
  const [{ jsPDF }, { default: autoTable }, logo] = await Promise.all([import('jspdf'), import('jspdf-autotable'), opciones.logo === false ? null : cargarLogo()])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const finalY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  const color = (hex: string) => rgb(hex)
  const limite = ALTO - PIE - 8

  let y = 0
  const asegurar = (alto: number) => {
    if (y + alto > limite) {
      doc.addPage()
      y = MARGEN + 4
    }
  }

  // ── Cabecera (solo primera página) ──
  doc.setFillColor(...color(P.panel))
  doc.rect(0, 0, ANCHO, 38, 'F')
  doc.setFillColor(...color(P.accent))
  doc.rect(0, 38, ANCHO, 0.9, 'F')
  if (logo) {
    const h = 11
    doc.addImage(logo.data, 'PNG', MARGEN, 10, h * logo.ratio, h)
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...color(P.accent))
    doc.text('KEYLINE COLOMBIA', MARGEN, 18)
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...color(P.muted))
  doc.text(rep.herramienta.toUpperCase(), MARGEN, 29)
  const fecha = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
  const derecha = [`Generado el ${fecha}`, ...(rep.cliente?.trim() ? [`Finca / cliente: ${rep.cliente.trim()}`] : [])]
  derecha.forEach((t, i) => doc.text(t, ANCHO - MARGEN, 16 + i * 5, { align: 'right' }))

  y = 52
  doc.setTextColor(...color(P.ink))
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  const tituloLineas = doc.splitTextToSize(rep.titulo, UTIL) as string[]
  doc.text(tituloLineas, MARGEN, y)
  y += tituloLineas.length * 7
  if (rep.subtitulo) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...color(P.muted))
    const l = doc.splitTextToSize(rep.subtitulo, UTIL) as string[]
    doc.text(l, MARGEN, y)
    y += l.length * 4.5
  }
  if (rep.meta?.length) {
    y += 2
    autoTable(doc, {
      startY: y,
      margin: { left: MARGEN, right: MARGEN },
      body: rep.meta,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1.2, textColor: color(P.ink) },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 42, textColor: color(P.muted) } },
    })
    y = finalY()
  }
  y += 6

  const tablaBase = {
    margin: { left: MARGEN, right: MARGEN, bottom: PIE + 8 },
    theme: 'grid' as const,
    styles: { fontSize: 8.5, cellPadding: 2.2, textColor: color(P.ink), lineColor: color(P.rule), lineWidth: 0.2 },
    headStyles: { fillColor: color(P.ink), textColor: color(P.paper), fontStyle: 'bold' as const, fontSize: 8 },
    footStyles: { fillColor: color(P.panel), textColor: color(P.ink), fontStyle: 'bold' as const },
  }

  for (const b of rep.bloques) {
    switch (b.tipo) {
      case 'titulo': {
        // Reserva espacio para el título y algo de contenido: no deja títulos huérfanos.
        asegurar(34)
        y += 3
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(...color(P.accent))
        doc.text(b.texto, MARGEN, y)
        y += 2
        doc.setDrawColor(...color(P.rule))
        doc.setLineWidth(0.3)
        doc.line(MARGEN, y, ANCHO - MARGEN, y)
        y += 5
        break
      }
      case 'parrafo': {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...color(b.tono === 'muted' ? P.muted : P.ink))
        const l = doc.splitTextToSize(b.texto, UTIL) as string[]
        asegurar(l.length * 4.2)
        doc.text(l, MARGEN, y)
        y += l.length * 4.2 + 2
        break
      }
      case 'kpis': {
        const cols = Math.min(3, b.items.length)
        const gap = 3
        const w = (UTIL - gap * (cols - 1)) / cols
        const h = 18
        for (let i = 0; i < b.items.length; i += cols) {
          asegurar(h + gap)
          b.items.slice(i, i + cols).forEach((it, j) => {
            const x = MARGEN + j * (w + gap)
            doc.setFillColor(...color(P.panel))
            doc.setDrawColor(...color(P.rule))
            doc.roundedRect(x, y, w, h, 1.5, 1.5, 'FD')
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(6.8)
            doc.setTextColor(...color(P.muted))
            doc.text(it.k.toUpperCase(), x + 3, y + 5)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(11)
            doc.setTextColor(...color(P.ink))
            doc.text(doc.splitTextToSize(it.v, w - 6)[0] as string, x + 3, y + 11)
            if (it.sub) {
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(6.8)
              doc.setTextColor(...color(P.muted))
              doc.text(doc.splitTextToSize(it.sub, w - 6)[0] as string, x + 3, y + 15.5)
            }
          })
          y += h + gap
        }
        y += 2
        break
      }
      case 'kv': {
        autoTable(doc, {
          ...tablaBase,
          startY: y,
          body: b.filas,
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: UTIL * 0.55 }, 1: { halign: 'right' } },
        })
        y = finalY() + 5
        break
      }
      case 'tabla': {
        const n = b.head.length
        const al = b.alinear ?? b.head.map((_, i) => (i === 0 ? 'left' : 'right'))
        const suma = b.anchos?.reduce((a, c) => a + c, 0) ?? 0
        const columnStyles = Object.fromEntries(
          Array.from({ length: n }, (_, i) => [
            i,
            { halign: al[i], ...(b.anchos && suma > 0 ? { cellWidth: (UTIL * b.anchos[i]) / suma } : {}) },
          ])
        )
        autoTable(doc, {
          ...tablaBase,
          startY: y,
          head: [b.head],
          body: b.body,
          foot: b.foot,
          columnStyles,
          didParseCell: (d) => {
            if (d.section !== 'body') d.cell.styles.halign = al[d.column.index]
          },
        })
        y = finalY() + 5
        break
      }
      case 'nota': {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        const l = doc.splitTextToSize(b.texto, UTIL - 8) as string[]
        const h = l.length * 4 + 5
        asegurar(h + 3)
        const borde = b.tono === 'warn' ? P.deficit : b.tono === 'good' ? P.accent : P.rule
        doc.setFillColor(...color(P.panel))
        doc.rect(MARGEN, y, UTIL, h, 'F')
        doc.setFillColor(...color(borde))
        doc.rect(MARGEN, y, 1.2, h, 'F')
        doc.setTextColor(...color(P.ink))
        doc.text(l, MARGEN + 5, y + 5)
        y += h + 4
        break
      }
      case 'grafica': {
        const w = UTIL
        const h = w / b.ratio
        asegurar(h + (b.titulo ? 8 : 2))
        if (b.titulo) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(8)
          doc.setTextColor(...color(P.muted))
          doc.text(b.titulo.toUpperCase(), MARGEN, y)
          y += 3
        }
        doc.addImage(b.png, 'PNG', MARGEN, y, w, h)
        y += h + 5
        break
      }
      case 'salto': {
        doc.addPage()
        y = MARGEN + 4
        break
      }
    }
  }

  // Aviso al final del contenido
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  const aviso = doc.splitTextToSize(rep.disclaimer, UTIL) as string[]
  asegurar(aviso.length * 3.6 + 4)
  y += 2
  doc.setTextColor(...color(P.muted))
  doc.text(aviso, MARGEN, y)

  // Pie de contacto y numeración en todas las páginas
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setDrawColor(...color(P.rule))
    doc.setLineWidth(0.3)
    doc.line(MARGEN, ALTO - PIE, ANCHO - MARGEN, ALTO - PIE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...color(P.ink))
    doc.text(`Keyline Colombia · WhatsApp ${WHATSAPP} · ${WEB}`, MARGEN, ALTO - PIE + 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...color(P.muted))
    doc.text(`${p} / ${total}`, ANCHO - MARGEN, ALTO - PIE + 6, { align: 'right' })
  }

  return doc
}
