// ── Catálogo climático de Colombia ──
// Zonas bioclimáticas y departamentos con subzonas por piso térmico. Valores de
// referencia de diseño: ajustar con la estación IDEAM más cercana.
// Fuentes: IDEAM (Regionalización de la lluvia, Atlas climatológico);
// Cenicafé 57(4):288-298 (2006) para la regresión altitudinal de ETo.

export type ZonaId = 'cs' | 'ch' | 'cmh' | 'tpl' | 'fri' | 'par'

export interface ZonaBioclimatica {
  nombre: string
  /** ETo de referencia (mm/día). */
  eto: number
  etoMin: number
  etoMax: number
  /** Evaporación en lámina libre (mm/día). */
  evaporacion: number
  /** true: la ETo se ajusta con la regresión altitudinal de Cenicafé. */
  regresionAltitud: boolean
  altitud: string
}

export const ZONAS: Record<ZonaId, ZonaBioclimatica> = {
  cs: { nombre: 'Cálido seco', eto: 5.0, etoMin: 4.5, etoMax: 6.0, evaporacion: 6.0, regresionAltitud: false, altitud: '0–500 m' },
  ch: { nombre: 'Cálido húmedo', eto: 4.0, etoMin: 3.5, etoMax: 4.5, evaporacion: 4.5, regresionAltitud: true, altitud: '0–500 m' },
  cmh: { nombre: 'Cálido muy húmedo', eto: 3.4, etoMin: 3.0, etoMax: 3.8, evaporacion: 3.8, regresionAltitud: true, altitud: '0–500 m' },
  tpl: { nombre: 'Templado / cafetero', eto: 3.2, etoMin: 2.9, etoMax: 3.6, evaporacion: 3.6, regresionAltitud: true, altitud: '1.000–2.000 m' },
  fri: { nombre: 'Frío', eto: 2.65, etoMin: 2.4, etoMax: 2.9, evaporacion: 2.9, regresionAltitud: true, altitud: '2.000–3.000 m' },
  par: { nombre: 'Páramo', eto: 2.1, etoMin: 1.8, etoMax: 2.4, evaporacion: 2.3, regresionAltitud: true, altitud: '> 3.000 m' },
}

export type Regimen = 'bimodal' | 'monomodal' | 'mixto'

export interface Subzona {
  nombre: string
  /** Altitud media (m s. n. m.). */
  altitud: number
  /** Precipitación media anual (mm). */
  precipitacion: number
  mesesSecos: number
  zona: ZonaId
}

export interface Departamento {
  nombre: string
  regimen: Regimen
  subzonas: Subzona[]
}

const sz = (nombre: string, altitud: number, precipitacion: number, mesesSecos: number, zona: ZonaId): Subzona => ({
  nombre,
  altitud,
  precipitacion,
  mesesSecos,
  zona,
})

