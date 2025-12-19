'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getObra, updateObra, archiveObra, changeObraStatus } from '@/app/actions/obras'
import type { Obra, ObraEstado } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditarObraPage({ params }: Props) {
  const router = useRouter()
  const [id, setId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    cooperativa: '',
    presupuesto_total: '',
    fecha_inicio: '',
    fecha_fin_estimada: '',
    estado: 'activa' as ObraEstado,
  })

  useEffect(() => {
    async function loadObra() {
      const resolvedParams = await params
      setId(resolvedParams.id)

      const result = await getObra(resolvedParams.id)
      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      const obra = result.data
      setFormData({
        nombre: obra.nombre,
        direccion: obra.direccion || '',
        cooperativa: obra.cooperativa || '',
        presupuesto_total: obra.presupuesto_total?.toString() || '',
        fecha_inicio: obra.fecha_inicio || '',
        fecha_fin_estimada: obra.fecha_fin_estimada || '',
        estado: obra.estado || 'activa',
      })
      setLoading(false)
    }

    loadObra()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    const result = await updateObra({
      id,
      nombre: formData.nombre,
      direccion: formData.direccion || null,
      cooperativa: formData.cooperativa || null,
      presupuesto_total: formData.presupuesto_total ? parseFloat(formData.presupuesto_total) : null,
      fecha_inicio: formData.fecha_inicio || null,
      fecha_fin_estimada: formData.fecha_fin_estimada || null,
      estado: formData.estado,
    })

    if (!result.success) {
      setError(result.error)
      setSaving(false)
      return
    }

    setSuccess('Obra actualizada correctamente')
    setSaving(false)
  }

  const handleArchive = async () => {
    if (!id) return
    if (!confirm('Esta accion archivara la obra. Queres continuar?')) return

    setSaving(true)
    setError(null)

    const result = await archiveObra(id)

    if (!result.success) {
      setError(result.error)
      setSaving(false)
      return
    }

    router.push('/obras')
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
          <Link href={`/obras/${id}`} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Editar Obra</h1>
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

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre de la Obra *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="cooperativa" className="block text-sm font-medium text-gray-700">
              Cooperativa
            </label>
            <input
              type="text"
              id="cooperativa"
              name="cooperativa"
              value={formData.cooperativa}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
              Direccion
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="presupuesto_total" className="block text-sm font-medium text-gray-700">
              Presupuesto Total (UYU)
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                type="number"
                id="presupuesto_total"
                name="presupuesto_total"
                value={formData.presupuesto_total}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="fecha_inicio"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="fecha_fin_estimada" className="block text-sm font-medium text-gray-700">
                Fecha Fin Estimada
              </label>
              <input
                type="date"
                id="fecha_fin_estimada"
                name="fecha_fin_estimada"
                value={formData.fecha_fin_estimada}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="activa">Activa</option>
              <option value="pausada">Pausada</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleArchive}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
            >
              Archivar Obra
            </button>

            <div className="flex gap-4">
              <Link
                href={`/obras/${id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
