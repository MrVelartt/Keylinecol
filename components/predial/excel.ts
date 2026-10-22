// ── Excel editable de Diseño Keyline Predial ──
// Libro con fórmulas vivas encadenadas: al cambiar un dato de entrada (texto
// azul) se recalculan demanda, oferta, almacenamiento, movimiento de tierras
// y el presupuesto. Convención del libro de la Finca Alma Luz:
//   texto azul = dato de entrada · negro = fórmula · verde = vínculo a otra hoja.
// El cronograma por semestres sale como valores (su algoritmo no es una
// fórmula de hoja de cálculo); se indica en la hoja.
import type ExcelJS from 'exceljs'
import { CAPAS, type CapaCostoId, type PredialResultado, type PredialState } from '@/lib/calculos/predial'
import { totalSemestre } from '@/lib/calculos/inversion'
import { FACTOR_FORMA, FACTOR_AREA_VASO } from '@/lib/calculos/almacenamiento'
import { FACTOR_DESCAPOTE, FRACCION_ACARREO } from '@/lib/calculos/movimientoTierra'
import { ADVERTENCIA_APU, DISCLAIMER_PREDIAL, FUENTES, SUPUESTOS } from '@/data/catalogos/predial'
import { DEPARTAMENTOS, ZONAS, type ZonaId } from '@/data/catalogos/clima'
import { FONDOS, FONDO_GEOMEMBRANA, MATERIALES, TIPOLOGIAS } from '@/data/catalogos/obra'
import { PRECIOS } from '@/data/catalogos/precios'
import { SUPERFICIE_GUARDAR_LABEL } from '@/lib/calculos/escorrentia'
import { palette } from '@/lib/theme'
import { nombreArchivo } from '@/lib/pdf/reporte'

type Tipo = 'entrada' | 'formula' | 'vinculo' | 'texto'
type Valor = number | string | null | { f: string }

const argb = (hex: string) => `FF${hex.replace('#', '').toUpperCase()}`
const AZUL = 'FF1F4E9E'
const VERDE = 'FF2E7D32'
const FONDO_ENTRADA = 'FFF3F7FC'
const FMT = {
  n0: '#,##0',
  n1: '#,##0.0',
  n2: '#,##0.00',
  cop: '"$" #,##0',
  pct: '0.0%',
} as const

class Hoja {
  fila = 1
  constructor(
    public ws: ExcelJS.Worksheet,
    public nombre: string
  ) {}

  /** Referencia absoluta a una celda de esta hoja, para fórmulas de otras hojas. */
  ref(col: string, fila: number) {
    return `'${this.nombre}'!$${col}$${fila}`
  }

  titulo(texto: string, sub?: string) {
    const c = this.ws.getCell(`A${this.fila}`)
    c.value = texto
    c.font = { bold: true, size: 14, color: { argb: argb(palette.print.accent) } }
    this.fila++
    if (sub) {
      const s = this.ws.getCell(`A${this.fila}`)
      s.value = sub
      s.font = { italic: true, size: 9, color: { argb: argb(palette.print.muted) } }
      this.fila++
    }
    this.fila++
  }

  seccion(texto: string) {
    const c = this.ws.getCell(`A${this.fila}`)
    c.value = texto
    c.font = { bold: true, size: 11, color: { argb: argb(palette.print.ink) } }
    this.fila++
  }

  encabezado(cols: string[]) {
    const row = this.ws.getRow(this.fila)
    cols.forEach((t, i) => {
      const c = row.getCell(i + 1)
      c.value = t
      c.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(palette.print.ink) } }
      c.alignment = { vertical: 'middle', wrapText: true, horizontal: i === 0 ? 'left' : 'center' }
    })
    row.height = 28
    this.fila++
  }

  /** Escribe una celda con su estilo según el tipo. */
  celda(col: number, valor: Valor, tipo: Tipo, fmt?: string) {
    const c = this.ws.getRow(this.fila).getCell(col)
    if (valor && typeof valor === 'object') c.value = { formula: valor.f.replace(/^=/, '') } as ExcelJS.CellFormulaValue
    else c.value = valor
    if (fmt) c.numFmt = fmt
    if (tipo === 'entrada') {
      c.font = { color: { argb: AZUL } }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FONDO_ENTRADA } }
    } else if (tipo === 'vinculo') c.font = { color: { argb: VERDE } }
    return c
  }

  /** Fila etiqueta · valor · unidad · nota. Devuelve la referencia absoluta del valor. */
  kv(etiqueta: string, valor: Valor, unidad = '', tipo: Tipo = 'entrada', fmt?: string, nota?: string) {
    this.celda(1, etiqueta, 'texto')
    this.celda(2, valor, tipo, fmt)
    this.celda(3, unidad, 'texto')
    if (nota) {
      const n = this.celda(4, nota, 'texto')
      n.font = { size: 9, color: { argb: argb(palette.print.muted) } }
    }
    const r = this.ref('B', this.fila)
    this.fila++
    return r
  }

  fila_(valores: [Valor, Tipo, string?][]) {
    valores.forEach(([v, t, f], i) => this.celda(i + 1, v, t, f))
    this.fila++
    return this.fila - 1
  }

  total(etiqueta: string, col: number, f: string, fmt: string = FMT.cop) {
    this.celda(1, etiqueta, 'texto').font = { bold: true }
    const c = this.celda(col, { f }, 'formula', fmt)
    c.font = { bold: true }
    const r = this.ref(String.fromCharCode(64 + col), this.fila)
    this.fila++
    return r
  }

  espacio(n = 1) {
    this.fila += n
  }

  anchos(ws: number[]) {
    ws.forEach((w, i) => (this.ws.getColumn(i + 1).width = w))
  }
}

