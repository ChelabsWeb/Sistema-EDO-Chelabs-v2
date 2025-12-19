'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createOTSchema,
  updateOTSchema,
  approveOTSchema,
  closeOTSchema,
  type CreateOTInput,
  type UpdateOTInput,
  type ApproveOTInput,
  type CloseOTInput,
} from '@/lib/validations/ordenes-trabajo'
import type { OrdenTrabajo, OTStatus, OrdenTrabajoWithRelations, OTHistorial, OTInsumoEstimado } from '@/types/database'
import { type PaginationParams, type PaginatedResponse, normalizePagination, createPaginatedResponse } from '@/lib/utils/pagination'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get current user profile
 */
async function getCurrentUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return profile
}

/**
 * Calculate estimated insumos and cost from formula
 */
async function calculateEstimatedInsumos(
  rubroId: string,
  cantidad: number,
  obraId: string
): Promise<{ insumos: { insumo_id: string; cantidad_estimada: number; precio_estimado: number }[]; costo_estimado: number }> {
  const supabase = await createClient()

  // Get formula items for this rubro
  const { data: formulas } = await supabase
    .from('formulas')
    .select(`
      insumo_id,
      cantidad_por_unidad,
      insumos (
        id,
        precio_referencia,
        precio_unitario
      )
    `)
    .eq('rubro_id', rubroId)

  if (!formulas || formulas.length === 0) {
    return { insumos: [], costo_estimado: 0 }
  }

  let costo_estimado = 0
  const insumos = formulas.map((f) => {
    const insumo = f.insumos as { id: string; precio_referencia: number | null; precio_unitario: number | null } | null
    const cantidadEstimada = (f.cantidad_por_unidad || 0) * cantidad
    const precio = insumo?.precio_referencia || insumo?.precio_unitario || 0
    const precioEstimado = cantidadEstimada * precio

    costo_estimado += precioEstimado

    return {
      insumo_id: f.insumo_id,
      cantidad_estimada: cantidadEstimada,
      precio_estimado: precioEstimado,
    }
  })

  return { insumos, costo_estimado }
}

/**
 * Create a new OT in draft state
 * DO and JO can create OTs
 */
