import { describe, expect, it } from 'vitest'
import { demandaPecuariaDiaM3, volumenAutonomiaM3, demandaCultivo, demandaDomesticaDiaM3, demandaReforestacionM3 } from './demanda'
import { movimientoTierra } from './movimientoTierra'
import { dimensionarAlmacenamiento, espejoM2 } from './almacenamiento'
import { runoffVolumeM3, bandaFromClimate, annualCRange, rationalPeakFlowM3s } from './escorrentia'
import { balanceHidrico } from './balance'
import { cronograma, totalSemestre } from './inversion'
import { etoPorAltitud, lluviaEpocaSecaMm } from './clima'
import { calcPredial } from './predial'
import { estadoInicialPredial } from '../../data/catalogos/predial'
import { FONDOS, FONDO_GEOMEMBRANA, MATERIALES, MAQUINARIA } from '../../data/catalogos/obra'
import { ZONAS } from '../../data/catalogos/clima'
import { PRECIOS } from '../../data/catalogos/precios'
import { baranoa } from '../../data/proyectos/baranoa'
import { demandaAgricola, etoHargreavesMensual, peUsdaScs } from './agricola'

const cat = { fondos: FONDOS, fondoGeomembrana: FONDO_GEOMEMBRANA, materiales: MATERIALES, precios: PRECIOS }

describe('demanda', () => {
  it('pecuaria sin factores reproduce el módulo 01 (n × L × días)', () => {
    const dia = demandaPecuariaDiaM3([{ cantidad: 100, litrosDia: 50 }])
    expect(dia).toBeCloseTo(5)
    expect(volumenAutonomiaM3(dia, 30)).toBeCloseTo(150)
  })

  it('pecuaria aplica factor de temperatura y pérdidas', () => {
    const dia = demandaPecuariaDiaM3([{ cantidad: 100, litrosDia: 50 }], { factorTemperatura: 1.3, perdidasPct: 10 })
    expect(dia).toBeCloseTo(5 * 1.3 * 1.1)
  })

  it('agrícola: secano no demanda riego; déficit dividido por eficiencia', () => {
    const ctx = { etoDia: 4, diasSecos: 120, pEfectivaSecaMm: 80, precipAnualMm: 1000, coefPeDiseno: 0.8 }
    expect(demandaCultivo({ ha: 10, kc: 1, eficiencia: 0 }, ctx).brutoSecaM3).toBe(0)
    const r = demandaCultivo({ ha: 10, kc: 1, eficiencia: 0.8 }, ctx)
    expect(r.deficitSecaMm).toBeCloseTo(4 * 120 - 80)
    expect(r.brutoSecaM3).toBeCloseTo((400 / 0.8) * 10 * 10)
    expect(r.brutoAnualM3).toBeGreaterThanOrEqual(r.brutoSecaM3)
  })

  it('doméstica y reforestación', () => {
    expect(demandaDomesticaDiaM3({ personas: 5, dotacionNeta: 130, perdidasPct: 25, procesoLDia: 300 })).toBeCloseTo(
      (5 * (130 / 0.75) + 300) / 1000
    )
    expect(demandaReforestacionM3({ ha: 5, densidad: 1111, litrosPorRiego: 8, riegos: 10, mortalidadPct: 15 })).toBeCloseTo(
      (5555 * 8 * 10 * 1.15) / 1000
    )
  })
})

describe('movimiento de tierras (modelo único)', () => {
  const base = {
    volumenAlmacenadoM3: 4000,
    material: MATERIALES[0], // arcilla densa
    profundidadM: 3.5,
    fraccionTerraplen: 0.45,
    asentamientoPct: 10,
    espesorDescapoteM: 0.25,
    frentes: MAQUINARIA,
    movilizacionCOP: 3_000_000,
    viajes: 2,
    indirectosPct: 25,
  }

  it('jagüey de 4.000 m³ coincide con el prototipo de referencia', () => {
    const r = movimientoTierra({ ...base, ratioCorte: 1.15 })
    expect(r.volumenMovidoM3).toBeCloseTo(4600)
    expect(r.terraplenM3).toBeCloseTo(4600 * 0.45 * 1.1)
    expect(r.corteM3).toBeCloseTo(4600)
    expect(r.sueltoM3).toBeCloseTo(4600 * 1.36)
    expect(Math.round(r.costoTotal)).toBe(40_683_912)
  })

  it('la contracción manda cuando el terraplén necesita más corte del que se excava', () => {
    const r = movimientoTierra({ ...base, ratioCorte: 0.26, fraccionTerraplen: 1, asentamientoPct: 10 })
    expect(r.corteM3).toBeCloseTo(r.terraplenM3 * 1.25)
  })

  it('costo = (maquinaria + movilización) × (1 + indirectos)', () => {
    const r = movimientoTierra({ ...base, ratioCorte: 0.7 })
    expect(r.costoTotal).toBeCloseTo((r.costoMaquinaria + 6_000_000) * 1.25)
    expect(r.copM3Almacenado).toBeCloseTo(r.costoTotal / 4000)
  })
})

