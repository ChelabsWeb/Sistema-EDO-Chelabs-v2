'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRequisicion } from '@/app/actions/requisiciones'
import type { Insumo } from '@/types/database'

interface RequisicionItem {
  insumo_id: string
  cantidad: number
  insumo: Insumo
}

interface RequisicionFormProps {
  otId: string
  obraId: string
  insumos: Insumo[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function RequisicionForm({ otId, obraId, insumos, onSuccess, onCancel }: RequisicionFormProps) {
  const router = useRouter()
  const [items, setItems] = useState<RequisicionItem[]>([])
  const [selectedInsumoId, setSelectedInsumoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [notas, setNotas] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter out already selected insumos
  const availableInsumos = insumos.filter(
    (insumo) => !items.some((item) => item.insumo_id === insumo.id)
  )

  const handleAddItem = () => {
    if (!selectedInsumoId || !cantidad) {
      setError('Seleccione un insumo y especifique la cantidad')
      return
    }

    const cantidadNum = parseFloat(cantidad)
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }

    const insumo = insumos.find((i) => i.id === selectedInsumoId)
    if (!insumo) return

    setItems([
      ...items,
      {
        insumo_id: selectedInsumoId,
        cantidad: cantidadNum,
        insumo,
      },
    ])
    setSelectedInsumoId('')
    setCantidad('')
    setError(null)
  }

  const handleRemoveItem = (insumoId: string) => {
    setItems(items.filter((item) => item.insumo_id !== insumoId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      setError('Debe agregar al menos un insumo')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createRequisicion({
      ot_id: otId,
      items: items.map((item) => ({
        insumo_id: item.insumo_id,
        cantidad: item.cantidad,
      })),
      notas: notas || undefined,
    })

    if (result.success) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      router.refresh()
      onSuccess?.()
    } else {
      setError(result.error)
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Add item section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Agregar Insumos</h3>

        <div className="flex gap-2">
          <div className="flex-1">
            <select
              value={selectedInsumoId}
              onChange={(e) => setSelectedInsumoId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione un insumo</option>
              {availableInsumos.map((insumo) => (
                <option key={insumo.id} value={insumo.id}>
                  {insumo.nombre} ({insumo.unidad})
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Cantidad"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            disabled={!selectedInsumoId || !cantidad}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>

        {availableInsumos.length === 0 && items.length === 0 && (
          <p className="text-sm text-gray-500">No hay insumos disponibles para esta obra</p>
        )}
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Items de la Requisicion ({items.length})
          </h3>
          <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
            {items.map((item) => (
              <div
                key={item.insumo_id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.insumo.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.cantidad} {item.insumo.unidad}
                    {item.insumo.tipo === 'material' ? ' - Material' : ' - Mano de Obra'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.insumo_id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Urgente para avanzar con la tarea..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creando...' : 'Crear Requisicion'}
        </button>
      </div>
    </form>
  )
}
