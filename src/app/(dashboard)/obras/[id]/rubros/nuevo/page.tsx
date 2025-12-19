'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createRubro } from '@/app/actions/rubros'
import { getObra } from '@/app/actions/obras'
import { UNIDADES_RUBRO } from '@/lib/constants/rubros-predefinidos'

interface Props {
  params: Promise<{ id: string }>
}

export default function NuevoRubroPage({ params }: Props) {
  const router = useRouter()
  const [obraId, setObraId] = useState<string | null>(null)
  const [obraNombre, setObraNombre] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    unidad: 'm2',
    presupuesto_ur: '',
  })

  useEffect(() => {
    async function loadObra() {
      const resolvedParams = await params
      setObraId(resolvedParams.id)

      const result = await getObra(resolvedParams.id)
      if (result.success) {
        setObraNombre(result.data.nombre)
      }
      setLoading(false)
    }

    loadObra()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Nuevo Rubro Personalizado</h1>
              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">personalizado</span>
            </div>
            <p className="text-sm text-gray-500">{obraNombre}</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
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
            <Link
              href={`/obras/${obraId}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </Link>
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
