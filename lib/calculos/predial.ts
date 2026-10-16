// ── Diseño Keyline Predial — orquestador de cálculo ──
// Función pura: recibe el estado completo del formulario y devuelve todos los
// resultados por capa de la escala de permanencia. No contiene fórmulas
// propias: compone las de clima, demanda, escorrentía, almacenamiento,
// movimiento de tierras e inversión.
import { diasEpocaSeca, lluviaEpocaSecaMm, aguaRetenidaM3Ha } from './clima'
import {
  demandaCultivo,
  demandaPecuariaDiaM3,
  litrosDiaGrupo,
  demandaDomesticaDiaM3,
  demandaReforestacionM3,
  arbolesReforestacion,
  type CultivoResultado,
  type DomesticaInput,
  type ReforestacionInput,
} from './demanda'
import { runoffVolumeM3, type SuperficieGuardar } from './escorrentia'
import { dimensionarAlmacenamiento, espejoM2, areaVasoM2 } from './almacenamiento'
import { movimientoTierra, costoGeomembrana, type MovimientoTierraResultado, type Frente } from './movimientoTierra'
import { cronograma, type Cronograma, type ModoCronograma } from './inversion'

// ── Estado ──
export interface FilaCosto {
  id: string
  nombre: string
  cantidad: number
  unidad: string
  precio: number
  /** Honorario de diseño: se calcula pero se excluye del total cotizado. */
  diseno: boolean
}

export interface FilaCultivo {
  id: string
  nombre: string
  ha: number
  kc: number
  riego: string
  eficiencia: number
}

export interface FilaAnimal {
  id: string
  nombre: string
  cantidad: number
  litrosDia: number
}

export interface FilaCaptacion {
  id: string
  superficie: SuperficieGuardar
  area: number
  unidad: 'ha' | 'm²'
  /** Coeficiente de escorrentía anual (tabla 2.4), 0–1. */
  c: number
}

export interface FrenteEditable extends Frente {
  rol: string
  equipo: string
  unidad: string
}

export type CapaCostoId = 'estudios' | 'aguaObra' | 'vias' | 'arb' | 'est' | 'sub' | 'suelo'

export interface PredialState {
  empresa: {
    nombre: string
    nit: string
    responsable: string
    telefono: string
    correo: string
    web: string
    direccion: string
    ciudad: string
    validez: string
  }
  finca: {
    nombre: string
    propietario: string
    vereda: string
    municipio: string
    areaHa: number
    areaIntervenirHa: number
    sistema: string
  }
  cotizacion: { aiuPct: number; contingenciaPct: number }
  clima: {
    departamento: string
    subzona: number
    altitud: number
    precipAnual: number
    mesesSecos: number
    zona: string
    etoDia: number
    evaporacionDia: number
    /** Lluvia en los meses secos, % del mes medio. */
    fraccionSecaPct: number
    coefPeActual: number
    coefPeDiseno: number
  }
  relieve: {
    pendientePct: number
    desnivelM: number
    forma: string
    materialId: string
    grupoHidrologico: 'A' | 'B' | 'C' | 'D'
    puntosClave: number
  }
  agua: {
    cultivos: FilaCultivo[]
    factorTemperatura: number
    perdidasPecuariaPct: number
    animales: FilaAnimal[]
    domestica: DomesticaInput
    reforestacion: ReforestacionInput
    captacion: FilaCaptacion[]
    eficienciaConduccion: number
    fraccionCaptableSeca: number
    tipologiaId: string
    fondoIdx: number
    profundidadM: number
    coberturaDeficitPct: number
    factorSeguridad: number
    reservorios: number
    /** null = usar el volumen calculado. */
    volumenManualM3: number | null
    impermeabilizar: boolean
    tanquesM3: number
  }
  tierra: {
    ratio: number
    fraccionTerraplen: number
    espesorDescapoteM: number
    asentamientoPct: number
    frentes: FrenteEditable[]
    movilizacion: number
    viajes: number
    indirectosPct: number
  }
  costos: Record<CapaCostoId, FilaCosto[]>
  inversion: {
    /** null = usar el total calculado. */
    totalManual: number | null
    /** null = total / 4 redondeado al millón. */
    capacidad: number | null
    modo: ModoCronograma
  }
}

// ── Capas de la escala de permanencia (capítulos del presupuesto) ──
export type CapaId = 'estudios' | 'agua' | 'vias' | 'arb' | 'est' | 'sub' | 'suelo'

export const CAPAS: { k: CapaId; nombre: string; idx: string }[] = [
  { k: 'estudios', nombre: 'Relieve · estudios', idx: '02' },
  { k: 'agua', nombre: 'Agua', idx: '03' },
  { k: 'vias', nombre: 'Vías de acceso', idx: '04' },
  { k: 'arb', nombre: 'Árboles', idx: '05' },
  { k: 'est', nombre: 'Estructuras', idx: '06' },
  { k: 'sub', nombre: 'Subdivisiones', idx: '07' },
  { k: 'suelo', nombre: 'Suelo', idx: '08' },
]

