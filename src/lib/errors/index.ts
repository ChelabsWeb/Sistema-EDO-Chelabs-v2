/**
 * Centralized error handling system with codes for debugging
 */

/**
 * Error codes for the application
 * Format: DOMAIN_ACTION_REASON
 */
export const ErrorCodes = {
  // Authentication errors (AUTH_*)
  AUTH_NOT_AUTHENTICATED: 'AUTH_001',
  AUTH_INVALID_CREDENTIALS: 'AUTH_002',
  AUTH_SESSION_EXPIRED: 'AUTH_003',

  // Authorization errors (AUTHZ_*)
  AUTHZ_INSUFFICIENT_PERMISSIONS: 'AUTHZ_001',
  AUTHZ_ROLE_NOT_ALLOWED: 'AUTHZ_002',
  AUTHZ_NOT_OBRA_MEMBER: 'AUTHZ_003',

  // Validation errors (VAL_*)
  VAL_INVALID_INPUT: 'VAL_001',
  VAL_REQUIRED_FIELD_MISSING: 'VAL_002',
  VAL_INVALID_FORMAT: 'VAL_003',
  VAL_OUT_OF_RANGE: 'VAL_004',

  // Resource errors (RES_*)
  RES_NOT_FOUND: 'RES_001',
  RES_ALREADY_EXISTS: 'RES_002',
  RES_DELETED: 'RES_003',

  // Business logic errors (BIZ_*)
  BIZ_INVALID_STATE_TRANSITION: 'BIZ_001',
  BIZ_BUDGET_EXCEEDED: 'BIZ_002',
  BIZ_HAS_DEPENDENCIES: 'BIZ_003',
  BIZ_OPERATION_NOT_ALLOWED: 'BIZ_004',

  // Database errors (DB_*)
  DB_CONNECTION_ERROR: 'DB_001',
  DB_QUERY_ERROR: 'DB_002',
  DB_CONSTRAINT_VIOLATION: 'DB_003',

  // File/Storage errors (FILE_*)
  FILE_UPLOAD_FAILED: 'FILE_001',
  FILE_TOO_LARGE: 'FILE_002',
  FILE_INVALID_TYPE: 'FILE_003',
  FILE_NOT_FOUND: 'FILE_004',

  // Unknown error
  UNKNOWN: 'ERR_999',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * User-friendly error messages in Spanish
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.AUTH_NOT_AUTHENTICATED]: 'No autenticado. Por favor inicie sesión.',
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Credenciales inválidas.',
  [ErrorCodes.AUTH_SESSION_EXPIRED]: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.',

  [ErrorCodes.AUTHZ_INSUFFICIENT_PERMISSIONS]: 'No tiene permisos para realizar esta acción.',
  [ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED]: 'Su rol no permite realizar esta acción.',
  [ErrorCodes.AUTHZ_NOT_OBRA_MEMBER]: 'No tiene acceso a esta obra.',

  [ErrorCodes.VAL_INVALID_INPUT]: 'Los datos ingresados no son válidos.',
  [ErrorCodes.VAL_REQUIRED_FIELD_MISSING]: 'Faltan campos requeridos.',
  [ErrorCodes.VAL_INVALID_FORMAT]: 'El formato del dato es incorrecto.',
  [ErrorCodes.VAL_OUT_OF_RANGE]: 'El valor está fuera del rango permitido.',

  [ErrorCodes.RES_NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
  [ErrorCodes.RES_ALREADY_EXISTS]: 'Ya existe un recurso con esos datos.',
  [ErrorCodes.RES_DELETED]: 'El recurso ha sido eliminado.',

  [ErrorCodes.BIZ_INVALID_STATE_TRANSITION]: 'No se puede cambiar a ese estado desde el estado actual.',
  [ErrorCodes.BIZ_BUDGET_EXCEEDED]: 'Esta operación excede el presupuesto disponible.',
  [ErrorCodes.BIZ_HAS_DEPENDENCIES]: 'No se puede eliminar porque tiene elementos dependientes.',
  [ErrorCodes.BIZ_OPERATION_NOT_ALLOWED]: 'Esta operación no está permitida.',

  [ErrorCodes.DB_CONNECTION_ERROR]: 'Error de conexión con la base de datos.',
  [ErrorCodes.DB_QUERY_ERROR]: 'Error al procesar la consulta.',
  [ErrorCodes.DB_CONSTRAINT_VIOLATION]: 'Los datos violan una restricción de integridad.',

  [ErrorCodes.FILE_UPLOAD_FAILED]: 'Error al subir el archivo.',
  [ErrorCodes.FILE_TOO_LARGE]: 'El archivo es demasiado grande.',
  [ErrorCodes.FILE_INVALID_TYPE]: 'Tipo de archivo no permitido.',
  [ErrorCodes.FILE_NOT_FOUND]: 'Archivo no encontrado.',

  [ErrorCodes.UNKNOWN]: 'Ha ocurrido un error inesperado.',
}

/**
 * Application error with code for debugging
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public details?: Record<string, unknown>
  ) {
    super(message || ErrorMessages[code])
    this.name = 'AppError'
  }

  /**
   * Format error for logging with all details
   */
  toLogFormat(): string {
    return `[${this.code}] ${this.message}${
      this.details ? ` | Details: ${JSON.stringify(this.details)}` : ''
    }`
  }

  /**
   * Format error for user display (code + message)
   */
  toUserFormat(): string {
    return `${this.message} (${this.code})`
  }
}

/**
 * Create a standardized error result for server actions
 */
export function createErrorResult(
  code: ErrorCode,
  customMessage?: string,
  details?: Record<string, unknown>
): { success: false; error: string; code: ErrorCode } {
  const message = customMessage || ErrorMessages[code]

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${code}] ${message}`, details || '')
  }

  return {
    success: false,
    error: `${message} (${code})`,
    code,
  }
}

/**
 * Helper to check if an error result has a specific code
 */
export function hasErrorCode(
  result: { success: false; code?: ErrorCode },
  code: ErrorCode
): boolean {
  return result.code === code
}
