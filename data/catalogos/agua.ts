// ── Catálogos de demanda hídrica ──
// Cultivos (Kc), sistemas de riego (eficiencia) y consumo animal. Catálogo
// único del sitio: lo usan la calculadora de demanda hídrica y Diseño Keyline
// Predial.
// Fuentes: FAO-56 (Kc, tabla 12); Cenicafé / U. de Manizales (café);
// IICA y AGROSAVIA (eficiencia de riego); FEDEGÁN / CONtexto Ganadero y
// 3tres3 (consumo animal); Resolución 0330 de 2017 (dotación doméstica).

export interface Cultivo {
  nombre: string
  kc: number
  fuente: string
}

export const CULTIVOS: Cultivo[] = [
  { nombre: 'Pasto de pastoreo rotacional', kc: 0.95, fuente: 'FAO-56 T.12' },
  { nombre: 'Pasto de pastoreo extensivo', kc: 0.75, fuente: 'FAO-56 T.12' },
  { nombre: 'Kikuyo (trópico alto lechero)', kc: 0.95, fuente: 'FAO-56 adaptado' },
  { nombre: 'Brachiaria (trópico bajo)', kc: 0.9, fuente: 'FAO-56 adaptado' },
  { nombre: 'Pasto de corte (maralfalfa, king)', kc: 1.15, fuente: 'FAO-56 adaptado' },
  { nombre: 'Café en producción (Colombia)', kc: 0.84, fuente: 'Cenicafé / U. Manizales' },
  { nombre: 'Café con cobertura noble', kc: 1.1, fuente: 'FAO-56 T.12' },
  { nombre: 'Cacao', kc: 1.05, fuente: 'FAO-56 T.12' },
  { nombre: 'Aguacate Hass adulto', kc: 0.8, fuente: 'FAO-56 adaptado' },
  { nombre: 'Cítricos 50% cobertura', kc: 0.6, fuente: 'FAO-56 T.12' },
  { nombre: 'Plátano / banano (año 2+)', kc: 1.2, fuente: 'FAO-56 T.12' },
  { nombre: 'Caña de azúcar', kc: 1.25, fuente: 'FAO-56 T.12' },
  { nombre: 'Palma de aceite', kc: 1.0, fuente: 'FAO-56 T.12' },
  { nombre: 'Maíz (grano)', kc: 1.2, fuente: 'FAO-56 T.12' },
  { nombre: 'Arroz (inundado, sin percolación)', kc: 1.2, fuente: 'FAO-56 T.12' },
  { nombre: 'Papa', kc: 1.15, fuente: 'FAO-56 T.12' },
  { nombre: 'Hortalizas', kc: 1.05, fuente: 'FAO-56 T.12' },
  { nombre: 'Tomate', kc: 1.15, fuente: 'FAO-56 T.12' },
  { nombre: 'Frutales varios', kc: 0.9, fuente: 'FAO-56 adaptado' },
  { nombre: 'Plantación forestal establecida', kc: 1.0, fuente: 'FAO-56 T.12' },
  { nombre: 'Bosque / restauración establecida', kc: 1.0, fuente: 'FAO-56 adaptado' },
]

export interface SistemaRiego {
  nombre: string
  /** Eficiencia total (conducción × aplicación), 0–1. 0 = secano. */
  eficiencia: number
}

export const RIEGOS: SistemaRiego[] = [
  { nombre: 'Goteo (con tubería)', eficiencia: 0.88 },
  { nombre: 'Microaspersión (con tubería)', eficiencia: 0.83 },
  { nombre: 'Aspersión fija / pivote', eficiencia: 0.83 },
  { nombre: 'Aspersión móvil / cañón', eficiencia: 0.73 },
  { nombre: 'Gravedad — canal revestido', eficiencia: 0.54 },
  { nombre: 'Gravedad — canal en tierra', eficiencia: 0.39 },
  { nombre: 'Riego manual / manguera', eficiencia: 0.5 },
  { nombre: 'Sin riego (secano)', eficiencia: 0 },
]

export interface CategoriaAnimal {
  id: string
  nombre: string
  /** Consumo (L/animal·día) a 15–25 °C. */
  litrosDia: number
}

export const ANIMALES: CategoriaAnimal[] = [
  { id: 'vaca-alta', nombre: 'Vaca lechera alta producción', litrosDia: 100 },
  { id: 'vaca-leche', nombre: 'Vaca de leche promedio', litrosDia: 80 },
  { id: 'bovino-carne', nombre: 'Bovino adulto de carne', litrosDia: 50 },
  { id: 'bovino-ceba', nombre: 'Bovino de ceba', litrosDia: 45 },
  { id: 'novillos', nombre: 'Novillas / novillos (400 kg)', litrosDia: 48 },
  { id: 'levante', nombre: 'Levante (225 kg)', litrosDia: 23 },
  { id: 'terneros', nombre: 'Terneros', litrosDia: 15 },
  { id: 'equinos', nombre: 'Equinos de trabajo', litrosDia: 40 },
  { id: 'mular', nombre: 'Mular / asnal', litrosDia: 25 },
  { id: 'ovinos', nombre: 'Ovinos', litrosDia: 6 },
  { id: 'caprinos', nombre: 'Caprinos', litrosDia: 6 },
  { id: 'cerda-lactante', nombre: 'Cerda lactante', litrosDia: 30 },
  { id: 'cerda-gestante', nombre: 'Cerda gestante', litrosDia: 12 },
  { id: 'porcino-ceba', nombre: 'Porcino de ceba', litrosDia: 8 },
  { id: 'lechon', nombre: 'Lechón destetado', litrosDia: 2 },
  { id: 'ave-ponedora', nombre: 'Ave ponedora', litrosDia: 0.22 },
  { id: 'pollo-engorde', nombre: 'Pollo de engorde', litrosDia: 0.25 },
]

/** Factor de consumo por temperatura media (escala 0,8 / 1,0 / 1,3 / 1,6). */
export const FACTORES_TEMPERATURA = [
  { valor: 0.8, nombre: 'Menos de 15 °C — ×0,8' },
  { valor: 1.0, nombre: '15 a 25 °C — ×1,0' },
  { valor: 1.3, nombre: '25 a 32 °C — ×1,3' },
  { valor: 1.6, nombre: 'Más de 32 °C — ×1,6' },
] as const
