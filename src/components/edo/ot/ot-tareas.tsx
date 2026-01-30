'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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

      // Bypass DB update in DEMO_MODE or for demo- OTs
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
    <div className="flex flex-col h-full bg-white dark:bg-apple-gray-50">
      <div className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-apple-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Task list */}
        <div className="space-y-3 min-h-[200px]">
          {optimisticTareas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-40">
              <ClipboardList className="w-12 h-12 mb-2" />
              <p className="text-sm font-medium">No hay tareas definidas</p>
            </div>
          ) : (
            optimisticTareas
              .sort((a, b) => (a.orden || 0) - (b.orden || 0))
              .map((tarea) => (
                <div
                  key={tarea.id}
                  className={cn(
                    "group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                    tarea.completada
                      ? "bg-apple-gray-50/50 dark:bg-white/[0.02] border-apple-gray-100 dark:border-white/[0.05]"
                      : "bg-white dark:bg-white/[0.04] border-apple-gray-100 dark:border-white/[0.08] shadow-apple-sm hover:shadow-apple"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTarea(tarea.id, !tarea.completada)}
                    disabled={!canEdit || isPending}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                      tarea.completada
                        ? "bg-emerald-500 border-emerald-500 text-white scale-110"
                        : "border-apple-gray-200 dark:border-white/20 hover:border-emerald-400"
                    )}
                  >
                    {tarea.completada ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-0 group-hover:opacity-40" />}
                  </button>

                  <div className="flex-1">
                    <p className={cn(
                      "text-[15px] font-medium transition-all duration-500",
                      tarea.completada ? "text-apple-gray-400 line-through opacity-60" : "text-foreground"
                    )}>
                      {tarea.descripcion}
                    </p>
                    {tarea.cantidad !== null && (
                      <span className="inline-flex mt-1 text-[10px] font-black text-apple-blue uppercase tracking-widest bg-apple-blue/5 px-2 py-0.5 rounded-full">
                        {tarea.cantidad} {tarea.unidad}
                      </span>
                    )}
                  </div>

                  {canEdit && !tarea.completada && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTarea(tarea.id)}
                      className="opacity-0 group-hover:opacity-100 text-apple-gray-300 hover:text-red-500 transition-all p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
          )}
        </div>

        {/* Action Button / Form */}
        {canEdit && (
          <div className="pt-4">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full h-14 border-2 border-dashed border-apple-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center gap-2 text-apple-gray-300 hover:text-apple-blue hover:border-apple-blue/40 hover:bg-apple-blue/5 transition-all text-sm font-bold tracking-tight"
              >
                <Plus className="w-5 h-5" />
                Nueva Tarea
              </button>
            ) : (
              <form onSubmit={handleAddTarea} className="space-y-4 bg-apple-gray-50/50 dark:bg-white/[0.02] p-6 rounded-3xl border border-apple-gray-100 dark:border-white/[0.05] animate-apple-slide-up">
                <input
                  type="text"
                  autoFocus
                  value={newTarea}
                  onChange={(e) => setNewTarea(e.target.value)}
                  placeholder="¿Qué falta hacer?"
                  className="w-full bg-transparent text-lg font-bold text-foreground placeholder-apple-gray-300 outline-none"
                />
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 bg-white dark:bg-black rounded-xl px-3 py-1.5 border border-apple-gray-100 dark:border-white/10">
                    <input
                      type="number"
                      step="0.01"
                      value={newCantidad}
                      onChange={(e) => setNewCantidad(e.target.value)}
                      placeholder="0.00"
                      className="w-16 bg-transparent text-sm font-bold text-foreground outline-none"
                    />
                    <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">
                      {newUnidad || rubroUnidad || 'UN'}
                    </span>
                  </div>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-bold text-apple-gray-400 hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding || !newTarea.trim()}
                    className="px-6 py-2 bg-apple-blue text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-apple-blue-dark active:scale-95 transition-all disabled:opacity-50"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { ClipboardList } from 'lucide-react'