const SI = 'SÍ'
const NO = 'NO'

export async function generarExcelPredial(s: PredialState, r: PredialResultado): Promise<ArrayBuffer> {
  const ExcelJSmod = (await import('exceljs')).default
  const wb = new ExcelJSmod.Workbook()
  wb.creator = 'Keyline Colombia'
  wb.created = new Date()
  wb.calcProperties = { fullCalcOnLoad: true }

  const hoja = (nombre: string, anchos: number[]) => {
    const h = new Hoja(wb.addWorksheet(nombre, { views: [{ showGridLines: false }] }), nombre)
    h.anchos(anchos)
    return h
  }

  const cl = s.clima
  const ag = s.agua
  const ti = s.tierra
  const dep = DEPARTAMENTOS.find((d) => d.nombre === cl.departamento)

  // ── 00 Portada ──
  const h0 = hoja('00 Portada', [36, 46, 12, 50])
  h0.titulo('INFORME TÉCNICO Y COTIZACIÓN — DISEÑO KEYLINE PREDIAL', 'Texto azul = dato de entrada editable · negro = fórmula · verde = vínculo a otra hoja')
  h0.seccion('Empresa')
  const em = s.empresa
  ;(
    [
      ['Nombre comercial', em.nombre],
      ['NIT / C.C.', em.nit],
      ['Responsable técnico', em.responsable],
      ['Teléfono / WhatsApp', em.telefono],
      ['Correo', em.correo],
      ['Sitio web', em.web],
      ['Dirección', [em.direccion, em.ciudad].filter(Boolean).join(', ')],
      ['Validez de la cotización', em.validez],
      ['Fecha', new Date().toLocaleDateString('es-CO')],
    ] as [string, string][]
  ).forEach(([k, v]) => h0.kv(k, v || '—', '', 'entrada'))
  h0.espacio()
  h0.seccion('Predio')
  h0.kv('Finca', s.finca.nombre || '—')
  h0.kv('Propietario / cliente', s.finca.propietario || '—')
  h0.kv('Vereda · municipio', [s.finca.vereda, s.finca.municipio].filter(Boolean).join(' · ') || '—')
  h0.kv('Departamento', cl.departamento)
  h0.kv('Sistema productivo', s.finca.sistema)
  h0.kv('Área total del predio', s.finca.areaHa, 'ha', 'entrada', FMT.n1)
  const AREA_INT = h0.kv('Área a intervenir', s.finca.areaIntervenirHa, 'ha', 'entrada', FMT.n1)
  h0.espacio()
  h0.kv('Aviso', DISCLAIMER_PREDIAL, '', 'texto')

  // ── 01 Clima ──
  const h1 = hoja('01 Clima', [44, 16, 14, 52])
  h1.titulo('CAPA 01 · CLIMA')
  h1.kv('Departamento · unidad fisiográfica', `${cl.departamento} · ${dep?.subzonas[cl.subzona]?.nombre ?? '—'}`, '', 'texto')
  h1.kv('Zona bioclimática', ZONAS[cl.zona as ZonaId]?.nombre ?? cl.zona, '', 'texto')
  h1.kv('Altitud', cl.altitud, 'm s.n.m.', 'entrada', FMT.n0)
  const P = h1.kv('Precipitación media anual', cl.precipAnual, 'mm/año', 'entrada', FMT.n0, 'Estación IDEAM más cercana')
  const MS = h1.kv('Meses secos', cl.mesesSecos, 'mes', 'entrada', FMT.n0)
  const DIAS = h1.kv('Días de época seca', { f: `${MS}*30` }, 'día', 'formula', FMT.n0)
  const FS = h1.kv('Lluvia en meses secos', cl.fraccionSecaPct / 100, '% del mes medio', 'entrada', FMT.pct)
  const PSECA = h1.kv('Lluvia en época seca', { f: `${P}*(${MS}/12)*${FS}` }, 'mm', 'formula', FMT.n0)
  const ETO = h1.kv('ETo de referencia', cl.etoDia, 'mm/día', 'entrada', FMT.n2, 'Cenicafé / FAO-56')
  const EVAP = h1.kv('Evaporación en lámina libre', cl.evaporacionDia, 'mm/día', 'entrada', FMT.n1)
  const PEA = h1.kv('Coef. de precipitación efectiva actual', cl.coefPeActual, '0–1', 'entrada', FMT.n2)
  const PED = h1.kv('Coef. esperado con diseño keyline', cl.coefPeDiseno, '0–1', 'entrada', FMT.n2)
  const PESECA = h1.kv('Lluvia efectiva en época seca', { f: `${PSECA}*${PED}` }, 'mm', 'formula', FMT.n0)
  const RET = h1.kv('Agua adicional infiltrada', { f: `(${PED}-${PEA})*${P}*10` }, 'm³/ha·año', 'formula', FMT.n0)
  h1.kv('En el área a intervenir', { f: `${RET}*${AREA_INT}` }, 'm³/año', 'vinculo', FMT.n0)

  // ── 02 Relieve y estudios ──
  const material = MATERIALES.find((m) => m.id === s.relieve.materialId) ?? MATERIALES[0]
  const h2 = hoja('02 Relieve', [52, 14, 12, 18, 18, 18])
  h2.titulo('CAPA 02 · RELIEVE Y ESTUDIOS PREVIOS')
  h2.kv('Pendiente media', s.relieve.pendientePct / 100, '%', 'entrada', FMT.pct)
  h2.kv('Desnivel del predio', s.relieve.desnivelM, 'm', 'entrada', FMT.n0)
  h2.kv('Forma dominante', s.relieve.forma)
  h2.kv('Material dominante', material.nombre)
  h2.kv('Grupo hidrológico de suelo', s.relieve.grupoHidrologico)
  h2.kv('Puntos clave identificados', s.relieve.puntosClave, 'und', 'entrada', FMT.n0)
  h2.espacio()

  /** Tabla de ítems de costo con fórmulas; devuelve refs de total de obra y de diseño. */
  const tablaCostos = (h: Hoja, capa: CapaCostoId) => {
    h.encabezado(['Ítem', 'Cantidad', 'Unidad', 'Valor unitario COP', 'Subtotal COP', '¿Honorario de diseño?'])
    const ini = h.fila
    for (const f of s.costos[capa]) {
      const fila = h.fila
      h.fila_([
        [f.nombre, 'entrada'],
        [f.cantidad, 'entrada', FMT.n2],
        [f.unidad, 'entrada'],
        [f.precio, 'entrada', FMT.cop],
        [{ f: `B${fila}*D${fila}` }, 'formula', FMT.cop],
        [f.diseno ? SI : NO, 'entrada'],
      ])
    }
    // Filas libres para agregar ítems sin romper las sumas
    for (let k = 0; k < 5; k++) {
      const fila = h.fila
      h.fila_([
        [null, 'entrada'],
        [null, 'entrada', FMT.n2],
        [null, 'entrada'],
        [null, 'entrada', FMT.cop],
        [{ f: `IF(B${fila}*D${fila}=0,"",B${fila}*D${fila})` }, 'formula', FMT.cop],
        [NO, 'entrada'],
      ])
    }
    const fin = h.fila - 1
    h.espacio()
    const obra = h.total('Total de obra de la capa (excluye diseño)', 5, `SUMIF(F${ini}:F${fin},"${NO}",E${ini}:E${fin})`)
    const diseno = h.total('Honorarios de diseño (se cotizan aparte)', 5, `SUMIF(F${ini}:F${fin},"${SI}",E${ini}:E${fin})`)
    return { obra, diseno }
  }

  h2.seccion('Estudios previos')
  const C_EST = tablaCostos(h2, 'estudios')

  // ── 03A Demanda ──
  const h3a = hoja('03A Demanda', [38, 12, 10, 12, 12, 16, 16, 16])
  h3a.titulo('CAPA 03 · AGUA — DEMANDA HÍDRICA', 'Solo se contabiliza el déficit que la lluvia efectiva no cubre.')
  h3a.seccion('A · Demanda agrícola')
  h3a.encabezado(['Cultivo o pastura', 'Área ha', 'Kc', 'Eficiencia de riego (0 = secano)', 'ETc mm/día', 'Déficit época seca mm', 'Bruto época seca m³', 'Bruto anual m³'])
  const a0 = h3a.fila
  for (const c of ag.cultivos) {
    const f = h3a.fila
    h3a.fila_([
      [c.nombre, 'entrada'],
      [c.ha, 'entrada', FMT.n1],
      [c.kc, 'entrada', FMT.n2],
      [c.eficiencia, 'entrada', FMT.n2],
      [{ f: `C${f}*${ETO}` }, 'formula', FMT.n2],
      [{ f: `MAX(0,E${f}*${DIAS}-${PESECA})` }, 'formula', FMT.n0],
      [{ f: `IF(D${f}=0,0,F${f}/D${f}*10*B${f})` }, 'formula', FMT.n0],
      [{ f: `IF(D${f}=0,0,MAX(MAX(0,E${f}*365-${P}*${PED})/D${f}*10*B${f},G${f}))` }, 'formula', FMT.n0],
    ])
  }
  const a1 = h3a.fila - 1
  const AGRI_SECA = h3a.total('Subtotal agrícola · época seca', 7, `SUM(G${a0}:G${a1})`, FMT.n0)
  const AGRI_ANUAL = h3a.total('Subtotal agrícola · anual', 8, `SUM(H${a0}:H${a1})`, FMT.n0)
  h3a.espacio()

  h3a.seccion('B · Demanda pecuaria')
  const FT = h3a.kv('Factor por temperatura', ag.factorTemperatura, '×', 'entrada', FMT.n2, '0,8 (<15 °C) · 1,0 (15–25) · 1,3 (25–32) · 1,6 (>32)')
  const PERDP = h3a.kv('Pérdidas en abrevaderos y conducción', ag.perdidasPecuariaPct / 100, '%', 'entrada', FMT.pct)
  h3a.encabezado(['Especie o categoría', 'Cabezas', 'L/animal·día', 'L/día del grupo', 'm³/día'])
  const b0 = h3a.fila
  for (const a of ag.animales) {
    const f = h3a.fila
    h3a.fila_([
      [a.nombre, 'entrada'],
      [a.cantidad, 'entrada', FMT.n0],
      [a.litrosDia, 'entrada', FMT.n2],
      [{ f: `B${f}*C${f}*${FT}*(1+${PERDP})` }, 'formula', FMT.n0],
      [{ f: `D${f}/1000` }, 'formula', FMT.n2],
    ])
  }
  const b1 = h3a.fila - 1
  const PEC_DIA = h3a.total('Demanda pecuaria', 5, `SUM(E${b0}:E${b1})`, FMT.n2)
  h3a.espacio()

  h3a.seccion('C · Demanda doméstica y de proceso')
  const PERS = h3a.kv('Personas residentes', ag.domestica.personas, 'hab', 'entrada', FMT.n0)
  const DOT = h3a.kv('Dotación neta', ag.domestica.dotacionNeta, 'L/hab·día', 'entrada', FMT.n0)
  const PERDD = h3a.kv('Pérdidas técnicas', ag.domestica.perdidasPct / 100, '%', 'entrada', FMT.pct)
  const PROC = h3a.kv('Usos de proceso', ag.domestica.procesoLDia, 'L/día', 'entrada', FMT.n0)
  const DOM_DIA = h3a.kv('Demanda doméstica', { f: `IF(${PERDD}<1,(${PERS}*${DOT}/(1-${PERDD})+${PROC})/1000,${PROC}/1000)` }, 'm³/día', 'formula', FMT.n2)
  h3a.espacio()

  h3a.seccion('D · Riego de soporte a reforestación')
  const RHA = h3a.kv('Área a establecer', ag.reforestacion.ha, 'ha', 'entrada', FMT.n1)
  const RDEN = h3a.kv('Densidad', ag.reforestacion.densidad, 'árboles/ha', 'entrada', FMT.n0)
  const RL = h3a.kv('Volumen por riego', ag.reforestacion.litrosPorRiego, 'L/árbol', 'entrada', FMT.n1)
  const RN = h3a.kv('Riegos en la época seca', ag.reforestacion.riegos, 'und', 'entrada', FMT.n0)
  const RM = h3a.kv('Mortalidad y resiembra', ag.reforestacion.mortalidadPct / 100, '%', 'entrada', FMT.pct)
  const REF = h3a.kv('Volumen de riego de soporte', { f: `${RHA}*${RDEN}*${RL}*${RN}*(1+${RM})/1000` }, 'm³', 'formula', FMT.n0)
  h3a.espacio()

  h3a.seccion('Resumen de demanda')
  const DEM_ANUAL = h3a.kv('Demanda total anual', { f: `${AGRI_ANUAL}+${PEC_DIA}*365+${DOM_DIA}*365+${REF}` }, 'm³/año', 'formula', FMT.n0)
  const DEM_SECA = h3a.kv('Demanda en época seca', { f: `${AGRI_SECA}+${PEC_DIA}*${DIAS}+${DOM_DIA}*${DIAS}+${REF}` }, 'm³', 'formula', FMT.n0)

  // ── 03B Oferta ──
  const h3b = hoja('03B Oferta', [44, 12, 10, 12, 12, 16])
  h3b.titulo('CAPA 03 · AGUA — OFERTA COSECHABLE', 'Método GUARDAR (Regrarians §2.19): V = 10 · C · A(ha) · P × eficiencia de conducción. C anual de la tabla 2.4.')
  const EFC = h3b.kv('Eficiencia del sistema de conducción', ag.eficienciaConduccion, '0–1', 'entrada', FMT.n2)
  h3b.espacio()
  h3b.encabezado(['Superficie de captación', 'Área', 'Unidad (ha o m²)', 'Área ha', 'Coeficiente C', 'Oferta m³/año'])
  const o0 = h3b.fila
  for (const c of ag.captacion) {
    const f = h3b.fila
    h3b.fila_([
      [SUPERFICIE_GUARDAR_LABEL[c.superficie], 'entrada'],
      [c.area, 'entrada', FMT.n2],
      [c.unidad, 'entrada'],
      [{ f: `IF(C${f}="ha",B${f},B${f}/10000)` }, 'formula', FMT.n2],
      [c.c, 'entrada', FMT.pct],
      [{ f: `10*E${f}*D${f}*${P}*${EFC}` }, 'formula', FMT.n0],
    ])
  }
  const o1 = h3b.fila - 1
  const OFERTA = h3b.total('Oferta cosechable anual', 6, `SUM(F${o0}:F${o1})`, FMT.n0)
  h3b.espacio()
  const FSECA = h3b.kv('Fracción de la oferta captable en época seca', ag.fraccionCaptableSeca, '0–1', 'entrada', FMT.n2)
  const OFERTA_SECA = h3b.kv('Oferta captable en época seca', { f: `${OFERTA}*${FSECA}` }, 'm³', 'formula', FMT.n0)
  h3b.kv('Balance oferta / demanda anual', { f: `IF(${DEM_ANUAL}>0,${OFERTA}/${DEM_ANUAL},0)` }, '×', 'vinculo', FMT.n2)

  // ── 03C Almacenamiento ──
  const tip = TIPOLOGIAS.find((t) => t.id === ag.tipologiaId)
  const fondo = FONDOS[ag.fondoIdx] ?? FONDOS[0]
  const h3c = hoja('03C Almacenamiento', [48, 16, 12, 60])
  h3c.titulo(
    'CAPA 03 · AGUA — DIMENSIONAMIENTO DEL ALMACENAMIENTO',
    'V = (déficit + pérdidas por evaporación e infiltración) × FS. Como las pérdidas dependen del espejo, se usa la forma cerrada V = D·FS / (1 − FS·k), con k = (evap + infiltración)·días / (1000·prof·0,7).'
  )
  h3c.kv('Tipología', tip?.nombre ?? ag.tipologiaId, '', 'texto')
  h3c.kv('Fondo del vaso (sin geomembrana)', fondo.nombre, '', 'texto')
  const INF_FONDO = h3c.kv('Infiltración del fondo', fondo.infiltracion, 'mm/día', 'entrada', FMT.n2, FONDOS.map((f) => `${f.nombre}: ${f.infiltracion}`).join(' · '))
  const IMPER = h3c.kv('¿Impermeabilizar con geomembrana?', ag.impermeabilizar ? SI : NO, 'SÍ / NO', 'entrada')
  const INF = h3c.kv('Infiltración de diseño', { f: `IF(${IMPER}="${SI}",${FONDOS[FONDO_GEOMEMBRANA].infiltracion},${INF_FONDO})` }, 'mm/día', 'formula', FMT.n2)
  const TANQ = h3c.kv('Almacenamiento en tanques', ag.tanquesM3, 'm³', 'entrada', FMT.n0)
  const COB = h3c.kv('Déficit a cubrir con almacenamiento', ag.coberturaDeficitPct / 100, '%', 'entrada', FMT.pct)
  const DEF = h3c.kv('Déficit a cubrir', { f: `MAX(0,${DEM_SECA}-${OFERTA_SECA}-${TANQ})*${COB}` }, 'm³', 'vinculo', FMT.n0)
  const PROF = h3c.kv('Profundidad media', ag.profundidadM, 'm', 'entrada', FMT.n1)
  const FSEG = h3c.kv('Factor de seguridad', ag.factorSeguridad, '×', 'entrada', FMT.n2)
  const K = h3c.kv('k (pérdidas por m³ almacenado en la seca)', { f: `(${EVAP}+${INF})*${DIAS}/(1000*MAX(${PROF},0.5)*${FACTOR_FORMA})` }, '—', 'formula', '0.0000')
  const VREQ = h3c.kv('Volumen útil requerido', { f: `IF(1-${FSEG}*${K}>0,${DEF}*${FSEG}/(1-${FSEG}*${K}),"Pérdidas mayores que el volumen: profundice o impermeabilice")` }, 'm³', 'formula', FMT.n0)
  const VMAN = h3c.kv('Volumen a construir (opcional, deje vacío para usar el requerido)', ag.volumenManualM3, 'm³', 'entrada', FMT.n0)
  const VDIS = h3c.kv('Volumen a construir', { f: `IF(ISNUMBER(${VMAN}),${VMAN},${VREQ})` }, 'm³', 'formula', FMT.n0)
  const ESP = h3c.kv('Espejo de agua', { f: `${VDIS}/(MAX(${PROF},0.5)*${FACTOR_FORMA})` }, 'm²', 'formula', FMT.n0)
  const AVASO = h3c.kv('Área del vaso con taludes', { f: `${ESP}*${FACTOR_AREA_VASO}` }, 'm²', 'formula', FMT.n0)
  h3c.kv('Pérdidas en la época seca', { f: `IF(ISNUMBER(${VREQ}),${K}*${VREQ},0)` }, 'm³', 'formula', FMT.n0)
  const NRES = h3c.kv('Número de reservorios', Math.max(1, ag.reservorios), 'und', 'entrada', FMT.n0)
  h3c.kv('Volumen por reservorio', { f: `${VDIS}/MAX(1,${NRES})` }, 'm³', 'formula', FMT.n0)
  h3c.espacio()
  h3c.seccion('Impermeabilización')
  const pg = ag.preciosGeo ?? { geomembrana: PRECIOS.geomembrana, geotextil: PRECIOS.geotextil, anclaje: PRECIOS.anclaje }
  const PGEO = h3c.kv('Geomembrana HDPE 1,0 mm instalada', pg.geomembrana, 'COP/m²', 'entrada', FMT.cop)
  const PTEX = h3c.kv('Geotextil de protección', pg.geotextil, 'COP/m²', 'entrada', FMT.cop)
  const PANC = h3c.kv('Zanja de anclaje perimetral', pg.anclaje, 'COP/ml', 'entrada', FMT.cop)
  const GEO = h3c.kv('Costo de impermeabilización', { f: `IF(${IMPER}="${SI}",${AVASO}*(${PGEO}+${PTEX})+SQRT(${ESP})*4*${PANC},0)` }, 'COP', 'formula', FMT.cop)

  // ── 03D Movimiento de tierras ──
  const h3d = hoja('03D Mov. tierras', [30, 34, 14, 10, 14, 16, 12, 18])
  h3d.titulo('CAPA 03 · AGUA — MOVIMIENTO DE TIERRAS', 'Mismo modelo de la calculadora de movimiento de tierra del sitio.')
  const RATIO = h3d.kv('Relación corte / almacenado', ti.ratio, 'm³/m³', 'entrada', FMT.n2, tip ? `Rango de la tipología: ${tip.ratioMin}–${tip.ratioMax}` : '')
  const MOV = h3d.kv('Volumen movido', { f: `${VDIS}*${RATIO}` }, 'm³', 'vinculo', FMT.n0)
  const FTER = h3d.kv('Fracción del corte que va a terraplén', ti.fraccionTerraplen, '0–1', 'entrada', FMT.n2)
  const ASEN = h3d.kv('Sobreelevación por asentamiento', ti.asentamientoPct / 100, '%', 'entrada', FMT.pct)
  const TERR = h3d.kv('Terraplén compactado', { f: `${MOV}*${FTER}*(1+${ASEN})` }, 'm³', 'formula', FMT.n0)
  const CONTR = h3d.kv(`Contracción del material (${material.nombre})`, material.contraccion, '0–1', 'entrada', FMT.pct)
  const ESPJ = h3d.kv('Esponjamiento del material', material.esponjamiento, '0–1', 'entrada', FMT.pct)
  const CORTE = h3d.kv('Corte total en banco', { f: `MAX(${MOV},${TERR}*(1+${CONTR}))` }, 'm³', 'formula', FMT.n0)
  h3d.kv('Volumen suelto a transportar', { f: `${CORTE}*(1+${ESPJ})` }, 'm³', 'formula', FMT.n0)
  const DESC_M2 = h3d.kv('Área de descapote', { f: `${AVASO}*${FACTOR_DESCAPOTE}` }, 'm²', 'vinculo', FMT.n0)
  const DESC_E = h3d.kv('Espesor de descapote', ti.espesorDescapoteM, 'm', 'entrada', FMT.n2)
  h3d.kv('Capa vegetal retirada', { f: `${DESC_M2}*${DESC_E}` }, 'm³', 'formula', FMT.n0)
  const ACARREO = h3d.kv('Acarreo interno', { f: `${CORTE}*${FRACCION_ACARREO}` }, 'm³', 'formula', FMT.n0)
  h3d.espacio()
  h3d.seccion('Costos por frente de trabajo')
  h3d.encabezado(['Frente', 'Equipo', 'Cantidad', 'Unidad', 'Rendimiento por hora', 'Tarifa COP/h', 'Horas', 'Costo COP'])
  const cantidadFrente: Record<string, string> = { descapote: DESC_M2, corte: CORTE, terraplen: TERR, acarreo: ACARREO }
  const m0 = h3d.fila
  for (const f of ti.frentes) {
    const fila = h3d.fila
    h3d.fila_([
      [f.rol, 'texto'],
      [f.equipo, 'entrada'],
      [{ f: cantidadFrente[f.id] ?? '0' }, 'vinculo', FMT.n0],
      [f.unidad.split('/')[0], 'texto'],
      [f.rendimiento, 'entrada', FMT.n0],
      [f.tarifa, 'entrada', FMT.cop],
      [{ f: `IF(E${fila}>0,C${fila}/E${fila},0)` }, 'formula', FMT.n1],
      [{ f: `G${fila}*F${fila}` }, 'formula', FMT.cop],
    ])
  }
  const mvF = h3d.fila
  h3d.fila_([
    ['Movilización', 'texto'],
    ['Cama baja ida y regreso', 'texto'],
    [ti.viajes, 'entrada', FMT.n0],
    ['viaje', 'texto'],
    [null, 'texto'],
    [ti.movilizacion, 'entrada', FMT.cop],
    [null, 'texto'],
    [{ f: `C${mvF}*F${mvF}` }, 'formula', FMT.cop],
  ])
  h3d.espacio()
  const DIRECTO = h3d.total('Costo directo', 8, `SUM(H${m0}:H${mvF})`)
  const IND = h3d.kv('Indirectos de obra de tierra', ti.indirectosPct / 100, '%', 'entrada', FMT.pct)
  const TIERRA = h3d.total('TOTAL OBRA DE TIERRA', 8, `${DIRECTO}*(1+${IND})`)
  h3d.kv('Costo por m³ almacenado (incluye geomembrana)', { f: `IF(${VDIS}>0,(${TIERRA}+${GEO})/${VDIS},0)` }, 'COP/m³', 'formula', FMT.cop, 'Rango de referencia en Colombia: 1.200 a 30.000 COP/m³ almacenado')

  // ── Capas de costo 03E–08 ──
  const totales: Partial<Record<CapaCostoId, { obra: string; diseno: string }>> = { estudios: C_EST }
  const hojasCapa: [string, CapaCostoId, string][] = [
    ['03E Obras agua', 'aguaObra', 'CAPA 03 · OBRAS COMPLEMENTARIAS DE AGUA'],
    ['04 Vías', 'vias', 'CAPA 04 · VÍAS DE ACCESO'],
    ['05 Árboles', 'arb', 'CAPA 05 · ÁRBOLES'],
    ['06 Estructuras', 'est', 'CAPA 06 · ESTRUCTURAS'],
    ['07 Subdivisiones', 'sub', 'CAPA 07 · SUBDIVISIONES'],
    ['08 Suelo', 'suelo', 'CAPA 08 · SUELO'],
  ]
  for (const [nombre, capa, titulo] of hojasCapa) {
    const h = hoja(nombre, [52, 14, 12, 20, 20, 20])
    h.titulo(titulo, 'Agregue ítems en las filas vacías: las sumas ya las incluyen.')
    totales[capa] = tablaCostos(h, capa)
  }

  // ── 09 Presupuesto ──
  const h9 = hoja('09 Presupuesto', [10, 50, 22, 12])
  h9.titulo('PRESUPUESTO POR CAPAS DE LA ESCALA DE PERMANENCIA')
  h9.encabezado(['Cap.', 'Capítulo', 'Valor COP', '%'])
  const formulaCapa: Record<string, string> = {
    estudios: totales.estudios!.obra,
    agua: `${TIERRA}+${GEO}+${totales.aguaObra!.obra}`,
    vias: totales.vias!.obra,
    arb: totales.arb!.obra,
    est: totales.est!.obra,
    sub: totales.sub!.obra,
    suelo: totales.suelo!.obra,
  }
  const p0 = h9.fila
  const p1 = p0 + CAPAS.length - 1
  const subFila = p1 + 2
  for (const c of CAPAS) {
    const f = h9.fila
    h9.fila_([
      [c.idx, 'texto'],
      [c.nombre, 'texto'],
      [{ f: formulaCapa[c.k] }, 'vinculo', FMT.cop],
      [{ f: `IF($C$${subFila}>0,C${f}/$C$${subFila},0)` }, 'formula', FMT.pct],
    ])
  }
  h9.espacio()
  h9.celda(2, 'Subtotal de obra', 'texto').font = { bold: true }
  h9.celda(3, { f: `SUM(C${p0}:C${p1})` }, 'formula', FMT.cop).font = { bold: true }
  h9.fila++
  const aiuF = h9.fila
  h9.fila_([
    [null, 'texto'],
    ['AIU (administración, imprevistos y utilidad)', 'texto'],
    [{ f: `C${subFila}*D${aiuF}` }, 'formula', FMT.cop],
    [s.cotizacion.aiuPct / 100, 'entrada', FMT.pct],
  ])
  const contF = h9.fila
  h9.fila_([
    [null, 'texto'],
    ['Contingencia técnica', 'texto'],
    [{ f: `C${subFila}*D${contF}` }, 'formula', FMT.cop],
    [s.cotizacion.contingenciaPct / 100, 'entrada', FMT.pct],
  ])
  const totF = h9.fila
  h9.celda(2, 'TOTAL COTIZADO (sin valor del diseño)', 'texto').font = { bold: true }
  const tc = h9.celda(3, { f: `C${subFila}+C${aiuF}+C${contF}` }, 'formula', FMT.cop)
  tc.font = { bold: true, color: { argb: argb(palette.print.accent) } }
  h9.fila++
  h9.espacio()
  h9.fila_([
    [null, 'texto'],
    ['Honorarios de diseño keyline y estudios — se cotizan por separado', 'texto'],
    [{ f: Object.values(totales).map((t) => t!.diseno).join('+') }, 'vinculo', FMT.cop],
  ])
  h9.fila_([
    [null, 'texto'],
    ['Costo por hectárea intervenida', 'texto'],
    [{ f: `IF(${AREA_INT}>0,C${totF}/${AREA_INT},0)` }, 'vinculo', FMT.cop],
  ])

  // ── 10 Inversión (valores) ──
  const cr = r.cronograma
  const h10 = hoja('10 Inversión', [14, ...cr.items.map(() => 18), 18, 18])
  h10.titulo(
    'CRONOGRAMA DE INVERSIÓN POR SEMESTRES',
    'Valores calculados por el tablero (AIU y contingencia incluidos). No se recalculan aquí: si cambia el presupuesto, vuelva a exportar desde el sitio.'
  )
  h10.kv('Inversión total', cr.total, 'COP', 'texto', FMT.cop)
  h10.kv('Capacidad por semestre', cr.capacidad, 'COP', 'texto', FMT.cop)
  h10.kv('Orden de ejecución', s.inversion.modo === 'escala' ? 'Escala de permanencia' : s.inversion.modo === 'lineal' ? 'Distribución lineal' : 'Carga inicial (60 % el primer año)', '', 'texto')
  h10.kv('Semestres necesarios', cr.semestres.length, '', 'texto', FMT.n0)
  h10.espacio()
  h10.encabezado(['Semestre', ...cr.items.map((i) => i.nombre), 'Total', 'Acumulado'])
  let ac = 0
  cr.semestres.forEach((sem, k) => {
    const t = totalSemestre(sem)
    ac += t
    h10.fila_([[`S${k + 1}`, 'texto'], ...cr.items.map((i) => [sem[i.k] || 0, 'texto', FMT.cop] as [Valor, Tipo, string]), [t, 'texto', FMT.cop], [ac, 'texto', FMT.cop]])
  })

  // ── 11 Fuentes ──
  const h11 = hoja('11 Fuentes', [34, 90, 60])
  h11.titulo('FUENTES Y SUPUESTOS')
  h11.encabezado(['Concepto', 'Cómo se calcula'])
  for (const [k, v] of SUPUESTOS) {
    h11.fila_([
      [k, 'texto'],
      [v, 'texto'],
    ])
    h11.ws.getRow(h11.fila - 1).getCell(2).alignment = { wrapText: true, vertical: 'top' }
  }
  h11.espacio()
  h11.encabezado(['Tema', 'Fuente', 'Enlace'])
  for (const f of FUENTES) for (const [t, url] of f.refs) h11.fila_([[f.tema, 'texto'], [t, 'texto'], [url, 'texto']])
  h11.espacio()
  h11.kv('Advertencia', ADVERTENCIA_APU, '', 'texto')

  return (await wb.xlsx.writeBuffer()) as ArrayBuffer
}

export async function descargarExcelPredial(s: PredialState, r: PredialResultado) {
  const buf = await generarExcelPredial(s, r)
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo('predial', s.finca.nombre || s.finca.propietario).replace(/\.pdf$/, '.xlsx')
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
