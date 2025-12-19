'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveOT, startOTExecution, closeOT, deleteOT } from '@/app/actions/ordenes-trabajo'
import { formatPesos } from '@/lib/utils/currency'
import type { OTStatus } from '@/types/database'

interface OTActionsProps {
  otId: string
  obraId: string
  estado: OTStatus | string
  canApprove: boolean
  canExecute: boolean
  costoEstimado: number
  costoReal: number
}

export function OTActions({
  otId,
  obraId,
  estado,
  canApprove,
  canExecute,
  costoEstimado,
  costoReal,
}: OTActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState<'approve' | 'start' | 'close' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [acknowledgeDeviation, setAcknowledgeDeviation] = useState(false)

  const desvio = costoReal - costoEstimado
  const hasDeviation = desvio > 0
  const desvioPercent = costoEstimado > 0 ? (desvio / costoEstimado) * 100 : 0

  const handleApprove = async () => {
    setIsLoading(true)
    setError(null)

    const result = await approveOT({
      id: otId,
      acknowledge_budget_exceeded: true,
    })

    if (result.success) {
      setShowConfirmModal(null)
      router.refresh()
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const handleStart = async () => {
    setIsLoading(true)
    setError(null)

    const result = await startOTExecution(otId)

    if (result.success) {
      setShowConfirmModal(null)
      router.refresh()
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const handleClose = async () => {
    setIsLoading(true)
    setError(null)

    const result = await closeOT({
      id: otId,
      acknowledge_deviation: acknowledgeDeviation || !hasDeviation,
    })

    if (result.success) {
      setShowConfirmModal(null)
      router.refresh()
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    const result = await deleteOT(otId)

    if (result.success) {
      router.push(`/obras/${obraId}/ordenes-trabajo`)
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Approve - only for borrador and DO */}
        {estado === 'borrador' && canApprove && (
          <button
            onClick={() => setShowConfirmModal('approve')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Aprobar
          </button>
        )}

        {/* Start Execution - only for aprobada */}
        {estado === 'aprobada' && canExecute && (
          <button
            onClick={() => setShowConfirmModal('start')}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
          >
            Iniciar Ejecución
          </button>
        )}

        {/* Close - only for en_ejecucion */}
        {estado === 'en_ejecucion' && canExecute && (
          <button
            onClick={() => setShowConfirmModal('close')}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Cerrar OT
          </button>
        )}

        {/* Delete - available for all states, DO only */}
        {canApprove && (
          <button
            onClick={() => setShowConfirmModal('delete')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
          >
            Eliminar
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              {showConfirmModal === 'approve' && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aprobar Orden de Trabajo</h3>
                  <p className="text-gray-600 mb-4">
                    Al aprobar esta OT, se comprometerá el presupuesto del rubro y el Jefe de Obra podrá iniciar su ejecución.
                  </p>
                  <div className="bg-blue-50 rounded-md p-3 mb-4">
                    <div className="text-sm text-gray-600">Costo Estimado</div>
                    <div className="text-lg font-semibold text-blue-600">{formatPesos(costoEstimado)}</div>
                  </div>
                </>
              )}

              {showConfirmModal === 'start' && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Iniciar Ejecución</h3>
                  <p className="text-gray-600 mb-4">
                    Al iniciar la ejecución, podrá registrar tareas, consumos y avances en esta OT.
                  </p>
                </>
              )}

              {showConfirmModal === 'close' && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cerrar Orden de Trabajo</h3>
                  <p className="text-gray-600 mb-4">
                    Al cerrar esta OT, se calcularán los costos finales y ya no se podrán registrar más cambios.
                  </p>
                  {hasDeviation && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-yellow-800">Desvío detectado</div>
                          <div className="text-sm text-yellow-700">
                            Esta OT tiene un desvío de <strong>{formatPesos(desvio)}</strong>
                            <span className="ml-1">({desvioPercent > 0 ? '+' : ''}{desvioPercent.toFixed(1)}%)</span>
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 mt-3">
                        <input
                          type="checkbox"
                          checked={acknowledgeDeviation}
                          onChange={(e) => setAcknowledgeDeviation(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Reconozco el desvío y deseo cerrar la OT
                        </span>
                      </label>
                    </div>
                  )}
                </>
              )}

              {showConfirmModal === 'delete' && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Orden de Trabajo</h3>
                  <p className="text-gray-600 mb-4">
                    La OT será movida a la papelera. Puede restaurarla desde allí si es necesario.
                  </p>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(null)
                    setError(null)
                    setAcknowledgeDeviation(false)
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={
                    showConfirmModal === 'approve' ? handleApprove :
                    showConfirmModal === 'start' ? handleStart :
                    showConfirmModal === 'close' ? handleClose :
                    handleDelete
                  }
                  disabled={isLoading || (showConfirmModal === 'close' && hasDeviation && !acknowledgeDeviation)}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${
                    showConfirmModal === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                    showConfirmModal === 'approve' ? 'bg-blue-600 hover:bg-blue-700' :
                    showConfirmModal === 'start' ? 'bg-yellow-600 hover:bg-yellow-700' :
                    'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Procesando...
                    </>
                  ) : (
                    showConfirmModal === 'approve' ? 'Aprobar' :
                    showConfirmModal === 'start' ? 'Iniciar' :
                    showConfirmModal === 'close' ? 'Cerrar' :
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
