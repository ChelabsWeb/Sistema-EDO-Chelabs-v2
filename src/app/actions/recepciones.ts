'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createErrorResult, ErrorCodes } from '@/lib/errors'
import type { OCStatus } from '@/types/database'
import { updateOTCostoReal } from './costos'

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string; error?: never; code?: never }
  | { success: false; error: string; code?: string; data?: never; message?: never }

// ==============================================
// Types
// ==============================================

export interface OCForReception {
  id: string
  numero: number
  proveedor: string | null
  estado: OCStatus
  lineas: Array<{
    id: string
    insumo_id: string
    cantidad_solicitada: number
    cantidad_recibida: number | null
    precio_unitario: number
    insumo: {
      id: string
      nombre: string
      unidad: string
    }
  }>
}

export interface RecepcionItem {
  linea_oc_id: string
  cantidad_a_recibir: number
}

// ==============================================
// Zod Schemas
// ==============================================

const RecepcionItemSchema = z.object({
  linea_oc_id: z.string().uuid('ID de línea inválido'),
  cantidad_a_recibir: z.number().min(0, 'La cantidad no puede ser negativa'),
})

const RegisterRecepcionSchema = z.object({
  orden_compra_id: z.string().uuid('ID de OC inválido'),
  items: z.array(RecepcionItemSchema).min(1, 'Debe especificar al menos un item'),
  notas: z.string().optional(),
})

export type RegisterRecepcionInput = z.infer<typeof RegisterRecepcionSchema>

// ==============================================
// Get OC for Reception
// ==============================================