describe('almacenamiento', () => {
  it('sin pérdidas, V = déficit × factor de seguridad', () => {
    const r = dimensionarAlmacenamiento({
      deficitM3: 1000,
      evaporacionMmDia: 0,
      infiltracionMmDia: 0,
      diasSecos: 120,
      profundidadM: 3,
      factorSeguridad: 1.2,
    })
    expect(r.volumenUtilM3).toBeCloseTo(1200)
    expect(r.espejoM2).toBeCloseTo(espejoM2(1000 * 1.2 ** 23 > 0 ? 1200 : 0, 3), 0)
  })

  it('las pérdidas aumentan el volumen y convergen', () => {
    const r = dimensionarAlmacenamiento({
      deficitM3: 1000,
      evaporacionMmDia: 4,
      infiltracionMmDia: 1.5,
      diasSecos: 120,
      profundidadM: 3.5,
      factorSeguridad: 1.2,
    })
    expect(r.volumenUtilM3).toBeGreaterThan(1200)
    expect(r.volumenUtilM3).toBeCloseTo((1000 + r.perdidasM3) * 1.2, 0)
  })
})

describe('escorrentía y balance (método oficial)', () => {
  it('GUARDAR: V = 10 · C · A · P', () => {
    expect(runoffVolumeM3(0.0875, 28, 751.9)).toBeCloseTo(18_421.55, 1)
  })

  it('EVACUAR: Q = C · A · i / 360', () => {
    expect(rationalPeakFlowM3s(0.5, 36, 100)).toBeCloseTo(5)
  })

  it('banda de la tabla 2.3 desde clima', () => {
    expect(bandaFromClimate(751.9, 1747.2)).toBe('500-899-evapAlta')
    expect(bandaFromClimate(1200, 900)).toBe('mas1100')
    expect(annualCRange('500-899-evapAlta', '8de10', 'arcilla_arenosa')).toEqual([0.05, 0.125])
  })

  it('Baranoa: /analitica y /herramientas comparten una sola cifra', () => {
    const b = balanceHidrico({
      areaHa: baranoa.areaHa,
      precipAnualMm: baranoa.kpis.precipMmYear,
      etoAnualMm: baranoa.kpis.etoMmYear,
      cAnual: baranoa.runoff.cAnual,
      precipShape: baranoa.monthlyPrecipAvg,
      etoShape: baranoa.monthlyEtoAvg,
    })
    expect(Math.round(b.escorrentiaM3)).toBe(baranoa.kpis.runoffM3Year)
    // Datos corregidos del estudio Finca Alma Luz (17-oct-2026)
    expect(baranoa.kpis.precipMmYear).toBeCloseTo(1253.3, 1)
    expect(baranoa.kpis.etoMmYear).toBeCloseTo(1637.5, 1)
    expect(baranoa.runoff.banda).toBe('mas1100')
    const sumaMensual = b.meses.reduce((s, m) => s + m.escorrentiaM3, 0)
    expect(sumaMensual).toBeCloseTo(b.escorrentiaM3)
  })
})

describe('clima', () => {
  it('regresión de Cenicafé acotada al rango de la zona', () => {
    expect(etoPorAltitud(2600, ZONAS.fri)).toBeCloseTo(Math.min(Math.max(4.37 * Math.exp(-0.52), 2.4), 2.9))
    expect(etoPorAltitud(40, ZONAS.cs)).toBe(5)
  })
  it('lluvia en época seca', () => {
    expect(lluviaEpocaSecaMm(1200, 4, 0.25)).toBeCloseTo(100)
  })
})

describe('inversión', () => {
  const items = [
    { k: 'a', nombre: 'A', valor: 50e6 },
    { k: 'b', nombre: 'B', valor: 30e6 },
  ]
  it.each(['escala', 'lineal', 'carga-inicial'] as const)('modo %s reparte el total completo', (modo) => {
    const c = cronograma(items, 20e6, modo)
    const suma = c.semestres.reduce((s, x) => s + totalSemestre(x), 0)
    expect(suma).toBeCloseTo(80e6, -1)
  })
  it('escala respeta el tope por semestre y el orden de capas', () => {
    const c = cronograma(items, 20e6, 'escala')
    expect(c.semestres).toHaveLength(4)
    expect(c.semestres[0]).toEqual({ a: 20e6 })
    expect(c.semestres[2]).toEqual({ a: 10e6, b: 10e6 })
  })
})