export const subtotalObra = (filas: FilaCosto[]) => filas.reduce((s, r) => s + (r.diseno ? 0 : r.cantidad * r.precio), 0)
export const subtotalDiseno = (filas: FilaCosto[]) => filas.reduce((s, r) => s + (r.diseno ? r.cantidad * r.precio : 0), 0)

// ── Resultado ──
export interface PredialCatalogos {
  fondos: { infiltracion: number }[]
  fondoGeomembrana: number
  materiales: { id: string; esponjamiento: number; contraccion: number }[]
  precios: { geomembrana: number; geotextil: number; anclaje: number }
}

export interface PredialResultado {
  dias: number
  pSecaMm: number
  peSecaMm: number
  aguaRetenidaM3Ha: number
  aguaRetenidaFincaM3: number
  cultivos: (FilaCultivo & CultivoResultado)[]
  dAgriSeca: number
  dAgriAnual: number
  animales: (FilaAnimal & { litrosDiaTotal: number })[]
  dPecDia: number
  dPecSeca: number
  dPecAnual: number
  dDomDia: number
  dDomSeca: number
  dDomAnual: number
  arboles: number
  dRef: number
  demandaAnual: number
  demandaSeca: number
  captacion: (FilaCaptacion & { m2: number; ofertaM3: number })[]
  oferta: number
  ofertaSeca: number
  balance: number
  infiltracion: number
  deficitSeca: number
  volumenRequerido: number
  volumenDiseno: number
  espejo: number
  espejoDiseno: number
  areaVaso: number
  perdidas: number
  perdidasPct: number
  tierra: MovimientoTierraResultado
  costoGeo: number
  copM3Almacenado: number
  capas: Record<CapaId, number>
  diseno: number
  subtotal: number
  aiu: number
  contingencia: number
  total: number
  copHa: number
  cronograma: Cronograma
}

