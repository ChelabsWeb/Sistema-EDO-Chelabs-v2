'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export type DeletedItemType = 'obras' | 'rubros' | 'insumos' | 'ordenes_trabajo'

export interface DeletedItem {
  id: string
  tipo: DeletedItemType
  nombre: string
  descripcion?: string
  deleted_at: string
  parent_id?: string
  parent_nombre?: string
}

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
 * Get all deleted items, optionally filtered by type
 * Only admin can access papelera
 */
export async function getDeletedItems(tipo?: DeletedItemType): Promise<ActionResult<DeletedItem[]>> {
  const supabase = await createClient()

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  if (profile.rol !== 'admin') {
    return { success: false, error: 'Solo administradores pueden acceder a la papelera' }
  }

  const items: DeletedItem[] = []

  // Get deleted obras
  if (!tipo || tipo === 'obras') {
    const { data: obras } = await supabase
      .from('obras')
      .select('id, nombre, direccion, deleted_at')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (obras) {
      items.push(...obras.map(o => ({
        id: o.id,
        tipo: 'obras' as DeletedItemType,
        nombre: o.nombre,
        descripcion: o.direccion || undefined,
        deleted_at: o.deleted_at!,
      })))
    }
  }

  // Get deleted rubros
  if (!tipo || tipo === 'rubros') {
    const { data: rubros } = await supabase
      .from('rubros')
      .select('id, nombre, unidad, deleted_at, obra_id, obras(nombre)')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (rubros) {
      items.push(...rubros.map(r => ({
        id: r.id,
        tipo: 'rubros' as DeletedItemType,
        nombre: r.nombre,
        descripcion: `Unidad: ${r.unidad}`,
        deleted_at: r.deleted_at!,
        parent_id: r.obra_id,
        parent_nombre: (r.obras as { nombre: string } | null)?.nombre,
      })))
    }
  }

  // Get deleted insumos
  if (!tipo || tipo === 'insumos') {
    const { data: insumos } = await supabase
      .from('insumos')
      .select('id, nombre, tipo, deleted_at, obra_id, obras(nombre)')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (insumos) {
      items.push(...insumos.map(i => ({
        id: i.id,
        tipo: 'insumos' as DeletedItemType,
        nombre: i.nombre,
        descripcion: `Tipo: ${i.tipo}`,
        deleted_at: i.deleted_at!,
        parent_id: i.obra_id,
        parent_nombre: (i.obras as { nombre: string } | null)?.nombre,
      })))
    }
  }

  // Get deleted ordenes de trabajo
  if (!tipo || tipo === 'ordenes_trabajo') {
    const { data: ots } = await supabase
      .from('ordenes_trabajo')
      .select('id, numero, descripcion, deleted_at, obra_id, obras(nombre)')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (ots) {
      items.push(...ots.map(ot => ({
        id: ot.id,
        tipo: 'ordenes_trabajo' as DeletedItemType,
        nombre: `OT-${ot.numero}`,
        descripcion: ot.descripcion,
        deleted_at: ot.deleted_at!,
        parent_id: ot.obra_id,
        parent_nombre: (ot.obras as { nombre: string } | null)?.nombre,
      })))
    }
  }

  // Sort by deleted_at descending
  items.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime())

  return { success: true, data: items }
}

/**
 * Restore a deleted item
 * Only admin can restore
 */
export async function restoreItem(tipo: DeletedItemType, id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  if (profile.rol !== 'admin') {
    return { success: false, error: 'Solo administradores pueden restaurar elementos' }
  }

  // For obras, also restore children
  if (tipo === 'obras') {
    // First get the obra's deleted_at timestamp
    const { data: obra } = await supabase
      .from('obras')
      .select('deleted_at')
      .eq('id', id)
      .single()

    if (!obra?.deleted_at) {
      return { success: false, error: 'Obra no encontrada en papelera' }
    }

    const timestamp = obra.deleted_at

    // Restore rubros deleted at the same time
    await supabase
      .from('rubros')
      .update({ deleted_at: null })
      .eq('obra_id', id)
      .eq('deleted_at', timestamp)

    // Restore insumos deleted at the same time
    await supabase
      .from('insumos')
      .update({ deleted_at: null })
      .eq('obra_id', id)
      .eq('deleted_at', timestamp)

    // Restore OTs deleted at the same time
    await supabase
      .from('ordenes_trabajo')
      .update({ deleted_at: null })
      .eq('obra_id', id)
      .eq('deleted_at', timestamp)

    // Restore the obra
    const { error } = await supabase
      .from('obras')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) {
      console.error('Error restoring obra:', error)
      return { success: false, error: 'Error al restaurar la obra' }
    }

    revalidatePath('/obras')
    revalidatePath('/dashboard')
    revalidatePath('/papelera')

    return { success: true, data: undefined }
  }

  // For other types, just restore the single item
  const { error } = await supabase
    .from(tipo)
    .update({ deleted_at: null })
    .eq('id', id)

  if (error) {
    console.error(`Error restoring ${tipo}:`, error)
    return { success: false, error: `Error al restaurar el elemento` }
  }

  revalidatePath('/obras')
  revalidatePath('/papelera')

  return { success: true, data: undefined }
}

