'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import {
    Search, Package, Users, Plus, Filter, Trash2,
    Edit3, MoreVertical, LayoutGrid, List, Tag,
    Layers, TrendingUp, Boxes
} from 'lucide-react'
import { DeleteInsumoButton } from '@/components/edo/insumo/delete-insumo-button'
import { AddPredefinidosButton } from '@/components/edo/insumo/add-predefinidos-button'
import { RubrosList } from '@/components/edo/rubros'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'

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
    userRole: UserRole
    valorUr: number
}

export function InsumosClient({ obraId, obraNombre, initialInsumos, userRole, valorUr }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'material' | 'mano_de_obra'>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [resourceMode, setResourceMode] = useState<'insumos' | 'rubros'>('insumos')

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
        <div className="max-w-[1600px] mx-auto space-y-10 antialiased animate-apple-fade-in pb-32 px-8 pt-10">
            {/* Header & Mode Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 premium-card p-10">
                <div className="space-y-2">
                    <span className="text-[10px] font-black text-apple-blue uppercase tracking-[0.3em]">Operaciones de Obra</span>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Recursos del Proyecto</h2>
                    <p className="text-apple-gray-400 font-medium tracking-tight">Gestión integral de rubros y suministros</p>
                </div>

                <div className="flex items-center gap-2 bg-apple-gray-50 dark:bg-white/5 p-1.5 rounded-full border border-apple-gray-100 dark:border-white/10">
                    <button
                        onClick={() => setResourceMode('insumos')}
                        className={cn(
                            "px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                            resourceMode === 'insumos'
                                ? "bg-white dark:bg-apple-gray-50 text-apple-blue shadow-apple-sm"
                                : "text-apple-gray-400 hover:text-foreground"
                        )}
                    >
                        Insumos
                    </button>
                    <button
                        onClick={() => setResourceMode('rubros')}
                        className={cn(
                            "px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                            resourceMode === 'rubros'
                                ? "bg-white dark:bg-apple-gray-50 text-apple-blue shadow-apple-sm"
                                : "text-apple-gray-400 hover:text-foreground"
                        )}
                    >
                        Rubros
                    </button>
                </div>
            </div>

            {resourceMode === 'insumos' ? (
                <div className="space-y-10 animate-apple-slide-up">
                    {/* Insumos Specific Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                        <div className="flex items-center gap-4">
                            <AddPredefinidosButton obraId={obraId} />
                            <Link
                                href={`/obras/${obraId}/insumos/nuevo`}
                                className="px-8 py-4 bg-apple-blue text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-lg active:scale-95 flex items-center gap-3 group"
                            >
                                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                                Nuevo Insumo
                            </Link>
                        </div>

                        <div className="flex items-center gap-3 p-1.5 bg-apple-gray-100/50 dark:bg-white/5 rounded-[22px] border border-apple-gray-100/30 dark:border-white/5 backdrop-blur-md">
                            {(['all', 'material', 'mano_de_obra'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={cn(
                                        "px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all",
                                        typeFilter === type
                                            ? "bg-white dark:bg-apple-gray-50 text-apple-blue shadow-apple-sm"
                                            : "text-apple-gray-400 hover:text-foreground"
                                    )}
                                >
                                    {type === 'all' ? 'Todos' : type === 'material' ? 'Materiales' : 'Mano de Obra'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Spotlight Search */}
                            <div className="relative group">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-apple-gray-300 group-focus-within:text-apple-blue transition-all" />
                                <input
                                    type="text"
                                    placeholder="Buscar insumo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-20 pr-10 py-7 bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/10 rounded-[40px] focus:outline-none focus:ring-8 focus:ring-apple-blue/5 focus:border-apple-blue transition-all font-bold tracking-tight text-xl shadow-apple-lg"
                                />
                            </div>

                            <div className={cn(
                                "grid gap-6 animate-apple-slide-up",
                                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                            )}>
                                {filteredInsumos.map((insumo, idx) => (
                                    <div key={insumo.id} className="premium-card p-8 group hover:border-apple-blue/30 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                                                insumo.tipo === 'material' ? "bg-apple-blue/10 text-apple-blue" : "bg-indigo-500/10 text-indigo-500"
                                            )}>
                                                {insumo.tipo === 'material' ? <Package className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/obras/${obraId}/insumos/${insumo.id}/editar`}
                                                    className="size-10 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 hover:bg-apple-blue hover:text-white transition-all shadow-sm"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                                <DeleteInsumoButton insumoId={insumo.id} insumoNombre={insumo.nombre} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors font-display uppercase">{insumo.nombre}</h4>
                                            <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">{insumo.unidad}</p>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-apple-gray-100 dark:border-white/5 flex justify-between items-end">
                                            <div>
                                                <p className="text-[9px] font-black text-apple-gray-400 uppercase tracking-widest leading-none mb-1">Precio REF</p>
                                                <p className="text-2xl font-black text-foreground tracking-tighter">{formatPesos(insumo.precio_referencia)}</p>
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                insumo.tipo === 'material' ? "bg-apple-blue/10 text-apple-blue" : "bg-indigo-500/10 text-indigo-500"
                                            )}>
                                                {insumo.tipo === 'material' ? 'Material' : 'MO'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="premium-card p-10 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue mb-6">
                                        <Boxes className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-5xl font-black text-foreground tracking-tighter mb-1">{stats.total}</h3>
                                    <p className="text-xs font-black text-apple-gray-300 uppercase tracking-widest">Insumos Registrados</p>
                                </div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-apple-blue/5 blur-[60px] translate-x-1/4 -translate-y-1/4 rounded-full" />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-8 premium-card">
                                    <p className="text-[10px] font-black text-apple-blue uppercase tracking-widest mb-1">Materiales</p>
                                    <h4 className="text-3xl font-black text-foreground tracking-tighter">{stats.materiales}</h4>
                                </div>
                                <div className="p-8 premium-card">
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Mano de Obra</p>
                                    <h4 className="text-3xl font-black text-foreground tracking-tighter">{stats.manoDeObra}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-10 animate-apple-slide-up">
                    <div className="premium-card p-10 overflow-hidden">
                        <div className="p-10 flex items-center justify-between border-b border-apple-gray-100 dark:border-white/5 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                                    <Layers className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Estructura de Rubros</h2>
                                    <p className="text-sm font-medium text-apple-gray-400">Presupuestación técnica por ítem</p>
                                </div>
                            </div>

                            <Link
                                href={`/obras/${obraId}/rubros/nuevo`}
                                className="px-8 py-4 bg-apple-blue text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-lg active:scale-95 flex items-center gap-3"
                            >
                                <Plus className="w-5 h-5" />
                                Nuevo Rubro
                            </Link>
                        </div>

                        <div className="p-2 md:p-6">
                            <RubrosList
                                obraId={obraId}
                                userRole={userRole}
                                valorUr={valorUr}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
