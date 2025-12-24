'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'
import type { Insumo, RubroWithInsumos } from '@/types/database'

export type RubroInsumoResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get a rubro with its linked insumos and presupuesto status
 */
export async function getRubroWithInsumos(
  rubroId: string
): Promise<RubroInsumoResult<RubroWithInsumos>> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  const supabase = await createClient()

  // Get the rubro
  const { data: rubro, error: rubroError } = await supabase
    .from('rubros')
    .select('*')
    .eq('id', rubroId)
    .is('deleted_at', null)
    .single()

  if (rubroError || !rubro) {
    return { success: false, error: 'Rubro no encontrado' }
  }

  // Get linked insumos
  const { data: rubroInsumos, error: riError } = await supabase
    .from('rubro_insumos')
    .select('insumo_id')
    .eq('rubro_id', rubroId)

  if (riError) {
    console.error('Error fetching rubro_insumos:', riError)
    return { success: false, error: 'Error al cargar insumos del rubro' }
  }

  let insumos: Insumo[] = []
  if (rubroInsumos && rubroInsumos.length > 0) {
    const insumoIds = rubroInsumos.map(ri => ri.insumo_id)
    const { data: insumosData, error: insumosError } = await supabase
      .from('insumos')
      .select('*')
      .in('id', insumoIds)
      .is('deleted_at', null)
      .order('tipo')
      .order('nombre')

    if (insumosError) {
      console.error('Error fetching insumos:', insumosError)
    } else {
      insumos = insumosData || []
    }
  }

  // Calculate presupuesto status from OTs
  const { data: ots } = await supabase
    .from('ordenes_trabajo')
    .select('costo_estimado')
    .eq('rubro_id', rubroId)
    .is('deleted_at', null)

  const gastado = ots?.reduce((sum, ot) => sum + (ot.costo_estimado || 0), 0) || 0
  const presupuesto = rubro.presupuesto || 0
  const disponible = presupuesto - gastado
  const porcentaje_usado = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0

  return {
    success: true,
    data: {
      ...rubro,
      insumos,
      presupuesto_status: {
        gastado,
        disponible,
        porcentaje_usado
      }
    }
  }
}

/**
 * Get all rubros of an obra with their linked insumos
 */
export async function getRubrosWithInsumos(
  obraId: string
): Promise<RubroInsumoResult<RubroWithInsumos[]>> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  const supabase = await createClient()

  // Get all rubros for the obra
  const { data: rubros, error: rubrosError } = await supabase
    .from('rubros')
    .select('*')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('nombre')

  if (rubrosError) {
    console.error('Error fetching rubros:', rubrosError)
    return { success: false, error: 'Error al cargar rubros' }
  }

  if (!rubros || rubros.length === 0) {
    return { success: true, data: [] }
  }

  // Get all rubro_insumos for these rubros
  const rubroIds = rubros.map(r => r.id)
  const { data: rubroInsumos } = await supabase
    .from('rubro_insumos')
    .select('rubro_id, insumo_id')
    .in('rubro_id', rubroIds)

  // Get all insumos for the obra
  const { data: allInsumos } = await supabase
    .from('insumos')
    .select('*')
    .eq('obra_id', obraId)
    .is('deleted_at', null)

  const insumosMap = new Map((allInsumos || []).map(i => [i.id, i]))

  // Get OT costs per rubro
  const { data: ots } = await supabase
    .from('ordenes_trabajo')
    .select('rubro_id, costo_estimado')
    .in('rubro_id', rubroIds)
    .is('deleted_at', null)

  const costosPorRubro = new Map<string, number>()
  ots?.forEach(ot => {
    const current = costosPorRubro.get(ot.rubro_id) || 0
    costosPorRubro.set(ot.rubro_id, current + (ot.costo_estimado || 0))
  })

  // Build rubros with insumos
  const rubrosWithInsumos: RubroWithInsumos[] = rubros.map(rubro => {
    const insumoIds = (rubroInsumos || [])
      .filter(ri => ri.rubro_id === rubro.id)
      .map(ri => ri.insumo_id)

    const insumos = insumoIds
      .map(id => insumosMap.get(id))
      .filter((i): i is Insumo => i !== undefined)
      .sort((a, b) => {
        if (a.tipo !== b.tipo) return (a.tipo || '').localeCompare(b.tipo || '')
        return a.nombre.localeCompare(b.nombre)
      })

    const gastado = costosPorRubro.get(rubro.id) || 0
    const presupuesto = rubro.presupuesto || 0
    const disponible = presupuesto - gastado
    const porcentaje_usado = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0

    return {
      ...rubro,
      insumos,
      presupuesto_status: {
        gastado,
        disponible,
        porcentaje_usado
      }
    }
  })

  return { success: true, data: rubrosWithInsumos }
}

/**
 * Add an insumo to a rubro
 */
