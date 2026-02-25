'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getOrdenesCompra, updateOCEstado, type OCFilters } from '@/app/actions/ordenes-compra'
import { getOCForReception, registerRecepcion, type OCForReception, type RecepcionItem } from '@/app/actions/recepciones'
import type { OrdenCompraWithRelations } from '@/types/database'
import {
  ShoppingBag, Filter, Plus, ChevronDown, ChevronRight, ChevronUp, CheckCircle2,
  Clock, Truck, Ban, AlertCircle, Search, RotateCcw,
  DollarSign, Package, Building2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { ReceptionModal } from '@/components/compras/ReceptionModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type OCStatus = 'pendiente' | 'enviada' | 'recibida_parcial' | 'recibida_completa' | 'cancelada'

const estadoConfig: Record<OCStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  enviada: { label: 'Enviada', variant: 'default' },
  recibida_parcial: { label: 'Parcial', variant: 'secondary' },
  recibida_completa: { label: 'Completa', variant: 'outline' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
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

  const [receptionModalOpen, setReceptionModalOpen] = useState(false)
  const [receptionOC, setReceptionOC] = useState<OCForReception | null>(null)
  const [receptionItems, setReceptionItems] = useState<Record<string, number>>({})
  const [receptionNotas, setReceptionNotas] = useState('')
  const [receptionLoading, setReceptionLoading] = useState(false)
  const [receptionSubmitting, setReceptionSubmitting] = useState(false)

  const [obraId, setObraId] = useState(searchParams.get('obra') || '')
  const [estado, setEstado] = useState(searchParams.get('estado') || '')
  const [fechaDesde, setFechaDesde] = useState(searchParams.get('desde') || '')
  const [fechaHasta, setFechaHasta] = useState(searchParams.get('hasta') || '')

  const loadData = async () => {
    setLoading(true)
    setError(null)

    if (isDemo) {
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

  useEffect(() => { loadData() }, [])

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

  const obrasDropdown = useMemo(() => {
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
    <div className="flex-1 flex flex-col space-y-8 h-full">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between py-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Órdenes de Compra</h2>
          <p className="text-muted-foreground mt-1">Gestión integral de suministros y compromisos con proveedores.</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/compras/ordenes-compra/nueva">
              <Plus className="mr-2 w-4 h-4" /> Nueva Orden
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Órdenes</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendiente}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Tránsito</CardTitle>
            <Truck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enviada}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Presupuesto OC</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(stats.valor)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <Select value={obraId} onValueChange={setObraId}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Todas las obras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las obras</SelectItem>
              {obrasDropdown.map(o => <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(estadoConfig).map(([val, { label }]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex space-x-2 ml-auto">
            <Button variant="outline" onClick={handleClearFilters}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
            <Button onClick={handleFilter}>
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Cargando órdenes...</div>
        ) : ordenes.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin Registros</h3>
            <p className="text-muted-foreground text-sm">No se encontraron órdenes de compra para los filtros seleccionados.</p>
          </Card>
        ) : (
          ordenes.map(oc => {
            const config = estadoConfig[oc.estado as OCStatus] || estadoConfig.pendiente
            const isExpanded = expandedId === oc.id
            return (
              <Card key={oc.id} className={cn("overflow-hidden transition-colors", isExpanded ? "border-primary" : "")}>
                <div
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : oc.id)}
                >
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <Button variant="ghost" size="icon" className="shrink-0 pointer-events-none">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                    <div>
                      <p className="font-bold text-lg">#{oc.numero}</p>
                      <p className="text-xs text-muted-foreground">
                        {oc.fecha_emision ? new Date(oc.fecha_emision).toLocaleDateString('es-UY') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col min-w-[200px]">
                    <span className="font-semibold">{oc.obra?.nombre || 'General'}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{oc.proveedor || 'Sin Proveedor'}</span>
                      <span className="px-1 text-border">•</span>
                      <span>{oc.lineas?.length || 0} Partidas</span>
                    </div>
                  </div>

                  <div className="min-w-[150px] text-right">
                    <p className="font-bold text-lg">
                      {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(oc.total || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Inversión Logística</p>
                  </div>

                  <div className="min-w-[150px] flex justify-end">
                    <Badge variant={config.variant} className="capitalize">{config.label}</Badge>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t bg-muted/20 p-6 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Auditado por</p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {oc.creador?.nombre?.substring(0, 2).toUpperCase() || 'AD'}
                          </div>
                          <span className="font-semibold text-sm">{oc.creador?.nombre || 'Administrador'}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/compras/ordenes-compra/${oc.id}`}>
                            <Search className="w-4 h-4 mr-2" /> Detalle Completo
                          </Link>
                        </Button>
                        {oc.estado === 'pendiente' && (
                          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleUpdateEstado(oc.id, 'enviada'); }} disabled={updatingId === oc.id}>
                            <Truck className="w-4 h-4 mr-2" /> Marcar Enviada
                          </Button>
                        )}
                        {(oc.estado === 'enviada' || oc.estado === 'recibida_parcial') && (
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); handleOpenReceptionModal(oc.id); }}>
                            <Package className="w-4 h-4 mr-2" /> Registrar Entrega
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="bg-background rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Insumo</TableHead>
                            <TableHead className="text-right">Solicitado</TableHead>
                            <TableHead className="text-right">Recibido</TableHead>
                            <TableHead className="text-right">Precio Un.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {oc.lineas?.map((l: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{l.insumo?.nombre}</TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {l.cantidad_solicitada} {l.insumo?.unidad}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={l.cantidad_recibida >= l.cantidad_solicitada ? 'outline' : 'secondary'}>
                                  {l.cantidad_recibida || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(l.precio_unitario)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

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
