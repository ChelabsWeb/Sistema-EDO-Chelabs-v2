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
    if (percent > 100) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
    if (percent > 85) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
    return 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]'
  }

  const getTextColor = (percent: number) => {
    if (percent > 100) return 'text-red-400'
    if (percent > 85) return 'text-amber-400'
    return 'text-blue-400'
  }

  return (
    <div className={cn(
      "bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/10 transition-all duration-500 overflow-hidden",
      expanded ? "shadow-2xl border-blue-500/20" : "hover:border-blue-500/20"
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-8 py-6 flex items-center justify-between group"
      >
        <div className="flex items-center gap-5">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/5",
            expanded ? "bg-blue-600 text-white rotate-90" : "bg-white/5 text-slate-500 group-hover:bg-blue-600/10 group-hover:text-blue-500"
          )}>
            <ChevronRight className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{rubro.nombre}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{rubro.unidad || 'unidad'}</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{rubro.insumos.length} insumos</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl font-black text-white">{rubro.presupuesto_ur?.toLocaleString('es-UY')} <span className="text-sm font-medium text-slate-500">UR</span></p>
          <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{formatPesos(rubro.presupuesto || 0)}</p>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-8 pb-8 animate-apple-slide-up space-y-8">
          {/* Progress Section */}
          {status && (
            <div className="p-6 bg-white/[0.02] rounded-[24px] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Control Ejecución</span>
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-widest", getTextColor(porcentajeUsado))}>
                  {porcentajeUsado.toFixed(1)}% utilizado
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(porcentajeUsado))}
                  style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gastado Real</p>
                  <p className="text-sm font-black text-white">{formatPesos(status.gastado)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Disponible</p>
                  <p className={cn("text-sm font-black", status.disponible < 0 ? "text-red-400" : "text-emerald-400")}>
                    {formatPesos(status.disponible)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Budget Editing */}
          {canEdit && (
            <div className="flex items-center justify-between py-6 border-y border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Ajustar Presupuesto</p>
                  <p className="text-[10px] text-slate-500 font-medium tracking-tight">Modifica la asignación en UR</p>
                </div>
              </div>

              {editingPresupuesto ? (
                <div className="flex items-center gap-3 animate-apple-fade-in">
                  <div className="relative">
                    <input
                      type="number"
                      value={presupuestoValue}
                      onChange={(e) => setPresupuestoValue(e.target.value)}
                      className="w-32 h-12 bg-black/40 border border-white/10 rounded-xl px-4 pr-10 text-sm font-black text-white outline-none focus:border-blue-500/50 transition-all"
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">UR</span>
                  </div>
                  <button
                    onClick={handleSavePresupuesto}
                    disabled={savingPresupuesto}
                    className="h-12 px-6 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50"
                  >
                    {savingPresupuesto ? '...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setEditingPresupuesto(false)}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 transition-all border border-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPresupuesto(true)}
                  className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-600/10 transition-all flex items-center gap-2 border border-blue-600/10"
                >
                  <Edit3 className="w-4 h-4" />
                  Modificar
                </button>
              )}
            </div>
          )}

          {/* Insumos List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Insumos del Rubro</h4>
              <span className="text-[10px] font-black text-slate-400 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                Total: {rubro.insumos.length}
              </span>
            </div>

            <div className="space-y-4">
              {rubro.insumos.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-white/5 rounded-[32px] text-center">
                  <Package className="w-10 h-10 text-slate-800 mx-auto mb-4" />
                  <p className="text-xs font-medium text-slate-500 italic">No hay insumos vinculados</p>
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
                    className="w-full h-16 border-2 border-dashed border-white/5 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-blue-500/30 hover:text-blue-500 transition-all flex items-center justify-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors border border-white/5">
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
