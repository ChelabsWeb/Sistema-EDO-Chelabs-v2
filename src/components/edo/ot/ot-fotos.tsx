'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadOTPhoto, deleteOTPhoto } from '@/app/actions/ot-fotos'
import { createClient } from '@/lib/supabase/client'
import { Camera, X, Trash2, MapPin, Clock, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center justify-between">
            <span className="text-sm font-semibold text-destructive">{error}</span>
            <Button variant="ghost" size="icon" onClick={() => setError(null)} className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/20">
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Upload Interface */}
        {canEdit && (
          <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Nota para esta foto (opcional)..."
                className="flex-1 bg-background"
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
              <Button
                asChild
                disabled={uploadMutation.isPending}
                className={cn("cursor-pointer shrink-0 font-bold uppercase tracking-wider text-xs", uploadMutation.isPending && "opacity-50")}
              >
                <label htmlFor="ot-photo-upload">
                  {uploadMutation.isPending ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Capturar
                </label>
              </Button>
            </div>
          </div>
        )}

        {/* Dynamic Gallery Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {fotos.length === 0 ? (
            <div className="col-span-full py-10 flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
              <Camera className="w-10 h-10 mb-3 text-muted-foreground opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sin evidencia fotográfica</p>
            </div>
          ) : (
            fotos.map((foto: Foto) => (
              <div
                key={foto.id}
                className={cn(
                  "group relative aspect-square rounded-xl overflow-hidden bg-muted border cursor-pointer hover:border-primary/50 transition-colors",
                  foto.id.startsWith('temp-') && "opacity-60 grayscale-[50%]"
                )}
                onClick={() => !foto.id.startsWith('temp-') && setSelectedFoto(foto)}
              >
                <img
                  src={foto.url}
                  alt={foto.descripcion || ""}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white font-medium truncate">{foto.descripcion || "Sin descripción"}</p>
                  <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest mt-0.5">{formatDate(foto.tomada_en)}</p>
                </div>

                {foto.latitud && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                )}

                {foto.id.startsWith('temp-') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!selectedFoto} onOpenChange={(open) => !open && setSelectedFoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-background">
          {selectedFoto && (
            <div className="flex flex-col">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{formatDate(selectedFoto.tomada_en)}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {selectedFoto.subida_por?.nombre || "Sistema"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-auto max-h-[60vh] flex items-center justify-center bg-black/5">
                <img
                  src={selectedFoto.url}
                  className="max-w-full max-h-full object-contain"
                  alt="Full view"
                />
              </div>

              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-background">
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">
                    {selectedFoto.descripcion || "Sin descripción extra"}
                  </p>
                  {selectedFoto.latitud && (
                    <a
                      href={`https://maps.google.com/?q=${selectedFoto.latitud},${selectedFoto.longitud}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Ver ubicación en mapa
                    </a>
                  )}
                </div>
                {canEdit && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedFoto.id)}
                    disabled={deleteMutation.isPending}
                    className="shrink-0 text-xs font-bold uppercase tracking-wider"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar Foto'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
