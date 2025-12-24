'use client'

import { useState, useEffect } from 'react'
import type { Insumo } from '@/types/database'
import { getAvailableInsumosForRubro, addInsumoToRubro } from '@/app/actions/rubro-insumos'

interface AddInsumoSelectorProps {
  rubroId: string
  onClose: () => void
  onAdded: () => void
}

export function AddInsumoSelector({ rubroId, onClose, onAdded }: AddInsumoSelectorProps) {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState<string | null>(null)

  useEffect(() => {
    loadInsumos()
  }, [rubroId])

  const loadInsumos = async () => {
    setLoading(true)
    const result = await getAvailableInsumosForRubro(rubroId)
    setLoading(false)
    if (result.success && result.data) {
      setInsumos(result.data)
    }
  }

  const handleAdd = async (insumoId: string) => {
    setAdding(insumoId)
    const result = await addInsumoToRubro(rubroId, insumoId)
    setAdding(null)

    if (result.success) {
      onAdded()
    }
  }

  const filteredInsumos = insumos.filter(
    (i) =>
      i.nombre.toLowerCase().includes(search.toLowerCase()) ||
      i.unidad.toLowerCase().includes(search.toLowerCase())
  )

  const materiales = filteredInsumos.filter((i) => i.tipo === 'material')
  const manoDeObra = filteredInsumos.filter((i) => i.tipo === 'mano_de_obra')

  const formatPrice = (price: number | null) => {
    if (!price) return '-'
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Agregar Insumo</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar insumo..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-8 text-center">
            <svg
              className="w-6 h-6 text-gray-400 animate-spin mx-auto"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : filteredInsumos.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500">
              {search
                ? 'No se encontraron insumos'
                : 'Todos los insumos ya estan vinculados a este rubro'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Materiales */}
            {materiales.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-blue-50 text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Materiales ({materiales.length})
                </div>
                {materiales.map((insumo) => (
                  <button
                    key={insumo.id}
                    onClick={() => handleAdd(insumo.id)}
                    disabled={adding === insumo.id}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{insumo.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {insumo.unidad} | {formatPrice(insumo.precio_unitario)}
                        </p>
                      </div>
                    </div>
                    {adding === insumo.id ? (
                      <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Mano de Obra */}
            {manoDeObra.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-green-50 text-xs font-medium text-green-700 uppercase tracking-wider">
                  Mano de Obra ({manoDeObra.length})
                </div>
                {manoDeObra.map((insumo) => (
                  <button
                    key={insumo.id}
                    onClick={() => handleAdd(insumo.id)}
                    disabled={adding === insumo.id}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{insumo.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {insumo.unidad} | {formatPrice(insumo.precio_unitario)}
                        </p>
                      </div>
                    </div>
                    {adding === insumo.id ? (
                      <svg className="w-4 h-4 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
