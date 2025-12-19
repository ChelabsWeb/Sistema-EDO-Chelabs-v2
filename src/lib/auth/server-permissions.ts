/**
 * Server-side role-based permissions and data filtering utilities
 * Story 1.6: Automatic Role-Based Data Filtering
 *
 * Use these utilities in Server Actions and Server Components
 */

import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'
import {
  getPermissions,
  hasCrossObraAccess,
  isAdminOrDO,
  CROSS_OBRA_ROLES,
  ADMIN_ROLES,
} from './permissions'

export interface CurrentUser {
  id: string
  authUserId: string
  email: string
  nombre: string
  rol: UserRole
  obraId: string | null
  activo: boolean
}

/**
 * Get the current authenticated user with their profile
 * Returns null if not authenticated or profile not found
 */
export async function getCurrentUserWithProfile(): Promise<CurrentUser | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = (await supabase
    .from('usuarios')
    .select('id, auth_user_id, email, nombre, rol, obra_id, activo')
    .eq('auth_user_id', user.id)
    .single()) as {
    data: {
      id: string
      auth_user_id: string
      email: string
      nombre: string
      rol: UserRole
      obra_id: string | null
      activo: boolean
    } | null
  }

  if (!profile || !profile.activo) return null

  return {
    id: profile.id,
    authUserId: profile.auth_user_id,
    email: profile.email,
    nombre: profile.nombre,
    rol: profile.rol,
    obraId: profile.obra_id,
    activo: profile.activo,
  }
}

/**
 * Check if current user has one of the required roles
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<{ user: CurrentUser } | { error: string }> {
  const user = await getCurrentUserWithProfile()

  if (!user) {
    return { error: 'No autenticado' }
  }

  if (!allowedRoles.includes(user.rol)) {
    return { error: 'No autorizado' }
  }

  return { user }
}

/**
 * Check if current user is admin or director_obra
 */
export async function requireAdminOrDO(): Promise<
  { user: CurrentUser } | { error: string }
> {
  return requireRole(ADMIN_ROLES)
}

/**
 * Check if current user has cross-obra access
 */
export async function requireCrossObraAccess(): Promise<
  { user: CurrentUser } | { error: string }
> {
  return requireRole(CROSS_OBRA_ROLES)
}

/**
 * Get obra filter for queries based on user's role
 *
 * - Admin/DO/Compras: Returns null (no filter, see all)
 * - JO: Returns their assigned obra_id
 *
 * Use this to filter queries by obra when needed
 */
export async function getObraFilter(): Promise<{
  obraId: string | null
  filterByObra: boolean
}> {
  const user = await getCurrentUserWithProfile()

  if (!user) {
    // Not authenticated - should filter but no obra available
    return { obraId: null, filterByObra: true }
  }

  // Users with cross-obra access don't need filtering
  if (hasCrossObraAccess(user.rol)) {
    return { obraId: null, filterByObra: false }
  }

  // JO and others - filter by their assigned obra
  return { obraId: user.obraId, filterByObra: true }
}

/**
 * Helper to build a query with automatic obra filtering
 * Returns the obra_id to filter by, or null if no filter needed
 */
export async function getObraIdForQuery(): Promise<string | null> {
  const { obraId, filterByObra } = await getObraFilter()
  return filterByObra ? obraId : null
}

/**
 * Check if current user can access a specific obra
 */
export async function canUserAccessObra(
  targetObraId: string
): Promise<boolean> {
  const user = await getCurrentUserWithProfile()

  if (!user) return false

  // Cross-obra roles can access any obra
  if (hasCrossObraAccess(user.rol)) return true

  // Others can only access their assigned obra
  return user.obraId === targetObraId
}

/**
 * Get user permissions object
 */
export async function getUserPermissions() {
  const user = await getCurrentUserWithProfile()

  if (!user) return null

  return {
    user,
    permissions: getPermissions(user.rol),
    hasCrossObraAccess: hasCrossObraAccess(user.rol),
    isAdminOrDO: isAdminOrDO(user.rol),
  }
}
