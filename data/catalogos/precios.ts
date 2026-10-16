// ── Precios unitarios de referencia (COP) ──
// Tarifas de campo para obra agrícola, editables en Diseño Keyline Predial.
// Fuentes: Gobernación de Boyacá APU 2025; MADR Res. 379 de 2022; Gerfor 2025;
// Geosat; CONtexto Ganadero. Los APU oficiales de obra pública son 4–8 veces
// mayores: no mezclar ambas fuentes en un mismo presupuesto.

export const PRECIOS = {
  geomembrana: 24500, // m² instalada HDPE 1.0 mm
  geotextil: 6500, // m²
  anclaje: 20000, // ml zanja perimetral
  vertedero: 4500000, // global obra de excedencias
  toma: 3200000, // global obra de toma
  empradizado: 3500, // m²
  swaleMec: 3500, // ml zanja de infiltración mecánica
  swaleMan: 12000, // ml zanja manual
  canalKey: 4500, // ml canal keyline
  trazado: 800, // ml trazado de líneas clave
  viaInterna: 180000, // ml vía interna en afirmado
  alcantarilla: 2500000, // und
  cunetas: 28000, // ml
  cercaPuas: 13500, // ml
  cercaElec: 6500, // ml
  cercaViva: 10000, // ml
  mallaGan: 32000, // ml
  tuberia2: 28000, // ml PVC 2" instalada
  tuberia3: 55000, // ml PVC 3" instalada
  tuberia4: 90000, // ml PVC 4" instalada
  tanque5k: 3500000, // und tanque 5.000 L
  bombeoSolar: 5800000, // por kWp instalado
  riegoGoteo: 11000000, // por ha
  riegoAsper: 7000000, // por ha
  riegoGrav: 3000000, // por ha
  abrevadero: 1800000, // und bebedero + flotador
  arbol: 8000, // und sembrado (material + ahoyado + siembra)
  silvopast: 3500000, // por ha SSP baja densidad
  ssPi: 10000000, // por ha SSP intensivo
  pastura: 4000000, // por ha establecimiento pastura mejorada
  subsolado: 200000, // por ha arado keyline 1 pase
  keylineProg: 600000, // por ha programa keyline 2-3 pases
  cal: 540000, // por tonelada puesta en finca
  aplicCal: 200000, // por ha aplicación
  topografia: 260000, // por ha dron + MDT
  suelos: 220000, // por muestra análisis completo
  geotecnia: 7000000, // global reservorio pequeño
  movilizacion: 3000000, // por viaje de cama baja
  disenoKeyline: 12000000, // global diseño, planos y memoria de cálculo
} as const
