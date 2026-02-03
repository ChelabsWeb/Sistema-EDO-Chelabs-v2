'use client'

import { useState, useOptimistic, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, ClipboardList, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Tarea {
  id: string
  descripcion: string
  completada: boolean | null
  orden: number | null
  created_at: string | null
  cantidad: number | null
  unidad: string | null
}

interface OTTareasProps {
  otId: string
  obraId: string
  tareas: Tarea[]
  canEdit: boolean
  rubroUnidad?: string | null
}

export function OTTareas({ otId, obraId, tareas: initialTareas, canEdit, rubroUnidad }: OTTareasProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [newTarea, setNewTarea] = useState('')
  const [newCantidad, setNewCantidad] = useState<string>('')
  const [newUnidad, setNewUnidad] = useState<string>(rubroUnidad || '')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const [optimisticTareas, addOptimisticTarea] = useOptimistic(
    initialTareas,
    (state, update: { id: string; completada: boolean }) => {
      return state.map((t) =>
        t.id === update.id ? { ...t, completada: update.completada } : t
      )
    }
  )

  const completadas = optimisticTareas.filter((t) => t.completada).length
  const total = optimisticTareas.length
  const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0

  const handleToggleTarea = async (tareaId: string, completada: boolean) => {
    if (!canEdit) return

    startTransition(async () => {
      addOptimisticTarea({ id: tareaId, completada })

      if (otId.startsWith('demo-') || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        return
      }

      const supabase = createClient()
      const { error } = await supabase
        .from('tareas')
        .update({ completada })
        .eq('id', tareaId)

      if (error) {
        console.error('Error updating tarea:', error)
        setError('Error al actualizar la tarea')
      }
      router.refresh()
    })

    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleAddTarea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTarea.trim() || !canEdit) return

    setIsAdding(true)
    setError(null)

    const supabase = createClient()
    const cantidadNum = newCantidad ? parseFloat(newCantidad) : null

    const { error } = await supabase
      .from('tareas')
      .insert({
        orden_trabajo_id: otId,
        descripcion: newTarea.trim(),
        completada: false,
        orden: total,
        cantidad: cantidadNum,
        unidad: cantidadNum ? (newUnidad || rubroUnidad || null) : null,
      })

    if (error) {
      setError('Error al agregar la tarea')
    } else {
      setNewTarea('')
      setNewCantidad('')
      setNewUnidad(rubroUnidad || '')
      setShowAddForm(false)
      router.refresh()
    }
    setIsAdding(false)
  }

  const handleDeleteTarea = async (tareaId: string) => {
    if (!canEdit) return

    const supabase = createClient()
    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('id', tareaId)

    if (error) {
      setError('Error al eliminar la tarea')
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-apple-gray-50/50 backdrop-blur-sm">
      <div className="p-8 space-y-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-tight">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500/50 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Task list with AnimatePresence */}
        <div className="space-y-4 min-h-[200px]">
          {optimisticTareas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-[32px] border border-dashed border-apple-gray-100 dark:border-white/5">
              <div className="w-16 h-16 bg-apple-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-apple-gray-200" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300">Hoja de ruta vacía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode='popLayout'>
                {optimisticTareas
                  .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                  .map((tarea) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={tarea.id}
                      className={cn(
                        "group flex items-center gap-5 p-5 rounded-[24px] border transition-all duration-500",
                        tarea.completada
                          ? "bg-apple-gray-50/30 dark:bg-white/[0.01] border-transparent opacity-60"
                          : "bg-white dark:bg-apple-gray-50 border-apple-gray-100 dark:border-white/10 shadow-apple-sm hover:shadow-apple-float hover:border-apple-blue/20"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTarea(tarea.id, !tarea.completada)}
                        disabled={!canEdit || isPending}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-2 shrink-0 scale-up-center",
                          tarea.completada
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-apple-gray-50 dark:bg-black/20 border-apple-gray-200 dark:border-white/10 hover:border-emerald-400 group-hover:scale-110"
                        )}
                      >
                        {tarea.completada ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-0 group-hover:opacity-40" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-[15px] font-bold tracking-tight transition-all duration-500 truncate",
                          tarea.completada ? "text-apple-gray-300 line-through" : "text-foreground"
                        )}>
                          {tarea.descripcion}
                        </p>
                        {tarea.cantidad !== null && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="inline-flex text-[9px] font-black text-apple-blue uppercase tracking-widest bg-apple-blue/5 dark:bg-apple-blue/10 px-2 py-0.5 rounded-md border border-apple-blue/10">
                              {tarea.cantidad} {tarea.unidad}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {canEdit && !tarea.completada && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTarea(tarea.id)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-apple-gray-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Action Button / Form - Redesigned to be more Premium */}
        {canEdit && (
          <div className="pt-4">
            <AnimatePresence mode='wait'>
              {!showAddForm ? (
                <motion.button
                  key="add-btn"
                  layoutId="add-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAddForm(true)}
                  className="w-full h-16 border-2 border-dashed border-apple-gray-100 dark:border-white/5 rounded-3xl flex items-center justify-center gap-3 text-apple-gray-300 hover:text-apple-blue hover:border-apple-blue/30 hover:bg-apple-blue/5 transition-all text-[11px] font-black uppercase tracking-[0.2em] group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Agregar Hito de Obra
                </motion.button>
              ) : (
                <motion.form
                  key="add-form"
                  layoutId="add-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleAddTarea}
                  className="space-y-6 bg-apple-gray-50/50 dark:bg-black/20 p-8 rounded-[32px] border border-apple-gray-100 dark:border-white/10 shadow-apple-float"
                >
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest ml-2">Descripción del Hito</label>
                    <input
                      type="text"
                      autoFocus
                      required
                      value={newTarea}
                      onChange={(e) => setNewTarea(e.target.value)}
                      placeholder="Ej: Colocación de dintel..."
                      className="w-full bg-white dark:bg-apple-gray-50 h-14 px-6 rounded-2xl text-lg font-bold text-foreground placeholder:text-apple-gray-100 focus:ring-8 focus:ring-apple-blue/5 focus:border-apple-blue border-apple-gray-100 dark:border-white/5 outline-none transition-all shadow-apple-sm"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="space-y-3 flex-1">
                      <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest ml-2">Cantidad (Opcional)</label>
                      <div className="flex items-center gap-2 bg-white dark:bg-apple-gray-50 rounded-2xl px-6 h-12 border border-apple-gray-100 dark:border-white/5 shadow-apple-sm focus-within:ring-8 focus-within:ring-apple-blue/5 transition-all">
                        <input
                          type="number"
                          step="0.01"
                          value={newCantidad}
                          onChange={(e) => setNewCantidad(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-transparent text-sm font-black text-foreground outline-none"
                        />
                        <span className="text-[9px] font-black text-apple-blue uppercase tracking-widest whitespace-nowrap">
                          {newUnidad || rubroUnidad || 'UND'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-apple-gray-300 hover:text-foreground transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isAdding || !newTarea.trim()}
                        className="h-12 px-8 bg-apple-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-apple-float hover:bg-apple-blue-dark active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Confirmar
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
