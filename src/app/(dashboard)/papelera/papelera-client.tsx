'use client'

import { useState, useEffect, useTransition } from 'react'
import { getDeletedItems, restoreItem, permanentDelete, emptyTrash, type DeletedItem, type DeletedItemType } from '@/app/actions/papelera'

const typeLabels: Record<DeletedItemType, string> = {
  obras: 'Obras',
  rubros: 'Rubros',
  insumos: 'Insumos',
  ordenes_trabajo: 'Ordenes de Trabajo',
}

const typeColors: Record<DeletedItemType, string> = {
  obras: 'bg-blue-100 text-blue-800',
  rubros: 'bg-green-100 text-green-800',
  insumos: 'bg-purple-100 text-purple-800',
  ordenes_trabajo: 'bg-yellow-100 text-yellow-800',
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
        setActionMessage({ type: 'success', text: `"${item.nombre}" restaurado correctamente` })
        loadItems()
      } else {
        setActionMessage({ type: 'error', text: result.error })
      }

      setTimeout(() => setActionMessage(null), 3000)
    })
  }

  const handlePermanentDelete = (item: DeletedItem) => {
    if (!confirm(`¿Eliminar permanentemente "${item.nombre}"? Esta acción no se puede deshacer.`)) {
      return
    }

    startTransition(async () => {
      const result = await permanentDelete(item.tipo, item.id)

      if (result.success) {
        setActionMessage({ type: 'success', text: `"${item.nombre}" eliminado permanentemente` })
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
        setActionMessage({ type: 'success', text: 'Papelera vaciada correctamente' })
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
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.tipo === filter)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">Papelera</h1>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              disabled={isPending}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                confirmEmpty
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {confirmEmpty ? 'Confirmar vaciar papelera' : 'Vaciar papelera'}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Action message */}
        {actionMessage && (
          <div className={`mb-6 px-4 py-3 rounded-md ${
            actionMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {actionMessage.text}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos ({items.length})
          </button>
          {(Object.keys(typeLabels) as DeletedItemType[]).map((tipo) => {
            const count = items.filter(i => i.tipo === tipo).length
            return (
              <button
                key={tipo}
                onClick={() => setFilter(tipo)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === tipo
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {typeLabels[tipo]} ({count})
              </button>
            )
          })}
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando elementos eliminados...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Papelera vacia</h3>
            <p className="text-gray-500 mt-1">
              {filter === 'all'
                ? 'No hay elementos eliminados'
                : `No hay ${typeLabels[filter].toLowerCase()} eliminados`}
            </p>
          </div>
        )}

        {/* Items list */}
        {!loading && filteredItems.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eliminado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={`${item.tipo}-${item.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[item.tipo]}`}>
                        {typeLabels[item.tipo]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                      {item.descripcion && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{item.descripcion}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.parent_nombre || (item.tipo === 'obras' ? '-' : 'N/A')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.deleted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRestore(item)}
                        disabled={isPending}
                        className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50"
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Los elementos en la papelera pueden ser restaurados o eliminados permanentemente.</p>
          <p>Al restaurar una obra, tambien se restauran sus rubros, insumos y ordenes de trabajo asociados.</p>
        </div>
      </main>
    </div>
  )
}
