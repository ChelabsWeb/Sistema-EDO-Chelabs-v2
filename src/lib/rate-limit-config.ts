/**
 * Rate limit configuration types and presets
 * This file contains no server-side code, only types and constants
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number // seconds until reset
  error?: string
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimits = {
  /** Login attempts: 5 per minute per email */
  LOGIN: { limit: 5, windowSeconds: 60 },

  /** Password reset: 3 per 15 minutes per email */
  PASSWORD_RESET: { limit: 3, windowSeconds: 900 },

  /** API mutations: 30 per minute per user */
  MUTATION: { limit: 30, windowSeconds: 60 },

  /** API reads: 100 per minute per user */
  READ: { limit: 100, windowSeconds: 60 },

  /** File uploads: 10 per minute per user */
  UPLOAD: { limit: 10, windowSeconds: 60 },

  /** Expensive operations: 5 per minute per user */
  EXPENSIVE: { limit: 5, windowSeconds: 60 },
} as const
