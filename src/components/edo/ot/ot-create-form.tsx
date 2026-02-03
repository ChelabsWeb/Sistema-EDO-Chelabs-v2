'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createOT, updateOT, getRubroBudgetStatus } from '@/app/actions/ordenes-trabajo'
import { formatPesos } from '@/lib/utils/currency'
import { InsumoSelector, type InsumoSeleccionado } from './insumo-selector'
import {
  AlertTriangle, CheckCircle2, Calculator, TrendingUp, Wallet,
  Tag, AlignLeft, AlertCircle,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Info,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppleSelector } from '@/components/ui/apple-selector'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

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
  }, [])

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
  const formattedRubros = rubros.map(r => ({
    id: r.id,
    nombre: r.nombre,
    unidad: r.unidad,
    subtitle: `Presupuesto Base: ${formatPesos(r.presupuesto)}`
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-16 relative z-10 pb-32">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center gap-6 text-red-500 shadow-2xl shadow-red-500/5 antialiased"
          >
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Error de Validación</p>
              <p className="text-lg font-black tracking-tight">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 1: Identification */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-apple-blue rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-apple-blue/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">
              {isEditing ? '1. Modificación de Datos' : '1. Identificación'}
            </h3>
            <p className="text-sm font-medium text-apple-gray-400">
              {isEditing ? 'Ajusta los detalles generales de la orden.' : 'Selecciona el rubro presupuestal y define la tarea.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 pl-4">
          <AppleSelector
            options={formattedRubros}
            value={selectedRubroId}
            onSelect={setSelectedRubroId}
            label="Rubro Presupuestal de la Obra"
            icon={<Tag className="w-4 h-4 text-apple-blue" />}
            placeholder="Elegir rubro para esta orden..."
            searchPlaceholder="Buscar por nombre de rubro..."
          />

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <AlignLeft className="w-4 h-4 text-apple-blue" />
              <label htmlFor="descripcion" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Descripción Técnica del Trabajo</label>
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
                className="w-full p-10 bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/10 rounded-[40px] text-lg font-bold text-foreground outline-none focus:ring-8 focus:ring-apple-blue/10 focus:border-apple-blue transition-all resize-none shadow-inner tracking-tight leading-relaxed placeholder:text-apple-gray-400/50"
              />
              <div className="absolute bottom-10 right-10 text-[10px] font-black text-apple-gray-200 uppercase tracking-widest bg-white/50 dark:bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
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
          className="space-y-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">2. Control de Inversión</h3>
              <p className="text-sm font-medium text-apple-gray-400">Verifica la disponibilidad financiera antes de proceder.</p>
            </div>
          </div>

          <div className="pl-4">
            {budgetStatus ? (
              <div className="bg-white dark:bg-apple-gray-50/50 rounded-[48px] border border-apple-gray-100 dark:border-white/5 p-12 space-y-10 relative overflow-hidden shadow-apple-float">
                {isLoadingBudget && (
                  <div className="absolute inset-0 backdrop-blur-xl bg-white/40 dark:bg-black/40 flex flex-col items-center justify-center z-20 gap-4">
                    <Loader2 className="w-12 h-12 text-apple-blue animate-spin" />
                    <p className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Sincronizando Libro Diario...</p>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-4 group">
                    <div className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-apple-gray-400 uppercase tracking-widest mb-1">Ratio de Consumo</h4>
                      <p className="text-3xl font-black text-foreground tracking-tighter italic selection:bg-apple-blue/20">
                        {budgetStatus.porcentaje_usado.toFixed(1)}% <span className="text-apple-gray-200 dark:text-apple-gray-400/30 text-xl font-medium tracking-tight">ejecutado</span>
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    "px-8 py-3.5 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] border flex items-center gap-3",
                    budgetStatus.porcentaje_usado > 100
                      ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  )}>
                    {budgetStatus.porcentaje_usado > 100 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {budgetStatus.porcentaje_usado > 100 ? "Presupuesto Agotado" : "Presupuesto Saludable"}
                  </div>
                </div>

                {budgetStatus.presupuesto === 0 && (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 animate-apple-fade-in">
                    <div className="flex items-center gap-4 text-amber-600 dark:text-amber-500">
                      <AlertTriangle className="w-6 h-6 shrink-0" />
                      <p className="text-sm font-bold tracking-tight">
                        Este rubro no cuenta con presupuesto asignado.
                      </p>
                    </div>
                    <Link
                      href={`/obras/${obraId}/rubros/${selectedRubroId}/editar`}
                      className="px-6 py-2 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
                    >
                      Configurar Presupuesto
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                  <div className="space-y-2 p-6 bg-apple-gray-50/50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Base Asignada</p>
                    <p className="text-3xl font-black text-foreground tracking-tighter">{formatPesos(budgetStatus.presupuesto)}</p>
                  </div>
                  <div className="space-y-2 p-6 bg-apple-gray-50/50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Ejecución Real</p>
                    <p className="text-3xl font-black text-foreground tracking-tighter text-apple-blue">{formatPesos(budgetStatus.gastado)}</p>
                  </div>
                  <div className="space-y-2 p-6 bg-apple-gray-50/50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Saldo Restante</p>
                    <p className={cn(
                      "text-3xl font-black tracking-tighter",
                      budgetStatus.disponible < 0 ? 'text-red-500' : 'text-emerald-500'
                    )}>
                      {formatPesos(budgetStatus.disponible)}
                    </p>
                  </div>
                </div>

                <div className="relative pt-6">
                  <div className="h-4 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner flex border border-apple-gray-100 dark:border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budgetStatus.porcentaje_usado, 100)}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={cn(
                        "h-full relative transition-colors duration-500",
                        budgetStatus.porcentaje_usado > 100 ? 'bg-red-500' :
                          budgetStatus.porcentaje_usado > 80 ? 'bg-amber-500' :
                            'bg-apple-blue'
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                    </motion.div>
                  </div>
                  {budgetStatus.porcentaje_usado > 100 && (
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      Atención: Has superado el presupuesto inicial del rubro.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-20 text-center bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-[48px] border border-dashed border-apple-gray-100 dark:border-white/10">
                <Loader2 className="w-10 h-10 text-apple-blue animate-spin mx-auto mb-6 opacity-30" />
                <p className="text-apple-gray-300 font-bold tracking-tight uppercase tracking-widest">Evaluando factibilidad técnica...</p>
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
          className="space-y-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">3. Planificación de Recursos</h3>
              <p className="text-sm font-medium text-apple-gray-400">Vincula materiales y mano de obra a esta orden.</p>
            </div>
          </div>

          <div className="pl-4">
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

      {/* Final Summary Overlay - Always visible to guide the user */}
      <div className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-48px)] max-w-7xl transition-all duration-700",
        selectedRubroId ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "p-3 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] backdrop-blur-3xl transition-all duration-500 border",
          excedesPresupuesto
            ? "bg-amber-500/10 border-amber-500/20"
            : "bg-white/80 dark:bg-black/70 border-white/20 dark:border-white/10"
        )}>
          <div className="bg-white/40 dark:bg-white/5 rounded-[34px] px-10 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-apple-blue" />
                  Costo Estimado
                </p>
                <p className={cn(
                  "text-5xl font-black tracking-tighter leading-none transition-all",
                  excedesPresupuesto ? 'text-amber-500 scale-105' : 'text-foreground'
                )}>
                  {formatPesos(costoEstimado)}
                </p>
              </div>

              {excedesPresupuesto && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-4 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-500/20"
                >
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="text-[9px] font-black uppercase leading-[1.2] tracking-widest">
                    Alerta de Desvío<br />Requiere Validación
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-5 w-full md:w-auto">
              {!descripcion && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse hidden md:block">
                  Complete la descripción técnica
                </p>
              )}
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 md:flex-none px-8 h-12 rounded-full text-[10px] font-black uppercase tracking-widest text-apple-gray-400 hover:text-foreground transition-all hover:bg-apple-gray-100 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedRubroId || !descripcion}
                className={cn(
                  "flex-1 md:flex-none h-20 px-14 rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-4 group active:scale-95 disabled:grayscale disabled:opacity-30 disabled:cursor-not-allowed",
                  excedesPresupuesto
                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30"
                    : "bg-apple-blue text-white hover:bg-apple-blue-dark shadow-apple-blue/30"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {isEditing ? 'Guardar Cambios' : 'Lanzar Orden'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
