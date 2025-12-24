'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatPesos } from '@/lib/utils/currency'
import { createOrdenCompra } from '@/app/actions/ordenes-compra'
import type { Insumo } from '@/types/database'

interface LineaItem {
  insumo_id: string
  cantidad: number
  precio_unitario: number
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

  const [proveedor, setProveedor] = useState('')
  const [rutProveedor, setRutProveedor] = useState('')
  const [condicionesPago, setCondicionesPago] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [lineas, setLineas] = useState<LineaItem[]>([])
  const [selectedInsumo, setSelectedInsumo] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [precioUnitario, setPrecioUnitario] = useState('')

  const handleAddLinea = () => {
    if (!selectedInsumo || !cantidad || Number(cantidad) <= 0) return

    const insumo = insumos.find(i => i.id === selectedInsumo)
    if (!insumo) return

    const precio = precioUnitario ? Number(precioUnitario) : (insumo.precio_referencia || 0)

    setLineas(prev => [...prev, {
      insumo_id: selectedInsumo,
      cantidad: Number(cantidad),
      precio_unitario: precio,
    }])

    setSelectedInsumo('')
    setCantidad('')
    setPrecioUnitario('')
  }

  const handleRemoveLinea = (index: number) => {
    setLineas(prev => prev.filter((_, i) => i !== index))
  }

  const total = lineas.reduce((sum, l) => sum + (l.cantidad * l.precio_unitario), 0)

  const handleSubmit = () => {
    if (!proveedor.trim()) {
      setError('El proveedor es requerido')
      return
    }
    if (lineas.length === 0) {
      setError('Debe agregar al menos un item')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createOrdenCompra({
        obra_id: obraId,
        ot_id: otId,
        proveedor: proveedor.trim(),
        rut_proveedor: rutProveedor.trim() || undefined,
        condiciones_pago: condicionesPago.trim() || undefined,
        fecha_entrega_esperada: fechaEntrega || undefined,
        lineas: lineas.map(l => ({
          insumo_id: l.insumo_id,
          cantidad: l.cantidad,
          precio_unitario: l.precio_unitario,
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-apple-fade-in" onClick={onClose} />

        <div className="relative bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[--color-apple-gray-200]/50 animate-apple-scale-in">
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[--color-apple-gray-200]/50 px-6 py-5 flex items-center justify-between rounded-t-[20px]">
            <h3 className="text-xl font-semibold text-[--color-apple-gray-600] tracking-tight">Nueva Orden de Compra</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[--color-apple-gray-100] hover:bg-[--color-apple-gray-200] flex items-center justify-center text-[--color-apple-gray-400] hover:text-[--color-apple-gray-600] transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-[--color-apple-red]/5 border border-[--color-apple-red]/20 text-[--color-apple-red] px-4 py-3 rounded-[12px] text-sm">
                {error}
              </div>
            )}

            {/* Datos del proveedor */}
            <div className="space-y-4">
              <h4 className="font-medium text-[--color-apple-gray-600]">Datos del Proveedor</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[--color-apple-gray-500] mb-1.5">
                    Proveedor *
                  </label>
                  <input
                    type="text"
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[--color-apple-gray-200]/50 bg-[--color-apple-gray-50] rounded-[12px] focus:ring-2 focus:ring-[--color-apple-blue]/20 focus:border-[--color-apple-blue] focus:bg-white transition-all duration-200 outline-none text-[--color-apple-gray-600] placeholder:text-[--color-apple-gray-400]"
                    placeholder="Nombre del proveedor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--color-apple-gray-500] mb-1.5">
                    RUT
                  </label>
                  <input
                    type="text"
                    value={rutProveedor}
                    onChange={(e) => setRutProveedor(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[--color-apple-gray-200]/50 bg-[--color-apple-gray-50] rounded-[12px] focus:ring-2 focus:ring-[--color-apple-blue]/20 focus:border-[--color-apple-blue] focus:bg-white transition-all duration-200 outline-none text-[--color-apple-gray-600] placeholder:text-[--color-apple-gray-400]"
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[--color-apple-gray-500] mb-1.5">
                    Condiciones de Pago
                  </label>
                  <input
                    type="text"
                    value={condicionesPago}
                    onChange={(e) => setCondicionesPago(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[--color-apple-gray-200]/50 bg-[--color-apple-gray-50] rounded-[12px] focus:ring-2 focus:ring-[--color-apple-blue]/20 focus:border-[--color-apple-blue] focus:bg-white transition-all duration-200 outline-none text-[--color-apple-gray-600] placeholder:text-[--color-apple-gray-400]"
                    placeholder="Ej: 30 días"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--color-apple-gray-500] mb-1.5">
                    Fecha de Entrega Esperada
                  </label>
                  <input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[--color-apple-gray-200]/50 bg-[--color-apple-gray-50] rounded-[12px] focus:ring-2 focus:ring-[--color-apple-blue]/20 focus:border-[--color-apple-blue] focus:bg-white transition-all duration-200 outline-none text-[--color-apple-gray-600]"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Items</h4>

              {/* Add item form */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insumo
                  </label>
                  <select
                    value={selectedInsumo}
                    onChange={(e) => {
                      setSelectedInsumo(e.target.value)
                      const insumo = insumos.find(i => i.id === e.target.value)
                      if (insumo?.precio_referencia) {
                        setPrecioUnitario(insumo.precio_referencia.toString())
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar insumo...</option>
                    {availableInsumos.map((insumo) => (
                      <option key={insumo.id} value={insumo.id}>
                        {insumo.nombre} ({insumo.unidad})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario
                    </label>
                    <input
                      type="number"
                      value={precioUnitario}
                      onChange={(e) => setPrecioUnitario(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddLinea}
                  disabled={!selectedInsumo || !cantidad || Number(cantidad) <= 0}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  + Agregar Item
                </button>
              </div>

              {/* Items list */}
              {lineas.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lineas.map((linea, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{getInsumoName(linea.insumo_id)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {linea.cantidad} {getInsumoUnidad(linea.insumo_id)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatPesos(linea.precio_unitario)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {formatPesos(linea.cantidad * linea.precio_unitario)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLinea(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {formatPesos(total)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[--color-apple-gray-50]/80 backdrop-blur-xl border-t border-[--color-apple-gray-200]/50 px-6 py-5 flex justify-end gap-3 rounded-b-[20px]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[--color-apple-gray-600] bg-[--color-apple-gray-100] rounded-[12px] hover:bg-[--color-apple-gray-200] transition-all duration-200 active:scale-[0.97]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || lineas.length === 0 || !proveedor.trim()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[--color-apple-blue] rounded-[12px] hover:bg-[--color-apple-blue-dark] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.97]"
            >
              {isPending ? 'Creando...' : 'Crear Orden de Compra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
