'use client'

import React, { useState, useEffect } from 'react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import "gantt-task-react/dist/index.css"
import { updateOTDates } from '@/app/actions/ordenes-trabajo'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CalendarRange, Loader2, Maximize, Minimize } from 'lucide-react'
import { cn } from '@/lib/utils'

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
            <div className="h-[500px] w-full bg-apple-gray-50 dark:bg-black/20 rounded-[48px] animate-pulse flex items-center justify-center border border-apple-gray-100 dark:border-white/5">
                <Loader2 className="w-8 h-8 text-apple-gray-400 animate-spin" />
            </div>
        )
    }

    if (tasks.length === 0) {
        return (
            <div className="h-[400px] w-full premium-card flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 bg-apple-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                    <CalendarRange className="w-8 h-8 text-apple-gray-300" />
                </div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Sin Órdenes Programadas</h3>
                <p className="text-sm font-medium text-apple-gray-400 max-w-sm mt-3">Crée órdenes de trabajo para que aparezcan en la línea de tiempo del proyecto.</p>
            </div>
        )
    }

    return (
        <div className={cn(
            "transition-all duration-500",
            expanded ? "fixed inset-0 z-50 bg-white dark:bg-[#0f111a] p-6 pt-10" : "premium-card p-6 md:p-10"
        )}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
                        Calendario Maestro
                        {updating && <Loader2 className="w-5 h-5 text-apple-blue animate-spin" />}
                    </h2>
                    <p className="text-sm font-medium text-apple-gray-400 mt-1">Arrastre las barras para recalendarizar. Las OT cerradas no pueden modificarse.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                    <div className="bg-apple-gray-50 dark:bg-black/20 p-1.5 rounded-2xl flex w-full md:w-fit overflow-x-auto">
                        <button
                            onClick={() => setViewMode(ViewMode.Day)}
                            className={cn("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", viewMode === ViewMode.Day ? "bg-white dark:bg-apple-gray-50 text-foreground shadow-sm" : "text-apple-gray-400 hover:text-foreground")}
                        >
                            Día
                        </button>
                        <button
                            onClick={() => setViewMode(ViewMode.Week)}
                            className={cn("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", viewMode === ViewMode.Week ? "bg-white dark:bg-apple-gray-50 text-foreground shadow-sm" : "text-apple-gray-400 hover:text-foreground")}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setViewMode(ViewMode.Month)}
                            className={cn("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", viewMode === ViewMode.Month ? "bg-white dark:bg-apple-gray-50 text-foreground shadow-sm" : "text-apple-gray-400 hover:text-foreground")}
                        >
                            Mes
                        </button>
                    </div>

                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-12 h-12 rounded-2xl bg-apple-gray-50 dark:bg-black/20 flex items-center justify-center hover:bg-apple-gray-100 dark:hover:bg-white/10 transition-colors shrink-0"
                    >
                        {expanded ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={cn(
                "rounded-[32px] overflow-hidden border border-apple-gray-100 dark:border-white/5",
                expanded ? "h-[calc(100vh-160px)]" : "h-[600px]"
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
                    barCornerRadius={12}
                    fontFamily="inherit"
                    fontSize="12px"
                    rowHeight={60}
                    ganttHeight={expanded ? window.innerHeight - 160 : 600}
                />
            </div>
        </div>
    )
}
