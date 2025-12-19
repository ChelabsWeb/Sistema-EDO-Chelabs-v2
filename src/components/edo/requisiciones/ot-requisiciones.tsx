'use client'

import { useState } from 'react'
import { RequisicionForm } from './requisicion-form'
import { RequisicionesList } from './requisiciones-list'
import type { Insumo, RequisicionWithRelations } from '@/types/database'

interface OTRequisicionesProps {
  otId: string
  obraId: string
  requisiciones: RequisicionWithRelations[]
  insumos: Insumo[]
  canCreate: boolean
  canCancel: boolean
}

export function OTRequisiciones({
  otId,
  obraId,
  requisiciones,
  insumos,
  canCreate,
  canCancel,
}: OTRequisicionesProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Requisiciones de Materiales</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {requisiciones.length} requisicion{requisiciones.length !== 1 ? 'es' : ''}
            </p>
          </div>
          {canCreate && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Requisicion
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showForm ? (
          <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Nueva Requisicion</h3>
            <RequisicionForm
              otId={otId}
              obraId={obraId}
              insumos={insumos}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : null}

        <RequisicionesList requisiciones={requisiciones} canCancel={canCancel} />
      </div>
    </div>
  )
}