export const DEPARTAMENTOS: Departamento[] = [
  { nombre: 'Amazonas', regimen: 'bimodal', subzonas: [sz('Llanura amazónica (Leticia, Puerto Nariño)', 90, 3000, 0, 'ch')] },
  {
    nombre: 'Antioquia',
    regimen: 'bimodal',
    subzonas: [
      sz('Altiplano Norte y Oriente (Rionegro, Santa Rosa)', 2200, 2000, 3, 'fri'),
      sz('Suroeste y Occidente cafetero', 1600, 2200, 3, 'tpl'),
      sz('Bajo Cauca y Magdalena Medio', 120, 2800, 3, 'ch'),
      sz('Urabá', 30, 2200, 4, 'ch'),
    ],
  },
  {
    nombre: 'Arauca',
    regimen: 'monomodal',
    subzonas: [sz('Sabana (Arauca, Cravo Norte)', 120, 1800, 4, 'ch'), sz('Piedemonte (Tame, Fortul)', 400, 3200, 3, 'ch')],
  },
  { nombre: 'Atlántico', regimen: 'bimodal', subzonas: [sz('Llanura seca del Caribe', 40, 1000, 5, 'cs')] },
  {
    nombre: 'Bolívar',
    regimen: 'mixto',
    subzonas: [
      sz('Norte seco (Cartagena, Turbaco)', 30, 1020, 5, 'cs'),
      sz('Sur / Depresión Momposina (Magangué, Simití)', 30, 2400, 3, 'ch'),
      sz('Montes de María', 250, 1300, 4, 'cs'),
    ],
  },
  {
    nombre: 'Boyacá',
    regimen: 'bimodal',
    subzonas: [
      sz('Altiplano (Tunja, Duitama, Sogamoso)', 2600, 750, 4, 'fri'),
      sz('Valle de Tenza y clima medio', 1700, 1400, 3, 'tpl'),
      sz('Occidente (Chiquinquirá, Puerto Boyacá)', 400, 2500, 3, 'ch'),
      sz('Piedemonte llanero (Cubará, Pajarito)', 700, 3500, 3, 'ch'),
      sz('Páramo (Güicán, Mongua)', 3300, 900, 3, 'par'),
    ],
  },
  {
    nombre: 'Caldas',
    regimen: 'bimodal',
    subzonas: [
      sz('Zona cafetera (Manizales, Chinchiná)', 1700, 2300, 2, 'tpl'),
      sz('Magdalena caldense (La Dorada, Victoria)', 200, 2200, 3, 'ch'),
      sz('Alto andino (Villamaría, Marulanda)', 2800, 1600, 2, 'fri'),
    ],
  },
  { nombre: 'Caquetá', regimen: 'monomodal', subzonas: [sz('Piedemonte y llanura (Florencia, San Vicente)', 300, 3500, 1, 'ch')] },
  {
    nombre: 'Casanare',
    regimen: 'monomodal',
    subzonas: [
      sz('Sabana (Trinidad, Paz de Ariporo, Hato Corozal)', 180, 1800, 5, 'ch'),
      sz('Piedemonte (Yopal, Aguazul, Tauramena)', 400, 3200, 4, 'ch'),
      sz('Montaña (Chámeza, Recetor, Sácama)', 1500, 2200, 3, 'tpl'),
    ],
  },
  {
    nombre: 'Cauca',
    regimen: 'bimodal',
    subzonas: [
      sz('Meseta de Popayán y norte del Cauca', 1750, 2000, 3, 'tpl'),
      sz('Valle del Patía (seco)', 600, 1200, 5, 'cs'),
      sz('Costa Pacífica (Guapi, Timbiquí)', 20, 5000, 0, 'cmh'),
      sz('Macizo y alto andino', 2800, 1800, 3, 'fri'),
    ],
  },
  {
    nombre: 'Cesar',
    regimen: 'bimodal',
    subzonas: [
      sz('Valle del Cesar (Valledupar, Aguachica)', 150, 1400, 5, 'cs'),
      sz('Serranía del Perijá y Sierra Nevada', 1400, 1800, 4, 'tpl'),
    ],
  },
  {
    nombre: 'Chocó',
    regimen: 'monomodal',
    subzonas: [sz('Chocó biogeográfico (Quibdó, Lloró)', 50, 7000, 0, 'cmh'), sz('Urabá chocoano y norte', 60, 2500, 3, 'ch')],
  },
  {
    nombre: 'Córdoba',
    regimen: 'monomodal',
    subzonas: [sz('Valle del Sinú y sabanas', 50, 1400, 4, 'cs'), sz('Alto Sinú y San Jorge', 250, 2600, 3, 'ch')],
  },
  {
    nombre: 'Cundinamarca',
    regimen: 'bimodal',
    subzonas: [
      sz('Sabana de Bogotá y altiplano', 2600, 800, 4, 'fri'),
      sz('Provincia de clima medio (Fusagasugá, Pacho)', 1600, 1600, 3, 'tpl'),
      sz('Magdalena / Tequendama bajo (Girardot, Tocaima)', 400, 1300, 5, 'cs'),
      sz('Piedemonte llanero (Medina, Paratebueno)', 500, 4000, 3, 'ch'),
      sz('Páramo (Guasca, Sumapaz)', 3200, 1000, 3, 'par'),
    ],
  },
  {
    nombre: 'Bogotá D.C.',
    regimen: 'bimodal',
    subzonas: [sz('Zona rural de la Sabana', 2600, 795, 4, 'fri'), sz('Sumapaz (páramo)', 3300, 1100, 3, 'par')],
  },
  { nombre: 'Guainía', regimen: 'bimodal', subzonas: [sz('Llanura del Guainía (Inírida)', 100, 3100, 2, 'ch')] },
  { nombre: 'Guaviare', regimen: 'monomodal', subzonas: [sz('San José del Guaviare y sabanas', 180, 2600, 3, 'ch')] },
  {
    nombre: 'Huila',
    regimen: 'bimodal',
    subzonas: [
      sz('Valle del Magdalena (Neiva, Campoalegre)', 450, 1300, 5, 'cs'),
      sz('Zona cafetera (Pitalito, Garzón)', 1350, 1600, 3, 'tpl'),
      sz('Alto andino (San Agustín alto, Nevado)', 2400, 1800, 3, 'fri'),
    ],
  },
  {
    nombre: 'La Guajira',
    regimen: 'bimodal',
    subzonas: [
      sz('Alta Guajira (Uribia, Manaure)', 60, 350, 8, 'cs'),
      sz('Media Guajira (Riohacha, Maicao)', 60, 700, 6, 'cs'),
      sz('Sur (Fonseca, Villanueva, San Juan)', 250, 1300, 5, 'cs'),
      sz('Sierra Nevada guajira', 1200, 1600, 4, 'tpl'),
    ],
  },
  {
    nombre: 'Magdalena',
    regimen: 'bimodal',
    subzonas: [
      sz('Zona bananera y llanura (Ciénaga, Fundación)', 40, 1200, 5, 'cs'),
      sz('Sierra Nevada (Minca, Palomino alto)', 1200, 2200, 3, 'tpl'),
      sz('Sur / Depresión Momposina', 30, 1600, 4, 'ch'),
    ],
  },
  {
    nombre: 'Meta',
    regimen: 'monomodal',
    subzonas: [
      sz('Piedemonte (Villavicencio, Lejanías, Acacías)', 450, 4200, 3, 'ch'),
      sz('Altillanura (Puerto Gaitán, Puerto López)', 180, 2300, 4, 'ch'),
      sz('Montaña (El Calvario, San Juanito)', 1800, 2500, 3, 'tpl'),
    ],
  },
  {
    nombre: 'Nariño',
    regimen: 'bimodal',
    subzonas: [
      sz('Andino (Pasto, Túquerres, Ipiales)', 2700, 1000, 3, 'fri'),
      sz('Clima medio y cafetero (La Unión, Sandoná)', 1700, 1600, 3, 'tpl'),
      sz('Costa Pacífica (Tumaco)', 20, 3000, 1, 'cmh'),
      sz('Valle del Patía nariñense', 700, 1300, 5, 'cs'),
    ],
  },
  {
    nombre: 'Norte de Santander',
    regimen: 'bimodal',
    subzonas: [
      sz('Área metropolitana de Cúcuta (seco)', 300, 900, 6, 'cs'),
      sz('Zona andina (Pamplona, Chitagá, Ocaña)', 2200, 1000, 4, 'fri'),
      sz('Catatumbo (Tibú, El Tarra)', 120, 3500, 2, 'ch'),
      sz('Cafetera (Ábrego, Salazar)', 1400, 1400, 4, 'tpl'),
    ],
  },
  {
    nombre: 'Putumayo',
    regimen: 'monomodal',
    subzonas: [
      sz('Piedemonte amazónico (Mocoa, Villagarzón)', 600, 3800, 1, 'ch'),
      sz('Llanura (Puerto Asís, Leguízamo)', 250, 2800, 1, 'ch'),
      sz('Alto Putumayo (Sibundoy, Colón)', 2200, 1400, 2, 'fri'),
    ],
  },
  {
    nombre: 'Quindío',
    regimen: 'bimodal',
    subzonas: [sz('Zona cafetera (Armenia, Montenegro)', 1400, 2000, 2, 'tpl'), sz('Cordillera (Salento, Génova)', 2400, 2200, 2, 'fri')],
  },
  {
    nombre: 'Risaralda',
    regimen: 'bimodal',
    subzonas: [
      sz('Zona cafetera (Pereira, Santa Rosa)', 1450, 2400, 2, 'tpl'),
      sz('Vertiente Pacífica (Pueblo Rico, Mistrató)', 1200, 4500, 0, 'cmh'),
    ],
  },
  { nombre: 'San Andrés y Providencia', regimen: 'monomodal', subzonas: [sz('Insular', 10, 1800, 3, 'ch')] },
  {
    nombre: 'Santander',
    regimen: 'bimodal',
    subzonas: [
      sz('Mesa de los Santos y área metropolitana', 1000, 1200, 4, 'tpl'),
      sz('Provincia Guanentá y Comunera (Socorro, San Gil)', 1400, 1500, 4, 'tpl'),
      sz('Magdalena Medio (Barrancabermeja, Cimitarra)', 120, 2800, 3, 'ch'),
      sz('Alto andino (Málaga, Cerrito)', 2500, 900, 4, 'fri'),
    ],
  },
  {
    nombre: 'Sucre',
    regimen: 'monomodal',
    subzonas: [
      sz('Sabanas y Morrosquillo (Sincelejo, Corozal)', 200, 1200, 4, 'cs'),
      sz('Mojana y San Jorge (Guaranda, Majagual)', 25, 2800, 3, 'ch'),
    ],
  },
  {
    nombre: 'Tolima',
    regimen: 'bimodal',
    subzonas: [
      sz('Norte del Magdalena (Armero, Honda, Ambalema)', 300, 1200, 5, 'cs'),
      sz('Centro (Ibagué, Espinal, Guamo)', 900, 1500, 5, 'cs'),
      sz('Sur y cafetera (Chaparral, Planadas)', 1500, 1800, 4, 'tpl'),
      sz('Alto andino (Cajamarca, Roncesvalles)', 2400, 2000, 3, 'fri'),
    ],
  },
  {
    nombre: 'Valle del Cauca',
    regimen: 'bimodal',
    subzonas: [
      sz('Valle geográfico del Cauca (zona cañera)', 1000, 1200, 4, 'cs'),
      sz('Ladera cafetera (Sevilla, Trujillo, Dagua alto)', 1500, 1800, 3, 'tpl'),
      sz('Llanura Pacífica (Buenaventura)', 20, 6000, 0, 'cmh'),
      sz('Alto andino (Cerro Calima, páramos)', 2800, 2000, 2, 'fri'),
    ],
  },
  { nombre: 'Vaupés', regimen: 'monomodal', subzonas: [sz('Llanura amazónica (Mitú, Carurú)', 150, 3200, 3, 'ch')] },
  {
    nombre: 'Vichada',
    regimen: 'monomodal',
    subzonas: [
      sz('Altillanura (Puerto Carreño, La Primavera)', 100, 1900, 5, 'ch'),
      sz('Transición Orinoquía-Amazonía (Cumaribo)', 150, 2600, 4, 'ch'),
    ],
  },
]