export async function createOT(input: CreateOTInput): Promise<ActionResult<OrdenTrabajo>> {
  const supabase = await createClient()

  // Validate input
  const validation = createOTSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  if (!['admin', 'director_obra', 'jefe_obra'].includes(profile.rol)) {
    return { success: false, error: 'No tiene permisos para crear órdenes de trabajo' }
  }

  // JO can only create OTs for their assigned obra
  if (profile.rol === 'jefe_obra' && profile.obra_id !== validation.data.obra_id) {
    return { success: false, error: 'Solo puede crear OTs para su obra asignada' }
  }

  // Calculate estimated insumos and cost
  const { insumos, costo_estimado } = await calculateEstimatedInsumos(
    validation.data.rubro_id,
    validation.data.cantidad,
    validation.data.obra_id
  )

  // Create the OT
  const { data: ot, error } = await supabase
    .from('ordenes_trabajo')
    .insert({
      obra_id: validation.data.obra_id,
      rubro_id: validation.data.rubro_id,
      descripcion: validation.data.descripcion,
      cantidad: validation.data.cantidad,
      costo_estimado,
      estado: 'borrador' as OTStatus,
      created_by: profile.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating OT:', error)
    return { success: false, error: 'Error al crear la orden de trabajo' }
  }

  // Insert estimated insumos
  if (insumos.length > 0) {
    const { error: insumosError } = await supabase
      .from('ot_insumos_estimados')
      .insert(
        insumos.map((i) => ({
          orden_trabajo_id: ot.id,
          insumo_id: i.insumo_id,
          cantidad_estimada: i.cantidad_estimada,
          precio_estimado: i.precio_estimado,
        }))
      )

    if (insumosError) {
      console.error('Error inserting estimated insumos:', insumosError)
    }
  }

  // Record initial state in history
  await supabase.from('ot_historial').insert({
    orden_trabajo_id: ot.id,
    estado_anterior: null,
    estado_nuevo: 'borrador',
    usuario_id: profile.id,
    notas: 'OT creada',
  })

  revalidatePath(`/obras/${validation.data.obra_id}`)
  revalidatePath(`/obras/${validation.data.obra_id}/ots`)

  return { success: true, data: ot as OrdenTrabajo }
}

/**
 * Update an existing OT (only in draft state)
 */
export async function updateOT(input: UpdateOTInput): Promise<ActionResult<OrdenTrabajo>> {
  const supabase = await createClient()

  const validation = updateOTSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  // Get current OT
  const { data: currentOT } = await supabase
    .from('ordenes_trabajo')
    .select('*')
    .eq('id', validation.data.id)
    .single()

  if (!currentOT) {
    return { success: false, error: 'Orden de trabajo no encontrada' }
  }

  // Only allow updates in draft state
  if (currentOT.estado !== 'borrador') {
    return { success: false, error: 'Solo se pueden editar OTs en estado borrador' }
  }

  const { id, ...updateData } = validation.data

  // If cantidad or rubro changed, recalculate estimates
  let newCostoEstimado = currentOT.costo_estimado
  if (updateData.cantidad || updateData.rubro_id) {
    const { insumos, costo_estimado } = await calculateEstimatedInsumos(
      updateData.rubro_id || currentOT.rubro_id,
      updateData.cantidad || currentOT.cantidad,
      currentOT.obra_id
    )
    newCostoEstimado = costo_estimado

    // Delete old estimated insumos and insert new ones
    await supabase
      .from('ot_insumos_estimados')
      .delete()
      .eq('orden_trabajo_id', id)

    if (insumos.length > 0) {
      await supabase.from('ot_insumos_estimados').insert(
        insumos.map((i) => ({
          orden_trabajo_id: id,
          insumo_id: i.insumo_id,
          cantidad_estimada: i.cantidad_estimada,
          precio_estimado: i.precio_estimado,
        }))
      )
    }
  }

  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .update({
      ...updateData,
      costo_estimado: newCostoEstimado,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating OT:', error)
    return { success: false, error: 'Error al actualizar la orden de trabajo' }
  }

  revalidatePath(`/obras/${currentOT.obra_id}`)
  revalidatePath(`/obras/${currentOT.obra_id}/ots`)
  revalidatePath(`/obras/${currentOT.obra_id}/ots/${id}`)

  return { success: true, data: data as OrdenTrabajo }
}

/**
 * DO approves an OT
 */
export async function approveOT(input: ApproveOTInput): Promise<ActionResult<OrdenTrabajo>> {
  const supabase = await createClient()

  const validation = approveOTSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  if (!['admin', 'director_obra'].includes(profile.rol)) {
    return { success: false, error: 'Solo el Director de Obra puede aprobar OTs' }
  }

  // Get current OT with rubro info
  const { data: currentOT } = await supabase
    .from('ordenes_trabajo')
    .select(`
      *,
      rubros (
        id,
        presupuesto,
        presupuesto_ur
      )
    `)
    .eq('id', validation.data.id)
    .single()

  if (!currentOT) {
    return { success: false, error: 'Orden de trabajo no encontrada' }
  }

  if (currentOT.estado !== 'borrador') {
    return { success: false, error: 'Solo se pueden aprobar OTs en estado borrador' }
  }

  // Check if approving would exceed rubro budget
  const { data: otrasOTs } = await supabase
    .from('ordenes_trabajo')
    .select('costo_estimado')
    .eq('rubro_id', currentOT.rubro_id)
    .neq('id', currentOT.id)
    .in('estado', ['aprobada', 'en_ejecucion', 'cerrada'])

  const totalGastado = (otrasOTs || []).reduce((sum, ot) => sum + (ot.costo_estimado || 0), 0)
  const rubro = currentOT.rubros as { presupuesto: number; presupuesto_ur: number | null } | null
  const presupuestoRubro = rubro?.presupuesto || 0
  const nuevoTotal = totalGastado + (currentOT.costo_estimado || 0)
  const excedePresupuesto = nuevoTotal > presupuestoRubro

  // If budget exceeded and not acknowledged, return warning info
  if (excedePresupuesto && !validation.data.acknowledge_budget_exceeded) {
    return {
      success: false,
      error: `Esta OT excede el presupuesto del rubro por $${(nuevoTotal - presupuestoRubro).toLocaleString('es-UY')}. Debe confirmar para continuar.`,
    }
  }

  // Update OT status
  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .update({ estado: 'aprobada' as OTStatus })
    .eq('id', validation.data.id)
    .select()
    .single()

  if (error) {
    console.error('Error approving OT:', error)
    return { success: false, error: 'Error al aprobar la orden de trabajo' }
  }

  // Record in history
  const historialData: {
    orden_trabajo_id: string
    estado_anterior: OTStatus
    estado_nuevo: OTStatus
    usuario_id: string
    notas: string | null
    acknowledged_by?: string
    acknowledged_at?: string
  } = {
    orden_trabajo_id: validation.data.id,
    estado_anterior: 'borrador',
    estado_nuevo: 'aprobada',
    usuario_id: profile.id,
    notas: validation.data.notas || null,
  }

  if (excedePresupuesto) {
    historialData.notas = `${historialData.notas || ''} [APROBADA EXCEDIENDO PRESUPUESTO]`.trim()
    historialData.acknowledged_by = profile.id
    historialData.acknowledged_at = new Date().toISOString()
  }

  await supabase.from('ot_historial').insert(historialData)

  revalidatePath(`/obras/${currentOT.obra_id}`)
  revalidatePath(`/obras/${currentOT.obra_id}/ots`)
  revalidatePath(`/obras/${currentOT.obra_id}/ots/${validation.data.id}`)

  return { success: true, data: data as OrdenTrabajo }
}

/**
 * JO starts OT execution
 */
export async function startOTExecution(otId: string): Promise<ActionResult<OrdenTrabajo>> {
  const supabase = await createClient()

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  if (!['admin', 'director_obra', 'jefe_obra'].includes(profile.rol)) {
    return { success: false, error: 'No tiene permisos para iniciar ejecución' }
  }

  // Get current OT
  const { data: currentOT } = await supabase
    .from('ordenes_trabajo')
    .select('*')
    .eq('id', otId)
    .single()

  if (!currentOT) {
    return { success: false, error: 'Orden de trabajo no encontrada' }
  }

  // JO can only start OTs for their assigned obra
  if (profile.rol === 'jefe_obra' && profile.obra_id !== currentOT.obra_id) {
    return { success: false, error: 'Solo puede iniciar OTs de su obra asignada' }
  }

  if (currentOT.estado !== 'aprobada') {
    return { success: false, error: 'Solo se pueden iniciar OTs aprobadas' }
  }

  // Update OT status and set fecha_inicio
  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .update({
      estado: 'en_ejecucion' as OTStatus,
      fecha_inicio: new Date().toISOString().split('T')[0],
    })
    .eq('id', otId)
    .select()
    .single()

  if (error) {
    console.error('Error starting OT execution:', error)
    return { success: false, error: 'Error al iniciar ejecución' }
  }

  // Record in history
  await supabase.from('ot_historial').insert({
    orden_trabajo_id: otId,
    estado_anterior: 'aprobada',
    estado_nuevo: 'en_ejecucion',
    usuario_id: profile.id,
    notas: 'Ejecución iniciada',
  })

  revalidatePath(`/obras/${currentOT.obra_id}`)
  revalidatePath(`/obras/${currentOT.obra_id}/ots`)
  revalidatePath(`/obras/${currentOT.obra_id}/ots/${otId}`)

  return { success: true, data: data as OrdenTrabajo }
}

/**
 * JO closes OT
 */
export async function closeOT(input: CloseOTInput): Promise<ActionResult<OrdenTrabajo>> {
  const supabase = await createClient()

  const validation = closeOTSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  if (!['admin', 'director_obra', 'jefe_obra'].includes(profile.rol)) {
    return { success: false, error: 'No tiene permisos para cerrar OTs' }
  }

  // Get current OT with tareas
  const { data: currentOT } = await supabase
    .from('ordenes_trabajo')
    .select(`
      *,
      tareas (
        id,
        completada
      )
    `)
    .eq('id', validation.data.id)
    .single()

  if (!currentOT) {
    return { success: false, error: 'Orden de trabajo no encontrada' }
  }

  // JO can only close OTs for their assigned obra
  if (profile.rol === 'jefe_obra' && profile.obra_id !== currentOT.obra_id) {
    return { success: false, error: 'Solo puede cerrar OTs de su obra asignada' }
  }

  if (currentOT.estado !== 'en_ejecucion') {
    return { success: false, error: 'Solo se pueden cerrar OTs en ejecución' }
  }

  // Calculate costo_real (for now, use costo_estimado, will be updated when consumos are added)
  const costo_real = currentOT.costo_real || currentOT.costo_estimado
  const desvio = costo_real - currentOT.costo_estimado
  const desvio_porcentaje = currentOT.costo_estimado > 0
    ? (desvio / currentOT.costo_estimado) * 100
    : 0

  // Check for incomplete tasks
  const tareas = currentOT.tareas as { id: string; completada: boolean | null }[] | null
  const tareasIncompletas = tareas?.filter(t => !t.completada).length || 0

  // If there's deviation and not acknowledged
  if (desvio > 0 && !validation.data.acknowledge_deviation) {
    return {
      success: false,
      error: `Esta OT tiene un desvío de $${desvio.toLocaleString('es-UY')} (${desvio_porcentaje.toFixed(1)}%). Debe confirmar para cerrar.`,
    }
  }

  // Update OT status
  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .update({
      estado: 'cerrada' as OTStatus,
      costo_real,
      fecha_fin: new Date().toISOString().split('T')[0],
    })
    .eq('id', validation.data.id)
    .select()
    .single()

  if (error) {
    console.error('Error closing OT:', error)
    return { success: false, error: 'Error al cerrar la orden de trabajo' }
  }

  // Record in history
  let notas = validation.data.notas || 'OT cerrada'
  if (desvio > 0) {
    notas += ` [DESVÍO: $${desvio.toLocaleString('es-UY')} (${desvio_porcentaje.toFixed(1)}%)]`
  }
  if (tareasIncompletas > 0) {
    notas += ` [${tareasIncompletas} tareas pendientes]`
  }

  const historialData: {
    orden_trabajo_id: string
    estado_anterior: OTStatus
    estado_nuevo: OTStatus
    usuario_id: string
    notas: string
    acknowledged_by?: string
    acknowledged_at?: string
  } = {
    orden_trabajo_id: validation.data.id,
    estado_anterior: 'en_ejecucion',
    estado_nuevo: 'cerrada',
    usuario_id: profile.id,
    notas,
  }

  if (desvio > 0 && validation.data.acknowledge_deviation) {
    historialData.acknowledged_by = profile.id
    historialData.acknowledged_at = new Date().toISOString()
  }

  await supabase.from('ot_historial').insert(historialData)

  revalidatePath(`/obras/${currentOT.obra_id}`)
  revalidatePath(`/obras/${currentOT.obra_id}/ots`)
  revalidatePath(`/obras/${currentOT.obra_id}/ots/${validation.data.id}`)
  revalidatePath('/dashboard')

  return { success: true, data: data as OrdenTrabajo }
}

/**
 * Get OTs for an obra with optional filters
 */
export async function getOTs(
  obraId: string,
  filters?: { estado?: OTStatus; search?: string }
): Promise<ActionResult<OrdenTrabajoWithRelations[]>> {
  const supabase = await createClient()

  let query = supabase
    .from('ordenes_trabajo')
    .select(`
      *,
      rubros (
        id,
        nombre,
        unidad,
        presupuesto
      ),
      usuarios!ordenes_trabajo_created_by_fkey (
        id,
        nombre
      ),
      tareas (
        id,
        completada
      )
    `)
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filters?.estado) {
    query = query.eq('estado', filters.estado)
  }

  if (filters?.search) {
    query = query.or(`descripcion.ilike.%${filters.search}%,numero.eq.${parseInt(filters.search) || 0}`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching OTs:', error)
    return { success: false, error: 'Error al cargar las órdenes de trabajo' }
  }

  // Transform the data to match the expected type
  const transformed = (data || []).map((ot) => ({
    ...ot,
    rubro: ot.rubros,
    created_by_usuario: ot.usuarios,
    rubros: undefined,
    usuarios: undefined,
  }))

  return { success: true, data: transformed as unknown as OrdenTrabajoWithRelations[] }
}

/**
 * Get OTs with pagination
 */
export async function getOTsPaginated(
  obraId: string,
  params: PaginationParams = {},
  filters?: { estado?: OTStatus; search?: string }
): Promise<ActionResult<PaginatedResponse<OrdenTrabajoWithRelations>>> {
  const supabase = await createClient()
  const { page, pageSize, from, to } = normalizePagination(params)

  // Build count query
  let countQuery = supabase
    .from('ordenes_trabajo')
    .select('*', { count: 'exact', head: true })
    .eq('obra_id', obraId)
    .is('deleted_at', null)

  if (filters?.estado) {
    countQuery = countQuery.eq('estado', filters.estado)
  }

  if (filters?.search) {
    countQuery = countQuery.or(`descripcion.ilike.%${filters.search}%,numero.eq.${parseInt(filters.search) || 0}`)
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    return { success: false, error: 'Error al contar las órdenes de trabajo' }
  }

  // Build data query
  let query = supabase
    .from('ordenes_trabajo')
    .select(`
      *,
      rubros (
        id,
        nombre,
        unidad,
        presupuesto
      ),
      usuarios!ordenes_trabajo_created_by_fkey (
        id,
        nombre
      ),
      tareas (
        id,
        completada
      )
    `)
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters?.estado) {
    query = query.eq('estado', filters.estado)
  }

  if (filters?.search) {
    query = query.or(`descripcion.ilike.%${filters.search}%,numero.eq.${parseInt(filters.search) || 0}`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching OTs:', error)
    return { success: false, error: 'Error al cargar las órdenes de trabajo' }
  }

  // Transform the data
  const transformed = (data || []).map((ot) => ({
    ...ot,
    rubro: ot.rubros,
    created_by_usuario: ot.usuarios,
    rubros: undefined,
    usuarios: undefined,
  }))

  return {
    success: true,
    data: createPaginatedResponse(
      transformed as unknown as OrdenTrabajoWithRelations[],
      count || 0,
      page,
      pageSize
    ),
  }
}

/**
 * Get a single OT with all relations
 */
export async function getOT(id: string): Promise<ActionResult<OrdenTrabajoWithRelations>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .select(`
      *,
      obras (
        id,
        nombre
      ),
      rubros (
        id,
        nombre,
        unidad,
        presupuesto,
        presupuesto_ur
      ),
      usuarios!ordenes_trabajo_created_by_fkey (
        id,
        nombre,
        email
      ),
      tareas (
        id,
        descripcion,
        completada,
        orden,
        created_at
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching OT:', error)
    return { success: false, error: 'Orden de trabajo no encontrada' }
  }

  // Get estimated insumos
  const { data: insumosEstimados } = await supabase
    .from('ot_insumos_estimados')
    .select(`
      *,
      insumos (
        id,
        nombre,
        unidad,
        tipo
      )
    `)
    .eq('orden_trabajo_id', id)

  // Get history
  const { data: historial } = await supabase
    .from('ot_historial')
    .select(`
      *,
      usuarios!ot_historial_usuario_id_fkey (
        id,
        nombre
      )
    `)
    .eq('orden_trabajo_id', id)
    .order('created_at', { ascending: false })

  const result: OrdenTrabajoWithRelations = {
    ...data,
    obra: data.obras as OrdenTrabajoWithRelations['obra'],
    rubro: data.rubros as OrdenTrabajoWithRelations['rubro'],
    created_by_usuario: data.usuarios as OrdenTrabajoWithRelations['created_by_usuario'],
    tareas: data.tareas as OrdenTrabajoWithRelations['tareas'],
    insumos_estimados: (insumosEstimados || []).map((ie) => ({
      ...ie,
      insumo: ie.insumos,
    })) as OTInsumoEstimado[],
    historial: (historial || []).map((h) => ({
      ...h,
      usuario: h.usuarios,
    })) as OTHistorial[],
  }

  return { success: true, data: result }
}

/**
 * Soft-delete an OT (move to trash)
 * Can delete OTs in any state - they go to trash and can be restored
 */
export async function deleteOT(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  if (!['admin', 'director_obra'].includes(profile.rol)) {
    return { success: false, error: 'No tiene permisos para eliminar OTs' }
  }

  // Get current OT
  const { data: currentOT } = await supabase
    .from('ordenes_trabajo')
    .select('*')
    .eq('id', id)
    .single()

  if (!currentOT) {
    return { success: false, error: 'Orden de trabajo no encontrada' }
  }

  // Soft-delete the OT
  const { error } = await supabase
    .from('ordenes_trabajo')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting OT:', error)
    return { success: false, error: 'Error al eliminar la orden de trabajo' }
  }

  revalidatePath(`/obras/${currentOT.obra_id}`)
  revalidatePath(`/obras/${currentOT.obra_id}/ordenes-trabajo`)

  return { success: true, data: undefined }
}

/**
 * Get budget status for a rubro
 */
export async function getRubroBudgetStatus(rubroId: string): Promise<ActionResult<{
  presupuesto: number
  gastado: number
  disponible: number
  porcentaje_usado: number
}>> {
  const supabase = await createClient()

  // Get rubro budget
  const { data: rubro } = await supabase
    .from('rubros')
    .select('presupuesto')
    .eq('id', rubroId)
    .single()

  if (!rubro) {
    return { success: false, error: 'Rubro no encontrado' }
  }

  // Get sum of approved/in_execution/closed OTs (excluding deleted)
  const { data: ots } = await supabase
    .from('ordenes_trabajo')
    .select('costo_estimado, costo_real, estado')
    .eq('rubro_id', rubroId)
    .is('deleted_at', null)
    .in('estado', ['aprobada', 'en_ejecucion', 'cerrada'])

  const gastado = (ots || []).reduce((sum, ot) => {
    // Use costo_real if available (for closed OTs), otherwise costo_estimado
    const costo = ot.estado === 'cerrada' && ot.costo_real != null
      ? ot.costo_real
      : ot.costo_estimado
    return sum + costo
  }, 0)

  const presupuesto = rubro.presupuesto || 0
  const disponible = presupuesto - gastado
  const porcentaje_usado = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0

  return {
    success: true,
    data: {
      presupuesto,
      gastado,
      disponible,
      porcentaje_usado,
    },
  }
}
