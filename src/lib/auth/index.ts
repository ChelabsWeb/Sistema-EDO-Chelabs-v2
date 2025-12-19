/**
 * Auth utilities index
 * Re-exports all authentication and permission utilities
 */

// Client-side permission constants and utilities
export {
  ROLE_PERMISSIONS,
  ADMIN_ROLES,
  CROSS_OBRA_ROLES,
  getPermissions,
  hasCrossObraVisibility,
  canViewAllObras,
  canManageUsers,
  canApproveOTs,
  isAdminOrDO,
  hasCrossObraAccess,
  type RolePermissions,
} from './permissions'

// Server-side utilities (only import in server components/actions)
export {
  getCurrentUserWithProfile,
  requireRole,
  requireAdminOrDO,
  requireCrossObraAccess,
  getObraFilter,
  getObraIdForQuery,
  canUserAccessObra,
  getUserPermissions,
  type CurrentUser,
} from './server-permissions'
