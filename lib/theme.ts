// ── Paleta de marca Keyline Colombia — fuente única de verdad ──
// Tailwind (tailwind.config.ts), las gráficas (lib/chart-theme.ts), los SVG
// inline y el generador de PDF (lib/pdf) leen de aquí. Ningún componente
// debe declarar un color propio: si falta un tono, se agrega en este archivo.
//
// Contrastes medidos (WCAG) sobre surface #1D1D1B / surface.raised #2C2C2A:
//   ink.secondary 7.0 / 5.8 · ink.mono 5.7 / 4.7 · signal.demand 7.2 / 6.0
//   signal.deficit 6.1 / 5.1 · brand 8.0 / 6.6
// ink.faint (3.2:1) es solo decorativo: numerales de fondo, separadores.

export const palette = {
  surface: {
    DEFAULT: '#1D1D1B', // fondo base (carbón)
    raised: '#2C2C2A', // tarjetas y paneles
    hover: '#333331', // tarjeta en hover
    sunken: '#141412', // menú móvil, pie, scrollbar
  },
  brand: {
    DEFAULT: '#95C11F', // verde institucional
    hover: '#A6D42A',
    deep: '#2A4A0E', // verde profundo (scrollbar, sombras de tarjeta)
    pale: '#E9EA9B',
    print: '#4F6B1A', // verde para texto sobre papel blanco (6.1:1)
  },
  ink: {
    primary: '#FFFFFF',
    secondary: '#A8A7A1', // párrafos
    mono: '#98968F', // textos monoespaciados, etiquetas de eje, coordenadas
    faint: '#6C6C6A', // decorativo, nunca texto de lectura
  },
  // Tonos con significado. Reservados para datos y estados, nunca decoración.
  signal: {
    water: '#95C11F', // agua, precipitación, oferta hídrica, estado óptimo
    demand: '#D4A056', // demanda, ETo, pérdida, estado de alerta leve
    deficit: '#D8876A', // déficit, alerta — terracota apagado, no rojo semáforo
    neutral: '#98968F', // series secundarias, promedio histórico
  },
  // Verdes nocturnos de las ilustraciones de paisaje (MountainSVG, Hero).
  landscape: {
    night: '#080E08', // fondo de las miniaturas de terreno y del visor de proyectos
    band: '#0C180C', // franjas verdes (Ticker, StatsBar, LandscapeBreak)
    near: '#0D1B0D',
    mid: '#0F1F0F',
    far: '#0E1E0E',
    moss: '#1A1F1A',
    glow: '#20281A',
  },
  // Paleta invertida para impresión (PDF).
  print: {
    paper: '#FFFFFF',
    panel: '#F4F5EE',
    rule: '#D9DBD0',
    ink: '#1D1D1B',
    muted: '#6B6A65',
    accent: '#4F6B1A',
    deficit: '#A0472A',
  },
} as const

// Opacidades de blanco usadas para bordes y velos sobre el fondo oscuro.
export const lines = {
  subtle: 'rgba(255,255,255,0.07)', // bordes de tarjetas, grillas de gráficas
  strong: 'rgba(255,255,255,0.14)', // bordes de inputs y botones secundarios
  emphasis: 'rgba(255,255,255,0.30)', // hover de botones secundarios
} as const

export const veils = {
  DEFAULT: 'rgba(255,255,255,0.04)', // hover de filas, fondos de inputs
  strong: 'rgba(255,255,255,0.08)',
} as const

/** Convierte un hex #RRGGBB en rgba con la opacidad dada (0–1). */
export function alpha(hex: string, opacity: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${opacity})`
}

/** Hex #RRGGBB → tupla RGB, para jsPDF. */
export function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