export async function getOCForReception(id: string): Promise<ActionResult<OCForReception>> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return createErrorResult(ErrorCodes.AUTH_NOT_AUTHENTICATED)
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('usuarios')
    .select('id, rol')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return createErrorResult(ErrorCodes.AUTH_NOT_AUTHENTICATED)
  }

  // Only jefe_obra, compras, or admin can register reception
  if (!['admin', 'jefe_obra', 'compras'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'No tiene permisos para registrar recepciones')
  }

  // Get OC with lineas
  const { data, error } = await supabase
    .from('ordenes_compra')
    .select(`
      id,
      numero,
      proveedor,
      estado,
      lineas:lineas_oc!lineas_oc_orden_compra_id_fkey(
        id,
        insumo_id,
        cantidad_solicitada,
        cantidad_recibida,
        precio_unitario,
        insumo:insumos(id, nombre, unidad)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching OC for reception:', error)
    return createErrorResult(ErrorCodes.RES_NOT_FOUND, 'Orden de compra no encontrada')
  }

  // Verify OC is in valid state for reception
  const estado = data.estado || 'pendiente'
  if (!['enviada', 'recibida_parcial'].includes(estado)) {
    return createErrorResult(
      ErrorCodes.BIZ_OPERATION_NOT_ALLOWED,
      `No se puede registrar recepción para una OC con estado "${estado}"`
    )
  }

  return {
    success: true,
    data: data as unknown as OCForReception
  }
}

// ==============================================
// Register Reception
// ==============================================

export async function registerRecepcion(input: RegisterRecepcionInput): Promise<ActionResult> {
  const supabase = await createClient()

  // Validate input
  const validation = RegisterRecepcionSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const { orden_compra_id, items, notas } = validation.data

  // Filter out items with 0 quantity
  const itemsToProcess = items.filter(item => item.cantidad_a_recibir > 0)
  if (itemsToProcess.length === 0) {
    return { success: false, error: 'Debe especificar al menos un item con cantidad mayor a 0' }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return createErrorResult(ErrorCodes.AUTH_NOT_AUTHENTICATED)
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('usuarios')
    .select('id, rol')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return createErrorResult(ErrorCodes.AUTH_NOT_AUTHENTICATED)
  }

  // Only jefe_obra, compras, or admin can register reception
  if (!['admin', 'jefe_obra', 'compras'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'No tiene permisos para registrar recepciones')
  }

  // Get OC with lineas
  const { data: oc, error: ocError } = await supabase
    .from('ordenes_compra')
    .select(`
      id,
      estado,
      lineas:lineas_oc!lineas_oc_orden_compra_id_fkey(
        id,
        cantidad_solicitada,
        cantidad_recibida
      )
    `)
    .eq('id', orden_compra_id)
    .single()

  if (ocError || !oc) {
    return createErrorResult(ErrorCodes.RES_NOT_FOUND, 'Orden de compra no encontrada')
  }

  // Verify OC is in valid state for reception
  const ocEstado = oc.estado || 'pendiente'
  if (!['enviada', 'recibida_parcial'].includes(ocEstado)) {
    return createErrorResult(
      ErrorCodes.BIZ_OPERATION_NOT_ALLOWED,
      `No se puede registrar recepción para una OC con estado "${ocEstado}"`
    )
  }

  // Create map of current lineas
  const lineas = (oc as unknown as { lineas: Array<{ id: string; cantidad_solicitada: number; cantidad_recibida: number | null }> }).lineas
  const lineasMap = new Map<string, { cantidad_solicitada: number; cantidad_recibida: number }>()
  for (const linea of lineas) {
    lineasMap.set(linea.id, {
      cantidad_solicitada: linea.cantidad_solicitada,
      cantidad_recibida: linea.cantidad_recibida || 0
    })
  }

  // Validate items
  for (const item of itemsToProcess) {
    const linea = lineasMap.get(item.linea_oc_id)
    if (!linea) {
      return { success: false, error: `Línea de OC no encontrada: ${item.linea_oc_id}` }
    }
  }

  // Create recepcion record
  const { error: recepcionError } = await supabase
    .from('recepciones')
    .insert({
      orden_compra_id,
      notas: notas || null,
      created_by: profile.id,
    })

  if (recepcionError) {
    console.error('Error creating recepcion:', recepcionError)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al crear el registro de recepción')
  }

  // Update each linea_oc.cantidad_recibida
  for (const item of itemsToProcess) {
    const linea = lineasMap.get(item.linea_oc_id)!
    const newCantidadRecibida = linea.cantidad_recibida + item.cantidad_a_recibir

    const { error: updateError } = await supabase
      .from('lineas_oc')
      .update({ cantidad_recibida: newCantidadRecibida })
      .eq('id', item.linea_oc_id)

    if (updateError) {
      console.error('Error updating linea_oc:', updateError)
      return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al actualizar cantidades recibidas')
    }

    // Update map for final calculation
    lineasMap.set(item.linea_oc_id, {
      ...linea,
      cantidad_recibida: newCantidadRecibida
    })
  }

  // Calculate new OC estado
  let allComplete = true
  let anyReceived = false

  for (const [, linea] of lineasMap) {
    const receivedSoFar = linea.cantidad_recibida
    if (receivedSoFar > 0) {
      anyReceived = true
    }
    if (receivedSoFar < linea.cantidad_solicitada) {
      allComplete = false
    }
  }

  const newEstado: OCStatus = allComplete ? 'recibida_completa' : (anyReceived ? 'recibida_parcial' : oc.estado as OCStatus)

  // Update OC estado and fecha_recepcion
  const updateData: { estado: OCStatus; fecha_recepcion?: string } = { estado: newEstado }
  if (newEstado === 'recibida_completa') {
    updateData.fecha_recepcion = new Date().toISOString().split('T')[0]
  }

  const { error: ocUpdateError } = await supabase
    .from('ordenes_compra')
    .update(updateData)
    .eq('id', orden_compra_id)

  if (ocUpdateError) {
    console.error('Error updating OC estado:', ocUpdateError)
    // Don't fail the whole operation, the reception was recorded
  }

  // Recalculate costo_real for all affected OTs
  // Get distinct OT IDs from lineas_oc for this OC
  const { data: affectedLineas } = await supabase
    .from('lineas_oc')
    .select('orden_trabajo_id')
    .eq('orden_compra_id', orden_compra_id)
    .not('orden_trabajo_id', 'is', null)

  if (affectedLineas && affectedLineas.length > 0) {
    const affectedOTIds = [...new Set(affectedLineas.map(l => l.orden_trabajo_id).filter(Boolean))]
    for (const otId of affectedOTIds) {
      if (otId) {
        await updateOTCostoReal(otId)
      }
    }
  }

  revalidatePath('/compras/ordenes-compra')

  const estadoMessage = newEstado === 'recibida_completa'
    ? 'Recepción completa registrada'
    : 'Recepción parcial registrada'

  return { success: true, data: undefined, message: estadoMessage }
}
