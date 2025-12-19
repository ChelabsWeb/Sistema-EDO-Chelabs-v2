'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  registerConsumo,
  getInsumosEstimadosParaConsumo,
  deleteConsumo,
} from '@/app/actions/consumo-materiales'
import { formatPesos } from '@/lib/utils/currency'

interface Consumo {
  id: string
  insumo_id: string
  cantidad_consumida: number
  cantidad_estimada: number | null
  notas: string | null
  registrado_en: string | null
  insumo: {
    id: string
    nombre: string
    unidad: string
    precio_referencia: number | null
  }
  diferencia: number
  porcentaje_diferencia: number | null
}

interface InsumoEstimado {
  insumo_id: string
  nombre: string
  unidad: string
  cantidad_estimada: number
  precio_referencia: number | null
  ya_registrado: boolean
  cantidad_consumida: number | null
}

interface OTConsumosProps {
  otId: string
  obraId: string
  consumos: Consumo[]
  canEdit: boolean
}

export function OTConsumos({ otId, obraId, consumos: initialConsumos, canEdit }: OTConsumosProps) {
  const router = useRouter()
  const [consumos, setConsumos] = useState(initialConsumos)
  const [insumosEstimados, setInsumosEstimados] = useState<InsumoEstimado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingInsumo, setEditingInsumo] = useState<string | null>(null)
  const [cantidadInput, setCantidadInput] = useState('')
  const [notasInput, setNotasInput] = useState('')

  useEffect(() => {
    loadInsumosEstimados()
  }, [otId])

  useEffect(() => {
    setConsumos(initialConsumos)
  }, [initialConsumos])

  const loadInsumosEstimados = async () => {
    setIsLoading(true)
    const result = await getInsumosEstimadosParaConsumo(otId)
    if (result.success) {
      setInsumosEstimados(result.data)
    }
    setIsLoading(false)
  }

  const handleStartEdit = (insumo: InsumoEstimado) => {
    setEditingInsumo(insumo.insumo_id)
    setCantidadInput(insumo.cantidad_consumida?.toString() || '')
    setNotasInput('')
  }

  const handleCancelEdit = () => {
    setEditingInsumo(null)
    setCantidadInput('')
    setNotasInput('')
  }

  const handleSaveConsumo = async (insumo: InsumoEstimado) => {
    if (!cantidadInput) {
      setError('Ingrese la cantidad consumida')
      return
    }

    setIsSaving(true)
    setError(null)

    const result = await registerConsumo({
      orden_trabajo_id: otId,
      obra_id: obraId,
      insumo_id: insumo.insumo_id,
      cantidad_consumida: parseFloat(cantidadInput),
      cantidad_estimada: insumo.cantidad_estimada,
      notas: notasInput || undefined,
    })

    if (result.success) {
      handleCancelEdit()
      router.refresh()
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    } else {
      setError(result.error)
    }

    setIsSaving(false)
  }

  const handleDeleteConsumo = async (consumoId: string) => {
    if (!confirm('Eliminar este registro de consumo?')) return

    const result = await deleteConsumo(consumoId, obraId, otId)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  // Calculate totals
  const totalEstimado = consumos.reduce((sum, c) => {
    const precio = c.insumo?.precio_referencia || 0
    return sum + (c.cantidad_estimada || 0) * precio
  }, 0)

  const totalReal = consumos.reduce((sum, c) => {
    const precio = c.insumo?.precio_referencia || 0
    return sum + c.cantidad_consumida * precio
  }, 0)

  const desvioTotal = totalReal - totalEstimado
  const desvioPercent = totalEstimado > 0 ? (desvioTotal / totalEstimado) * 100 : 0

  const getDeviationColor = (percent: number | null) => {
    if (percent === null) return 'text-gray-500'
    if (percent > 10) return 'text-red-600'
    if (percent > 0) return 'text-yellow-600'
    if (percent < -10) return 'text-green-600'
    return 'text-green-500'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Consumo de Materiales</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {consumos.length} de {insumosEstimados.length} insumos registrados
            </p>
          </div>
          {consumos.length > 0 && (
            <div className="text-right">
              <div className={`text-lg font-bold ${getDeviationColor(desvioPercent)}`}>
                {desvioTotal >= 0 ? '+' : ''}{formatPesos(desvioTotal)}
              </div>
              <div className="text-xs text-gray-500">
                Desvio ({desvioPercent >= 0 ? '+' : ''}{desvioPercent.toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {insumosEstimados.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500">No hay insumos estimados para esta OT</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insumosEstimados.map((insumo) => {
              const consumo = consumos.find((c) => c.insumo_id === insumo.insumo_id)
              const isEditing = editingInsumo === insumo.insumo_id

              return (
                <div
                  key={insumo.insumo_id}
                  className={`border rounded-lg p-4 ${
                    consumo
                      ? consumo.porcentaje_diferencia && consumo.porcentaje_diferencia > 10
                        ? 'border-red-200 bg-red-50'
                        : consumo.porcentaje_diferencia && consumo.porcentaje_diferencia > 0
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-green-200 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{insumo.nombre}</h3>
                      <p className="text-sm text-gray-500">
                        Estimado: {insumo.cantidad_estimada.toFixed(2)} {insumo.unidad}
                        {insumo.precio_referencia && (
                          <span className="ml-2">
                            ({formatPesos(insumo.cantidad_estimada * insumo.precio_referencia)})
                          </span>
                        )}
                      </p>
                    </div>
                    {consumo && (
                      <div className={`text-right ${getDeviationColor(consumo.porcentaje_diferencia)}`}>
                        <div className="font-bold">
                          {consumo.diferencia >= 0 ? '+' : ''}{consumo.diferencia.toFixed(2)} {insumo.unidad}
                        </div>
                        {consumo.porcentaje_diferencia !== null && (
                          <div className="text-xs">
                            ({consumo.porcentaje_diferencia >= 0 ? '+' : ''}{consumo.porcentaje_diferencia.toFixed(1)}%)
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">
                            Cantidad consumida ({insumo.unidad})
                          </label>
                          <input
                            type="number"
                            value={cantidadInput}
                            onChange={(e) => setCantidadInput(e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={insumo.cantidad_estimada.toString()}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Notas (opcional)</label>
                        <input
                          type="text"
                          value={notasInput}
                          onChange={(e) => setNotasInput(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: Se desperdicio material por..."
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveConsumo(insumo)}
                          disabled={isSaving}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ) : consumo ? (
                    <div className="mt-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Consumido:</span>{' '}
                          {consumo.cantidad_consumida.toFixed(2)} {insumo.unidad}
                          {insumo.precio_referencia && (
                            <span className="ml-2 text-gray-500">
                              ({formatPesos(consumo.cantidad_consumida * insumo.precio_referencia)})
                            </span>
                          )}
                        </p>
                        {consumo.notas && (
                          <p className="text-xs text-gray-500 mt-1">Nota: {consumo.notas}</p>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(insumo)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteConsumo(consumo.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  ) : canEdit ? (
                    <button
                      onClick={() => handleStartEdit(insumo)}
                      className="mt-3 w-full py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                    >
                      + Registrar Consumo
                    </button>
                  ) : (
                    <p className="mt-3 text-sm text-gray-400 text-center">Sin registro</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        {consumos.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Estimado</div>
                <div className="text-lg font-semibold text-gray-900">{formatPesos(totalEstimado)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Real</div>
                <div className="text-lg font-semibold text-gray-900">{formatPesos(totalReal)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Desvio</div>
                <div className={`text-lg font-semibold ${getDeviationColor(desvioPercent)}`}>
                  {desvioTotal >= 0 ? '+' : ''}{formatPesos(desvioTotal)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
