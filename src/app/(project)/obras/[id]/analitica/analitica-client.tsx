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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Actualizado ahora
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Febrero 2025
                        </Badge>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Analítica</h2>
                    <p className="text-muted-foreground mt-1 max-w-xl">
                        Análisis avanzado de rendimiento, predicciones presupuestarias y salud operativa del proyecto.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-4">
                    <div className="flex bg-muted rounded-md p-1 border">
                        {['7D', '30D', '1A', 'TODO'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-sm transition-all",
                                    period === p
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <Button className="h-9 px-4">
                        <Zap className="w-4 h-4 mr-2" /> Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    label="Costo por UR"
                    value="0.94"
                    unit="± Riesgo"
                    trend="down"
                    icon={Wallet}
                />
                <KPICard
                    label="Eficiencia UR"
                    value="1.02"
                    unit="↑ Avance"
                    trend="up"
                    icon={Target}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <KPICard
                    label="Presupuesto Final"
                    value="$3.56M"
                    unit="Basado en tendencia actual"
                    icon={PieChart}
                />
                <KPICard
                    label="Margen Proyectado"
                    value="$70.000"
                    unit="+12%"
                    trend="up"
                    icon={TrendingUp}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
            </div>

            {/* Main Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Row 1 */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Vulnerabilidades</CardTitle>
                            <CardDescription className="text-xs uppercase tracking-wider">Análisis de 5 pilares</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={vulnerabilityData}>
                                <PolarGrid stroke="rgba(0,0,0,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} />
                                <RechartsRadar
                                    name="Obra"
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Distribución de Costos</CardTitle>
                            <CardDescription className="text-xs uppercase tracking-wider">Por categoría de rubro</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-primary" /> Estructural
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Servicios
                            </div>
                        </div>
                        {distributionData.map((item) => (
                            <div key={item.name} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-muted-foreground">{item.name}</span>
                                    <span>{item.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            item.category === 'ESTRUCTURAL' ? "bg-primary" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:col-span-1">
                    <HealthCard
                        label="Salud Materiales"
                        value="+4.1%"
                        progress={85}
                        color="bg-emerald-500"
                        icon={Boxes}
                        compact
                    />
                    <HealthCard
                        label="Puntos Críticos"
                        value="1"
                        progress={30}
                        color="bg-destructive"
                        icon={AlertTriangle}
                        compact
                    />
                </div>

                {/* Row 2 */}
                <Card className="lg:col-span-2 bg-primary text-primary-foreground overflow-hidden relative">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
                    <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-4">
                            <Badge variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-transparent">
                                FORECAST ALPHA
                            </Badge>
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2">
                                    Finalización estimada: 15 May. 2026
                                </h3>
                                <p className="text-primary-foreground/80 max-w-md">
                                    La tendencia actual indica un adelanto mensual constante respecto al cronograma original, con eficiencia del 104%.
                                </p>
                            </div>
                        </div>
                        <Button variant="secondary" size="icon" className="w-12 h-12 rounded-full shrink-0">
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </CardContent>
                </Card>

                <HealthCard
                    label="Utilización Presupuesto"
                    value="97.9%"
                    progress={97.9}
                    color="bg-primary"
                    icon={Wallet}
                />

                {/* Row 3 - Wastage full width */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                            <Activity className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle>Análisis de Desperdicios</CardTitle>
                            <CardDescription className="uppercase tracking-wider">Optimización por recurso</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                            {wastageData.map((item) => (
                                <div key={item.name} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="text-sm font-semibold">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.trend}</p>
                                        </div>
                                        <div className={cn(
                                            "text-xs font-bold",
                                            item.value > 80 ? "text-destructive" : "text-emerald-500"
                                        )}>
                                            {item.value > 80 ? 'ALTO' : 'BAJO'}
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                item.value > 80 ? "bg-destructive" : "bg-primary"
                                            )}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Fund Flow */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-2">
                        <div className="flex items-center gap-4">
                            <div className="p-2 w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                                <LineChart className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <CardTitle>Flujo de Fondos</CardTitle>
                                <CardDescription className="uppercase tracking-wider">Inversión Real vs Planificada</CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="w-3 h-3 rounded-full bg-primary" /> Real
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="w-3 h-3 rounded-full border-2 border-muted-foreground" /> Meta
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={fundFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="real"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        fill="url(#realGradient)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="planificado"
                                        stroke="hsl(var(--muted-foreground))"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        fill="transparent"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Mitigation Plan integration */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle>Plan de Mitigación</CardTitle>
                            <CardDescription className="uppercase tracking-wider">Acciones preventivas de alto impacto</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function KPICard({ label, value, unit, trend, icon: Icon, color = "text-foreground", bg = "bg-secondary" }: any) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                    <div className={cn("p-2 rounded-md", bg, color)}>
                        <Icon className="w-4 h-4" />
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-1">{value}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{unit}</p>
                        {trend && (
                            <div className={cn(
                                "flex items-center text-xs",
                                trend === 'up' ? "text-emerald-500" : "text-destructive"
                            )}>
                                {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function HealthCard({ label, value, progress, color, icon: Icon, action, compact }: any) {
    return (
        <Card className={cn(
            "relative overflow-hidden flex flex-col justify-center text-white border-none",
            color
        )}>
            <CardContent className={cn("relative z-10", compact ? "p-6" : "p-8")}>
                <div className="flex items-center gap-2 mb-4 opacity-80">
                    <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                </div>
                <div className="space-y-3">
                    <h3 className={cn("font-bold tracking-tight", compact ? "text-2xl" : "text-4xl")}>
                        {value}
                    </h3>
                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {action && !compact && (
                        <Button variant="secondary" size="sm" className="mt-4 text-xs font-semibold">
                            {action} <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function MitigationCard({ title, impact, severity, desc, action }: any) {
    return (
        <div className="p-5 border rounded-lg bg-card hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-md",
                        severity === 'critical' ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"
                    )}>
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-sm">{title}</h4>
                </div>
                <Badge variant={severity === 'critical' ? "destructive" : "secondary"} className={severity === 'warning' ? "bg-amber-500/10 text-amber-500" : ""}>
                    {impact}
                </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{desc}</p>
            <Button variant="outline" className="w-full" size="sm">
                {action}
            </Button>
        </div>
    )
}
