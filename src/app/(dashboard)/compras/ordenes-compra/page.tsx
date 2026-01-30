'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getOrdenesCompra, updateOCEstado, type OCFilters } from '@/app/actions/ordenes-compra'
import { getOCForReception, registerRecepcion, type OCForReception, type RecepcionItem } from '@/app/actions/recepciones'
import type { OrdenCompraWithRelations } from '@/types/database'
import { formatPesos } from '@/lib/utils/currency'
import {
  ShoppingBag, Filter, Plus, ChevronDown, ChevronRight, CheckCircle2,
  Clock, Truck, Ban, AlertCircle, Search, RotateCcw, TrendingUp,
  DollarSign, Package, MoreHorizontal, XCircle, Calendar, Building2, User
} from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'
import { ReceptionModal } from '@/components/compras/ReceptionModal'

type OCStatus = 'pendiente' | 'enviada' | 'recibida_parcial' | 'recibida_completa' | 'cancelada'

const estadoConfig: Record<OCStatus, { label: string; icon: any; color: string; border: string; bg: string }> = {
  pendiente: { label: 'Pendiente', icon: Clock, color: 'text-amber-600', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
  enviada: { label: 'Enviada', icon: Truck, color: 'text-blue-600', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
  recibida_parcial: { label: 'Parcial', icon: AlertCircle, color: 'text-orange-600', border: 'border-orange-500/20', bg: 'bg-orange-500/10' },
  recibida_completa: { label: 'Completa', icon: CheckCircle2, color: 'text-emerald-600', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
  cancelada: { label: 'Cancelada', icon: Ban, color: 'text-red-600', border: 'border-red-500/20', bg: 'bg-red-500/10' },
}

export default function OrdenesCompraPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

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

  const loadData = async () => {
    setLoading(true)
    setError(null)

    if (isDemo) {
      // Mock Data for Demo Mode
      setTimeout(() => {
        const mockData: any[] = [
          {
            id: 'oc-1', numero: 1001, fecha_emision: '2023-10-01', proveedor: 'Ferretería Central', total: 12500, estado: 'pendiente',
            obra: { id: 'o1', nombre: 'Edificio Las Heras' },
            creador: { id: 'u1', nombre: 'Juan Pérez' },
            created_at: '2023-10-01T10:00:00Z',
            lineas: [
              { id: 'l1', insumo: { nombre: 'Cemento Portland', unidad: 'kg', tipo: 'Material' }, cantidad_solicitada: 100, cantidad_recibida: 0, precio_unitario: 85 },
              { id: 'l2', insumo: { nombre: 'Varilla Acero 8mm', unidad: 'm', tipo: 'Material' }, cantidad_solicitada: 50, cantidad_recibida: 0, precio_unitario: 45 }
            ]
          },
          {
            id: 'oc-2', numero: 1002, fecha_emision: '2023-10-05', proveedor: 'Materiales URU', total: 8400, estado: 'enviada',
            obra: { id: 'o1', nombre: 'Edificio Las Heras' },
            creador: { id: 'u1', nombre: 'Juan Pérez' },
            created_at: '2023-10-05T14:30:00Z',
            lineas: [{ id: 'l3', insumo: { nombre: 'Arena Rubia', unidad: 'm3', tipo: 'Material' }, cantidad_solicitada: 10, cantidad_recibida: 0, precio_unitario: 840 }]
          },
          {
            id: 'oc-3', numero: 1003, fecha_emision: '2023-09-20', proveedor: 'Electricidad S.A.', total: 15600, estado: 'recibida_parcial',
            obra: { id: 'o2', nombre: 'Planta Industrial' },
            creador: { id: 'u2', nombre: 'María García' },
            created_at: '2023-09-20T09:15:00Z',
            lineas: [{ id: 'l4', insumo: { nombre: 'Cable 2mm', unidad: 'm', tipo: 'Eléctrico' }, cantidad_solicitada: 500, cantidad_recibida: 300, precio_unitario: 31.2 }]
          },
          {
            id: 'oc-4', numero: 1004, fecha_emision: '2023-09-15', proveedor: 'Pinturas del Sur', total: 2200, estado: 'recibida_completa',
            obra: { id: 'o3', nombre: 'Casa Particular' },
            creador: { id: 'u1', nombre: 'Juan Pérez' },
            created_at: '2023-09-15T11:00:00Z',
            lineas: [{ id: 'l5', insumo: { nombre: 'Esmalte Sintético', unidad: 'L', tipo: 'Material' }, cantidad_solicitada: 5, cantidad_recibida: 5, precio_unitario: 440 }]
          },
          {
            id: 'oc-5', numero: 1005, fecha_emision: '2023-10-10', proveedor: 'Logística Total', total: 4500, estado: 'cancelada',
            obra: { id: 'o2', nombre: 'Planta Industrial' },
            creador: { id: 'u2', nombre: 'María García' },
            created_at: '2023-10-10T16:00:00Z',
            lineas: []
          }
        ]
        setOrdenes(mockData)
        setLoading(false)
      }, 500)
      return
    }

    const filters: OCFilters = {}
    if (obraId) filters.obra_id = obraId
    if (estado) filters.estado = estado
    if (fechaDesde) filters.fecha_desde = fechaDesde
    if (fechaHasta) filters.fecha_hasta = fechaHasta

    const result = await getOrdenesCompra(filters)
    if (!result.success) setError(result.error)
    else setOrdenes(result.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
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
    setObraId(''); setEstado(''); setFechaDesde(''); setFechaHasta('')
    router.push('/compras/ordenes-compra')
    setTimeout(loadData, 0)
  }

  const handleUpdateEstado = async (id: string, newEstado: 'enviada' | 'cancelada') => {
    setUpdatingId(id)
    if (isDemo) {
      setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado: newEstado } : o))
      setUpdatingId(null)
      return
    }
    const result = await updateOCEstado(id, newEstado)
    if (result.success) await loadData()
    else setError(result.error)
    setUpdatingId(null)
  }

  const handleOpenReceptionModal = async (ocId: string) => {
    setReceptionLoading(true)
    setReceptionModalOpen(true)
    setReceptionItems({})
    setReceptionNotas('')

    if (isDemo) {
      const oc = ordenes.find(o => o.id === ocId)
      if (oc) {
        setReceptionOC(oc as any)
        const initialItems: Record<string, number> = {}
        oc.lineas?.forEach((linea: any) => { initialItems[linea.id] = 0 })
        setReceptionItems(initialItems)
      }
      setReceptionLoading(false)
      return
    }

    const result = await getOCForReception(ocId)
    if (result.success) {
      setReceptionOC(result.data)
      const initialItems: Record<string, number> = {}
      result.data.lineas.forEach(linea => { initialItems[linea.id] = 0 })
      setReceptionItems(initialItems)
    } else {
      setError(result.error)
      setReceptionModalOpen(false)
    }
    setReceptionLoading(false)
  }

  const handleSubmitRecepcion = async () => {
    if (!receptionOC) return
    setReceptionSubmitting(true)

    const items: RecepcionItem[] = Object.entries(receptionItems)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([linea_oc_id, cantidad_a_recibir]) => ({ linea_oc_id, cantidad_a_recibir }))

    if (items.length === 0) {
      setError('Especifique cantidad > 0'); setReceptionSubmitting(false)
      return
    }

    if (isDemo) {
      setOrdenes(prev => prev.map(o => {
        if (o.id === receptionOC.id) {
          const newLineas = o.lineas?.map((linea: any) => {
            const extra = receptionItems[linea.id] || 0
            return { ...linea, cantidad_recibida: (linea.cantidad_recibida || 0) + extra }
          })
          const isAllReceived = newLineas?.every((l: any) => l.cantidad_recibida >= l.cantidad_solicitada)
          return { ...o, lineas: newLineas, estado: isAllReceived ? 'recibida_completa' : 'recibida_parcial' }
        }
        return o
      }))
      setReceptionModalOpen(false); setReceptionSubmitting(false)
      return
    }

    const result = await registerRecepcion({ orden_compra_id: receptionOC.id, items, notas: receptionNotas || undefined })
    if (result.success) { setReceptionModalOpen(false); await loadData() }
    else setError(result.error)
    setReceptionSubmitting(false)
  }

  const obras = useMemo(() => {
    const map = new Map(); ordenes.forEach(o => { if (o.obra?.id) map.set(o.obra.id, o.obra.nombre) })
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }))
  }, [ordenes])

  const stats = useMemo(() => {
    const totalValue = ordenes.reduce((sum, o) => sum + (o.total || 0), 0)
    return {
      total: ordenes.length,
      pendiente: ordenes.filter(o => o.estado === 'pendiente').length,
      enviada: ordenes.filter(o => o.estado === 'enviada').length,
      valor: totalValue
    }
  }, [ordenes])

  return (
    <div className="p-8 md:p-14 max-w-7xl mx-auto space-y-12 animate-apple-fade-in antialiased">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-apple-gray-100 dark:border-white/5">
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tighter leading-[1.1]">
            Órdenes de Compra
          </h1>
          <p className="text-xl text-apple-gray-400 mt-4 font-medium tracking-tight">
            Gestión logística y control de recepciones de materiales.
          </p>
        </div>
      </header>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-[32px] border-none shadow-apple-lg overflow-hidden group">
          <CardContent className="p-8 bg-apple-gray-50 dark:bg-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-apple-gray-400 uppercase tracking-widest">Total Órdenes</p>
              <h2 className="text-4xl font-extrabold text-foreground">{stats.total}</h2>
            </div>
            <div className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <ShoppingBag className="w-7 h-7 text-apple-blue" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[32px] border-none shadow-apple-lg overflow-hidden group">
          <CardContent className="p-8 bg-apple-gray-50 dark:bg-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-apple-gray-400 uppercase tracking-widest">Pendientes</p>
              <h2 className="text-4xl font-extrabold text-amber-500">{stats.pendiente}</h2>
            </div>
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Clock className="w-7 h-7 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[32px] border-none shadow-apple-lg overflow-hidden group">
          <CardContent className="p-8 bg-apple-gray-50 dark:bg-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-apple-gray-400 uppercase tracking-widest">En Camino</p>
              <h2 className="text-4xl font-extrabold text-blue-500">{stats.enviada}</h2>
            </div>
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Truck className="w-7 h-7 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[32px] border-none shadow-apple-lg overflow-hidden group">
          <CardContent className="p-8 bg-apple-gray-50 dark:bg-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-apple-gray-400 uppercase tracking-widest">Inversión Logística</p>
              <h2 className="text-3xl font-extrabold text-emerald-500">{formatPesos(stats.valor)}</h2>
            </div>
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <DollarSign className="w-7 h-7 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-apple-gray-50/50 dark:bg-white/5 p-6 rounded-[32px] border border-apple-gray-100 dark:border-white/5">
        <div className="flex-1 min-w-[200px] relative group">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-300 group-hover:text-apple-blue transition-colors" />
          <select
            value={obraId} onChange={e => setObraId(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-apple-blue/30 outline-none transition-all appearance-none"
          >
            <option value="">Todas las obras</option>
            {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>
        <div className="flex-1 min-width-[180px] relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-300 group-hover:text-apple-blue transition-colors" />
          <select
            value={estado} onChange={e => setEstado(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-apple-blue/30 outline-none transition-all appearance-none"
          >
            <option value="">Todos los estados</option>
            {Object.entries(estadoConfig).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={handleFilter} className="px-8 py-3 bg-foreground text-background dark:bg-white dark:text-black rounded-full font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/5">
            Aplicar
          </button>
          <button onClick={handleClearFilters} className="p-3 bg-white dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 rounded-full text-apple-gray-400 hover:text-foreground transition-all active:scale-90">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content: Table */}
      <main>
        {loading ? (
          <div className="text-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto"></div>
            <p className="mt-6 text-apple-gray-400 font-medium">Sincronizando órdenes...</p>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="text-center py-32 glass rounded-[48px] border border-apple-gray-100 dark:border-white/5 shadow-apple">
            <div className="w-24 h-24 bg-apple-gray-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-12 h-12 text-apple-gray-200" />
            </div>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight mb-3">Sin Órdenes</h3>
            <p className="text-xl text-apple-gray-400 font-medium max-w-md mx-auto">
              Crea órdenes directamente desde las órdenes de trabajo disponibles.
            </p>
          </div>
        ) : (
          <Card className="rounded-[40px] overflow-hidden border border-apple-gray-100 dark:border-white/5 shadow-apple-float">
            <CardContent className="p-0 overflow-x-auto">
              <table className="min-w-full divide-y divide-apple-gray-100 dark:divide-white/5">
                <thead className="bg-apple-gray-50/50 dark:bg-apple-gray-50/10">
                  <tr>
                    <th className="px-10 py-6 text-left text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">Orden nº</th>
                    <th className="px-10 py-6 text-left text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">Obra / Destino</th>
                    <th className="px-10 py-6 text-left text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">Proveedor</th>
                    <th className="px-10 py-6 text-left text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest text-right">Inversión</th>
                    <th className="px-10 py-6 text-left text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">Estado</th>
                    <th className="px-10 py-6 text-right text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-apple-gray-50 dark:divide-white/5">
                  {ordenes.map(oc => {
                    const config = estadoConfig[oc.estado as OCStatus] || estadoConfig.pendiente
                    const StatusIcon = config.icon
                    const isExpanded = expandedId === oc.id
                    return (
                      <React.Fragment key={oc.id}>
                        <tr className={cn(
                          "group transition-all duration-300",
                          isExpanded ? "bg-apple-gray-50/50 dark:bg-white/[0.03]" : "hover:bg-apple-gray-50/30 dark:hover:bg-white/[0.01]"
                        )}>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <button onClick={() => setExpandedId(isExpanded ? null : oc.id)} className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 flex items-center justify-center text-apple-gray-300 hover:text-apple-blue hover:border-apple-blue/50 transition-all">
                                <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-90")} />
                              </button>
                              <div>
                                <div className="text-lg font-black text-foreground">OC-{oc.numero}</div>
                                <div className="text-xs font-bold text-apple-gray-300 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {oc.fecha_emision ? new Date(oc.fecha_emision).toLocaleDateString('es-UY') : '-'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="text-[15px] font-bold text-foreground">{oc.obra?.nombre || 'General'}</div>
                            <div className="text-xs font-medium text-apple-gray-400">Montevideo, Uruguay</div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="text-[15px] font-bold text-foreground">{oc.proveedor || '-'}</div>
                            <div className="text-xs font-medium text-apple-gray-400">Suministros Directos</div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="text-lg font-black text-foreground">{formatPesos(oc.total || 0)}</div>
                            <div className="text-xs font-medium text-apple-gray-400 uppercase tracking-tighter">Neto</div>
                          </td>
                          <td className="px-10 py-8">
                            <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest", config.bg, config.color, config.border)}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {config.label}
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/compras/ordenes-compra/${oc.id}`}
                                className="w-10 h-10 rounded-full bg-apple-gray-50 dark:bg-white/10 text-apple-gray-400 flex items-center justify-center hover:bg-apple-blue hover:text-white transition-all active:scale-90"
                                title="Ver Detalle Digital"
                              >
                                <Search className="w-5 h-5" />
                              </Link>
                              {oc.estado === 'pendiente' && (
                                <button onClick={() => handleUpdateEstado(oc.id, 'enviada')} disabled={updatingId === oc.id} className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all active:scale-90" title="Enviar">
                                  <Truck className="w-5 h-5" />
                                </button>
                              )}
                              {(oc.estado === 'enviada' || oc.estado === 'recibida_parcial') && (
                                <button onClick={() => handleOpenReceptionModal(oc.id)} className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-90" title="Recibir">
                                  <Package className="w-5 h-5" />
                                </button>
                              )}
                              {['pendiente', 'enviada'].includes(oc.estado || '') && (
                                <button onClick={() => handleUpdateEstado(oc.id, 'cancelada')} disabled={updatingId === oc.id} className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90" title="Cancelar">
                                  <Ban className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-10 py-8 bg-apple-gray-50/40 dark:bg-white/[0.01]">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Detalle de Operación</h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center"><User className="w-4 h-4 text-apple-gray-300" /></div>
                                      <div>
                                        <p className="text-[10px] font-bold text-apple-gray-300 uppercase leading-none">Creado por</p>
                                        <p className="text-sm font-bold text-foreground">{oc.creador?.nombre || 'Admin'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-apple-gray-300" /></div>
                                      <div>
                                        <p className="text-[10px] font-bold text-apple-gray-300 uppercase leading-none">Fecha Sistema</p>
                                        <p className="text-sm font-bold text-foreground">{new Date(oc.created_at || '').toLocaleDateString('es-UY')}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <h4 className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] mb-4">Líneas de Compra</h4>
                                  <div className="bg-white dark:bg-apple-gray-50 rounded-3xl border border-apple-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
                                    <table className="min-w-full divide-y divide-apple-gray-50 dark:divide-white/5">
                                      <thead className="bg-apple-gray-50/50">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-[9px] font-black text-apple-gray-300 uppercase tracking-widest">Insumo</th>
                                          <th className="px-4 py-3 text-right text-[9px] font-black text-apple-gray-300 uppercase tracking-widest">Pedido</th>
                                          <th className="px-4 py-3 text-right text-[9px] font-black text-apple-gray-300 uppercase tracking-widest">Recibido</th>
                                          <th className="px-4 py-3 text-right text-[9px] font-black text-apple-gray-300 uppercase tracking-widest">P. Unit</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-apple-gray-50 dark:divide-white/5">
                                        {oc.lineas?.map((l: any, i) => (
                                          <tr key={i} className="hover:bg-apple-gray-50/50">
                                            <td className="px-4 py-3 text-sm font-bold text-foreground">{l.insumo?.nombre}</td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-apple-gray-400">{l.cantidad_solicitada} {l.insumo?.unidad}</td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-emerald-500">{l.cantidad_recibida || 0}</td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-foreground">{formatPesos(l.precio_unitario)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Reception Modal */}
      <ReceptionModal
        isOpen={receptionModalOpen}
        onClose={() => setReceptionModalOpen(false)}
        oc={receptionOC}
        loading={receptionLoading}
        submitting={receptionSubmitting}
        items={receptionItems}
        notas={receptionNotas}
        onItemChange={(id, qty) => setReceptionItems(p => ({ ...p, [id]: qty }))}
        onNotasChange={setReceptionNotas}
        onSubmit={handleSubmitRecepcion}
      />
    </div>
  )
}
