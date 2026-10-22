'use client'

import { useMemo, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { Accent } from '@/components/ui/SectionHeader'
import ToolFrame from '@/components/tools/ToolFrame'
import ChartFrame from '@/components/charts/ChartFrame'
import ChartTooltip from '@/components/charts/ChartTooltip'
import ExportarPDF from '@/components/pdf/ExportarPDF'
import { AddButton, Card, DelButton, Grid, Hint, Note, NumCell, NumField, SelectCell, SelectField } from '@/components/predial/ui'
import { barCursor, gridProps, series, xAxisProps, yAxisProps } from '@/lib/chart-theme'
import { toneClass, type Tone } from '@/lib/tones'
import { demandaAgricola, etoHargreavesMensual, peUsdaScs, type MetodoPe } from '@/lib/calculos/agricola'
import {
  annualCRange,
  bandaFromClimate,
  BANDA_LLUVIA_EVAP_LABEL,
  CONFIABILIDAD_LABEL,
  SUELO_TEXTURA_LABEL,
  type Confiabilidad,
  type SueloTextura,
} from '@/lib/calculos/escorrentia'
import { CULTIVOS, RIEGOS } from '@/data/catalogos/agua'
import { baranoa } from '@/data/proyectos/baranoa'
import { graficaAPng } from '@/lib/pdf/grafica'
import type { Bloque, Reporte } from '@/lib/pdf/reporte'

// ── Demanda hídrica agrícola ──
// Balance de riego mensual para cualquier lugar: ETc = Kc × ETo, lluvia
// efectiva, eficiencia, factor de seguridad y oferta de escorrentía (GUARDAR).
// Viene precargada con la Finca Alma Luz (Baranoa) como ejemplo; todo es
// editable y cada casilla sugiere un rango según los demás datos.

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const nf0 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })
const pct = (x: number) => `${nf0.format(x * 100)} %`
const sum = (a: readonly number[]) => a.reduce((x, y) => x + y, 0)

type Lluvia = 'media' | 'seca'
type Cultivo = { id: number; nombre: string; ha: number; kc: number }

const EJEMPLO = {
  pMedia: [...baranoa.monthlyPrecipAvg],
  pSeca: [...(baranoa.monthlyPrecipP80 ?? baranoa.monthlyPrecipAvg.map((p) => p * 0.6))],
  eto: [...baranoa.monthlyEtoAvg],
  tmax: [...(baranoa.monthlyTmax ?? Array(12).fill(32))],
  tmin: [...(baranoa.monthlyTmin ?? Array(12).fill(23))],
  latitud: baranoa.latitude ?? 10.8,
  cultivos: [{ id: 1, nombre: 'Pasto de pastoreo rotacional', ha: baranoa.irrigatedHa ?? 16.22, kc: 0.9 }] as Cultivo[],
  captacionHa: baranoa.areaHa,
}

// Escenarios del estudio de la Finca Alma Luz (hoja «Balance hídrico»)
const ESCENARIOS: { id: string; nombre: string; desc: string; lluvia: Lluvia; pePct: number; fs: number }[] = [
  { id: 'critico', nombre: 'Crítico', desc: 'Año seco (P80), lluvia efectiva 30 %, factor de seguridad 1,2', lluvia: 'seca', pePct: 0.3, fs: 1.2 },
  { id: 'promedio', nombre: 'Promedio', desc: 'Año medio, lluvia efectiva 40 %, factor de seguridad 1,1', lluvia: 'media', pePct: 0.4, fs: 1.1 },
  { id: 'ideal', nombre: 'Ideal', desc: 'Año medio, lluvia efectiva 40 %, factor de seguridad 1,0', lluvia: 'media', pePct: 0.4, fs: 1 },
]

const TEXTURAS = Object.keys(SUELO_TEXTURA_LABEL) as SueloTextura[]

/** Rango típico de ETo anual por latitud y temperatura media (orientativo). */
function rangoEtoAnual(tMedia: number) {
  if (tMedia >= 24) return [1400, 2100]
  if (tMedia >= 18) return [1100, 1500]
  if (tMedia >= 12) return [850, 1200]
  return [600, 950]
}

