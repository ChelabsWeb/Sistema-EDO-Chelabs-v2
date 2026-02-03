'use client'

import { useState } from 'react'
import {
    BarChart3, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle2, Calendar, Download, Filter, Sparkles,
    ArrowUpRight, ArrowDownRight, Activity, Wallet, Package,
    FileText, Share2, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Cell, Area, AreaChart
} from 'recharts'

interface EfficiencyItem {
    material: string
    estimado: number
    real: number
    unidad: string
}

interface MonthlyInvestment {
    name: string
    inversion: number
    presupuesto: number
}

interface DeviationItem {
    item: string
    desvio: number
    costo: number
    trend: 'up' | 'down'
}

interface ReportAnalyticsProps {
    efficiencyData: EfficiencyItem[]
    monthlyInvestment: MonthlyInvestment[]
    topDeviations: DeviationItem[]
}

export function ReportAnalytics({
    efficiencyData,
    monthlyInvestment,
    topDeviations
}: ReportAnalyticsProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('6m')
    const [isExporting, setIsExporting] = useState(false)

    // Calculate aggregate metrics
    const totalEstimado = efficiencyData.reduce((sum, item) => sum + item.estimado, 0)
    const totalReal = efficiencyData.reduce((sum, item) => sum + item.real, 0)
    const globalEfficiency = ((totalReal - totalEstimado) / totalEstimado) * 100

    const totalInversion = monthlyInvestment.reduce((sum, m) => sum + m.inversion, 0)
    const totalPresupuesto = monthlyInvestment.reduce((sum, m) => sum + m.presupuesto, 0)
    const budgetHealth = ((totalInversion / totalPresupuesto) * 100)

    const criticalDeviations = topDeviations.filter(d => d.desvio > 10).length

    // Mock export functionality
    const handleExport = async (format: 'pdf' | 'excel') => {
        setIsExporting(true)
        // Simulate export delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        alert(`Exportando reporte en formato ${format.toUpperCase()}...`)
        setIsExporting(false)
    }

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass dark:glass-dark p-4 rounded-2xl border border-apple-gray-100 dark:border-white/10 shadow-apple-float">
                    <p className="text-xs font-black text-apple-gray-400 uppercase tracking-widest mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-sm font-bold text-foreground">{entry.name}: </span>
                            <span className="text-sm font-black text-apple-blue">{formatPesos(entry.value)}</span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-apple-fade-in">
            {/* Premium Header with Glassmorphism */}
            <header className="sticky top-0 z-30 -mx-6 md:-mx-14 px-6 md:px-14 py-10 backdrop-blur-xl bg-[#f5f5f7]/70 dark:bg-black/70 border-b border-apple-gray-100 dark:border-white/5 rounded-b-[48px] shadow-apple-sm transition-all duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-1.5 bg-gradient-to-r from-apple-blue to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-apple-blue/30 animate-pulse">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-3 h-3 fill-current" />
                                    Inteligencia de Obra
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 glass dark:glass-dark rounded-full border border-apple-gray-100 dark:border-white/10 shadow-apple-sm">
                                <Calendar className="w-3.5 h-3.5 text-apple-gray-300" />
                                <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">
                                    {new Date().toLocaleDateString('es-UY', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-[-0.04em] leading-[0.9]">
                            Analítica<span className="text-apple-blue">.</span>
                        </h1>
                        <p className="text-xl text-apple-gray-400 font-medium tracking-tight max-w-2xl leading-relaxed">
                            Métricas de rendimiento, eficiencia de materiales y salud presupuestaria en tiempo real.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="px-6 py-4 glass dark:glass-dark rounded-[24px] border border-apple-gray-100 dark:border-white/10 flex items-center gap-3 hover:border-apple-blue/30 hover:shadow-apple-lg transition-all group active:scale-95">
                            <Filter className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue transition-colors" />
                            <span className="text-xs font-black text-apple-gray-400 uppercase tracking-widest group-hover:text-foreground transition-colors">Filtros</span>
                        </button>
                        <div className="relative group">
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={isExporting}
                                className="px-8 py-4 bg-apple-blue text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Exportar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Period Selector with smooth transitions */}
                <div className="mt-8 flex items-center gap-3 p-2 glass dark:glass-dark rounded-[32px] border border-apple-gray-100 dark:border-white/10 w-fit">
                    {[
                        { label: '3M', value: '3m' },
                        { label: '6M', value: '6m' },
                        { label: '1A', value: '1y' },
                        { label: 'Todo', value: 'all' }
                    ].map((period) => (
                        <button
                            key={period.value}
                            onClick={() => setSelectedPeriod(period.value)}
                            className={cn(
                                "px-6 py-3 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all duration-300",
                                selectedPeriod === period.value
                                    ? "bg-apple-blue text-white shadow-lg scale-105"
                                    : "text-apple-gray-400 hover:text-foreground hover:bg-apple-gray-50 dark:hover:bg-white/5 hover:scale-102"
                            )}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Hero Metrics Bento with enhanced animations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Global Efficiency - Animated gradient */}
                <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-[48px] p-10 shadow-apple-float overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-500">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-[24px] flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Eficiencia Global</p>
                            <h3 className="text-6xl font-black tracking-tighter leading-none mb-2">
                                {globalEfficiency > 0 ? '+' : ''}{globalEfficiency.toFixed(1)}%
                            </h3>
                            <div className="flex items-center gap-2 mt-4">
                                <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(Math.abs(globalEfficiency), 100)}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold opacity-60">{Math.abs(globalEfficiency).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budget Health - Enhanced */}
                <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-6 group hover:-translate-y-2 hover:shadow-apple-lg transition-all duration-500 cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-br from-apple-blue to-indigo-600 rounded-[24px] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-apple-blue/30">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] mb-2">Salud Presupuestaria</p>
                        <h3 className="text-6xl font-black text-foreground tracking-tighter leading-none mb-2">
                            {budgetHealth.toFixed(0)}%
                        </h3>
                        <p className="text-xs font-bold text-apple-gray-400">{formatPesos(totalInversion)} de {formatPesos(totalPresupuesto)}</p>
                        <div className="mt-4 h-2 bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    budgetHealth > 90 ? "bg-red-500" : budgetHealth > 75 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(budgetHealth, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Critical Alerts - Pulsing animation when critical */}
                <div className={cn(
                    "rounded-[48px] p-10 shadow-apple-float space-y-6 group hover:-translate-y-2 transition-all duration-500 cursor-pointer",
                    criticalDeviations > 0
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white animate-pulse"
                        : "bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5"
                )}>
                    <div className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center border group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
                        criticalDeviations > 0
                            ? "bg-white/20 border-white/20 backdrop-blur-sm"
                            : "bg-red-500/10 border-red-500/20"
                    )}>
                        <AlertTriangle className={cn(
                            "w-8 h-8",
                            criticalDeviations > 0 ? "text-white" : "text-red-500"
                        )} />
                    </div>
                    <div>
                        <p className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] mb-2",
                            criticalDeviations > 0 ? "opacity-60" : "text-apple-gray-400"
                        )}>Desvíos Críticos</p>
                        <h3 className={cn(
                            "text-6xl font-black tracking-tighter leading-none",
                            criticalDeviations > 0 ? "" : "text-foreground"
                        )}>
                            {criticalDeviations}
                        </h3>
                        {criticalDeviations > 0 && (
                            <p className="text-xs font-bold opacity-80 mt-2">⚠️ Requiere atención inmediata</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Analytics Grid - Enhanced charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Material Efficiency Chart - Better styling */}
                <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 md:p-12 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-10 hover:shadow-apple-lg transition-all duration-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
                                    <Package className="w-5 h-5 text-apple-blue" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">Eficiencia de Materiales</h3>
                            </div>
                            <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Estimado vs. Real Consumido</p>
                        </div>
                    </div>

                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={efficiencyData} layout="horizontal" barGap={8}>
                                <CartesianGrid strokeDasharray="0" horizontal={true} vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis
                                    type="number"
                                    hide
                                />
                                <YAxis
                                    type="category"
                                    dataKey="material"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                    width={120}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="estimado" fill="#f1f5f9" radius={[0, 12, 12, 0]} barSize={16} />
                                <Bar dataKey="real" fill="#0071e3" radius={[0, 12, 12, 0]} barSize={16}>
                                    {efficiencyData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.real > entry.estimado ? "#f59e0b" : "#0071e3"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-center gap-8 pt-4 border-t border-apple-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-apple-gray-100" />
                            <span className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Estimado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-apple-blue" />
                            <span className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Real</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Exceso</span>
                        </div>
                    </div>
                </div>

                {/* Monthly Investment Trend - Area chart for better visual */}
                <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 md:p-12 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-10 hover:shadow-apple-lg transition-all duration-500">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-apple-blue" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Inversión Mensual</h3>
                        </div>
                        <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Tendencia de Gastos vs. Presupuesto</p>
                    </div>

                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyInvestment}>
                                <defs>
                                    <linearGradient id="colorInversion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 800, fill: '#cbd5e1' }}
                                    dy={15}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="presupuesto"
                                    stroke="#cbd5e1"
                                    strokeWidth={3}
                                    strokeDasharray="8 8"
                                    fill="transparent"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="inversion"
                                    stroke="#0071e3"
                                    strokeWidth={5}
                                    fill="url(#colorInversion)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-center gap-8 pt-4 border-t border-apple-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-apple-gray-200" />
                            <span className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Presupuesto</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-apple-blue" />
                            <span className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Inversión Real</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Deviations List - Enhanced cards */}
            <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 md:p-12 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-apple-blue" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Desvíos Principales</h3>
                        </div>
                        <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Items con mayor variación presupuestaria</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {topDeviations.map((deviation, idx) => (
                        <div
                            key={idx}
                            className="group p-8 bg-apple-gray-50/50 dark:bg-white/[0.02] border border-apple-gray-100 dark:border-white/5 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-apple-lg hover:-translate-y-1 hover:border-apple-blue/20 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                                    deviation.desvio > 10
                                        ? "bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                                        : deviation.desvio > 0
                                            ? "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white"
                                            : "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
                                )}>
                                    {deviation.trend === 'up' ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownRight className="w-7 h-7" />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors">{deviation.item}</h4>
                                    <p className="text-xs font-bold text-apple-gray-400">Costo Real: {formatPesos(deviation.costo)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Desvío</p>
                                    <p className={cn(
                                        "text-3xl font-black tracking-tighter transition-colors",
                                        deviation.desvio > 10
                                            ? "text-red-500"
                                            : deviation.desvio > 0
                                                ? "text-amber-500"
                                                : "text-emerald-500"
                                    )}>
                                        {deviation.desvio > 0 ? '+' : ''}{deviation.desvio.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insights Footer - Enhanced with gradient */}
            <div className="relative p-10 glass dark:glass-dark rounded-[48px] border border-apple-gray-100 dark:border-white/10 overflow-hidden group hover:shadow-apple-lg transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-apple-blue/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-apple-blue to-indigo-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-apple-blue/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-black text-foreground tracking-tight mb-1 flex items-center gap-2">
                            Insight Automático
                            <span className="px-2 py-0.5 bg-apple-blue/10 text-apple-blue text-[9px] font-black uppercase tracking-widest rounded-full">AI</span>
                        </h4>
                        <p className="text-sm font-medium text-apple-gray-400 leading-relaxed">
                            El consumo de materiales está {globalEfficiency > 0 ? 'por encima' : 'por debajo'} del estimado en un {Math.abs(globalEfficiency).toFixed(1)}%.
                            {globalEfficiency > 5 && ' Se recomienda revisar los procesos de compra y almacenamiento.'}
                            {criticalDeviations > 0 && ` Hay ${criticalDeviations} desvío${criticalDeviations > 1 ? 's' : ''} crítico${criticalDeviations > 1 ? 's' : ''} que requiere${criticalDeviations > 1 ? 'n' : ''} atención inmediata.`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
