'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createOT, updateOT, getRubroBudgetStatus } from '@/app/actions/ordenes-trabajo'
import { formatPesos } from '@/lib/utils/currency'
import { InsumoSelector, type InsumoSeleccionado } from './insumo-selector'
import {
  AlertTriangle, CheckCircle2, Calculator, TrendingUp, Wallet,
  Tag, AlignLeft, AlertCircle,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Rubro {
  id: string
  nombre: string
  unidad: string | null
  presupuesto: number
}

interface InsumoObra {
  id: string
  nombre: string
  unidad: string
  tipo: 'material' | 'mano_de_obra'
  precio_referencia: number | null
  precio_unitario: number | null
}

interface OTCreateFormProps {
  obraId: string
  rubros: Rubro[]
  insumosObra: InsumoObra[]
  initialData?: {
    id: string
    rubro_id: string
    descripcion: string
    insumos_estimados: Array<{
      insumo_id: string
      cantidad_estimada: number
      insumo: {
        precio_referencia: number | null
      }
    }>
  }
}

export function OTCreateForm({ obraId, rubros, insumosObra, initialData }: OTCreateFormProps) {
  const router = useRouter()
  const isEditing = !!initialData
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedRubroId, setSelectedRubroId] = useState(initialData?.rubro_id || '')
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '')

  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>(
    initialData?.insumos_estimados.map(ie => ({
      insumo_id: ie.insumo_id,
      nombre: (ie as any).insumos?.nombre || (ie as any).insumo?.nombre || 'Insumo',
      unidad: (ie as any).insumos?.unidad || (ie as any).insumo?.unidad || '',
      cantidad: ie.cantidad_estimada,
      precio_unitario: ie.insumo.precio_referencia || 0
    })) || []
  )
  const [costoEstimado, setCostoEstimado] = useState(0)
  const [budgetStatus, setBudgetStatus] = useState<{
    presupuesto: number
    gastado: number
    disponible: number
    porcentaje_usado: number
  } | null>(null)
  const [isLoadingBudget, setIsLoadingBudget] = useState(false)

  // Load budget status when rubro changes
  useEffect(() => {
    async function loadBudgetStatus() {
      if (!selectedRubroId) {
        setCostoEstimado(0)
        setBudgetStatus(null)
        setInsumosSeleccionados([])
        return
      }

      setIsLoadingBudget(true)
      try {
        const budgetResult = await getRubroBudgetStatus(selectedRubroId)
        if (budgetResult.success) {
          setBudgetStatus(budgetResult.data)
        }
      } catch {
        console.error('Error loading budget status')
      } finally {
        setIsLoadingBudget(false)
      }
    }

    loadBudgetStatus()
  }, [selectedRubroId])

  // Handle insumos selection change
  const handleInsumosChange = useCallback((insumos: InsumoSeleccionado[]) => {
    setInsumosSeleccionados(insumos)
    const total = insumos.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0)
    setCostoEstimado(total)
  }, [])

  // Initial cost calculation
  useEffect(() => {
    const total = insumosSeleccionados.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0)
    setCostoEstimado(total)
  }, [insumosSeleccionados])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRubroId || !descripcion) return

    setError(null)
    setIsSubmitting(true)

    try {
      const insumosParaEnviar = insumosSeleccionados.map((i) => ({
        insumo_id: i.insumo_id,
        cantidad_estimada: i.cantidad,
      }))

      const result = isEditing
        ? await updateOT({
          id: initialData!.id,
          rubro_id: selectedRubroId,
          descripcion,
          insumos_seleccionados: insumosParaEnviar,
        })
        : await createOT({
          obra_id: obraId,
          rubro_id: selectedRubroId,
          descripcion,
          cantidad: 1,
          insumos_seleccionados: insumosParaEnviar.length > 0 ? insumosParaEnviar : undefined,
        })

      if (result.success) {
        router.push(`/obras/${obraId}/ordenes-trabajo/${result.data.id}`)
        router.refresh()
      } else {
        setError(result.error)
      }
    } catch {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la orden de trabajo`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const excedesPresupuesto = budgetStatus && costoEstimado > budgetStatus.disponible

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-4 text-destructive"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 1: Identification */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0">
            <span className="font-bold text-foreground">1</span>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight uppercase">
              {isEditing ? 'IDENTIFICACIÓN (EDITAR)' : 'IDENTIFICACIÓN'}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditing ? 'Ajusta los detalles generales de la orden.' : 'Selecciona el rubro presupuestal y define la tarea.'}
            </p>
          </div>
        </div>

        <div className="pl-14 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rubro Presupuestal de la Obra</label>
            </div>
            <Select value={selectedRubroId} onValueChange={setSelectedRubroId}>
              <SelectTrigger className="w-full h-12 rounded-xl text-base bg-background font-semibold">
                <SelectValue placeholder="Elegir rubro para esta orden..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {rubros.map((rubro) => (
                  <SelectItem key={rubro.id} value={rubro.id} className="py-3 px-4 font-medium">
                    {rubro.nombre} {rubro.unidad ? `(${rubro.unidad})` : ''} - Base: {formatPesos(rubro.presupuesto)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-muted-foreground" />
              <label htmlFor="descripcion" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Descripción Técnica del Trabajo</label>
            </div>
            <div className="relative">
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                rows={4}
                maxLength={500}
                placeholder="Describe técnicamente lo que se debe ejecutar en esta etapa..."
                className="resize-none rounded-xl text-base p-4 min-h-[140px] bg-background font-medium"
              />
              <div className="absolute bottom-4 right-4 text-xs font-bold text-muted-foreground bg-muted/80 backdrop-blur px-2 py-1 rounded-md">
                {descripcion.length} / 500
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2: Budget Control */}
      {selectedRubroId && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-4 border-t"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0">
              <span className="font-bold text-foreground">2</span>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight uppercase">CONTROL DE INVERSIÓN</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Verifica la disponibilidad financiera antes de proceder.</p>
            </div>
          </div>

          <div className="pl-14">
            {budgetStatus ? (
              <div className="bg-muted/30 rounded-2xl border p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">Consumo del Rubro</p>
                      <p className="text-2xl font-bold tracking-tight">
                        {budgetStatus.porcentaje_usado.toFixed(1)}% <span className="text-sm font-normal text-muted-foreground">ejecutado</span>
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 border",
                    budgetStatus.porcentaje_usado > 100
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  )}>
                    {budgetStatus.porcentaje_usado > 100 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {budgetStatus.porcentaje_usado > 100 ? "Presupuesto Agotado" : "Presupuesto Saludable"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-background rounded-xl border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Base Asignada</p>
                    <p className="text-xl font-bold">{formatPesos(budgetStatus.presupuesto)}</p>
                  </div>
                  <div className="p-4 bg-background rounded-xl border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Ejecución Real</p>
                    <p className="text-xl font-bold">{formatPesos(budgetStatus.gastado)}</p>
                  </div>
                  <div className="p-4 bg-background rounded-xl border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Saldo Restante</p>
                    <p className={cn(
                      "text-xl font-bold",
                      budgetStatus.disponible < 0 ? 'text-destructive' : 'text-emerald-500'
                    )}>
                      {formatPesos(budgetStatus.disponible)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center border-2 border-dashed rounded-2xl">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-muted-foreground">Cargando presupuesto...</p>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* STEP 3: Resources */}
      {selectedRubroId && budgetStatus && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-4 border-t"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0">
              <span className="font-bold text-foreground">3</span>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight uppercase">PLANIFICACIÓN DE RECURSOS</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Vincula materiales y mano de obra a esta orden.</p>
            </div>
          </div>

          <div className="pl-14">
            <InsumoSelector
              obraId={obraId}
              insumosObra={insumosObra}
              onChange={handleInsumosChange}
              isLoading={isLoadingBudget}
              initialSelection={insumosSeleccionados}
            />
          </div>
        </motion.section>
      )}

      {/* Final Summary Overlay */}
      <div className={cn(
        "sticky bottom-4 z-[60] w-full transition-all duration-500 pt-8",
        selectedRubroId ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "p-4 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 border",
          excedesPresupuesto
            ? "bg-amber-500/10 border-amber-500/20 shadow-amber-500/10"
            : "bg-background/95 border-border shadow-black/5"
        )}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Costa Estimado
                </p>
                <p className={cn(
                  "text-3xl font-bold tracking-tight inline-flex items-center gap-3",
                  excedesPresupuesto ? 'text-amber-500' : 'text-foreground'
                )}>
                  {formatPesos(costoEstimado)}
                  {excedesPresupuesto && (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/50 bg-amber-500/10 animate-pulse text-xs -translate-y-1">
                      Desvío Detectado
                    </Badge>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1 md:flex-none"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !selectedRubroId || !descripcion}
                className={cn(
                  "flex-1 md:flex-none uppercase font-bold tracking-wider",
                  excedesPresupuesto && "bg-amber-500 text-white hover:bg-amber-600"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Procesando
                  </>
                ) : (
                  <>
                    {isEditing ? 'Guardar Cambios' : 'Lanzar Orden'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