function FilaMeses({
  etiqueta,
  valores,
  onChange,
  paso = 1,
}: {
  etiqueta: string
  valores: number[]
  onChange: (i: number, v: number) => void
  paso?: number
}) {
  return (
    <tr>
      <th scope="row" className="text-left font-normal text-secondary pr-2 py-1 whitespace-nowrap text-[12px]">
        {etiqueta}
      </th>
      {valores.map((v, i) => (
        <td key={i} className="px-0.5 py-1 min-w-[72px]">
          <NumCell className="!px-1 text-[13px]" label={`${etiqueta} · ${MESES[i]}`} step={paso} value={Math.round(v * 10) / 10} onChange={(n) => onChange(i, Math.max(-60, n))} />
        </td>
      ))}
      <td className="pl-2 text-right font-mono-data text-primary text-[12px] whitespace-nowrap">{nf0.format(sum(valores))}</td>
    </tr>
  )
}

export default function DemandaAgricola() {
  const nextId = useRef(2)
  const chartRef = useRef<HTMLDivElement>(null)

  // ── Clima ──
  const [pMedia, setPMedia] = useState(EJEMPLO.pMedia)
  const [pSeca, setPSeca] = useState(EJEMPLO.pSeca)
  const [eto, setEto] = useState(EJEMPLO.eto)
  const [tmax, setTmax] = useState(EJEMPLO.tmax)
  const [tmin, setTmin] = useState(EJEMPLO.tmin)
  const [latitud, setLatitud] = useState(EJEMPLO.latitud)
  const [lluvia, setLluvia] = useState<Lluvia>('media')

  // ── Cultivo y riego ──
  const [cultivos, setCultivos] = useState<Cultivo[]>(EJEMPLO.cultivos)
  const [metodoPe, setMetodoPe] = useState<MetodoPe>('porcentaje')
  const [pePct, setPePct] = useState(0.4)
  const [riego, setRiego] = useState('Aspersión móvil / cañón')
  const [eficiencia, setEficiencia] = useState(0.75)
  const [fs, setFs] = useState(1.1)

  // ── Oferta ──
  const [captacionHa, setCaptacionHa] = useState(EJEMPLO.captacionHa)
  const [textura, setTextura] = useState<SueloTextura>(baranoa.runoff.suelo)
  const [confiabilidad, setConfiabilidad] = useState<Confiabilidad>(baranoa.runoff.confiabilidad)
  const [c, setC] = useState(Math.round(baranoa.runoff.cAnual * 1000) / 1000)

  const p = lluvia === 'seca' ? pSeca : pMedia
  const pAnual = sum(p)
  const etoAnual = sum(eto)
  const tMedia = (sum(tmax) + sum(tmin)) / 24

  const r = useMemo(
    () => demandaAgricola({ p, eto, cultivos, metodoPe, pePct, eficiencia, factorSeguridad: fs, captacionHa, c }),
    [p, eto, cultivos, metodoPe, pePct, eficiencia, fs, captacionHa, c]
  )

  // ── Sugerencias calculadas a partir de los demás datos ──
  const etoHarg = useMemo(() => etoHargreavesMensual(latitud, tmax, tmin), [latitud, tmax, tmin])
  const etoHargAnual = sum(etoHarg)
  const [etoMin, etoMax] = rangoEtoAnual(tMedia)
  const banda = bandaFromClimate(pAnual, etoAnual)
  const rangoC = annualCRange(banda, confiabilidad, textura)
  const peScsPct = pAnual > 0 ? sum(p.map(peUsdaScs)) / pAnual : 0
  const relacionSeca = sum(pMedia) > 0 ? sum(pSeca) / sum(pMedia) : 0
  const riegoSel = RIEGOS.find((x) => x.nombre === riego)

  const set12 = (setter: React.Dispatch<React.SetStateAction<number[]>>) => (i: number, v: number) =>
    setter((arr) => arr.map((x, k) => (k === i ? v : x)))

  const aplicarEscenario = (e: (typeof ESCENARIOS)[number]) => {
    setLluvia(e.lluvia)
    setMetodoPe('porcentaje')
    setPePct(e.pePct)
    setFs(e.fs)
  }

  const restablecer = () => {
    setPMedia(EJEMPLO.pMedia)
    setPSeca(EJEMPLO.pSeca)
    setEto(EJEMPLO.eto)
    setTmax(EJEMPLO.tmax)
    setTmin(EJEMPLO.tmin)
    setLatitud(EJEMPLO.latitud)
    setLluvia('media')
    setCultivos(EJEMPLO.cultivos)
    setMetodoPe('porcentaje')
    setPePct(0.4)
    setRiego('Aspersión móvil / cañón')
    setEficiencia(0.75)
    setFs(1.1)
    setCaptacionHa(EJEMPLO.captacionHa)
    setTextura(baranoa.runoff.suelo)
    setConfiabilidad(baranoa.runoff.confiabilidad)
    setC(Math.round(baranoa.runoff.cAnual * 1000) / 1000)
  }

  const limpiar = () => {
    setPMedia(Array(12).fill(0))
    setPSeca(Array(12).fill(0))
    setEto(Array(12).fill(0))
    setCultivos([{ id: nextId.current++, nombre: CULTIVOS[0].nombre, ha: 1, kc: CULTIVOS[0].kc }])
    setCaptacionHa(0)
  }

  const chartData = r.meses.map((m) => ({ mes: MESES[m.mes], demanda: Math.round(m.volDiseno), oferta: Math.round(m.oferta) }))
  const tri = r.trimestreCritico
  const triLabel = `${MESES[tri.inicio]}–${MESES[(tri.inicio + 2) % 12]}`

  const lectura = useMemo(() => {
    const list: { tone: Tone; text: string }[] = []
    if (r.volDiseno <= 0) {
      list.push({ tone: 'good', text: 'Con estos datos la lluvia efectiva cubre la demanda del cultivo todo el año: no se requiere riego.' })
      return list
    }
    list.push({
      tone: r.cobertura >= 1 ? 'good' : r.cobertura >= 0.5 ? 'warn' : 'bad',
      text: `La escorrentía captable cubre ${pct(Math.min(r.cobertura, 9.99))} de la demanda de riego de diseño (${nf0.format(r.oferta)} de ${nf0.format(r.volDiseno)} m³/año).`,
    })
    if (r.cobertura >= 1)
      list.push({
        tone: 'warn',
        text: `Para trasladar el agua de los meses con excedente a los secos se necesitan ≈ ${nf0.format(r.almacenamiento)} m³ de almacenamiento; el trimestre más exigente es ${triLabel} con ${nf0.format(tri.volumen)} m³.`,
      })
    else
      list.push({
        tone: 'warn',
        text: `La escorrentía de los meses de déficit se usa directo; solo ${nf0.format(r.almacenamiento)} m³ de excedente pueden guardarse para después. El trimestre más exigente es ${triLabel} con ${nf0.format(tri.volumen)} m³.`,
      })
    if (r.deficit > 0)
      list.push({
        tone: 'bad',
        text: `Faltan ${nf0.format(r.deficit)} m³/año que deben venir de otra fuente (pozo, río, cosecha en techos) o reducirse con más infiltración, cobertura y eficiencia de riego.`,
      })
    if (eficiencia < 0.6)
      list.push({ tone: 'warn', text: 'Eficiencia de riego baja: pasar a aspersión o goteo reduce el volumen bruto entre 25 y 40 %.' })
    return list
  }, [r, eficiencia, triLabel, tri.volumen])

  const construirPDF = async (cliente: string): Promise<Reporte> => {
    const g = await graficaAPng(chartRef.current)
    const bloques: Bloque[] = [
      {
        tipo: 'kpis',
        items: [
          { k: 'Demanda de riego (diseño)', v: `${nf0.format(r.volDiseno)} m³/año`, sub: `${nf1.format(r.areaHa)} ha · ${r.mesesConRiego} meses con riego` },
          { k: 'Oferta de escorrentía', v: `${nf0.format(r.oferta)} m³/año`, sub: `cobertura ${pct(r.cobertura)}` },
          { k: r.cobertura >= 1 ? 'Almacenamiento necesario' : 'Excedente almacenable', v: `${nf0.format(r.almacenamiento)} m³`, sub: `trimestre crítico ${triLabel}` },
        ],
      },
      { tipo: 'titulo', texto: 'Supuestos' },
      {
        tipo: 'kv',
        filas: [
          ['Lluvia de diseño', lluvia === 'seca' ? `Año seco (P80): ${nf0.format(pAnual)} mm/año` : `Año medio: ${nf0.format(pAnual)} mm/año`],
          ['ETo anual', `${nf0.format(etoAnual)} mm/año`],
          ['Lluvia efectiva', metodoPe === 'usda-scs' ? 'USDA-SCS (CROPWAT)' : `${pct(pePct)} de la lluvia`],
          ['Sistema de riego · eficiencia', `${riego} · ${nf2.format(eficiencia)}`],
          ['Factor de seguridad', nf2.format(fs)],
          ['Área de captación · coeficiente C', `${nf2.format(captacionHa)} ha · ${pct(c)} (GUARDAR, ${SUELO_TEXTURA_LABEL[textura].toLowerCase()})`],
        ],
      },
      {
        tipo: 'tabla',
        head: ['Cultivo', 'Área ha', 'Kc'],
        body: cultivos.map((cu) => [cu.nombre, nf2.format(cu.ha), nf2.format(cu.kc)]),
      },
      ...(g ? [{ tipo: 'grafica' as const, titulo: 'Demanda de riego de diseño vs. oferta de escorrentía por mes, m³', png: g.png, ratio: g.ratio }] : []),
      { tipo: 'titulo', texto: 'Balance mensual' },
      {
        tipo: 'tabla',
        head: ['Mes', 'P mm', 'Pe mm', 'ETo mm', 'ETc mm', 'Req. neto mm', 'Diseño m³', 'Oferta m³', 'Balance m³'],
        body: r.meses.map((m) => [
          MESES[m.mes],
          nf1.format(m.p),
          nf1.format(m.pe),
          nf1.format(m.eto),
          nf1.format(m.etc),
          nf1.format(m.reqNetoMm),
          nf0.format(m.volDiseno),
          nf0.format(m.oferta),
          nf0.format(m.balance),
        ]),
        foot: [['Año', nf0.format(pAnual), '', nf0.format(etoAnual), '', '', nf0.format(r.volDiseno), nf0.format(r.oferta), nf0.format(r.oferta - r.volDiseno)]],
      },
      { tipo: 'titulo', texto: 'Lectura' },
      ...lectura.map((l) => ({ tipo: 'nota' as const, texto: l.text, tono: l.tone === 'good' ? ('good' as const) : ('warn' as const) })),
    ]
    return {
      herramienta: 'Demanda hídrica agrícola',
      titulo: 'Demanda hídrica agrícola y oferta de escorrentía',
      subtitulo: 'Req. neto = máx(0; Kc·ETo − Pe) · bruto = neto / eficiencia · diseño = bruto × factor de seguridad · oferta = 10·C·A·P.',
      cliente,
      slug: 'demanda-hidrica-agricola',
      disclaimer:
        'Estimación de planeación con promedios mensuales. Valide la lluvia y la ETo con la estación más cercana, el Kc por etapa del cultivo y el coeficiente de escorrentía con aforos antes de dimensionar obras.',
      bloques,
    }
  }

  const btnBase = 'px-3 py-1.5 rounded-lg border text-[13px] transition-colors'

  return (
    <ToolFrame
      id="demanda-agricola"
      fondo="tech-grid"
      number="04"
          title={
            <>
              Demanda hídrica <Accent>agrícola</Accent>
            </>
          }
          subtitle={
            <>
              Cuánta agua de riego necesita tu cultivo mes a mes y cuánto aporta la lluvia que escurre en tu predio. Sirve en
              cualquier lugar: ingresa tus datos o usa el ejemplo precargado de la {baranoa.name} ({baranoa.location}). Cada
              casilla sugiere un rango según los demás datos.
            </>
          }
    >

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-10 items-start">
          <div className="space-y-6 min-w-0">
            {/* Escenarios */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-mono text-[12px] mr-1">Escenario rápido:</span>
              {ESCENARIOS.map((e) => (
                <button key={e.id} type="button" title={e.desc} onClick={() => aplicarEscenario(e)} className={`${btnBase} border-strong text-secondary hover:border-brand/50 hover:text-brand`}>
                  {e.nombre}
                </button>
              ))}
              <span className="flex-1" />
              <button type="button" onClick={restablecer} className="text-mono text-xs hover:text-brand transition-colors">
                Ejemplo {baranoa.name}
              </button>
              <button type="button" onClick={limpiar} className="text-mono text-xs hover:text-brand transition-colors">
                Empezar en blanco
              </button>
            </div>

            {/* 01 · Clima */}
            <Card
              title="01 · Lluvia y evapotranspiración"
              hint="Valores mensuales en mm. Use la estación más cercana (en Colombia, IDEAM DHIME) o una fuente satelital (CHIRPS para lluvia, NASA POWER para clima)."
            >
              <div className="overflow-x-auto -mx-1 px-1">
                <table className="w-full min-w-[1060px] border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left font-mono text-[10px] uppercase tracking-wide text-mono font-normal pb-2">mm/mes</th>
                      {MESES.map((m) => (
                        <th key={m} className="font-mono text-[10px] uppercase tracking-wide text-mono font-normal pb-2 text-right pr-2">
                          {m}
                        </th>
                      ))}
                      <th className="font-mono text-[10px] uppercase tracking-wide text-mono font-normal pb-2 text-right">Año</th>
                    </tr>
                  </thead>
                  <tbody>
                    <FilaMeses etiqueta="Lluvia año medio" valores={pMedia} onChange={set12(setPMedia)} />
                    <FilaMeses etiqueta="Lluvia año seco" valores={pSeca} onChange={set12(setPSeca)} />
                    <FilaMeses etiqueta="ETo" valores={eto} onChange={set12(setEto)} />
                  </tbody>
                </table>
              </div>
              <div className="mt-2 space-y-1">
                <Hint>
                  Año seco = lluvia superada 4 de cada 5 años (P80). Suele ser 60–85 % del año medio; aquí es{' '}
                  <span className="text-secondary">{pct(relacionSeca)}</span>
                  {relacionSeca > 0 && (relacionSeca < 0.5 || relacionSeca > 0.95) ? ' — revise si es coherente.' : '.'} Sin serie
                  histórica, use 0,7 × el año medio.
                </Hint>
                <Hint>
                  ETo anual {nf0.format(etoAnual)} mm. Para una temperatura media de {nf1.format(tMedia)} °C lo esperable es{' '}
                  {nf0.format(etoMin)}–{nf0.format(etoMax)} mm/año; Hargreaves con su latitud y temperaturas da ≈{' '}
                  <span className="text-secondary">{nf0.format(etoHargAnual)} mm</span>
                  {etoAnual > 0 && Math.abs(etoAnual / etoHargAnual - 1) > 0.25 ? ' — diferencia mayor al 25 %: revise.' : '.'}
                </Hint>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Lluvia para el diseño"
                  value={lluvia}
                  options={[
                    { value: 'media', label: 'Año medio' },
                    { value: 'seca', label: 'Año seco (P80) — más seguro' },
                  ]}
                  onChange={setLluvia}
                  hint="Para obras de almacenamiento se recomienda el año seco: el sistema debe funcionar 4 de cada 5 años."
                />
                <NumField
                  label="Latitud (para estimar ETo)"
                  unit="° (sur negativo)"
                  min={-60}
                  max={60}
                  step={0.1}
                  value={latitud}
                  onChange={setLatitud}
                  hint="Solo se usa si estima la ETo con Hargreaves."
                />
              </div>

              <details className="mt-4 group">
                <summary className="cursor-pointer text-[13px] text-brand hover:underline list-none">
                  ¿No tiene ETo? Estimarla con temperaturas (Hargreaves)
                </summary>
                <div className="mt-3 overflow-x-auto -mx-1 px-1">
                  <table className="w-full min-w-[1060px] border-collapse">
                    <tbody>
                      <FilaMeses etiqueta="T máx °C" valores={tmax} onChange={set12(setTmax)} paso={0.1} />
                      <FilaMeses etiqueta="T mín °C" valores={tmin} onChange={set12(setTmin)} paso={0.1} />
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setEto(etoHarg.map((x) => Math.round(x * 10) / 10))}
                    className={`${btnBase} border-brand/40 text-brand hover:bg-brand/10`}
                  >
                    Usar ETo estimada ({nf0.format(etoHargAnual)} mm/año)
                  </button>
                  <Hint>
                    Hargreaves-Samani (FAO-56 ec. 52) usa solo temperaturas y latitud: puede sobrestimar 10–20 % en clima húmedo.
                    Prefiera Penman-Monteith o CROPWAT si tiene humedad, viento y brillo solar.
                  </Hint>
                </div>
              </details>
            </Card>

            {/* 02 · Cultivo y riego */}
            <Card title="02 · Cultivo y riego">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="font-mono text-[10px] uppercase tracking-wide text-mono">
                      <th className="text-left font-normal pb-2">Cultivo o cobertura</th>
                      <th className="text-right font-normal pb-2 w-24">Área ha</th>
                      <th className="text-right font-normal pb-2 w-20">Kc</th>
                      <th className="text-left font-normal pb-2 pl-3">Kc sugerido</th>
                      <th className="w-9" />
                    </tr>
                  </thead>
                  <tbody>
                    {cultivos.map((cu, i) => {
                      const ref = CULTIVOS.find((x) => x.nombre === cu.nombre)
                      return (
                        <tr key={cu.id} className="border-t border-subtle">
                          <td className="py-1">
                            <SelectCell
                              label="Cultivo"
                              value={cu.nombre}
                              options={CULTIVOS.map((x) => ({ value: x.nombre, label: x.nombre }))}
                              onChange={(v) =>
                                setCultivos((cs) =>
                                  cs.map((x, k) => (k === i ? { ...x, nombre: v, kc: CULTIVOS.find((y) => y.nombre === v)?.kc ?? x.kc } : x))
                                )
                              }
                            />
                          </td>
                          <td>
                            <NumCell label="Área" step={0.1} value={cu.ha} onChange={(v) => setCultivos((cs) => cs.map((x, k) => (k === i ? { ...x, ha: Math.max(0, v) } : x)))} />
                          </td>
                          <td>
                            <NumCell label="Kc" step={0.01} value={cu.kc} onChange={(v) => setCultivos((cs) => cs.map((x, k) => (k === i ? { ...x, kc: Math.max(0, v) } : x)))} />
                          </td>
                          <td className="pl-3 text-[11px] text-mono leading-snug">
                            {ref ? `${nf2.format(ref.kc)} (${ref.fuente}); ±0,15 según etapa` : 'Kc medio de temporada 0,4–1,2'}
                          </td>
                          <td>
                            <DelButton label="Quitar cultivo" onClick={() => setCultivos((cs) => cs.filter((_, k) => k !== i))} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <AddButton onClick={() => setCultivos((cs) => [...cs, { id: nextId.current++, nombre: CULTIVOS[0].nombre, ha: 1, kc: CULTIVOS[0].kc }])}>
                Agregar cultivo
              </AddButton>

              <Grid cols={2} className="mt-5">
                <SelectField
                  label="Lluvia efectiva"
                  value={metodoPe}
                  options={[
                    { value: 'porcentaje', label: 'Porcentaje fijo de la lluvia' },
                    { value: 'usda-scs', label: 'USDA-SCS (como CROPWAT)' },
                  ]}
                  onChange={setMetodoPe}
                  hint={`Con su lluvia, USDA-SCS aprovecharía ≈ ${pct(peScsPct)} en promedio.`}
                />
                {metodoPe === 'porcentaje' ? (
                  <NumField
                    label="Lluvia efectiva"
                    unit="% de P"
                    min={0}
                    max={100}
                    step={5}
                    value={Math.round(pePct * 100)}
                    onChange={(v) => setPePct(Math.min(1, Math.max(0, v / 100)))}
                    hint={`Sugerido: 30 % en año seco o suelo compactado; 40–60 % en año medio con buena cobertura; hasta 70–80 % con lluvias suaves y suelo de alta infiltración. USDA-SCS aquí: ${pct(peScsPct)}.`}
                  />
                ) : (
                  <div />
                )}
                <SelectField
                  label="Sistema de riego"
                  value={riego}
                  options={RIEGOS.filter((x) => x.eficiencia > 0).map((x) => ({ value: x.nombre, label: x.nombre }))}
                  onChange={(v) => {
                    setRiego(v)
                    const e = RIEGOS.find((x) => x.nombre === v)?.eficiencia
                    if (e) setEficiencia(e)
                  }}
                  hint="Al cambiarlo se propone su eficiencia típica (IICA, AGROSAVIA)."
                />
                <NumField
                  label="Eficiencia de aplicación"
                  unit="0–1"
                  min={0.3}
                  max={0.95}
                  step={0.01}
                  value={eficiencia}
                  onChange={(v) => setEficiencia(Math.min(1, Math.max(0.1, v)))}
                  hint={`${riegoSel ? `${riegoSel.nombre}: ${nf2.format(riegoSel.eficiencia)}. ` : ''}Goteo 0,85–0,90 · aspersión 0,70–0,83 · gravedad 0,40–0,55.`}
                />
                <NumField
                  label="Factor de seguridad"
                  unit="×"
                  min={1}
                  max={1.5}
                  step={0.05}
                  value={fs}
                  onChange={(v) => setFs(Math.max(1, v))}
                  hint="1,0 ideal · 1,1 promedio · 1,2 crítico. Súbalo si los datos de lluvia son cortos o de otra estación."
                />
              </Grid>
            </Card>

            {/* 03 · Oferta */}
            <Card
              title="03 · Oferta de escorrentía"
              hint="Agua de lluvia que escurre hacia jagüeyes, reservorios o swales. Método oficial del sitio, modo GUARDAR: V = 10 · C · A · P."
            >
              <Grid cols={2}>
                <NumField
                  label="Área que drena al almacenamiento"
                  unit="ha"
                  min={0}
                  step={0.1}
                  value={captacionHa}
                  onChange={(v) => setCaptacionHa(Math.max(0, v))}
                  hint={`Solo las microcuencas que llegan al reservorio. Área regada: ${nf1.format(r.areaHa)} ha.`}
                />
                <NumField
                  label="Coeficiente de escorrentía C"
                  unit="%"
                  min={0}
                  max={100}
                  step={0.5}
                  value={Math.round(c * 1000) / 10}
                  onChange={(v) => setC(Math.min(1, Math.max(0, v / 100)))}
                  hint={
                    <>
                      Tabla 2.3 para {BANDA_LLUVIA_EVAP_LABEL[banda].toLowerCase()} y su suelo:{' '}
                      <span className="text-secondary">{rangoC ? `${pct(rangoC[0])}–${pct(rangoC[1])}` : 'sin dato para esta combinación'}</span>
                      . Techos 90–100 %, potreros 0–8 %, vías sin cobertura 25–40 %.
                      {rangoC && (c < rangoC[0] || c > rangoC[1]) ? ' Su valor está fuera del rango.' : ''}
                    </>
                  }
                />
                <SelectField
                  label="Textura del suelo"
                  value={textura}
                  options={TEXTURAS.map((t) => ({ value: t, label: SUELO_TEXTURA_LABEL[t] }))}
                  onChange={setTextura}
                />
                <SelectField
                  label="Confiabilidad del diseño"
                  value={confiabilidad}
                  options={(Object.keys(CONFIABILIDAD_LABEL) as Confiabilidad[]).map((k) => ({ value: k, label: CONFIABILIDAD_LABEL[k] }))}
                  onChange={setConfiabilidad}
                />
              </Grid>
              {rangoC && (
                <button
                  type="button"
                  onClick={() => setC(Math.round(((rangoC[0] + rangoC[1]) / 2) * 1000) / 1000)}
                  className={`mt-4 ${btnBase} border-strong text-secondary hover:border-brand/50 hover:text-brand`}
                >
                  Usar el punto medio de la tabla ({pct((rangoC[0] + rangoC[1]) / 2)})
                </button>
              )}
            </Card>

            <div ref={chartRef}>
              <ChartFrame
                title="Demanda de riego de diseño vs. oferta de escorrentía (m³/mes)"
                height={280}
                legend={[
                  { role: 'demand', label: 'Demanda de diseño' },
                  { role: 'water', label: 'Oferta de escorrentía' },
                ]}
              >
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="mes" {...xAxisProps} />
                  <YAxis {...yAxisProps} width={56} tickFormatter={(v: number) => nf0.format(v)} />
                  <Tooltip cursor={barCursor} content={<ChartTooltip unit="m³" format={(v) => nf0.format(v)} />} />
                  <Bar dataKey="demanda" name="Demanda" fill={series.demand} radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="oferta" name="Oferta" fill={series.water} radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ChartFrame>
            </div>

            <Card title="Balance mensual">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-[12px] font-mono-data border-collapse">
                  <thead>
                    <tr className="font-mono text-[10px] uppercase tracking-wide text-mono">
                      {['Mes', 'P', 'Pe', 'ETo', 'ETc', 'Req. neto', 'Diseño m³', 'Oferta m³', 'Balance m³'].map((h, k) => (
                        <th key={h} className={`font-normal pb-2 ${k === 0 ? 'text-left' : 'text-right'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {r.meses.map((m) => (
                      <tr key={m.mes} className="border-t border-subtle text-right">
                        <td className="text-left text-secondary py-1.5">{MESES[m.mes]}</td>
                        <td>{nf1.format(m.p)}</td>
                        <td>{nf1.format(m.pe)}</td>
                        <td>{nf1.format(m.eto)}</td>
                        <td>{nf1.format(m.etc)}</td>
                        <td>{nf1.format(m.reqNetoMm)}</td>
                        <td className="text-primary">{nf0.format(m.volDiseno)}</td>
                        <td className="text-primary">{nf0.format(m.oferta)}</td>
                        <td className={m.balance < 0 ? 'text-signal-deficit' : 'text-brand'}>{nf0.format(m.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-strong text-right text-primary font-semibold">
                      <td className="text-left py-2">Año</td>
                      <td>{nf0.format(pAnual)}</td>
                      <td />
                      <td>{nf0.format(etoAnual)}</td>
                      <td />
                      <td />
                      <td>{nf0.format(r.volDiseno)}</td>
                      <td>{nf0.format(r.oferta)}</td>
                      <td>{nf0.format(r.oferta - r.volDiseno)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="mt-3 text-mono text-[11px] leading-relaxed">
                mm sobre el área regada; m³ ya divididos por la eficiencia y multiplicados por el factor de seguridad. Pe = lluvia efectiva; ETc = Kc × ETo
                ponderado por área.
              </p>
            </Card>
          </div>

          {/* ── Resumen ── */}
          <aside className="lg:sticky lg:top-28 p-7 lg:p-8 rounded-2xl border border-brand/20 bg-surface-raised">
            <div className="font-mono text-[10px] text-brand/70 tracking-widest uppercase mb-6">Resumen en vivo</div>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-display text-4xl font-semibold text-primary">{nf0.format(r.volDiseno)}</span>
              <span className="text-mono text-sm mb-1">m³/año</span>
            </div>
            <p className="text-mono text-[12px] mb-6">
              Demanda de riego de diseño · {nf1.format(r.areaHa)} ha · {r.mesesConRiego} meses con riego
            </p>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Volumen neto (en la raíz)', value: `${nf0.format(r.volNeto)} m³` },
                { label: 'Volumen bruto (en la bomba)', value: `${nf0.format(r.volBruto)} m³` },
                { label: 'Oferta de escorrentía', value: `${nf0.format(r.oferta)} m³` },
                { label: 'Cobertura con escorrentía', value: pct(Math.min(r.cobertura, 9.99)) },
                { label: 'Déficit a otra fuente', value: `${nf0.format(r.deficit)} m³` },
                { label: r.cobertura >= 1 ? 'Almacenamiento necesario' : 'Excedente almacenable', value: `${nf0.format(r.almacenamiento)} m³` },
                { label: `Trimestre crítico (${triLabel})`, value: `${nf0.format(tri.volumen)} m³` },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-subtle pb-2.5">
                  <span className="text-mono text-[13px]">{row.label}</span>
                  <span className="font-mono-data text-primary whitespace-nowrap">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 mb-6">
              <div className="font-mono text-[9px] text-mono tracking-widest uppercase mb-1">Lectura</div>
              {lectura.map((l, i) => (
                <div key={i} className={`p-3 rounded-lg border text-[12px] leading-relaxed ${toneClass[l.tone]}`}>
                  {l.text}
                </div>
              ))}
            </div>

            <ExportarPDF variante="secundario" etiqueta="Descargar demanda (PDF)" construir={construirPDF} />

            <a
              href={`https://wa.me/573113650567?text=${encodeURIComponent(
                `Hola, quiero diseñar el riego y la cosecha de agua de mi finca. Con la calculadora del sitio obtuve una demanda de riego de ${nf0.format(r.volDiseno)} m³/año para ${nf1.format(r.areaHa)} ha y una oferta de escorrentía de ${nf0.format(r.oferta)} m³/año.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-brand text-surface rounded-full font-semibold text-sm hover:bg-brand-hover transition-all duration-200 hover:shadow-glow"
            >
              Diseñar mi sistema de riego
            </a>
            <Note>
              Estimación con promedios mensuales: valide lluvia y ETo con la estación más cercana, el Kc por etapa del cultivo y el
              coeficiente C con aforos antes de construir.
            </Note>
          </aside>
        </div>
    </ToolFrame>
  )
}
