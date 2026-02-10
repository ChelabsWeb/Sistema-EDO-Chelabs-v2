'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { getDeletedItems, restoreItem, permanentDelete, emptyTrash, type DeletedItem, type DeletedItemType } from '@/app/actions/papelera'
import {
  Trash2, RotateCcw, Trash, AlertCircle, Building2, Package,
  Layers, ClipboardList, XCircle, Info,
  Calendar, Inbox, Search, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const typeLabels: Record<DeletedItemType, string> = {
  obras: 'Obras',
  rubros: 'Rubros',
  insumos: 'Insumos',
  ordenes_trabajo: 'Órdenes de Trabajo'
}

const typeIcons: Record<DeletedItemType, any> = {
  obras: Building2,
  rubros: Layers,
  insumos: Package,
  ordenes_trabajo: ClipboardList
}

export function PapeleraClient() {
  const [items, setItems] = useState<DeletedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<DeletedItemType | 'all'>('all')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const result = await getDeletedItems()
      if (result.success) {
        setItems(result.data)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error fetching deleted items:', error)
      toast.error('Error al cargar la papelera')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleRestore = (id: string, type: DeletedItemType) => {
    startTransition(async () => {
      try {
        const result = await restoreItem(type, id) // Note: parameter order in action is (tipo, id)
        if (result.success) {
          toast.success('Elemento restaurado correctamente')
          fetchItems()
        } else {
          toast.error('No se pudo restaurar el elemento')
        }
      } catch (error) {
        toast.error('Error de conexión')
      }
    })
  }

  const handleDelete = (id: string, type: DeletedItemType) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente este elemento? Esta acción no se puede deshacer.')) return

    startTransition(async () => {
      try {
        const result = await permanentDelete(type, id) // Note: parameter order in action is (tipo, id)
        if (result.success) {
          toast.success('Elemento eliminado permanentemente')
          fetchItems()
        } else {
          toast.error('No se pudo eliminar el elemento')
        }
      } catch (error) {
        toast.error('Error de conexión')
      }
    })
  }

  const handleEmptyTrash = () => {
    if (!confirm('¿Estás seguro de que deseas vaciar la papelera? Todos los elementos se perderán para siempre.')) return

    startTransition(async () => {
      try {
        const result = await emptyTrash()
        if (result.success) {
          toast.success('Papelera vaciada correctamente')
          fetchItems()
        } else {
          toast.error('No se pudo vaciar la papelera')
        }
      } catch (error) {
        toast.error('Error de conexión')
      }
    })
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || item.tipo === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-14 max-w-7xl mx-auto space-y-12 antialiased">
      {/* Premium Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/20 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-apple-blue fill-apple-blue" />
              <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Sistema de Recuperación</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-apple-gray-400" />
              <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">
                Retención de 30 días
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[0.9]">
              Papelera<span className="text-apple-blue">.</span>
            </h1>
            <p className="text-lg text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
              Gestiona elementos eliminados recientemente y restaura el acceso a tus proyectos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {items.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              disabled={isPending}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/25 hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
            >
              <Trash className="w-4 h-4" />
              Vaciar Papelera
            </button>
          )}
        </div>
      </header>

      {/* Filters & Tools Area */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-300 group-focus-within:text-apple-blue transition-colors" />
          <input
            type="text"
            placeholder="Buscar en la papelera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-16 pr-8 rounded-[2rem] bg-white dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 text-lg font-bold focus:ring-8 focus:ring-apple-blue/5 outline-none transition-all"
          />
        </div>
        <div className="flex bg-white dark:bg-white/5 p-1 rounded-full border border-apple-gray-200 dark:border-white/5 shadow-sm overflow-x-auto custom-scrollbar-hide max-w-full">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
              filterType === 'all' ? "bg-apple-blue text-white shadow-md" : "text-apple-gray-400 hover:text-foreground"
            )}
          >
            Todo
          </button>
          {Object.entries(typeLabels).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setFilterType(type as DeletedItemType)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                filterType === type ? "bg-apple-blue text-white shadow-md" : "text-apple-gray-400 hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main>
        {loading ? (
          <div className="py-40 flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
            <p className="text-xs font-black text-apple-gray-400 uppercase tracking-widest">Sincronizando Archivos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-40 glass p-12 rounded-[3rem] text-center space-y-8 animate-apple-fade-in">
            <div className="w-24 h-24 bg-apple-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
              <Inbox className="w-10 h-10 text-apple-gray-200" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-foreground tracking-tight uppercase font-display">Papelera Vacía</h3>
              <p className="text-lg text-apple-gray-400 font-medium max-w-md mx-auto">No hay elementos que coincidan con tu búsqueda o la papelera ha sido vaciada.</p>
            </div>
            <button
              onClick={() => { setSearchTerm(''); setFilterType('all'); }}
              className="px-8 py-3 rounded-full border-2 border-apple-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-apple-gray-50 dark:hover:bg-white/5 transition-all"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-apple-slide-up">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const Icon = typeIcons[item.tipo]
                return (
                  <motion.div
                    key={`${item.tipo}-${item.id}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group p-8 glass border border-apple-gray-100 dark:border-white/10 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-full bg-apple-blue/[0.01] -skew-x-12 translate-x-10 pointer-events-none" />

                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-16 h-16 rounded-[22px] bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 group-hover:bg-apple-blue/10 group-hover:text-apple-blue transition-all duration-500 shadow-inner">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors font-display">
                            {item.nombre}
                          </h4>
                          <span className="px-3 py-1 rounded-lg bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-apple-gray-400">
                            {typeLabels[item.tipo]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-apple-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 opacity-50" />
                            Eliminado el {item.deleted_at ? new Date(item.deleted_at).toLocaleDateString() : 'Fecha desconocida'}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-apple-gray-200" />
                          <div className="font-medium opacity-60">ID: {item.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                      <button
                        onClick={() => handleRestore(item.id, item.tipo)}
                        disabled={isPending}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restaurar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.tipo)}
                        disabled={isPending}
                        className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Security Banner */}
      <div className="p-10 glass border border-apple-blue/10 rounded-[3rem] flex items-center gap-8 group">
        <div className="w-16 h-16 rounded-[22px] bg-apple-blue flex items-center justify-center shadow-lg shadow-apple-blue/30 group-hover:scale-110 transition-transform">
          <Sparkles className="w-7 h-7 text-white fill-current" />
        </div>
        <div>
          <h4 className="text-lg font-black text-foreground tracking-tight uppercase font-display">Protección de Datos</h4>
          <p className="text-sm font-medium text-apple-gray-400 leading-relaxed max-w-2xl">
            Los elementos eliminados se conservan por un periodo de 30 días antes de ser purgados automáticamente. Puedes restaurarlos en cualquier momento para recuperar toda la información asociada.
          </p>
        </div>
      </div>
    </div>
  )
}
