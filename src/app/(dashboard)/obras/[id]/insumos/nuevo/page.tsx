'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createInsumo } from '@/app/actions/insumos'
import { getObra } from '@/app/actions/obras'

interface Props {
  params: Promise<{ id: string }>
}

export default function NuevoInsumoPage({ params }: Props) {
  const router = useRouter()
  const [obraId, setObraId] = useState<string | null>(null)
  const [obraNombre, setObraNombre] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    unidad: 'unidad',
    tipo: 'material' as 'material' | 'mano_de_obra',
    precio_referencia: '',
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

    const result = await createInsumo({
      obra_id: obraId,
      nombre: formData.nombre,
      unidad: formData.unidad,
      tipo: formData.tipo,
      precio_referencia: formData.precio_referencia ? parseFloat(formData.precio_referencia) : null,
    })

    if (!result.success) {
      setError(result.error)
      setSaving(false)
      return
    }

    router.push(`/obras/${obraId}/insumos`)
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
          <Link href={`/obras/${obraId}/insumos`} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nuevo Insumo</h1>
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
              Nombre del Insumo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Cemento Portland, Arena, Oficial Albanil"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo (kg)</option>
                <option value="lt">Litro (lt)</option>
                <option value="m2">Metro cuadrado (m2)</option>
                <option value="m3">Metro cubico (m3)</option>
                <option value="ml">Metro lineal (ml)</option>
                <option value="bolsa">Bolsa</option>
                <option value="hr">Hora (hr)</option>
                <option value="jornal">Jornal</option>
              </select>
            </div>

            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                Tipo *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="material">Material</option>
                <option value="mano_de_obra">Mano de Obra</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="precio_referencia" className="block text-sm font-medium text-gray-700">
              Precio de Referencia (UYU)
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                type="number"
                id="precio_referencia"
                name="precio_referencia"
                value={formData.precio_referencia}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Precio de referencia por unidad. Se usa para estimar costos.
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link
              href={`/obras/${obraId}/insumos`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Crear Insumo'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
