// ── Informe PDF de Diseño Keyline Predial ──
// Recorre las capas 00–10 con los mismos números del tablero.
import { CAPAS, subtotalDiseno, subtotalObra, type CapaCostoId, type PredialResultado, type PredialState } from '@/lib/calculos/predial'
import { totalSemestre } from '@/lib/calculos/inversion'
import { DISCLAIMER_PREDIAL, SUPUESTOS, FUENTES, ADVERTENCIA_APU } from '@/data/catalogos/predial'
import { DEPARTAMENTOS, ZONAS, type ZonaId } from '@/data/catalogos/clima'
import { FONDOS, MATERIALES, TIPOLOGIAS } from '@/data/catalogos/obra'
import { SUPERFICIE_GUARDAR_LABEL } from '@/lib/calculos/escorrentia'
import type { Bloque, Reporte } from '@/lib/pdf/reporte'
import { cop, copC, nf, nf1, nf2 } from './fmt'

const NOMBRE_CAPA: Record<CapaCostoId, string> = {
  estudios: '02 · Relieve — estudios previos',
  aguaObra: '03 · Agua — obras complementarias',
  vias: '04 · Vías de acceso',
  arb: '05 · Árboles',
  est: '06 · Estructuras',
  sub: '07 · Subdivisiones',
  suelo: '08 · Suelo',
}

function tablaCostos(s: PredialState, k: CapaCostoId): Bloque[] {
  const filas = s.costos[k]
  if (!filas.length) return []
  const dis = subtotalDiseno(filas)
  return [
    {
      tipo: 'tabla',
      head: ['Descripción', 'Cantidad', 'Unidad', 'Valor unitario', 'Subtotal'],
      body: filas.map((f) => [f.nombre, nf2(f.cantidad), f.unidad, cop(f.precio), f.diseno ? `${cop(f.cantidad * f.precio)} (diseño)` : cop(f.cantidad * f.precio)]),
      foot: [
        ['Total de obra de la capa', '', '', '', cop(subtotalObra(filas))],
        ...(dis > 0 ? [['Honorarios de diseño (fuera de la cotización)', '', '', '', cop(dis)]] : []),
      ],
      alinear: ['left', 'right', 'left', 'right', 'right'],
      anchos: [46, 11, 11, 16, 16],
    },
  ]
}

