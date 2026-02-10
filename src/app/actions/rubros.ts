'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createRubroSchema, updateRubroSchema, type CreateRubroInput, type UpdateRubroInput } from '@/lib/validations/rubros'
import type { Rubro } from '@/types/database'
import { DEFAULT_COTIZACION_UR } from '@/lib/constants/app'

export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Create a new rubro for an obra
 * Only DO and admin can create rubros
 */
export async function createRubro(input: CreateRubroInput): Promise<ActionResult<Rubro>> {
  const supabase = await createClient()

  // Validate input
  const validation = createRubroSchema.safeParse(input)
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
    return { success: false, error: 'No tiene permisos para crear rubros' }
  }

  // Get cotizacion to calculate presupuesto in pesos
  const { data: config } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', 'cotizacion_ur')
    .single()

  const cotizacion = config ? parseFloat(config.valor) : DEFAULT_COTIZACION_UR
  const presupuestoPesos = validation.data.presupuesto_ur * cotizacion

  // Create the rubro
  const { data, error } = await supabase
    .from('rubros')
    .insert({
      obra_id: validation.data.obra_id,
      nombre: validation.data.nombre,
      unidad: validation.data.unidad,
      presupuesto_ur: validation.data.presupuesto_ur,
      presupuesto: presupuestoPesos,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating rubro:', error)
    return { success: false, error: 'Error al crear el rubro' }
  }

  revalidatePath(`/obras/${validation.data.obra_id}`)

  return { success: true, data: data as Rubro }
}

/**
 * Update an existing rubro
 */
export async function updateRubro(input: UpdateRubroInput): Promise<ActionResult<Rubro>> {
  const supabase = await createClient()

  // Validate input
  const validation = updateRubroSchema.safeParse(input)
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
    return { success: false, error: 'No tiene permisos para editar rubros' }
  }

  const { id, ...updateData } = validation.data

  // If updating presupuesto_ur, recalculate presupuesto in pesos
  if (updateData.presupuesto_ur !== undefined) {
    const { data: config } = await supabase
      .from('configuracion')
      .select('valor')
      .eq('clave', 'cotizacion_ur')
      .single()

    const cotizacion = config ? parseFloat(config.valor) : DEFAULT_COTIZACION_UR
      ; (updateData as Record<string, unknown>).presupuesto = updateData.presupuesto_ur * cotizacion
  }

  // Update the rubro
  const { data, error } = await supabase
    .from('rubros')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating rubro:', error)
    return { success: false, error: 'Error al actualizar el rubro' }
  }

  // Get obra_id for revalidation
  const rubro = data as Rubro
  revalidatePath(`/obras/${rubro.obra_id}`)

  return { success: true, data: rubro }
}

/**
 * Soft-delete a rubro (move to trash)
 */
export async function deleteRubro(id: string): Promise<ActionResult> {
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
    return { success: false, error: 'No tiene permisos para eliminar rubros' }
  }

  // Get obra_id before deletion
  const { data: rubro } = await supabase
    .from('rubros')
    .select('obra_id')
    .eq('id', id)
    .single()

  if (!rubro) {
    return { success: false, error: 'Rubro no encontrado' }
  }

  // Check if rubro has non-deleted OTs
  const { count } = await supabase
    .from('ordenes_trabajo')
    .select('*', { count: 'exact', head: true })
    .eq('rubro_id', id)
    .is('deleted_at', null)

  if (count && count > 0) {
    return { success: false, error: 'No se puede eliminar un rubro que tiene ordenes de trabajo' }
  }

  // Soft-delete the rubro
  const { error } = await supabase
    .from('rubros')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting rubro:', error)
    return { success: false, error: 'Error al eliminar el rubro' }
  }

  revalidatePath(`/obras/${rubro.obra_id}`)

  return { success: true, data: undefined }
}

/**
 * Get all rubros for an obra (excludes deleted)
 */
export async function getRubrosByObra(obraId: string): Promise<ActionResult<Rubro[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rubros')
    .select('*')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('nombre')

  if (error) {
    return { success: false, error: 'Error al cargar los rubros' }
  }

  return { success: true, data: data as Rubro[] }
}

/**
 * Get a single rubro by ID (excludes deleted)
 */
export async function getRubro(id: string): Promise<ActionResult<Rubro>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rubros')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    return { success: false, error: 'Rubro no encontrado' }
  }

  return { success: true, data: data as Rubro }
}
