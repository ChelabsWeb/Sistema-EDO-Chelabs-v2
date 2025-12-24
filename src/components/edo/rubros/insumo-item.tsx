'use client'

import type { Insumo } from '@/types/database'

interface InsumoItemProps {
  insumo: Insumo
  canEdit: boolean
  onEdit: () => void
  onRemove: () => void
  isRemoving?: boolean
}

export function InsumoItem({ insumo, canEdit, onEdit, onRemove, isRemoving }: InsumoItemProps) {
  const isMaterial = insumo.tipo === 'material'

  const formatPrice = (price: number | null) => {
    if (!price) return '-'
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
      <div className="flex items-center gap-3">
        {/* Tipo Icon */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isMaterial ? 'bg-blue-100' : 'bg-green-100'
          }`}
        >
          {isMaterial ? (
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>

        {/* Insumo Info */}
        <div>
          <p className="text-sm font-medium text-gray-900">{insumo.nombre}</p>
          <p className="text-xs text-gray-500">
            {insumo.unidad} | {formatPrice(insumo.precio_unitario || insumo.precio_referencia)}
          </p>
        </div>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Editar insumo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            disabled={isRemoving}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Quitar del rubro"
          >
            {isRemoving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
