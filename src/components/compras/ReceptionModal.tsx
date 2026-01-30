'use client'

import React from 'react'
import { X, CheckCircle2, AlertTriangle, AlertCircle, Package, ArrowRight, Save, XCircle } from 'lucide-react'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-apple-fade-in">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-apple-gray-50 rounded-[40px] shadow-apple-float overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-10 py-8 border-b border-apple-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                                Registrar Recepción
                            </h3>
                            <p className="text-sm text-apple-gray-400 font-medium tracking-tight">
                                OC-{oc?.numero} • {oc?.proveedor || 'Sin proveedor'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 hover:text-foreground transition-all active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
                            <p className="text-apple-gray-400 font-medium">Cargando detalles de la orden...</p>
                        </div>
                    ) : oc ? (
                        <>
                            {/* Alert for Status */}
                            <div className="p-4 bg-apple-blue/5 border border-apple-blue/10 rounded-2xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-apple-blue" />
                                <p className="text-sm font-bold text-apple-blue">
                                    Ingresa las cantidades recibidas físicamente. Se actualizará el inventario automáticamente.
                                </p>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-black text-foreground tracking-tight uppercase text-[10px] tracking-[0.2em] text-apple-gray-400">Items de la Orden</h4>
                                <div className="border border-apple-gray-100 dark:border-white/5 rounded-[32px] overflow-hidden">
                                    <table className="min-w-full divide-y divide-apple-gray-100 dark:divide-white/5">
                                        <thead className="bg-apple-gray-50/50 dark:bg-apple-gray-50/10">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">Insumo</th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">Pedido</th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">Recibido</th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">Pendiente</th>
                                                <th className="px-6 py-4 text-center text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">A Recibir</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-apple-gray-50 dark:divide-white/5">
                                            {oc.lineas.map(linea => {
                                                const recibida = linea.cantidad_recibida || 0
                                                const pendiente = linea.cantidad_solicitada - recibida
                                                const aRecibir = items[linea.id] || 0
                                                const isOverReceiving = aRecibir > pendiente && pendiente > 0
                                                const isAlreadyComplete = pendiente <= 0

                                                return (
                                                    <tr key={linea.id} className={cn(
                                                        "group transition-colors",
                                                        isOverReceiving ? "bg-red-500/5" : isAlreadyComplete ? "bg-emerald-500/5" : "hover:bg-apple-gray-50/30"
                                                    )}>
                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-bold text-foreground">{linea.insumo.nombre}</div>
                                                            <div className="text-[10px] font-black text-apple-gray-300 uppercase tracking-tighter">{linea.insumo.unidad}</div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right text-sm font-medium text-apple-gray-400">
                                                            {linea.cantidad_solicitada}
                                                        </td>
                                                        <td className="px-6 py-5 text-right text-sm font-medium text-emerald-600">
                                                            {recibida}
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-black text-sm">
                                                            <span className={pendiente <= 0 ? 'text-emerald-500' : 'text-orange-500'}>
                                                                {pendiente > 0 ? pendiente : 'COMPLETO'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={aRecibir}
                                                                onChange={(e) => onItemChange(linea.id, parseFloat(e.target.value) || 0)}
                                                                className={cn(
                                                                    "w-24 px-4 py-2 text-center rounded-xl text-sm font-black transition-all border",
                                                                    isOverReceiving
                                                                        ? "bg-red-500/10 border-red-500/20 text-red-600 focus:ring-red-500"
                                                                        : isAlreadyComplete
                                                                            ? "bg-apple-gray-50 dark:bg-white/5 border-transparent text-apple-gray-300 pointer-events-none"
                                                                            : "bg-apple-gray-50 dark:bg-white/5 border-apple-gray-100 dark:border-white/10 text-foreground focus:ring-apple-blue"
                                                                )}
                                                                disabled={isAlreadyComplete}
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Alerts */}
                            {(() => {
                                const alerts: { type: 'warning' | 'error'; message: string }[] = []
                                oc.lineas.forEach(linea => {
                                    const recibida = linea.cantidad_recibida || 0
                                    const pendiente = linea.cantidad_solicitada - recibida
                                    const aRecibir = items[linea.id] || 0

                                    if (aRecibir > pendiente && pendiente > 0) {
                                        alerts.push({
                                            type: 'error',
                                            message: `${linea.insumo.nombre}: Estás recibiendo ${aRecibir - pendiente} unidades más de lo solicitado.`
                                        })
                                    } else if (aRecibir > 0 && aRecibir < pendiente) {
                                        alerts.push({
                                            type: 'warning',
                                            message: `${linea.insumo.nombre}: Recepción parcial. Quedarán ${pendiente - aRecibir} unidades pendientes.`
                                        })
                                    }
                                })

                                if (alerts.length === 0) return null

                                return (
                                    <div className="space-y-3">
                                        {alerts.map((alert, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-2xl text-sm font-bold border",
                                                    alert.type === 'error'
                                                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                                                        : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                                )}
                                            >
                                                {alert.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                                                {alert.message}
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()}

                            {/* Notas */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] ml-2">Notas de Recepción</label>
                                <textarea
                                    value={notas}
                                    onChange={(e) => onNotasChange(e.target.value)}
                                    placeholder="Observaciones sobre la entrega, estado de los materiales, etc."
                                    className="w-full p-6 bg-apple-gray-50 dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 rounded-[28px] text-sm font-medium focus:ring-2 focus:ring-apple-blue/50 outline-none min-h-[120px] transition-all"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <XCircle className="w-16 h-16 text-red-500/20 mx-auto mb-4" />
                            <p className="text-apple-gray-400 font-bold">No se pudo cargar la orden.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-10 py-8 bg-apple-gray-50/50 dark:bg-white/[0.02] border-t border-apple-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-apple-gray-400 font-bold hover:text-foreground transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={submitting || loading || !oc}
                        className="px-10 py-4 bg-apple-blue text-white rounded-full font-bold text-lg hover:bg-apple-blue-dark transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-3 active:scale-95 shadow-[0_15px_30px_rgba(0,113,227,0.3)]"
                    >
                        {submitting ? (
                            <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Guardar Recepción
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
