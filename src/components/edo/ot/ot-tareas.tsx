'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, ClipboardList, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Tarea {
  id: string
  orden_trabajo_id?: string
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
  const queryClient = useQueryClient()
  const [newTarea, setNewTarea] = useState('')
  const [newCantidad, setNewCantidad] = useState<string>('')
  const [newUnidad, setNewUnidad] = useState<string>(rubroUnidad || '')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: tareas = [] } = useQuery({
    queryKey: ['tareas', otId],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase.from('tareas').select('*').eq('orden_trabajo_id', otId)
      return data || []
    },
    initialData: initialTareas,
  })

  const completadas = tareas.filter((t: Tarea) => t.completada).length
  const total = tareas.length

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completada }: { id: string, completada: boolean }) => {
      if (otId.startsWith('demo-') || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return { id, completada }
      const supabase = createClient()
      const { error } = await supabase.from('tareas').update({ completada }).eq('id', id)
      if (error) throw new Error('Error al actualizar la tarea')
      return { id, completada }
    },
    onMutate: async ({ id, completada }) => {
      await queryClient.cancelQueries({ queryKey: ['tareas', otId] })
      const previousTareas = queryClient.getQueryData<Tarea[]>(['tareas', otId])
      queryClient.setQueryData<Tarea[]>(['tareas', otId], old =>
        old?.map(t => t.id === id ? { ...t, completada } : t)
      )
      return { previousTareas }
    },
    onError: (err, variables, context) => {
      if (context?.previousTareas) queryClient.setQueryData(['tareas', otId], context.previousTareas)
      setError(err.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas', otId] })
      router.refresh()
    }
  })

  const addMutation = useMutation({
    mutationFn: async (newTareaObj: any) => {
      const supabase = createClient()
      const { data, error } = await supabase.from('tareas').insert(newTareaObj).select().single()
      if (error) throw new Error('Error al agregar la tarea')
      return data
    },
    onMutate: async (newTareaObj) => {
      await queryClient.cancelQueries({ queryKey: ['tareas', otId] })
      const previousTareas = queryClient.getQueryData<Tarea[]>(['tareas', otId])
      const optimisticTask: Tarea = {
        id: `temp-${Date.now()}`,
        descripcion: newTareaObj.descripcion!,
        completada: false,
        orden: newTareaObj.orden!,
        created_at: new Date().toISOString(),
        cantidad: newTareaObj.cantidad || null,
        unidad: newTareaObj.unidad || null,
      }
      queryClient.setQueryData<Tarea[]>(['tareas', otId], old => [...(old || []), optimisticTask])
      return { previousTareas }
    },
    onError: (err, variables, context) => {
      if (context?.previousTareas) queryClient.setQueryData(['tareas', otId], context.previousTareas)
      setError(err.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas', otId] })
      setNewTarea('')
      setNewCantidad('')
      setNewUnidad(rubroUnidad || '')
      setShowAddForm(false)
      setIsAdding(false)
      router.refresh()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('tareas').delete().eq('id', id)
      if (error) throw new Error('Error al eliminar la tarea')
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tareas', otId] })
      const previousTareas = queryClient.getQueryData<Tarea[]>(['tareas', otId])
      queryClient.setQueryData<Tarea[]>(['tareas', otId], old => old?.filter(t => t.id !== id))
      return { previousTareas }
    },
    onError: (err, id, context) => {
      if (context?.previousTareas) queryClient.setQueryData(['tareas', otId], context.previousTareas)
      setError(err.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tareas', otId] })
      router.refresh()
    }
  })

  const handleToggleTarea = (tareaId: string, completada: boolean) => {
    if (!canEdit) return
    toggleMutation.mutate({ id: tareaId, completada })
    if ('vibrate' in navigator) navigator.vibrate(50)
  }

  const handleAddTarea = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTarea.trim() || !canEdit) return

    setIsAdding(true)
    setError(null)
    const cantidadNum = newCantidad ? parseFloat(newCantidad) : null

    addMutation.mutate({
      orden_trabajo_id: otId,
      descripcion: newTarea.trim(),
      completada: false,
      orden: total,
      cantidad: cantidadNum,
      unidad: cantidadNum ? (newUnidad || rubroUnidad || null) : null,
    })
  }

  const handleDeleteTarea = (tareaId: string) => {
    if (!canEdit) return
    deleteMutation.mutate(tareaId)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-xs text-destructive font-bold uppercase tracking-tight">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-destructive/50 hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <div className="space-y-3 min-h-[200px]">
          {tareas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
              <ClipboardList className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hoja de ruta vacía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              <AnimatePresence mode='popLayout'>
                {tareas
                  .sort((a: Tarea, b: Tarea) => (a.orden || 0) - (b.orden || 0))
                  .map((tarea: Tarea) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={tarea.id}
                      className={cn(
                        "group flex items-center gap-4 p-4 rounded-xl border transition-colors",
                        tarea.completada
                          ? "bg-muted/50 border-transparent opacity-60"
                          : "bg-card hover:border-primary/30"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTarea(tarea.id, !tarea.completada)}
                        disabled={!canEdit || toggleMutation.isPending}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all border-2 shrink-0",
                          tarea.completada
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-background border-muted-foreground/30 hover:border-emerald-400"
                        )}
                      >
                        {tarea.completada && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-semibold transition-colors truncate",
                          tarea.completada ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {tarea.descripcion}
                        </p>
                        {tarea.cantidad !== null && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tarea.cantidad} {tarea.unidad}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {canEdit && !tarea.completada && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTarea(tarea.id)}
                            disabled={deleteMutation.isPending}
                            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {canEdit && (
          <div className="pt-2">
            <AnimatePresence mode='wait'>
              {!showAddForm ? (
                <motion.button
                  key="add-btn"
                  layoutId="add-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAddForm(true)}
                  className="w-full h-12 border border-dashed rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors text-xs font-bold uppercase tracking-wider group"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Tarea
                </motion.button>
              ) : (
                <motion.form
                  key="add-form"
                  layoutId="add-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleAddTarea}
                  className="space-y-4 bg-muted/30 p-5 rounded-xl border"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Descripción</label>
                    <Input
                      autoFocus
                      required
                      value={newTarea}
                      onChange={(e) => setNewTarea(e.target.value)}
                      placeholder="Ej: Colocación de dintel..."
                      className="bg-background"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="space-y-2 flex-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cantidad (Opcional)</label>
                      <div className="relative flex items-center">
                        <Input
                          type="number"
                          step="0.01"
                          value={newCantidad}
                          onChange={(e) => setNewCantidad(e.target.value)}
                          placeholder="0.00"
                          className="bg-background pr-16"
                        />
                        <span className="absolute right-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pointer-events-none">
                          {newUnidad || rubroUnidad || 'UND'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end gap-2 justify-end pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAddForm(false)}
                        className="text-xs uppercase font-bold tracking-wider"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={addMutation.isPending || !newTarea.trim()}
                        className="text-xs uppercase font-bold tracking-wider"
                      >
                        {addMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        Confirmar
                      </Button>
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
