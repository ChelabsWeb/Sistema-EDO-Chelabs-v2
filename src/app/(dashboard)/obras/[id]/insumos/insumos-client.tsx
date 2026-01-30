'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import { Search, Package, Users, Plus, ArrowLeft, Filter, Trash2, Edit3, MoreVertical, LayoutGrid, List, Tag, Layers, TrendingUp } from 'lucide-react'
import { DeleteInsumoButton } from '@/components/edo/insumo/delete-insumo-button'
import { AddPredefinidosButton } from '@/components/edo/insumo/add-predefinidos-button'
import { cn } from '@/lib/utils'

interface Insumo {
    id: string
    nombre: string
    unidad: string
    tipo: 'material' | 'mano_de_obra' | null
    precio_referencia: number | null
}

interface Props {
    obraId: string
    obraNombre: string
    initialInsumos: Insumo[]
}

export function InsumosClient({ obraId, obraNombre, initialInsumos }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'material' | 'mano_de_obra'>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const filteredInsumos = initialInsumos.filter(i => {
        const nameMatch = i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        const unidadMatch = i.unidad.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSearch = nameMatch || unidadMatch
        const matchesType = typeFilter === 'all' || i.tipo === typeFilter
        return matchesSearch && matchesType
    })

    const stats = {
        total: initialInsumos.length,
        materiales: initialInsumos.filter(i => i.tipo === 'material').length,
        manoDeObra: initialInsumos.filter(i => i.tipo === 'mano_de_obra').length
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-black/40 p-6 md:p-14 max-w-[1600px] mx-auto space-y-12 antialiased animate-apple-fade-in pb-32">
            {/* Dynamic Navigation Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Link href={`/obras/${obraId}`} className="w-12 h-12 rounded-full glass dark:glass-dark flex items-center justify-center text-apple-gray-400 hover:text-apple-blue transition-all active:scale-90 border border-apple-gray-100 dark:border-white/10 shadow-apple-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="px-5 py-2 glass dark:glass-dark border border-apple-gray-100 dark:border-white/10 rounded-full flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-apple-blue animate-pulse" />
                            <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Configuración de Base</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-[-0.05em] leading-[0.85]">
                            Maestro de<br />Insumos<span className="text-apple-blue">.</span>
                        </h1>
                        <p className="text-2xl text-apple-gray-400 font-medium tracking-tight max-w-2xl leading-relaxed">
                            Gestione el catálogo técnico y precios de referencia para <span className="text-foreground font-black border-b-2 border-apple-blue/30">{obraNombre}</span>.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <AddPredefinidosButton obraId={obraId} />
                    <Link
                        href={`/obras/${obraId}/insumos/nuevo`}
                        className="px-12 py-6 bg-apple-blue text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.96] flex items-center gap-4 group"
                    >
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        Nuevo Insumo
                    </Link>
                </div>
            </header>

            {/* Spotlight Search & Bento Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Spotlight Search */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-apple-blue/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-apple-gray-300 group-focus-within:text-apple-blue transition-all duration-500 group-focus-within:scale-110" />
                        <input
                            type="text"
                            placeholder="Buscar insumo por nombre o unidad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-20 pr-10 py-7 bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/10 rounded-[32px] focus:outline-none focus:ring-8 focus:ring-apple-blue/5 focus:border-apple-blue transition-all font-bold tracking-tight text-xl shadow-apple-lg"
                        />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-40 group-focus-within:opacity-0 transition-opacity">
                            <span className="text-[10px] font-black px-2 py-1 bg-apple-gray-100 dark:bg-white/10 rounded-md border border-current/10">ESC</span>
                            <span className="text-[10px] font-black">PARA LIMPIAR</span>
                        </div>
                    </div>

                    {/* Filter Strip */}
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3 p-1.5 bg-apple-gray-100/50 dark:bg-white/5 rounded-[22px] border border-apple-gray-100/30 dark:border-white/5 backdrop-blur-md">
                            {(['all', 'material', 'mano_de_obra'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={cn(
                                        "px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300",
                                        typeFilter === type
                                            ? "bg-white dark:bg-apple-gray-50 text-apple-blue shadow-apple-sm scale-105"
                                            : "text-apple-gray-400 hover:text-foreground"
                                    )}
                                >
                                    {type === 'all' ? 'Todos los Insumos' : type === 'material' ? 'Materiales' : 'Mano de Obra'}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 p-1.5 bg-apple-gray-100/50 dark:bg-white/5 rounded-[22px] border border-apple-gray-100/30 dark:border-white/5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-3.5 rounded-xl transition-all duration-300", viewMode === 'grid' ? "bg-white dark:bg-apple-gray-50 text-apple-blue shadow-sm" : "text-apple-gray-300")}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-3.5 rounded-xl transition-all duration-300", viewMode === 'list' ? "bg-white dark:bg-apple-gray-50 text-apple-blue shadow-sm" : "text-apple-gray-300")}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vertical Bento Stats */}
                <div className="lg:col-span-4 grid grid-cols-1 gap-6">
                    <div className="p-10 bg-white dark:bg-apple-gray-50 rounded-[48px] border border-apple-gray-100 dark:border-white/5 shadow-apple-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Package className="w-8 h-8" />
                            </div>
                            <h3 className="text-5xl font-black text-foreground tracking-tighter mb-1">{stats.total}</h3>
                            <p className="text-xs font-black text-apple-gray-300 uppercase tracking-widest">Total Suministros</p>
                        </div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-apple-blue/5 blur-[60px] translate-x-1/4 -translate-y-1/4 rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-8 bg-apple-blue/5 dark:bg-apple-blue/10 rounded-[40px] border border-apple-blue/10">
                            <p className="text-[10px] font-black text-apple-blue uppercase tracking-widest mb-1">Materiales</p>
                            <h4 className="text-3xl font-black text-apple-blue tracking-tighter">{stats.materiales}</h4>
                        </div>
                        <div className="p-8 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-[40px] border border-indigo-500/10">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Mano de Obra</p>
                            <h4 className="text-3xl font-black text-indigo-500 tracking-tighter">{stats.manoDeObra}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Dynamic View */}
            <section className="min-h-[500px]">
                {filteredInsumos.length === 0 ? (
                    <div className="text-center py-40 glass dark:glass-dark rounded-[64px] border border-dashed border-apple-gray-200 dark:border-white/10 mx-auto max-w-4xl">
                        <div className="w-32 h-32 bg-white dark:bg-white/5 rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-inner">
                            <Search className="w-16 h-16 text-apple-gray-100" />
                        </div>
                        <h3 className="text-4xl font-black text-foreground tracking-tighter mb-4">Misión fallida</h3>
                        <p className="text-xl text-apple-gray-400 font-medium mb-12 max-w-sm mx-auto">No encontramos nada que coincida con "<span className="text-apple-blue font-bold">{searchTerm}</span>".</p>
                        <button
                            onClick={() => { setSearchTerm(''); setTypeFilter('all') }}
                            className="px-10 py-5 bg-foreground text-background dark:bg-white dark:text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-apple-lg"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                ) : (
                    <div className={cn(
                        "animate-apple-slide-up",
                        viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-6"
                    )}>
                        {filteredInsumos.map((insumo, idx) => (
                            <div
                                key={insumo.id}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                                className={cn(
                                    "group relative bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 rounded-[40px] transition-all duration-700 hover:shadow-apple-float hover:border-apple-blue/30 overflow-hidden animate-apple-fade-in",
                                    viewMode === 'grid' ? "p-10 flex flex-col" : "p-8 flex items-center justify-between"
                                )}
                            >
                                <div className={cn("flex gap-8", viewMode === 'grid' ? "flex-col" : "items-center")}>
                                    <div className={cn(
                                        "rounded-[28px] flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-inner",
                                        viewMode === 'grid' ? "w-20 h-20" : "w-16 h-16",
                                        insumo.tipo === 'material' ? "bg-apple-blue/10 text-apple-blue" : "bg-indigo-500/10 text-indigo-500"
                                    )}>
                                        {insumo.tipo === 'material' ? <Package className={viewMode === 'grid' ? "w-10 h-10" : "w-8 h-8"} /> : <Users className={viewMode === 'grid' ? "w-10 h-10" : "w-8 h-8"} />}
                                    </div>

                                    <div className="space-y-1 flex-1">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <h4 className="text-2xl font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors">{insumo.nombre}</h4>
                                            <div className={cn(
                                                "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2",
                                                insumo.tipo === 'material' ? "bg-apple-blue/5 text-apple-blue border border-apple-blue/10" : "bg-indigo-500/5 text-indigo-500 border border-indigo-500/10"
                                            )}>
                                                <Tag className="w-3 h-3" />
                                                {insumo.unidad}
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "transition-all duration-700",
                                            viewMode === 'grid' ? "pt-12 mt-12 border-t border-apple-gray-50 dark:border-white/[0.05] flex justify-between items-end" : "hidden"
                                        )}>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest leading-none">Precio Referencia</p>
                                                </div>
                                                <p className="text-3xl font-black text-foreground tracking-tighter">{formatPesos(insumo.precio_reference || insumo.precio_referencia)}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/obras/${obraId}/insumos/${insumo.id}/editar`}
                                                    className="w-12 h-12 rounded-2xl bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 hover:bg-apple-blue hover:text-white transition-all transform active:scale-90"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </Link>
                                                <DeleteInsumoButton insumoId={insumo.id} insumoNombre={insumo.nombre} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {viewMode === 'list' && (
                                    <div className="flex items-center gap-12">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest leading-none mb-1">Precio REF</p>
                                            <p className="text-3xl font-black text-foreground tracking-tighter">{formatPesos(insumo.precio_reference || insumo.precio_referencia)}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/obras/${obraId}/insumos/${insumo.id}/editar`}
                                                className="w-12 h-12 rounded-2xl bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 hover:bg-apple-blue hover:text-white transition-all transform active:scale-90"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                            </Link>
                                            <DeleteInsumoButton insumoId={insumo.id} insumoNombre={insumo.nombre} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
