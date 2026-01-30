'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { getDeletedItems, restoreItem, permanentDelete, emptyTrash, type DeletedItem, type DeletedItemType } from '@/app/actions/papelera'
import { Trash2, RotateCcw, Trash, AlertCircle, Building2, Package, Layers, ClipboardList, ChevronRight, XCircle, Info, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const typeLabels: Record<DeletedItemType, string> = {
  obras: 'Obras',
  rubros: 'Rubros',
  insumos: 'Insumos',
  ordenes_trabajo: 'Ordenes de Trabajo',
}

const typeIcons: Record<DeletedItemType, any> = {
  obras: Building2,
  rubros: Layers,
  insumos: Package,
  ordenes_trabajo: ClipboardList,
}

const typeColors: Record<DeletedItemType, string> = {
  obras: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  rubros: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  insumos: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  ordenes_trabajo: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
}

export function PapeleraClient() {
  const [items, setItems] = useState<DeletedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<DeletedItemType | 'all'>('all')
  const [isPending, startTransition] = useTransition()
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmEmpty, setConfirmEmpty] = useState(false)

  const loadItems = async () => {
    setLoading(true)
    setError(null)
    const result = await getDeletedItems(filter === 'all' ? undefined : filter)
    if (result.success) {
      setItems(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [filter])

  const handleRestore = (item: DeletedItem) => {
    startTransition(async () => {
      const result = await restoreItem(item.tipo, item.id)
      if (result.success) {
        setActionMessage({ type: 'success', text: `"${item.nombre}" restaurado` })
        loadItems()
      } else {
        setActionMessage({ type: 'error', text: result.error })
      }
      setTimeout(() => setActionMessage(null), 3000)
    })
  }

  const handlePermanentDelete = (item: DeletedItem) => {
    if (!confirm(`¿Eliminar permanentemente "${item.nombre}"?`)) return
    startTransition(async () => {
      const result = await permanentDelete(item.tipo, item.id)
      if (result.success) {
        setActionMessage({ type: 'success', text: 'Eliminado permanentemente' })
        loadItems()
      } else {
        setActionMessage({ type: 'error', text: result.error })
      }
      setTimeout(() => setActionMessage(null), 3000)
    })
  }

  const handleEmptyTrash = () => {
    if (!confirmEmpty) {
      setConfirmEmpty(true)
      return
    }
    startTransition(async () => {
      const result = await emptyTrash()
      if (result.success) {
        setActionMessage({ type: 'success', text: 'Papelera vaciada' })
        setItems([])
      } else {
        setActionMessage({ type: 'error', text: result.error })
      }
      setConfirmEmpty(false)
      setTimeout(() => setActionMessage(null), 3000)
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-UY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const filteredItems = filter === 'all' ? items : items.filter(item => item.tipo === filter)

  return (
    <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-6 md:p-14 max-w-7xl mx-auto space-y-12 antialiased">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-40 -mx-4 md:-mx-8 px-8 md:px-12 py-10 backdrop-blur-xl bg-white/70 dark:bg-apple-gray-50/70 border-b border-apple-gray-100 dark:border-white/5 rounded-b-[48px] shadow-apple-sm transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-apple-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-apple-sm">
              Seguridad
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-white/5 rounded-full border border-apple-gray-100 dark:border-white/10">
              <Trash2 className="w-3.5 h-3.5 text-apple-gray-300" />
              <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">{items.length} Elementos</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-[-0.04em] leading-[0.9]">
            Papelera<span className="text-apple-blue">.</span>
          </h1>
          <p className="text-xl text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
            Área de recuperación de datos eliminados recientemente.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            disabled={isPending}
            className={cn(
              "px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.15em] transition-all shadow-apple-float active:scale-[0.95] flex items-center justify-center gap-3 group",
              confirmEmpty
                ? "bg-red-600 text-white shadow-red-200"
                : "bg-white dark:bg-apple-gray-50 text-foreground border border-apple-gray-100 dark:border-white/5 hover:text-red-600"
            )}
          >
            {confirmEmpty ? <AlertCircle className="w-5 h-5 animate-pulse" /> : <Trash2 className="w-5 h-5 transition-transform group-hover:rotate-12" />}
            {confirmEmpty ? '¿Vaciar ahora?' : 'Vaciar Papelera'}
          </button>
        )}
      </header>

      {/* Action Messages Floating View */}
      {actionMessage && (
        <div className={cn(
          "fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-10 py-5 rounded-[32px] font-black text-xs uppercase tracking-widest flex items-center gap-4 animate-apple-slide-up shadow-2xl border backdrop-blur-xl",
          actionMessage.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400/50" : "bg-red-600/90 text-white border-red-400/50"
        )}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {actionMessage.text}
        </div>
      )}

      {/* Main Stream Area */}
      <main className="space-y-12">
        {/* iOS style Segmented Control */}
        <div className="flex justify-center">
          <div className="p-1.5 bg-apple-gray-100/50 dark:bg-white/5 rounded-[24px] flex gap-1 border border-apple-gray-100/50 dark:border-white/5 shadow-inner">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all",
                filter === 'all'
                  ? "bg-white dark:bg-apple-gray-50 text-foreground shadow-apple-sm"
                  : "text-apple-gray-400 hover:text-foreground"
              )}
            >
              Todos
            </button>
            {(Object.keys(typeLabels) as DeletedItemType[]).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFilter(tipo)}
                className={cn(
                  "px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all whitespace-nowrap",
                  filter === tipo
                    ? "bg-white dark:bg-apple-gray-50 text-foreground shadow-apple-sm"
                    : "text-apple-gray-400 hover:text-foreground"
                )}
              >
                {typeLabels[tipo]}
              </button>
            ))}
          </div>
        </div>

        {/* Content State Engine */}
        {loading ? (
          <div className="text-center py-40 animate-pulse">
            <div className="w-16 h-16 bg-apple-blue/10 rounded-[24px] flex items-center justify-center mx-auto mb-6">
              <RotateCcw className="w-8 h-8 text-apple-blue animate-spin-slow" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300">Sincronizando Archivos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-40 glass dark:glass-dark rounded-[64px] border border-apple-gray-100 dark:border-white/5 shadow-apple-float animate-apple-fade-in">
            <div className="w-32 h-32 bg-apple-gray-50 dark:bg-white/5 rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-inner">
              <Trash className="w-16 h-16 text-apple-gray-200" />
            </div>
            <h3 className="text-4xl font-black text-foreground tracking-tighter mb-4">Todo Limpio</h3>
            <p className="text-xl text-apple-gray-400 font-medium max-w-md mx-auto">
              No hay elementos eliminados para mostrar en esta categoría.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 animate-apple-slide-up">
            {filteredItems.map((item) => {
              const Icon = typeIcons[item.tipo]
              return (
                <div key={`${item.tipo}-${item.id}`} className="group relative bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all duration-500 hover:shadow-apple-lg hover:border-apple-blue/20">
                  <div className="flex items-center gap-6">
                    <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 group-hover:scale-105", typeColors[item.tipo])}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", typeColors[item.tipo])}>
                          {typeLabels[item.tipo]}
                        </span>
                        <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Eliminado el {formatDate(item.deleted_at)}</span>
                      </div>
                      <h4 className="text-2xl font-black text-foreground tracking-[-0.04em] group-hover:text-apple-blue transition-colors">{item.nombre}</h4>
                      {item.descripcion && (
                        <p className="text-sm font-medium text-apple-gray-400 mt-1 line-clamp-1">{item.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button
                      onClick={() => handleRestore(item)}
                      className="px-6 py-3 bg-apple-blue/10 text-apple-blue rounded-[18px] text-[10px] font-black uppercase tracking-widest hover:bg-apple-blue hover:text-white transition-all active:scale-90 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restaurar
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item)}
                      className="w-12 h-12 bg-red-500/10 text-red-600 rounded-[18px] flex items-center justify-center hover:bg-red-600 hover:text-white transition-all active:scale-90"
                      title="Eliminar permanentemente"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Informative Footer Card */}
        <div className="p-10 bg-apple-blue/[0.03] dark:bg-white/[0.02] rounded-[48px] border border-apple-blue/10 dark:border-white/5 flex items-start gap-8 shadow-apple-sm">
          <div className="w-16 h-16 bg-apple-blue text-white rounded-[24px] flex items-center justify-center shrink-0 shadow-lg">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-black text-foreground tracking-tighter">Sobre la Restauración de Datos</h4>
            <p className="text-lg text-apple-gray-400 font-medium leading-[1.4] max-w-3xl">
              Al restaurar un elemento, el sistema reconstruirá automáticamente sus dependencias asociadas (como los rubros de una obra o insumos de un rubro) para asegurar que el balance contable y técnico se mantenga intacto.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
