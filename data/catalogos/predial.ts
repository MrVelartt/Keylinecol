// ── Diseño Keyline Predial: valores de partida, fuentes y supuestos ──
// Los valores precargados son referencias de diseño; el usuario los ajusta
// con datos de la estación IDEAM más cercana y cotizaciones locales.
import type { FilaCosto, PredialState, CapaCostoId } from '../../lib/calculos/predial'
import { SUPERFICIE_GUARDAR_RANGE, type SuperficieGuardar } from '../../lib/calculos/escorrentia'
import { DEPARTAMENTOS, ZONAS, type ZonaId } from './clima'
import { MAQUINARIA, TIPOLOGIAS } from './obra'
import { PRECIOS as PU } from './precios'
import { etoPorAltitud } from '../../lib/calculos/clima'

let seq = 0
// Sufijo aleatorio: los ids no chocan con los de un borrador restaurado.
export const nuevoId = (prefijo = 'f') => `${prefijo}${++seq}${Math.random().toString(36).slice(2, 6)}`

const fila = (nombre: string, cantidad: number, unidad: string, precio: number, diseno = false): FilaCosto => ({
  id: nuevoId('c'),
  nombre,
  cantidad,
  unidad,
  precio,
  diseno,
})

export const cMedio = (s: SuperficieGuardar) => {
  const [a, b] = SUPERFICIE_GUARDAR_RANGE[s]
  return Math.round(((a + b) / 2) * 1000) / 1000
}

export const SISTEMAS_PRODUCTIVOS = [
  'Ganadería de leche',
  'Ganadería de carne / doble propósito',
  'Café',
  'Cacao',
  'Plátano',
  'Aguacate',
  'Caña',
  'Frutales',
  'Hortalizas',
  'Silvopastoril',
  'Forestal / restauración',
  'Mixto',
]

export const FORMAS_RELIEVE = [
  'Laderas con vaguadas definidas (keyline clásico)',
  'Lomerío ondulado',
  'Ladera uniforme sin vaguadas',
  'Terreno plano / altillanura',
  'Vega o valle aluvial',
]

export const GRUPOS_HIDROLOGICOS = [
  { id: 'A', nombre: 'A — arenoso, infiltración muy alta' },
  { id: 'B', nombre: 'B — franco, infiltración alta' },
  { id: 'C', nombre: 'C — franco arcilloso, media' },
  { id: 'D', nombre: 'D — arcilloso, baja' },
] as const

/** Parámetros climáticos de una subzona del catálogo. */
export function climaDeSubzona(departamento: string, subzona: number) {
  const d = DEPARTAMENTOS.find((x) => x.nombre === departamento) ?? DEPARTAMENTOS[0]
  const sz = d.subzonas[subzona] ?? d.subzonas[0]
  const z = ZONAS[sz.zona]
  return {
    altitud: sz.altitud,
    precipAnual: sz.precipitacion,
    mesesSecos: sz.mesesSecos,
    zona: sz.zona as ZonaId,
    etoDia: Math.round(etoPorAltitud(sz.altitud, z) * 100) / 100,
    evaporacionDia: z.evaporacion,
    regimen: d.regimen,
  }
}

