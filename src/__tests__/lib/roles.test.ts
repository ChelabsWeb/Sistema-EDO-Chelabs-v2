import { describe, it, expect } from 'vitest'
import { getRoleDisplayName, getRoleAbbreviation } from '@/lib/roles'

describe('Role Utils', () => {
  describe('getRoleDisplayName', () => {
    it('returns correct display name for admin', () => {
      expect(getRoleDisplayName('admin')).toBe('Administrador')
    })

    it('returns correct display name for director_obra', () => {
      expect(getRoleDisplayName('director_obra')).toBe('Director de Obra')
    })

    it('returns correct display name for jefe_obra', () => {
      expect(getRoleDisplayName('jefe_obra')).toBe('Jefe de Obra')
    })

    it('returns correct display name for compras', () => {
      expect(getRoleDisplayName('compras')).toBe('Compras')
    })

    it('returns Usuario for null role', () => {
      expect(getRoleDisplayName(null)).toBe('Usuario')
    })
  })

  describe('getRoleAbbreviation', () => {
    it('returns correct abbreviation for admin', () => {
      expect(getRoleAbbreviation('admin')).toBe('Admin')
    })

    it('returns correct abbreviation for director_obra', () => {
      expect(getRoleAbbreviation('director_obra')).toBe('DO')
    })

    it('returns correct abbreviation for jefe_obra', () => {
      expect(getRoleAbbreviation('jefe_obra')).toBe('JO')
    })

    it('returns correct abbreviation for compras', () => {
      expect(getRoleAbbreviation('compras')).toBe('Compras')
    })

    it('returns empty string for null role', () => {
      expect(getRoleAbbreviation(null)).toBe('')
    })
  })
})
