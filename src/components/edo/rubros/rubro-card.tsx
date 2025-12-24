'use client'

import { useState } from 'react'
import type { RubroWithInsumos, Insumo, UserRole } from '@/types/database'
import { InsumoItem } from './insumo-item'
import { EditInsumoModal } from './edit-insumo-modal'
import { AddInsumoSelector } from './add-insumo-selector'
import { updateRubroPresupuesto, removeInsumoFromRubro } from '@/app/actions/rubro-insumos'

interface RubroCardProps {
  rubro: RubroWithInsumos
  userRole: UserRole
  valorUr: number
  onRefresh: () => void
}

export function RubroCard({ rubro, userRole, valorUr, onRefresh }: RubroCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editingPresupuesto, setEditingPresupuesto] = useState(false)
  const [presupuestoValue, setPresupuestoValue] = useState(String(rubro.presupuesto_ur || 0))
  const [savingPresupuesto, setSavingPresupuesto] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)
  const [showAddInsumo, setShowAddInsumo] = useState(false)
  const [removingInsumoId, setRemovingInsumoId] = useState<string | null>(null)

  const canEdit = ['admin', 'director_obra'].includes(userRole)
  const canEditInsumos = ['admin', 'director_obra', 'jefe_obra'].includes(userRole)

  const handleSavePresupuesto = async () => {
    const newPresupuestoUr = parseFloat(presupuestoValue) || 0
    if (newPresupuestoUr < 0) return

    setSavingPresupuesto(true)
    const presupuestoPesos = newPresupuestoUr * valorUr
    const result = await updateRubroPresupuesto(rubro.id, newPresupuestoUr, presupuestoPesos)
    setSavingPresupuesto(false)

    if (result.success) {
      setEditingPresupuesto(false)
      onRefresh()
    }
  }

  const handleRemoveInsumo = async (insumoId: string) => {
    if (!confirm('¿Quitar este insumo del rubro?')) return

    setRemovingInsumoId(insumoId)
    const result = await removeInsumoFromRubro(rubro.id, insumoId)
    setRemovingInsumoId(null)

    if (result.success) {
      onRefresh()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      maximumFractionDigits: 0
    }).format(value)
  }

  const status = rubro.presupuesto_status
  const porcentajeUsado = status?.porcentaje_usado || 0
  const statusColor = porcentajeUsado > 100
    ? 'text-red-600'
    : porcentajeUsado > 80
    ? 'text-amber-600'
    : 'text-green-600'

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Header - Clickeable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Icon */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Rubro Info */}
          <div className="text-left">
            <h3 className="font-medium text-gray-900">{rubro.nombre}</h3>
            <p className="text-sm text-gray-500">
              {rubro.unidad || 'unidad'} | {rubro.insumos.length} insumos
            </p>
          </div>
        </div>

        {/* Presupuesto */}
        <div className="text-right">
          <div className="font-medium text-gray-900">
            {rubro.presupuesto_ur?.toLocaleString('es-UY')} UR
          </div>
          <div className="text-sm text-gray-500">
            {formatCurrency(rubro.presupuesto || 0)}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-4">
          {/* Presupuesto Status */}
          {status && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Control presupuestario</span>
                <span className={`text-sm font-medium ${statusColor}`}>
                  {porcentajeUsado.toFixed(1)}% usado
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    porcentajeUsado > 100
                      ? 'bg-red-500'
                      : porcentajeUsado > 80
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Gastado: {formatCurrency(status.gastado)}</span>
                <span>Disponible: {formatCurrency(status.disponible)}</span>
              </div>
            </div>
          )}

          {/* Editar Presupuesto */}
          {canEdit && (
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Presupuesto:</span>
              {editingPresupuesto ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={presupuestoValue}
                    onChange={(e) => setPresupuestoValue(e.target.value)}
                    className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="1"
                  />
                  <span className="text-sm text-gray-500">UR</span>
                  <button
                    onClick={handleSavePresupuesto}
                    disabled={savingPresupuesto}
                    className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingPresupuesto ? '...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingPresupuesto(false)
                      setPresupuestoValue(String(rubro.presupuesto_ur || 0))
                    }}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPresupuesto(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar
                </button>
              )}
            </div>
          )}

          {/* Lista de Insumos */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Insumos ({rubro.insumos.length})
            </h4>
            {rubro.insumos.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay insumos vinculados a este rubro</p>
            ) : (
              <div className="space-y-2">
                {rubro.insumos.map((insumo) => (
                  <InsumoItem
                    key={insumo.id}
                    insumo={insumo}
                    canEdit={canEditInsumos}
                    onEdit={() => setEditingInsumo(insumo)}
                    onRemove={() => handleRemoveInsumo(insumo.id)}
                    isRemoving={removingInsumoId === insumo.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Agregar Insumo */}
          {canEditInsumos && (
            <div>
              {showAddInsumo ? (
                <AddInsumoSelector
                  rubroId={rubro.id}
                  onClose={() => setShowAddInsumo(false)}
                  onAdded={() => {
                    setShowAddInsumo(false)
                    onRefresh()
                  }}
                />
              ) : (
                <button
                  onClick={() => setShowAddInsumo(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Insumo
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de edicion de insumo */}
      {editingInsumo && (
        <EditInsumoModal
          insumo={editingInsumo}
          onClose={() => setEditingInsumo(null)}
          onSaved={() => {
            setEditingInsumo(null)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}