export function estadoInicialPredial(): PredialState {
  const cl = climaDeSubzona('Cundinamarca', 0)
  const tipologia = TIPOLOGIAS[0]
  const costos: Record<CapaCostoId, FilaCosto[]> = {
    estudios: [
      fila('Levantamiento topográfico con dron + MDT (curvas 0,25 m)', 50, 'ha', PU.topografia, true),
      fila('Análisis de suelos completo', 6, 'muestra', PU.suelos),
      fila('Estudio geotécnico del vaso y del sitio de presa', 1, 'global', PU.geotecnia),
      fila('Diseño keyline, planos y memoria de cálculo', 1, 'global', PU.disenoKeyline, true),
    ],
    aguaObra: [
      fila('Vertedero de excedencias', 2, 'und', PU.vertedero),
      fila('Obra de toma y desagüe de fondo', 2, 'und', PU.toma),
      fila('Empradización y protección de taludes', 1600, 'm²', PU.empradizado),
      fila('Zanjas de infiltración mecanizadas', 2400, 'ml', PU.swaleMec),
      fila('Canal keyline de conducción', 1800, 'ml', PU.canalKey),
      fila('Trazado y estacado de líneas clave', 4000, 'ml', PU.trazado),
    ],
    vias: [
      fila('Vía interna en afirmado trazada en cota', 900, 'ml', PU.viaInterna),
      fila('Cunetas y disipadores', 900, 'ml', PU.cunetas),
      fila('Alcantarillas y pasos de agua', 3, 'und', PU.alcantarilla),
    ],
    arb: [
      fila('Siembra de árboles en líneas clave', 5555, 'árbol', PU.arbol),
      fila('Sistema silvopastoril de baja densidad', 10, 'ha', PU.silvopast),
      fila('Cercas vivas', 1500, 'ml', PU.cercaViva),
    ],
    est: [
      fila('Tubería PVC 3" de conducción por gravedad', 1200, 'ml', PU.tuberia3),
      fila('Tanques de 5.000 L en cota alta', 2, 'und', PU.tanque5k),
      fila('Abrevaderos con flotador', 8, 'und', PU.abrevadero),
      fila('Riego por gravedad desde reservorio', 6, 'ha', PU.riegoGrav),
    ],
    sub: [
      fila('Cerca eléctrica para pastoreo rotacional', 4200, 'ml', PU.cercaElec),
      fila('Cerca de alambre de púas perimetral', 1200, 'ml', PU.cercaPuas),
    ],
    suelo: [
      fila('Programa keyline con arado de cinceles (2-3 pases)', 35, 'ha', PU.keylineProg),
      fila('Cal dolomita puesta en finca', 52, 't', PU.cal),
      fila('Aplicación mecanizada de enmiendas', 35, 'ha', PU.aplicCal),
      fila('Renovación de praderas', 12, 'ha', PU.pastura),
    ],
  }

  return {
    empresa: {
      nombre: '',
      nit: '',
      responsable: '',
      telefono: '',
      correo: '',
      web: '',
      direccion: '',
      ciudad: '',
      validez: '30 días',
    },
    finca: {
      nombre: '',
      propietario: '',
      vereda: '',
      municipio: '',
      areaHa: 50,
      areaIntervenirHa: 35,
      sistema: SISTEMAS_PRODUCTIVOS[0],
    },
    cotizacion: { aiuPct: 18, contingenciaPct: 10 },
    clima: {
      departamento: 'Cundinamarca',
      subzona: 0,
      altitud: cl.altitud,
      precipAnual: cl.precipAnual,
      mesesSecos: cl.mesesSecos,
      zona: cl.zona,
      etoDia: cl.etoDia,
      evaporacionDia: cl.evaporacionDia,
      fraccionSecaPct: 25,
      coefPeActual: 0.55,
      coefPeDiseno: 0.8,
    },
    relieve: {
      pendientePct: 18,
      desnivelM: 120,
      forma: FORMAS_RELIEVE[0],
      materialId: 'arcilla-densa',
      grupoHidrologico: 'B',
      puntosClave: 4,
    },
    agua: {
      cultivos: [
        { id: nuevoId('cu'), nombre: 'Kikuyo (trópico alto lechero)', ha: 8, kc: 0.95, riego: 'Aspersión móvil / cañón', eficiencia: 0.73 },
        { id: nuevoId('cu'), nombre: 'Pasto de pastoreo rotacional', ha: 22, kc: 0.95, riego: 'Sin riego (secano)', eficiencia: 0 },
        { id: nuevoId('cu'), nombre: 'Hortalizas', ha: 2, kc: 1.05, riego: 'Goteo (con tubería)', eficiencia: 0.88 },
      ],
      factorTemperatura: 1,
      perdidasPecuariaPct: 10,
      animales: [
        { id: nuevoId('an'), nombre: 'Vaca de leche promedio', cantidad: 40, litrosDia: 80 },
        { id: nuevoId('an'), nombre: 'Terneros', cantidad: 15, litrosDia: 15 },
        { id: nuevoId('an'), nombre: 'Equinos de trabajo', cantidad: 3, litrosDia: 40 },
      ],
      domestica: { personas: 5, dotacionNeta: 130, perdidasPct: 25, procesoLDia: 300 },
      reforestacion: { ha: 5, densidad: 1111, litrosPorRiego: 8, riegos: 10, mortalidadPct: 15 },
      captacion: [
        { id: nuevoId('ca'), superficie: 'potrero', area: 20, unidad: 'ha', c: cMedio('potrero') },
        { id: nuevoId('ca'), superficie: 'via_sin_cobertura_mas300', area: 6000, unidad: 'm²', c: cMedio('via_sin_cobertura_mas300') },
        { id: nuevoId('ca'), superficie: 'techo', area: 400, unidad: 'm²', c: cMedio('techo') },
      ],
      eficienciaConduccion: 0.85,
      fraccionCaptableSeca: 0.15,
      tipologiaId: tipologia.id,
      fondoIdx: 1,
      profundidadM: 3.5,
      coberturaDeficitPct: 60,
      factorSeguridad: 1.2,
      reservorios: 2,
      volumenManualM3: null,
      impermeabilizar: false,
      preciosGeo: { geomembrana: PU.geomembrana, geotextil: PU.geotextil, anclaje: PU.anclaje },
      tanquesM3: 0,
    },
    tierra: {
      ratio: tipologia.ratio,
      fraccionTerraplen: 0.45,
      espesorDescapoteM: 0.25,
      asentamientoPct: 10,
      frentes: MAQUINARIA.map((m) => ({ ...m })),
      movilizacion: PU.movilizacion,
      viajes: 2,
      indirectosPct: 25,
    },
    costos,
    inversion: { totalManual: null, capacidad: null, modo: 'escala' },
  }
}

