'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createRubro } from '@/app/actions/rubros'
import { getObra } from '@/app/actions/obras'
import { getPlantillasRubros, applyPlantillaToObra } from '@/app/actions/plantillas'
import { UNIDADES_RUBRO } from '@/lib/constants/rubros-predefinidos'
import type { PlantillaRubroWithDetails } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

type CreationMode = 'select' | 'template' | 'manual'

export default function NuevoRubroPage({ params }: Props) {
  const router = useRouter()
  const [obraId, setObraId] = useState<string | null>(null)
  const [obraNombre, setObraNombre] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mode selection
  const [mode, setMode] = useState<CreationMode>('select')

  // Plantillas
  const [plantillas, setPlantillas] = useState<PlantillaRubroWithDetails[]>([])
  const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaRubroWithDetails | null>(null)

  // Form data (for both modes)
  const [formData, setFormData] = useState({
    nombre: '',
    unidad: 'm2',
    presupuesto_ur: '',
  })

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params
      setObraId(resolvedParams.id)

      const [obraResult, plantillasResult] = await Promise.all([
        getObra(resolvedParams.id),
        getPlantillasRubros()
      ])

      if (obraResult.success) {
        setObraNombre(obraResult.data.nombre)
      }

      if (plantillasResult.success && plantillasResult.data) {
        setPlantillas(plantillasResult.data)
      }

      setLoading(false)
    }

    loadData()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectPlantilla = (plantilla: PlantillaRubroWithDetails) => {
    setSelectedPlantilla(plantilla)
    setFormData({
      nombre: plantilla.nombre,
      unidad: plantilla.unidad,
      presupuesto_ur: '',
    })
  }

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obraId) return

    setSaving(true)
    setError(null)

    const result = await createRubro({
      obra_id: obraId,
      nombre: formData.nombre,
      unidad: formData.unidad,
      presupuesto_ur: parseFloat(formData.presupuesto_ur) || 0,
    })

    if (!result.success) {
      setError(result.error)
      setSaving(false)
      return
    }

    router.push(`/obras/${obraId}`)
  }

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obraId || !selectedPlantilla) return

    setSaving(true)
    setError(null)

    const presupuestoUr = parseFloat(formData.presupuesto_ur) || 0

    const result = await applyPlantillaToObra(
      selectedPlantilla.id,
      obraId,
      0, // presupuesto en pesos (se calcula desde UR)
      presupuestoUr
    )

    if (!result.success) {
      setError(result.error || 'Error al crear el rubro')
      setSaving(false)
      return
    }

    router.push(`/obras/${obraId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  // Selection mode
  if (mode === 'select') {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <Link href={`/obras/${obraId}`} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nuevo Rubro</h1>
              <p className="text-sm text-gray-500">{obraNombre}</p>
            </div>
          </div>
        </header>

        {/* Selection Options */}
        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Template Option */}
            <button
              onClick={() => setMode('template')}
              className="bg-white shadow rounded-lg p-6 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Usar Plantilla</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Selecciona una plantilla predefinida con insumos ya configurados.
                    Los insumos se copiaran automaticamente al catalogo de la obra.
                  </p>
                  <div className="mt-3 text-sm text-purple-600 font-medium">
                    {plantillas.length} plantillas disponibles
                  </div>
                </div>
              </div>
            </button>

            {/* Manual Option */}
            <button
              onClick={() => setMode('manual')}
              className="bg-white shadow rounded-lg p-6 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Crear desde Cero</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Define un rubro personalizado sin plantilla.
                    Podras agregar insumos manualmente despues.
                  </p>
                  <div className="mt-3 text-sm text-blue-600 font-medium">
                    Configuracion manual
                  </div>
                </div>
              </div>
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Template selection mode
  if (mode === 'template') {
    const plantillasSistema = plantillas.filter(p => p.es_sistema)
    const plantillasPersonales = plantillas.filter(p => !p.es_sistema)

    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <button onClick={() => selectedPlantilla ? setSelectedPlantilla(null) : setMode('select')} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {selectedPlantilla ? 'Configurar Rubro' : 'Seleccionar Plantilla'}
              </h1>
              <p className="text-sm text-gray-500">{obraNombre}</p>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {!selectedPlantilla ? (
            // Plantilla selection
            <div className="space-y-8">
              {/* System Templates */}
              {plantillasSistema.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Plantillas del Sistema
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {plantillasSistema.map((plantilla) => (
                      <button
                        key={plantilla.id}
                        onClick={() => handleSelectPlantilla(plantilla)}
                        className="bg-white shadow rounded-lg p-4 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{plantilla.nombre}</h3>
                            <p className="text-sm text-gray-500">Unidad: {plantilla.unidad}</p>
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            Sistema
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {plantilla.insumos?.length || 0} insumos incluidos
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Templates */}
              {plantillasPersonales.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mis Plantillas
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {plantillasPersonales.map((plantilla) => (
                      <button
                        key={plantilla.id}
                        onClick={() => handleSelectPlantilla(plantilla)}
                        className="bg-white shadow rounded-lg p-4 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{plantilla.nombre}</h3>
                            <p className="text-sm text-gray-500">Unidad: {plantilla.unidad}</p>
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Personal
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {plantilla.insumos?.length || 0} insumos incluidos
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {plantillas.length === 0 && (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <p className="text-gray-500">No hay plantillas disponibles</p>
                  <button
                    onClick={() => setMode('manual')}
                    className="text-blue-600 hover:text-blue-700 font-medium mt-2"
                  >
                    Crear rubro manualmente
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Configure rubro from template
            <form onSubmit={handleSubmitTemplate} className="bg-white shadow rounded-lg p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Selected Template Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-purple-900">{selectedPlantilla.nombre}</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      {selectedPlantilla.insumos?.length || 0} insumos se agregaran al catalogo de la obra
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedPlantilla.es_sistema
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedPlantilla.es_sistema ? 'Sistema' : 'Personal'}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre del Rubro
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">El nombre viene de la plantilla</p>
              </div>

              <div>
                <label htmlFor="unidad" className="block text-sm font-medium text-gray-700">
                  Unidad de Medida
                </label>
                <input
                  type="text"
                  id="unidad"
                  value={formData.unidad}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="presupuesto_ur" className="block text-sm font-medium text-gray-700">
                  Presupuesto (UR) *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    id="presupuesto_ur"
                    name="presupuesto_ur"
                    required
                    value={formData.presupuesto_ur}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">
                    UR
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Ingrese el presupuesto en Unidades Reajustables
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedPlantilla(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cambiar Plantilla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creando...' : 'Crear Rubro desde Plantilla'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    )
  }

  // Manual creation mode
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <button onClick={() => setMode('select')} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Nuevo Rubro Personalizado</h1>
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">manual</span>
            </div>
            <p className="text-sm text-gray-500">{obraNombre}</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmitManual} className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre del Rubro *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Albanileria, Sanitaria, Electrica"
            />
          </div>

          <div>
            <label htmlFor="unidad" className="block text-sm font-medium text-gray-700">
              Unidad de Medida *
            </label>
            <select
              id="unidad"
              name="unidad"
              value={formData.unidad}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {UNIDADES_RUBRO.map((unidad) => (
                <option key={unidad.value} value={unidad.value}>
                  {unidad.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="presupuesto_ur" className="block text-sm font-medium text-gray-700">
              Presupuesto (UR) *
            </label>
            <div className="mt-1 relative">
              <input
                type="number"
                id="presupuesto_ur"
                name="presupuesto_ur"
                required
                value={formData.presupuesto_ur}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">
                UR
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Ingrese el presupuesto en Unidades Reajustables
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setMode('select')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Crear Rubro'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
