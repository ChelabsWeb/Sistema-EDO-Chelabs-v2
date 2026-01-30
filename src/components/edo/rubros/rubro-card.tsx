'use client'

import { useState } from 'react'
import type { RubroWithInsumos, Insumo, UserRole } from '@/types/database'
import { InsumoItem } from './insumo-item'
import { EditInsumoModal } from './edit-insumo-modal'
import { AddInsumoSelector } from './add-insumo-selector'
import { updateRubroPresupuesto, removeInsumoFromRubro } from '@/app/actions/rubro-insumos'
import { ChevronRight, Edit3, Plus, Package, Target, DollarSign, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'

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

  const status = rubro.presupuesto_status
  const porcentajeUsado = status?.porcentaje_usado || 0

  const getProgressColor = (percent: number) => {
    if (percent > 100) return 'bg-red-500'
    if (percent > 85) return 'bg-orange-500'
    return 'bg-apple-blue'
  }

  const getTextColor = (percent: number) => {
    if (percent > 100) return 'text-red-500'
    if (percent > 85) return 'text-orange-500'
    return 'text-apple-blue'
  }

  return (
    <div className={cn(
      "bg-white dark:bg-apple-gray-50 rounded-[32px] border border-apple-gray-100 dark:border-white/5 transition-all duration-500 overflow-hidden",
      expanded ? "shadow-apple-lg border-apple-blue/20" : "shadow-apple hover:border-apple-blue/20"
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-8 py-6 flex items-center justify-between group"
      >
        <div className="flex items-center gap-5">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            expanded ? "bg-apple-blue text-white rotate-90" : "bg-apple-gray-50 dark:bg-white/5 text-apple-gray-300 group-hover:bg-apple-blue/10 group-hover:text-apple-blue"
          )}>
            <ChevronRight className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-foreground group-hover:text-apple-blue transition-colors">{rubro.nombre}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-apple-gray-300">{rubro.unidad || 'unidad'}</span>
              <span className="w-1 h-1 rounded-full bg-apple-gray-200" />
              <span className="text-[10px] font-black uppercase tracking-widest text-apple-gray-300">{rubro.insumos.length} insumos</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-black text-foreground">{rubro.presupuesto_ur?.toLocaleString('es-UY')} <span className="text-sm font-medium text-apple-gray-300">UR</span></p>
          <p className="text-[11px] font-bold text-apple-gray-400 mt-1 uppercase tracking-tighter">{formatPesos(rubro.presupuesto || 0)}</p>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-8 pb-8 animate-apple-slide-up space-y-8">
          {/* Progress Section */}
          {status && (
            <div className="p-6 bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-[24px] border border-apple-gray-100 dark:border-white/[0.05]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-apple-gray-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-apple-gray-400">Control Ejecución</span>
                </div>
                <span className={cn("text-xs font-black uppercase tracking-widest", getTextColor(porcentajeUsado))}>
                  {porcentajeUsado.toFixed(1)}% utilizado
                </span>
              </div>
              <div className="w-full bg-apple-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(porcentajeUsado))}
                  style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em]">Gastado Real</p>
                  <p className="text-sm font-bold text-foreground">{formatPesos(status.gastado)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em]">Disponible</p>
                  <p className={cn("text-sm font-bold", status.disponible < 0 ? "text-red-500" : "text-emerald-500")}>
                    {formatPesos(status.disponible)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Budget Editing */}
          {canEdit && (
            <div className="flex items-center justify-between py-4 border-y border-apple-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                  <DollarSign className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-foreground">Ajustar Presupuesto</p>
              </div>

              {editingPresupuesto ? (
                <div className="flex items-center gap-3 animate-apple-fade-in">
                  <div className="relative">
                    <input
                      type="number"
                      value={presupuestoValue}
                      onChange={(e) => setPresupuestoValue(e.target.value)}
                      className="w-28 h-10 bg-white dark:bg-black border border-apple-gray-200 dark:border-white/10 rounded-xl px-3 pr-8 text-sm font-bold outline-none focus:ring-4 focus:ring-apple-blue/10 transition-all"
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-apple-gray-300">UR</span>
                  </div>
                  <button
                    onClick={handleSavePresupuesto}
                    disabled={savingPresupuesto}
                    className="h-10 px-4 bg-apple-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-apple-blue-dark transition-all disabled:opacity-50"
                  >
                    {savingPresupuesto ? '...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setEditingPresupuesto(false)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-apple-gray-400 hover:text-red-500 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPresupuesto(true)}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-apple-blue hover:bg-apple-blue/5 transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Modificar
                </button>
              )}
            </div>
          )}

          {/* Insumos List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-apple-gray-400 uppercase tracking-[0.2em] ml-1">Insumos del Rubro</h4>
              <span className="text-[10px] font-bold text-apple-gray-300 px-2 py-0.5 bg-apple-gray-50 dark:bg-white/5 rounded-full">
                Total: {rubro.insumos.length}
              </span>
            </div>

            <div className="space-y-3">
              {rubro.insumos.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-apple-gray-100 dark:border-white/5 rounded-[24px] text-center">
                  <Package className="w-8 h-8 text-apple-gray-100 mx-auto mb-2" />
                  <p className="text-xs font-medium text-apple-gray-300 italic">No hay insumos vinculados</p>
                </div>
              ) : (
                rubro.insumos.map((insumo) => (
                  <InsumoItem
                    key={insumo.id}
                    insumo={insumo}
                    canEdit={canEditInsumos}
                    onEdit={() => setEditingInsumo(insumo)}
                    onRemove={() => handleRemoveInsumo(insumo.id)}
                    isRemoving={removingInsumoId === insumo.id}
                  />
                ))
              )}
            </div>

            {canEditInsumos && (
              <div className="pt-2">
                {showAddInsumo ? (
                  <div className="animate-apple-slide-up">
                    <AddInsumoSelector
                      rubroId={rubro.id}
                      onClose={() => setShowAddInsumo(false)}
                      onAdded={() => {
                        setShowAddInsumo(false)
                        onRefresh()
                      }}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddInsumo(true)}
                    className="w-full h-14 border-2 border-dashed border-apple-gray-100 dark:border-white/5 rounded-[24px] text-xs font-black uppercase tracking-widest text-apple-gray-400 hover:border-apple-blue/30 hover:text-apple-blue transition-all flex items-center justify-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-apple-blue/10 transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                    Vincular Insumo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
