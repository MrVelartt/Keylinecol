// ── Tonos de estado ──
// El color de estado tiene significado: óptimo (verde de marca), alerta leve
// (arena) y déficit (terracota). Nunca rojo/amarillo de semáforo.
import { palette } from '@/lib/theme'

export type Tone = 'good' | 'warn' | 'bad'

export const toneClass: Record<Tone, string> = {
  good: 'text-brand bg-brand/10 border-brand/25',
  warn: 'text-signal-demand bg-signal-demand/10 border-signal-demand/25',
  bad: 'text-signal-deficit bg-signal-deficit/10 border-signal-deficit/25',
}

export const toneColor: Record<Tone, string> = {
  good: palette.signal.water,
  warn: palette.signal.demand,
  bad: palette.signal.deficit,
}
