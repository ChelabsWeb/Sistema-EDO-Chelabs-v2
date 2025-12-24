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
})

const CreateOrdenCompraSchema = z.object({
  obra_id: z.string().uuid('ID de obra inválido'),
  ot_id: z.string().uuid('ID de orden de trabajo inválido').optional(),
  proveedor: z.string().min(1, 'El proveedor es requerido'),
  rut_proveedor: z.string().optional(),
  condiciones_pago: z.string().optional(),
  fecha_entrega_esperada: z.string().optional(),
  lineas: z.array(LineaOCItemSchema).min(1, 'Debe agregar al menos un item'),
})

export type CreateOrdenCompraInput = z.infer<typeof CreateOrdenCompraSchema>

// ==============================================
// Get Ordenes de Compra with Filters
// ==============================================

export interface OCFilters {
  obra_id?: string
  ot_id?: string
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

  // Only admin, director_obra, jefe_obra, or compras can see OCs
  if (!['admin', 'director_obra', 'jefe_obra', 'compras'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'No tiene permisos para ver órdenes de compra')
  }

  let query = supabase
    .from('ordenes_compra')
    .select(`
      *,
      obra:obras(id, nombre),
      ot:ordenes_trabajo(id, numero, descripcion),
      creador:usuarios!ordenes_compra_created_by_fkey(id, nombre),
      lineas:lineas_oc(
        *,
        insumo:insumos(id, nombre, unidad, tipo)
      )
    `)

  // Apply filters
  if (filters?.obra_id) {
    query = query.eq('obra_id', filters.obra_id)
  }

  if (filters?.ot_id) {
    query = query.eq('ot_id', filters.ot_id)
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
// Get Ordenes de Compra by OT
// ==============================================

export async function getOrdenesCompraByOT(
  otId: string
): Promise<ActionResult<OrdenCompraWithRelations[]>> {
  return getOrdenesCompra({ ot_id: otId })
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
      ot:ordenes_trabajo(id, numero, descripcion),
      creador:usuarios!ordenes_compra_created_by_fkey(id, nombre),
      lineas:lineas_oc(
        *,
        insumo:insumos(id, nombre, unidad, tipo)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching orden de compra:', error)
    return { success: false, error: 'Orden de compra no encontrada' }
  }

  return {
    success: true,
    data: data as unknown as OrdenCompraWithRelations
  }
}

// ==============================================
// Create Orden de Compra (directly from OT)
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

  const { obra_id, ot_id, proveedor, rut_proveedor, condiciones_pago, fecha_entrega_esperada, lineas } = validation.data

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

  // Admin, compras, director_obra, and jefe_obra can create OCs
  if (!['admin', 'compras', 'director_obra', 'jefe_obra'].includes(profile.rol)) {
    return createErrorResult(ErrorCodes.AUTHZ_ROLE_NOT_ALLOWED, 'No tiene permisos para crear órdenes de compra')
  }

  // If ot_id provided, verify OT exists and belongs to the obra
  if (ot_id) {
    const { data: ot, error: otError } = await supabase
      .from('ordenes_trabajo')
      .select('id, obra_id, estado')
      .eq('id', ot_id)
      .is('deleted_at', null)
      .single()

    if (otError || !ot) {
      return createErrorResult(ErrorCodes.RES_NOT_FOUND, 'Orden de trabajo no encontrada')
    }

    if (ot.obra_id !== obra_id) {
      return createErrorResult(ErrorCodes.BIZ_OPERATION_NOT_ALLOWED, 'La OT no pertenece a esta obra')
    }

    // OT must be aprobada or en_ejecucion to create OC
    if (!['aprobada', 'en_ejecucion'].includes(ot.estado || '')) {
      return createErrorResult(
        ErrorCodes.BIZ_OPERATION_NOT_ALLOWED,
        'Solo se pueden crear OC para OTs aprobadas o en ejecución'
      )
    }
  }

  // Calculate total
  const total = lineas.reduce((sum, linea) => sum + (linea.cantidad * linea.precio_unitario), 0)

  // Create orden de compra
  const { data: oc, error: ocError } = await supabase
    .from('ordenes_compra')
    .insert({
      obra_id,
      ot_id: ot_id || null,
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
    orden_trabajo_id: ot_id || null,
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

  if (ot_id) {
    revalidatePath(`/obras/[id]/ordenes-trabajo/${ot_id}`)
  }
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
// Get Insumos Estimados from OT (for creating OC)
// ==============================================

export interface OTInsumoForOC {
  insumo_id: string
  insumo_nombre: string
  insumo_unidad: string
  insumo_tipo: string
  cantidad_estimada: number
  precio_estimado: number
}

export async function getOTInsumosForOC(
  otId: string
): Promise<ActionResult<{ insumos: OTInsumoForOC[]; obra_id: string }>> {
  const supabase = await createClient()

  // Get OT with insumos estimados
  const { data: ot, error } = await supabase
    .from('ordenes_trabajo')
    .select(`
      id,
      obra_id,
      estado,
      insumos_estimados:ot_insumos_estimados(
        id,
        insumo_id,
        cantidad_estimada,
        precio_estimado,
        insumo:insumos(id, nombre, unidad, tipo, precio_referencia)
      )
    `)
    .eq('id', otId)
    .is('deleted_at', null)
    .single()

  if (error || !ot) {
    console.error('Error fetching OT for OC:', error)
    return { success: false, error: 'Orden de trabajo no encontrada' }
  }

  // Map insumos estimados
  const insumos: OTInsumoForOC[] = []
  const insumosEstimados = ot.insumos_estimados as Array<{
    id: string
    insumo_id: string
    cantidad_estimada: number
    precio_estimado: number
    insumo: { id: string; nombre: string; unidad: string; tipo: string; precio_referencia: number | null } | null
  }> | null

  if (insumosEstimados) {
    for (const ie of insumosEstimados) {
      if (!ie.insumo) continue
      insumos.push({
        insumo_id: ie.insumo_id,
        insumo_nombre: ie.insumo.nombre,
        insumo_unidad: ie.insumo.unidad,
        insumo_tipo: ie.insumo.tipo,
        cantidad_estimada: ie.cantidad_estimada,
        precio_estimado: ie.precio_estimado,
      })
    }
  }

  return {
    success: true,
    data: {
      insumos,
      obra_id: ot.obra_id,
    }
  }
}
