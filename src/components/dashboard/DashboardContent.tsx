'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Plus, ClipboardList, ShoppingCart, AlertTriangle,
  TrendingUp, Clock, ArrowUpRight,
  Activity, Calendar, PieChart, Wallet, ArrowRight,
  User, Zap
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts'
import { BentoTile } from './BentoTile'
import { ActivityItem } from './ActivityItem'
import { cn } from '@/lib/utils'
import {
  AnimatedStatCard,
  AnimatedBadge,
  AnimatedProgress,
  PageTransition,
  StaggeredList
} from '@/components/animated/AnimatedComponents'

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
  otsConDesvioCritico,
  executionData,
  budgetData,
  activityFeed,
  obras,
  ordenesTrabajo,
  otsConDesvioCriticoData
}: DashboardContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.dashboard-header', { opacity: 0, y: 30, duration: 1, ease: 'expo.out' })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  if (!mounted) return null

  const COLORS = ['#0071e3', '#34c759', '#ff9f0a', '#af52de']

  // Calculate efficiency percentage
  const totalEstimado = budgetData.reduce((sum, item) => sum + item.estimacion, 0)
  const totalReal = budgetData.reduce((sum, item) => sum + item.real, 0)
  const budgetEfficiency = totalEstimado > 0 ? ((totalReal / totalEstimado) * 100) : 0

  return (
    <PageTransition>
      <div ref={containerRef} className="max-w-7xl mx-auto space-y-12 antialiased pb-20">
        {/* Premium Glass Header - Enhanced */}
        <header className="dashboard-header sticky top-0 z-30 pt-4 pb-12 transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <AnimatedBadge variant="default" pulse>
                  <Zap className="w-3 h-3 mr-1" />
                  Panel de Control PRO
                </AnimatedBadge>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date().toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
              <motion.h1
                className="text-5xl md:text-7xl font-black text-white tracking-[-0.04em] leading-[0.9]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Hola, {userName}<span className="text-blue-500">.</span>
              </motion.h1>
              <motion.p
                className="text-xl text-slate-400 font-medium tracking-tight max-w-xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {otsConDesvioCritico > 0
                  ? `Atención prioritaria: Tienes ${otsConDesvioCritico} obras con desvío crítico.`
                  : `Todo parece estar bajo control. Tienes ${obrasCount} proyectos en curso hoy.`}
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col items-end gap-4 text-right"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex -space-x-4">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className="w-14 h-14 rounded-full border-4 border-[#101622] bg-slate-800 overflow-hidden shadow-xl transition-transform hover:scale-110 hover:z-10 group"
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                  >
                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
                <div className="w-14 h-14 rounded-full border-4 border-[#101622] bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                  +4
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Equipo Colaborando</p>
            </motion.div>
          </div>
        </header>

        {/* Quick Stats Row - NEW! Using AnimatedStatCard */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AnimatedStatCard
            title="Obras Activas"
            value={obrasCount}
            change={`${otEnEjecucion} en ejecución`}
            icon={Building2}
            trend="neutral"
          />
          <AnimatedStatCard
            title="OTs Activas"
            value={otEnEjecucion}
            change="+12% vs mes anterior"
            icon={ClipboardList}
            trend="up"
          />
          <AnimatedStatCard
            title="Pendientes"
            value={otPendientes}
            change="Por iniciar"
            icon={Clock}
            trend="neutral"
          />
          <AnimatedStatCard
            title="Finalizadas"
            value={otCerradas}
            change="Completadas"
            icon={TrendingUp}
            trend="up"
          />
        </motion.div>

        {/* Bento Layout - Enhanced with animations */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-10">

          {/* Performance Widget - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-1 md:col-span-2 lg:col-span-2"
          >
            <BentoTile
              span="col-span-2"
              rowSpan="row-span-2"
              className="h-full"
              title="Ejecución de Obra"
              subtitle="Proyección semanal de avance"
              icon={TrendingUp}
            >
              <div className="h-[320px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={executionData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                      dy={15}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        padding: '16px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 flex items-center justify-between p-2">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span>+12.5% Eficiencia</span>
                </div>
                <Link href="/obras" className="group flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-all">
                  Ver Detalle <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </BentoTile>
          </motion.div>

          {/* Status Distribution - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="col-span-1"
          >
            <BentoTile
              span="col-span-1"
              rowSpan="row-span-2"
              title="Trazabilidad"
              icon={PieChart}
              className="h-full"
            >
              <div className="h-[260px] w-full flex items-center justify-center mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={[
                        { name: 'Activas', value: obrasCount },
                        { name: 'Pausadas', value: 2 },
                        { name: 'Cerradas', value: otCerradas }
                      ]}
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={10}
                      stroke="none"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 mt-8 px-2">
                {[
                  { label: 'Proyectos Activos', value: obrasCount, color: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
                  { label: 'Obras Finalizadas', value: otCerradas, color: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2.5 h-2.5 rounded-full", stat.color)} />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className="text-sm font-black text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </BentoTile>
          </motion.div>

          {/* Budget Bar Chart - Enhanced with progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="col-span-1 md:col-span-2 lg:col-span-2"
          >
            <BentoTile
              span="col-span-2"
              rowSpan="row-span-2"
              title="Gastos vs. Presupuesto"
              subtitle="Monitoreo crítico por etapa"
              icon={Wallet}
              className="h-full"
            >
              <div className="h-[300px] w-full mt-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData} barGap={12}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                      dy={15}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        padding: '16px'
                      }}
                      content={(props: any) => {
                        if (!props.active || !props.payload) return null
                        const data = props.payload[0]?.payload
                        if (!data) return null

                        const diff = data.real - data.estimacion
                        const diffPercent = ((diff / data.estimacion) * 100).toFixed(1)

                        return (
                          <div className="p-4 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
                            <p className="text-xs font-black text-white uppercase tracking-widest mb-3">{data.name}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Estimado:</span>
                                <span className="text-sm font-black text-slate-300">${data.estimacion.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Real:</span>
                                <span className="text-sm font-black text-blue-400">${data.real.toLocaleString()}</span>
                              </div>
                              <div className="pt-2 border-t border-white/5">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">Diferencia:</span>
                                  <span className={`text-sm font-black ${diff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {diff > 0 ? '+' : ''}${diff.toLocaleString()} ({diffPercent}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="estimacion" fill="rgba(255,255,255,0.05)" radius={[12, 12, 12, 12]} barSize={24} />
                    <Bar dataKey="real" fill="#3b82f6" radius={[12, 12, 12, 12]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Budget Health Indicator - NEW! */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Salud Presupuestaria</span>
                  <span className="text-sm font-black text-white">{budgetEfficiency.toFixed(1)}%</span>
                </div>
                <AnimatedProgress
                  value={budgetEfficiency}
                  max={100}
                  color={budgetEfficiency > 100 ? "bg-red-500" : budgetEfficiency > 90 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}
                />
              </div>

              {budgetEfficiency > 95 && (
                <div className="mt-6 p-6 bg-white/[0.02] backdrop-blur-md rounded-[32px] border border-amber-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest">Alerta de Margen</p>
                      <p className="text-[10px] font-bold text-slate-500 capitalize">Revisión necesaria en etapa final</p>
                    </div>
                  </div>
                  <AnimatedBadge variant="warning">
                    +{(budgetEfficiency - 100).toFixed(1)}%
                  </AnimatedBadge>
                </div>
              )}

              {/* Obras Quick Links */}
              {obras.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Obras Activas</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {obras.slice(0, 4).map(obra => (
                      <Link
                        key={obra.id}
                        href={`/obras/${obra.id}`}
                        className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-blue-600/10 hover:border-blue-500/20 transition-all group flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {obra.nombre}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {obra.estado || 'activa'}
                          </p>
                        </div>
                        <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </BentoTile>
          </motion.div>

          {/* Activity Feed - Enhanced with StaggeredList */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="col-span-1 md:col-span-2 lg:col-span-2"
          >
            <BentoTile
              span="col-span-2"
              rowSpan="row-span-2"
              title="Historial de Campo"
              icon={Activity}
              className="shadow-apple-float h-full"
            >
              <div className="mt-8 space-y-2 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                <StaggeredList
                  items={activityFeed.map(item => ({
                    id: item.id,
                    content: <ActivityItem key={item.id} {...item} />
                  }))}
                />
              </div>
              <button className="w-full mt-6 py-5 glass dark:glass-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-400 hover:text-apple-blue transition-all active:scale-[0.98]">
                Ver Actividad Completa
              </button>
            </BentoTile>
          </motion.div>

        </div>

        {/* Floating Critical Alert - Enhanced */}
        <AnimatePresence>
          {otsConDesvioCritico > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-8 py-6 glass-dark dark:glass bg-red-600/90 dark:bg-red-600/90 text-white rounded-[40px] shadow-2xl flex items-center gap-10 border border-white/30 backdrop-blur-3xl"
            >
              <div className="flex items-center gap-5">
                <motion.div
                  className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="w-7 h-7" />
                </motion.div>
                <div className="max-w-xs">
                  <h5 className="text-xl font-black tracking-tight leading-none mb-1">Riesgo Presupuestario</h5>
                  <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest line-clamp-1">Proyectos con desvío &gt; 20%</p>
                </div>
              </div>
              <Link href="/obras" className="px-8 py-4 bg-white text-red-600 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-95">
                Intervenir Ahora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Action Palette - Enhanced */}
        <section className="pt-20 space-y-10">
          <div className="flex items-center gap-6 px-4">
            <h2 className="text-3xl font-black text-white tracking-tight whitespace-nowrap">Accesos Rápidos</h2>
            <div className="h-px w-full bg-white/5" />
          </div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <QuickActionLink href="/obras" icon={Building2} label="Gestión Obras" desc="Planos y proyectos activos" />
            <QuickActionLink href="/obras/nueva" icon={Plus} label="Nueva Obra" desc="Alta de nuevo proyecto" primary />
            <QuickActionLink href="/compras/ordenes-compra" icon={ShoppingCart} label="Suministros" desc="Control de materiales" />
            <QuickActionLink href="/perfil" icon={User} label="Configuración" desc="Ajustes de plataforma" />
          </motion.div>
        </section>
      </div>
    </PageTransition>
  )
}

function QuickActionLink({ href, icon: Icon, label, desc, primary }: { href: string, icon: any, label: string, desc: string, primary?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link
        href={href}
        className={cn(
          "p-8 rounded-[40px] border transition-all duration-500 flex flex-col items-start gap-4 h-full group",
          primary
            ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 border-blue-500"
            : "bg-white/[0.03] backdrop-blur-md border-white/5 shadow-2xl hover:border-blue-500/30"
        )}
      >
        <motion.div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            primary ? "bg-white/20" : "bg-white/5"
          )}
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className={cn("w-6 h-6", primary ? "text-white" : "text-blue-400")} strokeWidth={1.5} />
        </motion.div>
        <div>
          <h4 className="text-lg font-black text-white tracking-tight leading-none mb-1">{label}</h4>
          <p className={cn("text-xs font-medium opacity-60", primary ? "text-white" : "text-slate-400")}>{desc}</p>
        </div>
      </Link>
    </motion.div>
  )
}
