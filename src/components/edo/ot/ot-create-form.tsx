'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createOT, getRubroBudgetStatus } from '@/app/actions/ordenes-trabajo'
import { formatPesos } from '@/lib/utils/currency'
import { InsumoSelector, type InsumoSeleccionado } from './insumo-selector'
import {
  AlertTriangle, CheckCircle2, Calculator, TrendingUp, Wallet,
  Tag, AlignLeft, ChevronDown, Check, Info, ArrowRight, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

export function OTCreateForm({ obraId, rubros, insumosObra }: OTCreateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedRubroId, setSelectedRubroId] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>([])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const insumosParaEnviar = insumosSeleccionados.map((i) => ({
        insumo_id: i.insumo_id,
        cantidad_estimada: i.cantidad,
      }))

      const result = await createOT({
        obra_id: obraId,
        rubro_id: selectedRubroId,
        descripcion,
        cantidad: 1,
        insumos_seleccionados: insumosParaEnviar.length > 0 ? insumosParaEnviar : undefined,
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
    <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-3xl flex items-center gap-4 text-red-600 dark:text-red-400 animate-apple-slide-up">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* Section: Rubro Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Tag className="w-4 h-4 text-apple-blue" />
          <label htmlFor="rubro" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Selección de Rubro Presupuestal</label>
        </div>
        <div className="relative group">
          <select
            id="rubro"
            value={selectedRubroId}
            onChange={(e) => setSelectedRubroId(e.target.value)}
            required
            className="w-full h-20 pl-8 pr-16 bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-200 dark:border-white/10 rounded-[28px] text-xl font-black text-foreground outline-none focus:ring-8 focus:ring-apple-blue/10 focus:border-apple-blue transition-all appearance-none"
          >
            <option value="" className="font-sans text-base">Elegir rubro de la obra...</option>
            {rubros.map((rubro) => (
              <option key={rubro.id} value={rubro.id} className="font-sans text-base">
                {rubro.nombre} {rubro.unidad ? `(${rubro.unidad})` : ''}
              </option>
            ))}
          </select>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-apple-gray-300">
            <ChevronDown className="w-6 h-6 group-focus-within:rotate-180 transition-transform" />
          </div>
        </div>
      </div>

      {/* Section: Budget Monitor (Bento Style) */}
      {budgetStatus && (
        <div className="bg-apple-gray-50/50 dark:bg-black/40 rounded-[40px] border border-apple-gray-100 dark:border-white/5 p-10 space-y-8 animate-apple-slide-up relative overflow-hidden">
          {isLoadingBudget && (
            <div className="absolute inset-0 backdrop-blur-sm bg-white/20 dark:bg-black/20 flex items-center justify-center z-20">
              <Loader2 className="w-10 h-10 text-apple-blue animate-spin" />
            </div>
          )}

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-apple-blue" />
              <h4 className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.3em]">Estado de Inversión</h4>
            </div>
            <span className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
              budgetStatus.porcentaje_usado > 100 ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            )}>
              {budgetStatus.porcentaje_usado.toFixed(1)}% Comprometido
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Base del Rubro</p>
              <p className="text-2xl font-black text-foreground tracking-tighter">{formatPesos(budgetStatus.presupuesto)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Comprometido</p>
              <p className="text-2xl font-black text-foreground tracking-tighter">{formatPesos(budgetStatus.gastado)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Capital Disponible</p>
              <p className={cn(
                "text-2xl font-black tracking-tighter",
                budgetStatus.disponible < 0 ? 'text-red-500' : 'text-emerald-500'
              )}>
                {formatPesos(budgetStatus.disponible)}
              </p>
            </div>
          </div>

          <div className="relative pt-4">
            <div className="h-4 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner flex">
              <div
                className={cn(
                  "h-full transition-all duration-1000 ease-out flex items-center justify-center",
                  budgetStatus.porcentaje_usado > 100 ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' :
                    budgetStatus.porcentaje_usado > 80 ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' :
                      'bg-apple-blue shadow-[0_0_20px_rgba(0,122,255,0.4)]'
                )}
                style={{ width: `${Math.min(budgetStatus.porcentaje_usado, 100)}%` }}
              >
                {budgetStatus.porcentaje_usado > 30 && <div className="h-0.5 w-[80%] bg-white/20 rounded-full" />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section: Description */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <AlignLeft className="w-4 h-4 text-apple-blue" />
          <label htmlFor="descripcion" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Definición del Trabajo</label>
        </div>
        <div className="relative group">
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows={4}
            maxLength={500}
            placeholder="Describe técnicamente lo que se debe ejecutar en esta etapa..."
            className="w-full p-8 bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-200 dark:border-white/10 rounded-[32px] text-lg font-medium text-foreground outline-none focus:ring-8 focus:ring-apple-blue/10 focus:border-apple-blue transition-all resize-none shadow-inner"
          />
          <div className="absolute bottom-6 right-8 text-[10px] font-black text-apple-gray-200 uppercase tracking-widest">
            {descripcion.length}/500
          </div>
        </div>
      </div>

      {/* Section: Insumos Inventory Selector */}
      {selectedRubroId && (
        <div className="space-y-8 py-4">
          <div className="flex items-center gap-3 px-2 border-b border-apple-gray-100 dark:border-white/5 pb-4">
            <Calculator className="w-5 h-5 text-apple-blue" />
            <h4 className="text-xl font-black text-foreground tracking-tighter">Planificación de Recursos</h4>
          </div>
          <InsumoSelector
            obraId={obraId}
            insumosObra={insumosObra}
            onChange={handleInsumosChange}
            isLoading={isLoadingBudget}
          />
        </div>
      )}

      {/* High-Impact Summary Bar */}
      <div className={cn(
        "sticky bottom-0 z-40 -mx-10 -mb-10 p-10 backdrop-blur-xl border-t transition-all duration-500",
        excedesPresupuesto
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-white/80 dark:bg-black/60 border-apple-gray-100 dark:border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]"
      )}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Costo Estimado</p>
              <p className={cn(
                "text-4xl font-black tracking-tighter leading-none transition-colors",
                excedesPresupuesto ? 'text-amber-500' : 'text-apple-blue'
              )}>
                {formatPesos(costoEstimado)}
              </p>
            </div>
            {excedesPresupuesto && (
              <div className="flex items-center gap-3 p-4 bg-amber-500 text-white rounded-2xl animate-apple-fade-in shadow-lg">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="text-[10px] font-black uppercase leading-tight tracking-wider">
                  Requiere Aprobación<br />del Director
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 md:flex-none px-10 h-16 rounded-full text-xs font-black uppercase tracking-widest text-apple-gray-400 hover:text-foreground transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedRubroId || !descripcion}
              className="flex-[2] md:flex-none h-20 px-14 rounded-[28px] bg-apple-blue text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-apple-blue-dark active:scale-95 transition-all shadow-apple-float disabled:opacity-30 flex items-center justify-center gap-4 group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  Lanzar como Borrador
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
