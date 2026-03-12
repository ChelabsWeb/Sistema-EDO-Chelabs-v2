import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getOrdenCompra } from '@/app/actions/ordenes-compra'
import { formatPesos } from '@/lib/utils/currency'
import {
    ArrowLeft, Printer, Download, Building2, User,
    MapPin, Phone, ShoppingBag, Clock, Truck, CheckCircle2,
    AlertCircle, XCircle, Receipt, Package
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
    params: Promise<{ id: string }>
}

const estadoConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    pendiente: { label: 'En Revisión', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    enviada: { label: 'En Camino', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    recibida_parcial: { label: 'Parcial', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    recibida_completa: { label: 'Recibida', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    cancelada: { label: 'Cancelada', icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/20' },
}

export default async function OrdenCompraDetailPage({ params }: Props) {
    const { id } = await params
    const result = await getOrdenCompra(id)

    if (!result.success || !result.data) {
        notFound()
    }

    const oc = result.data
    const config = estadoConfig[oc.estado || 'pendiente'] || estadoConfig.pendiente
    const StatusIcon = config.icon

    return (
        <div className="min-h-screen bg-muted/20 p-4 md:p-10">
            {/* Dynamic Header Actions */}
            <nav className="max-w-4xl mx-auto pt-8 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-start gap-6">
                    <Button variant="outline" size="icon" asChild className="shrink-0 rounded-xl mt-1">
                        <Link href="/compras/ordenes-compra">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                                <Receipt className="w-3.5 h-3.5" />
                                Documento Digital
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                                Orden #{oc.numero}
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium max-w-xl">
                                Detalle técnico y financiero del compromiso de abastecimiento registrado.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="text-xs font-bold uppercase tracking-wider">
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                    </Button>
                    <Button className="text-xs font-bold uppercase tracking-wider font-mono">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                    </Button>
                </div>
            </nav>

            {/* Main Digital Receipt Section */}
            <main className="max-w-4xl mx-auto space-y-6">
                <Card className="overflow-hidden border-2 shadow-sm rounded-xl">
                    {/* Top Branding Bar */}
                    <div className="px-8 py-8 bg-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3 text-primary-foreground">
                                <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight">Chelabs EDO</span>
                            </div>
                            <p className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-widest ml-1">{oc.obra?.nombre || 'General'}</p>
                        </div>
                        <div className={cn(
                            "px-4 py-2 rounded-lg border flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
                            "bg-black/20 border-white/20 text-white"
                        )}>
                            <StatusIcon className="w-4 h-4" />
                            {config.label}
                        </div>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-8 md:p-12 space-y-12 bg-card">

                        {/* Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Proveedor emisor</p>
                                    <h3 className="text-2xl font-bold text-foreground tracking-tight">{oc.proveedor}</h3>
                                    <p className="text-sm font-medium text-muted-foreground">RUT: {oc.rut_proveedor || 'No especificado'}</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {oc.obra?.nombre} - Uruguay
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                        <Phone className="w-4 h-4 text-primary" />
                                        +598 (Suministros)
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Emisión</p>
                                    <p className="text-sm font-bold text-foreground">
                                        {new Date(oc.fecha_emision || oc.created_at || '').toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entrega Esperada</p>
                                    <p className="text-sm font-bold text-foreground">
                                        {oc.fecha_entrega_esperada ? new Date(oc.fecha_entrega_esperada).toLocaleDateString('es-UY', { day: '2-digit', month: 'short' }) : 'Flexible'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Responsable</p>
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-primary" />
                                        <p className="text-sm font-bold text-foreground">{oc.creador?.nombre || 'Sistema'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pago</p>
                                    <p className="text-sm font-bold text-muted-foreground">{oc.condiciones_pago || 'Crédito 30 días'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table (Receipt Style) */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">Detalle de Suministros</h4>

                            <div className="space-y-2">
                                {oc.lineas?.map((l: any, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-muted last:border-0 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground shrink-0">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-foreground">{l.insumo?.nombre}</h5>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{l.insumo?.unidad} • SKU-{idxToSku(i)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8 sm:gap-12 justify-between sm:justify-end">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Cantidad</p>
                                                <p className="text-sm font-bold font-mono text-foreground">{l.cantidad_solicitada.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Precio U.</p>
                                                <p className="text-sm font-bold text-foreground">{formatPesos(l.precio_unitario)}</p>
                                            </div>
                                            <div className="text-right min-w-[100px]">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Subtotal</p>
                                                <p className="text-base font-bold text-foreground">{formatPesos(l.cantidad_solicitada * l.precio_unitario)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="pt-8 border-t-2 border-dashed flex flex-col md:flex-row md:items-start justify-between gap-8">
                            <div className="max-w-xs">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Notas Legales</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                    Documento de validez interna. La recepción de mercadería debe ser validada contra este recibo digital para el procesamiento de facturas en administración.
                                </p>
                            </div>
                            <div className="space-y-3 min-w-[250px]">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal Neto</span>
                                    <span className="text-sm font-bold">{formatPesos((oc.total || 0) * 0.78)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span className="text-xs font-bold uppercase tracking-widest">IVA (22%)</span>
                                    <span className="text-sm font-bold">{formatPesos((oc.total || 0) * 0.22)}</span>
                                </div>
                                <div className="pt-3 border-t flex justify-between items-center">
                                    <span className="text-sm font-black text-foreground uppercase tracking-wider">Total</span>
                                    <span className="text-3xl font-black text-foreground">{formatPesos(oc.total || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Context Sidebar Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href={`/obras/${oc.obra_id}`} className="block">
                        <Card className="hover:border-primary/50 transition-colors h-full">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Proyecto Destino</p>
                                    <h4 className="text-sm font-bold text-foreground">{oc.obra?.nombre}</h4>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Ver Panel de Obra</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {oc.ot && (
                        <Link href={`/obras/${oc.obra_id}/ordenes-trabajo/${oc.ot_id}`} className="block">
                            <Card className="hover:border-emerald-500/50 transition-colors h-full">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                                        <ShoppingBag className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orden de Trabajo</p>
                                        <h4 className="text-sm font-bold text-foreground">OT #{oc.ot.numero}</h4>
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Ir a la OT de origen</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )}
                </div>
            </main>
        </div>
    )
}

function idxToSku(i: number) {
    return (2134 + i).toString()
}
