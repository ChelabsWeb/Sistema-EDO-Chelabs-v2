'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Usuario } from '@/types/database'

export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

export type UsuarioWithObra = Usuario & {
  obras?: { id: string; nombre: string } | null
}

/**
 * Get all users assigned to a specific obra
 */
export async function getUsuariosByObra(obraId: string): Promise<ActionResult<Usuario[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('obra_id', obraId)
    .order('nombre')

  if (error) {
    console.error('Error fetching usuarios:', error)
    return { success: false, error: 'Error al cargar usuarios' }
  }

  return { success: true, data: data as Usuario[] }
}

/**
 * Get all users that can be assigned to an obra (not currently assigned)
 */
export async function getUnassignedUsuarios(): Promise<ActionResult<Usuario[]>> {
  const supabase = await createClient()

  // Check user role - only admin can view all users
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.rol !== 'admin') {
    return { success: false, error: 'Solo administradores pueden ver usuarios sin asignar' }
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .is('obra_id', null)
    .order('nombre')

  if (error) {
    console.error('Error fetching unassigned usuarios:', error)
    return { success: false, error: 'Error al cargar usuarios' }
  }

  return { success: true, data: data as Usuario[] }
}

/**
 * Assign a user to an obra
 * Only admin can assign users
 */
export async function assignUsuarioToObra(
  usuarioId: string,
  obraId: string
): Promise<ActionResult<Usuario>> {
  const supabase = await createClient()

  // Check user role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.rol !== 'admin') {
    return { success: false, error: 'Solo administradores pueden asignar usuarios' }
  }

  // Update the user's obra_id
  const { data, error } = await supabase
    .from('usuarios')
    .update({ obra_id: obraId })
    .eq('id', usuarioId)
    .select()
    .single()

  if (error) {
    console.error('Error assigning usuario:', error)
    return { success: false, error: 'Error al asignar usuario' }
  }

  revalidatePath(`/obras/${obraId}`)
  revalidatePath(`/obras/${obraId}/usuarios`)

  return { success: true, data: data as Usuario }
}

/**
 * Remove a user from an obra (unassign)
 * Only admin can unassign users
 */
export async function unassignUsuarioFromObra(usuarioId: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Check user role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.rol !== 'admin') {
    return { success: false, error: 'Solo administradores pueden desasignar usuarios' }
  }

  // Get current obra_id for revalidation
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('obra_id')
    .eq('id', usuarioId)
    .single()

  const obraId = usuario?.obra_id

  // Update the user's obra_id to null
  const { error } = await supabase
    .from('usuarios')
    .update({ obra_id: null })
    .eq('id', usuarioId)

  if (error) {
    console.error('Error unassigning usuario:', error)
    return { success: false, error: 'Error al desasignar usuario' }
  }

  if (obraId) {
    revalidatePath(`/obras/${obraId}`)
    revalidatePath(`/obras/${obraId}/usuarios`)
  }

  return { success: true, data: undefined }
}

/**
 * Get all users for admin management
 */
export async function getAllUsuarios(): Promise<ActionResult<UsuarioWithObra[]>> {
  const supabase = await createClient()

  // Check user role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.rol !== 'admin') {
    return { success: false, error: 'Solo administradores pueden ver todos los usuarios' }
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      obras (
        id,
        nombre
      )
    `)
    .order('nombre')

  if (error) {
    console.error('Error fetching all usuarios:', error)
    return { success: false, error: 'Error al cargar usuarios' }
  }

  return { success: true, data: data as UsuarioWithObra[] }
}
