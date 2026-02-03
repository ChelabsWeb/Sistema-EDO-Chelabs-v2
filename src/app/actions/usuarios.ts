'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Usuario, UserRole } from '@/types/database'

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get all users (requires admin or director_obra role)
 */
export async function getUsuarios(): Promise<ActionResult<Usuario[]>> {
  const supabase = await createClient()

  // Verify current user has permission
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Check role
  const { data: currentProfile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    return { success: false, error: 'No autorizado' }
  }

  // Get all users
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: 'Error al obtener usuarios' }
  }

  return { success: true, data: usuarios as Usuario[] }
}

/**
 * Get a single user by ID
 */
export async function getUsuario(id: string): Promise<ActionResult<Usuario>> {
  const supabase = await createClient()

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { success: false, error: 'Usuario no encontrado' }
  }

  return { success: true, data: usuario as Usuario }
}

/**
 * Create a new user (requires admin or director_obra role)
 * Uses Supabase Auth to create the user, which triggers the handle_new_user function
 */
export async function createUsuario(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  // Verify current user has permission
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Check role
  const { data: currentProfile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    return { success: false, error: 'No autorizado para crear usuarios' }
  }

  // Extract form data
  const email = formData.get('email') as string
  const nombre = formData.get('nombre') as string
  const rol = formData.get('rol') as UserRole
  const obraId = formData.get('obra_id') as string | null

  // Validate
  if (!email || !nombre || !rol) {
    return { success: false, error: 'Email, nombre y rol son requeridos' }
  }

  if (!['admin', 'director_obra', 'jefe_obra', 'compras'].includes(rol)) {
    return { success: false, error: 'Rol inválido' }
  }

  // Check if email already exists
  const { data: existingUser } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return { success: false, error: 'Ya existe un usuario con este email' }
  }

  // Create user using Supabase Auth Admin API with service role
  const adminClient = createAdminClient()
  const tempPassword = generateTempPassword()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      nombre,
      rol,
    },
  })

  if (authError) {
    console.error('Error creating user:', authError)

    // Check for specific errors
    if (authError.message.includes('already registered')) {
      return { success: false, error: 'Este email ya está registrado' }
    }

    return {
      success: false,
      error: 'Error al crear usuario. Verificá que el email sea válido.'
    }
  }

  if (!authData.user) {
    return { success: false, error: 'Error al crear usuario' }
  }

  // Update the usuarios table with obra_id if provided
  if (obraId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient.from('usuarios') as any)
      .update({ obra_id: obraId })
      .eq('auth_user_id', authData.user.id)
  }

  // Send password reset email so user can set their own password
  await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    },
  })

  revalidatePath('/admin/usuarios')
  return { success: true, data: { id: authData.user?.id || 'created' } }
}

/**
 * Update user profile (requires admin or director_obra role)
 */
export async function updateUsuario(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify current user has permission
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Check role
  const { data: currentProfile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    return { success: false, error: 'No autorizado' }
  }

  // Extract form data
  const nombre = formData.get('nombre') as string
  const rol = formData.get('rol') as UserRole
  const obraId = formData.get('obra_id') as string | null
  const activo = formData.get('activo') === 'true'

  // Update user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('usuarios') as any)
    .update({
      nombre,
      rol,
      obra_id: obraId || null,
      activo,
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: 'Error al actualizar usuario' }
  }

  revalidatePath('/admin/usuarios')
  return { success: true }
}

/**
 * Deactivate a user (soft delete)
 */
export async function deactivateUsuario(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify current user has permission
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Check role
  const { data: currentProfile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    return { success: false, error: 'No autorizado' }
  }

  // Deactivate user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('usuarios') as any)
    .update({ activo: false })
    .eq('id', id)

  if (error) {
    return { success: false, error: 'Error al desactivar usuario' }
  }

  revalidatePath('/admin/usuarios')
  return { success: true }
}

/**
 * Update current user profile
 */
export async function updateUsuarioProfile(data: { nombre: string }): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Update profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('usuarios') as any)
    .update({
      nombre: data.nombre,
      updated_at: new Date().toISOString(),
    })
    .eq('auth_user_id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Error al actualizar el perfil' }
  }

  revalidatePath('/perfil')
  return { success: true }
}

/**
 * Generate a temporary password
 */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
