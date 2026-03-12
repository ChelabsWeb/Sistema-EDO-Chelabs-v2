'use client'

import { useState } from 'react'
import type { RubroWithInsumos, Insumo, UserRole } from '@/types/database'
import { InsumoItem } from './insumo-item'
import { EditInsumoModal } from './edit-insumo-modal'
import { AddInsumoSelector } from './add-insumo-selector'
import { updateRubroPresupuesto, removeInsumoFromRubro } from '@/app/actions/rubro-insumos'
import { ChevronDown, ChevronRight, Edit3, Plus, Package, Target, DollarSign, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

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

  return (
    <Card className={cn(
      "transition-all duration-200 overflow-hidden",
      expanded ? "border-primary/20 shadow-md" : "hover:border-primary/20"
    )}>
      {/* Header (Clickable row) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between group hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors bg-muted text-muted-foreground",
            expanded && "bg-primary/10 text-primary"
          )}>
            {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{rubro.nombre}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-muted-foreground">{rubro.unidad || 'unidad'}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs font-semibold text-muted-foreground">{rubro.insumos.length} insumos</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{rubro.presupuesto_ur?.toLocaleString('es-UY')} <span className="text-sm font-semibold text-muted-foreground">UR</span></p>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">{formatPesos(rubro.presupuesto || 0)}</p>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 px-4 pt-2 border-t bg-muted/5">
          <div className="space-y-6 pt-4">
              {/* Progress Section */}
              {status && (
                <div className="p-4 bg-background border rounded-xl">
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      <Target className="w-4 h-4" />
                      <span>Control Ejecución</span>
                    </div>
                    <span className={cn(
                        "font-bold", 
                        porcentajeUsado > 100 ? "text-destructive" : porcentajeUsado > 85 ? "text-amber-500" : "text-primary"
                    )}>
                      {porcentajeUsado.toFixed(1)}% utilizado
                    </span>
                  </div>
                  <Progress 
                      value={Math.min(porcentajeUsado, 100)} 
                      max={100}
                      className={cn(
                          porcentajeUsado > 100 ? "[&>div]:bg-destructive" : 
                          porcentajeUsado > 85 ? "[&>div]:bg-amber-500" : "[&>div]:bg-primary"
                      )}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Gastado Real</p>
                      <p className="font-bold text-foreground">{formatPesos(status.gastado)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Disponible</p>
                      <p className={cn("font-bold text-foreground", status.disponible < 0 && "text-destructive", status.disponible > 0 && "text-emerald-600")}>
                        {formatPesos(status.disponible)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Budget Editing */}
              {canEdit && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-y gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Ajustar Presupuesto</p>
                      <p className="text-xs text-muted-foreground">Modifica la asignación en UR</p>
                    </div>
                  </div>

                  {editingPresupuesto ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          type="number"
                          value={presupuestoValue}
                          onChange={(e) => setPresupuestoValue(e.target.value)}
                          className="w-32 pr-10 font-bold"
                          autoFocus
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">UR</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSavePresupuesto}
                        disabled={savingPresupuesto}
                      >
                        {savingPresupuesto ? '...' : 'Guardar'}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingPresupuesto(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPresupuesto(true)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modificar
                    </Button>
                  )}
                </div>
              )}

              {/* Insumos List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">Insumos del Rubro</h4>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    Total: {rubro.insumos.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {rubro.insumos.length === 0 ? (
                    <div className="p-8 border-2 border-dashed rounded-xl text-center bg-background">
                      <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No hay insumos vinculados</p>
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
                       <AddInsumoSelector
                          rubroId={rubro.id}
                          onClose={() => setShowAddInsumo(false)}
                          onAdded={() => {
                            setShowAddInsumo(false)
                            onRefresh()
                          }}
                        />
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => setShowAddInsumo(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Vincular Insumo
                      </Button>
                    )}
                  </div>
                )}
              </div>
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
    </Card>
  )
}