export function reportePredial(s: PredialState, r: PredialResultado): Reporte {
  const cl = s.clima
  const ag = s.agua
  const zona = ZONAS[cl.zona as ZonaId]
  const dep = DEPARTAMENTOS.find((d) => d.nombre === cl.departamento)
  const material = MATERIALES.find((m) => m.id === s.relieve.materialId) ?? MATERIALES[0]
  const tipologia = TIPOLOGIAS.find((t) => t.id === ag.tipologiaId)
  const cr = r.cronograma
  const em = s.empresa
  const cliente = s.finca.nombre || s.finca.propietario

  const meta: [string, string][] = [
    ...(em.nombre ? [['Empresa', [em.nombre, em.nit && `NIT ${em.nit}`].filter(Boolean).join(' · ')] as [string, string]] : []),
    ...(em.responsable ? [['Responsable técnico', em.responsable] as [string, string]] : []),
    ...([em.telefono, em.correo, em.web].some(Boolean)
      ? [['Contacto', [em.telefono, em.correo, em.web].filter(Boolean).join(' · ')] as [string, string]]
      : []),
    ...(em.direccion || em.ciudad ? [['Dirección', [em.direccion, em.ciudad].filter(Boolean).join(', ')] as [string, string]] : []),
    ['Finca', [s.finca.nombre || '—', s.finca.vereda && `vereda ${s.finca.vereda}`, s.finca.municipio, cl.departamento].filter(Boolean).join(', ')],
    ...(s.finca.propietario ? [['Propietario / cliente', s.finca.propietario] as [string, string]] : []),
    ['Área', `${nf1(s.finca.areaHa)} ha totales · ${nf1(s.finca.areaIntervenirHa)} ha a intervenir · ${s.finca.sistema}`],
    ...(em.validez ? [['Validez de la cotización', em.validez] as [string, string]] : []),
  ]

  const bloques: Bloque[] = [
    {
      tipo: 'kpis',
      items: [
        { k: 'Demanda anual', v: `${nf(r.demandaAnual)} m³`, sub: `${nf(r.demandaSeca)} m³ en la época seca` },
        { k: 'Oferta cosechable', v: `${nf(r.oferta)} m³/año`, sub: `balance ${nf2(r.balance)} ×` },
        { k: 'Almacenamiento', v: `${nf(r.volumenDiseno)} m³`, sub: `${Math.max(1, ag.reservorios)} reservorio(s)` },
        { k: 'Movimiento de tierras', v: `${nf(r.tierra.corteM3)} m³`, sub: `${cop(r.copM3Almacenado)} por m³ almacenado` },
        { k: 'Inversión total', v: copC(r.total), sub: 'obra + AIU + contingencia' },
        { k: 'Semestres', v: nf(cr.semestres.length), sub: `capacidad ${copC(cr.capacidad)} por semestre` },
      ],
    },

    // 09 · Cotización primero: es lo que el cliente busca
    { tipo: 'titulo', texto: 'Resumen de la cotización' },
    {
      tipo: 'tabla',
      head: ['Cap.', 'Capítulo — escala de permanencia', 'Valor', '%'],
      body: CAPAS.map((c) => [c.idx, c.nombre, cop(r.capas[c.k]), r.subtotal > 0 ? `${nf1((r.capas[c.k] / r.subtotal) * 100)} %` : '0 %']),
      foot: [
        ['', 'Subtotal de obra', cop(r.subtotal), ''],
        ['', `AIU ${nf(s.cotizacion.aiuPct)} %`, cop(r.aiu), ''],
        ['', `Contingencia ${nf(s.cotizacion.contingenciaPct)} %`, cop(r.contingencia), ''],
        ['', 'TOTAL COTIZADO (sin valor del diseño)', cop(r.total), ''],
        ['', 'Diseño keyline y estudios — se cotiza por separado', cop(r.diseno), ''],
      ],
      alinear: ['left', 'left', 'right', 'right'],
      anchos: [8, 56, 24, 12],
    },

    // 01 · Clima
    { tipo: 'titulo', texto: '01 · Clima' },
    {
      tipo: 'kv',
      filas: [
        ['Departamento · unidad fisiográfica', `${cl.departamento} · ${dep?.subzonas[cl.subzona]?.nombre ?? '—'} · régimen ${dep?.regimen ?? '—'}`],
        ['Zona bioclimática', zona ? `${zona.nombre} (${zona.altitud})` : String(cl.zona)],
        ['Altitud', `${nf(cl.altitud)} m s. n. m.`],
        ['Precipitación anual', `${nf(cl.precipAnual)} mm`],
        ['Meses secos · días críticos', `${nf(cl.mesesSecos)} meses · ${r.dias} días`],
        ['Lluvia en la época seca', `${nf(r.pSecaMm)} mm (${nf(cl.fraccionSecaPct)} % del mes medio)`],
        ['ETo de referencia', `${nf2(cl.etoDia)} mm/día`],
        ['Evaporación de lámina libre', `${nf1(cl.evaporacionDia)} mm/día`],
        ['Coeficiente de Pe actual → con diseño', `${nf2(cl.coefPeActual)} → ${nf2(cl.coefPeDiseno)}`],
        ['Agua adicional infiltrada', `${nf(r.aguaRetenidaM3Ha)} m³/ha·año · ${nf(r.aguaRetenidaFincaM3)} m³/año en el área intervenida`],
      ],
    },

    // 02 · Relieve
    { tipo: 'titulo', texto: '02 · Relieve' },
    {
      tipo: 'kv',
      filas: [
        ['Pendiente media · desnivel', `${nf(s.relieve.pendientePct)} % · ${nf(s.relieve.desnivelM)} m`],
        ['Forma dominante', s.relieve.forma],
        ['Material dominante', material.nombre],
        ['Grupo hidrológico', s.relieve.grupoHidrologico],
        ['Puntos clave identificados', nf(s.relieve.puntosClave)],
      ],
    },
    ...tablaCostos(s, 'estudios'),

    // 03 · Agua
    { tipo: 'titulo', texto: '03 · Agua — demanda' },
    {
      tipo: 'tabla',
      head: ['Cultivo o pastura', 'ha', 'Kc', 'Riego', 'ETc mm/d', 'Bruto seca m³'],
      body: r.cultivos.map((c) => [c.nombre, nf1(c.ha), nf2(c.kc), c.riego, nf2(c.etcDia), nf(c.brutoSecaM3)]),
      foot: [['Demanda agrícola en la época seca', '', '', '', '', nf(r.dAgriSeca)]],
      alinear: ['left', 'right', 'right', 'left', 'right', 'right'],
      anchos: [30, 7, 7, 28, 12, 16],
    },
    {
      tipo: 'tabla',
      head: ['Especie o categoría', 'Cabezas', 'L/animal·día', 'm³/día', 'm³ época seca'],
      body: r.animales.map((a) => [a.nombre, nf(a.cantidad), nf2(a.litrosDia), nf2(a.litrosDiaTotal / 1000), nf((a.litrosDiaTotal / 1000) * r.dias)]),
      foot: [['Demanda pecuaria', '', '', nf2(r.dPecDia), nf(r.dPecSeca)]],
    },
    {
      tipo: 'kv',
      filas: [
        ['Factor por temperatura · pérdidas pecuarias', `× ${nf2(ag.factorTemperatura)} · ${nf(ag.perdidasPecuariaPct)} %`],
        [
          'Doméstica y de proceso',
          `${nf(ag.domestica.personas)} personas × ${nf(ag.domestica.dotacionNeta)} L + ${nf(ag.domestica.procesoLDia)} L/día de proceso → ${nf2(r.dDomDia)} m³/día`,
        ],
        ['Reforestación', `${nf(r.arboles)} árboles → ${nf(r.dRef)} m³ de riego de soporte`],
        ['Demanda total anual · en época seca', `${nf(r.demandaAnual)} m³ · ${nf(r.demandaSeca)} m³`],
      ],
    },
    { tipo: 'titulo', texto: '03 · Agua — oferta cosechable (GUARDAR)' },
    {
      tipo: 'tabla',
      head: ['Superficie de captación', 'Área', 'C', 'Oferta m³/año'],
      body: r.captacion.map((c) => [SUPERFICIE_GUARDAR_LABEL[c.superficie], `${nf(c.area)} ${c.unidad}`, nf2(c.c), nf(c.ofertaM3)]),
      foot: [['Oferta cosechable anual', '', '', nf(r.oferta)]],
    },
    {
      tipo: 'parrafo',
      tono: 'muted',
      texto: `V = 10 · C · A(ha) · P × eficiencia de conducción ${nf2(ag.eficienciaConduccion)}. Fracción captable en la época seca: ${nf2(ag.fraccionCaptableSeca)}.`,
    },
    { tipo: 'titulo', texto: '03 · Agua — almacenamiento' },
    {
      tipo: 'kv',
      filas: [
        ['Tipología', tipologia?.nombre ?? ag.tipologiaId],
        ['Fondo del vaso', ag.impermeabilizar ? 'Geomembrana HDPE 1,0 mm' : (FONDOS[ag.fondoIdx]?.nombre ?? '—')],
        ['Déficit a cubrir', `${nf(r.deficitSeca)} m³ (${nf(ag.coberturaDeficitPct)} % del déficit de la seca)`],
        ['Volumen útil requerido', `${nf(r.volumenRequerido)} m³ (factor de seguridad ${nf2(ag.factorSeguridad)})`],
        ['Volumen a construir', `${nf(r.volumenDiseno)} m³ en ${Math.max(1, ag.reservorios)} reservorio(s)`],
        ['Espejo de agua · profundidad', `${nf(r.espejoDiseno)} m² · ${nf1(ag.profundidadM)} m`],
        ['Pérdidas en la seca', `${nf(r.perdidas)} m³ (${nf1(r.perdidasPct)} %)`],
      ],
    },
    { tipo: 'titulo', texto: '03 · Agua — movimiento de tierras' },
    {
      tipo: 'tabla',
      head: ['Frente', 'Equipo', 'Cantidad', 'Rend.', 'Tarifa/h', 'Horas', 'Costo'],
      body: [
        ...r.tierra.frentes.map((f, i) => {
          const fe = s.tierra.frentes[i]
          return [fe.rol, fe.equipo, `${nf(f.cantidad)} ${fe.unidad.split('/')[0]}`, nf(fe.rendimiento), cop(fe.tarifa), nf1(f.horas), cop(f.costo)]
        }),
        ['Movilización', 'Cama baja ida y regreso', `${nf(s.tierra.viajes)} viajes`, '—', '—', '—', cop(r.tierra.costoMovilizacion)],
      ],
      foot: [
        [`Costo directo + indirectos ${nf(s.tierra.indirectosPct)} %`, '', '', '', '', '', cop(r.tierra.costoTotal)],
        ...(r.costoGeo > 0 ? [['Impermeabilización con geomembrana', '', '', '', '', '', cop(r.costoGeo)]] : []),
      ],
      alinear: ['left', 'left', 'right', 'right', 'right', 'right', 'right'],
      anchos: [16, 24, 13, 8, 13, 8, 18],
    },
    {
      tipo: 'kv',
      filas: [
        ['Relación corte / almacenado', nf2(s.tierra.ratio)],
        ['Corte total (banco)', `${nf(r.tierra.corteM3)} m³`],
        ['Terraplén compactado', `${nf(r.tierra.terraplenM3)} m³`],
        ['Volumen suelto a transportar', `${nf(r.tierra.sueltoM3)} m³`],
        ['Descapote', `${nf(r.tierra.descapoteM2)} m² · ${nf(r.tierra.descapoteM3)} m³`],
        ['Costo por m³ almacenado', cop(r.copM3Almacenado)],
      ],
    },
    ...tablaCostos(s, 'aguaObra'),
  ]

  for (const k of ['vias', 'arb', 'est', 'sub', 'suelo'] as CapaCostoId[]) {
    if (!s.costos[k].length) continue
    bloques.push({ tipo: 'titulo', texto: NOMBRE_CAPA[k] }, ...tablaCostos(s, k))
  }

  // 09 · Cronograma
  let ac = 0
  bloques.push(
    { tipo: 'titulo', texto: '09 · Inversión por semestres' },
    {
      tipo: 'parrafo',
      texto: `${cr.semestres.length} semestre(s) con una capacidad de ${cop(cr.capacidad)} por semestre, orden: ${
        s.inversion.modo === 'escala' ? 'escala de permanencia' : s.inversion.modo === 'lineal' ? 'distribución lineal' : 'carga inicial'
      }. Valores con AIU y contingencia incluidos.`,
    },
    {
      tipo: 'tabla',
      head: ['Semestre', 'Capas que se ejecutan', 'Inversión', 'Acumulado'],
      body: cr.semestres.map((sem, i) => {
        const t = totalSemestre(sem)
        ac += t
        return [
          `S${i + 1}`,
          cr.items
            .filter((it) => sem[it.k] > 0)
            .map((it) => `${it.nombre} ${copC(sem[it.k])}`)
            .join(' · '),
          cop(t),
          cop(ac),
        ]
      }),
      alinear: ['left', 'left', 'right', 'right'],
      anchos: [10, 50, 20, 20],
    }
  )

  // 10 · Supuestos y fuentes
  bloques.push(
    { tipo: 'titulo', texto: '10 · Supuestos de cálculo' },
    {
      tipo: 'tabla',
      head: ['Concepto', 'Cómo se calcula'],
      body: SUPUESTOS.map(([k, v]) => [k, v]),
      alinear: ['left', 'left'],
      anchos: [25, 75],
    },
    { tipo: 'nota', tono: 'warn', texto: `Advertencia metodológica. ${ADVERTENCIA_APU}` },
    { tipo: 'titulo', texto: 'Fuentes' },
    ...FUENTES.map((f) => ({ tipo: 'parrafo' as const, texto: `${f.tema}: ${f.refs.map(([t]) => t).join(' · ')}` }))
  )

  return {
    herramienta: 'Diseño Keyline Predial',
    titulo: `Diseño Keyline Predial${s.finca.nombre ? ` — ${s.finca.nombre}` : ''}`,
    subtitulo: 'Informe técnico y cotización por capas de la escala de permanencia.',
    cliente,
    meta,
    bloques,
    disclaimer: DISCLAIMER_PREDIAL,
    slug: 'predial',
  }
}
