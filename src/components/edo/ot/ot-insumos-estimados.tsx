'use client'

import { formatPesos } from '@/lib/utils/currency'
import type { InsumoTipo } from '@/types/database'

interface InsumoEstimado {
  id: string
  orden_trabajo_id: string
  insumo_id: string
  cantidad_estimada: number
  precio_estimado: number
  insumos: {
    id: string
    nombre: string
    unidad: string
    tipo: InsumoTipo | null
  } | null
}

interface OTInsumosEstimadosProps {
  insumos: InsumoEstimado[]
  cantidad: number
}

export function OTInsumosEstimados({ insumos, cantidad }: OTInsumosEstimadosProps) {
  const total = insumos.reduce((sum, i) => sum + i.precio_estimado, 0)
  const materiales = insumos.filter((i) => i.insumos?.tipo === 'material')
  const manoDeObra = insumos.filter((i) => i.insumos?.tipo === 'mano_de_obra')

  if (insumos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Insumos Estimados</h2>
        </div>
        <div className="p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            No hay fórmula definida para el rubro seleccionado
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Insumos Estimados</h2>
        <div className="text-sm text-gray-500">
          Calculado para {cantidad} unidades
        </div>
      </div>

      {materiales.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Materiales
          </h3>
          <div className="space-y-2">
            {materiales.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 text-sm"
              >
                <div className="flex-1">
                  <span className="text-gray-900">{item.insumos?.nombre}</span>
                  <span className="text-gray-500 ml-2">
                    ({item.cantidad_estimada.toFixed(2)} {item.insumos?.unidad})
                  </span>
                </div>
                <div className="text-right font-medium text-gray-900">
                  {formatPesos(item.precio_estimado)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {manoDeObra.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            Mano de Obra
          </h3>
          <div className="space-y-2">
            {manoDeObra.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 text-sm"
              >
                <div className="flex-1">
                  <span className="text-gray-900">{item.insumos?.nombre}</span>
                  <span className="text-gray-500 ml-2">
                    ({item.cantidad_estimada.toFixed(2)} {item.insumos?.unidad})
                  </span>
                </div>
                <div className="text-right font-medium text-gray-900">
                  {formatPesos(item.precio_estimado)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
        <span className="font-medium text-gray-900">Total Estimado</span>
        <span className="text-xl font-bold text-blue-600">{formatPesos(total)}</span>
      </div>
    </div>
  )
}
