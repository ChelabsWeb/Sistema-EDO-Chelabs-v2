'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createErrorResult, ErrorCodes } from '@/lib/errors'
import type { OrdenCompra, OrdenCompraWithRelations, OCStatus } from '@/types/database'

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string }

// ==============================================
// Zod Schemas
// ==============================================

const LineaOCItemSchema = z.object({
  insumo_id: z.string().uuid('ID de insumo inválido'),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  precio_unitario: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  orden_trabajo_id: z.string().uuid().optional(),
})

const CreateOrdenCompraSchema = z.object({
  obra_id: z.string().uuid('ID de obra inválido'),
  proveedor: z.string().min(1, 'El proveedor es requerido'),
  rut_proveedor: z.string().optional(),
  condiciones_pago: z.string().optional(),
  fecha_entrega_esperada: z.string().optional(),
  requisicion_ids: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos una requisición'),
  lineas: z.array(LineaOCItemSchema).min(1, 'Debe agregar al menos un item'),
})

export type CreateOrdenCompraInput = z.infer<typeof CreateOrdenCompraSchema>

// ==============================================
// Get Ordenes de Compra with Filters
// ==============================================

export interface OCFilters {
  obra_id?: string
  estado?: string
  fecha_desde?: string
  fecha_hasta?: string
}

export async function getOrdenesCompra(
  filters?: OCFilters
): Promise<ActionResult<OrdenCompraWithRelations[]>> {
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

  // Only admin, director_obra, or compras can see OCs
  if (!['admin', 'director_obra', 'compras'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'No tiene permisos para ver órdenes de compra')
  }

  let query = supabase
    .from('ordenes_compra')
    .select(`
      *,
      obra:obras(id, nombre),
      creador:usuarios!ordenes_compra_created_by_fkey(id, nombre),
      lineas:lineas_oc!lineas_oc_orden_compra_id_fkey(
        *,
        insumo:insumos(id, nombre, unidad, tipo)
      )
    `)

  // Apply filters
  if (filters?.obra_id) {
    query = query.eq('obra_id', filters.obra_id)
  }

  if (filters?.estado) {
    query = query.eq('estado', filters.estado as OCStatus)
  }

  if (filters?.fecha_desde) {
    query = query.gte('fecha_emision', filters.fecha_desde)
  }

  if (filters?.fecha_hasta) {
    query = query.lte('fecha_emision', filters.fecha_hasta)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ordenes de compra:', error)
    return { success: false, error: 'Error al cargar las órdenes de compra' }
  }

  return { success: true, data: data as unknown as OrdenCompraWithRelations[] }
}

// ==============================================
// Get Single Orden de Compra
// ==============================================

