'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRubro } from '@/app/actions/rubros'
import { getInsumosByObra } from '@/app/actions/insumos'
import { getFormulasByRubro, createFormula, deleteFormula, updateFormula, type FormulaWithInsumo } from '@/app/actions/formulas'
import { formatPesos } from '@/lib/utils/currency'
import type { Rubro, Insumo } from '@/types/database'

interface Props {
  params: Promise<{ id: string; rubroId: string }>
}

export default function FormulaRubroPage({ params }: Props) {
  const [obraId, setObraId] = useState<string | null>(null)
  const [rubroId, setRubroId] = useState<string | null>(null)
  const [rubro, setRubro] = useState<Rubro | null>(null)
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [formulas, setFormulas] = useState<FormulaWithInsumo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [selectedInsumo, setSelectedInsumo] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params
      setObraId(resolvedParams.id)
      setRubroId(resolvedParams.rubroId)

      // Load rubro
      const rubroResult = await getRubro(resolvedParams.rubroId)
      if (!rubroResult.success) {
        setError('Rubro no encontrado')
        setLoading(false)
        return
      }
      setRubro(rubroResult.data)

      // Load insumos for obra
      const insumosResult = await getInsumosByObra(resolvedParams.id)
      if (insumosResult.success) {
        setInsumos(insumosResult.data)
      }

      // Load formulas
      const formulasResult = await getFormulasByRubro(resolvedParams.rubroId)
      if (formulasResult.success) {
        setFormulas(formulasResult.data)
      }

      setLoading(false)
    }

    loadData()
  }, [params])

  const handleAddInsumo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rubroId || !selectedInsumo || !cantidad) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    const result = await createFormula({
      rubro_id: rubroId,
      insumo_id: selectedInsumo,
      cantidad_por_unidad: parseFloat(cantidad),
    })

    if (!result.success) {
      setError(result.error)
      setSaving(false)
      return
    }

    // Reload formulas
    const formulasResult = await getFormulasByRubro(rubroId)
    if (formulasResult.success) {
      setFormulas(formulasResult.data)
    }

    setSelectedInsumo('')
    setCantidad('')
    setSuccess('Insumo agregado a la fórmula')
    setSaving(false)
  }

  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm('Eliminar este insumo de la fórmula?')) return

    const result = await deleteFormula(formulaId)
    if (!result.success) {
      setError(result.error)
      return
    }

    setFormulas(formulas.filter((f) => f.id !== formulaId))
    setSuccess('Insumo eliminado de la fórmula')
  }

  const availableInsumos = insumos.filter(
    (i) => !formulas.some((f) => f.insumo_id === i.id)
  )

  // Calculate total estimated cost per unit
  const costoTotalPorUnidad = formulas.reduce((sum, f) => {
    const precio = f.insumos?.precio_referencia || 0
    return sum + f.cantidad_por_unidad * precio
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/obras/${obraId}`} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Formula: {rubro?.nombre}
              </h1>
              <p className="text-sm text-gray-500">
                Define los insumos necesarios por {rubro?.unidad || 'unidad'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Add Insumo Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agregar Insumo</h2>

          {availableInsumos.length === 0 ? (
            <p className="text-gray-500">
              No hay mas insumos disponibles.{' '}
              <Link href={`/obras/${obraId}/insumos/nuevo`} className="text-blue-600 hover:underline">
                Crear nuevo insumo
              </Link>
            </p>
          ) : (
            <form onSubmit={handleAddInsumo} className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="insumo" className="block text-sm font-medium text-gray-700 mb-1">
                  Insumo
                </label>
                <select
                  id="insumo"
                  value={selectedInsumo}
                  onChange={(e) => setSelectedInsumo(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar insumo...</option>
                  {availableInsumos.map((insumo) => (
                    <option key={insumo.id} value={insumo.id}>
                      {insumo.nombre} ({insumo.unidad})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-48">
                <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad por {rubro?.unidad || 'unidad'}
                </label>
                <input
                  type="number"
                  id="cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  step="0.0001"
                  min="0.0001"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Agregando...' : 'Agregar'}
              </button>
            </form>
          )}
        </div>

        {/* Current Formula */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Insumos en la Formula</h2>
          </div>

          {formulas.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Insumo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cantidad/{rubro?.unidad || 'und'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Costo/{rubro?.unidad || 'und'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formulas.map((formula) => {
                    const insumo = formula.insumos
                    const costoPorUnidad = formula.cantidad_por_unidad * (insumo?.precio_referencia || 0)

                    return (
                      <tr key={formula.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {insumo?.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {insumo?.unidad}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formula.cantidad_por_unidad.toLocaleString('es-UY', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatPesos(insumo?.precio_referencia)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPesos(costoPorUnidad)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleDeleteFormula(formula.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900">
                      Costo Total por {rubro?.unidad || 'unidad'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPesos(costoTotalPorUnidad)}
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Formula vacia</h3>
              <p className="text-gray-500 mt-1">
                Agrega insumos para definir la formula de este rubro
              </p>
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="mt-6">
          <Link
            href={`/obras/${obraId}`}
            className="text-blue-600 hover:text-blue-800"
          >
            Volver a la obra
          </Link>
        </div>
      </main>
    </div>
  )
}
