'use client'

import { useState } from 'react'
import {
    TrendingUp, AlertTriangle, Target, Zap,
    ArrowUpRight, ArrowDownRight, Activity,
    PieChart, Wallet, Calendar, ShieldAlert,
    BarChart3, LineChart, Radar, Layers, Boxes,
    ChevronRight, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react'
import {
    ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, Cell, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Radar as RechartsRadar
} from 'recharts'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'
import type { RubroDeviationSummary } from '@/app/actions/costos'

interface Props {
    id: string
    obra: any
    deviations: RubroDeviationSummary[]
}

const vulnerabilityData = [
    { subject: 'Calidad', A: 120, fullMark: 150 },
    { subject: 'Costo', A: 98, fullMark: 150 },
    { subject: 'Tiempo', A: 86, fullMark: 150 },
    { subject: 'Seguridad', A: 99, fullMark: 150 },
    { subject: 'Material', A: 85, fullMark: 150 },
]

const distributionData = [
    { name: 'Cimientos', value: 45, category: 'ESTRUCTURAL' },
    { name: 'Estructura', value: 32, category: 'ESTRUCTURAL' },
    { name: 'Albañilería', value: 12, category: 'ESTRUCTURAL' },
    { name: 'Instalaciones', value: 8, category: 'SERVICIOS' },
    { name: 'Terminaciones', value: 3, category: 'SERVICIOS' },
]

const fundFlowData = [
    { name: 'Ene', real: 4000, planificado: 4400 },
    { name: 'Feb', real: 3000, planificado: 3200 },
    { name: 'Mar', real: 2000, planificado: 2400 },
    { name: 'Abr', real: 2780, planificado: 2900 },
    { name: 'May', real: 1890, planificado: 2000 },
    { name: 'Jun', real: 2390, planificado: 2500 },
]

const wastageData = [
    { name: 'Cemento Portland', value: 85, trend: '+12.4% vs REF' },
    { name: 'Arena Fina', value: 45, trend: 'BAJO REFERENCIA' },
    { name: 'Hierro 8mm', value: 72, trend: '+4.2% vs REF' },
    { name: 'Ladrillo Campo', value: 92, trend: '+1.5% vs REF' },
    { name: 'Piedra Partida', value: 65, trend: '+0.8% vs REF' },
]

export function AnaliticaClient({ id, obra, deviations }: Props) {
    const [period, setPeriod] = useState<'7D' | '30D' | '1A' | 'TODO'>('30D')

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 antialiased animate-apple-fade-in pb-32 px-8 pt-10">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-apple-blue/10 border border-apple-blue/20 flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-apple-blue animate-pulse" />
                            <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest leading-none">Actualizado ahora</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-apple-gray-50 dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-apple-gray-400" />
                            <span className="text-[10px] font-black text-apple-gray-500 uppercase tracking-widest leading-none">Febrero 2025</span>
                        </div>
                    </div>
                    <h1 className="text-6xl font-black text-foreground tracking-tighter leading-none font-display">
                        Analítica<span className="text-apple-blue">.</span>
                    </h1>
                    <p className="text-lg font-medium text-apple-gray-500 max-w-xl">
                        Análisis avanzado de rendimiento, predicciones presupuestarias y salud operativa del proyecto.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-6">
                    <div className="flex bg-apple-gray-100 dark:bg-white/5 rounded-full p-1 border border-apple-gray-100 dark:border-white/10">
                        {['7D', '30D', '1A', 'TODO'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                    period === p
                                        ? "bg-white dark:bg-apple-gray-50 text-apple-blue shadow-apple-sm"
                                        : "text-apple-gray-400 hover:text-foreground"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="px-8 py-4 bg-apple-blue text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-lg active:scale-95 flex items-center gap-3 group">
                        <Zap className="w-4 h-4" />
                        Exportar Reporte
                    </button>
                </div>
            </header>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <KPICard
                    label="Costo por UR"
                    value="0.94"
                    unit="± Riesgo"
                    trend="down"
                    icon={Wallet}
                    color="apple-blue"
                />
                <KPICard
                    label="Eficiencia UR"
                    value="1.02"
                    unit="↑ Avance"
                    trend="up"
                    icon={Target}
                    color="emerald"
                />
                <KPICard
                    label="Presupuesto Final"
                    value="$3.563.830"
                    unit="Basado en tendencia actual"
                    icon={PieChart}
                    color="indigo"
                />
                <KPICard
                    label="Margen Proyectado"
                    value="$70.000"
                    unit="+12%"
                    trend="up"
                    icon={TrendingUp}
                    color="emerald"
                />
            </div>

            {/* Main Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Row 1 */}
                <section className="premium-card p-10 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground font-display uppercase tracking-tight">Vulnerabilidades</h3>
                            <p className="text-[10px] font-black text-apple-gray-500 uppercase tracking-widest">Análisis de 5 pilares</p>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={vulnerabilityData}>
                                <PolarGrid stroke="rgba(0,0,0,0.05)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#8e8e93' }} />
                                <RechartsRadar
                                    name="Obra"
                                    dataKey="A"
                                    stroke="#007aff"
                                    fill="#007aff"
                                    fillOpacity={0.15}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="premium-card p-10 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground font-display uppercase tracking-tight">Distribución de Costos</h3>
                            <p className="text-[10px] font-black text-apple-gray-500 uppercase tracking-widest">Por categoría de rubro</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-apple-blue" />
                                <span className="text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Estructural</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Servicios</span>
                            </div>
                        </div>
                        {distributionData.map((item) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-apple-gray-400">{item.name}</span>
                                    <span className="text-foreground">{item.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            item.category === 'ESTRUCTURAL' ? "bg-apple-blue" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-8 lg:col-span-1">
                    <HealthCard
                        label="Salud Mat."
                        value="+4.1%"
                        progress={85}
                        color="emerald"
                        icon={Boxes}
                        compact
                    />
                    <HealthCard
                        label="Puntos Crít."
                        value="1"
                        progress={30}
                        color="orange"
                        icon={AlertTriangle}
                        compact
                    />
                </div>

                {/* Row 2 */}
                <section className="lg:col-span-2 bg-slate-900 dark:bg-white/5 rounded-[40px] p-12 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-apple-blue/20 to-transparent" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                                    <span className="text-[9px] font-black uppercase tracking-widest">Forecast Alpha</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-4xl font-black font-display tracking-tight leading-none mb-4">
                                    Finalización estimada: <span className="text-apple-blue">15 May. 2026</span>
                                </h3>
                                <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
                                    La tendencia actual indica un adelanto cada 4 días respecto al cronograma original, con una eficiencia presupuestaria del 104%.
                                </p>
                            </div>
                        </div>
                        <button className="size-16 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-2xl">
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </div>
                </section>

                <HealthCard
                    label="Utilización Presupuesto"
                    value="97.9%"
                    progress={97.9}
                    color="apple-blue"
                    icon={Wallet}
                />

                {/* Row 3 - Wastage full width as requested */}
                <section className="premium-card p-12 space-y-12 lg:col-span-3">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                            <Activity className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground font-display uppercase tracking-tight">Análisis de Desperdicios</h3>
                            <p className="text-[10px] font-black text-apple-gray-500 uppercase tracking-widest">Optimización por recurso</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {wastageData.map((item) => (
                            <div key={item.name} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="text-[13px] font-black text-foreground uppercase tracking-tight">{item.name}</h4>
                                        <p className="text-[9px] font-black text-apple-gray-500 uppercase tracking-[0.2em] mt-1">{item.trend}</p>
                                    </div>
                                    <div className={cn(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        item.value > 80 ? "text-orange-500" : "text-emerald-500"
                                    )}>
                                        {item.value > 80 ? 'ALTO DESPERDICIO' : 'BAJO DESPERDICIO'}
                                    </div>
                                </div>
                                <div className="h-3 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 shadow-sm",
                                            item.value > 80 ? "bg-orange-500" : "bg-apple-blue"
                                        )}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="premium-card p-12 space-y-12 lg:col-span-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <LineChart className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-foreground font-display uppercase tracking-tight">Flujo de Fondos</h3>
                                <p className="text-[10px] font-black text-apple-gray-500 uppercase tracking-widest">Inversión Real vs Planificada</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-apple-blue" />
                                <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Inversión Real</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full border-2 border-apple-gray-300" />
                                <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Meta</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={fundFlowData}>
                                <defs>
                                    <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#007aff" stopOpacity={0.1} />
                                        <stop offset="100%" stopColor="#007aff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#8e8e93' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '20px',
                                        border: 'none',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        padding: '16px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="real"
                                    stroke="#007aff"
                                    strokeWidth={4}
                                    fill="url(#realGradient)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="planificado"
                                    stroke="#8e8e93"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="transparent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Mitigation Plan integrated into same grid */}
                <section className="premium-card p-12 space-y-12 lg:col-span-3">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <ShieldAlert className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground font-display uppercase tracking-tight">Plan de Mitigación</h3>
                            <p className="text-[10px] font-black text-apple-gray-500 uppercase tracking-widest">Acciones preventivas de alto impacto</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MitigationCard
                            title="Mano de Obra - Cimientos"
                            impact="+15.4%"
                            severity="critical"
                            desc="Se sugiere auditoría de densidad de personal para detectar fugas de rendimiento."
                            action="Aplicar Seguimiento"
                        />
                        <MitigationCard
                            title="Hierro de Armadura"
                            impact="+8.2%"
                            severity="warning"
                            desc="Revisar técnica de corte y habilitar consolidado de órdenes para reducir cortes logísticos."
                            action="Aplicar Documento"
                        />
                    </div>
                </section>
            </div>

            <footer className="text-center py-20 opacity-20">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">Fin del Reporte Operativo • Sistema EDO V2 Premium</p>
            </footer>
        </div>
    )
}

function KPICard({ label, value, unit, trend, icon: Icon, color }: any) {
    return (
        <div className="premium-card p-10 group hover:scale-[1.02] transition-all duration-500">
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest leading-none">
                        {label}
                    </p>
                    <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
                        color === 'apple-blue' ? "bg-apple-blue/10 text-apple-blue" :
                            color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
                                "bg-indigo-500/10 text-indigo-500"
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-4xl font-black text-foreground tracking-tighter leading-none font-display uppercase">
                        {value}
                    </h3>
                    <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold text-apple-gray-400 uppercase tracking-tight">{unit}</p>
                        {trend && (
                            <div className={cn(
                                "flex items-center",
                                trend === 'up' ? "text-emerald-500" : "text-apple-blue"
                            )}>
                                {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function HealthCard({ label, value, progress, color, icon: Icon, action, compact }: any) {
    return (
        <div className={cn(
            "rounded-[40px] border transition-all duration-500 group relative overflow-hidden flex flex-col justify-center",
            compact ? "p-6" : "p-10",
            color === 'emerald' ? "bg-emerald-500 text-white border-emerald-400/20" :
                color === 'apple-blue' ? "bg-white dark:bg-white/5 text-foreground border-apple-gray-100 dark:border-white/10" :
                    "bg-orange-500 text-white border-orange-400/20"
        )}>
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "rounded-xl flex items-center justify-center shadow-inner shrink-0",
                        compact ? "size-8" : "size-10",
                        color === 'apple-blue' ? "bg-apple-blue/10 text-apple-blue" : "bg-white/20 text-white"
                    )}>
                        <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />
                    </div>
                    <span className={cn(
                        "font-black uppercase tracking-widest opacity-70 leading-none",
                        compact ? "text-[8px]" : "text-[10px]",
                        color === 'apple-blue' ? "text-apple-gray-500" : "text-white"
                    )}>
                        {label}
                    </span>
                </div>

                <div className="space-y-4">
                    <h3 className={cn(
                        "font-black font-display tracking-tighter leading-none shrink-0",
                        compact ? "text-3xl" : "text-6xl"
                    )}>{value}</h3>
                    <div className={cn(
                        "h-1 w-full rounded-full overflow-hidden",
                        color === 'apple-blue' ? "bg-apple-gray-100" : "bg-white/20"
                    )}>
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                color === 'apple-blue' ? "bg-red-500" : "bg-white"
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {action && !compact && (
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all">
                            {action} <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function MitigationCard({ title, impact, severity, desc, action }: any) {
    return (
        <div className="bg-apple-gray-50/50 dark:bg-white/[0.02] border border-apple-gray-100 dark:border-white/5 rounded-[32px] p-8 space-y-6 group hover:border-apple-blue/20 transition-all">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg",
                        severity === 'critical' ? "bg-orange-500/10 text-orange-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-black text-foreground font-display uppercase tracking-tight">{title}</h4>
                </div>
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    severity === 'critical' ? "text-orange-500" : "text-amber-500"
                )}>{impact}</span>
            </div>
            <p className="text-sm text-apple-gray-500 font-medium leading-relaxed">{desc}</p>
            <button className="w-full py-4 bg-slate-900 dark:bg-apple-gray-50 dark:text-apple-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-[0.98]">
                {action}
            </button>
        </div>
    )
}
