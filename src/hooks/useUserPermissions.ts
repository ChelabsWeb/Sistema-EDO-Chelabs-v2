'use client'

import { useCallback, useMemo } from 'react'
import {
  getPermissions,
  hasCrossObraVisibility as checkCrossObraVisibility,
  canViewAllObras as checkCanViewAllObras,
  canManageUsers as checkCanManageUsers,
  canApproveOTs as checkCanApproveOTs,
  isAdminOrDO as checkIsAdminOrDO,
  hasCrossObraAccess as checkHasCrossObraAccess,
  type RolePermissions,
} from '@/lib/auth/permissions'
import type { UserRole } from '@/types/database'

export interface UserPermissionsInput {
  role: UserRole | null
  obraId: string | null
}

export interface UseUserPermissionsReturn {
  // User info
  role: UserRole | null
  obraId: string | null

  // Permission checks
  permissions: RolePermissions | null
  hasCrossObraVisibility: boolean
  canViewAllObras: boolean
  canManageUsers: boolean
  canApproveOTs: boolean
  isAdminOrDO: boolean
  hasCrossObraAccess: boolean

  // Helper functions
  canAccessObra: (obraId: string) => boolean
}

/**
 * Hook for accessing user permissions in client components
 * Provides role-based access control checks
 *
 * @param input - User role and obra information (pass from server component)
 */
export function useUserPermissions(
  input: UserPermissionsInput
): UseUserPermissionsReturn {
  const { role, obraId } = input

  // Memoize permission calculations
  const permissionValues = useMemo(() => {
    if (!role) {
      return {
        permissions: null,
        hasCrossObraVisibility: false,
        canViewAllObras: false,
        canManageUsers: false,
        canApproveOTs: false,
        isAdminOrDO: false,
        hasCrossObraAccess: false,
      }
    }

    return {
      permissions: getPermissions(role),
      hasCrossObraVisibility: checkCrossObraVisibility(role),
      canViewAllObras: checkCanViewAllObras(role),
      canManageUsers: checkCanManageUsers(role),
      canApproveOTs: checkCanApproveOTs(role),
      isAdminOrDO: checkIsAdminOrDO(role),
      hasCrossObraAccess: checkHasCrossObraAccess(role),
    }
  }, [role])

  /**
   * Check if user can access a specific obra
   * Returns true if:
   * - User has cross-obra visibility (admin, DO, compras)
   * - User is assigned to that obra (JO)
   */
  const canAccessObra = useCallback(
    (targetObraId: string): boolean => {
      if (!role) return false
      if (permissionValues.hasCrossObraAccess) return true
      return obraId === targetObraId
    },
    [role, obraId, permissionValues.hasCrossObraAccess]
  )

  return {
    // User info
    role,
    obraId,

    // Permission checks
    ...permissionValues,

    // Helper functions
    canAccessObra,
  }
}
