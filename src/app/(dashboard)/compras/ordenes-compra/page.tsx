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
    <div className="min-h-screen bg-transparent text-foreground selection:bg-apple-blue/30 bg-grid-pattern transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-10 pb-20 relative z-10 space-y-16">
        {/* Header Section */}
        <header className="pt-16 pb-2 flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-apple-gray-100 dark:border-white/5">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/20 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-apple-blue fill-apple-blue" />
                <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Suministros & Logística</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/5 flex items-center gap-1.5">
                <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">
                  Control de Órdenes
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[0.9]">
                Compras<span className="text-apple-blue">.</span>
              </h1>
              <p className="text-lg text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
                Gestión inteligente de suministros y control de compromisos financieros con proveedores.
              </p>
            </div>
          </div>
        </header>

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="glass p-8 rounded-[2.5rem] border border-apple-gray-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/5 transition-all duration-500 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Total Órdenes</p>
                <h2 className="text-4xl font-black font-display text-foreground"> {stats.total}</h2>
              </div>
              <div className="size-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform duration-500">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <div className="h-1 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-apple-blue rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-apple-gray-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/5 transition-all duration-500 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Pendientes</p>
                <h2 className="text-4xl font-black font-display text-amber-500"> {stats.pendiente}</h2>
              </div>
              <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="h-1 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(stats.pendiente / stats.total) * 100 || 0}%` }} />
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-apple-gray-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/5 transition-all duration-500 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">En Tránsito</p>
                <h2 className="text-4xl font-black font-display text-apple-blue"> {stats.enviada}</h2>
              </div>
              <div className="size-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform duration-500">
                <Truck className="w-6 h-6" />
              </div>
            </div>
            <div className="h-1 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-apple-blue rounded-full" style={{ width: `${(stats.enviada / stats.total) * 100 || 0}%` }} />
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-apple-gray-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/5 transition-all duration-500 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Presupuesto OC</p>
                <h2 className="text-3xl font-black font-display text-emerald-500 uppercase">
                  {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(stats.valor)}
                </h2>
              </div>
              <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="h-1 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-6 bg-apple-gray-50/30 dark:bg-white/[0.02] p-8 rounded-[3rem] border border-apple-gray-100 dark:border-white/5 backdrop-blur-3xl animate-apple-fade-in shadow-sm">
          <div className="flex-1 min-w-[280px] relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-apple-gray-300 group-hover:text-apple-blue transition-colors" />
              <div className="w-px h-4 bg-apple-gray-200 dark:bg-white/10" />
            </div>
            <select
              value={obraId} onChange={e => setObraId(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/10 rounded-[1.5rem] text-sm font-black uppercase tracking-tight focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all appearance-none"
            >
              <option value="">Todas las obras</option>
              {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[240px] relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <Filter className="w-5 h-5 text-apple-gray-300 group-hover:text-apple-blue transition-colors" />
              <div className="w-px h-4 bg-apple-gray-200 dark:bg-white/10" />
            </div>
            <select
              value={estado} onChange={e => setEstado(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/10 rounded-[1.5rem] text-sm font-black uppercase tracking-tight focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all appearance-none"
            >
              <option value="">Todos los estados</option>
              {Object.entries(estadoConfig).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <button onClick={handleFilter} className="px-10 py-4 bg-foreground text-background dark:bg-white dark:text-black rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
              Sincronizar
            </button>
            <button onClick={handleClearFilters} className="p-4 bg-white dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 rounded-2xl text-apple-gray-400 hover:text-foreground transition-all active:scale-90 hover:bg-apple-gray-50">
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content: List */}
        <main className="animate-apple-slide-up">
          {loading ? (
            <div className="text-center py-40">
              <div className="relative size-16 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-apple-blue/10" />
                <div className="absolute inset-0 rounded-full border-4 border-t-apple-blue animate-spin" />
              </div>
              <p className="text-apple-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Actualizando Flujo Logístico...</p>
            </div>
          ) : ordenes.length === 0 ? (
            <div className="text-center py-40 glass rounded-[4rem] border border-apple-gray-100 dark:border-white/5 overflow-hidden relative">
              <div className="absolute inset-0 opacity-[0.02] bg-grid-pattern pointer-events-none" />
              <div className="size-24 rounded-[2rem] bg-apple-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-10 relative">
                <div className="absolute inset-0 bg-apple-blue/10 animate-pulse rounded-[2rem]" />
                <ShoppingBag className="w-12 h-12 text-apple-gray-400 relative z-10" />
              </div>
              <h3 className="text-4xl font-black font-display text-foreground tracking-tight mb-4 uppercase">Sin Registros</h3>
              <p className="text-apple-gray-400 font-medium max-w-sm mx-auto text-lg">
                El sistema de abastecimiento no detecta órdenes activas para los parámetros seleccionados.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="px-10 flex items-center gap-10 opacity-30">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] w-32">Identificador</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] flex-1">Origen & Destino</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] w-48 text-right">Inversión Logística</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] w-40 text-center">Estado</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] w-32 text-right">Acción</span>
              </div>

              <div className="space-y-4">
                {ordenes.map(oc => {
                  const config = estadoConfig[oc.estado as OCStatus] || estadoConfig.pendiente
                  const StatusIcon = config.icon
                  const isExpanded = expandedId === oc.id
                  return (
                    <div key={oc.id} className="group animate-apple-slide-up">
                      <div className={cn(
                        "glass rounded-[2.5rem] p-8 border border-apple-gray-100 dark:border-white/5 transition-all duration-500 relative overflow-hidden flex items-center gap-10",
                        isExpanded ? "bg-white dark:bg-white/5 shadow-2xl scale-[1.01] border-apple-blue/20" : "hover:bg-white/50 dark:hover:bg-white/[0.03] hover:shadow-xl"
                      )}>
                        <div className="absolute top-0 right-0 w-32 h-full bg-apple-blue/[0.01] -skew-x-12 translate-x-12 pointer-events-none" />

                        {/* OC Identifier */}
                        <div className="w-32 flex items-center gap-5">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : oc.id)}
                            className={cn(
                              "size-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                              isExpanded ? "bg-apple-blue text-white rotate-90" : "bg-apple-gray-100 dark:bg-white/10 text-apple-gray-400 hover:text-apple-blue"
                            )}
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                          <div className="space-y-0.5">
                            <span className="text-xl font-black font-display text-foreground tracking-tight">#{oc.numero}</span>
                            <p className="text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">{oc.fecha_emision ? new Date(oc.fecha_emision).toLocaleDateString('es-UY') : '-'}</p>
                          </div>
                        </div>

                        {/* Data Column */}
                        <div className="flex-1 flex flex-col gap-1">
                          <h4 className="text-lg font-black text-foreground uppercase tracking-tight group-hover:text-apple-blue transition-colors">
                            {oc.obra?.nombre || 'General'}
                          </h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-apple-gray-400">
                              <Building2 className="w-3.5 h-3.5" />
                              {oc.proveedor || 'Sin Proveedor'}
                            </div>
                            <div className="size-1 rounded-full bg-apple-gray-200" />
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-apple-gray-400 uppercase tracking-tighter">
                              <Package className="w-3.5 h-3.5" />
                              {oc.lineas?.length || 0} Partidas
                            </div>
                          </div>
                        </div>

                        {/* Investment */}
                        <div className="w-48 text-right space-y-0.5">
                          <p className="text-2xl font-black font-display text-foreground">
                            {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(oc.total || 0)}
                          </p>
                          <p className="text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Neto Certificado</p>
                        </div>

                        {/* Status */}
                        <div className="w-40 flex justify-center">
                          <div className={cn("inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all", config.bg, config.color, config.border)}>
                            <StatusIcon className="w-4 h-4" />
                            {config.label}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="w-32 flex justify-end gap-3">
                          <Link
                            href={`/compras/ordenes-compra/${oc.id}`}
                            className="size-12 rounded-2xl bg-apple-gray-100 dark:bg-white/10 text-apple-gray-400 flex items-center justify-center hover:bg-apple-blue hover:text-white transition-all shadow-sm"
                          >
                            <Search className="w-6 h-6" />
                          </Link>
                          {oc.estado === 'pendiente' && (
                            <button
                              onClick={() => handleUpdateEstado(oc.id, 'enviada')}
                              disabled={updatingId === oc.id}
                              className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                            >
                              <Truck className="w-6 h-6" />
                            </button>
                          )}
                          {(oc.estado === 'enviada' || oc.estado === 'recibida_parcial') && (
                            <button
                              onClick={() => handleOpenReceptionModal(oc.id)}
                              className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            >
                              <Package className="w-6 h-6" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detailed View */}
                      {isExpanded && (
                        <div className="mx-12 -mt-10 pt-16 pb-10 px-10 glass rounded-b-[3rem] border-x border-b border-apple-gray-100 dark:border-white/5 animate-apple-slide-down relative z-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            <div className="space-y-8">
                              <div className="space-y-4">
                                <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.4em]">Auditado por</p>
                                <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-4 rounded-3xl border border-apple-gray-100 dark:border-white/5">
                                  <div className="size-12 rounded-2xl bg-apple-blue text-white flex items-center justify-center text-lg font-black">
                                    {oc.creador?.nombre?.substring(0, 2).toUpperCase() || 'AD'}
                                  </div>
                                  <div>
                                    <p className="font-black text-foreground uppercase">{oc.creador?.nombre || 'Administrador'}</p>
                                    <p className="text-[10px] font-bold text-apple-gray-400 uppercase tracking-widest">Responsable Logístico</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.4em]">Registros en Sistema</p>
                                <div className="p-5 rounded-[2rem] border border-dashed border-apple-gray-200 dark:border-white/10 space-y-4">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-apple-gray-500 uppercase tracking-tight">Fecha Creación</span>
                                    <span className="font-black text-foreground">{new Date(oc.created_at || '').toLocaleDateString('es-UY')}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-apple-gray-500 uppercase tracking-tight">Última Pulsación</span>
                                    <span className="font-black text-foreground">{new Date(oc.created_at || '').toLocaleDateString('es-UY')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-2 space-y-6">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.4em]">Inventario de Partida</p>
                                <button className="text-apple-blue text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Exportar Detalle (PDF)</button>
                              </div>
                              <div className="glass rounded-[2rem] border border-apple-gray-100 dark:border-white/5 overflow-hidden">
                                <table className="min-w-full divide-y divide-apple-gray-100 dark:divide-white/5">
                                  <thead className="bg-apple-gray-50/50">
                                    <tr>
                                      <th className="px-6 py-4 text-left text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Item Descriptivo</th>
                                      <th className="px-6 py-4 text-right text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Consignado</th>
                                      <th className="px-6 py-4 text-right text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Validado</th>
                                      <th className="px-6 py-4 text-right text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Valuación</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-apple-gray-50 dark:divide-white/5">
                                    {oc.lineas?.map((l: any, i: number) => (
                                      <tr key={i} className="hover:bg-apple-blue/[0.02] transition-colors">
                                        <td className="px-6 py-5 text-sm font-black text-foreground uppercase tracking-tight">{l.insumo?.nombre}</td>
                                        <td className="px-6 py-5 text-right text-xs font-bold text-apple-gray-400">{l.cantidad_solicitada} {l.insumo?.unidad}</td>
                                        <td className="px-6 py-5 text-right font-black">
                                          <span className={cn(
                                            "px-3 py-1 rounded-full text-xs",
                                            l.cantidad_recibida >= l.cantidad_solicitada ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                          )}>
                                            {l.cantidad_recibida || 0}
                                          </span>
                                        </td>
                                        <td className="px-6 py-5 text-right text-sm font-black text-foreground uppercase">
                                          {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(l.precio_unitario)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>

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
