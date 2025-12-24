'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import type {
  PlantillaRubro,
  PlantillaRubroWithDetails,
  InsumoTipo
} from '@/types/database'

export type PlantillaResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get all available plantillas (system + user's personal ones)
 * Shows system templates to all users, personal templates only to their creator
 */
export async function getPlantillasRubros(): Promise<PlantillaResult<PlantillaRubroWithDetails[]>> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  const supabase = await createClient()

  // Get system templates + user's personal templates
  const { data, error } = await supabase
    .from('plantilla_rubros')
    .select(`
      *,
      creador:usuarios!plantilla_rubros_created_by_fkey(id, nombre)
    `)
    .is('deleted_at', null)
    .or(`es_sistema.eq.true,created_by.eq.${currentUser.profile.id}`)
    .order('es_sistema', { ascending: false })
    .order('nombre')

  if (error) {
    console.error('Error fetching plantillas:', error)
    return { success: false, error: 'Error al cargar plantillas' }
  }

  return {
    success: true,
    data: data as PlantillaRubroWithDetails[]
  }
}

/**
 * Get a single plantilla with all its insumos
 */
export async function getPlantillaWithDetails(
  plantillaId: string
): Promise<PlantillaResult<PlantillaRubroWithDetails>> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  const supabase = await createClient()

  // Get plantilla
  const { data: plantilla, error: plantillaError } = await supabase
    .from('plantilla_rubros')
    .select(`
      *,
      creador:usuarios!plantilla_rubros_created_by_fkey(id, nombre)
    `)
    .eq('id', plantillaId)
    .is('deleted_at', null)
    .single()

  if (plantillaError || !plantilla) {
    return { success: false, error: 'Plantilla no encontrada' }
  }

  // Check access: system templates are public, personal templates only to creator
  if (!plantilla.es_sistema && plantilla.created_by !== currentUser.profile.id) {
    return { success: false, error: 'No tenés acceso a esta plantilla' }
  }

  // Get insumos (no formulas needed - simplified architecture)
  const { data: insumos, error: insumosError } = await supabase
    .from('plantilla_insumos')
    .select('*')
    .eq('plantilla_rubro_id', plantillaId)
    .order('nombre')

  if (insumosError) {
    console.error('Error fetching plantilla insumos:', insumosError)
    return { success: false, error: 'Error al cargar insumos de plantilla' }
  }

  return {
    success: true,
    data: {
      ...plantilla,
      insumos: insumos || []
    } as PlantillaRubroWithDetails
  }
}

/**
 * Apply a plantilla to create a rubro in an obra
 * Creates the rubro and copies insumos (creating new ones in the obra)
 * Note: Formulas were removed from the architecture - insumos are selected manually per OT
 */
export async function applyPlantillaToObra(
  plantillaId: string,
  obraId: string,
  presupuesto: number,
  presupuestoUr?: number
): Promise<PlantillaResult<{ rubroId: string; insumosCreados: number }>> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  // Only DO and admin can create rubros
  if (!['admin', 'director_obra'].includes(currentUser.profile.rol)) {
    return { success: false, error: 'No tenés permisos para crear rubros' }
  }

  // Get plantilla with details
  const plantillaResult = await getPlantillaWithDetails(plantillaId)
  if (!plantillaResult.success || !plantillaResult.data) {
    return { success: false, error: plantillaResult.error || 'Plantilla no encontrada' }
  }

  const plantilla = plantillaResult.data
  const supabase = await createClient()

  // 1. Create the rubro
  const { data: rubro, error: rubroError } = await supabase
    .from('rubros')
    .insert({
      nombre: plantilla.nombre,
      unidad: plantilla.unidad,
      obra_id: obraId,
      presupuesto,
      presupuesto_ur: presupuestoUr || null,
      es_predefinido: true // Mark as created from template
    })
    .select()
    .single()

  if (rubroError || !rubro) {
    console.error('Error creating rubro:', rubroError)
    return { success: false, error: 'Error al crear el rubro' }
  }

  // 2. Create insumos and link them to rubro
  let insumosCreados = 0
  const createdInsumoIds: string[] = []

  if (plantilla.insumos && plantilla.insumos.length > 0) {
    for (const plantillaInsumo of plantilla.insumos) {
      // Check if similar insumo already exists in obra
      const { data: existingInsumo } = await supabase
        .from('insumos')
        .select('id')
        .eq('obra_id', obraId)
        .eq('nombre', plantillaInsumo.nombre)
        .is('deleted_at', null)
        .single()

      if (existingInsumo) {
        // Insumo already exists, link it to the rubro
        createdInsumoIds.push(existingInsumo.id)
        continue
      }

      // Create new insumo
      const { data: newInsumo, error: insumoError } = await supabase
        .from('insumos')
        .insert({
          nombre: plantillaInsumo.nombre,
          unidad: plantillaInsumo.unidad,
          tipo: plantillaInsumo.tipo as InsumoTipo,
          precio_referencia: plantillaInsumo.precio_referencia,
          precio_unitario: plantillaInsumo.precio_referencia,
          obra_id: obraId
        })
        .select('id')
        .single()

      if (insumoError || !newInsumo) {
        console.error('Error creating insumo:', insumoError)
        continue // Skip this insumo but continue with others
      }

      createdInsumoIds.push(newInsumo.id)
      insumosCreados++
    }
  }

  // 3. Link all insumos to the rubro
  for (const insumoId of createdInsumoIds) {
    const { error: linkError } = await supabase
      .from('rubro_insumos')
      .insert({
        rubro_id: rubro.id,
        insumo_id: insumoId
      })

    if (linkError) {
      console.error('Error linking insumo to rubro:', linkError)
    }
  }

  return {
    success: true,
    data: {
      rubroId: rubro.id,
      insumosCreados
    }
  }
}

