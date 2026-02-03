'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPlantillaWithDetails, updatePlantilla, updatePlantillaInsumos, deletePlantilla } from '@/app/actions/plantillas'
import type { InsumoTipo } from '@/types/database'
import {
    ArrowLeft, Boxes, Plus, Trash2,
    Sparkles, Loader2, AlertCircle, CheckCircle2,
    LayoutGrid, Tag, FileText, Package, Users,
    Layers, Save, Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

interface Props {
    params: Promise<{ id: string }>
}

export default function EditarPlantillaPage({ params }: Props) {
    const router = useRouter()
    const [id, setId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

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

    useEffect(() => {
        async function loadPlantilla() {
            const resolvedParams = await params
            setId(resolvedParams.id)

            const result = await getPlantillaWithDetails(resolvedParams.id)
            if (!result.success || !result.data) {
                setError(result.error || 'No se pudo cargar la plantilla')
                setLoading(false)
                return
            }

            const p = result.data
            setFormData({
                nombre: p.nombre,
                descripcion: p.descripcion || '',
                unidad: p.unidad,
                es_sistema: p.es_sistema
            })
            setInsumos(p.insumos || [])
            setLoading(false)
        }
        loadPlantilla()
    }, [params])

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
        if (!id) return

        setSaving(true)
        setError(null)
        setSuccess(null)

        // 1. Update basic info
        const basicResult = await updatePlantilla(id, {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            unidad: formData.unidad
        })

        if (!basicResult.success) {
            setError(basicResult.error || 'Error al actualizar información básica')
            setSaving(false)
            return
        }

        // 2. Update insumos
        const insumosResult = await updatePlantillaInsumos(id, insumos)

        if (!insumosResult.success) {
            setError(insumosResult.error || 'Error al actualizar insumos')
            setSaving(false)
            return
        }

        setSuccess('Plantilla actualizada correctamente')
        setSaving(false)

        setTimeout(() => {
            router.push(`/admin/plantillas/${id}`)
        }, 1500)
    }

    const handleDelete = async () => {
        if (!id) return
        if (!confirm('¿Seguro que deseas eliminar esta plantilla? Esta acción no se puede deshacer.')) return

        setSaving(true)
        const result = await deletePlantilla(id)
        if (!result.success) {
            setError(result.error || 'Error al eliminar')
            setSaving(false)
            return
        }
        router.push('/admin/plantillas')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
                <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] animate-pulse">Cargando Especificaciones...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-black p-6 md:p-14 antialiased selection:bg-apple-blue/10">
            {/* Header */}
            <header className="max-w-5xl mx-auto flex items-center justify-between mb-12 animate-apple-fade-in">
                <div className="flex items-center gap-6">
                    <Link
                        href={`/admin/plantillas/${id}`}
                        className="w-12 h-12 glass dark:glass-dark rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue transition-colors" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-apple-blue" />
                            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em]">Editor de Biblioteca</p>
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Editar Plantilla</h1>
                    </div>
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
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Información de Base</h3>
                                    <p className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest">Identidad del estándar</p>
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
                                        placeholder="Nombre descriptivo"
                                        className="w-full text-3xl md:text-4xl font-black text-foreground tracking-tighter bg-transparent border-b-2 border-apple-gray-50 dark:border-white/5 focus:border-apple-blue outline-none transition-all pb-4 placeholder:text-apple-gray-100 uppercase"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <Tag className="w-4 h-4 text-apple-gray-300" />
                                        <label htmlFor="unidad" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Unidad</label>
                                    </div>
                                    <input
                                        type="text"
                                        id="unidad"
                                        required
                                        value={formData.unidad}
                                        onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                                        placeholder="Ej: m2"
                                        className="w-full h-14 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <LayoutGrid className="w-4 h-4 text-apple-gray-300" />
                                        <label htmlFor="descripcion" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Descripción Técnica</label>
                                    </div>
                                    <input
                                        type="text"
                                        id="descripcion"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        placeholder="Detalles del rubro..."
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
                                        <h3 className="text-xl font-black text-foreground tracking-tight">Composición de Insumos</h3>
                                        <p className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest">Modificar estructura del rubro</p>
                                    </div>
                                </div>
                                <div className="font-black text-2xl text-apple-blue tracking-tighter italic">
                                    {insumos.length} Items
                                </div>
                            </div>

                            {/* Add Insumo Inline Form */}
                            <div className="p-8 bg-apple-gray-50/50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest ml-1">Insumo</label>
                                    <input
                                        type="text"
                                        value={newInsumo.nombre}
                                        onChange={(e) => setNewInsumo({ ...newInsumo, nombre: e.target.value })}
                                        placeholder="Nombre..."
                                        className="w-full h-12 rounded-xl bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest ml-1">UM</label>
                                    <input
                                        type="text"
                                        value={newInsumo.unidad}
                                        onChange={(e) => setNewInsumo({ ...newInsumo, unidad: e.target.value })}
                                        placeholder="Unidad"
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
                                    {insumos.map((insumo, idx) => (
                                        <motion.div
                                            key={`${idx}-${insumo.nombre}`}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
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
                                                    <h4 className="text-[17px] font-black text-foreground tracking-tight uppercase italic">{insumo.nombre}</h4>
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
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </section>

                    <AnimatePresence>
                        {(error || success) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-6 rounded-[32px] flex items-center gap-4 border shadow-sm",
                                    error ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                                        : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                )}
                            >
                                {error ? <AlertCircle className="w-6 h-6 shrink-0" /> : <CheckCircle2 className="w-6 h-6 shrink-0" />}
                                <p className="text-sm font-black uppercase tracking-tight">{error || success}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Bar */}
                    <footer className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-10 py-6 glass dark:glass-dark rounded-[40px] shadow-2xl flex items-center gap-12 border border-white/20 backdrop-blur-3xl animate-apple-slide-up">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex items-center gap-2 text-red-500 hover:scale-110 transition-transform"
                        >
                            <Archive className="w-5 h-5" />
                        </button>

                        <div className="h-10 w-px bg-apple-gray-100 dark:bg-white/10" />

                        <div className="flex items-center gap-4">
                            <Link href={`/admin/plantillas/${id}`} className="px-6 py-3 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest hover:text-foreground transition-all">Cancelar</Link>
                            <button
                                type="submit"
                                disabled={saving || !formData.nombre}
                                className="h-16 px-10 bg-apple-blue text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.96] flex items-center gap-3 disabled:opacity-30"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sincronizando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Actualizar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </footer>
                </form>
            </main>
        </div>
    )
}