/**
 * Permanently delete an item
 * Only admin can permanently delete
 */
export async function permanentDelete(tipo: DeletedItemType, id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  if (profile.rol !== 'admin') {
    return { success: false, error: 'Solo administradores pueden eliminar permanentemente' }
  }

  // For obras, also delete children
  if (tipo === 'obras') {
    // Delete OT related data first
    const { data: ots } = await supabase
      .from('ordenes_trabajo')
      .select('id')
      .eq('obra_id', id)

    if (ots) {
      for (const ot of ots) {
        await supabase.from('ot_insumos_estimados').delete().eq('orden_trabajo_id', ot.id)
        await supabase.from('tareas').delete().eq('orden_trabajo_id', ot.id)
        await supabase.from('ot_historial').delete().eq('orden_trabajo_id', ot.id)
      }
    }

    // Delete OTs
    await supabase.from('ordenes_trabajo').delete().eq('obra_id', id)

    // Delete formulas for rubros
    const { data: rubros } = await supabase
      .from('rubros')
      .select('id')
      .eq('obra_id', id)

    if (rubros) {
      for (const rubro of rubros) {
        await supabase.from('formulas').delete().eq('rubro_id', rubro.id)
      }
    }

    // Delete rubros
    await supabase.from('rubros').delete().eq('obra_id', id)

    // Delete insumos
    await supabase.from('insumos').delete().eq('obra_id', id)

    // Delete the obra
    const { error } = await supabase.from('obras').delete().eq('id', id)

    if (error) {
      console.error('Error permanently deleting obra:', error)
      return { success: false, error: 'Error al eliminar permanentemente la obra' }
    }

    revalidatePath('/papelera')

    return { success: true, data: undefined }
  }

  // For OTs, delete related data first
  if (tipo === 'ordenes_trabajo') {
    await supabase.from('ot_insumos_estimados').delete().eq('orden_trabajo_id', id)
    await supabase.from('tareas').delete().eq('orden_trabajo_id', id)
    await supabase.from('ot_historial').delete().eq('orden_trabajo_id', id)
  }

  // For rubros, delete formulas first
  if (tipo === 'rubros') {
    await supabase.from('formulas').delete().eq('rubro_id', id)
  }

  const { error } = await supabase.from(tipo).delete().eq('id', id)

  if (error) {
    console.error(`Error permanently deleting ${tipo}:`, error)
    return { success: false, error: 'Error al eliminar permanentemente' }
  }

  revalidatePath('/papelera')

  return { success: true, data: undefined }
}

/**
 * Empty the entire trash
 * Only admin can empty trash
 */
export async function emptyTrash(): Promise<ActionResult> {
  const supabase = await createClient()

  const profile = await getCurrentUserProfile()
  if (!profile) {
    return { success: false, error: 'No autenticado' }
  }

  if (profile.rol !== 'admin') {
    return { success: false, error: 'Solo administradores pueden vaciar la papelera' }
  }

  // Get all deleted items
  const result = await getDeletedItems()
  if (!result.success) {
    return result
  }

  // Delete each item permanently
  for (const item of result.data) {
    const deleteResult = await permanentDelete(item.tipo, item.id)
    if (!deleteResult.success) {
      console.error(`Error deleting ${item.tipo} ${item.id}:`, deleteResult.error)
      // Continue with other items
    }
  }

  revalidatePath('/papelera')

  return { success: true, data: undefined }
}
