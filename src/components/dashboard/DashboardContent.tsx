'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2, Plus, ClipboardList, ShoppingCart,
  TrendingUp, Clock, Activity, Calendar, User, Zap, Bell, AlertCircle, LayoutDashboard, Users, LogOut
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardContentProps {
  userName: string
  obrasCount: number
  otEnEjecucion: number
  otPendientes: number
  otCerradas: number
  otsConDesvio: number
  otsConDesvioCritico: number
  executionData: any[]
  budgetData: any[]
  activityFeed: any[]
  obras: any[]
  ordenesTrabajo: any[]
  otsConDesvioCriticoData: any[]
}

export function DashboardContent({
  userName,
  obrasCount,
  otEnEjecucion,
  otPendientes,
  otsConDesvioCritico,
  executionData,
  activityFeed,
}: DashboardContentProps) {
  const avgExecution = executionData.length > 0
    ? Math.round(executionData.reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0) / executionData.length)
    : 0

  const [chartPeriod, setPeriod] = useState<'semana' | 'mes'>('semana')

  return (
    <div className="flex-1 flex flex-col space-y-8 h-full">
      {/* Dashboard Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between py-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
          <p className="text-muted-foreground mt-1">
            Hola, {userName}. El ecosistema operativo se mantiene estable.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background"></span>
          </Button>
          <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
            <div className="flex flex-col mr-2 text-right hidden sm:block">
              <span className="text-sm font-semibold">{userName}</span>
              <span className="text-xs text-muted-foreground">Control de Gestión</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
              {userName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ejecución Global</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgExecution}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-emerald-500" />
              Optimización en curso
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{obrasCount}</div>
            <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-primary transition-colors">
              <Link href="/obras">Ver portafolio</Link>
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operativa en Cola</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{otPendientes + otEnEjecucion}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              {otsConDesvioCritico} Críticas
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desvío Presupuestal</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -{otsConDesvioCritico > 0 ? (otsConDesvioCritico * 1.5).toFixed(1) : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-destructive transition-colors">
              <Link href="/reportes">Plan de mitigación recomendado</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Card */}
        <Card className="col-span-4 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Avance Dinámico</CardTitle>
              <CardDescription>
                Rendimiento volumétrico basado en {chartPeriod === 'semana' ? '7' : '30'} días
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={chartPeriod === 'semana' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('semana')}
              >
                Semana
              </Button>
              <Button
                variant={chartPeriod === 'mes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('mes')}
              >
                Mes
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={executionData}>
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#areaFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed Card */}
        <Card className="col-span-3 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Pulsaciones</CardTitle>
              <CardDescription>Actividad reciente del ecosistema</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/reportes">Histórico</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar-hide max-h-[300px]">
              {activityFeed.map((item, idx) => (
                <div key={item.id} className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                    item.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20' :
                      item.status === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20' :
                        'bg-primary/10 text-primary border-primary/20'
                  )}>
                    {item.type === 'ot' ? <ClipboardList className="w-4 h-4" /> :
                      item.type === 'compra' ? <ShoppingCart className="w-4 h-4" /> :
                        <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                    <p className="text-xs text-muted-foreground pt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/obras">
          <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[120px]">
              <Building2 className="w-6 h-6 mb-2 text-muted-foreground" />
              <span className="font-semibold text-sm">Gestión Obras</span>
              <span className="text-xs text-muted-foreground mt-1">Portafolio Activo</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/obras/nueva">
          <Card className="bg-primary hover:bg-primary/90 transition-colors cursor-pointer text-primary-foreground border-transparent">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[120px]">
              <Plus className="w-6 h-6 mb-2" />
              <span className="font-semibold text-sm">Nueva Obra</span>
              <span className="text-xs text-primary-foreground/70 mt-1">Apertura Proyecto</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/compras/ordenes-compra">
          <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[120px]">
              <ShoppingCart className="w-6 h-6 mb-2 text-muted-foreground" />
              <span className="font-semibold text-sm">Suministros</span>
              <span className="text-xs text-muted-foreground mt-1">Órdenes & Stock</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/usuarios">
          <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[120px]">
              <Users className="w-6 h-6 mb-2 text-muted-foreground" />
              <span className="font-semibold text-sm">Equipo</span>
              <span className="text-xs text-muted-foreground mt-1">Talento & Roles</span>
            </CardContent>
          </Card>
        </Link>
      </div>

    </div>
  )
}
