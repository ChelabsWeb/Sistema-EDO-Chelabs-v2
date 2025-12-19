'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

interface UploadPhotoInput {
  orden_trabajo_id: string
  obra_id: string
  file: {
    name: string
    type: string
    base64: string
  }
  descripcion?: string
  latitud?: number
  longitud?: number
  tomada_en?: string
}

/**
 * Upload a photo for an OT
 */
export async function uploadOTPhoto(input: UploadPhotoInput): Promise<ActionResult<{ id: string; url: string }>> {
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
    return { success: false, error: 'No tiene permisos para subir fotos' }
  }

  try {
    // Generate unique filename
    const timestamp = new Date().getTime()
    const extension = input.file.name.split('.').pop() || 'jpg'
    const fileName = `${input.orden_trabajo_id}/${timestamp}.${extension}`

    // Convert base64 to buffer
    const base64Data = input.file.base64.split(',')[1] || input.file.base64
    const buffer = Buffer.from(base64Data, 'base64')

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('ot-fotos')
      .upload(fileName, buffer, {
        contentType: input.file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      // If bucket doesn't exist, try to create it (this won't work in all cases due to permissions)
      if (uploadError.message.includes('not found')) {
        return { success: false, error: 'El bucket de almacenamiento no existe. Contacte al administrador.' }
      }
      return { success: false, error: 'Error al subir la imagen: ' + uploadError.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('ot-fotos')
      .getPublicUrl(fileName)

    // Save photo record
    const { data: foto, error: dbError } = await supabase
      .from('ot_fotos')
      .insert({
        orden_trabajo_id: input.orden_trabajo_id,
        storage_path: fileName,
        nombre_archivo: input.file.name,
        descripcion: input.descripcion || null,
        tomada_en: input.tomada_en || new Date().toISOString(),
        latitud: input.latitud || null,
        longitud: input.longitud || null,
        subida_por: profile.id,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Try to delete uploaded file if db insert failed
      await supabase.storage.from('ot-fotos').remove([fileName])
      return { success: false, error: 'Error al guardar la foto' }
    }

    revalidatePath(`/obras/${input.obra_id}/ordenes-trabajo/${input.orden_trabajo_id}`)

    return {
      success: true,
      data: {
        id: foto.id,
        url: urlData.publicUrl,
      },
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Error inesperado al subir la foto' }
  }
}

/**
 * Delete a photo from an OT
 */
export async function deleteOTPhoto(
  fotoId: string,
  obraId: string,
  otId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Check user authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Get the photo record
  const { data: foto, error: fetchError } = await supabase
    .from('ot_fotos')
    .select('storage_path, subida_por')
    .eq('id', fotoId)
    .single()

  if (fetchError || !foto) {
    return { success: false, error: 'Foto no encontrada' }
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('ot-fotos')
    .remove([foto.storage_path])

  if (storageError) {
    console.error('Storage delete error:', storageError)
    // Continue anyway to delete the record
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('ot_fotos')
    .delete()
    .eq('id', fotoId)

  if (dbError) {
    console.error('Database delete error:', dbError)
    return { success: false, error: 'Error al eliminar la foto' }
  }

  revalidatePath(`/obras/${obraId}/ordenes-trabajo/${otId}`)

  return { success: true, data: undefined }
}

/**
 * Get all photos for an OT
 */
export async function getOTPhotos(otId: string): Promise<ActionResult<Array<{
  id: string
  url: string
  nombre_archivo: string
  descripcion: string | null
  tomada_en: string
  latitud: number | null
  longitud: number | null
  subida_por: { nombre: string } | null
}>>> {
  const supabase = await createClient()

  const { data: fotos, error } = await supabase
    .from('ot_fotos')
    .select(`
      id,
      storage_path,
      nombre_archivo,
      descripcion,
      tomada_en,
      latitud,
      longitud,
      usuarios!ot_fotos_subida_por_fkey (
        nombre
      )
    `)
    .eq('orden_trabajo_id', otId)
    .order('tomada_en', { ascending: false })

  if (error) {
    console.error('Error fetching photos:', error)
    return { success: false, error: 'Error al cargar las fotos' }
  }

  // Get public URLs for each photo
  const fotosWithUrls = fotos.map((foto) => {
    const { data: urlData } = supabase.storage
      .from('ot-fotos')
      .getPublicUrl(foto.storage_path)

    return {
      id: foto.id,
      url: urlData.publicUrl,
      nombre_archivo: foto.nombre_archivo,
      descripcion: foto.descripcion,
      tomada_en: foto.tomada_en,
      latitud: foto.latitud,
      longitud: foto.longitud,
      subida_por: foto.usuarios as { nombre: string } | null,
    }
  })

  return { success: true, data: fotosWithUrls }
}