/**
 * Create a new personal plantilla from an existing rubro
 * Copies the rubro and its insumos as a new plantilla
 * Note: Formulas were removed from the architecture
 */
export async function createPlantillaFromRubro(
  rubroId: string,
  nombre?: string,
  descripcion?: string
): Promise<PlantillaResult<{ plantillaId: string }>> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  // Only DO and admin can create plantillas
  if (!['admin', 'director_obra'].includes(currentUser.profile.rol)) {
    return { success: false, error: 'No tenés permisos para crear plantillas' }
  }

  const supabase = await createClient()

  // Get the source rubro
  const { data: rubro, error: rubroError } = await supabase
    .from('rubros')
    .select('*')
    .eq('id', rubroId)
    .is('deleted_at', null)
    .single()

  if (rubroError || !rubro) {
    return { success: false, error: 'Rubro no encontrado' }
  }

  // Get insumos from the obra (all insumos available, not just formula-linked)
  const { data: insumos, error: insumosError } = await supabase
    .from('insumos')
    .select('*')
    .eq('obra_id', rubro.obra_id)
    .is('deleted_at', null)

  if (insumosError) {
    return { success: false, error: 'Error al obtener insumos' }
  }

  // 1. Create plantilla
  const { data: plantilla, error: plantillaError } = await supabase
    .from('plantilla_rubros')
    .insert({
      nombre: nombre || rubro.nombre,
      descripcion: descripcion || null,
      unidad: rubro.unidad || 'unidad',
      es_sistema: currentUser.profile.rol === 'admin', // Admin creates system templates
      created_by: currentUser.profile.id
    })
    .select()
    .single()

  if (plantillaError || !plantilla) {
    console.error('Error creating plantilla:', plantillaError)
    return { success: false, error: 'Error al crear la plantilla' }
  }

  // 2. Create plantilla insumos (no formulas - simplified architecture)
  if (insumos && insumos.length > 0) {
    for (const insumo of insumos) {
      const { error: piError } = await supabase
        .from('plantilla_insumos')
        .insert({
          plantilla_rubro_id: plantilla.id,
          nombre: insumo.nombre,
          unidad: insumo.unidad,
          tipo: insumo.tipo || 'material',
          precio_referencia: insumo.precio_unitario || insumo.precio_referencia
        })

      if (piError) {
        console.error('Error creating plantilla insumo:', piError)
      }
    }
  }

  return {
    success: true,
    data: { plantillaId: plantilla.id }
  }
}

/**
 * Delete a personal plantilla (soft delete)
 * Only the creator can delete their own plantillas
 * System plantillas can only be deleted by admin
 */
export async function deletePlantilla(
  plantillaId: string
): Promise<PlantillaResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  const supabase = await createClient()

  // Get the plantilla
  const { data: plantilla, error: fetchError } = await supabase
    .from('plantilla_rubros')
    .select('*')
    .eq('id', plantillaId)
    .is('deleted_at', null)
    .single()

  if (fetchError || !plantilla) {
    return { success: false, error: 'Plantilla no encontrada' }
  }

  // Check permissions
  if (plantilla.es_sistema) {
    if (currentUser.profile.rol !== 'admin') {
      return { success: false, error: 'Solo admin puede eliminar plantillas del sistema' }
    }
  } else {
    if (plantilla.created_by !== currentUser.profile.id && currentUser.profile.rol !== 'admin') {
      return { success: false, error: 'Solo podés eliminar tus propias plantillas' }
    }
  }

  // Soft delete
  const { error: deleteError } = await supabase
    .from('plantilla_rubros')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', plantillaId)

  if (deleteError) {
    console.error('Error deleting plantilla:', deleteError)
    return { success: false, error: 'Error al eliminar la plantilla' }
  }

  return { success: true }
}

/**
 * Update a plantilla's basic info
 */
export async function updatePlantilla(
  plantillaId: string,
  data: { nombre?: string; descripcion?: string; unidad?: string }
): Promise<PlantillaResult<PlantillaRubro>> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return { success: false, error: 'No autenticado' }
  }

  const supabase = await createClient()

  // Get the plantilla
  const { data: plantilla, error: fetchError } = await supabase
    .from('plantilla_rubros')
    .select('*')
    .eq('id', plantillaId)
    .is('deleted_at', null)
    .single()

  if (fetchError || !plantilla) {
    return { success: false, error: 'Plantilla no encontrada' }
  }

  // Check permissions
  if (plantilla.es_sistema) {
    if (currentUser.profile.rol !== 'admin') {
      return { success: false, error: 'Solo admin puede editar plantillas del sistema' }
    }
  } else {
    if (plantilla.created_by !== currentUser.profile.id && currentUser.profile.rol !== 'admin') {
      return { success: false, error: 'Solo podés editar tus propias plantillas' }
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('plantilla_rubros')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', plantillaId)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating plantilla:', updateError)
    return { success: false, error: 'Error al actualizar la plantilla' }
  }

  return { success: true, data: updated as PlantillaRubro }
}
