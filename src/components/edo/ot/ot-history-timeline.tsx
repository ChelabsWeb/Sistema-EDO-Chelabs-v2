'use client'

import { OTStatusIcon } from './ot-status-badge'
import type { OTStatus } from '@/types/database'

interface HistorialItem {
  id: string
  estado_anterior: OTStatus | null
  estado_nuevo: OTStatus
  usuario_id: string
  notas: string | null
  acknowledged_by: string | null
  acknowledged_at: string | null
  created_at: string
  usuarios: { id: string; nombre: string } | null
  acknowledged_usuario?: { id: string; nombre: string } | null
}

interface OTHistoryTimelineProps {
  historial: HistorialItem[]
}

const statusLabels: Record<OTStatus, string> = {
  borrador: 'Borrador',
  aprobada: 'Aprobada',
  en_ejecucion: 'En Ejecución',
  cerrada: 'Cerrada',
}

export function OTHistoryTimeline({ historial }: OTHistoryTimelineProps) {
  if (historial.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial</h2>
        <p className="text-sm text-gray-500 text-center py-4">Sin historial disponible</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial</h2>
      <div className="flow-root">
        <ul className="-mb-8">
          {historial.map((item, idx) => (
            <li key={item.id}>
              <div className="relative pb-8">
                {idx !== historial.length - 1 && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 ring-8 ring-white">
                      <OTStatusIcon estado={item.estado_nuevo} />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">
                        {item.estado_anterior
                          ? `${statusLabels[item.estado_anterior]} → ${statusLabels[item.estado_nuevo]}`
                          : `Creada como ${statusLabels[item.estado_nuevo]}`}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {item.usuarios?.nombre || 'Usuario desconocido'} ·{' '}
                      {new Date(item.created_at).toLocaleDateString('es-UY', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {item.notas && (
                      <p className="mt-1 text-sm text-gray-600">{item.notas}</p>
                    )}
                    {item.acknowledged_by && (
                      <div className="mt-1 inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Desvío reconocido por {item.acknowledged_usuario?.nombre || 'DO'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
