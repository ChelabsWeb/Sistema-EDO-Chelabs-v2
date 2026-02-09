'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Plus, ClipboardList, ShoppingCart, AlertTriangle,
  TrendingUp, Clock, ArrowUpRight,
  Activity, Calendar, PieChart, Wallet, ArrowRight,
  User, Zap, Bell, CheckCircle, AlertCircle, PlusCircle, Database, LayoutDashboard, Users
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { ActivityItem } from './ActivityItem'
import { cn } from '@/lib/utils'
import { PageTransition } from '@/components/animated/AnimatedComponents'
import { ThemeToggle } from '@/components/ThemeToggle'

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
  otCerradas,
  otsConDesvio,
  otsConDesvioCritico,
  executionData,
  budgetData,
  activityFeed,
  obras,
  ordenesTrabajo,
  otsConDesvioCriticoData
}: DashboardContentProps) {
  // Calculate average execution for the main metric
  const avgExecution = executionData.length > 0
    ? Math.round(executionData.reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0) / executionData.length)
    : 0

  const [chartPeriod, setPeriod] = useState<'semana' | 'mes'>('semana')

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative selection:bg-blue-500/30 bg-background transition-colors duration-500">
        {/* Background Blobs for Atmosphere */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute w-[500px] h-[500px] bg-primary/20 dark:bg-primary/10 -top-20 -left-20 rounded-full blur-[120px]" />
          <div className="absolute w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-900/10 -bottom-20 -right-20 rounded-full blur-[120px]" />
        </div>

        {/* Dashboard Header */}
        <header className="px-8 flex items-center justify-between shrink-0 pt-10 pb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight"
            >
              Hola, {userName}<span className="text-primary">.</span>
            </motion.h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Todo parece estar bajo control hoy.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-slate-200 dark:border-white/10 pr-6">
              <ThemeToggle />
              <button className="relative p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:text-primary transition-colors border border-slate-200 dark:border-white/5">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full ring-4 ring-white dark:ring-[#0f111a]"></span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none capitalize">{userName}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Control de Gestión</p>
              </div>
              <div className="size-11 rounded-full p-[2px] bg-gradient-to-tr from-primary to-purple-500 shadow-xl">
                <div className="rounded-full size-full bg-white dark:bg-[#0f111a] flex items-center justify-center text-slate-800 dark:text-white text-xs font-black">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 space-y-8 custom-scrollbar-hide">

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CARD: Ejecución */}
            <Link
              href="/reportes"
              className="glass-card p-6 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="size-10 rounded-xl bg-primary/10 dark:bg-primary-glow/10 flex items-center justify-center text-primary dark:text-primary-glow">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="size-10 relative">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-200 dark:text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                    <motion.path
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${avgExecution}, 100` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"
                    ></motion.path>
                  </svg>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Ejecución</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{avgExecution}%</h3>
              <div className="mt-4 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <TrendingUp className="w-3.5 h-3.5" />
                Ver detalles de avance
              </div>
            </Link>

            {/* CARD: Obras Activas */}
            <Link
              href="/obras"
              className="glass-card p-6 group cursor-pointer"
            >
              <div className="size-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 text-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Obras Activas</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{obrasCount}</h3>
              <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wide group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Ver listado de proyectos</p>
            </Link>

            {/* CARD: OTs Pendientes */}
            <Link
              href="/obras"
              className="glass-card p-6 group cursor-pointer"
            >
              <div className="size-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">OTs Pendientes</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{otPendientes + otEnEjecucion}</h3>
              <div className="mt-4 text-[11px] text-amber-600 dark:text-amber-500/80 font-bold flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                {otsConDesvioCritico} Críticas requieren atención
              </div>
            </Link>

            {/* CARD: Desvío Costos */}
            <Link
              href="/reportes"
              className="bg-red-50 dark:bg-red-500/5 backdrop-blur-xl border border-red-200 dark:border-red-500/20 p-6 rounded-[24px] group cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/10 transition-all shadow-lg dark:shadow-none"
            >
              <div className="size-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-500 mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-red-700 dark:text-red-300 text-xs font-black uppercase tracking-widest mb-1">Desvío Costos</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">-{otsConDesvioCritico > 0 ? (otsConDesvioCritico * 1.5).toFixed(1) : "0.0"}%</h3>
              <p className="mt-4 text-[11px] text-red-600 dark:text-red-400/80 font-bold uppercase tracking-wide group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors">Analizar desviaciones</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="glass-card p-8 lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Proyección {chartPeriod} de avance</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-medium">Basado en el rendimiento de los últimos {chartPeriod === 'semana' ? '7' : '30'} días</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => setPeriod('semana')}
                    className={cn(
                      "px-4 py-1.5 text-xs font-black transition-all rounded-lg",
                      chartPeriod === 'semana' ? "text-white bg-primary shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    )}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setPeriod('mes')}
                    className={cn(
                      "px-4 py-1.5 text-xs font-black transition-all rounded-lg",
                      chartPeriod === 'mes' ? "text-white bg-primary shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    )}
                  >
                    Mes
                  </button>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={executionData}>
                    <defs>
                      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2b4bee" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#2b4bee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--chart-grid)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background-card, #fff)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '16px',
                        padding: '12px'
                      }}
                      itemStyle={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="#2b4bee"
                      strokeWidth={4}
                      fill="url(#areaFill)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History Section */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Historial reciente</h3>
                <Link href="/reportes" className="text-primary text-xs font-black hover:underline uppercase tracking-widest transition-all hover:opacity-80">Ver todo</Link>
              </div>
              <div className="space-y-6 overflow-y-auto max-h-72 pr-2 custom-scrollbar-hide">
                {activityFeed.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={item.link || '#'}
                    className="flex gap-4 group cursor-pointer transition-all hover:translate-x-1"
                  >
                    <div className={cn(
                      "size-9 rounded-full flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5",
                      item.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        item.status === 'warning' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-glow'
                    )}>
                      {item.type === 'ot' ? <ClipboardList className="w-4 h-4" /> :
                        item.type === 'compra' ? <ShoppingCart className="w-4 h-4" /> :
                          <User className="w-4 h-4" />}
                    </div>
                    <div className={cn("pb-4 flex-1", idx !== activityFeed.length - 1 && "border-b border-slate-100 dark:border-white/5")}>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-1">{item.desc}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest mt-2">{item.time}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="pt-4">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 opacity-60">Accesos Rápidos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <QuickAccessCard
                href="/obras"
                icon={Building2}
                label="Gestión Obras"
                sub="Proyectos activos"
              />
              <Link
                href="/obras/nueva"
                className="p-6 rounded-[24px] bg-primary flex items-center gap-5 cursor-pointer hover:bg-primary-glow transition-all shadow-xl shadow-primary/20 group h-24"
              >
                <div className="size-11 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform border border-white/20">
                  <Plus className="w-6 h-6" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white leading-none mb-1">Nueva Obra</h4>
                  <p className="text-[11px] text-white/70 font-bold uppercase tracking-tight">Alta de proyecto</p>
                </div>
              </Link>
              <QuickAccessCard
                href="/compras/ordenes-compra"
                icon={ShoppingCart}
                label="Suministros"
                sub="Control material"
              />
              <QuickAccessCard
                href="/admin/usuarios"
                icon={Users}
                label="Usuarios"
                sub="Personal técnico"
              />
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  )
}

function QuickAccessCard({ href, icon: Icon, label, sub }: { href: string, icon: any, label: string, sub: string }) {
  return (
    <Link
      href={href}
      className="glass-card p-6 flex items-center gap-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all h-24 group"
    >
      <div className="size-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-primary transition-all group-hover:scale-110">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{label}</h4>
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{sub}</p>
      </div>
    </Link>
  )
}
