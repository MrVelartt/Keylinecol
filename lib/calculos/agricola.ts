// ── Demanda hídrica agrícola (balance de riego mensual) ──
// Método del estudio "Climatología e hidrología — Finca Alma Luz" (revisión
// 17-oct-2026), generalizado para cualquier lugar:
//
//   ETc          = Kc × ETo                       (mm/mes, por cultivo)
//   Req. neto    = máx(0; ETc − Pe)               (mm/mes)
//   Vol. neto    = Req. neto × área × 10          (m³; área en ha)
//   Vol. bruto   = Vol. neto / eficiencia de riego
//   Vol. diseño  = Vol. bruto × factor de seguridad
//   Oferta       = 10 · C · A_captación · P       (GUARDAR, método oficial del sitio)
//
// La ETo puede estimarse en cualquier latitud con Hargreaves-Samani (FAO-56
// ec. 52) cuando no hay datos de estación.

export type MetodoPe = 'porcentaje' | 'usda-scs'

export interface CultivoAgricola {
  nombre: string
  ha: number
  kc: number
}

export interface AgricolaInput {
  /** Lluvia mensual de diseño (mm), Ene → Dic. */
  p: readonly number[]
  /** ETo mensual (mm), Ene → Dic. */
  eto: readonly number[]
  cultivos: readonly CultivoAgricola[]
  metodoPe: MetodoPe
  /** Lluvia efectiva como fracción de P (0–1), con el método 'porcentaje'. */
  pePct: number
  /** Eficiencia de aplicación del riego (0–1). */
  eficiencia: number
  factorSeguridad: number
  /** Área que aporta escorrentía al almacenamiento (ha). */
  captacionHa: number
  /** Coeficiente de escorrentía (0–1). */
  c: number
}

export interface AgricolaMes {
  mes: number
  p: number
  eto: number
  pe: number
  etc: number // mm, ponderado por área
  reqNetoMm: number // mm, ponderado por área
  volNeto: number
  volBruto: number
  volDiseno: number
  oferta: number
  balance: number // oferta − demanda de diseño
}

export interface AgricolaResultado {
  meses: AgricolaMes[]
  areaHa: number
  volNeto: number
  volBruto: number
  volDiseno: number
  oferta: number
  deficit: number
  cobertura: number // oferta / demanda (0–1)
  mesesConRiego: number
  /** Mayor volumen de diseño en 3 meses consecutivos (m³): guía para almacenamiento. */
  trimestreCritico: { inicio: number; volumen: number }
  /**
   * Volumen a almacenar para trasladar excedentes a los meses de déficit (m³).
   * Si la oferta anual cubre la demanda: pico secuencial (mayor déficit
   * acumulado del ciclo anual). Si no la cubre: solo se puede guardar el
   * excedente de los meses con superávit.
   */
  almacenamiento: number
}

/** Lluvia efectiva mensual, USDA-SCS (método usado por CROPWAT). */
export function peUsdaScs(p: number): number {
  if (p <= 0) return 0
  return p <= 250 ? (p * (125 - 0.2 * p)) / 125 : 125 + 0.1 * p
}

export function lluviaEfectiva(p: number, metodo: MetodoPe, pct: number): number {
  return metodo === 'usda-scs' ? peUsdaScs(p) : Math.max(0, p * pct)
}

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0)

