'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  annualCRange,
  adjustedStormC,
  BANDA_LLUVIA_EVAP_LABEL,
  CONFIABILIDAD_LABEL,
  COBERTURA_LABEL,
  flowFromVolume,
  idfIntensityMmH,
  kirpichTcMin,
  m3sToLs,
  midOfRange,
  PENDIENTE_BANDA_LABEL,
  rationalCBase,
  rationalPeakFlowM3s,
  REGION_IDF_LABEL,
  RETORNO_T_LABEL,
  runoffVolumeM3,
  SUELO_PERMEABILIDAD_LABEL,
  SUELO_TEXTURA_LABEL,
  SUPERFICIE_GUARDAR_LABEL,
  SUPERFICIE_GUARDAR_RANGE,
  type BandaLluviaEvap,
  type Cobertura,
  type Confiabilidad,
  type PendienteBanda,
  type RegionIdf,
  type RetornoT,
  type SueloPermeabilidad,
  type SueloTextura,
  type SuperficieGuardar,
} from '@/lib/runoff'

type Modo = 'guardar' | 'evacuar'
type FuenteGuardar = 'superficie' | 'cuenca'

const nf0 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })
const nf3 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 })

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-[#1D1D1B] border border-white/[0.08] text-white placeholder-white/20 text-sm ' +
  'focus:outline-none focus:border-[#95C11F]/50 focus:ring-2 focus:ring-[#95C11F]/20 transition-all'

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor={id} className="text-white/60 text-sm">
          {label}
        </label>
        {hint && <span className="font-mono text-[10px] text-white/25 tracking-wide">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function ModeTab({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  title: string
  subtitle: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-left p-5 rounded-xl border transition-all duration-200 ${
        active
          ? 'border-[#95C11F]/40 bg-[#95C11F]/[0.07]'
          : 'border-white/[0.07] bg-[#1D1D1B]/40 hover:border-white/15'
      }`}
    >
      <div className={`font-display text-lg font-semibold mb-1 ${active ? 'text-[#95C11F]' : 'text-white/70'}`}>
        {title}
      </div>
      <div className="text-white/35 text-[12px] leading-relaxed">{subtitle}</div>
    </button>
  )
}

const BANDAS: BandaLluviaEvap[] = [
  'mas1100',
  '900-1099',
  '500-899-evapBaja',
  '500-899-evapAlta',
  '400-499',
  '250-399-evapBaja',
  '250-399-evapAlta',
]
const CONFIABILIDADES: Confiabilidad[] = ['8de10', '9de10']
const TEXTURAS: SueloTextura[] = ['arena_franco', 'arcilla_arenosa', 'arcilla_elastica', 'arcilla_inelastica']
const SUPERFICIES_GUARDAR: SuperficieGuardar[] = [
  'techo',
  'pavimento',
  'roca_aflorada',
  'via_sin_cobertura_mas300',
  'via_sin_cobertura_menos300',
  'tierra_cultivada',
  'potrero',
  'bosque',
]
const COBERTURAS: Cobertura[] = ['sin_vegetacion', 'cultivos', 'pastos_ligera', 'hierba_grama', 'bosque_denso']
const SUELOS_PERM: SueloPermeabilidad[] = ['impermeable', 'semipermeable', 'permeable']
const PENDIENTES: PendienteBanda[] = ['mas50', '20-50', '8-20', '1-8', 'menos1']
const REGIONES: RegionIdf[] = ['andina', 'caribe', 'pacifico', 'orinoquia']
const RETORNOS: RetornoT[] = [10, 25, 50, 100]

export default function CalculadoraEscorrentia() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const uid = useId()

  const [modo, setModo] = useState<Modo>('guardar')

  // ── Compartido ──
  const [areaHa, setAreaHa] = useState(24)

  // ── Modo GUARDAR ──
  const [fuenteGuardar, setFuenteGuardar] = useState<FuenteGuardar>('cuenca')
  const [superficie, setSuperficie] = useState<SuperficieGuardar>('potrero')
  const [banda, setBanda] = useState<BandaLluviaEvap>('mas1100')
  const [confiabilidad, setConfiabilidad] = useState<Confiabilidad>('8de10')
  const [textura, setTextura] = useState<SueloTextura>('arcilla_arenosa')
  const [precipAnualMm, setPrecipAnualMm] = useState(2500)
  const [cGuardarPct, setCGuardarPct] = useState(15) // % — slider dentro del rango vigente

  const rangoCuenca = useMemo(() => annualCRange(banda, confiabilidad, textura), [banda, confiabilidad, textura])
  const rangoSuperficie = SUPERFICIE_GUARDAR_RANGE[superficie]
  const rangoGuardarActivo = fuenteGuardar === 'cuenca' ? rangoCuenca : rangoSuperficie

  // Si la combinación de tabla 2.3 no existe (celda "—"), o cambia el rango, reencuadra el slider
  useEffect(() => {
    if (!rangoGuardarActivo) return
    const [lo, hi] = rangoGuardarActivo
    const pct = cGuardarPct / 100
    if (pct < lo || pct > hi) setCGuardarPct(Math.round(midOfRange(rangoGuardarActivo) * 100))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangoGuardarActivo])

  const cGuardar = rangoGuardarActivo ? cGuardarPct / 100 : 0
  const volumenGuardarM3 = runoffVolumeM3(cGuardar, areaHa, precipAnualMm)
  const caudalMedioM3s = flowFromVolume(volumenGuardarM3, 8760)
  const caudalMedioLs = m3sToLs(caudalMedioM3s)

  // ── Modo EVACUAR ──
  const [cobertura, setCobertura] = useState<Cobertura>('pastos_ligera')
  const [sueloPerm, setSueloPerm] = useState<SueloPermeabilidad>('semipermeable')
  const [pendiente, setPendiente] = useState<PendienteBanda>('8-20')
  const [retorno, setRetorno] = useState<RetornoT>(50)
  const [longitudM, setLongitudM] = useState(700)
  const [desnivelM, setDesnivelM] = useState(83)
  const [tcManual, setTcManual] = useState<number | null>(null)
  const [region, setRegion] = useState<RegionIdf>('orinoquia')
  const [mMax24h, setMMax24h] = useState(100)

  const cBase = rationalCBase(cobertura, sueloPerm, pendiente)
  const cAjustado = adjustedStormC(cBase, retorno)
  const tcCalculado = kirpichTcMin(longitudM, desnivelM)
  const tcMin = tcManual ?? tcCalculado
  const intensidadMmH = idfIntensityMmH(region, retorno, mMax24h, tcMin)
  const precipAguaceroMm = intensidadMmH * (tcMin / 60)
  const volumenEvacuarM3 = runoffVolumeM3(cAjustado, areaHa, precipAguaceroMm)
  const caudalPicoM3s = rationalPeakFlowM3s(cAjustado, areaHa, intensidadMmH)
  const caudalPicoLs = m3sToLs(caudalPicoM3s)

  const waMessage = encodeURIComponent(
    modo === 'guardar'
      ? `Hola, quiero dimensionar un reservorio real para mi finca.\n` +
          `Con la calculadora del sitio (modo GUARDAR) obtuve un volumen anual estimado de ` +
          `${nf0.format(volumenGuardarM3)} m³ (${nf2.format(caudalMedioLs)} L/s promedio) para ${nf0.format(areaHa)} ha.`
      : `Hola, quiero diseñar un vertedero/canal real para mi finca.\n` +
          `Con la calculadora del sitio (modo EVACUAR, T=${retorno} años) obtuve un caudal pico estimado de ` +
          `${nf2.format(caudalPicoM3s)} m³/s (${nf0.format(caudalPicoLs)} L/s) para ${nf0.format(areaHa)} ha.`
  )

  return (
    <section id="calculadora-escorrentia" className="py-32 lg:py-44 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none dot-grid" />

      <div className="max-w-7xl mx-auto relative">
        <div ref={ref} className="mb-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="w-7 h-px bg-[#95C11F]/60" />
            <span className="font-mono text-[#95C11F] text-[10px] tracking-[0.32em] uppercase">
              Herramientas Técnicas · 06
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,6vw,4.8rem)] font-semibold leading-tight mb-6"
          >
            <em className="text-[#95C11F] not-italic">Guarda</em> o{' '}
            <em className="text-[#95C11F] not-italic">evacúa</em> el agua
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/45 leading-relaxed"
          >
            Una misma fórmula — lámina de lluvia × área × fracción que escurre —
            responde dos preguntas distintas: cuánta agua llega en el año para
            guardarla (dimensiona reservorios) y con qué caudal pico llega un
            aguacero para evacuarla sin daño (dimensiona vertederos y canales).
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-10 items-start">
          {/* ── Columna izquierda ── */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-3"
            >
              <ModeTab
                active={modo === 'guardar'}
                onClick={() => setModo('guardar')}
                title="GUARDAR"
                subtitle="Volumen anual que escurre — reservorios y cosecha de agua."
              />
              <ModeTab
                active={modo === 'evacuar'}
                onClick={() => setModo('evacuar')}
                title="EVACUAR"
                subtitle="Caudal pico de un aguacero — vertederos, canales y zanjas."
              />
            </motion.div>

            {/* Área compartida */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="p-6 lg:p-7 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]"
            >
              <div className="max-w-xs">
                <Field id={`${uid}-area`} label="Área de la cuenca o superficie" hint="ha">
                  <input
                    id={`${uid}-area`}
                    type="number"
                    min={0}
                    value={areaHa}
                    onChange={(e) => setAreaHa(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </motion.div>

            {modo === 'guardar' ? (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="p-7 lg:p-8 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-[11px] text-[#95C11F]/50 tracking-widest">01</span>
                  <h3 className="font-display text-xl font-semibold">Coeficiente anual (tabla 2.3 / 2.4)</h3>
                </div>

                <div className="mb-5 flex gap-2">
                  <button
                    onClick={() => setFuenteGuardar('cuenca')}
                    className={`px-4 py-2 rounded-full text-[12px] border transition-colors ${
                      fuenteGuardar === 'cuenca'
                        ? 'border-[#95C11F]/40 bg-[#95C11F]/10 text-[#95C11F]'
                        : 'border-white/10 text-white/40 hover:text-white/60'
                    }`}
                  >
                    Cuenca rural por suelo
                  </button>
                  <button
                    onClick={() => setFuenteGuardar('superficie')}
                    className={`px-4 py-2 rounded-full text-[12px] border transition-colors ${
                      fuenteGuardar === 'superficie'
                        ? 'border-[#95C11F]/40 bg-[#95C11F]/10 text-[#95C11F]'
                        : 'border-white/10 text-white/40 hover:text-white/60'
                    }`}
                  >
                    Superficie específica
                  </button>
                </div>

                {fuenteGuardar === 'cuenca' ? (
                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    <Field id={`${uid}-banda`} label="Lluvia media anual / evaporación">
                      <select
                        id={`${uid}-banda`}
                        value={banda}
                        onChange={(e) => setBanda(e.target.value as BandaLluviaEvap)}
                        className={inputClass}
                      >
                        {BANDAS.map((b) => (
                          <option key={b} value={b}>
                            {BANDA_LLUVIA_EVAP_LABEL[b]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`${uid}-confiabilidad`} label="Confiabilidad">
                      <select
                        id={`${uid}-confiabilidad`}
                        value={confiabilidad}
                        onChange={(e) => setConfiabilidad(e.target.value as Confiabilidad)}
                        className={inputClass}
                      >
                        {CONFIABILIDADES.map((c) => (
                          <option key={c} value={c}>
                            {CONFIABILIDAD_LABEL[c]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`${uid}-textura`} label="Textura del suelo">
                      <select
                        id={`${uid}-textura`}
                        value={textura}
                        onChange={(e) => setTextura(e.target.value as SueloTextura)}
                        className={inputClass}
                      >
                        {TEXTURAS.map((t) => (
                          <option key={t} value={t}>
                            {SUELO_TEXTURA_LABEL[t]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`${uid}-precip-anual`} label="Lluvia media anual" hint="mm">
                      <input
                        id={`${uid}-precip-anual`}
                        type="number"
                        min={0}
                        value={precipAnualMm}
                        onChange={(e) => setPrecipAnualMm(Number(e.target.value) || 0)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    <Field id={`${uid}-superficie`} label="Tipo de superficie">
                      <select
                        id={`${uid}-superficie`}
                        value={superficie}
                        onChange={(e) => setSuperficie(e.target.value as SuperficieGuardar)}
                        className={inputClass}
                      >
                        {SUPERFICIES_GUARDAR.map((s) => (
                          <option key={s} value={s}>
                            {SUPERFICIE_GUARDAR_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`${uid}-precip-anual-2`} label="Lluvia media anual" hint="mm">
                      <input
                        id={`${uid}-precip-anual-2`}
                        type="number"
                        min={0}
                        value={precipAnualMm}
                        onChange={(e) => setPrecipAnualMm(Number(e.target.value) || 0)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}

                {rangoGuardarActivo ? (
                  <Field
                    id={`${uid}-c-guardar`}
                    label="Coeficiente de escorrentía anual (C)"
                    hint={`${nf1.format(cGuardarPct)} % · rango ${nf1.format(rangoGuardarActivo[0] * 100)}–${nf1.format(
                      rangoGuardarActivo[1] * 100
                    )} %`}
                  >
                    <input
                      id={`${uid}-c-guardar`}
                      type="range"
                      min={rangoGuardarActivo[0] * 100}
                      max={rangoGuardarActivo[1] * 100}
                      step={0.1}
                      value={cGuardarPct}
                      onChange={(e) => setCGuardarPct(Number(e.target.value))}
                      className="w-full accent-[#95C11F] mt-3.5"
                    />
                  </Field>
                ) : (
                  <div className="p-4 rounded-xl border border-red-400/25 bg-red-400/10 text-red-400 text-[12px] leading-relaxed">
                    La tabla 2.3 no define esta combinación de lluvia/evaporación y textura — elige otra textura de suelo.
                  </div>
                )}
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="p-7 lg:p-8 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-[11px] text-[#95C11F]/50 tracking-widest">01</span>
                    <h3 className="font-display text-xl font-semibold">Coeficiente de aguacero (método racional)</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    <Field id={`${uid}-cobertura`} label="Cobertura">
                      <select
                        id={`${uid}-cobertura`}
                        value={cobertura}
                        onChange={(e) => setCobertura(e.target.value as Cobertura)}
                        className={inputClass}
                      >
                        {COBERTURAS.map((c) => (
                          <option key={c} value={c}>
                            {COBERTURA_LABEL[c]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`${uid}-suelo-perm`} label="Suelo">
                      <select
                        id={`${uid}-suelo-perm`}
                        value={sueloPerm}
                        onChange={(e) => setSueloPerm(e.target.value as SueloPermeabilidad)}
                        className={inputClass}
                      >
                        {SUELOS_PERM.map((s) => (
                          <option key={s} value={s}>
                            {SUELO_PERMEABILIDAD_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`${uid}-pendiente`} label="Pendiente">
                      <select
                        id={`${uid}-pendiente`}
                        value={pendiente}
                        onChange={(e) => setPendiente(e.target.value as PendienteBanda)}
                        className={inputClass}
                      >
                        {PENDIENTES.map((p) => (
                          <option key={p} value={p}>
                            {PENDIENTE_BANDA_LABEL[p]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`${uid}-retorno`} label="Periodo de retorno (T)">
                      <select
                        id={`${uid}-retorno`}
                        value={retorno}
                        onChange={(e) => setRetorno(Number(e.target.value) as RetornoT)}
                        className={inputClass}
                      >
                        {RETORNOS.map((t) => (
                          <option key={t} value={t}>
                            {RETORNO_T_LABEL[t]}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-white/30 flex-wrap">
                    <span>
                      C base: <span className="font-mono text-white/60">{nf2.format(cBase)}</span>
                    </span>
                    <span className="text-white/20">·</span>
                    <span>
                      C ajustado (× Cf): <span className="font-mono text-[#95C11F]">{nf2.format(cAjustado)}</span>
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.85, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="p-7 lg:p-8 rounded-2xl border border-white/[0.07] bg-[#2C2C2A]"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-[11px] text-[#95C11F]/50 tracking-widest">02</span>
                    <h3 className="font-display text-xl font-semibold">Tiempo de concentración e intensidad</h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    <Field id={`${uid}-longitud`} label="Longitud del cauce más largo" hint="m">
                      <input
                        id={`${uid}-longitud`}
                        type="number"
                        min={0}
                        value={longitudM}
                        onChange={(e) => setLongitudM(Number(e.target.value) || 0)}
                        className={inputClass}
                      />
                    </Field>
                    <Field id={`${uid}-desnivel`} label="Desnivel del cauce" hint="m">
                      <input
                        id={`${uid}-desnivel`}
                        type="number"
                        min={0}
                        value={desnivelM}
                        onChange={(e) => setDesnivelM(Number(e.target.value) || 0)}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="mb-5 flex items-center gap-3 flex-wrap text-[12px]">
                    <span className="text-white/40">
                      tc por Kirpich:{' '}
                      <span className="font-mono text-white/70">{nf1.format(tcCalculado)} min</span>
                    </span>
                    <label className="flex items-center gap-2 text-white/40">
                      <input
                        type="checkbox"
                        checked={tcManual !== null}
                        onChange={(e) => setTcManual(e.target.checked ? tcCalculado : null)}
                        className="w-3.5 h-3.5 rounded accent-[#95C11F]"
                      />
                      Ajustar tc manualmente
                    </label>
                    {tcManual !== null && (
                      <input
                        type="number"
                        min={1}
                        value={tcManual}
                        onChange={(e) => setTcManual(Number(e.target.value) || 1)}
                        className="w-24 px-2.5 py-1.5 rounded-lg bg-[#1D1D1B] border border-white/[0.08] text-white text-[12px]"
                      />
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field id={`${uid}-region`} label="Región IDF (Vargas y Díaz-Granados)">
                      <select
                        id={`${uid}-region`}
                        value={region}
                        onChange={(e) => setRegion(e.target.value as RegionIdf)}
                        className={inputClass}
                      >
                        {REGIONES.map((r) => (
                          <option key={r} value={r}>
                            {REGION_IDF_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`${uid}-m24h`} label="Lluvia máx. anual en 24h (M)" hint="mm · estación IDEAM">
                      <input
                        id={`${uid}-m24h`}
                        type="number"
                        min={0}
                        value={mMax24h}
                        onChange={(e) => setMMax24h(Number(e.target.value) || 0)}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-[12px] text-white/30 flex-wrap">
                    <span>
                      Intensidad i: <span className="font-mono text-white/60">{nf1.format(intensidadMmH)} mm/h</span>
                    </span>
                    <span className="text-white/20">·</span>
                    <span>
                      Lluvia del aguacero: <span className="font-mono text-white/60">{nf1.format(precipAguaceroMm)} mm</span>
                    </span>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* ── Columna derecha: resultado ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 p-7 lg:p-8 rounded-2xl border border-[#95C11F]/20 bg-[#2C2C2A]"
          >
            <div className="font-mono text-[10px] text-[#95C11F]/50 tracking-widest uppercase mb-6">
              {modo === 'guardar' ? 'Modo guardar · resumen' : 'Modo evacuar · resumen'}
            </div>

            {modo === 'guardar' ? (
              <>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display text-4xl font-semibold text-[#95C11F]">
                    {nf0.format(volumenGuardarM3)}
                  </span>
                  <span className="text-white/30 text-sm mb-1">m³/año</span>
                </div>
                <p className="text-white/30 text-[12px] mb-6">Volumen que escurre de la cuenca en un año promedio.</p>

                <div className="space-y-4 mb-2">
                  {[
                    { label: 'Caudal medio', value: `${nf3.format(caudalMedioM3s)} m³/s` },
                    { label: 'Caudal medio', value: `${nf1.format(caudalMedioLs)} L/s` },
                    { label: 'Coeficiente C usado', value: `${nf1.format(cGuardar * 100)} %` },
                  ].map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between border-b border-white/[0.06] pb-3">
                      <span className="text-white/40 text-sm">{row.label}</span>
                      <span className="font-mono text-white font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display text-4xl font-semibold text-[#95C11F]">
                    {nf2.format(caudalPicoM3s)}
                  </span>
                  <span className="text-white/30 text-sm mb-1">m³/s pico</span>
                </div>
                <p className="text-white/30 text-[12px] mb-6">
                  Caudal pico del aguacero de diseño (T = {RETORNO_T_LABEL[retorno]}) para dimensionar la obra de salida.
                </p>

                <div className="space-y-4 mb-2">
                  {[
                    { label: 'Caudal pico', value: `${nf0.format(caudalPicoLs)} L/s` },
                    { label: 'Volumen del aguacero', value: `${nf0.format(volumenEvacuarM3)} m³` },
                    { label: 'Tiempo de concentración', value: `${nf1.format(tcMin)} min` },
                    { label: 'Intensidad de diseño', value: `${nf1.format(intensidadMmH)} mm/h` },
                  ].map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between border-b border-white/[0.06] pb-3">
                      <span className="text-white/40 text-sm">{row.label}</span>
                      <span className="font-mono text-white font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <a
              href={`https://wa.me/573113650567?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-[#95C11F] text-[#1D1D1B] rounded-full font-semibold text-sm hover:bg-[#a6d42a] transition-all duration-200 hover:shadow-[0_0_32px_rgba(149,193,31,0.4)] hover:scale-[1.02]"
            >
              {modo === 'guardar' ? 'Dimensionar mi reservorio' : 'Diseñar mi vertedero o canal'}
            </a>

            <p className="mt-5 text-white/25 text-[11px] leading-relaxed text-center">
              Estimación orientativa — en obras con riesgo aguas abajo (viviendas, vías o personas), el diseño final lo
              firma un profesional con la norma vigente.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
