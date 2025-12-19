/**
 * Role utility functions
 * These can be used in both server and client components
 */

import type { UserRole } from '@/types/database'

/**
 * Get role display name in Spanish
 */
export function getRoleDisplayName(role: UserRole | null): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrador',
    director_obra: 'Director de Obra',
    jefe_obra: 'Jefe de Obra',
    compras: 'Compras',
  }
  return role ? roleNames[role] : 'Usuario'
}

/**
 * Get role abbreviation
 */
export function getRoleAbbreviation(role: UserRole | null): string {
  const roleAbbr: Record<UserRole, string> = {
    admin: 'Admin',
    director_obra: 'DO',
    jefe_obra: 'JO',
    compras: 'Compras',
  }
  return role ? roleAbbr[role] : ''
}
