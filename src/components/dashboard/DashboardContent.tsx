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
      <div className="flex-1 flex flex-col h-full overflow-hidden relative selection:bg-blue-500/30 bg-grid-pattern transition-colors duration-500">
        {/* Unified background handled in globals.css */}

        {/* Dashboard Header */}
        <header className="px-10 flex flex-col lg:flex-row lg:items-end justify-between shrink-0 pt-16 pb-12 gap-10 relative">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/20 flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-apple-blue fill-apple-blue" />
                <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Panel de Control</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-apple-gray-400" />
                <span className="text-[10px] font-black text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-widest">
                  {new Date().toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[0.9]">
                Hola, {userName.split(' ')[0]}<span className="text-apple-blue">.</span>
              </h1>
              <p className="text-lg text-apple-gray-500 dark:text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
                El ecosistema operativo se mantiene estable. Aquí tienes el pulso estratégico de tus proyectos.
              </p>
            </div>
          </div>

          <div className="absolute top-10 right-10 flex items-center gap-3">
            <div className="flex items-center gap-2 border-r border-apple-gray-200 dark:border-white/10 pr-4">
              <ThemeToggle />
              <button className="relative size-12 rounded-full bg-white dark:bg-white/5 text-apple-gray-400 hover:text-apple-blue transition-all border border-apple-gray-100 dark:border-white/10 shadow-sm hover:scale-105 flex items-center justify-center overflow-visible">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 size-3 bg-apple-blue rounded-full ring-2 ring-white dark:ring-[#0f111a] z-10 shadow-sm"></span>
              </button>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-black text-foreground leading-none font-display">{userName}</p>
                <p className="text-[9px] text-apple-blue font-black uppercase tracking-widest mt-1 opacity-70">Control de Gestión</p>
              </div>
              <div className="size-12 rounded-full p-[2.5px] bg-gradient-to-tr from-apple-blue to-indigo-600 shadow-xl group-hover:scale-105 transition-transform duration-500 flex items-center justify-center relative">
                <div className="rounded-full size-full bg-white dark:bg-[#0f111a] flex items-center justify-center overflow-hidden">
                  <span className="text-foreground font-black text-[13px] leading-none mb-[0.5px]">
                    {userName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-12 space-y-12 custom-scrollbar-hide">

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* CARD: Ejecución */}
            <Link
              href="/reportes"
              className="glass p-8 group cursor-pointer rounded-[2.5rem] border border-apple-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-full bg-apple-blue/[0.02] -skew-x-12 translate-x-10 pointer-events-none" />
              <div className="flex justify-between items-start mb-6">
                <div className="size-12 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="size-12 relative">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-apple-gray-100 dark:text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                    <motion.path
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${avgExecution}, 100` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-apple-blue"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"
                    ></motion.path>
                  </svg>
                </div>
              </div>
              <p className="text-apple-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Ejecución Global</p>
              <h3 className="text-4xl font-black font-display text-apple-blue tracking-tight uppercase tracking-widest">{avgExecution}<span className="text-apple-blue text-2xl">%</span></h3>
              <div className="mt-6 text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                <Zap className="w-3.5 h-3.5 fill-current" />
                Optimización en curso
              </div>
            </Link>

            {/* CARD: Obras Activas */}
            <Link
              href="/obras"
              className="glass p-8 group cursor-pointer rounded-[2.5rem] border border-apple-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-full bg-indigo-500/[0.02] -skew-x-12 translate-x-10 pointer-events-none" />
              <div className="size-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-6 text-xl group-hover:scale-110 transition-transform duration-500">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-apple-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Proyectos Activos</p>
              <h3 className="text-4xl font-black font-display text-foreground tracking-tight uppercase tracking-widest">{obrasCount}</h3>
              <p className="mt-6 text-[10px] text-apple-gray-400 font-black uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Ver portafolio</p>
            </Link>

            {/* CARD: OTs Pendientes */}
            <Link
              href="/obras"
              className="glass p-8 group cursor-pointer rounded-[2.5rem] border border-apple-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-full bg-amber-500/[0.02] -skew-x-12 translate-x-10 pointer-events-none" />
              <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-apple-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Operativa en Cola</p>
              <h3 className="text-4xl font-black font-display text-foreground tracking-tight uppercase tracking-widest">{otPendientes + otEnEjecucion}</h3>
              <div className="mt-6 text-[10px] text-amber-600 font-black uppercase tracking-widest flex items-center gap-2">
                <div className="size-2 rounded-full bg-amber-500 animate-pulse"></div>
                {otsConDesvioCritico} Críticas
              </div>
            </Link>

            {/* CARD: Riesgo Financiero */}
            <Link
              href="/reportes"
              className="p-8 group cursor-pointer rounded-[2.5rem] bg-red-500/[0.03] dark:bg-red-500/5 border border-red-500/10 hover:bg-red-500/[0.08] transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-full bg-red-500/[0.02] -skew-x-12 translate-x-10 pointer-events-none" />
              <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-red-600/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Desvío Presupuestal</p>
              <h3 className="text-4xl font-black font-display text-red-600 tracking-tight uppercase tracking-widest">
                -{otsConDesvioCritico > 0 ? (otsConDesvioCritico * 1.5).toFixed(1) : "0.0"}<span className="text-2xl">%</span>
              </h3>
              <p className="mt-6 text-[10px] text-red-600/80 font-black uppercase tracking-widest group-hover:text-red-700 transition-colors">Plan de mitigación</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <div className="glass p-10 rounded-[3rem] border border-apple-gray-100 dark:border-white/5 lg:col-span-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 pointer-events-none">
                <Activity className="w-64 h-64 text-apple-gray-900" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black font-display text-foreground tracking-tight uppercase">Avance Dinámico<span className="text-apple-blue ml-1">.</span></h3>
                  <p className="text-sm font-medium text-apple-gray-400">Rendimiento volumétrico basado en los últimos {chartPeriod === 'semana' ? '7' : '30'} días</p>
                </div>
                <div className="flex bg-apple-gray-100 dark:bg-white/5 rounded-2xl p-1.5 border border-apple-gray-200 dark:border-white/5">
                  <button
                    onClick={() => setPeriod('semana')}
                    className={cn(
                      "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-[14px]",
                      chartPeriod === 'semana' ? "text-white bg-apple-blue shadow-lg shadow-apple-blue/25" : "text-apple-gray-400 hover:text-foreground"
                    )}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setPeriod('mes')}
                    className={cn(
                      "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-[14px]",
                      chartPeriod === 'mes' ? "text-white bg-apple-blue shadow-lg shadow-apple-blue/25" : "text-apple-gray-400 hover:text-foreground"
                    )}
                  >
                    Mes
                  </button>
                </div>
              </div>
              <div className="h-72 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={executionData}>
                    <defs>
                      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2b4bee" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#2b4bee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(0,0,0,0.03)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(0,0,0,0.3)', fontSize: 10, fontWeight: 900 }}
                      dy={15}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        borderRadius: '20px',
                        padding: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                      }}
                      itemStyle={{ color: '#2b4bee', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="#2b4bee"
                      strokeWidth={5}
                      fill="url(#areaFill)"
                      animationDuration={2500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History Section */}
            <div className="glass p-10 rounded-[3rem] border border-apple-gray-100 dark:border-white/5 relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-10 shrink-0">
                <h3 className="text-2xl font-black font-display text-foreground tracking-tight uppercase">Pulsaciones</h3>
                <Link href="/reportes" className="px-4 py-2 rounded-xl bg-apple-blue/10 text-apple-blue text-[9px] font-black hover:bg-apple-blue hover:text-white uppercase tracking-widest transition-all">Ver Histórico</Link>
              </div>
              <div className="space-y-8 overflow-y-auto flex-1 pr-2 custom-scrollbar-hide h-[320px]">
                {activityFeed.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={item.link || '#'}
                    className="flex gap-6 group cursor-pointer transition-all hover:translate-x-2"
                  >
                    <div className={cn(
                      "size-12 rounded-full flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500",
                      item.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                        item.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-apple-blue/10 text-apple-blue'
                    )}>
                      {item.type === 'ot' ? <ClipboardList className="w-5 h-5" /> :
                        item.type === 'compra' ? <ShoppingCart className="w-5 h-5" /> :
                          <User className="w-5 h-5" />}
                    </div>
                    <div className={cn("pb-6 flex-1", idx !== activityFeed.length - 1 && "border-b border-apple-gray-50 dark:border-white/5")}>
                      <h4 className="text-[13px] font-black text-foreground group-hover:text-apple-blue transition-colors line-clamp-1 uppercase tracking-tight font-display">{item.title}</h4>
                      <p className="text-xs text-apple-gray-400 font-medium mt-1 leading-relaxed line-clamp-1">{item.desc}</p>
                      <p className="text-[9px] text-apple-gray-300 font-black uppercase tracking-widest mt-3">{item.time}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="pt-8">
            <div className="flex items-center gap-3 mb-10 px-4">
              <Zap className="w-4 h-4 text-apple-blue fill-current" />
              <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.4em]">Motores Operativos</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <QuickAccessCard
                href="/obras"
                icon={Building2}
                label="Gestión Obras"
                sub="Portafolio Activo"
              />
              <Link
                href="/obras/nueva"
                className="p-8 rounded-[2.5rem] bg-apple-blue flex items-center gap-6 cursor-pointer hover:bg-apple-blue-dark transition-all shadow-xl shadow-apple-blue/25 group h-28 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-full bg-white/10 -skew-x-12 translate-x-8" />
                <div className="size-12 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform border border-white/20 relative z-10">
                  <Plus className="w-6 h-6" strokeWidth={3} />
                </div>
                <div className="relative z-10">
                  <h4 className="text-base font-black text-white leading-none mb-1 uppercase font-display">Nueva Obra</h4>
                  <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Apertura Proyecto</p>
                </div>
              </Link>
              <QuickAccessCard
                href="/compras/ordenes-compra"
                icon={ShoppingCart}
                label="Suministros"
                sub="Órdenes & Stock"
              />
              <QuickAccessCard
                href="/admin/usuarios"
                icon={Users}
                label="Equipo"
                sub="Talento & Roles"
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
      className="glass p-6 flex items-center gap-5 cursor-pointer hover:bg-white dark:hover:bg-white/5 transition-all h-24 group rounded-[2rem] border border-apple-gray-100 dark:border-white/5"
    >
      <div className="size-12 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-black text-foreground leading-none mb-1 uppercase font-display">{label}</h4>
        <p className="text-[10px] text-apple-gray-400 font-black uppercase tracking-widest">{sub}</p>
      </div>
    </Link>
  )
}
