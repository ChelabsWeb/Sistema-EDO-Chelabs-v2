'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createOT, getRubroBudgetStatus } from '@/app/actions/ordenes-trabajo'
import { formatPesos } from '@/lib/utils/currency'

interface Rubro {
  id: string
  nombre: string
  unidad: string | null
  presupuesto: number
}

interface FormulaItem {
  insumo_id: string
  nombre: string
  unidad: string
  cantidad_por_unidad: number
  precio_referencia: number
}

interface OTCreateFormProps {
  obraId: string
  rubros: Rubro[]
}

export function OTCreateForm({ obraId, rubros }: OTCreateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedRubroId, setSelectedRubroId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [cantidad, setCantidad] = useState(1)

  const [formulaItems, setFormulaItems] = useState<FormulaItem[]>([])
  const [costoEstimado, setCostoEstimado] = useState(0)
  const [budgetStatus, setBudgetStatus] = useState<{
    presupuesto: number
    gastado: number
    disponible: number
    porcentaje_usado: number
  } | null>(null)
  const [isLoadingFormula, setIsLoadingFormula] = useState(false)

  const selectedRubro = rubros.find((r) => r.id === selectedRubroId)

  // Load formula when rubro changes
  useEffect(() => {
    async function loadFormula() {
      if (!selectedRubroId) {
        setFormulaItems([])
        setCostoEstimado(0)
        setBudgetStatus(null)
        return
      }

      setIsLoadingFormula(true)
      try {
        // Fetch formula items from the server
        const response = await fetch(`/api/rubros/${selectedRubroId}/formula`)
        if (response.ok) {
          const data = await response.json()
          setFormulaItems(data.items || [])
        }

        // Get budget status
        const budgetResult = await getRubroBudgetStatus(selectedRubroId)
        if (budgetResult.success) {
          setBudgetStatus(budgetResult.data)
        }
      } catch {
        console.error('Error loading formula')
      } finally {
        setIsLoadingFormula(false)
      }
    }

    loadFormula()
  }, [selectedRubroId])

  // Calculate estimated cost when formula items or cantidad changes
  useEffect(() => {
    if (formulaItems.length === 0) {
      setCostoEstimado(0)
      return
    }

    const total = formulaItems.reduce((sum, item) => {
      return sum + item.cantidad_por_unidad * cantidad * item.precio_referencia
    }, 0)

    setCostoEstimado(total)
  }, [formulaItems, cantidad])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await createOT({
        obra_id: obraId,
        rubro_id: selectedRubroId,
        descripcion,
        cantidad,
      })

      if (result.success) {
        router.push(`/obras/${obraId}/ordenes-trabajo/${result.data.id}`)
      } else {
        setError(result.error)
      }
    } catch {
      setError('Error al crear la orden de trabajo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const excedesPresupuesto = budgetStatus && costoEstimado > budgetStatus.disponible

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Rubro Selection */}
      <div>
        <label htmlFor="rubro" className="block text-sm font-medium text-gray-700 mb-1">
          Rubro *
        </label>
        <select
          id="rubro"
          value={selectedRubroId}
          onChange={(e) => setSelectedRubroId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleccionar rubro...</option>
          {rubros.map((rubro) => (
            <option key={rubro.id} value={rubro.id}>
              {rubro.nombre} ({rubro.unidad})
            </option>
          ))}
        </select>
      </div>

      {/* Budget Status */}
      {budgetStatus && (
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Estado del Presupuesto del Rubro</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Presupuesto</div>
              <div className="font-medium">{formatPesos(budgetStatus.presupuesto)}</div>
            </div>
            <div>
              <div className="text-gray-500">Gastado</div>
              <div className="font-medium">{formatPesos(budgetStatus.gastado)}</div>
            </div>
            <div>
              <div className="text-gray-500">Disponible</div>
              <div className={`font-medium ${budgetStatus.disponible < 0 ? 'text-red-600' : ''}`}>
                {formatPesos(budgetStatus.disponible)}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Uso del presupuesto</span>
              <span>{budgetStatus.porcentaje_usado.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  budgetStatus.porcentaje_usado > 100 ? 'bg-red-500' :
                  budgetStatus.porcentaje_usado > 80 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetStatus.porcentaje_usado, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Descripcion */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción *
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          rows={3}
          maxLength={500}
          placeholder="Describa el trabajo a realizar..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">{descripcion.length}/500 caracteres</p>
      </div>

      {/* Cantidad */}
      <div>
        <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">
          Cantidad {selectedRubro && `(${selectedRubro.unidad})`} *
        </label>
        <input
          type="number"
          id="cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(Math.max(0.01, parseFloat(e.target.value) || 0))}
          required
          min="0.01"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Estimated Insumos */}
      {selectedRubroId && (
        <div className="border border-gray-200 rounded-md">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-700">Insumos Estimados (desde Fórmula)</h4>
          </div>
          <div className="p-4">
            {isLoadingFormula ? (
              <div className="text-center py-4">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full" />
                <p className="text-sm text-gray-500 mt-2">Cargando fórmula...</p>
              </div>
            ) : formulaItems.length > 0 ? (
              <div className="space-y-2">
                {formulaItems.map((item) => (
                  <div key={item.insumo_id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="text-sm text-gray-900">{item.nombre}</span>
                      <span className="text-xs text-gray-500 ml-2">({item.unidad})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {(item.cantidad_por_unidad * cantidad).toFixed(2)} {item.unidad}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatPesos(item.cantidad_por_unidad * cantidad * item.precio_referencia)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Este rubro no tiene fórmula definida. El costo será $0.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Estimated Cost */}
      <div className="bg-blue-50 rounded-md p-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Costo Estimado Total</h4>
            {excedesPresupuesto && (
              <p className="text-xs text-yellow-600 mt-1">
                Excede el presupuesto disponible del rubro
              </p>
            )}
          </div>
          <div className={`text-2xl font-bold ${excedesPresupuesto ? 'text-yellow-600' : 'text-blue-600'}`}>
            {formatPesos(costoEstimado)}
          </div>
        </div>
      </div>

      {/* Warning if exceeds budget */}
      {excedesPresupuesto && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Advertencia de Presupuesto</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Esta OT excede el presupuesto disponible del rubro por{' '}
                <strong>{formatPesos(costoEstimado - (budgetStatus?.disponible || 0))}</strong>.
                Puede continuar, pero requerirá aprobación del Director de Obra.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedRubroId || !descripcion}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              Guardando...
            </>
          ) : (
            'Guardar como Borrador'
          )}
        </button>
      </div>
    </form>
  )
}
