// ── Movimiento de tierras — modelo único del sitio ──
// Lo usan la calculadora "Movimiento de tierra" (vista simplificada) y la capa
// 03·G de Diseño Keyline Predial (vista completa).
//
//   V movido     = V almacenado × relación corte/almacenado (tipología)
//   Terraplén    = V movido × fracción a terraplén × (1 + asentamiento)
//   Corte banco  = máx(V movido, terraplén × (1 + contracción del material))
//   V suelto     = corte × (1 + esponjamiento del material)
//   Descapote    = área del vaso × 1,3 (m²) × espesor (m³)
//   Acarreo      = corte × 0,35
//   Costo        = Σ (cantidad / rendimiento × tarifa) por frente
//                  + movilización, × (1 + indirectos)
import { areaVasoM2, espejoM2 } from './almacenamiento'

export interface MaterialSuelo {
  esponjamiento: number
  contraccion: number
}

export interface Frente {
  id: 'descapote' | 'corte' | 'terraplen' | 'acarreo'
  tarifa: number // COP/h
  rendimiento: number // m²/h (descapote) o m³/h
}

export interface MovimientoTierraInput {
  volumenAlmacenadoM3: number
  ratioCorte: number
  material: MaterialSuelo
  /** Profundidad media del vaso (m) — define espejo y área de descapote. */
  profundidadM: number
  fraccionTerraplen: number
  asentamientoPct: number
  espesorDescapoteM: number
  frentes: Frente[]
  movilizacionCOP: number
  viajes: number
  indirectosPct: number
}

export interface FrenteResultado extends Frente {
  cantidad: number
  horas: number
  costo: number
}

export interface MovimientoTierraResultado {
  volumenMovidoM3: number
  terraplenM3: number
  corteM3: number
  sueltoM3: number
  descapoteM2: number
  descapoteM3: number
  acarreoM3: number
  areaVasoM2: number
  frentes: FrenteResultado[]
  horasTotales: number
  costoMaquinaria: number
  costoMovilizacion: number
  costoDirecto: number
  costoIndirectos: number
  costoTotal: number
  copM3Movido: number
  copM3Almacenado: number
}

export const FACTOR_DESCAPOTE = 1.3
export const FRACCION_ACARREO = 0.35

export function movimientoTierra(i: MovimientoTierraInput): MovimientoTierraResultado {
  const volumenMovidoM3 = i.volumenAlmacenadoM3 * i.ratioCorte
  const terraplenM3 = volumenMovidoM3 * i.fraccionTerraplen * (1 + i.asentamientoPct / 100)
  const corteM3 = Math.max(volumenMovidoM3, terraplenM3 * (1 + i.material.contraccion))
  const sueltoM3 = corteM3 * (1 + i.material.esponjamiento)
  const area = areaVasoM2(espejoM2(i.volumenAlmacenadoM3, i.profundidadM))
  const descapoteM2 = area * FACTOR_DESCAPOTE
  const descapoteM3 = descapoteM2 * i.espesorDescapoteM
  const acarreoM3 = corteM3 * FRACCION_ACARREO

  const cantidades: Record<Frente['id'], number> = {
    descapote: descapoteM2,
    corte: corteM3,
    terraplen: terraplenM3,
    acarreo: acarreoM3,
  }
  const frentes = i.frentes.map((f) => {
    const cantidad = cantidades[f.id] ?? 0
    const horas = f.rendimiento > 0 ? cantidad / f.rendimiento : 0
    return { ...f, cantidad, horas, costo: horas * f.tarifa }
  })

  const costoMaquinaria = frentes.reduce((s, f) => s + f.costo, 0)
  const costoMovilizacion = i.movilizacionCOP * i.viajes
  const costoDirecto = costoMaquinaria + costoMovilizacion
  const costoIndirectos = costoDirecto * (i.indirectosPct / 100)
  const costoTotal = costoDirecto + costoIndirectos

  return {
    volumenMovidoM3,
    terraplenM3,
    corteM3,
    sueltoM3,
    descapoteM2,
    descapoteM3,
    acarreoM3,
    areaVasoM2: area,
    frentes,
    horasTotales: frentes.reduce((s, f) => s + f.horas, 0),
    costoMaquinaria,
    costoMovilizacion,
    costoDirecto,
    costoIndirectos,
    costoTotal,
    copM3Movido: corteM3 > 0 ? costoTotal / corteM3 : 0,
    copM3Almacenado: i.volumenAlmacenadoM3 > 0 ? costoTotal / i.volumenAlmacenadoM3 : 0,
  }
}

/** Costo de impermeabilizar el vaso con geomembrana + geotextil + anclaje perimetral. */
export function costoGeomembrana(
  areaVaso: number,
  espejo: number,
  precios: { geomembrana: number; geotextil: number; anclaje: number }
): number {
  return areaVaso * (precios.geomembrana + precios.geotextil) + Math.sqrt(espejo) * 4 * precios.anclaje
}
