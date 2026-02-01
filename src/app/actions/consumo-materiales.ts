'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateOTCostoReal } from './costos'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

interface RegisterConsumoInput {
  orden_trabajo_id: string
  obra_id: string
  insumo_id: string
  cantidad_consumida: number
  cantidad_estimada?: number
  notas?: string
}

interface ConsumoConInsumo {
  id: string
  insumo_id: string
  cantidad_consumida: number
  cantidad_estimada: number | null
  notas: string | null
  registrado_en: string | null
  insumo: {
    id: string
    nombre: string
    unidad: string
    precio_referencia: number | null
  }
  diferencia: number
  porcentaje_diferencia: number | null
}

/**
 * Register material consumption for an OT
 */
export async function registerConsumo(input: RegisterConsumoInput): Promise<ActionResult<{ id: string }>> {
  if (input.cantidad_consumida <= 0) {
    return { success: false, error: 'La cantidad consumida debe ser mayor a cero' }
  }

  const supabase = await createClient()

  // Check user authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('usuarios')
    .select('id, rol, obra_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return { success: false, error: 'Usuario no encontrado' }
  }

  // Check permissions
  if (!['admin', 'director_obra', 'jefe_obra'].includes(profile.rol)) {
    return { success: false, error: 'No tiene permisos para registrar consumo' }
  }

  // Check if there's already a consumption record for this insumo in this OT
  const { data: existing } = await supabase
    .from('consumo_materiales')
    .select('id')
    .eq('orden_trabajo_id', input.orden_trabajo_id)
    .eq('insumo_id', input.insumo_id)
    .single()

  if (existing) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('consumo_materiales')
      .update({
        cantidad_consumida: input.cantidad_consumida,
        notas: input.notas || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Update consumo error:', updateError)
      return { success: false, error: 'Error al actualizar el consumo' }
    }

    // Recalculate OT costo_real
    await updateOTCostoReal(input.orden_trabajo_id)

    revalidatePath(`/obras/${input.obra_id}/ordenes-trabajo/${input.orden_trabajo_id}`)
    return { success: true, data: { id: existing.id } }
  }

  // Create new consumption record
  const { data, error } = await supabase
    .from('consumo_materiales')
    .insert({
      orden_trabajo_id: input.orden_trabajo_id,
      insumo_id: input.insumo_id,
      cantidad_consumida: input.cantidad_consumida,
      cantidad_estimada: input.cantidad_estimada || null,
      notas: input.notas || null,
      registrado_por: profile.id,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Insert consumo error:', error)
    return { success: false, error: 'Error al registrar el consumo' }
  }

  // Recalculate OT costo_real
  await updateOTCostoReal(input.orden_trabajo_id)

  revalidatePath(`/obras/${input.obra_id}/ordenes-trabajo/${input.orden_trabajo_id}`)
  return { success: true, data: { id: data.id } }
}

/**
 * Get consumption records for an OT with comparison to estimates
 */
export async function getConsumosByOT(otId: string): Promise<ActionResult<ConsumoConInsumo[]>> {
  const supabase = await createClient()

  const { data: consumos, error } = await supabase
    .from('consumo_materiales')
    .select(`
      id,
      insumo_id,
      cantidad_consumida,
      cantidad_estimada,
      notas,
      registrado_en,
      insumos (
        id,
        nombre,
        unidad,
        precio_referencia
      )
    `)
    .eq('orden_trabajo_id', otId)
    .order('registrado_en', { ascending: false })

  if (error) {
    console.error('Error fetching consumos:', error)
    return { success: false, error: 'Error al cargar los consumos' }
  }

  // Calculate differences
  const consumosConDiferencia = consumos.map((c) => {
    const diferencia = c.cantidad_estimada
      ? c.cantidad_consumida - c.cantidad_estimada
      : 0
    const porcentaje = c.cantidad_estimada && c.cantidad_estimada > 0
      ? (diferencia / c.cantidad_estimada) * 100
      : null

    return {
      id: c.id,
      insumo_id: c.insumo_id,
      cantidad_consumida: c.cantidad_consumida,
      cantidad_estimada: c.cantidad_estimada,
      notas: c.notas,
      registrado_en: c.registrado_en,
      insumo: c.insumos as {
        id: string
        nombre: string
        unidad: string
        precio_referencia: number | null
      },
      diferencia,
      porcentaje_diferencia: porcentaje,
    }
  })

  return { success: true, data: consumosConDiferencia }
}

/**
 * Delete a consumption record
 */
export async function deleteConsumo(
  consumoId: string,
  obraId: string,
  otId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Check user authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const { error } = await supabase
    .from('consumo_materiales')
    .delete()
    .eq('id', consumoId)

  if (error) {
    console.error('Delete consumo error:', error)
    return { success: false, error: 'Error al eliminar el consumo' }
  }

  // Recalculate OT costo_real
  await updateOTCostoReal(otId)

  revalidatePath(`/obras/${obraId}/ordenes-trabajo/${otId}`)
  return { success: true, data: undefined }
}

/**
 * Get estimated insumos for an OT to compare with actual consumption
 */
export async function getInsumosEstimadosParaConsumo(otId: string): Promise<ActionResult<Array<{
  insumo_id: string
  nombre: string
  unidad: string
  cantidad_estimada: number
  precio_referencia: number | null
  ya_registrado: boolean
  cantidad_consumida: number | null
}>>> {
  const supabase = await createClient()

  // Get estimated insumos
  const { data: estimados, error: estError } = await supabase
    .from('ot_insumos_estimados')
    .select(`
      insumo_id,
      cantidad_estimada,
      insumos (
        id,
        nombre,
        unidad,
        precio_referencia
      )
    `)
    .eq('orden_trabajo_id', otId)

  if (estError) {
    console.error('Error fetching estimated insumos:', estError)
    return { success: false, error: 'Error al cargar los insumos estimados' }
  }

  // Get already registered consumptions
  const { data: consumos } = await supabase
    .from('consumo_materiales')
    .select('insumo_id, cantidad_consumida')
    .eq('orden_trabajo_id', otId)

  const consumoMap = new Map(
    consumos?.map((c) => [c.insumo_id, c.cantidad_consumida]) || []
  )

  const result = estimados.map((e) => {
    const insumo = e.insumos as {
      id: string
      nombre: string
      unidad: string
      precio_referencia: number | null
    }

    return {
      insumo_id: e.insumo_id,
      nombre: insumo.nombre,
      unidad: insumo.unidad,
      cantidad_estimada: e.cantidad_estimada,
      precio_referencia: insumo.precio_referencia,
      ya_registrado: consumoMap.has(e.insumo_id),
      cantidad_consumida: consumoMap.get(e.insumo_id) || null,
    }
  })

  return { success: true, data: result }
}
