import { describe, it, expect } from 'vitest'
import {
  formatOTCode,
  parseOTCode,
  getOTDisplayCode,
  formatOTNumber,
} from '@/lib/utils/ot-format'

describe('OT Format Utilities', () => {
  describe('formatOTCode', () => {
    it('should format with default config', () => {
      expect(formatOTCode(1, 2024)).toBe('OT-2024-001')
      expect(formatOTCode(42, 2024)).toBe('OT-2024-042')
      expect(formatOTCode(999, 2025)).toBe('OT-2025-999')
    })

    it('should handle numbers larger than minDigits', () => {
      expect(formatOTCode(1000, 2024)).toBe('OT-2024-1000')
      expect(formatOTCode(12345, 2024)).toBe('OT-2024-12345')
    })

    it('should accept Date object for year', () => {
      const date = new Date('2025-06-15T10:00:00Z')
      expect(formatOTCode(5, date)).toBe('OT-2025-005')
    })

    it('should accept date string for year', () => {
      expect(formatOTCode(7, '2024-12-25')).toBe('OT-2024-007')
    })

    it('should use current year when no year provided', () => {
      const currentYear = new Date().getFullYear()
      expect(formatOTCode(1)).toBe(`OT-${currentYear}-001`)
    })

    it('should respect custom prefix', () => {
      expect(formatOTCode(1, 2024, { prefix: 'WORK' })).toBe('WORK-2024-001')
      expect(formatOTCode(1, 2024, { prefix: 'OBRA-A' })).toBe('OBRA-A-2024-001')
    })

    it('should exclude year when includeYear is false', () => {
      expect(formatOTCode(1, 2024, { includeYear: false })).toBe('OT-001')
      expect(formatOTCode(42, 2024, { includeYear: false })).toBe('OT-042')
    })

    it('should respect custom minDigits', () => {
      expect(formatOTCode(1, 2024, { minDigits: 4 })).toBe('OT-2024-0001')
      expect(formatOTCode(1, 2024, { minDigits: 5 })).toBe('OT-2024-00001')
      expect(formatOTCode(1, 2024, { minDigits: 1 })).toBe('OT-2024-1')
    })

    it('should respect custom separator', () => {
      expect(formatOTCode(1, 2024, { separator: '/' })).toBe('OT/2024/001')
      expect(formatOTCode(1, 2024, { separator: '_' })).toBe('OT_2024_001')
    })

    it('should combine multiple config options', () => {
      expect(formatOTCode(5, 2024, {
        prefix: 'WO',
        includeYear: false,
        minDigits: 4,
        separator: '.',
      })).toBe('WO.0005')
    })
  })

  describe('parseOTCode', () => {
    it('should parse standard format', () => {
      expect(parseOTCode('OT-2024-001')).toEqual({
        prefix: 'OT',
        year: 2024,
        numero: 1,
      })
      expect(parseOTCode('OT-2025-042')).toEqual({
        prefix: 'OT',
        year: 2025,
        numero: 42,
      })
    })

    it('should parse format without year', () => {
      expect(parseOTCode('OT-001')).toEqual({
        prefix: 'OT',
        year: null,
        numero: 1,
      })
      expect(parseOTCode('WORK-999')).toEqual({
        prefix: 'WORK',
        year: null,
        numero: 999,
      })
    })

    it('should handle custom prefixes', () => {
      // Note: prefix parsing is simple, it takes the first part
      expect(parseOTCode('WORK-2024-005')).toEqual({
        prefix: 'WORK',
        year: 2024,
        numero: 5,
      })
    })

    it('should return null for invalid codes', () => {
      expect(parseOTCode('invalid')).toBeNull()
      expect(parseOTCode('OT')).toBeNull()
      expect(parseOTCode('OT-abc')).toBeNull()
      expect(parseOTCode('')).toBeNull()
    })
  })

  describe('getOTDisplayCode', () => {
    it('should format OT object with created_at', () => {
      const ot = { numero: 5, created_at: '2024-03-15T10:00:00Z' }
      expect(getOTDisplayCode(ot)).toBe('OT-2024-005')
    })

    it('should handle null created_at', () => {
      const currentYear = new Date().getFullYear()
      const ot = { numero: 10, created_at: null }
      expect(getOTDisplayCode(ot)).toBe(`OT-${currentYear}-010`)
    })

    it('should handle missing created_at', () => {
      const currentYear = new Date().getFullYear()
      const ot = { numero: 1 }
      expect(getOTDisplayCode(ot)).toBe(`OT-${currentYear}-001`)
    })
  })

  describe('formatOTNumber', () => {
    it('should pad numbers to default 3 digits', () => {
      expect(formatOTNumber(1)).toBe('001')
      expect(formatOTNumber(42)).toBe('042')
      expect(formatOTNumber(999)).toBe('999')
    })

    it('should not truncate larger numbers', () => {
      expect(formatOTNumber(1000)).toBe('1000')
      expect(formatOTNumber(12345)).toBe('12345')
    })

    it('should respect custom minDigits', () => {
      expect(formatOTNumber(1, 4)).toBe('0001')
      expect(formatOTNumber(1, 5)).toBe('00001')
      expect(formatOTNumber(1, 1)).toBe('1')
    })
  })
})
