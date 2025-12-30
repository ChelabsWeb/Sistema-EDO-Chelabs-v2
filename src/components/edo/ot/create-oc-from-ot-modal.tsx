'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOrdenCompra } from '@/app/actions/ordenes-compra'
import type { Insumo } from '@/types/database'

interface LineaItem {
  insumo_id: string
  cantidad: number
}

interface Props {
  otId: string
  obraId: string
  insumos: Insumo[]
  onClose: () => void
}

export function CreateOCFromOTModal({ otId, obraId, insumos, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [lineas, setLineas] = useState<LineaItem[]>([])
  const [selectedInsumo, setSelectedInsumo] = useState('')
  const [cantidad, setCantidad] = useState('')

  const handleAddLinea = () => {
    if (!selectedInsumo || !cantidad || Number(cantidad) <= 0) return

    setLineas(prev => [...prev, {
      insumo_id: selectedInsumo,
      cantidad: Number(cantidad),
    }])

    setSelectedInsumo('')
    setCantidad('')
  }

  const handleRemoveLinea = (index: number) => {
    setLineas(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (lineas.length === 0) {
      setError('Debe agregar al menos un item')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createOrdenCompra({
        obra_id: obraId,
        ot_id: otId,
        proveedor: 'Por definir',
        lineas: lineas.map(l => ({
          insumo_id: l.insumo_id,
          cantidad: l.cantidad,
          precio_unitario: 0,
        })),
      })

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        setError(result.error)
      }
    })
  }

  const getInsumoName = (insumoId: string) => {
    return insumos.find(i => i.id === insumoId)?.nombre || 'Desconocido'
  }

  const getInsumoUnidad = (insumoId: string) => {
    return insumos.find(i => i.id === insumoId)?.unidad || ''
  }

  // Filter out already added insumos
  const availableInsumos = insumos.filter(i => !lineas.some(l => l.insumo_id === i.id))

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#e8e8ed] px-6 py-5 flex items-center justify-between rounded-t-[20px]">
            <h3 className="text-xl font-semibold text-[#1d1d1f]">Nueva Orden de Compra</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Add item form */}
            <div className="space-y-4">
              <h4 className="font-medium text-[#1d1d1f]">¿Qué necesitas?</h4>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-1.5">
                  Insumo
                </label>
                <select
                  value={selectedInsumo}
                  onChange={(e) => setSelectedInsumo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#e8e8ed] bg-[#f5f5f7] rounded-xl focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] focus:bg-white transition-all outline-none text-[#1d1d1f]"
                >
                  <option value="">Seleccionar insumo...</option>
                  {availableInsumos.map((insumo) => (
                    <option key={insumo.id} value={insumo.id}>
                      {insumo.nombre} ({insumo.unidad})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-1.5">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#e8e8ed] bg-[#f5f5f7] rounded-xl focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] focus:bg-white transition-all outline-none text-[#1d1d1f]"
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <button
                type="button"
                onClick={handleAddLinea}
                disabled={!selectedInsumo || !cantidad || Number(cantidad) <= 0}
                className="w-full px-4 py-2.5 text-sm font-medium text-[#0066cc] bg-[#0066cc]/10 hover:bg-[#0066cc]/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                + Agregar Item
              </button>
            </div>

            {/* Items list */}
            {lineas.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-[#1d1d1f]">Items agregados</h4>
                <div className="space-y-2">
                  {lineas.map((linea, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#f5f5f7] rounded-xl">
                      <div>
                        <p className="font-medium text-[#1d1d1f]">{getInsumoName(linea.insumo_id)}</p>
                        <p className="text-sm text-[#86868b]">{linea.cantidad} {getInsumoUnidad(linea.insumo_id)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLinea(index)}
                        className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#f5f5f7] border-t border-[#e8e8ed] px-6 py-5 flex justify-end gap-3 rounded-b-[20px]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[#1d1d1f] bg-white border border-[#e8e8ed] rounded-xl hover:bg-[#f5f5f7] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || lineas.length === 0}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#0066cc] rounded-xl hover:bg-[#004499] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Creando...' : 'Crear Orden de Compra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
