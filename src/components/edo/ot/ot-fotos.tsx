'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadOTPhoto, deleteOTPhoto } from '@/app/actions/ot-fotos'
import { createClient } from '@/lib/supabase/client'
import { Camera, X, Trash2, MapPin, Maximize2, Plus, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Foto {
  id: string
  url: string
  nombre_archivo: string
  descripcion: string | null
  tomada_en: string
  latitud: number | null
  longitud: number | null
  subida_por: { nombre: string } | null
}

interface OTFotosProps {
  otId: string
  obraId: string
  fotos: Foto[]
  canEdit: boolean
}

export function OTFotos({ otId, obraId, fotos: initialFotos, canEdit }: OTFotosProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null)
  const [descripcion, setDescripcion] = useState('')

  const { data: fotos = [] } = useQuery({
    queryKey: ['fotos', otId],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('ot_fotos')
        .select(`
          id, storage_path, nombre_archivo, descripcion, tomada_en, latitud, longitud,
          subida_por:usuarios!ot_fotos_subida_por_fkey(nombre)
        `)
        .eq('orden_trabajo_id', otId)
        .order('tomada_en', { ascending: false })

      return (data || []).map((foto: any) => ({
        id: foto.id,
        url: supabase.storage.from('ot-fotos').getPublicUrl(foto.storage_path).data.publicUrl,
        nombre_archivo: foto.nombre_archivo,
        descripcion: foto.descripcion,
        tomada_en: foto.tomada_en,
        latitud: foto.latitud,
        longitud: foto.longitud,
        subida_por: Array.isArray(foto.subida_por) ? foto.subida_por[0] : foto.subida_por,
      })) as Foto[]
    },
    initialData: initialFotos,
  })

  const uploadMutation = useMutation({
    mutationFn: async (payload: any) => {
      const result = await uploadOTPhoto(payload)
      if (!result.success) throw new Error(result.error)
      return result
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['fotos', otId] })
      const previousFotos = queryClient.getQueryData<Foto[]>(['fotos', otId])
      const optimisticFoto: Foto = {
        id: `temp-${Date.now()}`,
        url: payload.file.base64,
        nombre_archivo: payload.file.name,
        descripcion: payload.descripcion || null,
        tomada_en: payload.tomada_en,
        latitud: payload.latitud || null,
        longitud: payload.longitud || null,
        subida_por: { nombre: 'Subiendo...' },
      }
      queryClient.setQueryData<Foto[]>(['fotos', otId], old => [optimisticFoto, ...(old || [])])
      return { previousFotos }
    },
    onError: (err, variables, context) => {
      if (context?.previousFotos) queryClient.setQueryData(['fotos', otId], context.previousFotos)
      setError(err.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['fotos', otId] })
      setDescripcion('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (fotoId: string) => {
      const result = await deleteOTPhoto(fotoId, obraId, otId)
      if (!result.success) throw new Error(result.error)
      return fotoId
    },
    onMutate: async (fotoId) => {
      await queryClient.cancelQueries({ queryKey: ['fotos', otId] })
      const previousFotos = queryClient.getQueryData<Foto[]>(['fotos', otId])
      queryClient.setQueryData<Foto[]>(['fotos', otId], old => old?.filter(f => f.id !== fotoId))
      setSelectedFoto(null)
      return { previousFotos }
    },
    onError: (err, variables, context) => {
      if (context?.previousFotos) queryClient.setQueryData(['fotos', otId], context.previousFotos)
      setError(err.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['fotos', otId] })
      router.refresh()
    }
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar los 10MB')
      return
    }

    setError(null)

    try {
      let latitud: number | undefined
      let longitud: number | undefined

      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
            })
          })
          latitud = position.coords.latitude
          longitud = position.coords.longitude
        } catch (e) {
          console.log('Location not available')
        }
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      uploadMutation.mutate({
        orden_trabajo_id: otId,
        obra_id: obraId,
        file: { name: file.name, type: file.type, base64 },
        descripcion: descripcion || undefined,
        latitud,
        longitud,
        tomada_en: new Date().toISOString(),
      })

      if ('vibrate' in navigator) navigator.vibrate([50, 50, 50])

    } catch (err) {
      setError('Error al procesar la imagen')
    }
  }

  const handleDelete = (fotoId: string) => {
    if (!confirm('¿Eliminar esta foto?')) return
    deleteMutation.mutate(fotoId)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-UY', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-apple-gray-50">
      <div className="p-8 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium animate-apple-fade-in flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)} className="text-red-500/50 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Interface */}
        {canEdit && (
          <div className="p-6 bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-[32px] border border-apple-gray-100 dark:border-white/[0.05] space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Nota para esta foto..."
                className="flex-1 bg-white dark:bg-black px-5 py-3 rounded-2xl border border-apple-gray-100 dark:border-white/10 outline-none text-sm font-medium focus:ring-2 focus:ring-apple-blue/20 transition-all"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                id="ot-photo-upload"
              />
              <label
                htmlFor="ot-photo-upload"
                className={cn(
                  "h-12 px-6 rounded-2xl bg-apple-blue text-white flex items-center justify-center gap-2 text-sm font-bold tracking-tight cursor-pointer hover:bg-apple-blue-dark transition-all active:scale-95 shadow-apple-blue/20",
                  uploadMutation.isPending && "opacity-50 cursor-not-allowed"
                )}
              >
                {uploadMutation.isPending ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Capturar
                  </>
                )}
              </label>
            </div>
          </div>
        )}

        {/* Dynamic Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotos.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-30">
              <Camera className="w-16 h-16 mb-4" />
              <p className="text-sm font-bold tracking-tight text-center">Sin evidencia fotográfica</p>
            </div>
          ) : (
            fotos.map((foto: Foto) => (
              <div
                key={foto.id}
                className={cn(
                  "group relative aspect-square rounded-[24px] overflow-hidden bg-apple-gray-50 dark:bg-white/5 border border-apple-gray-100 dark:border-white/[0.05] cursor-zoom-in hover:shadow-apple-float transition-all duration-500",
                  foto.id.startsWith('temp-') && "opacity-60 grayscale-[50%]"
                )}
                onClick={() => !foto.id.startsWith('temp-') && setSelectedFoto(foto)}
              >
                <img
                  src={foto.url}
                  alt={foto.descripcion || ""}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[10px] text-white/90 font-medium truncate">{foto.descripcion || "Sin descripción"}</p>
                  <p className="text-[9px] text-white/60 font-black uppercase tracking-widest mt-1">{formatDate(foto.tomada_en)}</p>
                </div>

                {foto.latitud && (
                  <div className="absolute top-3 right-3 w-8 h-8 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapPin className="w-3.5 h-3.5 text-apple-blue" />
                  </div>
                )}

                {foto.id.startsWith('temp-') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!selectedFoto} onOpenChange={(open) => !open && setSelectedFoto(null)}>
        <DialogContent className="max-w-5xl bg-white dark:bg-apple-gray-50 flex flex-col p-0 overflow-hidden rounded-[40px] shadow-2xl gap-0 border-none">
          {selectedFoto && (
            <>
              <div className="p-4 flex flex-row items-center justify-between border-b border-apple-gray-100 dark:border-white/10 m-0 pr-16 bg-white dark:bg-apple-gray-50 z-10 w-full relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                    <Clock className="w-4 h-4 text-apple-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{formatDate(selectedFoto.tomada_en)}</p>
                    <p className="text-[10px] text-apple-gray-400 font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {selectedFoto.subida_por?.nombre || "Sistema"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-auto max-h-[70vh] flex items-center justify-center bg-black/5 flex-shrink overflow-hidden">
                <img
                  src={selectedFoto.url}
                  className="max-w-full max-h-full object-contain"
                  alt="Full view"
                />
              </div>

              <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-xl font-bold text-foreground tracking-tight">
                    {selectedFoto.descripcion || "Nota de Obra"}
                  </p>
                  {selectedFoto.latitud && (
                    <a
                      href={`https://maps.google.com/?q=${selectedFoto.latitud},${selectedFoto.longitud}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-apple-blue hover:underline"
                    >
                      <MapPin className="w-4 h-4" />
                      Ver ubicación en mapa
                    </a>
                  )}
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(selectedFoto.id)}
                    disabled={deleteMutation.isPending}
                    className="px-6 py-3 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteMutation.isPending ? 'Procesando...' : 'Eliminar evidencia'}
                  </button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
