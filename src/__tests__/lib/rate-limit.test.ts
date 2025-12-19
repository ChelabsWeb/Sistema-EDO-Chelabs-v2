import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock next/headers before importing the module
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({
    get: vi.fn(() => null),
  })),
}))

// Import after mocking
import { checkRateLimit, RateLimits, type RateLimitConfig } from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset time mocks between tests
    vi.useRealTimers()
  })

  describe('checkRateLimit', () => {
    it('should allow requests under the limit', async () => {
      const config: RateLimitConfig = { limit: 5, windowSeconds: 60 }
      const identifier = `test-under-limit-${Date.now()}`

      const result = await checkRateLimit(identifier, config)

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(4)
      expect(result.resetIn).toBe(60)
    })

    it('should track remaining requests correctly', async () => {
      const config: RateLimitConfig = { limit: 3, windowSeconds: 60 }
      const identifier = `test-tracking-${Date.now()}`

      const result1 = await checkRateLimit(identifier, config)
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(2)

      const result2 = await checkRateLimit(identifier, config)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(1)

      const result3 = await checkRateLimit(identifier, config)
      expect(result3.success).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('should block requests over the limit', async () => {
      const config: RateLimitConfig = { limit: 2, windowSeconds: 60 }
      const identifier = `test-over-limit-${Date.now()}`

      // Use up the limit
      await checkRateLimit(identifier, config)
      await checkRateLimit(identifier, config)

      // This should be blocked
      const result = await checkRateLimit(identifier, config)

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.error).toContain('Demasiados intentos')
    })

    it('should use different buckets for different identifiers', async () => {
      const config: RateLimitConfig = { limit: 1, windowSeconds: 60 }
      const identifier1 = `test-bucket-1-${Date.now()}`
      const identifier2 = `test-bucket-2-${Date.now()}`

      // Use up limit for identifier1
      await checkRateLimit(identifier1, config)
      const blocked = await checkRateLimit(identifier1, config)
      expect(blocked.success).toBe(false)

      // identifier2 should still work
      const allowed = await checkRateLimit(identifier2, config)
      expect(allowed.success).toBe(true)
    })

    it('should reset after window expires', async () => {
      vi.useFakeTimers()

      const config: RateLimitConfig = { limit: 1, windowSeconds: 1 }
      const identifier = `test-reset-${Date.now()}`

      // Use up the limit
      await checkRateLimit(identifier, config)
      const blocked = await checkRateLimit(identifier, config)
      expect(blocked.success).toBe(false)

      // Advance time past the window
      vi.advanceTimersByTime(2000)

      // Should be allowed again
      const allowed = await checkRateLimit(identifier, config)
      expect(allowed.success).toBe(true)
    })
  })

  describe('RateLimits presets', () => {
    it('should have LOGIN preset configured correctly', () => {
      expect(RateLimits.LOGIN).toEqual({
        limit: 5,
        windowSeconds: 60,
      })
    })

    it('should have MUTATION preset configured correctly', () => {
      expect(RateLimits.MUTATION).toEqual({
        limit: 30,
        windowSeconds: 60,
      })
    })

    it('should have UPLOAD preset configured correctly', () => {
      expect(RateLimits.UPLOAD).toEqual({
        limit: 10,
        windowSeconds: 60,
      })
    })
  })
})
