'use client'

import React from 'react'
import { X, CheckCircle2, AlertTriangle, AlertCircle, Package, ArrowRight, Save, XCircle, Calculator, Info } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'
import type { OCForReception, RecepcionItem } from '@/app/actions/recepciones'

interface ReceptionModalProps {
    isOpen: boolean
    onClose: () => void
    oc: OCForReception | null
    loading: boolean
    submitting: boolean
    items: Record<string, number>
    notas: string
    onItemChange: (lineaId: string, cantidad: number) => void
    onNotasChange: (notas: string) => void
    onSubmit: () => void
}

export function ReceptionModal({
    isOpen,
    onClose,
    oc,
    loading,
    submitting,
    items,
    notas,
    onItemChange,
    onNotasChange,
    onSubmit
}: ReceptionModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-14 animate-apple-fade-in antialiased font-sans">
            {/* Backdrop Ultra-Blurred */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500"
                onClick={onClose}
            />

            {/* Modal Container: Apple Glass Design */}
            <div className="relative w-full max-w-5xl bg-[#f5f5f7] dark:bg-apple-gray-50 border border-white/20 dark:border-white/5 rounded-[48px] shadow-apple-float overflow-hidden flex flex-col max-h-[92vh] scale-up-center">

                {/* Surgical Header */}
                <header className="px-12 py-10 bg-white/50 dark:bg-black/20 backdrop-blur-xl border-b border-apple-gray-100 dark:border-white/5 flex items-center justify-between shrink-0 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-apple-blue text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-apple-blue/20">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em] mb-1">Módulo de Compras</p>
                            <h3 className="text-3xl font-black text-foreground tracking-tighter">
                                Control de Recepción
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-apple-gray-400">Orden de Compra OC-{oc?.numero}</span>
                                <div className="w-1 h-1 rounded-full bg-apple-gray-200" />
                                <span className="text-xs font-black text-apple-blue uppercase tracking-widest">{oc?.proveedor}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-14 h-14 rounded-full bg-apple-gray-100 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 hover:text-foreground hover:rotate-90 transition-all active:scale-95 border border-apple-gray-200 dark:border-white/5"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </header>

                {/* Dynamic Content Area */}
                <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-none custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="w-12 h-12 border-4 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
                            <p className="text-apple-gray-300 font-black uppercase tracking-[0.2em] text-[10px]">Consultando inventario...</p>
                        </div>
                    ) : oc ? (
                        <>
                            {/* Visual Guidance Banner */}
                            <div className="p-8 bg-apple-blue/5 border border-apple-blue/10 rounded-[32px] flex items-start gap-6 group">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-apple-blue shadow-sm group-hover:scale-110 transition-transform">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-apple-blue uppercase tracking-widest">Protocolo de Recepción</p>
                                    <p className="text-sm font-medium text-apple-gray-400 leading-relaxed">
                                        Valida las cantidades físicas ingresadas contra la remisión del proveedor. El sistema ajustará automáticamente los <span className="text-apple-blue font-bold">Insumos en Obra</span> al confirmar.
                                    </p>
                                </div>
                            </div>

                            {/* Itemized Grid Layout */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.3em]">Listado de Suministros</h4>
                                    <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">{oc.lineas.length} Items</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {oc.lineas.map(linea => {
                                        const recibida = linea.cantidad_recibida || 0
                                        const pendiente = linea.cantidad_solicitada - recibida
                                        const aRecibir = items[linea.id] || 0
                                        const isOverReceiving = aRecibir > pendiente && pendiente > 0
                                        const isAlreadyComplete = pendiente <= 0

                                        return (
                                            <div
                                                key={linea.id}
                                                className={cn(
                                                    "group p-8 rounded-[36px] border transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-10",
                                                    isAlreadyComplete
                                                        ? "bg-apple-gray-50/50 dark:bg-white/[0.02] border-apple-gray-100 dark:border-white/5 opacity-60"
                                                        : aRecibir > 0
                                                            ? "bg-white dark:bg-apple-gray-50 border-apple-blue/40 shadow-apple-lg -translate-y-1 ring-8 ring-apple-blue/5"
                                                            : "bg-white dark:bg-apple-gray-50 border-apple-gray-100 dark:border-white/5 hover:border-apple-gray-200"
                                                )}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500",
                                                        isAlreadyComplete
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : aRecibir > 0 ? "bg-apple-blue text-white" : "bg-apple-gray-50 dark:bg-white/5 text-apple-gray-200"
                                                    )}>
                                                        {isAlreadyComplete ? <CheckCircle2 className="w-8 h-8" /> : <Calculator className="w-8 h-8" />}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xl font-black text-foreground tracking-tight">{linea.insumo.nombre}</h5>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest px-2 py-0.5 bg-apple-gray-50 dark:bg-white/10 rounded-md">{linea.insumo.unidad}</span>
                                                            <span className="text-xs font-bold text-apple-gray-400">Pedido: {linea.cantidad_solicitada}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-12">
                                                    <div className="text-right flex flex-col items-end">
                                                        <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Estado</p>
                                                        <span className={cn(
                                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                                            isAlreadyComplete ? "bg-emerald-500 text-white" : "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                                                        )}>
                                                            {isAlreadyComplete ? 'Finalizado' : `${pendiente} Pendientes`}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2 group/input">
                                                        <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] text-center">Ingreso Actual</p>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={aRecibir || ''}
                                                                placeholder="0"
                                                                onChange={(e) => onItemChange(linea.id, parseFloat(e.target.value) || 0)}
                                                                className={cn(
                                                                    "w-32 px-6 py-6 text-center rounded-2xl text-2xl font-black transition-all outline-none border",
                                                                    isOverReceiving
                                                                        ? "bg-red-500/10 border-red-500 dark:border-red-500 text-red-600 focus:ring-8 focus:ring-red-500/10"
                                                                        : isAlreadyComplete
                                                                            ? "bg-apple-gray-100 dark:bg-white/5 border-transparent text-apple-gray-400 cursor-not-allowed"
                                                                            : "bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/10 text-foreground focus:ring-8 focus:ring-apple-blue/10 focus:border-apple-blue"
                                                                )}
                                                                disabled={isAlreadyComplete}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Dynamic Warnings Layer */}
                            {(() => {
                                const alerts: { type: 'warning' | 'error'; message: string }[] = []
                                oc.lineas.forEach(linea => {
                                    const recibida = linea.cantidad_recibida || 0
                                    const pendiente = linea.cantidad_solicitada - recibida
                                    const aRecibir = items[linea.id] || 0

                                    if (aRecibir > pendiente && pendiente > 0) {
                                        alerts.push({
                                            type: 'error',
                                            message: `Exceso en ${linea.insumo.nombre}: +${(aRecibir - pendiente).toFixed(2)} sobre lo pedido.`
                                        })
                                    } else if (aRecibir > 0 && aRecibir < pendiente) {
                                        alerts.push({
                                            type: 'warning',
                                            message: `Cierre Parcial en ${linea.insumo.nombre}: Quedan ${pendiente - aRecibir} unidades por recibir.`
                                        })
                                    }
                                })

                                if (alerts.length === 0) return null

                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-apple-slide-up">
                                        {alerts.map((alert, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "flex items-center gap-4 p-6 rounded-3xl text-sm font-bold border shadow-sm",
                                                    alert.type === 'error'
                                                        ? "bg-red-500 text-white border-red-600"
                                                        : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                                )}
                                            >
                                                {alert.type === 'error' ? <AlertCircle className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                                                {alert.message}
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()}

                            {/* Contextual Notes Pane */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.3em] ml-2">Bitácora de Entrega</label>
                                <div className="relative group">
                                    <textarea
                                        value={notas}
                                        onChange={(e) => onNotasChange(e.target.value)}
                                        placeholder="Describe el estado de la carga, precintos, clima o cualquier incidencia durante la descarga..."
                                        className="w-full p-8 bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 rounded-[40px] text-lg font-medium focus:ring-8 focus:ring-apple-blue/10 focus:border-apple-blue/50 outline-none min-h-[160px] transition-all resize-none shadow-inner"
                                    />
                                    <div className="absolute bottom-6 right-8 text-[10px] font-black text-apple-gray-200 uppercase tracking-widest">{notas.length} caracteres</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-40">
                            <XCircle className="w-24 h-24 text-red-500/20 mx-auto mb-8" />
                            <h4 className="text-2xl font-black text-foreground tracking-tight">Fallo Crítico de Datos</h4>
                            <p className="text-apple-gray-400 font-bold mt-2">No se pudo recuperar el manifiesto de la orden.</p>
                            <button onClick={onClose} className="mt-8 px-10 py-4 bg-apple-gray-100 dark:bg-white/5 rounded-full text-xs font-black uppercase tracking-widest">Reintentar Conexión</button>
                        </div>
                    )}
                </div>

                {/* Apple-Style Sticky Action Bar */}
                <footer className="px-12 py-10 bg-white/70 dark:bg-black/30 backdrop-blur-xl border-t border-apple-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 shrink-0">
                    <div className="flex items-center gap-4 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Validación de seguridad activa
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-10 py-5 text-apple-gray-400 font-black text-xs uppercase tracking-widest hover:text-foreground transition-all"
                        >
                            Abortar Operación
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={submitting || loading || !oc}
                            className="flex-[2] md:flex-none px-12 py-6 bg-apple-blue text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 active:scale-95 shadow-apple-float"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sincronizando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Confirmar Ingreso a Obra
                                </>
                            )}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    )
}
