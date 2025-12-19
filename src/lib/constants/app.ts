/**
 * Application-wide constants
 * Centralized to avoid magic numbers and ensure consistency
 */

// =============================================================================
// CURRENCY & FINANCIAL
// =============================================================================

/**
 * Default UR (Unidad Reajustable) to Pesos exchange rate
 * Used as fallback when no configuration is set in database
 * Should be updated periodically to reflect current rates
 */
export const DEFAULT_COTIZACION_UR = 1850

/**
 * Currency formatting options for Uruguayan Pesos
 */
export const CURRENCY_FORMAT = {
  locale: 'es-UY',
  currency: 'UYU',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
} as const

// =============================================================================
// PAGINATION
// =============================================================================

/**
 * Default items per page for list views
 */
export const DEFAULT_PAGE_SIZE = 20

/**
 * Maximum items per page (to prevent abuse)
 */
export const MAX_PAGE_SIZE = 100

/**
 * Available page size options for UI selectors
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

// =============================================================================
// FILE UPLOADS
// =============================================================================

/**
 * Maximum file size for photo uploads (in bytes)
 * 10MB = 10 * 1024 * 1024
 */
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024

/**
 * Maximum file size for photo uploads (human readable)
 */
export const MAX_PHOTO_SIZE_MB = 10

/**
 * Allowed MIME types for photo uploads
 */
export const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

/**
 * Storage bucket name for OT photos
 */
export const OT_PHOTOS_BUCKET = 'ot-fotos'

// =============================================================================
// VALIDATION LIMITS
// =============================================================================

/**
 * Maximum length for text fields
 */
export const MAX_LENGTHS = {
  obraName: 200,
  obraAddress: 500,
  obraCooperativa: 200,
  rubroName: 200,
  insumoName: 200,
  otDescription: 2000,
  taskDescription: 500,
  photoDescription: 500,
  userName: 200,
  userEmail: 254,
} as const

/**
 * Minimum length for required text fields
 */
export const MIN_LENGTHS = {
  obraName: 3,
  rubroName: 2,
  insumoName: 2,
  otDescription: 10,
  taskDescription: 3,
  userName: 2,
} as const

// =============================================================================
// BUSINESS RULES
// =============================================================================

/**
 * Deviation thresholds for visual alerts (percentage)
 */
export const DEVIATION_THRESHOLDS = {
  /** Green - on budget or under */
  ok: 0,
  /** Yellow - slight overrun */
  warning: 10,
  /** Red - significant overrun */
  alert: 20,
} as const

/**
 * Progress thresholds for visual indicators (percentage)
 */
export const PROGRESS_THRESHOLDS = {
  /** Just started */
  low: 25,
  /** In progress */
  medium: 50,
  /** Almost done */
  high: 75,
  /** Complete */
  complete: 100,
} as const

// =============================================================================
// UI CONSTANTS
// =============================================================================

/**
 * Debounce delay for search inputs (ms)
 */
export const SEARCH_DEBOUNCE_MS = 300

/**
 * Toast notification duration (ms)
 */
export const TOAST_DURATION_MS = 5000

/**
 * Auto-refresh interval for dashboards (ms)
 * 5 minutes = 5 * 60 * 1000
 */
export const DASHBOARD_REFRESH_INTERVAL_MS = 5 * 60 * 1000
