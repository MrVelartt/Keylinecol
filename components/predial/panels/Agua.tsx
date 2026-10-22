'use client'

import { Accent } from '@/components/ui/SectionHeader'
import { ANIMALES, CULTIVOS, FACTORES_TEMPERATURA, RIEGOS } from '@/data/catalogos/agua'
import { FONDOS, MATERIALES, RANGO_COP_M3_ALMACENADO, TIPOLOGIAS } from '@/data/catalogos/obra'
import { cMedio, nuevoId } from '@/data/catalogos/predial'
import { SUPERFICIE_GUARDAR_LABEL, SUPERFICIE_GUARDAR_RANGE, type SuperficieGuardar } from '@/lib/calculos/escorrentia'
import CostTable from '../CostTable'
import { cop, copC, nf, nf1, nf2 } from '../fmt'
import {
  AddButton,
  Card,
  DelButton,
  Grid,
  Note,
  Num,
  NumCell,
  NumField,
  PanelHeader,
  Pill,
  SelectCell,
  SelectField,
  Stat,
  Stats,
  Table,
  TextCell,
  type PanelProps,
} from '../ui'

const SUPERFICIES = Object.keys(SUPERFICIE_GUARDAR_LABEL) as SuperficieGuardar[]
const pct = (x: number) => `${nf(x * 100)} %`

