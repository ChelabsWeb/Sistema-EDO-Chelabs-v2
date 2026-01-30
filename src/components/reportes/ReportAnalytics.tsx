'use client'

import { useState } from 'react'
import {
    BarChart3, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle2, Calendar, Download, Filter, Sparkles,
    ArrowUpRight, ArrowDownRight, Activity, Wallet, Package
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Cell
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

    // Calculate aggregate metrics
    const totalEstimado = efficiencyData.reduce((sum, item) => sum + item.estimado, 0)
    const totalReal = efficiencyData.reduce((sum, item) => sum + item.real, 0)
    const globalEfficiency = ((totalReal - totalEstimado) / totalEstimado) * 100

    const totalInversion = monthlyInvestment.reduce((sum, m) => sum + m.inversion, 0)
    const totalPresupuesto = monthlyInvestment.reduce((sum, m) => sum + m.presupuesto, 0)
    const budgetHealth = ((totalInversion / totalPresupuesto) * 100)

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-apple-fade-in">
            {/* Premium Header */}
            <header className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-1.5 bg-apple-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-apple-sm">
                                Inteligencia de Obra
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-white/5 rounded-full border border-apple-gray-100 dark:border-white/10 shadow-apple-sm">
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
                        <button className="px-6 py-4 glass dark:glass-dark rounded-[24px] border border-apple-gray-100 dark:border-white/10 flex items-center gap-3 hover:border-apple-blue/30 transition-all group">
                            <Filter className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue" />
                            <span className="text-xs font-black text-apple-gray-400 uppercase tracking-widest group-hover:text-foreground">Filtros</span>
                        </button>
                        <button className="px-8 py-4 bg-apple-blue text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-95 flex items-center gap-3">
                            <Download className="w-5 h-5" />
                            Exportar PDF
                        </button>
                    </div>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-3 p-2 glass dark:glass-dark rounded-[32px] border border-apple-gray-100 dark:border-white/10 w-fit">
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
                                "px-6 py-3 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all",
                                selectedPeriod === period.value
                                    ? "bg-apple-blue text-white shadow-lg"
                                    : "text-apple-gray-400 hover:text-foreground hover:bg-apple-gray-50 dark:hover:bg-white/5"
                            )}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Hero Metrics Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Global Efficiency */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-[48px] p-10 shadow-apple-float relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-16 h-16 bg-white/20 rounded-[24px] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Eficiencia Global</p>
                            <h3 className="text-6xl font-black tracking-tighter leading-none">
                                {globalEfficiency > 0 ? '+' : ''}{globalEfficiency.toFixed(1)}%
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Budget Health */}
                <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-6 group hover:-translate-y-2 transition-all">
                    <div className="w-16 h-16 bg-apple-blue/10 rounded-[24px] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wallet className="w-8 h-8 text-apple-blue" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] mb-2">Salud Presupuestaria</p>
                        <h3 className="text-6xl font-black text-foreground tracking-tighter leading-none mb-2">
                            {budgetHealth.toFixed(0)}%
                        </h3>
                        <p className="text-xs font-bold text-apple-gray-400">{formatPesos(totalInversion)} de {formatPesos(totalPresupuesto)}</p>
                    </div>
                </div>

                {/* Critical Alerts */}
                <div className={cn(
                    "rounded-[48px] p-10 shadow-apple-float space-y-6 group hover:-translate-y-2 transition-all",
                    topDeviations.filter(d => d.desvio > 10).length > 0
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                        : "bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5"
                )}>
                    <div className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center border group-hover:scale-110 transition-transform",
                        topDeviations.filter(d => d.desvio > 10).length > 0
                            ? "bg-white/20 border-white/20"
                            : "bg-red-500/10 border-red-500/20"
                    )}>
                        <AlertTriangle className={cn(
                            "w-8 h-8",
                            topDeviations.filter(d => d.desvio > 10).length > 0 ? "text-white" : "text-red-500"
                        )} />
                    </div>
                    <div>
                        <p className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] mb-2",
                            topDeviations.filter(d => d.desvio > 10).length > 0 ? "opacity-60" : "text-apple-gray-400"
                        )}>Desvíos Críticos</p>
                        <h3 className={cn(
                            "text-6xl font-black tracking-tighter leading-none",
                            topDeviations.filter(d => d.desvio > 10).length > 0 ? "" : "text-foreground"
                        )}>
                            {topDeviations.filter(d => d.desvio > 10).length}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Material Efficiency Chart */}
                <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 md:p-12 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Package className="w-5 h-5 text-apple-blue" />
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
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        padding: '16px'
                                    }}
                                />
                                <Bar dataKey="estimado" fill="#f1f5f9" radius={[0, 12, 12, 0]} barSize={16} />
                                <Bar dataKey="real" fill="#0071e3" radius={[0, 12, 12, 0]} barSize={16} />
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
                    </div>
                </div>

                {/* Monthly Investment Trend */}
                <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 md:p-12 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-apple-blue" />
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Inversión Mensual</h3>
                        </div>
                        <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Tendencia de Gastos vs. Presupuesto</p>
                    </div>

                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyInvestment}>
                                <defs>
                                    <linearGradient id="colorInversion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0071e3" stopOpacity={0.15} />
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
                                <Tooltip
                                    cursor={{ stroke: '#0071e3', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        padding: '16px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="presupuesto"
                                    stroke="#cbd5e1"
                                    strokeWidth={3}
                                    strokeDasharray="8 8"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="inversion"
                                    stroke="#0071e3"
                                    strokeWidth={5}
                                    dot={{ fill: '#0071e3', r: 6 }}
                                    activeDot={{ r: 8 }}
                                    fill="url(#colorInversion)"
                                />
                            </LineChart>
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

            {/* Top Deviations List */}
            <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 md:p-12 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-apple-blue" />
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Desvíos Principales</h3>
                        </div>
                        <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Items con mayor variación presupuestaria</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {topDeviations.map((deviation, idx) => (
                        <div
                            key={idx}
                            className="group p-8 bg-apple-gray-50/50 dark:bg-white/[0.02] border border-apple-gray-100 dark:border-white/5 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-apple-lg hover:-translate-y-1 transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-14 h-14 rounded-[20px] flex items-center justify-center transition-transform group-hover:scale-110",
                                    deviation.desvio > 10
                                        ? "bg-red-500/10 text-red-500"
                                        : deviation.desvio > 0
                                            ? "bg-amber-500/10 text-amber-500"
                                            : "bg-emerald-500/10 text-emerald-500"
                                )}>
                                    {deviation.trend === 'up' ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownRight className="w-7 h-7" />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-foreground tracking-tight">{deviation.item}</h4>
                                    <p className="text-xs font-bold text-apple-gray-400">Costo Real: {formatPesos(deviation.costo)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Desvío</p>
                                    <p className={cn(
                                        "text-3xl font-black tracking-tighter",
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

            {/* Insights Footer */}
            <div className="p-10 glass dark:glass-dark rounded-[48px] border border-apple-gray-100 dark:border-white/10 flex items-center gap-8">
                <div className="w-16 h-16 bg-apple-blue/10 rounded-[24px] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-apple-blue" />
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-black text-foreground tracking-tight mb-1">Insight Automático</h4>
                    <p className="text-sm font-medium text-apple-gray-400 leading-relaxed">
                        El consumo de materiales está {globalEfficiency > 0 ? 'por encima' : 'por debajo'} del estimado en un {Math.abs(globalEfficiency).toFixed(1)}%.
                        {globalEfficiency > 5 && ' Se recomienda revisar los procesos de compra y almacenamiento.'}
                    </p>
                </div>
            </div>
        </div>
    )
}
