/**
 * Chart Colors Utility
 * Paleta de cores centralizada para gráficos Chart.js
 *
 * IMPORTANTE: Não usar hex hardcoded!
 * Sempre mapear dos design tokens.
 */

/**
 * Converte HSL para HEX
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns Cor em formato HEX
 */
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Extrai valores HSL de uma string CSS HSL
 * @param hslString String no formato "198 72% 19%" ou "hsl(198, 72%, 19%)"
 * @returns Array com [h, s, l]
 */
export function parseHSL(hslString: string): [number, number, number] {
  // Remove "hsl(", ")", espaços extras
  const cleaned = hslString.replace(/hsl\(|\)|%/g, '').trim()
  const parts = cleaned.split(/[\s,]+/).map(p => parseFloat(p.trim()))

  if (parts.length !== 3) {
    throw new Error(`Invalid HSL string: ${hslString}`)
  }

  return [parts[0], parts[1], parts[2]]
}

/**
 * Converte string HSL CSS para HEX
 * @param hslString String no formato "198 72% 19%" ou "hsl(198, 72%, 19%)"
 * @returns Cor em formato HEX
 */
export function hslStringToHex(hslString: string): string {
  const [h, s, l] = parseHSL(hslString)
  return hslToHex(h, s, l)
}

/**
 * Design Tokens mapeados para HEX
 * Baseado no arquivo design-tokens.json
 */
export const CHART_COLORS = {
  // Chart Colors principais
  red: '#EF4444',       // Red 500
  orange: '#F97316',    // Orange 500
  yellow: '#FACC15',    // Yellow 500
  green: '#22C55E',     // Green 500
  blue: '#3B82F6',      // Blue 500
  violet: '#8B5CF6',    // Violet 500
  pink: '#EC4899',      // Pink 500
  cyan: '#06B6D4',      // Cyan 500

  // Semantic Colors
  primary: '#0F3D52',   // Primary - Teal escuro
  accent: '#8B5CF6',    // Accent - Violet 500
  accentLight: '#C4B5FD', // Accent Light - Violet 300

  success: '#22C55E',   // Green 500
  warning: '#FACC15',   // Yellow 500
  destructive: '#EF4444', // Red 500
  info: '#3B82F6',      // Blue 500

  // Grayscale
  zinc50: '#FAFAFA',
  zinc100: '#F4F4F5',
  zinc200: '#E4E4E7',
  zinc300: '#D4D4D8',
  zinc400: '#A1A1AA',
  zinc500: '#71717A',
  zinc600: '#52525B',
  zinc700: '#3F3F46',
  zinc800: '#27272A',
  zinc900: '#18181B',
  zinc950: '#09090B',
} as const

/**
 * Paleta padrão para gráficos (ordem visual recomendada)
 */
export const DEFAULT_CHART_PALETTE = [
  CHART_COLORS.violet,
  CHART_COLORS.blue,
  CHART_COLORS.cyan,
  CHART_COLORS.green,
  CHART_COLORS.yellow,
  CHART_COLORS.orange,
  CHART_COLORS.red,
  CHART_COLORS.pink,
] as const

/**
 * Paleta de risco (do vermelho ao verde)
 */
export const RISK_PALETTE = [
  CHART_COLORS.red,      // Alto risco
  CHART_COLORS.orange,   // Médio-alto
  CHART_COLORS.yellow,   // Médio
  CHART_COLORS.green,    // Baixo risco
] as const

/**
 * Paleta de temperatura (azul -> verde -> amarelo -> vermelho)
 */
export const TEMPERATURE_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.cyan,
  CHART_COLORS.green,
  CHART_COLORS.yellow,
  CHART_COLORS.orange,
  CHART_COLORS.red,
] as const

/**
 * Adiciona opacidade a uma cor HEX
 * @param hex Cor em formato HEX (#RRGGBB)
 * @param alpha Opacidade (0-1)
 * @returns Cor em formato rgba()
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Gera uma cor da paleta padrão pelo índice
 * @param index Índice da cor
 * @returns Cor em formato HEX
 */
export function getChartColor(index: number): string {
  return DEFAULT_CHART_PALETTE[index % DEFAULT_CHART_PALETTE.length]
}

/**
 * Gera um array de cores para múltiplos datasets
 * @param count Número de cores necessárias
 * @param palette Paleta a usar (padrão: DEFAULT_CHART_PALETTE)
 * @returns Array de cores HEX
 */
export function generateColors(
  count: number,
  palette: readonly string[] = DEFAULT_CHART_PALETTE
): string[] {
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length])
  }
  return colors
}

/**
 * Obtém a cor CSS de uma variável CSS no runtime
 * @param variableName Nome da variável CSS (ex: '--primary')
 * @returns Valor da variável ou fallback
 */
export function getCSSVariable(variableName: string, fallback?: string): string {
  if (typeof window === 'undefined') {
    return fallback || ''
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()

  return value || fallback || ''
}
