import { describe, it, expect } from 'vitest'
import {
  convertURtoPesos,
  convertPesosToUR,
  formatPesos,
  formatUR,
  formatURWithPesos,
} from '@/lib/utils/currency'

describe('Currency Utils', () => {
  describe('convertURtoPesos', () => {
    it('converts UR to pesos with default cotizacion', () => {
      // Default cotizacion is 1850
      expect(convertURtoPesos(1)).toBe(1850)
      expect(convertURtoPesos(10)).toBe(18500)
      expect(convertURtoPesos(0)).toBe(0)
    })

    it('converts UR to pesos with custom cotizacion', () => {
      expect(convertURtoPesos(1, 2000)).toBe(2000)
      expect(convertURtoPesos(5, 2000)).toBe(10000)
    })

    it('handles decimal values', () => {
      expect(convertURtoPesos(1.5, 2000)).toBe(3000)
      expect(convertURtoPesos(0.5, 2000)).toBe(1000)
    })
  })

  describe('convertPesosToUR', () => {
    it('converts pesos to UR with default cotizacion', () => {
      // Default cotizacion is 1850
      expect(convertPesosToUR(1850)).toBe(1)
      expect(convertPesosToUR(18500)).toBe(10)
      expect(convertPesosToUR(0)).toBe(0)
    })

    it('converts pesos to UR with custom cotizacion', () => {
      expect(convertPesosToUR(2000, 2000)).toBe(1)
      expect(convertPesosToUR(10000, 2000)).toBe(5)
    })

    it('returns 0 when cotizacion is 0 (avoid division by zero)', () => {
      expect(convertPesosToUR(1000, 0)).toBe(0)
    })
  })

  describe('formatPesos', () => {
    it('formats positive amounts', () => {
      expect(formatPesos(1000)).toBe('$1.000')
      expect(formatPesos(1000000)).toBe('$1.000.000')
    })

    it('formats zero', () => {
      expect(formatPesos(0)).toBe('$0')
    })

    it('handles null and undefined', () => {
      expect(formatPesos(null)).toBe('-')
      expect(formatPesos(undefined)).toBe('-')
    })

    it('formats negative amounts', () => {
      expect(formatPesos(-1000)).toBe('$-1.000')
    })
  })

  describe('formatUR', () => {
    it('formats UR amounts with 2 decimals', () => {
      expect(formatUR(10)).toBe('10,00 UR')
      expect(formatUR(1.5)).toBe('1,50 UR')
    })

    it('handles null and undefined', () => {
      expect(formatUR(null)).toBe('-')
      expect(formatUR(undefined)).toBe('-')
    })

    it('formats zero', () => {
      expect(formatUR(0)).toBe('0,00 UR')
    })
  })

  describe('formatURWithPesos', () => {
    it('formats UR with pesos equivalent', () => {
      const result = formatURWithPesos(1, 2000)
      expect(result).toContain('1,00 UR')
      expect(result).toContain('$2.000')
    })

    it('handles null and undefined', () => {
      expect(formatURWithPesos(null)).toBe('-')
      expect(formatURWithPesos(undefined)).toBe('-')
    })
  })
})
