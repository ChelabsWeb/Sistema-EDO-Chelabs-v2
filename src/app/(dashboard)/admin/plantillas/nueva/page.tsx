'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPlantilla } from '@/app/actions/plantillas'
import type { InsumoTipo } from '@/types/database'
import {
    ArrowLeft, Boxes, Plus, Trash2,
    Sparkles, Loader2, AlertCircle, CheckCircle2,
    LayoutGrid, Tag, FileText, Package, Users,
    Layers, Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function NuevaPlantillaPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        unidad: '',
        es_sistema: false
    })

    const [insumos, setInsumos] = useState<{
        nombre: string;
        unidad: string;
        tipo: InsumoTipo;
        precio_referencia: number;
    }[]>([])

    const [newInsumo, setNewInsumo] = useState<{
        nombre: string;
        unidad: string;
        tipo: InsumoTipo;
        precio_referencia: string;
    }>({
        nombre: '',
        unidad: '',
        tipo: 'material',
        precio_referencia: ''
    })

    const handleAddInsumo = () => {
        if (!newInsumo.nombre || !newInsumo.unidad || !newInsumo.precio_referencia) return

        setInsumos([
            ...insumos,
            {
                ...newInsumo,
                precio_referencia: parseFloat(newInsumo.precio_referencia)
            }
        ])

        setNewInsumo({
            nombre: '',
            unidad: '',
            tipo: 'material',
            precio_referencia: ''
        })
    }

    const handleRemoveInsumo = (index: number) => {
        setInsumos(insumos.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const result = await createPlantilla({
            ...formData,
            insumos
        })

        if (!result.success) {
            setError(result.error || 'Error al crear la plantilla')
            setLoading(false)
            return
        }

        router.push('/admin/plantillas')
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-black p-6 md:p-14 antialiased selection:bg-apple-blue/10">
            {/* Header */}
            <header className="max-w-5xl mx-auto flex items-center justify-between mb-12 animate-apple-fade-in">
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin/plantillas"
                        className="w-12 h-12 glass dark:glass-dark rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue transition-colors" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-apple-blue" />
                            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em]">Biblioteca Maestra</p>
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Nueva Plantilla</h1>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 rounded-full border border-apple-gray-100 dark:border-white/10 shadow-apple-sm">
                    <Sparkles className="w-4 h-4 text-apple-blue" />
                    <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest leading-none pt-0.5">Creación de Estándar</span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto animate-apple-slide-up">
                <form onSubmit={handleSubmit} className="space-y-12 pb-32">

                    {/* Section 1: Basic Info */}
                    <section className="bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-apple-blue/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="p-10 md:p-16 space-y-12 relative z-10">
                            <div className="flex items-center gap-4 border-b border-apple-gray-50 dark:border-white/5 pb-8">
                                <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue"><FileText className="w-6 h-6" /></div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Información General</h3>
                                    <p className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest">Identidad y clasificación</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4 md:col-span-2">
                                    <div className="flex items-center gap-3 px-2">
                                        <label htmlFor="nombre" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Nombre de la Plantilla</label>
                                    </div>
                                    <input
                                        type="text"
                                        id="nombre"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Ej: Albañilería de Elevación"
                                        className="w-full text-3xl md:text-4xl font-black text-foreground tracking-tighter bg-transparent border-b-2 border-apple-gray-50 dark:border-white/5 focus:border-apple-blue outline-none transition-all pb-4 placeholder:text-apple-gray-100 uppercase"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <Tag className="w-4 h-4 text-apple-gray-300" />
                                        <label htmlFor="unidad" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Unidad de Medida</label>
                                    </div>
                                    <input
                                        type="text"
                                        id="unidad"
                                        required
                                        value={formData.unidad}
                                        onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                                        placeholder="m2, m3, kg, etc."
                                        className="w-full h-14 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <LayoutGrid className="w-4 h-4 text-apple-gray-300" />
                                        <label htmlFor="descripcion" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Breve descripción</label>
                                    </div>
                                    <input
                                        type="text"
                                        id="descripcion"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        placeholder="Especificaciones técnicas..."
                                        className="w-full h-14 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Insumos Builder */}
                    <section className="bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-lg border border-apple-gray-100 dark:border-white/5 overflow-hidden">
                        <div className="p-10 md:p-16 space-y-12">
                            <div className="flex items-center justify-between border-b border-apple-gray-50 dark:border-white/5 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500"><Boxes className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="text-xl font-black text-foreground tracking-tight">Insumos del Estándar</h3>
                                        <p className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest">Composición técnica del rubro</p>
                                    </div>
                                </div>
                                <div className="font-black text-2xl text-apple-blue tracking-tighter">
                                    {insumos.length} Items
                                </div>
                            </div>

                            {/* Add Insumo Inline Form */}
                            <div className="p-8 bg-apple-gray-50/50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest ml-1">Nombre del Insumo</label>
                                    <input
                                        type="text"
                                        value={newInsumo.nombre}
                                        onChange={(e) => setNewInsumo({ ...newInsumo, nombre: e.target.value })}
                                        placeholder="Arena, Cemento, etc."
                                        className="w-full h-12 rounded-xl bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest ml-1">Unidad</label>
                                    <input
                                        type="text"
                                        value={newInsumo.unidad}
                                        onChange={(e) => setNewInsumo({ ...newInsumo, unidad: e.target.value })}
                                        placeholder="kg, m3..."
                                        className="w-full h-12 rounded-xl bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest ml-1">Precio REF</label>
                                    <input
                                        type="number"
                                        value={newInsumo.precio_referencia}
                                        onChange={(e) => setNewInsumo({ ...newInsumo, precio_referencia: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full h-12 rounded-xl bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddInsumo}
                                    className="h-12 bg-foreground text-background dark:bg-white dark:text-black rounded-xl px-6 font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar
                                </button>
                            </div>

                            {/* Insumos List */}
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {insumos.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="py-16 text-center border-2 border-dashed border-apple-gray-100 dark:border-white/10 rounded-[32px] space-y-4"
                                        >
                                            <Boxes className="w-12 h-12 text-apple-gray-50 mx-auto" />
                                            <p className="text-apple-gray-300 font-bold uppercase tracking-widest text-xs">Sin insumos asignados</p>
                                        </motion.div>
                                    ) : (
                                        insumos.map((insumo, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="flex items-center justify-between p-6 bg-apple-gray-50/30 dark:bg-white/[0.02] border border-apple-gray-100 dark:border-white/5 rounded-3xl group hover:border-apple-blue/30 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                                                        insumo.tipo === 'material' ? "bg-apple-blue/10 text-apple-blue" : "bg-emerald-500/10 text-emerald-500"
                                                    )}>
                                                        {insumo.tipo === 'material' ? <Package className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <h4 className="text-[17px] font-black text-foreground tracking-tight uppercase">{insumo.nombre}</h4>
                                                        <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">{insumo.unidad} • REF {insumo.precio_referencia.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveInsumo(idx)}
                                                    className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-[32px] flex items-center gap-3 text-red-600 dark:text-red-400 animate-apple-slide-up">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <p className="text-sm font-black uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    {/* Persistent Action Bar */}
                    <footer className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-10 py-6 glass dark:glass-dark rounded-[40px] shadow-2xl flex items-center gap-12 border border-white/20 backdrop-blur-3xl animate-apple-slide-up">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Nueva Configuración</span>
                            <span className="text-sm font-bold text-foreground">Creando biblioteca operativa</span>
                        </div>

                        <div className="h-10 w-px bg-apple-gray-100 dark:bg-white/10" />

                        <div className="flex items-center gap-4">
                            <Link href="/admin/plantillas" className="px-6 py-3 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest hover:text-foreground transition-all">Descartar</Link>
                            <button
                                type="submit"
                                disabled={loading || !formData.nombre}
                                className="h-16 px-10 bg-apple-blue text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.96] flex items-center gap-3 disabled:opacity-30"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Finalizar Plantilla
                                    </>
                                )}
                            </button>
                        </div>
                    </footer>

                </form>

                <div className="mt-12 text-center text-[10px] font-black text-apple-gray-100 uppercase tracking-[0.4em]">
                    Sistema de Gestión EDO • v2.0 Ultimate Edition
                </div>
            </main>
        </div>
    )
}
