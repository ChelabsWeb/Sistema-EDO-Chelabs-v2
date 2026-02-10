'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createInsumoSchema, updateInsumoSchema, type CreateInsumoInput, type UpdateInsumoInput } from '@/lib/validations/insumos'
import type { Insumo, InsumoTipo } from '@/types/database'
import {
  type InsumoPredefinido,
  getInsumosPredefinidosPorRubro,
  getInsumosPredefinidosAgrupados,
  getRubrosConInsumosPredefinidos,
} from '@/lib/constants/insumos-predefinidos'

export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Create a new insumo for an obra
 * Only DO and admin can create insumos
 */
export async function createInsumo(input: CreateInsumoInput): Promise<ActionResult<Insumo>> {
  const supabase = await createClient()

  // Validate input
  const validation = createInsumoSchema.safeParse(input)
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
    return { success: false, error: 'No tiene permisos para crear insumos' }
  }

  // Create the insumo
  const { data, error } = await supabase
    .from('insumos')
    .insert({
      obra_id: validation.data.obra_id,
      nombre: validation.data.nombre,
      unidad: validation.data.unidad,
      tipo: validation.data.tipo,
      precio_referencia: validation.data.precio_referencia || null,
      precio_unitario: validation.data.precio_referencia || null, // Keep backwards compat
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating insumo:', error)
    return { success: false, error: 'Error al crear el insumo' }
  }

  revalidatePath(`/obras/${validation.data.obra_id}/insumos`)

  return { success: true, data: data as Insumo }
}

/**
 * Update an existing insumo
 */
export async function updateInsumo(input: UpdateInsumoInput): Promise<ActionResult<Insumo>> {
  const supabase = await createClient()

  // Validate input
  const validation = updateInsumoSchema.safeParse(input)
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
    return { success: false, error: 'No tiene permisos para editar insumos' }
  }

  const { id, ...updateData } = validation.data

  // If updating precio_referencia, also update precio_unitario for backwards compat
  if (updateData.precio_referencia !== undefined) {
    (updateData as Record<string, unknown>).precio_unitario = updateData.precio_referencia
  }

  // Update the insumo
  const { data, error } = await supabase
    .from('insumos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating insumo:', error)
    return { success: false, error: 'Error al actualizar el insumo' }
  }

  const insumo = data as Insumo
  revalidatePath(`/obras/${insumo.obra_id}/insumos`)

  return { success: true, data: insumo }
}

/**
 * Soft-delete an insumo (move to trash)
 */
export async function deleteInsumo(id: string): Promise<ActionResult> {
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
    return { success: false, error: 'No tiene permisos para eliminar insumos' }
  }

  // Get obra_id before deletion
  const { data: insumo } = await supabase
    .from('insumos')
    .select('obra_id')
    .eq('id', id)
    .single()

  if (!insumo) {
    return { success: false, error: 'Insumo no encontrado' }
  }

  // Check if insumo is used in rubro formulas
  const { count: formulaCount } = await supabase
    .from('formulas')
    .select('*', { count: 'exact', head: true })
    .eq('insumo_id', id)

  if (formulaCount && formulaCount > 0) {
    return { success: false, error: 'No se puede eliminar un insumo que se usa en formulas de rubros' }
  }

  // Check if insumo is used in OT estimates (only non-deleted OTs)
  const { data: otEstimates } = await supabase
    .from('ot_insumos_estimados')
    .select('orden_trabajo_id')
    .eq('insumo_id', id)

  if (otEstimates && otEstimates.length > 0) {
    // Check if any of those OTs are not deleted
    const otIds = otEstimates.map(e => e.orden_trabajo_id)
    const { count: activeOtCount } = await supabase
      .from('ordenes_trabajo')
      .select('*', { count: 'exact', head: true })
      .in('id', otIds)
      .is('deleted_at', null)

    if (activeOtCount && activeOtCount > 0) {
      return { success: false, error: 'No se puede eliminar un insumo que se usa en ordenes de trabajo activas' }
    }
  }

  // Soft-delete the insumo
  const { error } = await supabase
    .from('insumos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting insumo:', error)
    return { success: false, error: 'Error al eliminar el insumo' }
  }

  revalidatePath(`/obras/${insumo.obra_id}/insumos`)

  return { success: true, data: undefined }
}

/**
 * Get all insumos for an obra
 */
export async function getInsumosByObra(obraId: string): Promise<ActionResult<Insumo[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('insumos')
    .select('*')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('nombre')

  if (error) {
    return { success: false, error: 'Error al cargar los insumos' }
  }

  return { success: true, data: data as Insumo[] }
}

/**
 * Get a single insumo by ID
 */
