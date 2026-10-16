// Registro de proyectos con datos climáticos. Agregar un proyecto = un archivo
// en data/proyectos/ + una entrada aquí.
import { baranoa } from './baranoa'
import type { ProjectClimate } from './types'

export const proyectos: Record<string, ProjectClimate> = { baranoa }

export const MONTH_LABELS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export type { ProjectClimate, AnnualRecord, RunoffParams } from './types'