export async function getOrdenCompra(id: string): Promise<ActionResult<OrdenCompraWithRelations>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ordenes_compra')
    .select(`
      *,
      obra:obras(id, nombre),
      creador:usuarios!ordenes_compra_created_by_fkey(id, nombre),
      lineas:lineas_oc!lineas_oc_orden_compra_id_fkey(
        *,
        insumo:insumos(id, nombre, unidad, tipo),
        orden_trabajo:ordenes_trabajo(id, numero, descripcion)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching orden de compra:', error)
    return { success: false, error: 'Orden de compra no encontrada' }
  }

  // Get linked requisiciones
  const { data: ocReqs } = await supabase
    .from('oc_requisiciones')
    .select(`
      requisicion:requisiciones(
        *,
        ot:ordenes_trabajo(id, numero, descripcion, obra_id),
        creador:usuarios!requisiciones_created_by_fkey(id, nombre),
        items:requisicion_items(
          *,
          insumo:insumos(id, nombre, unidad, tipo)
        )
      )
    `)
    .eq('orden_compra_id', id)

  const requisiciones = ocReqs?.map(r => r.requisicion).filter(Boolean) || []

  return {
    success: true,
    data: {
      ...data,
      requisiciones,
    } as unknown as OrdenCompraWithRelations
  }
}

// ==============================================
// Create Orden de Compra
// ==============================================

export async function createOrdenCompra(input: CreateOrdenCompraInput): Promise<ActionResult<OrdenCompra>> {
  const supabase = await createClient()

  // Validate input
  const validation = CreateOrdenCompraSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const { obra_id, proveedor, rut_proveedor, condiciones_pago, fecha_entrega_esperada, requisicion_ids, lineas } = validation.data

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

  // Only compras and admin can create OCs
  if (!['admin', 'compras'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'Solo Compras puede crear órdenes de compra')
  }

  // Verify all requisiciones exist and are pending
  const { data: requisiciones, error: reqError } = await supabase
    .from('requisiciones')
    .select('id, estado, ot_id')
    .in('id', requisicion_ids)

  if (reqError || !requisiciones || requisiciones.length !== requisicion_ids.length) {
    return createErrorResult(ErrorCodes.RES_NOT_FOUND, 'Algunas requisiciones no fueron encontradas')
  }

  // Check all requisiciones are pending
  const nonPendingReqs = requisiciones.filter(r => r.estado !== 'pendiente')
  if (nonPendingReqs.length > 0) {
    return createErrorResult(
      ErrorCodes.BIZ_OPERATION_NOT_ALLOWED,
      'Solo se pueden incluir requisiciones pendientes en una OC'
    )
  }

  // Calculate total
  const total = lineas.reduce((sum, linea) => sum + (linea.cantidad * linea.precio_unitario), 0)

  // Create orden de compra
  const { data: oc, error: ocError } = await supabase
    .from('ordenes_compra')
    .insert({
      obra_id,
      proveedor,
      rut_proveedor: rut_proveedor || null,
      condiciones_pago: condiciones_pago || null,
      fecha_entrega_esperada: fecha_entrega_esperada || null,
      total,
      created_by: profile.id,
      estado: 'pendiente',
    })
    .select()
    .single()

  if (ocError) {
    console.error('Error creating orden de compra:', ocError)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al crear la orden de compra')
  }

  // Create lineas_oc
  const lineasToInsert = lineas.map(linea => ({
    orden_compra_id: oc.id,
    insumo_id: linea.insumo_id,
    cantidad_solicitada: linea.cantidad,
    precio_unitario: linea.precio_unitario,
    orden_trabajo_id: linea.orden_trabajo_id || null,
  }))

  const { error: lineasError } = await supabase
    .from('lineas_oc')
    .insert(lineasToInsert)

  if (lineasError) {
    console.error('Error creating lineas_oc:', lineasError)
    // Rollback: delete the OC
    await supabase.from('ordenes_compra').delete().eq('id', oc.id)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al crear los items de la orden')
  }

  // Link requisiciones to OC
  const ocReqsToInsert = requisicion_ids.map(req_id => ({
    orden_compra_id: oc.id,
    requisicion_id: req_id,
  }))

  const { error: ocReqError } = await supabase
    .from('oc_requisiciones')
    .insert(ocReqsToInsert)

  if (ocReqError) {
    console.error('Error linking requisiciones:', ocReqError)
    // Rollback
    await supabase.from('lineas_oc').delete().eq('orden_compra_id', oc.id)
    await supabase.from('ordenes_compra').delete().eq('id', oc.id)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al vincular las requisiciones')
  }

  // Update requisiciones estado to 'en_proceso'
  const { error: updateError } = await supabase
    .from('requisiciones')
    .update({ estado: 'en_proceso' })
    .in('id', requisicion_ids)

  if (updateError) {
    console.error('Error updating requisiciones estado:', updateError)
    // Don't rollback here, the OC was created successfully
    // Just log the error
  }

  revalidatePath('/compras/requisiciones')
  revalidatePath('/compras/ordenes-compra')

  return {
    success: true,
    data: oc as OrdenCompra,
    message: `Orden de compra OC-${oc.numero} creada correctamente`
  }
}

// ==============================================
// Update OC Estado
// ==============================================

export async function updateOCEstado(
  id: string,
  estado: 'enviada' | 'cancelada'
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

  // Verify OC exists
  const { data: oc, error: ocError } = await supabase
    .from('ordenes_compra')
    .select('id, estado')
    .eq('id', id)
    .single()

  if (ocError || !oc) {
    return createErrorResult(ErrorCodes.RES_NOT_FOUND, 'Orden de compra no encontrada')
  }

  // Validate state transition
  const validTransitions: Record<string, string[]> = {
    'pendiente': ['enviada', 'cancelada'],
    'enviada': ['recibida_parcial', 'recibida_completa', 'cancelada'],
  }

  if (!validTransitions[oc.estado || 'pendiente']?.includes(estado)) {
    return createErrorResult(
      ErrorCodes.BIZ_INVALID_STATE_TRANSITION,
      `No se puede cambiar de "${oc.estado}" a "${estado}"`
    )
  }

  // Update estado
  const { error } = await supabase
    .from('ordenes_compra')
    .update({ estado })
    .eq('id', id)

  if (error) {
    console.error('Error updating OC estado:', error)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, 'Error al actualizar el estado')
  }

  revalidatePath('/compras/ordenes-compra')

  return { success: true, data: undefined, message: `Orden de compra marcada como ${estado}` }
}

// ==============================================
// Get Grouped Items from Selected Requisiciones
// ==============================================

export interface GroupedItem {
  insumo_id: string
  insumo_nombre: string
  insumo_unidad: string
  insumo_tipo: string
  cantidad_total: number
  precio_referencia: number | null
  requisicion_ids: string[]
  ot_ids: string[]
}

export async function getGroupedItemsFromRequisiciones(
  requisicionIds: string[]
): Promise<ActionResult<{ items: GroupedItem[]; obra_id: string }>> {
  const supabase = await createClient()

  if (requisicionIds.length === 0) {
    return { success: false, error: 'Debe seleccionar al menos una requisición' }
  }

  // Get requisiciones with items
  const { data: requisiciones, error } = await supabase
    .from('requisiciones')
    .select(`
      id,
      ot_id,
      estado,
      ot:ordenes_trabajo(id, obra_id),
      items:requisicion_items(
        id,
        insumo_id,
        cantidad,
        insumo:insumos(id, nombre, unidad, tipo, precio_referencia)
      )
    `)
    .in('id', requisicionIds)
    .eq('estado', 'pendiente')

  if (error) {
    console.error('Error fetching requisiciones:', error)
    return { success: false, error: 'Error al cargar las requisiciones' }
  }

  if (!requisiciones || requisiciones.length === 0) {
    return { success: false, error: 'No se encontraron requisiciones pendientes' }
  }

  // Get obra_id from first requisicion
  const firstReq = requisiciones[0]
  const ot = firstReq.ot as { id: string; obra_id: string } | null
  if (!ot) {
    return { success: false, error: 'No se pudo determinar la obra' }
  }
  const obra_id = ot.obra_id

  // Group items by insumo_id
  const grouped: Record<string, GroupedItem> = {}

  for (const req of requisiciones) {
    const items = req.items as Array<{
      id: string
      insumo_id: string
      cantidad: number
      insumo: { id: string; nombre: string; unidad: string; tipo: string; precio_referencia: number | null } | null
    }> | null

    if (!items) continue

    for (const item of items) {
      if (!item.insumo) continue

      const key = item.insumo_id
      if (!grouped[key]) {
        grouped[key] = {
          insumo_id: item.insumo_id,
          insumo_nombre: item.insumo.nombre,
          insumo_unidad: item.insumo.unidad,
          insumo_tipo: item.insumo.tipo,
          cantidad_total: 0,
          precio_referencia: item.insumo.precio_referencia,
          requisicion_ids: [],
          ot_ids: [],
        }
      }

      grouped[key].cantidad_total += item.cantidad
      if (!grouped[key].requisicion_ids.includes(req.id)) {
        grouped[key].requisicion_ids.push(req.id)
      }
      if (req.ot_id && !grouped[key].ot_ids.includes(req.ot_id)) {
        grouped[key].ot_ids.push(req.ot_id)
      }
    }
  }

  return {
    success: true,
    data: {
      items: Object.values(grouped),
      obra_id,
    }
  }
}
