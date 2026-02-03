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
      <div ref={containerRef} className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-6 md:p-14 max-w-7xl mx-auto space-y-12 antialiased">
        {/* Premium Glass Header - Enhanced */}
        <header className="dashboard-header sticky top-0 z-30 -mx-4 md:-mx-8 px-8 md:px-12 py-10 backdrop-blur-xl bg-white/70 dark:bg-apple-gray-50/70 border-b border-apple-gray-100 dark:border-white/5 rounded-b-[48px] shadow-apple-sm transition-all duration-500 overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple-blue/5 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <AnimatedBadge variant="default" pulse>
                  <Zap className="w-3 h-3 mr-1" />
                  Panel de Control
                </AnimatedBadge>
                <div className="flex items-center gap-2 px-3 py-1.5 glass dark:glass-dark rounded-full text-[10px] font-black text-apple-gray-400 uppercase tracking-widest border border-white/20">
                  <Calendar className="w-3 h-3 text-apple-gray-300" />
                  {new Date().toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
              <motion.h1
                className="text-5xl md:text-7xl font-black text-foreground tracking-[-0.04em] leading-[0.9]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Hola, {userName}<span className="text-apple-blue">.</span>
              </motion.h1>
              <motion.p
                className="text-xl text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed"
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
                    className="w-14 h-14 rounded-full border-4 border-white dark:border-apple-gray-50 bg-apple-gray-100 overflow-hidden shadow-apple-sm transition-transform hover:scale-110 hover:z-10 group"
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                  >
                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
                <div className="w-14 h-14 rounded-full border-4 border-white dark:border-apple-gray-50 bg-apple-blue flex items-center justify-center text-white text-xs font-black shadow-apple-sm">
                  +4
                </div>
              </div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em]">Equipo Colaborando</p>
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
              className="shadow-apple-float h-full"
              title="Ejecución de Obra"
              subtitle="Proyección semanal de avance"
              icon={TrendingUp}
            >
              <div className="h-[320px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={executionData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0071e3" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(0,0,0,0.03)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }}
                      dy={15}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ stroke: '#0071e3', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        padding: '16px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="#0071e3"
                      strokeWidth={5}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 flex items-center justify-between p-2">
                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>+12.5% Eficiencia</span>
                </div>
                <Link href="/obras" className="group flex items-center gap-2 text-[10px] font-black text-apple-blue uppercase tracking-widest hover:bg-apple-blue/5 px-4 py-2 rounded-full transition-all">
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
              className="shadow-apple-float h-full"
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
                  { label: 'Proyectos Activos', value: obrasCount, color: 'bg-apple-blue' },
                  { label: 'Obras Finalizadas', value: otCerradas, color: 'bg-emerald-500' }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2.5 h-2.5 rounded-full", stat.color)} />
                      <span className="text-[11px] font-bold text-apple-gray-400 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className="text-sm font-black text-foreground">{stat.value}</span>
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
              className="shadow-apple-float h-full"
            >
              <div className="h-[300px] w-full mt-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData} barGap={12}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(0,0,0,0.03)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }}
                      dy={15}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        padding: '16px'
                      }}
                      content={(props: any) => {
                        if (!props.active || !props.payload) return null
                        const data = props.payload[0]?.payload
                        if (!data) return null

                        const diff = data.real - data.estimacion
                        const diffPercent = ((diff / data.estimacion) * 100).toFixed(1)

                        return (
                          <div className="p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
                            <p className="text-xs font-black text-foreground uppercase tracking-widest mb-3">{data.name}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-bold text-apple-gray-400 uppercase">Estimado:</span>
                                <span className="text-sm font-black text-apple-gray-500">${data.estimacion.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-bold text-apple-gray-400 uppercase">Real:</span>
                                <span className="text-sm font-black text-apple-blue">${data.real.toLocaleString()}</span>
                              </div>
                              <div className="pt-2 border-t border-apple-gray-100">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] font-bold text-apple-gray-400 uppercase">Diferencia:</span>
                                  <span className={`text-sm font-black ${diff > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {diff > 0 ? '+' : ''}${diff.toLocaleString()} ({diffPercent}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="estimacion" fill="#f1f5f9" radius={[12, 12, 12, 12]} barSize={24} />
                    <Bar dataKey="real" fill="#0071e3" radius={[12, 12, 12, 12]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Budget Health Indicator - NEW! */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Salud Presupuestaria</span>
                  <span className="text-sm font-black text-foreground">{budgetEfficiency.toFixed(1)}%</span>
                </div>
                <AnimatedProgress
                  value={budgetEfficiency}
                  max={100}
                  color={budgetEfficiency > 100 ? "bg-red-500" : budgetEfficiency > 90 ? "bg-amber-500" : "bg-emerald-500"}
                />
              </div>

              {budgetEfficiency > 95 && (
                <div className="mt-6 p-6 glass dark:glass-dark rounded-[32px] border border-amber-500/20 flex items-center justify-between shadow-apple-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-widest">Alerta de Margen</p>
                      <p className="text-[10px] font-bold text-apple-gray-400 capitalize">Revisión necesaria en etapa final</p>
                    </div>
                  </div>
                  <AnimatedBadge variant="warning">
                    +{(budgetEfficiency - 100).toFixed(1)}%
                  </AnimatedBadge>
                </div>
              )}

              {/* Obras Quick Links */}
              {obras.length > 0 && (
                <div className="mt-6 pt-6 border-t border-apple-gray-100 dark:border-white/5">
                  <h5 className="text-xs font-black text-apple-gray-400 uppercase tracking-widest mb-4">Obras Activas</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {obras.slice(0, 4).map(obra => (
                      <Link
                        key={obra.id}
                        href={`/obras/${obra.id}`}
                        className="p-3 glass dark:glass-dark rounded-2xl hover:bg-apple-blue/5 transition-all group flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate group-hover:text-apple-blue transition-colors">
                            {obra.nombre}
                          </p>
                          <p className="text-[10px] text-apple-gray-400 font-medium">
                            {obra.estado || 'activa'}
                          </p>
                        </div>
                        <ArrowUpRight className="w-3 h-3 text-apple-gray-300 group-hover:text-apple-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
            <h2 className="text-3xl font-black text-foreground tracking-tight whitespace-nowrap">Accesos Rápidos</h2>
            <div className="h-px w-full bg-apple-gray-100 dark:bg-white/5" />
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
            ? "bg-apple-blue text-white shadow-lg border-apple-blue"
            : "bg-white dark:bg-apple-gray-50 border-apple-gray-100 dark:border-white/[0.05] shadow-apple hover:shadow-apple-float"
        )}
      >
        <motion.div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            primary ? "bg-white/20" : "bg-apple-gray-50 dark:bg-white/5"
          )}
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className={cn("w-6 h-6", primary ? "text-white" : "text-apple-blue")} strokeWidth={1.5} />
        </motion.div>
        <div>
          <h4 className="text-lg font-black tracking-tight leading-none mb-1">{label}</h4>
          <p className={cn("text-xs font-medium opacity-60", primary ? "text-white" : "text-apple-gray-400")}>{desc}</p>
        </div>
      </Link>
    </motion.div>
  )
}
