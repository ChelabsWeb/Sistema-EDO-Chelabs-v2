'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import {
    Search, Package, Users, Plus, Edit3, Boxes, Layers
} from 'lucide-react'
import { DeleteInsumoButton } from '@/components/edo/insumo/delete-insumo-button'
import { AddPredefinidosButton } from '@/components/edo/insumo/add-predefinidos-button'
import { RubrosList } from '@/components/edo/rubros'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        <div className="flex-1 flex flex-col space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Recursos del Proyecto</h2>
                    <p className="text-muted-foreground mt-1">Gestión integral de rubros y suministros</p>
                </div>
            </div>

            <Tabs defaultValue="insumos" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="insumos" className="text-xs uppercase tracking-wider font-semibold">Insumos</TabsTrigger>
                    <TabsTrigger value="rubros" className="text-xs uppercase tracking-wider font-semibold">Estructura de Rubros</TabsTrigger>
                </TabsList>

                <TabsContent value="insumos" className="space-y-8 outline-none">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border">
                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar insumo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-background"
                                />
                            </div>
                            <Tabs value={typeFilter} onValueChange={(val) => setTypeFilter(val as any)} className="w-full md:w-auto">
                                <TabsList className="grid w-full grid-cols-3 md:inline-flex md:w-auto">
                                    <TabsTrigger value="all" className="text-xs uppercase tracking-wider font-semibold">Todos</TabsTrigger>
                                    <TabsTrigger value="material" className="text-xs uppercase tracking-wider font-semibold">Mat.</TabsTrigger>
                                    <TabsTrigger value="mano_de_obra" className="text-xs uppercase tracking-wider font-semibold">M.O.</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="flex items-center gap-2">
                            <AddPredefinidosButton obraId={obraId} />
                            <Button asChild>
                                <Link href={`/obras/${obraId}/insumos/nuevo`}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Insumo
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Main Grid */}
                        <div className="lg:col-span-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredInsumos.map((insumo) => (
                                    <Card key={insumo.id} className="group hover:border-primary/50 transition-colors flex flex-col justify-between">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                                    insumo.tipo === 'material' ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
                                                )}>
                                                    {insumo.tipo === 'material' ? <Package className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                       <Link href={`/obras/${obraId}/insumos/${insumo.id}/editar`}>
                                                           <Edit3 className="w-4 h-4" />
                                                       </Link>
                                                    </Button>
                                                    <DeleteInsumoButton insumoId={insumo.id} insumoNombre={insumo.nombre} />
                                                </div>
                                            </div>
                                            <div className="space-y-1 mb-6">
                                                <h4 className="font-bold text-foreground line-clamp-2" title={insumo.nombre}>{insumo.nombre}</h4>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{insumo.unidad}</p>
                                            </div>
                                            <div className="border-t pt-4 flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Precio REF</p>
                                                    <p className="text-lg font-bold text-foreground leading-none">{formatPesos(insumo.precio_referencia)}</p>
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-1 rounded bg-muted uppercase tracking-widest"
                                                )}>
                                                    {insumo.tipo === 'material' ? 'Material' : 'MO'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {filteredInsumos.length === 0 && (
                                   <div className="col-span-full p-8 text-center border-2 border-dashed rounded-xl">
                                      <p className="text-muted-foreground text-sm">No se encontraron insumos.</p>
                                   </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="bg-primary/5 border-primary/10">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                    <Boxes className="w-6 h-6 text-primary mb-3" />
                                    <h3 className="text-3xl font-bold text-primary mb-1">{stats.total}</h3>
                                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Insumos Registrados</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Materiales</p>
                                        <h4 className="text-2xl font-bold text-foreground">{stats.materiales}</h4>
                                    </div>
                                    <Package className="w-5 h-5 text-muted-foreground/50" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Mano de Obra</p>
                                        <h4 className="text-2xl font-bold text-foreground">{stats.manoDeObra}</h4>
                                    </div>
                                    <Users className="w-5 h-5 text-muted-foreground/50" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="rubros" className="outline-none">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                   <Layers className="w-5 h-5 text-primary" />
                                   Estructura de Rubros
                                </CardTitle>
                            </div>
                            <Button asChild>
                                <Link href={`/obras/${obraId}/rubros/nuevo`}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Rubro
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-6">
                                <RubrosList
                                    obraId={obraId}
                                    userRole={userRole}
                                    valorUr={valorUr}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