export const FUENTES: { tema: string; refs: [string, string][] }[] = [
  {
    tema: 'Evapotranspiración y clima',
    refs: [
      [
        'Cenicafé 57(4):288-298 (2006) — regresión altitudinal de ETo con 118 estaciones: ETo = 4,37·e^(−0,0002·altitud)',
        'https://www.cenicafe.org/es/publications/arc057(04)288-298.pdf',
      ],
      ['IDEAM — Regionalización de la lluvia en Colombia', 'http://www.ideam.gov.co/documents/21021/21789/Regionalizaci%C3%B3n+de+la+lluvia+en+Colombia.pdf/92287f96-840f-4408-8e76-98b668b83664'],
      ['IDEAM — Atlas climatológico de Colombia', 'http://atlas.ideam.gov.co/cclimatologicas/'],
    ],
  },
  {
    tema: 'Escorrentía (método oficial del sitio)',
    refs: [
      ['Doherty & Jeeves (2015) — The Regrarians Handbook, cap. 2 §2.19, tablas 2.3 y 2.4', 'https://www.regrarians.org/'],
      ['Manual de Drenaje INVÍAS (2009) — ecuación regional de Vargas y Díaz-Granados', 'https://www.invias.gov.co/'],
    ],
  },
  {
    tema: 'Coeficientes de cultivo y riego',
    refs: [
      ['FAO-56 Irrigation and Drainage Paper — Kc por cultivo y etapa', 'https://www.fao.org/4/x0490e/x0490e00.htm'],
      [
        'Determinación de necesidades hídricas en café en producción — U. de Manizales / Cenicafé (Kc 0,77–0,95)',
        'https://ridum.umanizales.edu.co/server/api/core/bitstreams/28cd9f2d-3ad6-4d43-b2a8-52d1e0b1b943/content',
      ],
      ['IICA — Sistemas de riego por goteo, microaspersión y aspersión', 'https://repositorio.iica.int/bitstream/handle/11324/21092/BVE22098484e.pdf'],
      ['AGROSAVIA — Eficiencia de riego', 'https://repository.agrosavia.co/bitstream/handle/20.500.12324/37108/Ver_Documento_37108.pdf'],
    ],
  },
  {
    tema: 'Consumo animal y doméstico',
    refs: [
      [
        'CONtexto Ganadero / FEDEGÁN — agua que requiere el ganado al día',
        'https://www.contextoganadero.com/ganaderia-sostenible/esta-es-la-cantidad-de-agua-que-requiere-tomar-su-ganado-al-dia',
      ],
      ['3tres3 — consumo de agua en porcinos', 'https://www.3tres3.com/latam/articulos/consumo-de-agua-en-porcino_9771/'],
      ['Resolución 0330 de 2017 (RAS) — dotación neta por altitud', 'https://normas.cra.gov.co/gestor/docs/resolucion_minviviendact_0330_2017.htm'],
    ],
  },
  {
    tema: 'Presas de tierra y reservorios',
    refs: [
      [
        'USDA-NRCS Conservation Practice Standard 378 · Pond (2022) — taludes, corona, borde libre, asentamiento',
        'https://www.nrcs.usda.gov/sites/default/files/2022-09/Pond_378_NHCP_CPS_2022.pdf',
      ],
      ['FAO Irrigation & Drainage Paper 64 — Manual on small earth dams', 'https://www.fao.org/4/i1531e/i1531e.pdf'],
    ],
  },
  {
    tema: 'Movimiento de tierras y precios',
    refs: [
      ['Gobernación de Boyacá — Listado de APU 2025 (excavación, relleno, descapote, acarreo)', 'https://www.boyaca.gov.co/wp-content/uploads/2025/05/Anexo-1-Listado-de-APUS-resumido.pdf'],
      ['SpikeVM — tabla de esponjamiento y contracción por material', 'https://www.spikevm.com/calculators/swel-shrink-list.php'],
      ['Licon Ingeniería — rendimientos de maquinaria en movimiento de tierras', 'https://liconingenieria.com/herramientas/Rendimiento_Tierras.pdf'],
      ['TuMaquinaYa — tarifas de alquiler de maquinaria pesada en Colombia', 'https://www.tumaquinaya.com/'],
    ],
  },
  {
    tema: 'Establecimiento, forestal y topografía',
    refs: [
      ['MADR Resolución 379 de 2022 — costos oficiales de establecimiento forestal por región y especie', 'https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=129911&dt=S'],
      ['Gerfor — lista de precios 2025 de tubería PVC y PEAD', 'https://www.gerfor.com/wp-content/uploads/2025/02/V1%2025_Lista%20de%20precios%20Gerfor%202025.pdf'],
      ['Geosat — precios de fotogrametría con dron en Colombia', 'https://geosat.com.co/es/blog/fotogrametria-drones-precios-colombia'],
      ['CONtexto Ganadero — costos de sistemas silvopastoriles', 'https://www.contextoganadero.com/reportaje/estos-son-los-ingresos-inversiones-gastos-y-costos-de-implementar-un-sistema-silvopastoril'],
    ],
  },
]

