'use client'

import { useState } from 'react'
import {
    BarChart3, TrendingUp, TrendingDown, AlertTriangle,
    Calendar, Download, Filter, Sparkles,
    Activity, Wallet, Package, Zap, Info,
    LayoutGrid, Target, Rocket, ChevronRight, ShieldAlert, CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
    const globalEfficiency = totalEstimado > 0 ? ((totalReal - totalEstimado) / totalEstimado) * 100 : 0

    const totalInversion = monthlyInvestment.reduce((sum, m) => sum + m.inversion, 0)
    const totalPresupuesto = monthlyInvestment.reduce((sum, m) => sum + m.presupuesto, 0)
    const budgetHealth = totalPresupuesto > 0 ? (totalInversion / totalPresupuesto) * 100 : 0

    // Advanced Metrics (EAC, CPI, SPI)
    const cpi = 0.94 // Cost Performance Index (Mocked)
    const spi = 1.02 // Schedule Performance Index (Mocked)
    const eac = cpi > 0 ? totalPresupuesto / cpi : 0 // Estimate at Completion

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
                <div className="bg-card p-3 rounded-md border shadow-sm">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-sm font-medium text-foreground">{entry.name}: </span>
                            <span className="text-sm font-bold text-primary">
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
        <div className="flex-1 space-y-8 h-full">
            {/* Ultra Premium Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border-transparent">
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            Inteligencia de Obra
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">FEBRERO DE 2026</span>
                        </Badge>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Analítica Global</h2>
                        <p className="text-muted-foreground mt-1 text-lg max-w-xl">
                            Análisis avanzado de rendimiento, predicciones presupuestarias y salud operativa para todos los proyectos activos.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-muted rounded-md p-1 border">
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
                                    "px-4 py-1.5 text-sm font-medium rounded-sm transition-all",
                                    selectedPeriod === p.value
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </Button>
                    <Button
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                    >
                        {isExporting ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        {isExporting ? 'Exportando...' : 'Exportar PDF'}
                    </Button>
                </div>
            </div>

            {/* Advanced Performance Stats - Row of 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase tracking-wider">CPI (COSTO)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">{cpi.toFixed(2)}</span>
                            <span className={cn("text-xs font-semibold", cpi >= 1 ? "text-emerald-500" : "text-amber-500")}>
                                {cpi >= 1 ? '↑ Óptimo' : '↓ Riesgo'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase tracking-wider">SPI (AGENDA)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">{spi.toFixed(2)}</span>
                            <span className={cn("text-xs font-semibold", spi >= 1 ? "text-emerald-500" : "text-amber-500")}>
                                {spi >= 1 ? '↑ Adelanto' : '↓ Retraso'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="uppercase tracking-wider">EAC (PROYECCIÓN FINAL)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-foreground">{formatPesos(eac)}</span>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Basado en tendencia actual</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary font-semibold uppercase tracking-wider">AHORRO PROYECTADO</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-emerald-500">{formatPesos(totalPresupuesto - totalInversion)}</span>
                            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Radar & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Radar Chart - Left 4 cols */}
                <Card className="lg:col-span-4">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Vulnerabilidades</CardTitle>
                            <CardDescription className="uppercase tracking-wider">Análisis de 5 pilares</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="hsl(var(--border))" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} />
                                <Radar
                                    name="Actual"
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.2}
                                />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Forecast & Distribution - Right 8 cols */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card className="flex-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center">
                                    <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Distribución de Costos</CardTitle>
                                    <CardDescription className="uppercase tracking-wider">Por categoría de rubro</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estructural</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Servicios</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distributionData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.8 }} width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary text-primary-foreground border-transparent relative overflow-hidden h-[120px] shrink-0">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-primary-foreground/10 blur-[50px] rounded-full pointer-events-none" />
                        <CardContent className="p-6 h-full flex items-center justify-between relative z-10 w-full">
                            <div className="space-y-2">
                                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-transparent mb-1 hover:bg-primary-foreground/30">
                                    <Rocket className="w-3 h-3 mr-1" />
                                    FORECAST ALPHA
                                </Badge>
                                <h4 className="text-xl md:text-2xl font-bold tracking-tight">Finalización media estimada: 15 May. 2026</h4>
                            </div>
                            <Button variant="secondary" size="icon" className="w-12 h-12 rounded-full shrink-0">
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* In-depth Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Material Details */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 pb-6">
                        <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Análisis de Desperdicios</CardTitle>
                            <CardDescription className="uppercase tracking-wider">Optimización por recurso</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {efficiencyData.slice(0, 5).map((item, idx) => {
                            const ratio = item.estimado > 0 ? (item.real / item.estimado) * 100 : 0
                            const isOver = item.real > item.estimado
                            return (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground">{item.material}</span>
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">REAL: {item.real} {item.unidad}</span>
                                        </div>
                                        <div>
                                            {isOver ? (
                                                <Badge variant="destructive" className="text-[10px]">
                                                    +{Math.round(ratio - 100)}% DESVÍO
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                                                    {Math.round(ratio)}% EFICIENCIA
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden flex relative">
                                        <div className="h-full bg-primary/20 transition-all duration-1000" style={{ width: '70%' }} />
                                        <div className={cn(
                                            "h-full transition-all duration-1000 absolute top-0 left-0",
                                            isOver ? "bg-destructive" : "bg-primary"
                                        )} style={{ width: `${Math.min(ratio, 100)}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                {/* Investment History */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                        <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Flujo de Fondos</CardTitle>
                            <CardDescription className="uppercase tracking-wider">Inversión Real vs Planificada</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyInvestment} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorInversion" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="presupuesto"
                                        stroke="hsl(var(--muted-foreground))"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        fill="transparent"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="inversion"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        fill="url(#colorInversion)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 flex gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground" /> PLANIFICADO
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" /> REAL
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Smart Mitigation Section */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-md flex items-center justify-center">
                        <Target className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Plan de Mitigación</CardTitle>
                        <CardDescription className="uppercase tracking-wider">Acciones recomendadas por desvío</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {topDeviations.filter(d => d.desvio > 0).map((deviation, idx) => (
                            <div
                                key={idx}
                                className="p-5 border rounded-lg bg-card hover:border-border transition-colors flex flex-col gap-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-destructive/10">
                                            <AlertTriangle className="w-4 h-4 text-destructive" />
                                        </div>
                                        <h4 className="font-semibold text-sm">{deviation.item}</h4>
                                    </div>
                                    <Badge variant="destructive">+{deviation.desvio}%</Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                                        <Sparkles className="w-3 h-3 fill-current" />
                                        Acción Correctiva (IA)
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {deviation.item.includes('Hierro')
                                            ? 'Reevaluar proveedores regionales o consolidar órdenes para reducir costos logísticos.'
                                            : 'Se sugiere auditoría de ejecución en sitio para detectar fugas de rendimiento.'}
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full mt-2" size="sm">
                                    Aplicar Seguimiento
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
