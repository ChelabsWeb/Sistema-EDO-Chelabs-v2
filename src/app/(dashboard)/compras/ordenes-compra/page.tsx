'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getOrdenesCompra, updateOCEstado, type OCFilters } from '@/app/actions/ordenes-compra'
import { getOCForReception, registerRecepcion, type OCForReception, type RecepcionItem } from '@/app/actions/recepciones'
import type { OrdenCompraWithRelations } from '@/types/database'
import { formatPesos } from '@/lib/utils/currency'

type OCStatus = 'pendiente' | 'enviada' | 'recibida_parcial' | 'recibida_completa' | 'cancelada'

const estadoConfig: Record<OCStatus, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  enviada: { label: 'Enviada', className: 'bg-blue-100 text-blue-800' },
  recibida_parcial: { label: 'Recibida Parcial', className: 'bg-orange-100 text-orange-800' },
  recibida_completa: { label: 'Recibida Completa', className: 'bg-green-100 text-green-800' },
  cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
}

function OCEstadoBadge({ estado }: { estado: OCStatus }) {
  const config = estadoConfig[estado] || estadoConfig.pendiente
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export default function OrdenesCompraPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [ordenes, setOrdenes] = useState<OrdenCompraWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Reception modal state
  const [receptionModalOpen, setReceptionModalOpen] = useState(false)
  const [receptionOC, setReceptionOC] = useState<OCForReception | null>(null)
  const [receptionItems, setReceptionItems] = useState<Record<string, number>>({})
  const [receptionNotas, setReceptionNotas] = useState('')
  const [receptionLoading, setReceptionLoading] = useState(false)
  const [receptionSubmitting, setReceptionSubmitting] = useState(false)

  // Filter state
  const [obraId, setObraId] = useState(searchParams.get('obra') || '')
  const [estado, setEstado] = useState(searchParams.get('estado') || '')
  const [fechaDesde, setFechaDesde] = useState(searchParams.get('desde') || '')
  const [fechaHasta, setFechaHasta] = useState(searchParams.get('hasta') || '')

  // Get unique obras from ordenes for filter
  const obrasMap = new Map<string, { id: string; nombre: string }>()
  ordenes.forEach(o => {
    if (o.obra?.id && o.obra?.nombre) {
      obrasMap.set(o.obra.id, { id: o.obra.id, nombre: o.obra.nombre })
    }
  })
  const obras = Array.from(obrasMap.values())

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const filters: OCFilters = {}
    if (obraId) filters.obra_id = obraId
    if (estado) filters.estado = estado
    if (fechaDesde) filters.fecha_desde = fechaDesde
    if (fechaHasta) filters.fecha_hasta = fechaHasta

    const result = await getOrdenesCompra(filters)

    if (!result.success) {
      setError(result.error)
    } else {
      setOrdenes(result.data)
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

    router.push(`/compras/ordenes-compra?${params.toString()}`)
    loadData()
  }

  const handleClearFilters = () => {
    setObraId('')
    setEstado('')
    setFechaDesde('')
    setFechaHasta('')
    router.push('/compras/ordenes-compra')
    setTimeout(loadData, 0)
  }

  const handleUpdateEstado = async (id: string, newEstado: 'enviada' | 'cancelada') => {
    setUpdatingId(id)
    const result = await updateOCEstado(id, newEstado)

    if (result.success) {
      await loadData()
    } else {
      setError(result.error)
    }
    setUpdatingId(null)
  }

  // Reception modal handlers
  const handleOpenReceptionModal = async (ocId: string) => {
    setReceptionLoading(true)
    setReceptionModalOpen(true)
    setReceptionItems({})
    setReceptionNotas('')

    const result = await getOCForReception(ocId)
    if (result.success) {
      setReceptionOC(result.data)
      // Initialize items with 0
      const initialItems: Record<string, number> = {}
      result.data.lineas.forEach(linea => {
        initialItems[linea.id] = 0
      })
      setReceptionItems(initialItems)
    } else {
      setError(result.error)
      setReceptionModalOpen(false)
    }
    setReceptionLoading(false)
  }

  const handleCloseReceptionModal = () => {
    setReceptionModalOpen(false)
    setReceptionOC(null)
    setReceptionItems({})
    setReceptionNotas('')
  }

  const handleReceptionItemChange = (lineaId: string, cantidad: number) => {
    setReceptionItems(prev => ({
      ...prev,
      [lineaId]: Math.max(0, cantidad)
    }))
  }

  const handleSubmitRecepcion = async () => {
    if (!receptionOC) return

    setReceptionSubmitting(true)

    const items: RecepcionItem[] = Object.entries(receptionItems)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([linea_oc_id, cantidad_a_recibir]) => ({
        linea_oc_id,
        cantidad_a_recibir
      }))

    if (items.length === 0) {
      setError('Debe especificar al menos un item con cantidad mayor a 0')
      setReceptionSubmitting(false)
      return
    }

    const result = await registerRecepcion({
      orden_compra_id: receptionOC.id,
      items,
      notas: receptionNotas || undefined
    })

    if (result.success) {
      handleCloseReceptionModal()
      await loadData()
    } else {
      setError(result.error)
    }

    setReceptionSubmitting(false)
  }

  // Summary counts
  const counts = {
    pendiente: ordenes.filter(o => o.estado === 'pendiente').length,
    enviada: ordenes.filter(o => o.estado === 'enviada').length,
    recibida_parcial: ordenes.filter(o => o.estado === 'recibida_parcial').length,
    recibida_completa: ordenes.filter(o => o.estado === 'recibida_completa').length,
    cancelada: ordenes.filter(o => o.estado === 'cancelada').length,
  }

  const totalValue = ordenes.reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ordenes de Compra</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las ordenes de compra del sistema. Crea OC directamente desde las OTs.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total OCs</p>
          <p className="text-2xl font-bold text-gray-900">{ordenes.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-600">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-700">{counts.pendiente}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-600">Enviadas</p>
          <p className="text-2xl font-bold text-blue-700">{counts.enviada}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4">
          <p className="text-sm text-orange-600">Parciales</p>
          <p className="text-2xl font-bold text-orange-700">{counts.recibida_parcial}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600">Completas</p>
          <p className="text-2xl font-bold text-green-700">{counts.recibida_completa}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <p className="text-sm text-purple-600">Valor Total</p>
          <p className="text-xl font-bold text-purple-700">{formatPesos(totalValue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Obra</label>
            <select
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todas las obras</option>
              {obras.map(obra => (
                <option key={obra.id} value={obra.id}>{obra.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="enviada">Enviada</option>
              <option value="recibida_parcial">Recibida Parcial</option>
              <option value="recibida_completa">Recibida Completa</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Filtrar
            </button>
            <button
              onClick={handleClearFilters}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ordenes de compra</h3>
            <p className="mt-1 text-sm text-gray-500">
              Las ordenes de compra se crean desde las Ordenes de Trabajo en ejecución.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-10 px-4 py-3"></th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numero
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Obra
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordenes.map(oc => (
                <React.Fragment key={oc.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedId(expandedId === oc.id ? null : oc.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className={`w-5 h-5 transform transition-transform ${expandedId === oc.id ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        OC-{oc.numero}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {oc.fecha_emision ? new Date(oc.fecha_emision).toLocaleDateString('es-UY') : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {oc.obra?.nombre || 'Sin obra'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {oc.proveedor || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {oc.lineas?.length || 0} items
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPesos(oc.total || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <OCEstadoBadge estado={(oc.estado as OCStatus) || 'pendiente'} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {oc.estado === 'pendiente' && (
                          <>
                            <button
                              onClick={() => handleUpdateEstado(oc.id, 'enviada')}
                              disabled={updatingId === oc.id}
                              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              title="Marcar como enviada"
                            >
                              {updatingId === oc.id ? (
                                <span className="animate-spin">...</span>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleUpdateEstado(oc.id, 'cancelada')}
                              disabled={updatingId === oc.id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Cancelar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        {(oc.estado === 'enviada' || oc.estado === 'recibida_parcial') && (
                          <>
                            <button
                              onClick={() => handleOpenReceptionModal(oc.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Registrar Recepcion"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            {oc.estado === 'enviada' && (
                              <button
                                onClick={() => handleUpdateEstado(oc.id, 'cancelada')}
                                disabled={updatingId === oc.id}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Cancelar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Expanded row with details */}
                  {expandedId === oc.id && (
                    <tr>
                      <td colSpan={9} className="px-4 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* OC Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Creado por:</span>{' '}
                              <span className="text-gray-900">{oc.creador?.nombre || 'Desconocido'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Fecha creacion:</span>{' '}
                              <span className="text-gray-900">
                                {oc.created_at ? new Date(oc.created_at).toLocaleDateString('es-UY') : '-'}
                              </span>
                            </div>
                            {oc.rut_proveedor && (
                              <div>
                                <span className="text-gray-500">RUT:</span>{' '}
                                <span className="text-gray-900">{oc.rut_proveedor}</span>
                              </div>
                            )}
                            {oc.condiciones_pago && (
                              <div>
                                <span className="text-gray-500">Condiciones:</span>{' '}
                                <span className="text-gray-900">{oc.condiciones_pago}</span>
                              </div>
                            )}
                            {oc.fecha_entrega_esperada && (
                              <div>
                                <span className="text-gray-500">Entrega esperada:</span>{' '}
                                <span className="text-gray-900">
                                  {new Date(oc.fecha_entrega_esperada).toLocaleDateString('es-UY')}
                                </span>
                              </div>
                            )}
                            {oc.fecha_recepcion && (
                              <div>
                                <span className="text-gray-500">Fecha recepcion:</span>{' '}
                                <span className="text-gray-900">
                                  {new Date(oc.fecha_recepcion).toLocaleDateString('es-UY')}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Line items table */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Items de la Orden</h4>
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Solicitada</th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Recibida</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">P. Unit.</th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {oc.lineas?.map((linea, idx) => {
                                  const solicitada = linea.cantidad_solicitada || 0
                                  const recibida = linea.cantidad_recibida || 0
                                  const isComplete = recibida >= solicitada && recibida > 0
                                  const isPartial = recibida > 0 && recibida < solicitada
                                  const isOverReceived = recibida > solicitada
                                  const isPending = recibida === 0

                                  let rowClass = ''
                                  let statusBadge = null

                                  if (isOverReceived) {
                                    rowClass = 'bg-red-50'
                                    statusBadge = (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                        +{recibida - solicitada} extra
                                      </span>
                                    )
                                  } else if (isComplete) {
                                    rowClass = 'bg-green-50'
                                    statusBadge = (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        Completo
                                      </span>
                                    )
                                  } else if (isPartial) {
                                    rowClass = 'bg-yellow-50'
                                    statusBadge = (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Faltan {solicitada - recibida}
                                      </span>
                                    )
                                  } else if (isPending) {
                                    statusBadge = (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                        Pendiente
                                      </span>
                                    )
                                  }

                                  return (
                                    <tr key={linea.id || idx} className={rowClass}>
                                      <td className="px-3 py-2 text-sm text-gray-900">
                                        {linea.insumo?.nombre || 'Sin nombre'}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-gray-500">
                                        {linea.insumo?.tipo || '-'}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-right text-gray-900">
                                        {solicitada}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-right text-gray-900">
                                        {recibida}
                                      </td>
                                      <td className="px-3 py-2 text-sm">
                                        {statusBadge}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-gray-500">
                                        {linea.insumo?.unidad || '-'}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-right text-gray-900">
                                        {formatPesos(linea.precio_unitario || 0)}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                                        {formatPesos(solicitada * (linea.precio_unitario || 0))}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={7} className="px-3 py-2 text-sm font-medium text-right text-gray-700">
                                    Total:
                                  </td>
                                  <td className="px-3 py-2 text-sm font-bold text-right text-gray-900">
                                    {formatPesos(oc.total || 0)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reception Modal */}
      {receptionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseReceptionModal} />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Registrar Recepcion - OC-{receptionOC?.numero}
                </h3>
                <button
                  onClick={handleCloseReceptionModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-4">
                {receptionLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : receptionOC ? (
                  <div className="space-y-4">
                    {/* OC Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Proveedor:</span> {receptionOC.proveedor || 'No especificado'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Estado:</span>{' '}
                        <OCEstadoBadge estado={receptionOC.estado} />
                      </p>
                    </div>

                    {/* Items table */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Items a recibir</h4>
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Solicitada</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Recibida</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">A Recibir</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alerta</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {receptionOC.lineas.map(linea => {
                            const recibida = linea.cantidad_recibida || 0
                            const pendiente = linea.cantidad_solicitada - recibida
                            const aRecibir = receptionItems[linea.id] || 0
                            const totalDespuesRecepcion = recibida + aRecibir
                            const isOverReceiving = aRecibir > pendiente && pendiente > 0
                            const willBePartial = aRecibir > 0 && aRecibir < pendiente
                            const isAlreadyComplete = pendiente <= 0

                            let rowClass = ''
                            let alertBadge = null

                            if (isAlreadyComplete) {
                              rowClass = 'bg-green-50'
                            } else if (isOverReceiving) {
                              rowClass = 'bg-red-50'
                              alertBadge = (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  +{aRecibir - pendiente} extra
                                </span>
                              )
                            } else if (willBePartial) {
                              alertBadge = (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Parcial
                                </span>
                              )
                            }

                            return (
                              <tr key={linea.id} className={rowClass}>
                                <td className="px-3 py-2 text-sm text-gray-900">
                                  {linea.insumo.nombre}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500">
                                  {linea.insumo.unidad}
                                </td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900">
                                  {linea.cantidad_solicitada}
                                </td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900">
                                  {recibida}
                                </td>
                                <td className="px-3 py-2 text-sm text-right font-medium">
                                  <span className={pendiente <= 0 ? 'text-green-600' : 'text-orange-600'}>
                                    {pendiente > 0 ? pendiente : 'Completo'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={aRecibir}
                                    onChange={(e) => handleReceptionItemChange(linea.id, parseFloat(e.target.value) || 0)}
                                    className={`w-20 px-2 py-1 text-right border rounded text-sm focus:ring-1 ${
                                      isOverReceiving
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    disabled={isAlreadyComplete}
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  {alertBadge}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Alerts Summary */}
                    {receptionOC && (() => {
                      const alerts: { type: 'warning' | 'error'; message: string }[] = []

                      receptionOC.lineas.forEach(linea => {
                        const recibida = linea.cantidad_recibida || 0
                        const pendiente = linea.cantidad_solicitada - recibida
                        const aRecibir = receptionItems[linea.id] || 0

                        if (aRecibir > pendiente && pendiente > 0) {
                          alerts.push({
                            type: 'error',
                            message: `${linea.insumo.nombre}: Se recibira ${aRecibir - pendiente} unidades mas de lo pedido`
                          })
                        } else if (aRecibir > 0 && aRecibir < pendiente) {
                          alerts.push({
                            type: 'warning',
                            message: `${linea.insumo.nombre}: Recepcion parcial, faltaran ${pendiente - aRecibir} unidades`
                          })
                        }
                      })

                      if (alerts.length === 0) return null

                      return (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Alertas de Recepcion</h4>
                          {alerts.map((alert, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                                alert.type === 'error'
                                  ? 'bg-red-50 text-red-800 border border-red-200'
                                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                              }`}
                            >
                              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {alert.type === 'error' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                              <span>{alert.message}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })()}

                    {/* Notas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas (opcional)
                      </label>
                      <textarea
                        value={receptionNotas}
                        onChange={(e) => setReceptionNotas(e.target.value)}
                        rows={2}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Observaciones sobre la recepcion..."
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                <button
                  onClick={handleCloseReceptionModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={receptionSubmitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitRecepcion}
                  disabled={receptionSubmitting || receptionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {receptionSubmitting ? 'Guardando...' : 'Registrar Recepcion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
