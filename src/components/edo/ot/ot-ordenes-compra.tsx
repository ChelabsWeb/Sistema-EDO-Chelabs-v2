'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import type { OrdenCompraWithRelations, Insumo } from '@/types/database'
import { CreateOCFromOTModal } from './create-oc-from-ot-modal'

interface Props {
  otId: string
  obraId: string
  ordenesCompra: OrdenCompraWithRelations[]
  insumos: Insumo[]
  canCreate: boolean
}

const estadoColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  enviada: 'bg-blue-100 text-blue-800',
  recibida_parcial: 'bg-orange-100 text-orange-800',
  recibida_completa: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
}

const estadoLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  enviada: 'Enviada',
  recibida_parcial: 'Recibida Parcial',
  recibida_completa: 'Recibida',
  cancelada: 'Cancelada',
}

export function OTOrdenesCompra({ otId, obraId, ordenesCompra, insumos, canCreate }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Órdenes de Compra</h2>
        {canCreate && insumos.length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva OC
          </button>
        )}
      </div>

      <div className="p-6">
        {ordenesCompra.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No hay órdenes de compra para esta OT</p>
            {canCreate && insumos.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Crear primera orden de compra
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {ordenesCompra.map((oc) => (
              <Link
                key={oc.id}
                href={`/compras/ordenes-compra/${oc.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">OC-{oc.numero}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${estadoColors[oc.estado || 'pendiente']}`}>
                        {estadoLabels[oc.estado || 'pendiente']}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Proveedor: {oc.proveedor || 'Sin especificar'}
                    </p>
                    {oc.lineas && oc.lineas.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {oc.lineas.length} {oc.lineas.length === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatPesos(oc.total)}</div>
                    {oc.fecha_emision && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(oc.fecha_emision).toLocaleDateString('es-UY')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateOCFromOTModal
          otId={otId}
          obraId={obraId}
          insumos={insumos}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
