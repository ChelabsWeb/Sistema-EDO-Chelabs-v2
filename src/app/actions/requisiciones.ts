'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createErrorResult, ErrorCodes } from '@/lib/errors'
import type { Requisicion, RequisicionWithRelations } from '@/types/database'

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string }

// ==============================================
// Zod Schemas
// ==============================================

const RequisicionItemSchema = z.object({
  insumo_id: z.string().uuid('ID de insumo inválido'),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  notas: z.string().optional(),
})

const CreateRequisicionSchema = z.object({
  ot_id: z.string().uuid('ID de OT inválido'),
  items: z.array(RequisicionItemSchema).min(1, 'Debe agregar al menos un insumo'),
  notas: z.string().optional(),
})

export type CreateRequisicionInput = z.infer<typeof CreateRequisicionSchema>

// ==============================================
// Get Requisiciones by OT
// ==============================================

export async function getRequisicionesByOT(otId: string): Promise<ActionResult<RequisicionWithRelations[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('requisiciones')
    .select(`
      *,
      creador:usuarios!requisiciones_created_by_fkey(id, nombre),
      items:requisicion_items(
        *,
        insumo:insumos(id, nombre, unidad, tipo)
      )
    `)
    .eq('ot_id', otId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching requisiciones:', error)
    return { success: false, error: 'Error al cargar las requisiciones' }
  }

  return { success: true, data: data as RequisicionWithRelations[] }
}

// ==============================================
// Get Single Requisicion
// ==============================================

