'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    FileText, ImageIcon, Upload, FileUp,
    Trash2, Download, Search, LayoutGrid, List
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

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
        <Card>
            <CardContent className="p-6">
                <Tabs defaultValue="planos" onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                        
                        <div className="w-full overflow-x-auto custom-scrollbar-hide pb-2 xl:pb-0">
                            <TabsList className="inline-flex w-max items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground gap-1">
                                <TabsTrigger
                                    value="planos"
                                    className="text-xs uppercase tracking-wider font-semibold px-4"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Planos Arquitectónicos
                                </TabsTrigger>
                                <TabsTrigger
                                    value="renders"
                                    className="text-xs uppercase tracking-wider font-semibold px-4"
                                >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Renders & 3D
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar archivo..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-10"
                                />
                            </div>
                            <div className="flex bg-muted rounded-md p-1 h-10">
                                <button 
                                    onClick={() => setViewMode('grid')} 
                                    className={cn("px-3 rounded-[4px] transition-all", viewMode === 'grid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')} 
                                    className={cn("px-3 rounded-[4px] transition-all", viewMode === 'list' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            <Button className="h-10">
                                <Upload className="w-4 h-4 mr-2" />
                                Subir
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="planos" className="mt-0 outline-none">
                        <DocumentGrid docs={filteredDocs} viewMode={viewMode} accentColor="text-blue-500" accentBg="bg-blue-500/10" icon={FileText} />
                    </TabsContent>

                    <TabsContent value="renders" className="mt-0 outline-none">
                        <DocumentGrid docs={filteredDocs} viewMode={viewMode} accentColor="text-purple-500" accentBg="bg-purple-500/10" icon={ImageIcon} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

function DocumentGrid({ docs, viewMode, accentColor, accentBg, icon: Icon }: { docs: DocumentItem[], viewMode: 'grid' | 'list', accentColor: string, accentBg: string, icon: any }) {
    if (docs.length === 0) {
        return (
            <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed rounded-xl mt-4 bg-muted/20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileUp className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h4 className="text-base font-semibold text-foreground">No hay archivos</h4>
                <p className="text-sm font-medium text-muted-foreground mt-1 max-w-sm">Aún no se han subido documentos a esta sección. Sube el primer archivo para comenzar.</p>
            </div>
        )
    }

    if (viewMode === 'list') {
        return (
            <div className="space-y-3 mt-4">
                {docs.map((doc, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-background border rounded-lg hover:border-primary/30 transition-colors group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-md flex items-center justify-center shrink-0", accentBg)}>
                                <Icon className={cn("w-5 h-5", accentColor)} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground group-hover:underline">{doc.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{doc.uploadedAt}</p>
                                    <span className="text-muted-foreground text-xs">•</span>
                                    <span className="text-xs font-semibold text-muted-foreground">{doc.size}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {docs.map((doc, i) => (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    key={doc.id}
                    className="group relative flex flex-col bg-background rounded-xl border overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all duration-300 cursor-pointer"
                >
                    {/* File Preview Thumbnail */}
                    <div className="w-full aspect-video bg-muted/30 flex items-center justify-center relative overflow-hidden border-b">
                        <Icon className={cn("w-12 h-12 opacity-40", accentColor)} />

                        {/* Hover Actions Overlay */}
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                            <Button size="icon" variant="secondary" className="rounded-full shadow-sm">
                                <Download className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="destructive" className="rounded-full shadow-sm">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-4">
                        <h5 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{doc.name}</h5>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{doc.uploadedAt}</p>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">{doc.size}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
