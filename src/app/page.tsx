'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Building2, ArrowRight, Zap, ChevronRight,
  CheckCircle2, Smartphone, Lock, Construction,
  Package, LayoutGrid, PlayCircle, BarChart3,
  Sun, Moon, Plus, Share2, AtSign, Twitter, Instagram
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/lib/utils'

const CornerPlus = ({ className }: { className?: string }) => (
  <div className={cn("absolute w-4 h-4 flex items-center justify-center text-slate-400/30 dark:text-white/20 font-light select-none pointer-events-none z-20", className)}>
    <span className="text-[10px]">+</span>
  </div>
)

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  if (loading || !mounted) return null

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0b0f1a] text-slate-900 dark:text-white selection:bg-blue-500/30 selection:text-blue-400 overflow-x-hidden font-sans antialiased transition-colors duration-500">
      {/* Dot Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(#94a3b8 0.5px, transparent 0.5px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-white/[0.02] backdrop-blur-md border-b border-slate-200/50 dark:border-white/5">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 h-20 flex justify-between items-center relative">
          <div className="flex items-center gap-4 group cursor-pointer relative z-10">
            <Logo size={40} className="group-hover:scale-110 transition-transform duration-500" />
            <span className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white transition-colors">Sistema EDO</span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-10">
            {['Funciones', 'Precios', 'Beneficios'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace('ó', 'o')}`}
                className="text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <Link href="/auth/login" className="hidden sm:block text-[14px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 bg-[#0070f3] text-white text-[14px] font-semibold rounded-full hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-600/20 transition-all active:scale-95 shadow-md shadow-blue-500/10"
            >
              Prueba Gratis
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Full-screen Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6">
          <div className="max-w-screen-2xl mx-auto text-center flex flex-col items-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecf5ff] dark:bg-blue-500/10 border border-[#d1e9ff] dark:border-blue-500/20 text-[#0070f3] dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-[0.05em] mb-12"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Plataforma N°1 para Constructores</span>
            </motion.div>

            {/* Hero Content */}
            <motion.div className="relative mb-10">
              {/* Glow Behind "total" */}
              <div className="absolute top-[15%] left-[40%] w-[20%] h-[30%] bg-blue-400/20 blur-[60px] rounded-full pointer-events-none -z-10" />

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-6xl md:text-8xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.05] text-[#0f172a] dark:text-white font-display"
              >
                Control <span className="text-[#0070f3]">total</span> para la <br className="hidden md:block" /> Ejecución de Obras
              </motion.h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-[21px] text-slate-500 dark:text-slate-400 mb-16 max-w-[800px] mx-auto leading-[1.6] font-medium"
            >
              Gestión centralizada de presupuestos, órdenes de trabajo y suministros diseñada específicamente para constructoras modernas que buscan eficiencia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-10 py-4 bg-[#0070f3] text-white text-base font-bold rounded-full hover:bg-blue-600 transition-all active:scale-[0.98] shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 group"
              >
                Empezar ahora
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white text-base font-bold rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-slate-200 dark:border-white/10 shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-500 fill-blue-600/10 dark:fill-blue-500/20" />
                Ver Video Demo
              </button>
            </motion.div>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto px-6 text-center flex flex-col items-center">
          {/* Marquee Section */}
          <section className="w-full py-16 border-t border-black/5 dark:border-white/5 overflow-hidden">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-12 text-center">CONFIADO POR EMPRESAS LÍDERES DEL SECTOR</p>
            <div className="flex gap-24 overflow-hidden relative opacity-40 dark:opacity-60 grayscale">
              <div className="flex animate-marquee gap-24 flex-shrink-0 min-w-full justify-around items-center">
                {['CONSTRUCTA', 'URBANIA', 'LOGOS GROUP', 'VERTICAL S.A.', 'PRO-OBRA', 'TECHNOBUILD'].map((name) => (
                  <span key={name} className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tighter whitespace-nowrap">{name}</span>
                ))}
              </div>
              <div className="flex animate-marquee gap-24 flex-shrink-0 min-w-full justify-around items-center" aria-hidden="true">
                {['CONSTRUCTA', 'URBANIA', 'LOGOS GROUP', 'VERTICAL S.A.', 'PRO-OBRA', 'TECHNOBUILD'].map((name) => (
                  <span key={name} className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tighter whitespace-nowrap">{name}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Feature Cards Grid */}
          <section id="funciones" className="w-full py-32 grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Órdenes de Trabajo',
                desc: 'Planificación y control detallado de cada ejecución con trazabilidad completa y digital en tiempo real.',
                icon: Construction,
                color: 'blue'
              },
              {
                title: 'Presupuesto Vivo',
                desc: 'Monitorización dinámica de desvíos, costos por rubro y proyecciones de caja automatizadas.',
                icon: BarChart3,
                color: 'purple'
              },
              {
                title: 'Gestión de Compras',
                desc: 'Control integral de suministros, órdenes de compra y recepción de materiales directamente en obra.',
                icon: Package,
                color: 'orange'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-10 md:p-12 rounded-[40px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl hover:border-blue-500/30 transition-all duration-500 text-left hover:-translate-y-2"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 border",
                  feature.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-600/10 dark:text-blue-500 dark:border-blue-500/20' :
                    feature.color === 'purple' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-600/10 dark:text-purple-500 dark:border-purple-500/20' :
                      'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-600/10 dark:text-orange-500 dark:border-orange-500/20'
                )}>
                  <feature.icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight leading-tight text-slate-900 dark:text-white font-display">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 font-medium">{feature.desc}</p>
                <div className="flex items-center text-blue-600 dark:text-blue-500 font-bold text-sm group-hover:gap-2 transition-all">
                  Conocer más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </section>

          <section id="precios" className="w-full py-32 border-t border-black/5 dark:border-white/5">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white text-balance font-display">Planes para cada etapa</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg">Elige el plan que mejor se adapte al volumen de tus obras. Sin contratos ocultos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
              {[
                { name: 'Free', price: '$0', desc: 'Para equipos pequeños', features: ['Hasta 2 Usuarios', '1 Obra Activa', 'Soporte por Email'] },
                { name: 'Starter', price: '$24', desc: 'Sincronización de equipos', features: ['Precio por usuario', '5 Obras Activas', 'Gestión de Compras', 'Reportes PDF'] },
                { name: 'Pro', price: '$49', desc: 'Control profesional total', features: ['Precio por usuario', 'Obras Ilimitadas', 'Presupuesto Vivo API', 'Soporte 24/7 Premium'], highlight: true },
                { name: 'Enterprise', price: 'Custom', desc: 'Soluciones a medida', features: ['Usuarios Ilimitados', 'Server Dedicado', 'SSO & Seguridad', 'SLA de Respuesta'] }
              ].map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={cn(
                    "relative p-10 rounded-[40px] border transition-all duration-500 flex flex-col items-start text-left",
                    plan.highlight
                      ? "bg-blue-50/50 dark:bg-blue-600/10 border-blue-600 shadow-2xl shadow-blue-600/10 dark:shadow-blue-600/20 md:scale-105 z-10"
                      : "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  )}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">Más Popular</div>
                  )}
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8 leading-tight">{plan.desc}</p>
                  <div className="mb-10 text-slate-900 dark:text-white">
                    <span className="text-5xl font-extrabold">{plan.price}</span>
                    {plan.price !== 'Custom' && (
                      <div className="inline-flex flex-col ml-2 align-middle">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-tight">por usuario</span>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium leading-tight">al mes</span>
                      </div>
                    )}
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <CheckCircle2 className={cn("w-5 h-5", plan.highlight ? "text-blue-600 dark:text-blue-500" : "text-emerald-500")} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={cn(
                    "w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all shadow-lg",
                    plan.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
                      : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5"
                  )}>
                    {plan.name === 'Enterprise' ? 'Contactar Ventas' : 'Elegir Plan'}
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section id="beneficios" className="w-full py-32 grid lg:grid-cols-2 gap-20 items-center text-left">
            <div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-12 text-slate-900 dark:text-white leading-tight font-display">Por qué elegir <br /> Sistema EDO</h2>
              <div className="space-y-10">
                {[
                  { title: 'Implementación Rápida', desc: 'Migra tus datos en menos de 48 horas con nuestro equipo especializado de soporte.', icon: Zap, color: 'blue' },
                  { title: 'Movilidad Total', desc: 'Accede desde el pie de obra con nuestra app móvil, incluso sin conexión a internet.', icon: Smartphone, color: 'emerald' },
                  { title: 'Seguridad Bancaria', desc: 'Tus datos están protegidos con encriptación AES-256 y respaldos diarios automáticos.', icon: Lock, color: 'purple' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all border shadow-sm",
                      "bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white"
                    )}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-[3rem] blur-3xl opacity-50" />
              <div className="relative p-1 bg-white dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="bg-white dark:bg-[#0b0f1a] rounded-[2.8rem] overflow-hidden border border-slate-100 dark:border-white/5">
                  <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">Dashboard de Control</div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="p-10 space-y-10 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-primary uppercase mb-1 tracking-widest">Proyecto Activo</div>
                        <div className="text-2xl font-extrabold text-slate-800 dark:text-white">Torre Residencial "Altos"</div>
                      </div>
                      <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20">EN FECHA</div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
                        <div className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest uppercase text-center">PROGRESO</div>
                        <div className="relative h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                          <div className="absolute top-0 left-0 h-full w-[72%] bg-primary shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800 dark:text-white text-center">72%</div>
                      </div>
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
                        <div className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest uppercase text-center">DESVÍO COSTOS</div>
                        <div className="text-3xl font-extrabold text-red-500 text-center">-2.4%</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-1 text-center">Presupuestado</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-5 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", i === 1 ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-white/5 dark:text-blue-500 dark:border-white/10" : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-white/5 dark:text-emerald-500 dark:border-white/10")}>
                            {i === 1 ? <Construction className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="h-2 w-24 bg-slate-200 dark:bg-white/10 rounded" />
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded" />
                          </div>
                          <div className="w-10 h-1.5 bg-slate-100 dark:bg-white/10 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-white/[0.03] backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 pt-32 pb-20 px-6 relative z-10 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 relative">
          {/* Decorative Corner Pluses */}
          <CornerPlus className="top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <CornerPlus className="top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <CornerPlus className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <CornerPlus className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-20 mb-24">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-10 group">
                <Logo size={44} className="group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white group-hover:text-primary transition-colors">Sistema EDO</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm mb-10 leading-relaxed font-medium">
                La plataforma líder en gestión de obras para el mercado hispano. Construyendo el futuro de la ingeniería digital con precisión y potencia.
              </p>
              <div className="flex gap-4">
                {[Share2, AtSign, Twitter, Instagram].map((Icon, i) => (
                  <Link key={i} href="#" className="w-11 h-11 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 hover:-translate-y-1 transition-all text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white shadow-sm">
                    <Icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>

            {[
              { title: 'PRODUCTO', links: ['Funciones', 'Integraciones', 'Precios', 'Roadmap V2'] },
              { title: 'COMPAÑÍA', links: ['Acerca de', 'Blog de Obra', 'Carreras', 'Contacto'] },
              { title: 'SOPORTE', links: ['Centro de Ayuda', 'Privacidad', 'Términos', 'API Docs'] }
            ].map((section) => (
              <div key={section.title}>
                <h5 className="font-bold mb-8 text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">{section.title}</h5>
                <ul className="space-y-5 text-[15px] font-medium text-slate-500 dark:text-slate-400">
                  {section.links.map((link) => (
                    <li key={link}><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{link}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-12 border-t border-slate-100 dark:border-white/5 flex justify-center items-center">
            <p className="text-xs text-slate-400 dark:text-slate-600 font-bold tracking-wider uppercase text-center">
              © 2026 Sistema EDO — <span className="text-slate-900 dark:text-white">Excelencia en Gestión de Obras</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white/80 dark:bg-white/[0.05] backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl z-[100]"
      >
        <div className="relative w-6 h-6">
          <Sun className={cn(
            "w-6 h-6 text-yellow-500 absolute transition-all duration-500",
            theme === 'dark' ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
          )} />
          <Moon className={cn(
            "w-6 h-6 text-blue-500 absolute transition-all duration-500",
            theme === 'dark' ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          )} />
        </div>
      </button>
    </div>
  )
}
