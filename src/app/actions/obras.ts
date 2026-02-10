'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createObraSchema, updateObraSchema, type CreateObraInput, type UpdateObraInput } from '@/lib/validations/obras'
import type { Obra, ObraEstado } from '@/types/database'
import { RUBROS_PREDEFINIDOS } from '@/lib/constants/rubros-predefinidos'
import { type PaginationParams, type PaginatedResponse, normalizePagination, createPaginatedResponse } from '@/lib/utils/pagination'

// Result type for consistent error handling
export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Create a new obra
 * Only DO and admin can create obras
 */
export async function createObra(input: CreateObraInput): Promise<ActionResult<Obra>> {
  const supabase = await createClient()

  // Validate input
  const validation = createObraSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos inválidos',
    }
  }

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

  if (!profile || !['admin', 'director_obra'].includes(profile.rol)) {
    return { success: false, error: 'No tiene permisos para crear obras' }
  }

  // Create the obra
  const { data, error } = await supabase
    .from('obras')
    .insert({
      nombre: validation.data.nombre,
      direccion: validation.data.direccion || null,
      cooperativa: validation.data.cooperativa || null,
      presupuesto_total: validation.data.presupuesto_total || null,
      fecha_inicio: validation.data.fecha_inicio || null,
      fecha_fin_estimada: validation.data.fecha_fin_estimada || null,
      estado: 'activa' as ObraEstado,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating obra:', error)
    return { success: false, error: 'Error al crear la obra' }
  }

  const obra = data as Obra

  // Create predefined rubros for the new obra
  const rubrosPredefinidos = RUBROS_PREDEFINIDOS.map((rubro) => ({
    obra_id: obra.id,
    nombre: rubro.nombre,
    unidad: rubro.unidad,
    presupuesto_ur: 0,
    presupuesto: 0,
    es_predefinido: true,
  }))

  const { error: rubrosError } = await supabase
    .from('rubros')
    .insert(rubrosPredefinidos)

  if (rubrosError) {
    console.error('Error creating predefined rubros:', rubrosError)
    // Don't fail the whole operation, just log the error
  }

  revalidatePath('/obras')
  revalidatePath('/dashboard')

  return { success: true, data: obra }
}

/**
 * Update an existing obra
 * Only DO and admin can update obras
 */
export async function updateObra(input: UpdateObraInput): Promise<ActionResult<Obra>> {
  const supabase = await createClient()

  // Validate input
  const validation = updateObraSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos inválidos',
    }
  }

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

  if (!profile || !['admin', 'director_obra'].includes(profile.rol)) {
    return { success: false, error: 'No tiene permisos para editar obras' }
  }

  const { id, ...updateData } = validation.data

  // Update the obra
  const { data, error } = await supabase
    .from('obras')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating obra:', error)
    return { success: false, error: 'Error al actualizar la obra' }
  }

  revalidatePath('/obras')
  revalidatePath(`/obras/${id}`)
  revalidatePath('/dashboard')

  return { success: true, data: data as Obra }
}

/**
 * Archive an obra (set estado to 'finalizada')
 * Only DO and admin can archive obras
 */
export async function archiveObra(id: string): Promise<ActionResult> {
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

  if (!profile || !['admin', 'director_obra'].includes(profile.rol)) {
    return { success: false, error: 'No tiene permisos para archivar obras' }
  }

  const { error } = await supabase
    .from('obras')
    .update({ estado: 'finalizada' as ObraEstado })
    .eq('id', id)

  if (error) {
    console.error('Error archiving obra:', error)
    return { success: false, error: 'Error al archivar la obra' }
  }

  revalidatePath('/obras')
  revalidatePath(`/obras/${id}`)
  revalidatePath('/dashboard')

  return { success: true, data: undefined }
}

/**
 * Get a single obra by ID (excludes deleted)
 */
export async function getObra(id: string): Promise<ActionResult<Obra>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('obras')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    return { success: false, error: 'Obra no encontrada' }
  }

  return { success: true, data: data as Obra }
}

/**
 * Get all obras (respects RLS, excludes deleted)
 */
export async function getObras(): Promise<ActionResult<Obra[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('obras')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: 'Error al cargar las obras' }
  }

  return { success: true, data: data as Obra[] }
}

/**
 * Get obras with pagination (respects RLS, excludes deleted)
 */
export async function getObrasPaginated(
  params: PaginationParams = {}
): Promise<ActionResult<PaginatedResponse<Obra>>> {
  const supabase = await createClient()
  const { page, pageSize, from, to } = normalizePagination(params)

  // Get total count
  const { count, error: countError } = await supabase
    .from('obras')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  if (countError) {
    return { success: false, error: 'Error al contar las obras' }
  }

  // Get paginated data
  const { data, error } = await supabase
    .from('obras')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return { success: false, error: 'Error al cargar las obras' }
  }

  return {
    success: true,
    data: createPaginatedResponse(data as Obra[], count || 0, page, pageSize),
  }
}

/**
 * Soft-delete an obra (move to trash)
 * Only admin can delete obras
 * Will fail if there are OTs that are not in draft state
 */
export async function deleteObra(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Check user role - only admin can delete
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
    return { success: false, error: 'Solo administradores pueden eliminar obras' }
  }

  // Check for non-draft OTs that are not deleted
  const { data: activeOTs } = await supabase
    .from('ordenes_trabajo')
    .select('id, estado')
    .eq('obra_id', id)
    .is('deleted_at', null)
    .neq('estado', 'borrador')

  if (activeOTs && activeOTs.length > 0) {
    return {
      success: false,
      error: `No se puede eliminar: hay ${activeOTs.length} OT(s) en proceso. Primero elimine o cancele las OTs.`
    }
  }

  const timestamp = new Date().toISOString()

  // Soft-delete the obra and cascade to children
  // 1. Soft-delete all OTs
  await supabase
    .from('ordenes_trabajo')
    .update({ deleted_at: timestamp })
    .eq('obra_id', id)
    .is('deleted_at', null)

  // 2. Soft-delete all rubros
  await supabase
    .from('rubros')
    .update({ deleted_at: timestamp })
    .eq('obra_id', id)
    .is('deleted_at', null)

  // 3. Soft-delete all insumos
  await supabase
    .from('insumos')
    .update({ deleted_at: timestamp })
    .eq('obra_id', id)
    .is('deleted_at', null)

  // 4. Soft-delete the obra
  const { error } = await supabase
    .from('obras')
    .update({ deleted_at: timestamp })
    .eq('id', id)

  if (error) {
    console.error('Error deleting obra:', error)
    return { success: false, error: 'Error al eliminar la obra' }
  }

  revalidatePath('/obras')
  revalidatePath('/dashboard')

  return { success: true, data: undefined }
}

/**
 * Change obra status
 */
export async function changeObraStatus(
  id: string,
  estado: ObraEstado
): Promise<ActionResult<Obra>> {
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

  if (!profile || !['admin', 'director_obra'].includes(profile.rol)) {
    return { success: false, error: 'No tiene permisos para cambiar el estado' }
  }

  const { data, error } = await supabase
    .from('obras')
    .update({ estado })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error changing obra status:', error)
    return { success: false, error: 'Error al cambiar el estado de la obra' }
  }

  revalidatePath('/obras')
  revalidatePath(`/obras/${id}`)
  revalidatePath('/dashboard')

  return { success: true, data: data as Obra }
}
