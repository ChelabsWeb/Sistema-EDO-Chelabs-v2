'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Configuracion } from '@/types/database'
import { DEFAULT_COTIZACION_UR } from '@/lib/constants/app'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get a configuration value by key
 */
export async function getConfig(clave: string): Promise<ActionResult<string>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', clave)
    .single()

  if (error) {
    return { success: false, error: 'Configuración no encontrada' }
  }

  return { success: true, data: data.valor }
}

/**
 * Get the current UR exchange rate
 */
export async function getCotizacionUR(): Promise<number> {
  const result = await getConfig('cotizacion_ur')
  if (!result.success) {
    return DEFAULT_COTIZACION_UR
  }
  return parseFloat(result.data)
}

/**
 * Update the UR exchange rate
 * Only admin and director_obra can update
 */
export async function updateCotizacionUR(valor: number): Promise<ActionResult> {
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
    return { success: false, error: 'No tiene permisos para modificar la cotización' }
  }

  if (valor <= 0) {
    return { success: false, error: 'La cotización debe ser mayor a 0' }
  }

  const { error } = await supabase
    .from('configuracion')
    .update({ valor: valor.toString() })
    .eq('clave', 'cotizacion_ur')

  if (error) {
    console.error('Error updating cotizacion:', error)
    return { success: false, error: 'Error al actualizar la cotización' }
  }

  revalidatePath('/')

  return { success: true, data: undefined }
}

/**
 * Get all configuration values
 */
export async function getAllConfig(): Promise<ActionResult<Configuracion[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .order('clave')

  if (error) {
    return { success: false, error: 'Error al cargar la configuración' }
  }

  return { success: true, data: data as Configuracion[] }
}
