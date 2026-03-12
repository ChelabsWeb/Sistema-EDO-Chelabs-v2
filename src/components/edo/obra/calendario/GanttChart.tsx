'use client'

import React, { useState, useEffect } from 'react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import "gantt-task-react/dist/index.css"
import { updateOTDates } from '@/app/actions/ordenes-trabajo'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CalendarRange, Loader2, Maximize, Minimize } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

interface GanttChartProps {
    initialOts: any[]
}

export function GanttChart({ initialOts }: GanttChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [expanded, setExpanded] = useState(false)

    // Map backend OTs to Gantt Tasks
    useEffect(() => {
        if (!initialOts || initialOts.length === 0) {
            setTasks([])
            setLoading(false)
            return
        }

        const mappedTasks: Task[] = initialOts.map((ot) => {
            // Fallback dates if null (start today, end next week)
            const startDate = ot.fecha_inicio ? new Date(ot.fecha_inicio) : new Date()

            const endDate = ot.fecha_fin
                ? new Date(ot.fecha_fin)
                : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)

            // Only allow editing if not closed
            const isDisabled = ot.estado === 'cerrada'

            // Select color based on status
            let styles = { backgroundColor: '#3b82f6', backgroundSelectedColor: '#2563eb', progressColor: '#1d4ed8', progressSelectedColor: '#1e3a8a' }
            if (ot.estado === 'borrador') styles = { backgroundColor: '#94a3b8', backgroundSelectedColor: '#64748b', progressColor: '#64748b', progressSelectedColor: '#475569' }
            if (ot.estado === 'en_ejecucion') styles = { backgroundColor: '#f59e0b', backgroundSelectedColor: '#d97706', progressColor: '#d97706', progressSelectedColor: '#b45309' }
            if (ot.estado === 'cerrada') styles = { backgroundColor: '#10b981', backgroundSelectedColor: '#059669', progressColor: '#059669', progressSelectedColor: '#047857' }

            // progress calc
            let progress = 0
            if (ot.estado === 'cerrada') progress = 100
            else if (ot.estado === 'en_ejecucion') {
                const tareasCount = ot.tareas?.length || 0
                const tareasCompletadas = ot.tareas?.filter((t: any) => t.completada).length || 0
                progress = tareasCount > 0 ? Math.round((tareasCompletadas / tareasCount) * 100) : 10
            }

            return {
                id: ot.id,
                name: `OT-${ot.numero} | ${ot.descripcion}`,
                start: startDate,
                end: endDate,
                type: 'task',
                progress: progress,
                isDisabled: isDisabled,
                styles: styles,
            }
        })

        setTasks(mappedTasks)
        setLoading(false)
    }, [initialOts])

    const handleTaskChange = async (task: Task) => {
        setUpdating(true)
        setError(null)

        // Optimistic UI Update
        setTasks(tasks.map(t => (t.id === task.id ? task : t)))

        const fmtStartDate = task.start.toISOString().split('T')[0]
        const fmtEndDate = task.end.toISOString().split('T')[0]

        const result = await updateOTDates({
            id: task.id,
            fecha_inicio: fmtStartDate,
            fecha_fin: fmtEndDate
        })

        if (!result.success) {
            setError(result.error)
            // Revert optimism conceptually by refetching or just warning user
            console.error(result.error)
        }

        setUpdating(false)
    }

    // Hide loading state
    if (loading) {
        return (
            <Card className="h-[500px] w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </Card>
        )
    }

    if (tasks.length === 0) {
        return (
            <Card className="h-[400px] w-full flex flex-col items-center justify-center p-10 text-center border-dashed">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                    <CalendarRange className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Sin Órdenes Programadas</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">Cree órdenes de trabajo para que aparezcan en la línea de tiempo del proyecto.</p>
            </Card>
        )
    }

    return (
        <Card className={cn(
            "transition-all duration-500 overflow-hidden",
            expanded ? "fixed inset-0 z-50 m-0 rounded-none h-screen bg-background border-0" : "w-full"
        )}>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            Calendario Maestro
                            {updating && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Arrastre las barras para recalendarizar. Las OT cerradas no pueden modificarse.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                        <Tabs value={viewMode as unknown as string} onValueChange={(v) => setViewMode(v as unknown as ViewMode)}>
                            <TabsList className="inline-flex w-max items-center justify-start rounded-xl bg-muted p-1.5 text-muted-foreground gap-1">
                                <TabsTrigger 
                                    value={ViewMode.Day as unknown as string} 
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    Día
                                </TabsTrigger>
                                <TabsTrigger 
                                    value={ViewMode.Week as unknown as string} 
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    Semana
                                </TabsTrigger>
                                <TabsTrigger 
                                    value={ViewMode.Month as unknown as string} 
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    Mes
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setExpanded(!expanded)}
                            className="shrink-0"
                        >
                            {expanded ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={cn(
                    "rounded-xl overflow-hidden border",
                    expanded ? "h-[calc(100vh-140px)]" : "h-[600px]"
                )}>
                    <Gantt
                        tasks={tasks}
                        viewMode={viewMode}
                        onDateChange={handleTaskChange}
                        onProgressChange={handleTaskChange}
                        listCellWidth={expanded ? '155px' : '0px'} // Hide task list sidebar on standard view to maximize timeline space
                        columnWidth={60}
                        barBackgroundColor="#3b82f6"
                        barBackgroundSelectedColor="#2563eb"
                        barProgressColor="#1d4ed8"
                        barProgressSelectedColor="#1e3a8a"
                        barCornerRadius={8}
                        fontFamily="inherit"
                        fontSize="12px"
                        rowHeight={50}
                        ganttHeight={expanded ? window.innerHeight - 140 : 600}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
