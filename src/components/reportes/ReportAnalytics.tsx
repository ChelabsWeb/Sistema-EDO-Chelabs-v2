'use client'

import { useState, useMemo } from 'react'
import {
    BarChart3, TrendingUp, TrendingDown, AlertTriangle,
    Calendar, Download, Filter, Sparkles,
    ArrowUpRight, ArrowDownRight, Activity, Wallet, Package,
    Zap, Info, List, PieChart as PieChartIcon, LayoutGrid, Target,
    Clock, Rocket, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Cell, Area, AreaChart,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Treemap
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

interface RadarItem {
    subject: string
    A: number
    B: number
    fullMark: number
}

interface DistributionItem {
    name: string
    value: number
    color: string
}

interface ReportAnalyticsProps {
    efficiencyData: EfficiencyItem[]
    monthlyInvestment: MonthlyInvestment[]
    topDeviations: DeviationItem[]
    radarData: RadarItem[]
    distributionData: DistributionItem[]
}

export function ReportAnalytics({
    efficiencyData,
    monthlyInvestment,
    topDeviations,
    radarData,
    distributionData
}: ReportAnalyticsProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('6m')
    const [isExporting, setIsExporting] = useState(false)

    // Calculate aggregate metrics
    const totalEstimado = efficiencyData.reduce((sum, item) => sum + item.estimado, 0)
    const totalReal = efficiencyData.reduce((sum, item) => sum + item.real, 0)
    const globalEfficiency = ((totalReal - totalEstimado) / totalEstimado) * 100

    const totalInversion = monthlyInvestment.reduce((sum, m) => sum + m.inversion, 0)
    const totalPresupuesto = monthlyInvestment.reduce((sum, m) => sum + m.presupuesto, 0)
    const budgetHealth = (totalInversion / totalPresupuesto) * 100

    // Advanced Metrics (EAC, CPI, SPI)
    const cpi = 0.94 // Cost Performance Index (Mocked)
    const spi = 1.02 // Schedule Performance Index (Mocked)
    const eac = totalPresupuesto / cpi // Estimate at Completion

    const criticalDeviations = topDeviations.filter(d => d.desvio > 10).length

    // Mock export
    const handleExport = async (format: 'pdf' | 'excel') => {
        setIsExporting(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsExporting(false)
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-apple-float">
                    <p className="text-[10px] font-black text-apple-gray-400 dark:text-apple-gray-300 uppercase tracking-widest mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs font-bold text-foreground">{entry.name}: </span>
                            <span className="text-xs font-black text-apple-blue">
                                {typeof entry.value === 'number' && entry.value > 1000 ? formatPesos(entry.value) : entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="max-w-[1500px] mx-auto space-y-16 py-12 px-6 md:px-10">
            {/* Ultra Premium Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/20 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-apple-blue fill-apple-blue" />
                            <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Inteligencia de Obra</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/5 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-apple-gray-400" />
                            <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">
                                FEBRERO DE 2026
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[0.9]">
                            Analítica<span className="text-apple-blue">.</span>
                        </h1>
                        <p className="text-lg text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed text-balance">
                            Análisis avanzado de rendimiento, predicciones presupuestarias y salud operativa del proyecto.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-white dark:bg-white/5 p-1 rounded-full border border-apple-gray-200 dark:border-white/5 shadow-sm">
                        {[
                            { label: '3M', value: '3m' },
                            { label: '6M', value: '6m' },
                            { label: '1A', value: '1y' },
                            { label: 'TODO', value: 'all' }
                        ].map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setSelectedPeriod(p.value)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                    selectedPeriod === p.value
                                        ? "bg-apple-blue text-white shadow-md scale-105"
                                        : "text-apple-gray-400 hover:text-foreground"
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full glass border border-apple-gray-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-all">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-8 py-3 rounded-full bg-apple-blue text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-apple-blue/25 hover:bg-apple-blue-dark active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isExporting ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isExporting ? 'Exportando...' : 'Exportar'}
                    </button>
                </div>
            </header>

            {/* Advanced Performance Stats - Row of 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-8 rounded-[2rem] border-apple-gray-100 dark:border-white/5 hover:-translate-y-1 transition-all">
                    <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] mb-4">CPI (Costo)</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black font-display text-foreground">{cpi.toFixed(2)}</span>
                        <span className={cn("text-xs font-bold", cpi >= 1 ? "text-emerald-500" : "text-amber-500")}>
                            {cpi >= 1 ? '↑ Óptimo' : '↓ Riesgo'}
                        </span>
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border-apple-gray-100 dark:border-white/5 hover:-translate-y-1 transition-all">
                    <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] mb-4">SPI (Agenda)</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black font-display text-foreground">{spi.toFixed(2)}</span>
                        <span className={cn("text-xs font-bold", spi >= 1 ? "text-emerald-500" : "text-amber-500")}>
                            {spi >= 1 ? '↑ Adelanto' : '↓ Retraso'}
                        </span>
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border-apple-gray-100 dark:border-white/5 hover:-translate-y-1 transition-all">
                    <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] mb-4">EAC (Proyección Final)</p>
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-black font-display text-foreground">{formatPesos(eac)}</span>
                        <span className="text-[9px] font-bold text-apple-gray-300 uppercase tracking-widest">Basado en tendencia actual</span>
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border-apple-gray-100 dark:border-white/5 bg-gradient-to-br from-apple-blue/5 to-transparent hover:-translate-y-1 transition-all">
                    <p className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em] mb-4">Ahorro Proyectado</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-display text-emerald-500">{formatPesos(totalPresupuesto - totalInversion)}</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <TrendingDown className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Radar & Distribution Treemap */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Radar Chart - Left 5 cols */}
                <div className="lg:col-span-5 glass p-10 rounded-[3rem] border-apple-gray-100 dark:border-white/5 shadow-apple-float flex flex-col items-center">
                    <div className="w-full flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-apple-blue" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight font-display">Vulnerabilidades</h3>
                            <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">ANÁLISIS DE 5 PILARES</p>
                        </div>
                    </div>

                    <div className="w-full h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                <Radar
                                    name="Actual"
                                    dataKey="A"
                                    stroke="#0071e3"
                                    strokeWidth={3}
                                    fill="#0071e3"
                                    fillOpacity={0.4}
                                />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Forecast & Distribution - Right 7 cols */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="glass p-10 rounded-[3rem] border-apple-gray-100 dark:border-white/5 shadow-apple-float">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                    <LayoutGrid className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight font-display">Distribución de Costos</h3>
                                    <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">POR CATEGORÍA DE RUBRO</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-apple-blue" />
                                    <span className="text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Estructural</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Servicios</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distributionData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-slate-900 dark:bg-apple-blue/10 p-10 rounded-[3rem] text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 w-fit border border-white/10">
                                    <Rocket className="w-3.5 h-3.5 text-apple-blue-light" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Forecast Alpha</span>
                                </div>
                                <h4 className="text-3xl font-black font-display tracking-tight">Finalización estimada: <span className="text-apple-blue-light">15 May. 2026</span></h4>
                                <p className="text-white/60 text-sm font-medium max-w-md">La tendencia actual indica un adelanto de 4 días respecto al cronograma original con una eficiencia presupuestaria del 94%.</p>
                            </div>
                            <button className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group-hover:rotate-12">
                                <ChevronRight className="w-8 h-8 font-black" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Standard Metrics Bento Grid (Enhanced) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Efficiency */}
                <div className="group relative bg-emerald-500 text-white rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-500/20 overflow-hidden hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <Activity className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Salud de Materiales</p>
                            <h3 className="text-6xl md:text-7xl font-black font-display tracking-tighter leading-none">
                                {globalEfficiency > 0 ? '+' : ''}{globalEfficiency.toFixed(1)}%
                            </h3>
                            <div className="mt-6 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-white h-full transition-all duration-1000" style={{ width: '85%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budget */}
                <div className="group relative bg-white dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-apple-gray-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-500 cursor-pointer text-card-foreground">
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                        <div className="w-14 h-14 rounded-2xl bg-apple-blue/10 dark:bg-apple-blue/20 flex items-center justify-center border border-apple-blue/10">
                            <Wallet className="w-7 h-7 text-apple-blue fill-apple-blue" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-apple-gray-400 dark:text-apple-gray-300 uppercase tracking-[0.2em] mb-2">Utilización Presupuesto</p>
                            <h3 className="text-6xl md:text-7xl font-black font-display tracking-tighter text-foreground leading-none">
                                {budgetHealth.toFixed(1)}%
                            </h3>
                            <div className="mt-6 space-y-2">
                                <div className="w-full bg-apple-gray-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-1000",
                                            budgetHealth > 90 ? "bg-red-500" : budgetHealth > 75 ? "bg-amber-500" : "bg-apple-blue"
                                        )}
                                        style={{ width: `${Math.min(budgetHealth, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] font-black text-apple-gray-300 dark:text-apple-gray-400 uppercase tracking-widest">
                                    {formatPesos(totalInversion)} devengados
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deviations */}
                <div className={cn(
                    "group relative rounded-[2.5rem] p-10 shadow-2xl transition-all duration-500 cursor-pointer hover:scale-[1.02]",
                    criticalDeviations > 0
                        ? "bg-orange-500 text-white shadow-orange-500/20"
                        : "bg-white dark:bg-white/5 border border-apple-gray-100 dark:border-white/10"
                )}>
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center",
                            criticalDeviations > 0 ? "bg-white/20 backdrop-blur-sm border border-white/20" : "bg-apple-gray-50 dark:bg-white/5 opacity-50"
                        )}>
                            <AlertTriangle className={cn("w-7 h-7", criticalDeviations > 0 ? "text-white" : "text-apple-gray-400")} />
                        </div>
                        <div>
                            <p className={cn(
                                "text-[11px] font-black uppercase tracking-[0.2em] mb-2",
                                criticalDeviations > 0 ? "opacity-70" : "text-apple-gray-400"
                            )}>Puntos Críticos</p>
                            <h3 className={cn(
                                "text-6xl md:text-7xl font-black font-display tracking-tighter leading-none",
                                criticalDeviations > 0 ? "text-white" : "text-foreground"
                            )}>
                                {criticalDeviations}
                            </h3>
                            <div className={cn(
                                "mt-6 flex items-center gap-2 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                criticalDeviations > 0 ? "bg-white/20" : "bg-apple-gray-50 dark:bg-white/5 text-apple-gray-400"
                            )}>
                                <Info className="w-3.5 h-3.5" />
                                {criticalDeviations > 0 ? 'Requiere Mitigación' : 'Métricas Estables'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* In-depth Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10 border-t border-apple-gray-100 dark:border-white/5">
                {/* Material Details */}
                <div className="group glass p-10 md:p-14 rounded-[3rem] shadow-apple-float">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-apple-blue/10 dark:bg-apple-blue/20 rounded-2xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-apple-blue" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight font-display">Análisis de Desperdicios</h3>
                            <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest mt-1">OPTIMIZACIÓN POR RECURSO</p>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {efficiencyData.slice(0, 5).map((item, idx) => {
                            const ratio = (item.real / item.estimado) * 100
                            const isOver = item.real > item.estimado
                            return (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between items-end px-1">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-foreground">{item.material}</span>
                                            <span className="text-[10px] font-bold text-apple-gray-400 uppercase tracking-widest">REAL: {item.real} {item.unidad}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isOver ? (
                                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-md">
                                                    +{Math.round(ratio - 100)}% DESVÍO
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                                    {Math.round(ratio)}% EFICIENCIA
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-4 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden flex relative group/bar">
                                        <div className="h-full bg-apple-blue/30 dark:bg-apple-blue/10 transition-all duration-1000" style={{ width: '70%' }} />
                                        <div className={cn(
                                            "h-full transition-all duration-1000",
                                            isOver ? "bg-orange-500" : "bg-apple-blue"
                                        )} style={{ width: `${Math.min(ratio, 100)}%` }} />
                                        <div className="absolute inset-0 opacity-0 group-hover/bar:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="text-[8px] font-black text-white mix-blend-difference uppercase tracking-widest">Tendencia Variable</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Investment History */}
                <div className="group glass p-10 md:p-14 rounded-[3rem] shadow-apple-float">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight font-display">Flujo de Fondos</h3>
                            <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest mt-1">INVERSIÓN REAL VS. PLANIFICADA</p>
                        </div>
                    </div>

                    <div className="h-[350px] mt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyInvestment}>
                                <defs>
                                    <linearGradient id="colorInversion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    dy={10}
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

                    <div className="mt-12 flex gap-8 text-[10px] font-black text-apple-gray-300 dark:text-apple-gray-400 justify-center border-t border-apple-gray-50 dark:border-white/5 pt-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-apple-gray-200" /> PLANIFICADO
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-apple-blue" /> REAL
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Mitigation Section */}
            <div className="bg-white dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 rounded-[3rem] p-10 md:p-14 shadow-apple-float">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight font-display">Plan de Mitigación</h3>
                        <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest mt-1">ACCIONES RECOMENDADAS POR DESVÍO</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {topDeviations.filter(d => d.desvio > 0).map((deviation, idx) => (
                        <div
                            key={idx}
                            className="group p-8 bg-apple-gray-100/30 dark:bg-white/[0.02] border border-apple-gray-100 dark:border-white/5 rounded-[2.5rem] flex flex-col gap-6 hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h4 className="text-lg font-black text-foreground tracking-tight font-display">{deviation.item}</h4>
                                </div>
                                <span className="text-xl font-black font-display text-orange-500">+{deviation.desvio}%</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-apple-blue uppercase tracking-widest">
                                    <Sparkles className="w-3 h-3 fill-current" />
                                    Acción Correctiva (IA)
                                </div>
                                <p className="text-sm font-medium text-apple-gray-400 leading-relaxed">
                                    {deviation.item.includes('Hierro') ? 'Reevaluar proveedores regionales o consolidar órdenes para reducir costos logísticos.' : 'Se sugiere auditoría de ejecución en sitio para detectar fugas de rendimiento.'}
                                </p>
                            </div>
                            <button className="flex items-center justify-center w-full py-3 rounded-2xl bg-slate-900 dark:bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                                Aplicar Seguimiento
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="py-10 text-center border-t border-apple-gray-100 dark:border-white/5">
                <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.4em]">Fin del Reporte Operativo • Sistema EDO v2 Premium</p>
            </div>
        </div>
    )
}
