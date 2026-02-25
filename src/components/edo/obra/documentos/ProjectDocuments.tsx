'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    FileText, ImageIcon, Upload, FileUp,
    Trash2, Download, Search, LayoutGrid, List
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DocumentItem {
    id: string
    name: string
    url: string
    type: 'plano' | 'render'
    uploadedAt: string
    size: string
}

const DUMMY_DOCUMENTS: DocumentItem[] = [
    { id: '1', name: 'Plano Planta Baja - Estructura', url: '#', type: 'plano', uploadedAt: '12 Feb 2026', size: '2.4 MB' },
    { id: '2', name: 'Plano Sanitaria Lote 4', url: '#', type: 'plano', uploadedAt: '15 Feb 2026', size: '1.8 MB' },
    { id: '3', name: 'Render Fachada Frontal', url: '#', type: 'render', uploadedAt: '18 Feb 2026', size: '4.2 MB' },
    { id: '4', name: 'Render Interiores Living', url: '#', type: 'render', uploadedAt: '20 Feb 2026', size: '5.1 MB' },
]

export function ProjectDocuments({ obraId }: { obraId: string }) {
    const [activeTab, setActiveTab] = useState('planos')
    const [search, setSearch] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const filteredDocs = DUMMY_DOCUMENTS.filter(doc =>
        doc.type === activeTab.slice(0, -1) &&
        doc.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 overflow-hidden p-10">
            <Tabs defaultValue="planos" onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">

                    <TabsList className="h-14 bg-apple-gray-50 dark:bg-black/20 p-1.5 rounded-2xl w-full max-w-md">
                        <TabsTrigger
                            value="planos"
                            className="w-full h-full rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-apple-gray-50 data-[state=active]:text-apple-blue data-[state=active]:shadow-sm transition-all"
                        >
                            Planos Arquitectónicos
                        </TabsTrigger>
                        <TabsTrigger
                            value="renders"
                            className="w-full h-full rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-apple-gray-50 data-[state=active]:text-purple-500 data-[state=active]:shadow-sm transition-all"
                        >
                            Renders & 3D
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar archivo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-apple-gray-50 dark:bg-black/20 rounded-2xl border border-transparent focus:border-apple-gray-200 dark:focus:border-white/10 outline-none text-sm font-bold transition-all"
                            />
                        </div>
                        <div className="flex bg-apple-gray-50 dark:bg-black/20 rounded-2xl p-1 h-14">
                            <button onClick={() => setViewMode('grid')} className={cn("px-4 rounded-xl transition-all", viewMode === 'grid' ? "bg-white dark:bg-apple-gray-50 shadow-sm text-foreground" : "text-apple-gray-400 hover:text-foreground")}>
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={cn("px-4 rounded-xl transition-all", viewMode === 'list' ? "bg-white dark:bg-apple-gray-50 shadow-sm text-foreground" : "text-apple-gray-400 hover:text-foreground")}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <button className="h-14 px-8 bg-apple-gray-900 dark:bg-white text-white dark:text-apple-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap">
                            <Upload className="w-4 h-4" />
                            Subir Archivo
                        </button>
                    </div>
                </div>

                <TabsContent value="planos" className="mt-0 outline-none">
                    <DocumentGrid docs={filteredDocs} viewMode={viewMode} accentColor="text-apple-blue" accentBg="bg-apple-blue/10" icon={FileText} />
                </TabsContent>

                <TabsContent value="renders" className="mt-0 outline-none">
                    <DocumentGrid docs={filteredDocs} viewMode={viewMode} accentColor="text-purple-500" accentBg="bg-purple-500/10" icon={ImageIcon} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function DocumentGrid({ docs, viewMode, accentColor, accentBg, icon: Icon }: { docs: DocumentItem[], viewMode: 'grid' | 'list', accentColor: string, accentBg: string, icon: any }) {
    if (docs.length === 0) {
        return (
            <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-apple-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                    <FileUp className="w-8 h-8 text-apple-gray-300" />
                </div>
                <h4 className="text-lg font-black text-foreground uppercase tracking-tight">No hay archivos</h4>
                <p className="text-sm font-medium text-apple-gray-400 mt-2 max-w-xs">Aún no se han subido documentos a esta sección. Sube el primer archivo para comenzar.</p>
            </div>
        )
    }

    if (viewMode === 'list') {
        return (
            <div className="space-y-4">
                {docs.map((doc, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        key={doc.id}
                        className="flex items-center justify-between p-4 px-6 bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 rounded-[24px] hover:border-apple-gray-200 transition-colors group cursor-pointer"
                    >
                        <div className="flex items-center gap-6">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", accentBg)}>
                                <Icon className={cn("w-6 h-6", accentColor)} />
                            </div>
                            <div>
                                <p className="font-bold text-sm tracking-tight text-foreground group-hover:underline">{doc.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-apple-gray-400 mt-1">{doc.uploadedAt} • {doc.size}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-3 text-apple-gray-400 hover:text-apple-blue hover:bg-apple-blue/10 rounded-xl transition-all"><Download className="w-4 h-4" /></button>
                            <button className="p-3 text-apple-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {docs.map((doc, i) => (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    key={doc.id}
                    className="group relative flex flex-col bg-apple-gray-50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5 overflow-hidden hover:shadow-apple-float transition-all duration-500 cursor-pointer"
                >
                    {/* File Preview Thumbnail */}
                    <div className="w-full aspect-[4/3] bg-stripes-light dark:bg-stripes-dark flex items-center justify-center relative overflow-hidden">
                        <Icon className={cn("w-16 h-16 opacity-30", accentColor)} />

                        {/* Hover Actions Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                            <button className="w-12 h-12 rounded-full bg-white text-apple-gray-900 flex items-center justify-center hover:scale-110 shadow-lg transition-transform"><Download className="w-5 h-5" /></button>
                            <button className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 shadow-lg transition-transform"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="p-6">
                        <h5 className="font-bold text-sm tracking-tight text-foreground line-clamp-1 group-hover:underline">{doc.name}</h5>
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-apple-gray-400">{doc.uploadedAt}</p>
                            <span className="text-[9px] font-bold text-apple-gray-500 uppercase">{doc.size}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
