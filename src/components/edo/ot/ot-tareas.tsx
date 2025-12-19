'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Tarea {
  id: string
  descripcion: string
  completada: boolean | null
  orden: number | null
  created_at: string | null
}

interface OTTareasProps {
  otId: string
  obraId: string
  tareas: Tarea[]
  canEdit: boolean
}

export function OTTareas({ otId, obraId, tareas: initialTareas, canEdit }: OTTareasProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [newTarea, setNewTarea] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    // Vibration feedback on mobile
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
    const { error } = await supabase
      .from('tareas')
      .insert({
        orden_trabajo_id: otId,
        descripcion: newTarea.trim(),
        completada: false,
        orden: total,
      })

    if (error) {
      setError('Error al agregar la tarea')
    } else {
      setNewTarea('')
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Tareas</h2>
          <div className="text-sm text-gray-500">
            {completadas}/{total} completadas ({progreso}%)
          </div>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Task list */}
        <div className="space-y-2 mb-4">
          {optimisticTareas.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay tareas definidas
            </p>
          ) : (
            optimisticTareas
              .sort((a, b) => (a.orden || 0) - (b.orden || 0))
              .map((tarea) => (
                <div
                  key={tarea.id}
                  className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                    tarea.completada ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTarea(tarea.id, !tarea.completada)}
                    disabled={!canEdit || isPending}
                    className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      tarea.completada
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    } ${!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    style={{ minWidth: '24px', minHeight: '24px' }}
                  >
                    {tarea.completada && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      tarea.completada ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}
                  >
                    {tarea.descripcion}
                  </span>
                  {canEdit && !tarea.completada && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTarea(tarea.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Eliminar tarea"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))
          )}
        </div>

        {/* Add task form */}
        {canEdit && (
          <form onSubmit={handleAddTarea} className="flex gap-2">
            <input
              type="text"
              value={newTarea}
              onChange={(e) => setNewTarea(e.target.value)}
              placeholder="Nueva tarea..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isAdding || !newTarea.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                'Agregar'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
