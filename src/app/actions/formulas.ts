'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createFormulaSchema, updateFormulaSchema, type CreateFormulaInput, type UpdateFormulaInput } from '@/lib/validations/formulas'
import type { Formula, Insumo, Rubro } from '@/types/database'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export type FormulaWithInsumo = Formula & {
  insumos: Pick<Insumo, 'id' | 'nombre' | 'unidad' | 'precio_referencia'>
}

/**
 * Create a new formula (link insumo to rubro)
 * Only DO and admin can create formulas
 */
export async function createFormula(input: CreateFormulaInput): Promise<ActionResult<Formula>> {
  const supabase = await createClient()

  // Validate input
  const validation = createFormulaSchema.safeParse(input)
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
    return { success: false, error: 'No tiene permisos para crear fórmulas' }
  }

  // Check if formula already exists
  const { data: existing } = await supabase
    .from('formulas')
    .select('id')
    .eq('rubro_id', validation.data.rubro_id)
    .eq('insumo_id', validation.data.insumo_id)
    .single()

  if (existing) {
    return { success: false, error: 'Este insumo ya está agregado a la fórmula' }
  }

  // Create the formula
  const { data, error } = await supabase
    .from('formulas')
    .insert({
      rubro_id: validation.data.rubro_id,
      insumo_id: validation.data.insumo_id,
      cantidad_por_unidad: validation.data.cantidad_por_unidad,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating formula:', error)
    return { success: false, error: 'Error al crear la fórmula' }
  }

  // Get rubro to revalidate the correct path
  const { data: rubro } = await supabase
    .from('rubros')
    .select('obra_id')
    .eq('id', validation.data.rubro_id)
    .single()

  if (rubro) {
    revalidatePath(`/obras/${rubro.obra_id}`)
  }

  return { success: true, data: data as Formula }
}

/**
 * Update a formula
 */
export async function updateFormula(input: UpdateFormulaInput): Promise<ActionResult<Formula>> {
  const supabase = await createClient()

  // Validate input
  const validation = updateFormulaSchema.safeParse(input)
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
    return { success: false, error: 'No tiene permisos para editar fórmulas' }
  }

  const { id, cantidad_por_unidad } = validation.data

  // Update the formula
  const { data, error } = await supabase
    .from('formulas')
    .update({ cantidad_por_unidad })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating formula:', error)
    return { success: false, error: 'Error al actualizar la fórmula' }
  }

  return { success: true, data: data as Formula }
}

/**
 * Delete a formula
 */
export async function deleteFormula(id: string): Promise<ActionResult> {
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
    return { success: false, error: 'No tiene permisos para eliminar fórmulas' }
  }

  const { error } = await supabase
    .from('formulas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting formula:', error)
    return { success: false, error: 'Error al eliminar la fórmula' }
  }

  return { success: true, data: undefined }
}

/**
 * Get all formulas for a rubro with insumo details
 */
export async function getFormulasByRubro(rubroId: string): Promise<ActionResult<FormulaWithInsumo[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('formulas')
    .select(`
      *,
      insumos (
        id,
        nombre,
        unidad,
        precio_referencia
      )
    `)
    .eq('rubro_id', rubroId)
    .order('created_at')

  if (error) {
    return { success: false, error: 'Error al cargar las fórmulas' }
  }

  return { success: true, data: data as FormulaWithInsumo[] }
}

/**
 * Calculate estimated insumos for a given rubro and quantity
 */
export async function calculateInsumosByFormula(
  rubroId: string,
  cantidad: number
): Promise<ActionResult<Array<{
  insumo_id: string
  nombre: string
  unidad: string
  cantidad_necesaria: number
  costo_estimado: number
}>>> {
  const supabase = await createClient()

  const { data: formulas, error } = await supabase
    .from('formulas')
    .select(`
      cantidad_por_unidad,
      insumos (
        id,
        nombre,
        unidad,
        precio_referencia
      )
    `)
    .eq('rubro_id', rubroId)

  if (error) {
    return { success: false, error: 'Error al calcular insumos' }
  }

  const result = (formulas || []).map((f) => {
    const insumo = f.insumos as unknown as { id: string; nombre: string; unidad: string; precio_referencia: number | null }
    const cantidadNecesaria = f.cantidad_por_unidad * cantidad
    const costoEstimado = cantidadNecesaria * (insumo.precio_referencia || 0)

    return {
      insumo_id: insumo.id,
      nombre: insumo.nombre,
      unidad: insumo.unidad,
      cantidad_necesaria: cantidadNecesaria,
      costo_estimado: costoEstimado,
    }
  })

  return { success: true, data: result }
}