export const SUPUESTOS: [string, string][] = [
  [
    'Lluvia en época seca',
    'P_seca = P_anual × (meses secos / 12) × factor de concentración (25 % por defecto). Ajústelo con el régimen mensual real de la estación IDEAM más cercana.',
  ],
  [
    'Demanda agrícola',
    'Déficit = máx(0; Kc × ETo × días secos − P efectiva de la seca). Se divide por la eficiencia total del sistema de riego (conducción × aplicación).',
  ],
  [
    'Demanda pecuaria',
    'Consumo por cabeza × factor de temperatura × pérdidas en abrevaderos. El factor de temperatura sigue la escala 0,8 / 1,0 / 1,3 / 1,6.',
  ],
  [
    'Oferta cosechable',
    'Fórmula unificada de escorrentía, modo GUARDAR: V = 10 · C · A · P × eficiencia de conducción, con C anual por superficie de la tabla 2.4 (Regrarians §2.19). Es el mismo método de las demás calculadoras del sitio.',
  ],
  [
    'Volumen del reservorio',
    'V = (demanda de la seca − oferta captable en la seca + pérdidas por evaporación e infiltración) × factor de seguridad. El espejo se estima con un factor de forma tronco-piramidal de 0,7.',
  ],
  [
    'Movimiento de tierras',
    'Corte = volumen almacenado × relación corte/almacenado de la tipología. El terraplén se mayora por asentamiento y el corte necesario por contracción del material; el volumen suelto se mayora por esponjamiento. Mismo modelo que la calculadora de movimiento de tierra.',
  ],
  [
    'Costo de la obra de tierra',
    'Suma de horas-máquina por frente de trabajo (cantidad ÷ rendimiento × tarifa) más movilización, más indirectos. Se verifica contra el rango colombiano de 1.200 a 30.000 COP por m³ almacenado.',
  ],
  [
    'Qué NO incluye la cotización',
    'Honorarios de diseño keyline, planos, memorias y levantamiento topográfico. Se calculan y se muestran aparte porque se contratan como servicio profesional independiente.',
  ],
]

export const ADVERTENCIA_APU =
  'Los APU oficiales de obra pública incluyen AIU, ensayos e interventoría y son entre 4 y 8 veces superiores al costo real de campo del movimiento de tierras agrícola a granel. Esta herramienta usa tarifas de campo. No mezcle ambas fuentes en un mismo presupuesto.'

export const DISCLAIMER_PREDIAL =
  'Los valores precargados son referencias de diseño. Ajústelos con datos de la estación IDEAM más cercana y cotizaciones locales antes de contratar obra. No sustituyen el estudio de campo.'
