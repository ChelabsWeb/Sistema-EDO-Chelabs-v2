/**
 * OT Code Formatting Utilities
 *
 * Formats the numeric OT number into a human-readable code
 * Format: OT-{YYYY}-{NNN} where NNN is zero-padded to 3 digits
 *
 * Examples:
 *   formatOTCode(1, 2024) → "OT-2024-001"
 *   formatOTCode(42, 2025) → "OT-2025-042"
 *   formatOTCode(1000, 2025) → "OT-2025-1000"
 */

export interface OTCodeConfig {
  /** Prefix for the code (default: "OT") */
  prefix?: string
  /** Include year in code (default: true) */
  includeYear?: boolean
  /** Minimum digits for number padding (default: 3) */
  minDigits?: number
  /** Separator character (default: "-") */
  separator?: string
}

const DEFAULT_CONFIG: Required<OTCodeConfig> = {
  prefix: 'OT',
  includeYear: true,
  minDigits: 3,
  separator: '-',
}

/**
 * Format an OT number into a formatted code string
 *
 * @param numero - The numeric OT number from database
 * @param yearOrDate - Year number or Date object to extract year from
 * @param config - Optional formatting configuration
 * @returns Formatted OT code string
 *
 * @example
 * formatOTCode(1, 2024) // "OT-2024-001"
 * formatOTCode(42, new Date('2025-03-15')) // "OT-2025-042"
 * formatOTCode(5, 2024, { prefix: 'OBRA-A', includeYear: false }) // "OBRA-A-005"
 */
export function formatOTCode(
  numero: number,
  yearOrDate?: number | Date | string,
  config?: OTCodeConfig
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  // Determine year
  let year: number
  if (yearOrDate instanceof Date) {
    year = yearOrDate.getFullYear()
  } else if (typeof yearOrDate === 'string') {
    year = new Date(yearOrDate).getFullYear()
  } else if (typeof yearOrDate === 'number') {
    year = yearOrDate
  } else {
    year = new Date().getFullYear()
  }

  // Format number with padding
  const paddedNumber = String(numero).padStart(cfg.minDigits, '0')

  // Build code parts
  const parts = [cfg.prefix]
  if (cfg.includeYear) {
    parts.push(String(year))
  }
  parts.push(paddedNumber)

  return parts.join(cfg.separator)
}

/**
 * Parse a formatted OT code back into its components
 *
 * @param code - Formatted OT code string
 * @returns Parsed components or null if invalid
 *
 * @example
 * parseOTCode("OT-2024-001") // { prefix: "OT", year: 2024, numero: 1 }
 * parseOTCode("OT-042") // { prefix: "OT", year: null, numero: 42 }
 */
export function parseOTCode(
  code: string
): { prefix: string; year: number | null; numero: number } | null {
  const parts = code.split('-')

  if (parts.length < 2) return null

  const prefix = parts[0]
  const lastPart = parts[parts.length - 1]
  const numero = parseInt(lastPart, 10)

  if (isNaN(numero)) return null

  // Check if second part is a year (4 digits)
  let year: number | null = null
  if (parts.length >= 3) {
    const potentialYear = parseInt(parts[1], 10)
    if (potentialYear >= 2000 && potentialYear <= 2100) {
      year = potentialYear
    }
  }

  return { prefix, year, numero }
}

/**
 * Get the display code for an OT
 * This is the main function to use in UI components
 *
 * @param ot - Object with numero and created_at fields
 * @returns Formatted display code
 *
 * @example
 * getOTDisplayCode({ numero: 5, created_at: '2024-03-15' }) // "OT-2024-005"
 */
export function getOTDisplayCode(
  ot: { numero: number; created_at?: string | null }
): string {
  const year = ot.created_at ? new Date(ot.created_at) : new Date()
  return formatOTCode(ot.numero, year)
}

/**
 * Extract just the formatted number (without prefix/year) for compact display
 *
 * @param numero - The numeric OT number
 * @param minDigits - Minimum digits for padding (default: 3)
 * @returns Zero-padded number string
 *
 * @example
 * formatOTNumber(5) // "005"
 * formatOTNumber(42, 4) // "0042"
 */
export function formatOTNumber(numero: number, minDigits: number = 3): string {
  return String(numero).padStart(minDigits, '0')
}
