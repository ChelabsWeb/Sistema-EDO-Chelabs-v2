'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAllRequisiciones, getObrasForFilter, updateRequisicionEstado } from '@/app/actions/requisiciones'
import { getGroupedItemsFromRequisiciones, createOrdenCompra } from '@/app/actions/ordenes-compra'
import type { RequisicionWithObraInfo } from '@/app/actions/requisiciones'
import type { GroupedItem } from '@/app/actions/ordenes-compra'
import { RequisicionEstadoBadge } from '@/components/edo/requisiciones/requisicion-estado-badge'
import { formatPesos } from '@/lib/utils/currency'

type RequisicionEstado = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'

interface OCFormItem extends GroupedItem {
  cantidad: number
  precio_unitario: number
}

export default function ComprasRequisicionesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [requisiciones, setRequisiciones] = useState<RequisicionWithObraInfo[]>([])
  const [obras, setObras] = useState<{ id: string; nombre: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // OC creation modal state
  const [showOCModal, setShowOCModal] = useState(false)
  const [ocItems, setOCItems] = useState<OCFormItem[]>([])
  const [ocObraId, setOCObraId] = useState<string>('')
  const [ocProveedor, setOCProveedor] = useState('')
  const [ocRutProveedor, setOCRutProveedor] = useState('')
  const [ocCondicionesPago, setOCCondicionesPago] = useState('')
  const [ocFechaEntrega, setOCFechaEntrega] = useState('')
  const [ocLoading, setOCLoading] = useState(false)
  const [ocError, setOCError] = useState<string | null>(null)

  // Filter state
  const [obraId, setObraId] = useState(searchParams.get('obra') || '')
  const [estado, setEstado] = useState(searchParams.get('estado') || '')
  const [fechaDesde, setFechaDesde] = useState(searchParams.get('desde') || '')
  const [fechaHasta, setFechaHasta] = useState(searchParams.get('hasta') || '')

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setSelectedIds(new Set())

    const [reqResult, obrasResult] = await Promise.all([
      getAllRequisiciones({
        obra_id: obraId || undefined,
        estado: estado || undefined,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
      }),
      getObrasForFilter(),
    ])

    if (!reqResult.success) {
      setError(reqResult.error)
    } else {
      setRequisiciones(reqResult.data)
    }

    if (obrasResult.success) {
      setObras(obrasResult.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (obraId) params.set('obra', obraId)
    if (estado) params.set('estado', estado)
    if (fechaDesde) params.set('desde', fechaDesde)
    if (fechaHasta) params.set('hasta', fechaHasta)

    router.push(`/compras/requisiciones?${params.toString()}`)
    loadData()
  }

  const handleClearFilters = () => {
    setObraId('')
    setEstado('')
    setFechaDesde('')
    setFechaHasta('')
    router.push('/compras/requisiciones')
    setTimeout(loadData, 0)
  }

  const handleUpdateEstado = async (id: string, nuevoEstado: 'en_proceso' | 'completada') => {
    setUpdatingId(id)
    const result = await updateRequisicionEstado(id, nuevoEstado)

    if (result.success) {
      loadData()
    } else {
      alert(result.error)
    }

    setUpdatingId(null)
  }

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAllPending = () => {
    const pendingIds = requisiciones
      .filter(r => r.estado === 'pendiente')
      .map(r => r.id)

    if (pendingIds.every(id => selectedIds.has(id))) {
      // Deselect all pending
      const newSelected = new Set(selectedIds)
      pendingIds.forEach(id => newSelected.delete(id))
      setSelectedIds(newSelected)
    } else {
      // Select all pending
      setSelectedIds(new Set([...selectedIds, ...pendingIds]))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  // OC Creation handlers
  const handleOpenOCModal = async () => {
    if (selectedIds.size === 0) return

    setOCLoading(true)
    setOCError(null)

    const result = await getGroupedItemsFromRequisiciones(Array.from(selectedIds))

    if (!result.success) {
      setOCError(result.error)
      setOCLoading(false)
      return
    }

    // Convert GroupedItems to OCFormItems with editable fields
    const formItems: OCFormItem[] = result.data.items.map(item => ({
      ...item,
      cantidad: item.cantidad_total,
      precio_unitario: item.precio_referencia || 0,
    }))

    setOCItems(formItems)
    setOCObraId(result.data.obra_id)
    setOCProveedor('')
    setOCRutProveedor('')
    setOCCondicionesPago('')
    setOCFechaEntrega('')
    setShowOCModal(true)
    setOCLoading(false)
  }

  const handleCloseOCModal = () => {
    setShowOCModal(false)
    setOCItems([])
    setOCProveedor('')
    setOCRutProveedor('')
    setOCCondicionesPago('')
    setOCFechaEntrega('')
    setOCError(null)
  }

  const handleUpdateOCItem = (insumoId: string, field: 'cantidad' | 'precio_unitario', value: number) => {
    setOCItems(items =>
      items.map(item =>
        item.insumo_id === insumoId ? { ...item, [field]: value } : item
      )
    )
  }

  const handleCreateOC = async () => {
    if (!ocProveedor.trim()) {
      setOCError('El proveedor es requerido')
      return
    }

    if (ocItems.some(item => item.cantidad <= 0 || item.precio_unitario < 0)) {
      setOCError('Verifique las cantidades y precios')
      return
    }

    setOCLoading(true)
    setOCError(null)

    const result = await createOrdenCompra({
      obra_id: ocObraId,
      proveedor: ocProveedor.trim(),
      rut_proveedor: ocRutProveedor.trim() || undefined,
      condiciones_pago: ocCondicionesPago.trim() || undefined,
      fecha_entrega_esperada: ocFechaEntrega || undefined,
      requisicion_ids: Array.from(selectedIds),
      lineas: ocItems.map(item => ({
        insumo_id: item.insumo_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        orden_trabajo_id: item.ot_ids[0], // Link to first OT
      })),
    })

    if (result.success) {
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      handleCloseOCModal()
      setSelectedIds(new Set())
      loadData()
      // Navigate to OC list
      router.push('/compras/ordenes-compra')
    } else {
      setOCError(result.error)
    }

    setOCLoading(false)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const estadoOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
  ]

  // Count by estado
  const countByEstado = requisiciones.reduce(
    (acc, r) => {
      acc[r.estado as string] = (acc[r.estado as string] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Get pending requisiciones for selection
  const pendingRequisiciones = requisiciones.filter(r => r.estado === 'pendiente')
  const selectedPendingCount = Array.from(selectedIds).filter(id =>
    pendingRequisiciones.some(r => r.id === id)
  ).length

  // Calculate OC total
  const ocTotal = ocItems.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Requisiciones de Materiales</h1>
              <p className="text-sm text-gray-500">
                {loading ? 'Cargando...' : `${requisiciones.length} requisiciones`}
              </p>
            </div>
            <Link
              href="/compras/ordenes-compra"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Ver Órdenes de Compra
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Obra</label>
              <select
                value={obraId}
                onChange={(e) => setObraId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las obras</option>
                {obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {estadoOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Filtrar
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-700">{countByEstado['pendiente'] || 0}</div>
            <div className="text-sm text-yellow-600">Pendientes</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">{countByEstado['en_proceso'] || 0}</div>
            <div className="text-sm text-blue-600">En Proceso</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">{countByEstado['completada'] || 0}</div>
            <div className="text-sm text-green-600">Completadas</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-700">{countByEstado['cancelada'] || 0}</div>
            <div className="text-sm text-gray-600">Canceladas</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando requisiciones...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && requisiciones.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">No se encontraron requisiciones con los filtros seleccionados</p>
          </div>
        )}

        {/* Requisiciones List */}
        {!loading && requisiciones.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={pendingRequisiciones.length > 0 && pendingRequisiciones.every(r => selectedIds.has(r.id))}
                      onChange={handleSelectAllPending}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      title="Seleccionar todas las pendientes"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requisiciones.map((req) => (
                  <>
                    <tr
                      key={req.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedIds.has(req.id) ? 'bg-blue-50' : ''}`}
                      onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        {req.estado === 'pendiente' && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(req.id)}
                            onChange={() => handleToggleSelect(req.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {req.ot?.obra?.nombre || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/obras/${req.ot?.obra_id}/ordenes-trabajo/${req.ot_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          OT-{req.ot?.numero}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.items?.length || 0} insumo{(req.items?.length || 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RequisicionEstadoBadge estado={req.estado as RequisicionEstado} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {req.estado === 'pendiente' && (
                            <button
                              onClick={() => handleUpdateEstado(req.id, 'en_proceso')}
                              disabled={updatingId === req.id}
                              className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:opacity-50"
                            >
                              {updatingId === req.id ? '...' : 'Iniciar'}
                            </button>
                          )}
                          {req.estado === 'en_proceso' && (
                            <button
                              onClick={() => handleUpdateEstado(req.id, 'completada')}
                              disabled={updatingId === req.id}
                              className="px-3 py-1 text-xs font-medium text-green-600 border border-green-600 rounded hover:bg-green-50 disabled:opacity-50"
                            >
                              {updatingId === req.id ? '...' : 'Completar'}
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                          >
                            {expandedId === req.id ? 'Ocultar' : 'Ver'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Detail */}
                    {expandedId === req.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* OT Info */}
                            <div className="flex items-center gap-6 text-sm">
                              <div>
                                <span className="text-gray-500">Creado por:</span>{' '}
                                <span className="font-medium">{req.creador?.nombre || '-'}</span>
                              </div>
                              {req.notas && (
                                <div>
                                  <span className="text-gray-500">Notas:</span>{' '}
                                  <span className="font-medium">{req.notas}</span>
                                </div>
                              )}
                            </div>

                            {/* Items Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Insumo
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Tipo
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                      Cantidad
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Unidad
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {req.items?.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        {item.insumo?.nombre || 'Insumo desconocido'}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {item.insumo?.tipo === 'material' ? 'Material' : 'Mano de Obra'}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                                        {item.cantidad}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">{item.insumo?.unidad}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Link to OT */}
                            <div className="flex justify-end">
                              <Link
                                href={`/obras/${req.ot?.obra_id}/ordenes-trabajo/${req.ot_id}`}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                              >
                                Ver OT completa
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Selection Action Bar */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.size} requisicion{selectedIds.size !== 1 ? 'es' : ''} seleccionada{selectedIds.size !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleClearSelection}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpiar selección
                </button>
              </div>
              <button
                onClick={handleOpenOCModal}
                disabled={ocLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {ocLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear Orden de Compra
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Add padding at bottom when action bar is visible */}
        {selectedIds.size > 0 && <div className="h-20" />}
      </main>

      {/* OC Creation Modal */}
      {showOCModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Crear Orden de Compra</h2>
                <button
                  onClick={handleCloseOCModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {selectedIds.size} requisicion{selectedIds.size !== 1 ? 'es' : ''} seleccionada{selectedIds.size !== 1 ? 's' : ''} - {ocItems.length} insumo{ocItems.length !== 1 ? 's' : ''} agrupado{ocItems.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {ocError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{ocError}</p>
                </div>
              )}

              {/* Proveedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ocProveedor}
                    onChange={(e) => setOCProveedor(e.target.value)}
                    placeholder="Nombre del proveedor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RUT / CI
                  </label>
                  <input
                    type="text"
                    value={ocRutProveedor}
                    onChange={(e) => setOCRutProveedor(e.target.value)}
                    placeholder="Ej: 12.345.678-9"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condiciones de Pago
                  </label>
                  <input
                    type="text"
                    value={ocCondicionesPago}
                    onChange={(e) => setOCCondicionesPago(e.target.value)}
                    placeholder="Ej: 30 días, contado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Entrega Esperada
                  </label>
                  <input
                    type="date"
                    value={ocFechaEntrega}
                    onChange={(e) => setOCFechaEntrega(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Items de la Orden</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ocItems.map((item) => (
                        <tr key={item.insumo_id}>
                          <td className="px-4 py-2">
                            <div className="text-sm font-medium text-gray-900">{item.insumo_nombre}</div>
                            <div className="text-xs text-gray-500">
                              {item.insumo_tipo === 'material' ? 'Material' : 'Mano de Obra'}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.insumo_unidad}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) => handleUpdateOCItem(item.insumo_id, 'cantidad', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.precio_unitario}
                              onChange={(e) => handleUpdateOCItem(item.insumo_id, 'precio_unitario', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-28 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
                            {formatPesos(item.cantidad * item.precio_unitario)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                          {formatPesos(ocTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleCloseOCModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateOC}
                disabled={ocLoading || !ocProveedor.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ocLoading ? 'Creando...' : 'Crear Orden de Compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
