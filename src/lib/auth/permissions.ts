/**
 * Role-based permissions and data filtering utilities
 * Story 1.6: Automatic Role-Based Data Filtering
 */

import type { UserRole } from '@/types/database'

/**
 * Permission definitions by role
 */
export const ROLE_PERMISSIONS = {
  admin: {
    canViewAllObras: true,
    canViewAllOTs: true,
    canViewAllOCs: true,
    canManageUsers: true,
    canCreateObras: true,
    canApproveOTs: true,
    crossObraVisibility: true,
  },
  director_obra: {
    canViewAllObras: true,
    canViewAllOTs: true,
    canViewAllOCs: true,
    canManageUsers: true,
    canCreateObras: false,
    canApproveOTs: true,
    crossObraVisibility: true,
  },
  jefe_obra: {
    canViewAllObras: false,
    canViewAllOTs: false,
    canViewAllOCs: false,
    canManageUsers: false,
    canCreateObras: false,
    canApproveOTs: false,
    crossObraVisibility: false,
  },
  compras: {
    canViewAllObras: true,
    canViewAllOTs: true,
    canViewAllOCs: true,
    canManageUsers: false,
    canCreateObras: false,
    canApproveOTs: false,
    crossObraVisibility: true,
  },
  encargado_stock: {
    canViewAllObras: false,
    canViewAllOTs: false,
    canViewAllOCs: true,
    canManageUsers: false,
    canCreateObras: false,
    canApproveOTs: false,
    crossObraVisibility: false,
  },
} as const

export type RolePermissions = typeof ROLE_PERMISSIONS[UserRole]

/**
 * Get permissions for a given role
 */
export function getPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.jefe_obra
}

/**
 * Check if user has cross-obra visibility
 */
export function hasCrossObraVisibility(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role]?.crossObraVisibility ?? false
}

/**
 * Check if user can view all obras
 */
export function canViewAllObras(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role]?.canViewAllObras ?? false
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role]?.canManageUsers ?? false
}

/**
 * Check if user can approve OTs
 */
export function canApproveOTs(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role]?.canApproveOTs ?? false
}

/**
 * Roles that have admin-level access
 */
export const ADMIN_ROLES: UserRole[] = ['admin', 'director_obra']

/**
 * Roles that can view cross-obra data
 */
export const CROSS_OBRA_ROLES: UserRole[] = ['admin', 'director_obra', 'compras']

/**
 * Check if role is admin or director_obra
 */
export function isAdminOrDO(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role)
}

/**
 * Check if role has cross-obra access
 */
export function hasCrossObraAccess(role: UserRole): boolean {
  return CROSS_OBRA_ROLES.includes(role)
}