describe('Diseño Keyline Predial', () => {
  it('el total cotizado es subtotal × (1 + AIU + contingencia) y excluye el diseño', () => {
    const s = estadoInicialPredial()
    const r = calcPredial(s, cat)
    expect(r.total).toBeCloseTo(r.subtotal * 1.28)
    expect(r.diseno).toBeCloseTo(50 * PRECIOS.topografia + PRECIOS.disenoKeyline)
    expect(r.capas.estudios).toBeCloseTo(6 * PRECIOS.suelos + PRECIOS.geotecnia)
  })

  it('la oferta cosechable usa el método GUARDAR', () => {
    const s = estadoInicialPredial()
    const r = calcPredial(s, cat)
    const esperado = s.agua.captacion.reduce((acc, c) => {
      const ha = c.unidad === 'ha' ? c.area : c.area / 10000
      return acc + 10 * c.c * ha * s.clima.precipAnual * s.agua.eficienciaConduccion
    }, 0)
    expect(r.oferta).toBeCloseTo(esperado)
  })

  it('el movimiento de tierras de Predial es el mismo modelo de la calculadora', () => {
    const s = estadoInicialPredial()
    const r = calcPredial(s, cat)
    const directo = movimientoTierra({
      volumenAlmacenadoM3: r.volumenDiseno,
      ratioCorte: s.tierra.ratio,
      material: MATERIALES[0],
      profundidadM: s.agua.profundidadM,
      fraccionTerraplen: s.tierra.fraccionTerraplen,
      asentamientoPct: s.tierra.asentamientoPct,
      espesorDescapoteM: s.tierra.espesorDescapoteM,
      frentes: s.tierra.frentes,
      movilizacionCOP: s.tierra.movilizacion,
      viajes: s.tierra.viajes,
      indirectosPct: s.tierra.indirectosPct,
    })
    expect(r.tierra.costoTotal).toBeCloseTo(directo.costoTotal)
  })

  it('el cronograma suma el total', () => {
    const r = calcPredial(estadoInicialPredial(), cat)
    const suma = r.cronograma.semestres.reduce((s, x) => s + totalSemestre(x), 0)
    expect(suma).toBeCloseTo(r.total, -2)
  })
})

describe('demanda hídrica agrícola (estudio Finca Alma Luz)', () => {
  const base = {
    eto: baranoa.monthlyEtoAvg,
    metodoPe: 'porcentaje' as const,
    eficiencia: 0.75,
    captacionHa: 44.9233,
    c: 0,
  }
  // Escenarios de la hoja «Balance hídrico» del Excel corregido
  it('crítico: P80, Pe 30 %, Kc 1,0, FS 1,2 → 367.451 m³', () => {
    const r = demandaAgricola({ ...base, p: baranoa.monthlyPrecipP80!, cultivos: [{ nombre: 'Pasturas', ha: 16.22, kc: 1 }], pePct: 0.3, factorSeguridad: 1.2 })
    expect(r.volDiseno).toBeCloseTo(367_451, -2)
    expect(r.volNeto).toBeCloseTo(229_657, -2)
  })
  it('promedio: P media, Pe 40 %, Kc 0,9, FS 1,1 → 231.334 m³', () => {
    const r = demandaAgricola({ ...base, p: baranoa.monthlyPrecipAvg, cultivos: [{ nombre: 'Pasturas', ha: 16.22, kc: 0.9 }], pePct: 0.4, factorSeguridad: 1.1 })
    expect(r.volDiseno).toBeCloseTo(231_334, -2)
  })
  it('ideal: P media, Pe 40 %, Kc 0,85, FS 1,0 → 192.597 m³', () => {
    const r = demandaAgricola({ ...base, p: baranoa.monthlyPrecipAvg, cultivos: [{ nombre: 'Pasturas', ha: 16.22, kc: 0.85 }], pePct: 0.4, factorSeguridad: 1 })
    expect(r.volDiseno).toBeCloseTo(192_597, -2)
  })
  it('oferta GUARDAR y almacenamiento', () => {
    const r = demandaAgricola({ ...base, p: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], eto: Array(12).fill(0), cultivos: [], pePct: 0.4, factorSeguridad: 1, captacionHa: 10, c: 0.1 })
    expect(r.oferta).toBeCloseTo(1000)
    expect(r.almacenamiento).toBe(0)
  })
  it('almacenamiento: con déficit anual solo se guarda el excedente', () => {
    const r = demandaAgricola({ ...base, p: baranoa.monthlyPrecipAvg, cultivos: [{ nombre: 'Pasturas', ha: 16.22, kc: 0.9 }], pePct: 0.4, factorSeguridad: 1.1, c: 0.125 })
    const excedente = r.meses.reduce((s, m) => s + Math.max(0, m.balance), 0)
    expect(r.oferta).toBeLessThan(r.volDiseno)
    expect(r.almacenamiento).toBeCloseTo(excedente)
    expect(r.almacenamiento).toBeLessThan(r.oferta)
  })
  it('USDA-SCS (CROPWAT)', () => {
    expect(peUsdaScs(100)).toBeCloseTo(84)
    expect(peUsdaScs(300)).toBeCloseTo(155)
  })
  it('Hargreaves: ETo plausible en Baranoa (trópico cálido)', () => {
    const eto = etoHargreavesMensual(10.79, baranoa.monthlyTmax!, baranoa.monthlyTmin!)
    const anual = eto.reduce((a, b) => a + b, 0)
    expect(anual).toBeGreaterThan(1500)
    expect(anual).toBeLessThan(2100)
  })
})