export async function getRequisicion(id: string): Promise<ActionResult<RequisicionWithRelations>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('requisiciones')
    .select(`
      *,
      ot:ordenes_trabajo(id, numero, descripcion, obra_id),
      creador:usuarios!requisiciones_created_by_fkey(id, nombre),
      items:requisicion_items(
        *,
        insumo:insumos(id, nombre, unidad, tipo)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching requisicion:', error)
    return { success: false, error: 'Requisición no encontrada' }
  }

  return { success: true, data: data as RequisicionWithRelations }
}

// ==============================================
// Create Requisicion
// ==============================================

export async function createRequisicion(input: CreateRequisicionInput): Promise<ActionResult<Requisicion>> {
  const supabase = await createClient()

  // Validate input
  const validation = CreateRequisicionSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const { ot_id, items, notas } = validation.data

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

  // Only JO and admin can create requisiciones
  if (!['admin', 'jefe_obra'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'Solo Jefe de Obra puede crear requisiciones')
  }

  // Verify OT exists and is in execution
  const { data: ot, error: otError } = await supabase
    .from('ordenes_trabajo')
    .select('id, estado, obra_id')
    .eq('id', ot_id)
    .is('deleted_at', null)
    .single()

  if (otError || !ot) {
    return createErrorResult(ErrorCodes.RES_NOT_FOUND, 'OT no encontrada')
  }

  if (ot.estado !== 'en_ejecucion') {
    return createErrorResult(
      ErrorCodes.BIZ_OPERATION_NOT_ALLOWED,
      'Solo se pueden crear requisiciones para OTs en ejecución'
    )
  }

  // Create requisicion
  const { data: requisicion, error: reqError } = await supabase
    .from('requisiciones')
    .insert({
      ot_id,
      notas: notas || null,
      created_by: profile.id,
    })
    .select()
    .single()

  if (reqError) {
    console.error('Error creating requisicion:', reqError)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al crear la requisición')
  }

  // Create items
  const itemsToInsert = items.map(item => ({
    requisicion_id: requisicion.id,
    insumo_id: item.insumo_id,
    cantidad: item.cantidad,
    notas: item.notas || null,
  }))

  const { error: itemsError } = await supabase
    .from('requisicion_items')
    .insert(itemsToInsert)

  if (itemsError) {
    console.error('Error creating requisicion items:', itemsError)
    // Rollback: delete the requisicion
    await supabase.from('requisiciones').delete().eq('id', requisicion.id)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al crear los items de la requisición')
  }

  revalidatePath(`/obras/${ot.obra_id}/ordenes-trabajo/${ot_id}`)

  return {
    success: true,
    data: requisicion as Requisicion,
    message: 'Requisición creada correctamente'
  }
}

// ==============================================
// Cancel Requisicion
// ==============================================

export async function cancelRequisicion(id: string): Promise<ActionResult> {
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

  // Verify requisicion exists and is pending
  const { data: req, error: reqError } = await supabase
    .from('requisiciones')
    .select('id, estado, ot_id, created_by')
    .eq('id', id)
    .single()

  if (reqError || !req) {
    return createErrorResult(ErrorCodes.RES_NOT_FOUND, 'Requisición no encontrada')
  }

  // Only creator, admin, or compras can cancel
  const canCancel =
    req.created_by === profile.id ||
    ['admin', 'compras'].includes(profile.rol)

  if (!canCancel) {
    return createErrorResult(ErrorCodes.AUTHZ_INSUFFICIENT_PERMISSIONS, 'No tiene permisos para cancelar esta requisición')
  }

  if (req.estado !== 'pendiente') {
    return createErrorResult(
      ErrorCodes.BIZ_INVALID_STATE_TRANSITION,
      'Solo se pueden cancelar requisiciones pendientes'
    )
  }

  // Update estado to cancelada
  const { error } = await supabase
    .from('requisiciones')
    .update({ estado: 'cancelada' })
    .eq('id', id)

  if (error) {
    console.error('Error canceling requisicion:', error)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al cancelar la requisición')
  }

  // Get OT for revalidation path
  const { data: ot } = await supabase
    .from('ordenes_trabajo')
    .select('obra_id')
    .eq('id', req.ot_id)
    .single()

  if (ot) {
    revalidatePath(`/obras/${ot.obra_id}/ordenes-trabajo/${req.ot_id}`)
  }

  return { success: true, data: undefined, message: 'Requisición cancelada' }
}

// ==============================================
// Update Requisicion Estado (for Compras)
// ==============================================

export async function updateRequisicionEstado(
  id: string,
  estado: 'en_proceso' | 'completada'
): Promise<ActionResult> {
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

  // Only admin or compras can update estado
  if (!['admin', 'compras'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'Solo Compras puede actualizar el estado')
  }

  // Verify requisicion exists
  const { data: req, error: reqError } = await supabase
    .from('requisiciones')
    .select('id, estado, ot_id')
    .eq('id', id)
    .single()

  if (reqError || !req) {
    return createErrorResult(ErrorCodes.RES_NOT_FOUND, 'Requisición no encontrada')
  }

  // Validate state transition
  const validTransitions: Record<string, string[]> = {
    'pendiente': ['en_proceso', 'cancelada'],
    'en_proceso': ['completada', 'cancelada'],
  }

  if (!validTransitions[req.estado]?.includes(estado)) {
    return createErrorResult(
      ErrorCodes.BIZ_INVALID_STATE_TRANSITION,
      `No se puede cambiar de "${req.estado}" a "${estado}"`
    )
  }

  // Update estado
  const { error } = await supabase
    .from('requisiciones')
    .update({ estado })
    .eq('id', id)

  if (error) {
    console.error('Error updating requisicion estado:', error)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al actualizar el estado')
  }

  // Get OT for revalidation path
  const { data: ot } = await supabase
    .from('ordenes_trabajo')
    .select('obra_id')
    .eq('id', req.ot_id)
    .single()

  if (ot) {
    revalidatePath(`/obras/${ot.obra_id}/ordenes-trabajo/${req.ot_id}`)
  }

  return { success: true, data: undefined, message: `Requisición marcada como ${estado}` }
}

// ==============================================
// Get All Requisiciones with Filters (for Compras)
// ==============================================

export interface RequisicionFilters {
  obra_id?: string
  estado?: string
  fecha_desde?: string
  fecha_hasta?: string
}

export interface RequisicionWithObraInfo {
  id: string
  ot_id: string
  estado: string | null
  notas: string | null
  created_by: string
  created_at: string | null
  ot: {
    id: string
    numero: number
    descripcion: string | null
    obra_id: string
    obra: { id: string; nombre: string } | null
  } | null
  creador: { id: string; nombre: string } | null
  items: Array<{
    id: string
    requisicion_id: string
    insumo_id: string
    cantidad: number
    notas: string | null
    insumo: {
      id: string
      nombre: string
      unidad: string
      tipo: string
    } | null
  }> | null
}

export async function getAllRequisiciones(
  filters?: RequisicionFilters
): Promise<ActionResult<RequisicionWithObraInfo[]>> {
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

  // Only admin or compras can see all requisiciones
  if (!['admin', 'compras'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'No tiene permisos para ver todas las requisiciones')
  }

  let query = supabase
    .from('requisiciones')
    .select(`
      *,
      ot:ordenes_trabajo!inner(
        id,
        numero,
        descripcion,
        obra_id,
        obra:obras!inner(id, nombre)
      ),
      creador:usuarios!requisiciones_created_by_fkey(id, nombre),
      items:requisicion_items(
        *,
        insumo:insumos(id, nombre, unidad, tipo)
      )
    `)

  // Apply filters
  if (filters?.obra_id) {
    query = query.eq('ot.obra_id', filters.obra_id)
  }

  if (filters?.estado) {
    query = query.eq('estado', filters.estado as 'pendiente' | 'en_proceso' | 'completada' | 'cancelada')
  }

  if (filters?.fecha_desde) {
    query = query.gte('created_at', filters.fecha_desde)
  }

  if (filters?.fecha_hasta) {
    // Add one day to include the end date
    const endDate = new Date(filters.fecha_hasta)
    endDate.setDate(endDate.getDate() + 1)
    query = query.lt('created_at', endDate.toISOString())
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all requisiciones:', error)
    return { success: false, error: 'Error al cargar las requisiciones' }
  }

  return { success: true, data: data as RequisicionWithObraInfo[] }
}

// ==============================================
// Get All Obras (for filter dropdown)
// ==============================================

export async function getObrasForFilter(): Promise<ActionResult<{ id: string; nombre: string }[]>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return createErrorResult(ErrorCodes.AUTH_NOT_AUTHENTICATED)
  }

  const { data, error } = await supabase
    .from('obras')
    .select('id, nombre')
    .is('deleted_at', null)
    .order('nombre')

  if (error) {
    console.error('Error fetching obras:', error)
    return { success: false, error: 'Error al cargar las obras' }
  }

  return { success: true, data: data || [] }
}

// ==============================================
// Get All Pending Requisiciones (for Compras)
// ==============================================

export async function getAllPendingRequisiciones(): Promise<ActionResult<RequisicionWithRelations[]>> {
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

  // Only admin or compras can see all requisiciones
  if (!['admin', 'compras'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'No tiene permisos para ver todas las requisiciones')
  }

  const { data, error } = await supabase
    .from('requisiciones')
    .select(`
      *,
      ot:ordenes_trabajo(id, numero, descripcion, obra_id, obra:obras(nombre)),
      creador:usuarios!requisiciones_created_by_fkey(id, nombre),
      items:requisicion_items(
        *,
        insumo:insumos(id, nombre, unidad, tipo)
      )
    `)
    .in('estado', ['pendiente', 'en_proceso'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all requisiciones:', error)
    return { success: false, error: 'Error al cargar las requisiciones' }
  }

  return { success: true, data: data as RequisicionWithRelations[] }
}
