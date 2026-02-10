import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getOrdenCompra } from '@/app/actions/ordenes-compra'
import { formatPesos } from '@/lib/utils/currency'
import {
    ArrowLeft, Printer, Download, Share2, Building2, User, Calendar,
    MapPin, Phone, Mail, ShoppingBag, Clock, Truck, CheckCircle2,
    AlertCircle, XCircle, Ban, Receipt, Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    params: Promise<{ id: string }>
}

const estadoConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    pendiente: { label: 'En Revisión', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    enviada: { label: 'En Camino', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    recibida_parcial: { label: 'Parcial', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    recibida_completa: { label: 'Recibida', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    cancelada: { label: 'Cancelada', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
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
        <div className="min-h-screen bg-grid-pattern p-6 md:p-14 antialiased selection:bg-blue-500/30">
            {/* Dynamic Header Actions */}
            <nav className="max-w-4xl mx-auto pt-16 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-10 animate-apple-fade-in">
                <div className="flex items-start gap-8">
                    <Link
                        href="/compras/ordenes-compra"
                        className="w-14 h-14 rounded-full bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 flex items-center justify-center text-apple-gray-400 hover:text-apple-blue hover:scale-110 active:scale-95 transition-all shadow-xl mt-2"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/20 flex items-center gap-1.5">
                                <Receipt className="w-3.5 h-3.5 text-apple-blue fill-apple-blue" />
                                <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Documento Digital</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[0.9]">
                                Orden #{oc.numero}<span className="text-apple-blue">.</span>
                            </h1>
                            <p className="text-lg text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
                                Detalle técnico y financiero del compromiso de abastecimiento registrado.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="h-14 px-8 bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-apple-gray-200 transition-all flex items-center gap-3 shadow-xl active:scale-95">
                        <Printer className="w-5 h-5" />
                        Imprimir
                    </button>
                    <button className="h-14 px-8 bg-apple-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-apple-blue/25 hover:bg-apple-blue-dark active:scale-95 transition-all flex items-center gap-3">
                        <Download className="w-5 h-5" />
                        PDF
                    </button>
                </div>
            </nav>

            {/* Main Digital Receipt Section */}
            <main className="max-w-4xl mx-auto">
                <div className="relative bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-float border border-apple-gray-100 dark:border-white/[0.05] overflow-hidden animate-apple-slide-up">

                    {/* Top Branding Bar */}
                    <div className="px-12 py-10 bg-apple-blue flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />
                        <div className="relative z-10 space-y-2">
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-black tracking-tighter">Chelabs EDO</span>
                            </div>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest ml-1">{oc.obra?.nombre || 'General'}</p>
                        </div>
                        <div className="relative z-10">
                            <div className={cn(
                                "px-6 py-3 rounded-2xl backdrop-blur-md border flex items-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl",
                                "bg-white/10 border-white/20 text-white"
                            )}>
                                <StatusIcon className="w-5 h-5" />
                                {config.label}
                            </div>
                        </div>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-12 space-y-16">

                        {/* Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Proveedor emisor</p>
                                    <h3 className="text-3xl font-black text-foreground tracking-tighter">{oc.proveedor}</h3>
                                    <p className="text-apple-gray-400 font-medium">RUT: {oc.rut_proveedor || 'No especificado'}</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-sm font-bold text-apple-gray-400">
                                        <MapPin className="w-4 h-4 text-apple-blue" />
                                        {oc.obra?.nombre} - Uruguay
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-apple-gray-400">
                                        <Phone className="w-4 h-4 text-apple-blue" />
                                        +598 (Suministros)
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Fecha Emisión</p>
                                    <p className="text-lg font-black text-foreground">
                                        {new Date(oc.fecha_emision || oc.created_at || '').toLocaleDateString('es-UY', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Fecha Entrega</p>
                                    <p className="text-lg font-black text-foreground">
                                        {oc.fecha_entrega_esperada ? new Date(oc.fecha_entrega_esperada).toLocaleDateString('es-UY', { day: '2-digit', month: 'long' }) : 'Flexible'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Responsable</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-apple-gray-50 dark:bg-white/10 flex items-center justify-center">
                                            <User className="w-3 h-3 text-apple-blue" />
                                        </div>
                                        <p className="text-[13px] font-bold text-foreground">{oc.creador?.nombre || 'Sistema'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Forma de Pago</p>
                                    <p className="text-sm font-bold text-apple-gray-400">{oc.condiciones_pago || 'Crédito 30 días'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table (Receipt Style) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] whitespace-nowrap">Detalle de Suministros</h4>
                                <div className="h-px w-full bg-apple-gray-100 dark:bg-white/5" />
                            </div>

                            <div className="space-y-4">
                                {oc.lineas?.map((l: any, i) => (
                                    <div key={i} className="flex items-center justify-between py-6 border-b border-apple-gray-50 dark:border-white/[0.03] last:border-0 group hover:px-4 transition-all duration-300 rounded-2xl">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-apple-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-apple-gray-200 group-hover:text-apple-blue transition-colors">
                                                <Package className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h5 className="text-[15px] font-black text-foreground tracking-tight">{l.insumo?.nombre}</h5>
                                                <p className="text-[10px] font-bold text-apple-gray-300 uppercase tracking-widest">{l.insumo?.unidad} • SKU-{idxToSku(i)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-16">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Cantidad</p>
                                                <p className="text-lg font-black font-mono text-foreground whitespace-nowrap">{l.cantidad_solicitada.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right min-w-[120px]">
                                                <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">U. Price</p>
                                                <p className="text-lg font-black text-foreground">{formatPesos(l.precio_unitario)}</p>
                                            </div>
                                            <div className="text-right min-w-[140px]">
                                                <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Subtotal</p>
                                                <p className="text-xl font-black text-foreground tracking-tighter">{formatPesos(l.cantidad_solicitada * l.precio_unitario)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="pt-12 border-t-4 border-apple-gray-100 dark:border-white/5 border-double flex flex-col md:flex-row md:items-start justify-between gap-12">
                            <div className="max-w-sm">
                                <h4 className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] mb-4">Notas Legales</h4>
                                <p className="text-xs text-apple-gray-400 leading-relaxed">
                                    "Documento de validez interna. La recepción de mercadería debe ser validada contra este recibo digital para el procesamiento de facturas en administración."
                                </p>
                            </div>
                            <div className="space-y-4 min-w-[300px]">
                                <div className="flex justify-between items-center text-apple-gray-400">
                                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal Neto</span>
                                    <span className="text-base font-black">{formatPesos((oc.total || 0) * 0.78)}</span>
                                </div>
                                <div className="flex justify-between items-center text-apple-gray-400">
                                    <span className="text-xs font-bold uppercase tracking-widest">IVA (22%)</span>
                                    <span className="text-base font-black">{formatPesos((oc.total || 0) * 0.22)}</span>
                                </div>
                                <div className="pt-4 border-t border-apple-gray-100 dark:border-white/5 flex justify-between items-center">
                                    <span className="text-xl font-black text-foreground tracking-tighter">TOTAL</span>
                                    <span className="text-4xl font-black text-apple-blue tracking-[-0.05em]">{formatPesos(oc.total || 0)}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Safe Area Decoration */}
                    <div className="h-6 bg-apple-gray-50/50 dark:bg-white/[0.02] border-t border-apple-gray-100 dark:border-white/[0.05] flex items-center justify-center gap-1">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i} className="w-1 h-2 bg-apple-gray-100 dark:bg-white/10 rounded-full" />
                        ))}
                    </div>
                </div>

                {/* Context Sidebar Info (Optional floating item) */}
                <div className="mt-12 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 p-8 glass dark:glass-dark rounded-[32px] border border-apple-gray-100 dark:border-white/10 flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                        <div className="w-14 h-14 bg-apple-blue text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Proyecto Destino</p>
                            <h4 className="text-lg font-black text-foreground">{oc.obra?.nombre}</h4>
                            <p className="text-xs font-medium text-apple-blue">Ver Panel de Obra</p>
                        </div>
                    </div>
                    {oc.ot && (
                        <div className="flex-1 p-8 glass dark:glass-dark rounded-[32px] border border-apple-gray-100 dark:border-white/10 flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Orden de Trabajo</p>
                                <h4 className="text-lg font-black text-foreground">OT #{oc.ot.numero}</h4>
                                <Link href={`/obras/${oc.obra_id}/ordenes-trabajo/${oc.ot_id}`} className="text-xs font-medium text-emerald-500 hover:underline">Ir a la OT de origen</Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function idxToSku(i: number) {
    return (2134 + i).toString()
}