export function demandaAgricola(i: AgricolaInput): AgricolaResultado {
  const areaHa = sum(i.cultivos.map((c) => Math.max(0, c.ha)))
  const ef = i.eficiencia > 0 ? i.eficiencia : 1

  const meses: AgricolaMes[] = i.p.map((p, m) => {
    const eto = i.eto[m] ?? 0
    const pe = lluviaEfectiva(p, i.metodoPe, i.pePct)
    let volNeto = 0
    let etcVol = 0
    for (const c of i.cultivos) {
      const etc = c.kc * eto
      etcVol += etc * c.ha * 10
      volNeto += Math.max(0, etc - pe) * c.ha * 10
    }
    const volBruto = volNeto / ef
    const volDiseno = volBruto * i.factorSeguridad
    const oferta = 10 * i.c * i.captacionHa * p
    return {
      mes: m,
      p,
      eto,
      pe,
      etc: areaHa > 0 ? etcVol / (areaHa * 10) : 0,
      reqNetoMm: areaHa > 0 ? volNeto / (areaHa * 10) : 0,
      volNeto,
      volBruto,
      volDiseno,
      oferta,
      balance: oferta - volDiseno,
    }
  })

  const volDiseno = sum(meses.map((m) => m.volDiseno))
  const oferta = sum(meses.map((m) => m.oferta))

  // Trimestre crítico (ventana circular de 3 meses)
  let trimestreCritico = { inicio: 0, volumen: 0 }
  for (let k = 0; k < 12; k++) {
    const v = meses[k].volDiseno + meses[(k + 1) % 12].volDiseno + meses[(k + 2) % 12].volDiseno
    if (v > trimestreCritico.volumen) trimestreCritico = { inicio: k, volumen: v }
  }

  let almacenamiento = 0
  if (oferta >= volDiseno) {
    // Pico secuencial sobre dos ciclos (la estación seca puede cruzar dic–ene).
    let acum = 0
    for (let k = 0; k < 24; k++) {
      acum = Math.min(0, acum + meses[k % 12].balance)
      almacenamiento = Math.max(almacenamiento, -acum)
    }
  } else {
    almacenamiento = sum(meses.map((m) => Math.max(0, m.balance)))
  }

  return {
    meses,
    areaHa,
    volNeto: sum(meses.map((m) => m.volNeto)),
    volBruto: sum(meses.map((m) => m.volBruto)),
    volDiseno,
    oferta,
    deficit: Math.max(0, volDiseno - oferta),
    cobertura: volDiseno > 0 ? oferta / volDiseno : 1,
    mesesConRiego: meses.filter((m) => m.volNeto > 0).length,
    trimestreCritico,
    almacenamiento,
  }
}

// ── ETo por Hargreaves-Samani (FAO-56, ec. 52) ──
// Sirve en cualquier latitud con solo temperaturas. Tiende a sobrestimar en
// clima húmedo y subestimar con viento fuerte: preferir Penman-Monteith o
// la ETo de una estación cuando exista.

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const DIA_MEDIO = [17, 47, 75, 105, 135, 162, 198, 228, 258, 288, 318, 344]

/** Radiación extraterrestre Ra (MJ/m²·día), FAO-56 ec. 21. */
export function radiacionExtraterrestre(latitudDeg: number, diaJuliano: number): number {
  const phi = (latitudDeg * Math.PI) / 180
  const dr = 1 + 0.033 * Math.cos(((2 * Math.PI) / 365) * diaJuliano)
  const delta = 0.409 * Math.sin(((2 * Math.PI) / 365) * diaJuliano - 1.39)
  const ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(delta))))
  return ((24 * 60) / Math.PI) * 0.082 * dr * (ws * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(ws))
}

/** ETo mensual (mm/mes) por Hargreaves a partir de Tmáx y Tmín medias (°C). */
export function etoHargreavesMensual(latitudDeg: number, tmax: readonly number[], tmin: readonly number[]): number[] {
  return DIA_MEDIO.map((d, m) => {
    const tx = tmax[m] ?? tmax[0]
    const tn = tmin[m] ?? tmin[0]
    const ra = radiacionExtraterrestre(latitudDeg, d) * 0.408 // → mm/día
    const etoDia = 0.0023 * ra * ((tx + tn) / 2 + 17.8) * Math.sqrt(Math.max(0, tx - tn))
    return etoDia * DIAS_MES[m]
  })
}

export { DIAS_MES }
