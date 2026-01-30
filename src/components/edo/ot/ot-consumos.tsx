'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  registerConsumo,
  getInsumosEstimadosParaConsumo,
  deleteConsumo,
} from '@/app/actions/consumo-materiales'
import { formatPesos } from '@/lib/utils/currency'
import {
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Trash2,
  Edit3,
  X,
  Container
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

  useEffect(() => { loadInsumosEstimados() }, [otId])
  useEffect(() => { setConsumos(initialConsumos) }, [initialConsumos])

  const loadInsumosEstimados = async () => {
    setIsLoading(true)
    const result = await getInsumosEstimadosParaConsumo(otId)
    if (result.success) setInsumosEstimados(result.data)
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
      if ('vibrate' in navigator) navigator.vibrate(50)
    } else {
      setError(result.error)
    }
    setIsSaving(false)
  }

  const handleDeleteConsumo = async (consumoId: string) => {
    if (!confirm('¿Eliminar este registro de consumo?')) return
    const result = await deleteConsumo(consumoId, obraId, otId)
    if (result.success) router.refresh()
    else setError(result.error)
  }

  const totalEstimado = consumos.reduce((sum, c) => sum + (c.cantidad_estimada || 0) * (c.insumo?.precio_referencia || 0), 0)
  const totalReal = consumos.reduce((sum, c) => sum + c.cantidad_consumida * (c.insumo?.precio_referencia || 0), 0)
  const desvioTotal = totalReal - totalEstimado
  const desvioPercent = totalEstimado > 0 ? (desvioTotal / totalEstimado) * 100 : 0

  const getStatusColor = (percent: number | null) => {
    if (percent === null) return "text-apple-gray-400 bg-apple-gray-100"
    if (percent > 10) return "text-red-600 bg-red-50 dark:bg-red-500/10"
    if (percent > 0) return "text-orange-600 bg-orange-50 dark:bg-orange-500/10"
    return "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
  }

  if (isLoading) {
    return <div className="p-10 space-y-4 animate-pulse"><div className="h-20 bg-apple-gray-100 rounded-3xl" /><div className="h-40 bg-apple-gray-50 rounded-3xl" /></div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-8">
        {/* Header Stats Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-[32px] border border-apple-gray-100 dark:border-white/[0.05] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest mb-1">Insumos Registrados</p>
              <p className="text-2xl font-black text-foreground">{consumos.length} <span className="text-apple-gray-300 font-medium">/ {insumosEstimados.length}</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
              <Container className="w-6 h-6" />
            </div>
          </div>

          <div className={cn(
            "p-6 rounded-[32px] border flex items-center justify-between transition-all duration-500",
            desvioPercent > 0 ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"
          )}>
            <div>
              <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest mb-1">Desvío de Materiales</p>
              <div className="flex items-center gap-2">
                <p className={cn("text-2xl font-black", desvioPercent > 0 ? "text-red-500" : "text-emerald-500")}>
                  {desvioTotal >= 0 ? '+' : ''}{formatPesos(desvioTotal)}
                </p>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black", desvioPercent > 0 ? "bg-red-500 text-white" : "bg-emerald-500 text-white")}>
                  {desvioPercent.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", desvioPercent > 0 ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500")}>
              {desvioPercent > 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* List of supplies */}
        <div className="space-y-4">
          {insumosEstimados.map((insumo) => {
            const consumo = consumos.find((c) => c.insumo_id === insumo.insumo_id)
            const isEditing = editingInsumo === insumo.insumo_id

            return (
              <div
                key={insumo.insumo_id}
                className={cn(
                  "p-6 rounded-[32px] border transition-all duration-500",
                  isEditing ? "bg-white dark:bg-white/5 border-apple-blue shadow-apple-lg ring-4 ring-apple-blue/5" : "bg-apple-gray-50/30 dark:bg-white/[0.01] border-apple-gray-100 dark:border-white/[0.05]"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      consumo ? "bg-emerald-500/10 text-emerald-500" : "bg-apple-gray-100 dark:bg-white/5 text-apple-gray-400"
                    )}>
                      {consumo ? <CheckCircle2 className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{insumo.nombre}</h3>
                      <p className="text-xs text-apple-gray-400 font-medium">Planificado: {insumo.cantidad_estimada.toFixed(2)} {insumo.unidad}</p>
                    </div>
                  </div>

                  {consumo && !isEditing ? (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-black text-apple-gray-300 uppercase tracking-widest">Real Consumido</p>
                        <p className="text-lg font-black text-foreground">{consumo.cantidad_consumida.toFixed(2)} {insumo.unidad}</p>
                      </div>
                      <div className={cn("px-4 py-2 rounded-2xl flex flex-col items-end", getStatusColor(consumo.porcentaje_diferencia))}>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Delta</p>
                        <p className="text-sm font-black">{consumo.diferencia >= 0 ? '+' : ''}{consumo.diferencia.toFixed(2)}</p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <button onClick={() => handleStartEdit(insumo)} className="w-10 h-10 rounded-xl bg-apple-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 flex items-center justify-center transition-all border border-apple-gray-100 dark:border-white/10 text-apple-gray-400 hover:text-apple-blue">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteConsumo(consumo.id)} className="w-10 h-10 rounded-xl bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all border border-red-500/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : canEdit && !isEditing ? (
                    <button
                      onClick={() => handleStartEdit(insumo)}
                      className="h-12 px-6 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center gap-2 text-sm font-bold hover:bg-apple-blue hover:text-white transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Registrar Consumo
                    </button>
                  ) : null}
                </div>

                {isEditing && (
                  <div className="mt-8 p-8 bg-apple-gray-50 dark:bg-black/40 rounded-[40px] border border-apple-blue/20 dark:border-apple-blue/10 animate-apple-slide-up shadow-inner relative overflow-hidden group/form">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/form:opacity-10 transition-opacity">
                      <Calculator className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 space-y-10">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-[2] space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <label className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Cantidad Utilizada</label>
                            <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">{insumo.unidad} actual</span>
                          </div>
                          <div className="relative group/input">
                            <input
                              type="number"
                              value={cantidadInput}
                              onChange={(e) => setCantidadInput(e.target.value)}
                              autoFocus
                              placeholder={`0.00`}
                              className="w-full bg-white dark:bg-apple-gray-50 border border-apple-gray-200 dark:border-white/10 rounded-[28px] px-8 py-10 text-5xl font-black text-foreground outline-none focus:ring-8 focus:ring-apple-blue/10 focus:border-apple-blue transition-all placeholder:text-apple-gray-100"
                            />
                            <div className="absolute right-8 top-1/2 -translate-y-1/2">
                              <span className="text-xl font-black text-apple-gray-200 group-focus-within/input:text-apple-blue transition-colors">{insumo.unidad}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-[3] space-y-4">
                          <div className="px-2">
                            <label className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Notas / Observaciones de Campo</label>
                          </div>
                          <textarea
                            value={notasInput}
                            onChange={(e) => setNotasInput(e.target.value)}
                            placeholder="Ej: Desperdicio por rotura de bolsa, excedente en cimentación..."
                            className="w-full h-[124px] bg-white dark:bg-apple-gray-50 border border-apple-gray-200 dark:border-white/10 rounded-[28px] px-8 py-6 text-base font-medium outline-none focus:ring-8 focus:ring-apple-blue/10 focus:border-apple-blue transition-all resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-apple-gray-200/50 dark:border-white/5">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-apple-gray-300 uppercase tracking-widest">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          El registro afectará el costo real de la obra inmediatamente.
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 md:flex-none px-10 h-16 rounded-full text-xs font-black uppercase tracking-widest text-apple-gray-400 hover:text-foreground hover:bg-apple-gray-100 dark:hover:bg-white/5 transition-all"
                          >
                            Descartar
                          </button>
                          <button
                            onClick={() => handleSaveConsumo(insumo)}
                            disabled={isSaving}
                            className="flex-[2] md:flex-none px-12 h-16 rounded-full bg-apple-blue text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-apple-blue-dark active:scale-95 transition-all shadow-apple-float disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                            {isSaving ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Procesando...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                Registrar Consumo
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Footer Bento */}
      {consumos.length > 0 && (
        <div className="p-8 bg-apple-gray-50/50 dark:bg-white/[0.02] border-t border-apple-gray-100 dark:border-white/[0.05]">
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Inversión Planificada</p>
              <p className="text-xl font-bold">{formatPesos(totalEstimado)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Inversión Real</p>
              <p className="text-xl font-bold">{formatPesos(totalReal)}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Eficiencia</p>
              <p className={cn("text-xl font-black", desvioPercent > 0 ? "text-red-500" : "text-emerald-500")}>
                {desvioPercent >= 0 ? '+' : ''}{desvioPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
