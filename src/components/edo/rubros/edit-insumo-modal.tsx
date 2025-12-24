'use client'

import { useState } from 'react'
import type { Insumo } from '@/types/database'
import { updateInsumo } from '@/app/actions/rubro-insumos'

interface EditInsumoModalProps {
  insumo: Insumo
  onClose: () => void
  onSaved: () => void
}

export function EditInsumoModal({ insumo, onClose, onSaved }: EditInsumoModalProps) {
  const [nombre, setNombre] = useState(insumo.nombre)
  const [unidad, setUnidad] = useState(insumo.unidad)
  const [precioUnitario, setPrecioUnitario] = useState(
    String(insumo.precio_unitario || insumo.precio_referencia || 0)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (!unidad.trim()) {
      setError('La unidad es requerida')
      return
    }

    const precio = parseFloat(precioUnitario)
    if (isNaN(precio) || precio < 0) {
      setError('El precio debe ser un numero positivo')
      return
    }

    setSaving(true)
    const result = await updateInsumo(insumo.id, {
      nombre: nombre.trim(),
      unidad: unidad.trim(),
      precio_unitario: precio,
      precio_referencia: precio
    })
    setSaving(false)

    if (!result.success) {
      setError(result.error || 'Error al guardar')
      return
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Editar Insumo</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Unidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad
              </label>
              <input
                type="text"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ej: kg, m2, unidad, hora"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario ($)
              </label>
              <input
                type="number"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            {/* Tipo (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                {insumo.tipo === 'material' ? (
                  <>
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Material</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Mano de Obra</span>
                  </>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