export default function Agua({ s, r, set }: PanelProps) {
  const ag = s.agua
  const ti = s.tierra
  const material = MATERIALES.find((m) => m.id === s.relieve.materialId) ?? MATERIALES[0]
  const n = (k: keyof typeof ag) => (v: number) => set((d) => void ((d.agua[k] as number) = v))
  const nt = (k: 'fraccionTerraplen' | 'espesorDescapoteM' | 'asentamientoPct' | 'movilizacion' | 'viajes' | 'indirectosPct' | 'ratio') => (v: number) =>
    set((d) => void (d.tierra[k] = v))
  const [rMin, rMax] = RANGO_COP_M3_ALMACENADO
  const rangoOk = r.copM3Almacenado >= rMin && r.copM3Almacenado <= rMax
  const tipologia = TIPOLOGIAS.find((t) => t.id === ag.tipologiaId)
  const reservorios = Math.max(1, ag.reservorios)

  return (
    <>
      <PanelHeader
        eyebrow="Capa 03 · el corazón del diseño"
        title={
          <>
            <Accent>Agua</Accent>
          </>
        }
      >
        Demanda hídrica de la finca, oferta cosechable de lluvia, dimensionamiento del almacenamiento y volumen de movimiento de
        tierras con su costo.
      </PanelHeader>

      <div className="space-y-5">
        <Stats>
          <Stat accent k="Demanda total anual" v={`${nf(r.demandaAnual)} m³`} sub="agrícola + pecuaria + doméstica + forestal" />
          <Stat k="Demanda en época seca" v={`${nf(r.demandaSeca)} m³`} sub={`${r.dias} días críticos`} />
          <Stat k="Oferta cosechable" v={`${nf(r.oferta)} m³/año`} sub="escorrentía interceptable · GUARDAR" />
          <Stat
            k="Balance oferta / demanda"
            v={`${nf2(r.balance)} ×`}
            sub={r.balance >= 1 ? <Pill tone="good">suficiente</Pill> : <Pill tone="bad">deficitario</Pill>}
          />
          <Stat k="Volumen a construir" v={`${nf(r.volumenDiseno)} m³`} sub={`${reservorios} reservorio${reservorios > 1 ? 's' : ''}`} />
        </Stats>

        {/* A · Agrícola */}
        <Card
          title="A · Demanda agrícola"
          tag="ETc = Kc × ETo"
          hint="Solo se contabiliza el déficit: lo que la lluvia efectiva no alcanza a cubrir durante los meses secos."
        >
          <Table minWidth={860}>
            <thead>
              <tr>
                <th>Cultivo o pastura</th>
                <th className="!text-right w-20">Área ha</th>
                <th className="!text-right w-20">Kc</th>
                <th className="w-52">Sistema de riego</th>
                <th className="!text-right w-20">ETc mm/d</th>
                <th className="!text-right w-24">Déficit seca mm</th>
                <th className="!text-right w-28">Bruto seca m³</th>
                <th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {r.cultivos.map((c, i) => (
                <tr key={c.id}>
                  <td>
                    <SelectCell
                      label="Cultivo"
                      value={c.nombre}
                      options={CULTIVOS.map((x) => ({ value: x.nombre, label: x.nombre }))}
                      onChange={(v) =>
                        set((d) => {
                          const row = d.agua.cultivos[i]
                          row.nombre = v
                          row.kc = CULTIVOS.find((x) => x.nombre === v)?.kc ?? row.kc
                        })
                      }
                    />
                  </td>
                  <td>
                    <NumCell label="Área" step={0.1} value={c.ha} onChange={(v) => set((d) => void (d.agua.cultivos[i].ha = v))} />
                  </td>
                  <td>
                    <NumCell label="Kc" step={0.01} value={c.kc} onChange={(v) => set((d) => void (d.agua.cultivos[i].kc = v))} />
                  </td>
                  <td>
                    <SelectCell
                      label="Sistema de riego"
                      value={c.riego}
                      options={RIEGOS.map((x) => ({ value: x.nombre, label: x.nombre }))}
                      onChange={(v) =>
                        set((d) => {
                          const row = d.agua.cultivos[i]
                          row.riego = v
                          row.eficiencia = RIEGOS.find((x) => x.nombre === v)?.eficiencia ?? row.eficiencia
                        })
                      }
                    />
                  </td>
                  <Num>{nf2(c.etcDia)}</Num>
                  <Num>{nf(c.deficitSecaMm)}</Num>
                  <Num>{nf(c.brutoSecaM3)}</Num>
                  <td>
                    <DelButton label="Eliminar cultivo" onClick={() => set((d) => void d.agua.cultivos.splice(i, 1))} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6}>Demanda agrícola en la época seca</td>
                <Num>{nf(r.dAgriSeca)}</Num>
                <td />
              </tr>
            </tfoot>
          </Table>
          <AddButton
            onClick={() =>
              set((d) =>
                void d.agua.cultivos.push({
                  id: nuevoId('cu'),
                  nombre: CULTIVOS[0].nombre,
                  ha: 1,
                  kc: CULTIVOS[0].kc,
                  riego: 'Sin riego (secano)',
                  eficiencia: 0,
                })
              )
            }
          >
            Agregar cultivo o pastura
          </AddButton>
        </Card>

        {/* B · Pecuaria */}
        <Card title="B · Demanda pecuaria">
          <Grid cols={2}>
            <SelectField
              label="Factor por temperatura"
              value={ag.factorTemperatura}
              options={FACTORES_TEMPERATURA.map((f) => ({ value: f.valor as number, label: f.nombre }))}
              onChange={n('factorTemperatura')}
            />
            <NumField
              label="Pérdidas en abrevaderos y conducción"
              unit="%"
              min={0}
              max={50}
              step={1}
              value={ag.perdidasPecuariaPct}
              onChange={n('perdidasPecuariaPct')}
            />
          </Grid>
          <div className="mt-4">
            <Table minWidth={640}>
              <thead>
                <tr>
                  <th>Especie o categoría</th>
                  <th className="!text-right w-24">Cabezas</th>
                  <th className="!text-right w-28">L/animal·día</th>
                  <th className="!text-right w-24">m³/día</th>
                  <th className="!text-right w-28">m³ época seca</th>
                  <th className="w-9" />
                </tr>
              </thead>
              <tbody>
                {r.animales.map((a, i) => (
                  <tr key={a.id}>
                    <td>
                      <SelectCell
                        label="Especie"
                        value={a.nombre}
                        options={ANIMALES.map((x) => ({ value: x.nombre, label: x.nombre }))}
                        onChange={(v) =>
                          set((d) => {
                            const row = d.agua.animales[i]
                            row.nombre = v
                            row.litrosDia = ANIMALES.find((x) => x.nombre === v)?.litrosDia ?? row.litrosDia
                          })
                        }
                      />
                    </td>
                    <td>
                      <NumCell label="Cabezas" step={1} value={a.cantidad} onChange={(v) => set((d) => void (d.agua.animales[i].cantidad = v))} />
                    </td>
                    <td>
                      <NumCell
                        label="Litros por animal al día"
                        step={0.01}
                        value={a.litrosDia}
                        onChange={(v) => set((d) => void (d.agua.animales[i].litrosDia = v))}
                      />
                    </td>
                    <Num>{nf2(a.litrosDiaTotal / 1000)}</Num>
                    <Num>{nf((a.litrosDiaTotal / 1000) * r.dias)}</Num>
                    <td>
                      <DelButton label="Eliminar categoría" onClick={() => set((d) => void d.agua.animales.splice(i, 1))} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Demanda pecuaria</td>
                  <Num>{nf2(r.dPecDia)}</Num>
                  <Num>{nf(r.dPecSeca)}</Num>
                  <td />
                </tr>
              </tfoot>
            </Table>
          </div>
          <AddButton
            onClick={() =>
              set((d) => void d.agua.animales.push({ id: nuevoId('an'), nombre: ANIMALES[1].nombre, cantidad: 1, litrosDia: ANIMALES[1].litrosDia }))
            }
          >
            Agregar especie o categoría
          </AddButton>
        </Card>

        {/* C · Doméstica */}
        <Card title="C · Demanda doméstica y de proceso">
          <Grid cols={4}>
            <NumField
              label="Personas residentes"
              unit="hab"
              min={0}
              step={1}
              value={ag.domestica.personas}
              onChange={(v) => set((d) => void (d.agua.domestica.personas = v))}
            />
            <NumField
              label="Dotación neta"
              unit="L/hab·día"
              min={0}
              step={5}
              value={ag.domestica.dotacionNeta}
              onChange={(v) => set((d) => void (d.agua.domestica.dotacionNeta = v))}
            />
            <NumField
              label="Pérdidas técnicas"
              unit="%"
              min={0}
              max={50}
              step={1}
              value={ag.domestica.perdidasPct}
              onChange={(v) => set((d) => void (d.agua.domestica.perdidasPct = v))}
            />
            <NumField
              label="Usos de proceso (ordeño, beneficio, huerta)"
              unit="L/día"
              min={0}
              step={50}
              value={ag.domestica.procesoLDia}
              onChange={(v) => set((d) => void (d.agua.domestica.procesoLDia = v))}
            />
          </Grid>
          <p className="text-mono text-[12px] mt-3 font-mono-data">
            {nf2(r.dDomDia)} m³/día · {nf(r.dDomSeca)} m³ en la época seca
          </p>
        </Card>

        {/* D · Reforestación */}
        <Card title="D · Riego de soporte a reforestación">
          <Grid cols={4}>
            <NumField label="Área a establecer" unit="ha" min={0} step={0.5} value={ag.reforestacion.ha} onChange={(v) => set((d) => void (d.agua.reforestacion.ha = v))} />
            <NumField
              label="Densidad"
              unit="árboles/ha"
              min={0}
              step={1}
              value={ag.reforestacion.densidad}
              onChange={(v) => set((d) => void (d.agua.reforestacion.densidad = v))}
            />
            <NumField
              label="Volumen por riego"
              unit="L/árbol"
              min={0}
              step={1}
              value={ag.reforestacion.litrosPorRiego}
              onChange={(v) => set((d) => void (d.agua.reforestacion.litrosPorRiego = v))}
            />
            <NumField
              label="Riegos en la época seca"
              unit="und"
              min={0}
              step={1}
              value={ag.reforestacion.riegos}
              onChange={(v) => set((d) => void (d.agua.reforestacion.riegos = v))}
            />
            <NumField
              label="Mortalidad y resiembra"
              unit="%"
              min={0}
              max={50}
              step={1}
              value={ag.reforestacion.mortalidadPct}
              onChange={(v) => set((d) => void (d.agua.reforestacion.mortalidadPct = v))}
            />
          </Grid>
          <p className="text-mono text-[12px] mt-3 font-mono-data">
            {nf(r.arboles)} árboles · {nf(r.dRef)} m³ de riego de soporte
          </p>
        </Card>

        {/* E · Oferta */}
        <Card
          title="E · Oferta cosechable de agua lluvia"
          tag="GUARDAR · V = 10 · C · A · P"
          hint="Superficies que aportan escorrentía interceptable por swales, canales keyline y techos. C es el coeficiente anual de la tabla 2.4 (Regrarians §2.19); al cambiar la superficie se toma el punto medio de su rango."
        >
          <Table minWidth={720}>
            <thead>
              <tr>
                <th>Superficie de captación</th>
                <th className="!text-right w-28">Área</th>
                <th className="w-20">Unidad</th>
                <th className="!text-right w-20">C</th>
                <th className="w-24">Rango C</th>
                <th className="!text-right w-32">Oferta m³/año</th>
                <th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {r.captacion.map((c, i) => {
                const [lo, hi] = SUPERFICIE_GUARDAR_RANGE[c.superficie]
                return (
                  <tr key={c.id}>
                    <td>
                      <SelectCell
                        label="Superficie"
                        value={c.superficie}
                        options={SUPERFICIES.map((x) => ({ value: x, label: SUPERFICIE_GUARDAR_LABEL[x] }))}
                        onChange={(v) =>
                          set((d) => {
                            const row = d.agua.captacion[i]
                            row.superficie = v as SuperficieGuardar
                            row.c = cMedio(v as SuperficieGuardar)
                          })
                        }
                      />
                    </td>
                    <td>
                      <NumCell label="Área" value={c.area} onChange={(v) => set((d) => void (d.agua.captacion[i].area = v))} />
                    </td>
                    <td>
                      <SelectCell
                        label="Unidad"
                        value={c.unidad}
                        options={[
                          { value: 'ha', label: 'ha' },
                          { value: 'm²', label: 'm²' },
                        ]}
                        onChange={(v) => set((d) => void (d.agua.captacion[i].unidad = v as 'ha' | 'm²'))}
                      />
                    </td>
                    <td>
                      <NumCell label="Coeficiente C" step={0.01} value={c.c} onChange={(v) => set((d) => void (d.agua.captacion[i].c = v))} />
                    </td>
                    <td className="font-mono-data text-mono text-[12px] whitespace-nowrap">
                      {nf2(lo)}–{nf2(hi)}
                    </td>
                    <Num>{nf(c.ofertaM3)}</Num>
                    <td>
                      <DelButton label="Eliminar superficie" onClick={() => set((d) => void d.agua.captacion.splice(i, 1))} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>Oferta cosechable anual</td>
                <Num>{nf(r.oferta)}</Num>
                <td />
              </tr>
            </tfoot>
          </Table>
          <AddButton
            onClick={() =>
              set((d) => void d.agua.captacion.push({ id: nuevoId('ca'), superficie: 'potrero', area: 1, unidad: 'ha', c: cMedio('potrero') }))
            }
          >
            Agregar superficie de captación
          </AddButton>
          <Grid cols={2} className="mt-4">
            <NumField
              label="Eficiencia del sistema de conducción"
              unit="0–1"
              min={0.3}
              max={1}
              step={0.05}
              value={ag.eficienciaConduccion}
              onChange={n('eficienciaConduccion')}
            />
            <NumField
              label="Fracción de la oferta captable en época seca"
              unit="0–1"
              min={0}
              max={1}
              step={0.05}
              value={ag.fraccionCaptableSeca}
              onChange={n('fraccionCaptableSeca')}
            />
          </Grid>
        </Card>

        {/* F · Almacenamiento */}
        <Card title="F · Dimensionamiento del almacenamiento">
          <Grid cols={3}>
            <SelectField
              label="Tipología"
              value={ag.tipologiaId}
              options={TIPOLOGIAS.map((t) => ({ value: t.id, label: t.nombre }))}
              onChange={(v) =>
                set((d) => {
                  d.agua.tipologiaId = v
                  d.tierra.ratio = TIPOLOGIAS.find((t) => t.id === v)?.ratio ?? d.tierra.ratio
                })
              }
            />
            <SelectField
              label="Fondo del vaso"
              value={ag.fondoIdx}
              options={FONDOS.map((f, i) => ({ value: i, label: `${f.nombre} · ${nf2(f.infiltracion)} mm/día` }))}
              onChange={n('fondoIdx')}
            />
            <NumField label="Profundidad media" unit="m" min={1} max={12} step={0.1} value={ag.profundidadM} onChange={n('profundidadM')} />
            <NumField
              label="Déficit a cubrir con almacenamiento"
              unit="%"
              min={5}
              max={100}
              step={5}
              value={ag.coberturaDeficitPct}
              onChange={n('coberturaDeficitPct')}
            />
            <NumField label="Factor de seguridad" unit="×" min={1} max={1.6} step={0.05} value={ag.factorSeguridad} onChange={n('factorSeguridad')} />
            <NumField label="Número de reservorios" unit="und" min={1} step={1} value={ag.reservorios} onChange={n('reservorios')} />
            <NumField label="Volumen útil requerido (calculado)" unit="m³" readOnly value={Math.round(r.volumenRequerido)} />
            <div>
              <NumField
                label="Volumen a construir (ajustable)"
                unit="m³"
                step={50}
                value={Math.round(r.volumenDiseno)}
                onChange={(v) => set((d) => void (d.agua.volumenManualM3 = v))}
              />
              {ag.volumenManualM3 !== null && (
                <button
                  type="button"
                  onClick={() => set((d) => void (d.agua.volumenManualM3 = null))}
                  className="mt-1.5 text-[12px] text-brand hover:underline"
                >
                  Usar el volumen calculado
                </button>
              )}
            </div>
            <SelectField
              label="Impermeabilización"
              value={ag.impermeabilizar ? 1 : 0}
              options={[
                { value: 0, label: 'Sin geomembrana' },
                { value: 1, label: 'Geomembrana HDPE 1,0 mm' },
              ]}
              onChange={(v) => set((d) => void (d.agua.impermeabilizar = v === 1))}
            />
            <NumField label="Almacenamiento en tanques" unit="m³" min={0} step={1} value={ag.tanquesM3} onChange={n('tanquesM3')} />
          </Grid>
          <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3 mt-5">
            <Stat k="Déficit a cubrir" v={`${nf(r.deficitSeca)} m³`} sub={`${nf(ag.coberturaDeficitPct)} % del déficit de la época seca`} />
            <Stat k="Volumen útil requerido" v={`${nf(r.volumenRequerido)} m³`} sub={`factor de seguridad ${nf2(ag.factorSeguridad)}`} />
            <Stat k="Espejo de agua" v={`${nf(r.espejoDiseno)} m²`} sub={`profundidad media ${nf1(ag.profundidadM)} m`} />
            <Stat
              k="Pérdidas en la seca"
              v={`${nf(r.perdidas)} m³`}
              sub={`${nf1(r.perdidasPct)} % del volumen`}
              tone={r.perdidasPct > 30 ? 'warn' : undefined}
            />
            <Stat k="Por reservorio" v={`${nf(r.volumenDiseno / reservorios)} m³`} sub="volumen individual" />
          </div>
          <Note tone={r.perdidasPct > 30 ? 'warn' : undefined}>
            {r.perdidasPct > 30 ? (
              <>
                <strong>Las pérdidas superan el 30 % del volumen almacenado.</strong> Aumente la profundidad, reduzca el espejo,
                arborice el perímetro (hasta −40 % de evaporación) o impermeabilice el fondo antes de aumentar el tamaño.
              </>
            ) : (
              'Priorice profundidad sobre extensión: un vaso de la misma capacidad con el doble de profundidad pierde la mitad por evaporación.'
            )}
          </Note>
        </Card>

        {/* G · Movimiento de tierras */}
        <Card
          title="G · Movimiento de tierras"
          hint={`La relación corte / almacenamiento viene de la tipología elegida${
            tipologia ? ` (${nf2(tipologia.ratioMin)}–${nf2(tipologia.ratioMax)})` : ''
          } y puede ajustarse con el levantamiento topográfico real. Material: ${material.nombre} (relieve, capa 02).`}
        >
          <Grid cols={4}>
            <NumField label="Relación corte / almacenado" unit="m³/m³" step={0.01} value={ti.ratio} onChange={nt('ratio')} />
            <NumField label="Fracción del corte a terraplén" unit="0–1" min={0} max={1} step={0.05} value={ti.fraccionTerraplen} onChange={nt('fraccionTerraplen')} />
            <NumField label="Espesor de descapote" unit="m" min={0} max={1} step={0.05} value={ti.espesorDescapoteM} onChange={nt('espesorDescapoteM')} />
            <NumField label="Sobreelevación por asentamiento" unit="%" min={0} max={20} step={1} value={ti.asentamientoPct} onChange={nt('asentamientoPct')} />
          </Grid>

          <div className="mt-5">
            <Table minWidth={820}>
              <thead>
                <tr>
                  <th>Frente de trabajo</th>
                  <th>Equipo</th>
                  <th className="!text-right w-28">Cantidad</th>
                  <th className="!text-right w-24">Rendimiento</th>
                  <th className="!text-right w-28">Tarifa COP/h</th>
                  <th className="!text-right w-20">Horas</th>
                  <th className="!text-right w-32">Costo</th>
                </tr>
              </thead>
              <tbody>
                {r.tierra.frentes.map((f, i) => {
                  const fe = ti.frentes[i]
                  return (
                    <tr key={f.id}>
                      <td className="text-secondary whitespace-nowrap">{fe.rol}</td>
                      <td>
                        <TextCell label="Equipo" value={fe.equipo} onChange={(v) => set((d) => void (d.tierra.frentes[i].equipo = v))} />
                      </td>
                      <Num>
                        {nf(f.cantidad)} {fe.unidad.split('/')[0]}
                      </Num>
                      <td>
                        <NumCell
                          label={`Rendimiento (${fe.unidad})`}
                          step={1}
                          value={fe.rendimiento}
                          onChange={(v) => set((d) => void (d.tierra.frentes[i].rendimiento = v))}
                        />
                      </td>
                      <td>
                        <NumCell
                          label="Tarifa por hora"
                          step={5000}
                          value={fe.tarifa}
                          onChange={(v) => set((d) => void (d.tierra.frentes[i].tarifa = v))}
                        />
                      </td>
                      <Num>{nf1(f.horas)}</Num>
                      <Num>{cop(f.costo)}</Num>
                    </tr>
                  )
                })}
                <tr>
                  <td className="text-secondary">Movilización</td>
                  <td className="text-secondary">Cama baja ida y regreso</td>
                  <Num>{nf(ti.viajes)} viajes</Num>
                  <Num muted>—</Num>
                  <Num muted>—</Num>
                  <Num muted>—</Num>
                  <Num>{cop(r.tierra.costoMovilizacion)}</Num>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6}>Costo directo + indirectos {nf(ti.indirectosPct)} %</td>
                  <Num>{cop(r.tierra.costoTotal)}</Num>
                </tr>
                {r.costoGeo > 0 && (
                  <tr>
                    <td colSpan={6}>Impermeabilización con geomembrana</td>
                    <Num>{cop(r.costoGeo)}</Num>
                  </tr>
                )}
              </tfoot>
            </Table>
          </div>

          <Grid cols={3} className="mt-4">
            <NumField label="Movilización de maquinaria" unit="COP/viaje" step={100000} value={ti.movilizacion} onChange={nt('movilizacion')} />
            <NumField label="Viajes de cama baja" unit="und" min={0} step={1} value={ti.viajes} onChange={nt('viajes')} />
            <NumField label="Indirectos de obra de tierra" unit="%" min={0} max={60} step={1} value={ti.indirectosPct} onChange={nt('indirectosPct')} />
          </Grid>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            <Stat accent k="Corte total" v={`${nf(r.tierra.corteM3)} m³`} sub="material en banco" />
            <Stat k="Terraplén compactado" v={`${nf(r.tierra.terraplenM3)} m³`} sub={`${material.nombre} · contracción ${pct(material.contraccion)}`} />
            <Stat k="Volumen suelto a transportar" v={`${nf(r.tierra.sueltoM3)} m³`} sub={`esponjamiento ${pct(material.esponjamiento)}`} />
            <Stat k="Descapote" v={`${nf(r.tierra.descapoteM2)} m²`} sub={`${nf(r.tierra.descapoteM3)} m³ de capa vegetal`} />
            <Stat k="Costo del movimiento" v={copC(r.tierra.costoTotal)} sub={`${cop(r.tierra.copM3Movido)} /m³ movido`} />
            <Stat
              k="Costo por m³ almacenado"
              v={cop(r.copM3Almacenado)}
              sub={ag.impermeabilizar ? 'incluye geomembrana' : 'sin impermeabilización'}
              tone={rangoOk ? undefined : 'warn'}
            />
          </div>
          <Note tone={rangoOk ? undefined : 'warn'}>
            <strong>Verificación:</strong> {cop(r.copM3Almacenado)} por m³ almacenado{' '}
            {rangoOk
              ? `cae dentro del rango de referencia colombiano (${nf(rMin)} a ${nf(rMax)} COP/m³ según tipología e impermeabilización). El cálculo es coherente.`
              : `queda fuera del rango de referencia (${nf(rMin)} a ${nf(rMax)} COP/m³). Revise tarifas, rendimientos o la relación corte/almacenamiento antes de cotizar.`}
          </Note>
        </Card>

        {/* H · Obras complementarias */}
        <Card title="H · Obras complementarias de la capa agua">
          <CostTable capa="aguaObra" s={s} set={set} />
        </Card>
      </div>
    </>
  )
}