export async function addInsumoToRubro(
  rubroId: string,
  insumoId: string
): Promise<RubroInsumoResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  // Only admin, DO, JO can add insumos to rubros
  if (!['admin', 'director_obra', 'jefe_obra'].includes(currentUser.profile.rol)) {
    return { success: false, error: 'No tenes permisos para modificar rubros' }
  }

  const supabase = await createClient()

  // Check rubro exists
  const { data: rubro } = await supabase
    .from('rubros')
    .select('obra_id')
    .eq('id', rubroId)
    .is('deleted_at', null)
    .single()

  if (!rubro) {
    return { success: false, error: 'Rubro no encontrado' }
  }

  // Check insumo exists and belongs to same obra
  const { data: insumo } = await supabase
    .from('insumos')
    .select('id, obra_id')
    .eq('id', insumoId)
    .is('deleted_at', null)
    .single()

  if (!insumo) {
    return { success: false, error: 'Insumo no encontrado' }
  }

  if (insumo.obra_id !== rubro.obra_id) {
    return { success: false, error: 'El insumo no pertenece a la misma obra' }
  }

  // Add the link
  const { error } = await supabase
    .from('rubro_insumos')
    .insert({
      rubro_id: rubroId,
      insumo_id: insumoId
    })

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'El insumo ya esta vinculado a este rubro' }
    }
    console.error('Error adding insumo to rubro:', error)
    return { success: false, error: 'Error al vincular insumo' }
  }

  revalidatePath(`/obras/${rubro.obra_id}`)
  return { success: true }
}

/**
 * Remove an insumo from a rubro
 */
export async function removeInsumoFromRubro(
  rubroId: string,
  insumoId: string
): Promise<RubroInsumoResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  // Only admin, DO, JO can remove insumos from rubros
  if (!['admin', 'director_obra', 'jefe_obra'].includes(currentUser.profile.rol)) {
    return { success: false, error: 'No tenes permisos para modificar rubros' }
  }

  const supabase = await createClient()

  // Get rubro to find obra_id for revalidation
  const { data: rubro } = await supabase
    .from('rubros')
    .select('obra_id')
    .eq('id', rubroId)
    .single()

  // Remove the link
  const { error } = await supabase
    .from('rubro_insumos')
    .delete()
    .eq('rubro_id', rubroId)
    .eq('insumo_id', insumoId)

  if (error) {
    console.error('Error removing insumo from rubro:', error)
    return { success: false, error: 'Error al desvincular insumo' }
  }

  if (rubro) {
    revalidatePath(`/obras/${rubro.obra_id}`)
  }
  return { success: true }
}

/**
 * Update rubro presupuesto
 */
export async function updateRubroPresupuesto(
  rubroId: string,
  presupuestoUr: number,
  presupuestoPesos?: number
): Promise<RubroInsumoResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  // Only admin and DO can update presupuesto
  if (!['admin', 'director_obra'].includes(currentUser.profile.rol)) {
    return { success: false, error: 'No tenes permisos para modificar presupuestos' }
  }

  if (presupuestoUr < 0) {
    return { success: false, error: 'El presupuesto no puede ser negativo' }
  }

  const supabase = await createClient()

  const updateData: { presupuesto_ur: number; presupuesto?: number; updated_at: string } = {
    presupuesto_ur: presupuestoUr,
    updated_at: new Date().toISOString()
  }

  if (presupuestoPesos !== undefined) {
    updateData.presupuesto = presupuestoPesos
  }

  const { data: rubro, error } = await supabase
    .from('rubros')
    .update(updateData)
    .eq('id', rubroId)
    .is('deleted_at', null)
    .select('obra_id')
    .single()

  if (error) {
    console.error('Error updating rubro presupuesto:', error)
    return { success: false, error: 'Error al actualizar presupuesto' }
  }

  if (rubro) {
    revalidatePath(`/obras/${rubro.obra_id}`)
  }
  return { success: true }
}

/**
 * Update an insumo (price, name, unit)
 */
export async function updateInsumo(
  insumoId: string,
  data: {
    nombre?: string
    unidad?: string
    precio_unitario?: number
    precio_referencia?: number
  }
): Promise<RubroInsumoResult<Insumo>> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  // Only admin, DO, JO can update insumos
  if (!['admin', 'director_obra', 'jefe_obra'].includes(currentUser.profile.rol)) {
    return { success: false, error: 'No tenes permisos para modificar insumos' }
  }

  const supabase = await createClient()

  const { data: insumo, error } = await supabase
    .from('insumos')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', insumoId)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    console.error('Error updating insumo:', error)
    return { success: false, error: 'Error al actualizar insumo' }
  }

  if (insumo) {
    revalidatePath(`/obras/${insumo.obra_id}`)
  }

  return { success: true, data: insumo }
}

/**
 * Get insumos from obra catalog not linked to a specific rubro
 */
export async function getAvailableInsumosForRubro(
  rubroId: string
): Promise<RubroInsumoResult<Insumo[]>> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  const supabase = await createClient()

  // Get rubro's obra_id
  const { data: rubro } = await supabase
    .from('rubros')
    .select('obra_id')
    .eq('id', rubroId)
    .single()

  if (!rubro) {
    return { success: false, error: 'Rubro no encontrado' }
  }

  // Get insumos already linked
  const { data: linkedInsumos } = await supabase
    .from('rubro_insumos')
    .select('insumo_id')
    .eq('rubro_id', rubroId)

  const linkedIds = (linkedInsumos || []).map(li => li.insumo_id)

  // Get all insumos from obra not linked to this rubro
  let query = supabase
    .from('insumos')
    .select('*')
    .eq('obra_id', rubro.obra_id)
    .is('deleted_at', null)
    .order('tipo')
    .order('nombre')

  if (linkedIds.length > 0) {
    // Filter out already linked insumos
    query = query.not('id', 'in', `(${linkedIds.join(',')})`)
  }

  const { data: insumos, error } = await query

  if (error) {
    console.error('Error fetching available insumos:', error)
    return { success: false, error: 'Error al cargar insumos disponibles' }
  }

  return { success: true, data: insumos || [] }
}
