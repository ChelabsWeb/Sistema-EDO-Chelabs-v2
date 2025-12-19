'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RequisicionEstadoBadge } from './requisicion-estado-badge'
import { cancelRequisicion } from '@/app/actions/requisiciones'
import type { RequisicionWithRelations } from '@/types/database'

interface RequisicionesListProps {
  requisiciones: RequisicionWithRelations[]
  canCancel: boolean
}

export function RequisicionesList({ requisiciones, canCancel }: RequisicionesListProps) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async (id: string) => {
    if (!confirm('Esta seguro que desea cancelar esta requisicion?')) return

    setIsLoading(true)
    setError(null)

    const result = await cancelRequisicion(id)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (requisiciones.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="w-12 h-12 text-gray-300 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500 text-sm">No hay requisiciones para esta OT</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {requisiciones.map((req) => (
        <div
          key={req.id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div
            className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100"
            onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
          >
            <div className="flex items-center gap-3">
              <RequisicionEstadoBadge estado={req.estado as 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'} size="sm" />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {req.items?.length || 0} insumo{(req.items?.length || 0) !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatDate(req.created_at)}
                </span>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedId === req.id ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Expanded content */}
          {expandedId === req.id && (
            <div className="px-4 py-3 border-t border-gray-200">
              {/* Items list */}
              <div className="space-y-2 mb-4">
                {req.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-700">
                      {item.insumo?.nombre || 'Insumo desconocido'}
                    </span>
                    <span className="text-gray-500">
                      {item.cantidad} {item.insumo?.unidad || ''}
                    </span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {req.notas && (
                <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  <span className="font-medium">Notas:</span> {req.notas}
                </div>
              )}

              {/* Creator info */}
              <div className="text-xs text-gray-500 mb-3">
                Creado por: {req.creador?.nombre || 'Usuario desconocido'}
              </div>

              {/* Actions */}
              {canCancel && req.estado === 'pendiente' && (
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCancel(req.id)
                    }}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                  >
                    {isLoading ? 'Cancelando...' : 'Cancelar Requisicion'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
