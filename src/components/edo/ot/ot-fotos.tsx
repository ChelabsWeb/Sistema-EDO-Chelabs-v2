'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { uploadOTPhoto, deleteOTPhoto } from '@/app/actions/ot-fotos'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fotos, setFotos] = useState(initialFotos)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null)
  const [descripcion, setDescripcion] = useState('')

  // Update fotos when initialFotos changes
  useEffect(() => {
    setFotos(initialFotos)
  }, [initialFotos])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imagenes')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar los 10MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(10)
    setError(null)

    try {
      // Get current location if available
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
        } catch {
          // Location not available, continue without it
          console.log('Location not available')
        }
      }

      setUploadProgress(30)

      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      setUploadProgress(50)

      // Get photo timestamp from EXIF or use current time
      const tomada_en = new Date().toISOString()

      // Upload photo
      const result = await uploadOTPhoto({
        orden_trabajo_id: otId,
        obra_id: obraId,
        file: {
          name: file.name,
          type: file.type,
          base64,
        },
        descripcion: descripcion || undefined,
        latitud,
        longitud,
        tomada_en,
      })

      setUploadProgress(90)

      if (result.success) {
        setDescripcion('')
        router.refresh()
        // Vibration feedback on success
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50])
        }
      } else {
        setError(result.error)
      }

      setUploadProgress(100)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Error al subir la imagen')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (fotoId: string) => {
    if (!confirm('Eliminar esta foto?')) return

    const result = await deleteOTPhoto(fotoId, obraId, otId)

    if (result.success) {
      setFotos(fotos.filter((f) => f.id !== fotoId))
      setSelectedFoto(null)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-UY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Fotos de Evidencia
          </h2>
          <span className="text-sm text-gray-500">{fotos.length} fotos</span>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Upload Section */}
        {canEdit && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripcion de la foto (opcional)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-input"
                />
                <label
                  htmlFor="photo-input"
                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Tomar Foto
                    </>
                  )}
                </label>
              </div>
            </div>
            {isUploading && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Photo Grid */}
        {fotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {fotos.map((foto) => (
              <div
                key={foto.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedFoto(foto)}
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={foto.url}
                    alt={foto.descripcion || foto.nombre_archivo}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                  <p className="text-xs text-white truncate">
                    {formatDate(foto.tomada_en)}
                  </p>
                </div>
                {foto.latitud && foto.longitud && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No hay fotos</p>
            {canEdit && (
              <p className="text-sm text-gray-400 mt-1">
                Toma fotos para documentar el avance del trabajo
              </p>
            )}
          </div>
        )}

        {/* Photo Modal */}
        {selectedFoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedFoto(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                onClick={() => setSelectedFoto(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <img
                src={selectedFoto.url}
                alt={selectedFoto.descripcion || selectedFoto.nombre_archivo}
                className="w-full max-h-[70vh] object-contain bg-gray-900"
              />

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    {selectedFoto.descripcion && (
                      <p className="text-gray-900 font-medium mb-1">
                        {selectedFoto.descripcion}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {formatDate(selectedFoto.tomada_en)}
                      {selectedFoto.subida_por && (
                        <span> - {selectedFoto.subida_por.nombre}</span>
                      )}
                    </p>
                    {selectedFoto.latitud && selectedFoto.longitud && (
                      <a
                        href={`https://maps.google.com/?q=${selectedFoto.latitud},${selectedFoto.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Ver ubicacion
                      </a>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(selectedFoto.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
