'use client'

import { useEffect, useMemo, useState } from 'react'
import { Accent } from '@/components/ui/SectionHeader'
import ToolFrame from '@/components/tools/ToolFrame'
import ExportarPDF from '@/components/pdf/ExportarPDF'
import { Card, Grid, Note, NumCell, NumField, SelectField, TextCell } from '@/components/predial/ui'
import { MAQUINARIA, MATERIALES, RANGO_COP_M3_ALMACENADO, TIPOLOGIAS } from '@/data/catalogos/obra'
import { PRECIOS } from '@/data/catalogos/precios'
import { movimientoTierra } from '@/lib/calculos/movimientoTierra'
import { espejoM2 } from '@/lib/calculos/almacenamiento'
import { toneClass } from '@/lib/tones'
import type { Reporte } from '@/lib/pdf/reporte'

// ── Movimiento de tierra ──
// Vista simplificada del modelo único lib/calculos/movimientoTierra (el mismo
// de la capa 03·G de Diseño Keyline Predial). Recibe ?volumen= desde la
// calculadora de demanda hídrica pecuaria.

const nf0 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })
const cop = (v: number) => `$ ${nf0.format(Math.round(v))}`
const pct = (x: number) => `${nf0.format(x * 100)} %`

export default function MovimientoTierra() {
  const [volumen, setVolumen] = useState(4000)
  const [desdeDemanda, setDesdeDemanda] = useState(false)
  const [tipologiaId, setTipologiaId] = useState(TIPOLOGIAS[0].id)
  const [ratio, setRatio] = useState(TIPOLOGIAS[0].ratio)
  const [materialId, setMaterialId] = useState('arcilla-densa')
  const [profundidad, setProfundidad] = useState(3)
  const [fraccionTerraplen, setFraccionTerraplen] = useState(0.45)
  const [asentamiento, setAsentamiento] = useState(10)
  const [descapote, setDescapote] = useState(0.25)
  const [frentes, setFrentes] = useState(MAQUINARIA.map((m) => ({ ...m })))
  const [movilizacion, setMovilizacion] = useState<number>(PRECIOS.movilizacion)
  const [viajes, setViajes] = useState(2)
  const [indirectos, setIndirectos] = useState(25)
  const [contingencia, setContingencia] = useState(0)

  // Volumen recibido desde la demanda hídrica pecuaria (?volumen=)
  useEffect(() => {
    try {
      const v = Number(new URLSearchParams(window.location.search).get('volumen'))
      if (Number.isFinite(v) && v > 0) {
        setVolumen(v)
        setDesdeDemanda(true)
      }
    } catch {
      /* sin parámetros */
    }
  }, [])

  const tipologia = TIPOLOGIAS.find((t) => t.id === tipologiaId) ?? TIPOLOGIAS[0]
  const material = MATERIALES.find((m) => m.id === materialId) ?? MATERIALES[0]

  const r = useMemo(
    () =>
      movimientoTierra({
        volumenAlmacenadoM3: volumen,
        ratioCorte: ratio,
        material,
        profundidadM: profundidad,
        fraccionTerraplen,
        asentamientoPct: asentamiento,
        espesorDescapoteM: descapote,
        frentes,
        movilizacionCOP: movilizacion,
        viajes,
        indirectosPct: indirectos,
      }),
    [volumen, ratio, material, profundidad, fraccionTerraplen, asentamiento, descapote, frentes, movilizacion, viajes, indirectos]
  )
  const costoContingencia = r.costoTotal * (contingencia / 100)
  const total = r.costoTotal + costoContingencia
  const copM3 = volumen > 0 ? total / volumen : 0
  const [rMin, rMax] = RANGO_COP_M3_ALMACENADO
  const enRango = copM3 >= rMin && copM3 <= rMax
  const espejo = espejoM2(volumen, profundidad)

  const editarFrente = (i: number, cambio: Partial<(typeof frentes)[number]>) =>
    setFrentes((fs) => fs.map((f, k) => (k === i ? { ...f, ...cambio } : f)))

  const construirPDF = (cliente: string): Reporte => ({
    herramienta: 'Movimiento de tierra',
    titulo: 'Movimiento de tierra y costo del reservorio',
    subtitulo: `${tipologia.nombre} · ${material.nombre} · ${nf0.format(volumen)} m³ almacenados.`,
    cliente,
    slug: 'movimiento-de-tierra',
    disclaimer:
      'Tarifas de campo para obra agrícola (no APU de obra pública, que son 4–8 veces mayores). Verifique la relación corte/almacenado con el levantamiento topográfico y cotice localmente antes de contratar.',
    bloques: [
      {
        tipo: 'kpis',
        items: [
          { k: 'Corte en banco', v: `${nf0.format(r.corteM3)} m³`, sub: `relación ${nf2.format(ratio)} m³/m³` },
          { k: 'Horas de máquina', v: `${nf0.format(r.horasTotales)} h` },
          { k: 'Costo total', v: cop(total), sub: `${cop(copM3)} por m³ almacenado` },
        ],
      },
      {
        tipo: 'kv',
        filas: [
          ['Volumen a almacenar', `${nf0.format(volumen)} m³`],
          ['Profundidad media · espejo de agua', `${nf1.format(profundidad)} m · ${nf0.format(espejo)} m²`],
          ['Terraplén compactado', `${nf0.format(r.terraplenM3)} m³`],
          ['Volumen suelto (esponjamiento)', `${nf0.format(r.sueltoM3)} m³`],
          ['Descapote', `${nf0.format(r.descapoteM2)} m² · ${nf0.format(r.descapoteM3)} m³`],
        ],
      },
      {
        tipo: 'tabla',
        head: ['Frente', 'Equipo', 'Cantidad', 'Rend.', 'Tarifa/h', 'Horas', 'Costo'],
        body: [
          ...r.frentes.map((f, i) => [frentes[i].rol, frentes[i].equipo, nf0.format(f.cantidad), nf0.format(f.rendimiento), cop(f.tarifa), nf1.format(f.horas), cop(f.costo)]),
          ['Movilización', `${viajes} viajes de cama baja`, '', '', '', '', cop(r.costoMovilizacion)],
        ],
        foot: [
          ['Costo directo', '', '', '', '', '', cop(r.costoDirecto)],
          [`Indirectos ${indirectos} %`, '', '', '', '', '', cop(r.costoIndirectos)],
          ...(contingencia > 0 ? [[`Contingencia ${contingencia} %`, '', '', '', '', '', cop(costoContingencia)]] : []),
          ['TOTAL', '', '', '', '', '', cop(total)],
        ],
        alinear: ['left', 'left', 'right', 'right', 'right', 'right', 'right'],
        anchos: [16, 26, 11, 8, 13, 8, 18],
      },
      {
        tipo: 'nota',
        tono: enRango ? 'good' : 'warn',
        texto: `${cop(copM3)} por m³ almacenado ${enRango ? 'está dentro' : 'queda fuera'} del rango colombiano de referencia (${nf0.format(rMin)}–${nf0.format(rMax)} COP/m³).`,
      },
    ],
  })

  return (
    <ToolFrame
      id="movimiento-tierra"
      number="02"
      fondo="tech-grid"
      title={
        <>
          Movimiento de <Accent>tierra</Accent>
        </>
      }
      subtitle="Cuánta tierra hay que mover para almacenar el agua, cuántas horas de maquinaria toma y cuánto cuesta por metro cúbico almacenado. Es el mismo modelo de Diseño Keyline Predial."
    >
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
        <div className="space-y-6 min-w-0">
          <Card title="Reservorio">
            <Grid cols={2}>
              <NumField
                label="Volumen de agua a almacenar"
                unit="m³"
                min={0}
                step={50}
                value={volumen}
                onChange={(v) => {
                  setVolumen(Math.max(0, v))
                  setDesdeDemanda(false)
                }}
                hint={
                  desdeDemanda ? (
                    'Viene de la calculadora de demanda hídrica pecuaria.'
                  ) : (
                    <>
                      ¿No lo sabe?{' '}
                      <a href="/herramientas/demanda-hidrica-pecuaria" className="text-brand hover:underline">
                        Calcúlelo con la demanda del hato
                      </a>{' '}
                      o con la demanda agrícola.
                    </>
                  )
                }
              />
              <NumField
                label="Profundidad media"
                unit="m"
                min={1}
                max={12}
                step={0.1}
                value={profundidad}
                onChange={(v) => setProfundidad(Math.max(0.5, v))}
                hint={`Espejo resultante ≈ ${nf0.format(espejo)} m². 2,5–4 m reduce la evaporación sin encarecer mucho el corte; el doble de profundidad pierde la mitad por evaporación.`}
              />
              <SelectField
                label="Tipología"
                value={tipologiaId}
                options={TIPOLOGIAS.map((t) => ({ value: t.id, label: t.nombre }))}
                onChange={(v) => {
                  setTipologiaId(v)
                  setRatio(TIPOLOGIAS.find((t) => t.id === v)?.ratio ?? ratio)
                }}
                hint="La forma del sitio decide el costo: una presa en vaguada mueve 3–5 veces menos tierra que un jagüey en plano."
              />
              <NumField
                label="Relación corte / almacenado"
                unit="m³/m³"
                min={0.05}
                step={0.01}
                value={ratio}
                onChange={(v) => setRatio(Math.max(0, v))}
                hint={`Rango para esta tipología: ${nf2.format(tipologia.ratioMin)}–${nf2.format(tipologia.ratioMax)}. Ajústelo con el levantamiento topográfico.${
                  ratio < tipologia.ratioMin || ratio > tipologia.ratioMax ? ' Su valor está fuera del rango.' : ''
                }`}
              />
              <SelectField
                label="Material dominante"
                value={materialId}
                options={MATERIALES.map((m) => ({ value: m.id, label: m.nombre }))}
                onChange={setMaterialId}
                hint={`Esponjamiento ${pct(material.esponjamiento)} · contracción al compactar ${pct(material.contraccion)}.`}
              />
              <NumField
                label="Fracción del corte que va al terraplén"
                unit="0–1"
                min={0}
                max={1}
                step={0.05}
                value={fraccionTerraplen}
                onChange={(v) => setFraccionTerraplen(Math.min(1, Math.max(0, v)))}
                hint="0,4–0,6 en presas de tierra; 0 en jagüeyes excavados donde todo el material se retira."
              />
            </Grid>
            <details className="mt-4">
              <summary className="cursor-pointer text-[13px] text-brand hover:underline list-none">Parámetros avanzados</summary>
              <Grid cols={2} className="mt-4">
                <NumField
                  label="Sobreelevación por asentamiento"
                  unit="%"
                  min={0}
                  max={20}
                  step={1}
                  value={asentamiento}
                  onChange={(v) => setAsentamiento(Math.max(0, v))}
                  hint="5 % con buena compactación por capas; 10 % (NRCS 378) si se compacta solo con maquinaria de corte."
                />
                <NumField
                  label="Espesor de descapote"
                  unit="m"
                  min={0}
                  max={1}
                  step={0.05}
                  value={descapote}
                  onChange={(v) => setDescapote(Math.max(0, v))}
                  hint="0,15–0,30 m de capa vegetal; guárdela para empradizar los taludes."
                />
              </Grid>
            </details>
          </Card>

          <Card title="Maquinaria y costos" hint="Tarifas por hora con operador y combustible. Cotice localmente: varían ±30 % por región.">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm border-collapse">
                <thead>
                  <tr className="font-mono text-[10px] uppercase tracking-wide text-mono">
                    <th className="text-left font-normal pb-2">Frente</th>
                    <th className="text-left font-normal pb-2">Equipo</th>
                    <th className="text-right font-normal pb-2 w-24">Cantidad</th>
                    <th className="text-right font-normal pb-2 w-24">Rend.</th>
                    <th className="text-right font-normal pb-2 w-28">Tarifa COP/h</th>
                    <th className="text-right font-normal pb-2 w-16">Horas</th>
                    <th className="text-right font-normal pb-2 w-28">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {r.frentes.map((f, i) => (
                    <tr key={f.id} className="border-t border-subtle">
                      <td className="text-secondary whitespace-nowrap pr-2">{frentes[i].rol}</td>
                      <td className="min-w-[200px]">
                        <TextCell label="Equipo" value={frentes[i].equipo} onChange={(v) => editarFrente(i, { equipo: v })} />
                      </td>
                      <td className="text-right font-mono-data text-mono whitespace-nowrap">
                        {nf0.format(f.cantidad)} {frentes[i].unidad.split('/')[0]}
                      </td>
                      <td>
                        <NumCell label={`Rendimiento (${frentes[i].unidad})`} step={1} value={frentes[i].rendimiento} onChange={(v) => editarFrente(i, { rendimiento: Math.max(0, v) })} />
                      </td>
                      <td>
                        <NumCell label="Tarifa por hora" step={5000} value={frentes[i].tarifa} onChange={(v) => editarFrente(i, { tarifa: Math.max(0, v) })} />
                      </td>
                      <td className="text-right font-mono-data text-primary">{nf1.format(f.horas)}</td>
                      <td className="text-right font-mono-data text-primary whitespace-nowrap">{cop(f.costo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Grid cols={2} className="mt-5">
              <NumField
                label="Movilización de maquinaria"
                unit="COP/viaje"
                min={0}
                step={100000}
                value={movilizacion}
                onChange={(v) => setMovilizacion(Math.max(0, v))}
                hint="Cama baja ida o regreso; sube con la distancia y el estado de la vía."
              />
              <NumField
                label="Viajes de cama baja"
                unit="und"
                min={0}
                step={1}
                value={viajes}
                onChange={(v) => setViajes(Math.max(0, Math.round(v)))}
                hint="2 para un frente (ida y regreso); sume 2 por cada equipo pesado adicional."
              />
              <NumField
                label="Indirectos de obra"
                unit="%"
                min={0}
                max={60}
                step={1}
                value={indirectos}
                onChange={(v) => setIndirectos(Math.max(0, v))}
                hint="15–30 %: dirección de obra, topografía de replanteo, imprevistos menores."
              />
              <NumField
                label="Contingencia"
                unit="%"
                min={0}
                max={40}
                step={1}
                value={contingencia}
                onChange={(v) => setContingencia(Math.max(0, v))}
                hint="Opcional. 5–10 % si no hay estudio geotécnico del sitio."
              />
            </Grid>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-28 p-7 lg:p-8 rounded-2xl border border-brand/20 bg-surface-raised">
          <div className="font-mono text-[10px] text-brand/70 tracking-widest uppercase mb-6">Resumen en vivo</div>
          <div className="flex items-end gap-2 mb-1">
            <span className="font-display text-4xl font-semibold text-primary">{cop(total)}</span>
          </div>
          <p className="text-mono text-[12px] mb-6">Costo total del movimiento de tierra</p>
          <div className="space-y-3 mb-5">
            {[
              { label: 'Corte en banco', value: `${nf0.format(r.corteM3)} m³` },
              { label: 'Terraplén compactado', value: `${nf0.format(r.terraplenM3)} m³` },
              { label: 'Volumen suelto', value: `${nf0.format(r.sueltoM3)} m³` },
              { label: 'Horas de máquina', value: `${nf0.format(r.horasTotales)} h` },
              { label: 'Costo directo', value: cop(r.costoDirecto) },
              { label: `Indirectos ${indirectos} %`, value: cop(r.costoIndirectos) },
              ...(contingencia > 0 ? [{ label: `Contingencia ${contingencia} %`, value: cop(costoContingencia) }] : []),
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-subtle pb-2.5">
                <span className="text-mono text-[13px]">{row.label}</span>
                <span className="font-mono-data text-primary whitespace-nowrap">{row.value}</span>
              </div>
            ))}
          </div>
          <div className={`p-3 rounded-lg border text-[12px] leading-relaxed mb-6 ${toneClass[enRango ? 'good' : 'warn']}`}>
            <strong>{cop(copM3)} por m³ almacenado.</strong>{' '}
            {enRango
              ? `Dentro del rango colombiano de referencia (${nf0.format(rMin)}–${nf0.format(rMax)} COP/m³).`
              : `Fuera del rango de referencia (${nf0.format(rMin)}–${nf0.format(rMax)} COP/m³): revise tarifas, rendimientos o la relación corte/almacenado.`}
          </div>
          <ExportarPDF variante="secundario" etiqueta="Descargar cotización (PDF)" construir={construirPDF} />
          <a
            href={`https://wa.me/573113650567?text=${encodeURIComponent(
              `Hola, quiero cotizar un reservorio. Con la calculadora del sitio obtuve ${nf0.format(volumen)} m³ almacenados, ${nf0.format(r.corteM3)} m³ de corte y un costo estimado de ${cop(total)}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center w-full px-6 py-4 bg-brand text-surface rounded-full font-semibold text-sm hover:bg-brand-hover transition-all duration-200 hover:shadow-glow"
          >
            Solicitar cotización real
          </a>
          <Note>Estimación preliminar con tarifas de campo; no reemplaza el diseño ni la topografía del sitio.</Note>
        </aside>
      </div>
    </ToolFrame>
  )
}