export async function getInsumo(id: string): Promise<ActionResult<Insumo>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('insumos')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    return { success: false, error: 'Insumo no encontrado' }
  }

  return { success: true, data: data as Insumo }
}

// ============================================
// INSUMOS PREDEFINIDOS
// ============================================

export type InsumosPredefinidosResult = {
  materiales: InsumoPredefinido[]
  mano_de_obra: InsumoPredefinido[]
}

export type AddInsumosPredefinidosResult = {
  creados: string[]
  omitidos: string[]
  errores: string[]
}

/**
 * Get list of rubros that have predefined insumos
 */
export async function getRubrosDisponibles(): Promise<ActionResult<string[]>> {
  return { success: true, data: getRubrosConInsumosPredefinidos() }
}

/**
 * Get predefined insumos for a specific rubro, grouped by type
 */
export async function getInsumosPredefinidos(
  rubroNombre: string
): Promise<ActionResult<InsumosPredefinidosResult>> {
  const agrupados = getInsumosPredefinidosAgrupados(rubroNombre)
  return { success: true, data: agrupados }
}

/**
 * Get predefined insumos with duplicate check against existing obra insumos
 */
export async function getInsumosPredefinidosConDuplicados(
  rubroNombre: string,
  obraId: string
): Promise<ActionResult<{
  insumos: InsumosPredefinidosResult
  duplicados: string[]
}>> {
  const supabase = await createClient()

  // Get existing insumos names for the obra
  const { data: existingInsumos, error } = await supabase
    .from('insumos')
    .select('nombre')
    .eq('obra_id', obraId)
    .is('deleted_at', null)

  if (error) {
    return { success: false, error: 'Error al verificar insumos existentes' }
  }

  const existingNames = new Set(
    existingInsumos?.map(i => i.nombre.toLowerCase()) || []
  )

  const agrupados = getInsumosPredefinidosAgrupados(rubroNombre)

  // Find duplicates
  const allPredefinidos = [...agrupados.materiales, ...agrupados.mano_de_obra]
  const duplicados = allPredefinidos
    .filter(i => existingNames.has(i.nombre.toLowerCase()))
    .map(i => i.nombre)

  return {
    success: true,
    data: {
      insumos: agrupados,
      duplicados,
    },
  }
}

/**
 * Add selected predefined insumos to an obra
 * Skips duplicates by default, returns info about what was created/skipped
 */
export async function addInsumosPredefinidosToObra(
  obraId: string,
  insumos: InsumoPredefinido[],
  skipDuplicates: boolean = true
): Promise<ActionResult<AddInsumosPredefinidosResult>> {
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
    return { success: false, error: 'No tiene permisos para crear insumos' }
  }

  // Get existing insumos names for duplicate checking
  const { data: existingInsumos, error: fetchError } = await supabase
    .from('insumos')
    .select('nombre')
    .eq('obra_id', obraId)
    .is('deleted_at', null)

  if (fetchError) {
    return { success: false, error: 'Error al verificar insumos existentes' }
  }

  const existingNames = new Set(
    existingInsumos?.map(i => i.nombre.toLowerCase()) || []
  )

  const result: AddInsumosPredefinidosResult = {
    creados: [],
    omitidos: [],
    errores: [],
  }

  // Process each insumo
  for (const insumo of insumos) {
    const isDuplicate = existingNames.has(insumo.nombre.toLowerCase())

    if (isDuplicate && skipDuplicates) {
      result.omitidos.push(insumo.nombre)
      continue
    }

    // Create the insumo
    const { error: insertError } = await supabase
      .from('insumos')
      .insert({
        obra_id: obraId,
        nombre: insumo.nombre,
        unidad: insumo.unidad,
        tipo: insumo.tipo as InsumoTipo,
        precio_referencia: insumo.precio_referencia || null,
        precio_unitario: insumo.precio_referencia || null,
      })

    if (insertError) {
      console.error('Error creating predefined insumo:', insertError)
      result.errores.push(insumo.nombre)
    } else {
      result.creados.push(insumo.nombre)
      // Add to existing names to prevent duplicates within same batch
      existingNames.add(insumo.nombre.toLowerCase())
    }
  }

  revalidatePath(`/obras/${obraId}/insumos`)

  return { success: true, data: result }
}

/**
 * Add all predefined insumos for a rubro to an obra
 */
export async function addAllInsumosPredefinidosByRubro(
  obraId: string,
  rubroNombre: string,
  skipDuplicates: boolean = true
): Promise<ActionResult<AddInsumosPredefinidosResult>> {
  const insumos = getInsumosPredefinidosPorRubro(rubroNombre)

  if (insumos.length === 0) {
    return { success: false, error: `No hay insumos predefinidos para el rubro "${rubroNombre}"` }
  }

  return addInsumosPredefinidosToObra(obraId, insumos, skipDuplicates)
}