export function calcPredial(s: PredialState, cat: PredialCatalogos): PredialResultado {
  const { clima, agua } = s
  const dias = diasEpocaSeca(clima.mesesSecos)

  // Clima
  const pSecaMm = lluviaEpocaSecaMm(clima.precipAnual, clima.mesesSecos, clima.fraccionSecaPct / 100)
  const peSecaMm = pSecaMm * clima.coefPeDiseno
  const retenida = aguaRetenidaM3Ha(clima.coefPeActual, clima.coefPeDiseno, clima.precipAnual)

  // A · Agrícola
  const ctx = {
    etoDia: clima.etoDia,
    diasSecos: dias,
    pEfectivaSecaMm: peSecaMm,
    precipAnualMm: clima.precipAnual,
    coefPeDiseno: clima.coefPeDiseno,
  }
  const cultivos = agua.cultivos.map((c) => ({ ...c, ...demandaCultivo(c, ctx) }))
  const dAgriSeca = cultivos.reduce((a, c) => a + c.brutoSecaM3, 0)
  const dAgriAnual = cultivos.reduce((a, c) => a + c.brutoAnualM3, 0)

  // B · Pecuaria
  const opPec = { factorTemperatura: agua.factorTemperatura, perdidasPct: agua.perdidasPecuariaPct }
  const animales = agua.animales.map((a) => ({ ...a, litrosDiaTotal: litrosDiaGrupo(a, opPec) }))
  const dPecDia = demandaPecuariaDiaM3(agua.animales, opPec)

  // C · Doméstica · D · Reforestación
  const dDomDia = demandaDomesticaDiaM3(agua.domestica)
  const dRef = demandaReforestacionM3(agua.reforestacion)

  const demandaAnual = dAgriAnual + dPecDia * 365 + dDomDia * 365 + dRef
  const demandaSeca = dAgriSeca + dPecDia * dias + dDomDia * dias + dRef

  // E · Oferta cosechable — método oficial GUARDAR: V = 10 · C · A(ha) · P
  const captacion = agua.captacion.map((r) => {
    const m2 = r.unidad === 'ha' ? r.area * 10000 : r.area
    const ofertaM3 = runoffVolumeM3(r.c, m2 / 10000, clima.precipAnual) * agua.eficienciaConduccion
    return { ...r, m2, ofertaM3 }
  })
  const oferta = captacion.reduce((a, r) => a + r.ofertaM3, 0)
  const ofertaSeca = oferta * agua.fraccionCaptableSeca
  const balance = demandaAnual > 0 ? oferta / demandaAnual : 0

  // F · Almacenamiento
  const infiltracion = agua.impermeabilizar
    ? cat.fondos[cat.fondoGeomembrana].infiltracion
    : (cat.fondos[agua.fondoIdx] ?? cat.fondos[0]).infiltracion
  const deficitSeca = Math.max(0, demandaSeca - ofertaSeca - agua.tanquesM3) * (agua.coberturaDeficitPct / 100)
  const alm = dimensionarAlmacenamiento({
    deficitM3: deficitSeca,
    evaporacionMmDia: clima.evaporacionDia,
    infiltracionMmDia: infiltracion,
    diasSecos: dias,
    profundidadM: agua.profundidadM,
    factorSeguridad: agua.factorSeguridad,
  })
  const volumenDiseno = agua.volumenManualM3 ?? alm.volumenUtilM3
  const espejoDiseno = espejoM2(volumenDiseno, agua.profundidadM)
  const areaVaso = areaVasoM2(espejoDiseno)

  // G · Movimiento de tierras
  const material = cat.materiales.find((m) => m.id === s.relieve.materialId) ?? cat.materiales[0]
  const tierra = movimientoTierra({
    volumenAlmacenadoM3: volumenDiseno,
    ratioCorte: s.tierra.ratio,
    material,
    profundidadM: agua.profundidadM,
    fraccionTerraplen: s.tierra.fraccionTerraplen,
    asentamientoPct: s.tierra.asentamientoPct,
    espesorDescapoteM: s.tierra.espesorDescapoteM,
    frentes: s.tierra.frentes,
    movilizacionCOP: s.tierra.movilizacion,
    viajes: s.tierra.viajes,
    indirectosPct: s.tierra.indirectosPct,
  })
  const costoGeo = agua.impermeabilizar ? costoGeomembrana(areaVaso, espejoDiseno, cat.precios) : 0
  const copM3Almacenado = volumenDiseno > 0 ? (tierra.costoTotal + costoGeo) / volumenDiseno : 0

  // Costos por capa
  const c = s.costos
  const capas: Record<CapaId, number> = {
    estudios: subtotalObra(c.estudios),
    agua: tierra.costoTotal + costoGeo + subtotalObra(c.aguaObra),
    vias: subtotalObra(c.vias),
    arb: subtotalObra(c.arb),
    est: subtotalObra(c.est),
    sub: subtotalObra(c.sub),
    suelo: subtotalObra(c.suelo),
  }
  const diseno = (Object.keys(c) as CapaCostoId[]).reduce((a, k) => a + subtotalDiseno(c[k]), 0)
  const subtotal = CAPAS.reduce((a, k) => a + capas[k.k], 0)
  const aiu = subtotal * (s.cotizacion.aiuPct / 100)
  const contingencia = subtotal * (s.cotizacion.contingenciaPct / 100)
  const total = subtotal + aiu + contingencia
  const haInt = s.finca.areaIntervenirHa

  // Cronograma: si el usuario fija otro total, se escala proporcionalmente.
  const totalUsuario = s.inversion.totalManual && s.inversion.totalManual > 0 ? s.inversion.totalManual : total
  const escala = total > 0 ? totalUsuario / total : 1
  const factor = (1 + s.cotizacion.aiuPct / 100 + s.cotizacion.contingenciaPct / 100) * escala
  const capacidad = s.inversion.capacidad ?? (Math.round(total / 4 / 1e6) * 1e6 || 10_000_000)
  const crono = cronograma(
    CAPAS.map((k) => ({ k: k.k, nombre: k.nombre, valor: capas[k.k] * factor })),
    capacidad,
    s.inversion.modo
  )

  return {
    dias,
    pSecaMm,
    peSecaMm,
    aguaRetenidaM3Ha: retenida,
    aguaRetenidaFincaM3: retenida * haInt,
    cultivos,
    dAgriSeca,
    dAgriAnual,
    animales,
    dPecDia,
    dPecSeca: dPecDia * dias,
    dPecAnual: dPecDia * 365,
    dDomDia,
    dDomSeca: dDomDia * dias,
    dDomAnual: dDomDia * 365,
    arboles: arbolesReforestacion(agua.reforestacion),
    dRef,
    demandaAnual,
    demandaSeca,
    captacion,
    oferta,
    ofertaSeca,
    balance,
    infiltracion,
    deficitSeca,
    volumenRequerido: alm.volumenUtilM3,
    volumenDiseno,
    espejo: alm.espejoM2,
    espejoDiseno,
    areaVaso,
    perdidas: alm.perdidasM3,
    perdidasPct: alm.perdidasPct,
    tierra,
    costoGeo,
    copM3Almacenado,
    capas,
    diseno,
    subtotal,
    aiu,
    contingencia,
    total,
    copHa: haInt > 0 ? total / haInt : 0,
    cronograma: crono,
  }
}
