'use server'

/**
 * Simple in-memory rate limiter for Server Actions
 *
 * For production with multiple instances, consider using Redis
 * This implementation works well for single-instance deployments
 */

import type { RateLimitConfig, RateLimitResult } from './rate-limit-config'

// Re-export types for convenience (types are fine in 'use server' files)
export type { RateLimitConfig, RateLimitResult }
// Note: RateLimits must be imported directly from './rate-limit-config'
// because 'use server' files can only export async functions

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store - resets on server restart
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000

let cleanupScheduled = false

function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true

  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}

/**
 * Check rate limit for a given identifier (e.g., IP, user ID, email)
 *
 * @param identifier - Unique identifier for the rate limit bucket
 * @param config - Rate limit configuration
 * @returns Result indicating if the request is allowed
 *
 * @example
 * ```ts
 * const result = await checkRateLimit('login:user@example.com', { limit: 5, windowSeconds: 60 })
 * if (!result.success) {
 *   return { error: `Demasiados intentos. Esperá ${result.resetIn} segundos.` }
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  scheduleCleanup()

  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = identifier

  const entry = rateLimitStore.get(key)

  // No existing entry or window expired - create new
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })

    return {
      success: true,
      remaining: config.limit - 1,
      resetIn: config.windowSeconds,
    }
  }

  // Window still active
  if (entry.count >= config.limit) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000)
    return {
      success: false,
      remaining: 0,
      resetIn,
      error: `Demasiados intentos. Esperá ${resetIn} segundos.`,
    }
  }

  // Increment counter
  entry.count++
  rateLimitStore.set(key, entry)

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  }
}

/**
 * Helper to get client IP from headers (for use in Server Actions)
 * Note: In production, ensure your proxy sets X-Forwarded-For correctly
 */
export async function getClientIdentifier(): Promise<string> {
  // In Server Actions, we can't easily access headers
  // This is a placeholder - in production, you'd extract from request context
  // For now, we'll use a combination of techniques

  try {
    // Try to get from Next.js headers (requires next/headers)
    const { headers } = await import('next/headers')
    const headersList = await headers()

    const forwarded = headersList.get('x-forwarded-for')
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }

    const realIp = headersList.get('x-real-ip')
    if (realIp) {
      return realIp
    }

    // Fallback to a session-based identifier would go here
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Create a rate-limited wrapper for any async function
 *
 * @example
 * ```ts
 * const rateLimitedLogin = await withRateLimit(
 *   async (email: string) => { ... },
 *   (email) => `login:${email}`,
 *   RateLimits.LOGIN
 * )
 * ```
 */
export async function withRateLimit<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  getIdentifier: (...args: TArgs) => string,
  config: RateLimitConfig
): Promise<(...args: TArgs) => Promise<TResult | { success: false; error: string }>> {
  return async (...args: TArgs): Promise<TResult | { success: false; error: string }> => {
    const identifier = getIdentifier(...args)
    const rateLimitResult = await checkRateLimit(identifier, config)

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: rateLimitResult.error || 'Rate limit exceeded',
      }
    }

    return fn(...args)
  }
}
