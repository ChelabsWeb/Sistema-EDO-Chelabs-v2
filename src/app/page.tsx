'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Building2, ArrowRight, Zap, ChevronRight,
  CheckCircle2, Smartphone, Lock, Construction,
  Package, LayoutGrid, PlayCircle, BarChart3,
  Sun, Moon, Plus, Share2, AtSign, Twitter, Instagram
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/lib/utils'
import { LandingButton } from '@/components/ui/landing-button'
import { LandingCard, type ColorScheme } from '@/components/ui/landing-card'
import { PainSection } from '@/components/landing/PainSection'
import { ROICalculator } from '@/components/landing/ROICalculator'
import { BeamAnimation } from '@/components/landing/BeamAnimation'
import { SocialProof } from '@/components/landing/SocialProof'
import { FinalCTA } from '@/components/landing/FinalCTA'

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

  // Parallax Effect Hooks
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0])

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

          <div className="flex items-center gap-4 relative z-10">
            <LandingButton href="/auth/login" intent="ghost" size="sm" className="hidden sm:block">
              Login
            </LandingButton>
            <LandingButton href="/auth/register" intent="outline" size="sm" className="hidden sm:block">
              Regístrate
            </LandingButton>
            <LandingButton href="/auth/register" intent="primary" size="sm">
              Agendar Demo
            </LandingButton>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Full-screen Split Hero Section */}
        <section className="min-h-[100svh] lg:min-h-screen pt-32 pb-16 lg:pt-0 lg:pb-0 px-4 sm:px-6 flex items-center overflow-hidden">
          <div className="max-w-screen-2xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center mt-8 lg:mt-0">
            
            {/* Left Column - Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative z-20">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#ecf5ff] dark:bg-blue-500/10 border border-[#d1e9ff] dark:border-blue-500/20 text-[#0070f3] dark:text-blue-400 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.05em] mb-6 sm:mb-8"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Plataforma N°1 para Constructores</span>
              </motion.div>

              {/* Title */}
              <motion.div className="relative mb-6 sm:mb-8 w-full">
                {/* Glow Behind "caos" */}
                <div className="absolute top-[20%] left-1/2 lg:left-[10%] -translate-x-1/2 lg:translate-x-0 w-[60%] lg:w-[40%] h-[50%] bg-blue-400/20 blur-[60px] rounded-full pointer-events-none -z-10" />

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground mx-auto lg:mx-0 max-w-2xl lg:max-w-none text-balance"
                >
                  Ejecuta sin sobrecostos.<br className="hidden sm:block" /> 
                  <span className="sm:hidden"> </span>Controla el <span className="text-primary">caos</span> en tiempo real.
                </motion.h1>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 sm:mb-10 max-w-[600px] leading-[1.6] font-medium text-balance mx-auto lg:mx-0"
              >
                Pasa de la incertidumbre en Excel a tener el control financiero y logístico absoluto. Gestiona presupuestos, compras y cuadrillas en una única plataforma de alto rendimiento.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5 w-full sm:w-auto"
              >
                <LandingButton href="/auth/register" intent="primary" size="md" className="w-full sm:w-auto group">
                  Agendar Demo Ejecutiva
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 hidden sm:block" />
                </LandingButton>
                <LandingButton intent="outline" size="md" className="w-full sm:w-auto">
                  <PlayCircle className="w-5 h-5 text-primary" />
                  Ver Video Demo
                </LandingButton>
              </motion.div>
            </div>

            {/* Right Column - Image Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square xl:aspect-[4/3] group z-10"
            >
              {/* Premium Background Glow/Shadow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 rounded-[3rem]" />
              
              {/* The Container */}
              <div className="relative h-full w-full rounded-[2rem] md:rounded-[3rem] p-1.5 bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden">
                <div className="relative h-full w-full rounded-[1.75rem] md:rounded-[2.75rem] overflow-hidden bg-slate-100 dark:bg-slate-900 isolation-isolate">
                  {/* Subtle inner overlay for borders */}
                  <div className="absolute inset-0 border border-black/5 dark:border-white/5 rounded-[1.75rem] md:rounded-[2.75rem] z-20 pointer-events-none" />
                  
                  <Image
                    src="/hero-bg.jpg"
                    alt="Sistema EDO Hero Dashboard 3D"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                    priority
                    quality={100}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Floating Decorative Elements (Optional, based on Equimas UI design patterns) */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -top-6 -right-6 md:-top-10 md:-right-10 w-24 h-24 md:w-32 md:h-32 bg-[url('/grid-pattern.svg')] opacity-20 pointer-events-none z-0" 
              />
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

          <PainSection />



          <ROICalculator />

          {/* Feature Cards Grid */}
          <section id="funciones" className="w-full py-20 md:py-32 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-black/5 dark:border-white/5">
            <div className="md:col-span-3">
              <div className="text-center mb-12 md:mb-16 px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 border border-slate-300/50 dark:border-white/20 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-widest mb-6"
                >
                  Plataforma Unificada
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 text-balance font-display"
                >
                  Cada métrica de tu obra,<br className="hidden sm:block" /> en tiempo real
                </motion.h2>
              </div>
              <BeamAnimation />
            </div>
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
              <LandingCard
                key={i}
                index={i}
                title={feature.title}
                description={feature.desc}
                icon={feature.icon}
                colorScheme={feature.color as ColorScheme}
                actionLabel="Conocer más"
              />
            ))}
          </section>

          <SocialProof />
          
          {/* Prices Section (Optional - Moved below SocialProof) */}
          <section id="precios" className="w-full py-20 md:py-32 border-t border-black/5 dark:border-white/5">
            <div className="text-center mb-16 md:mb-24 px-4">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-4 md:mb-6 text-slate-900 dark:text-white text-balance font-display">Planes para cada etapa</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-base sm:text-lg">Elige el plan que mejor se adapte al volumen de tus obras. Sin contratos ocultos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
              {[
                { name: 'Free', price: '$0', desc: 'Para equipos pequeños', features: ['Hasta 2 Usuarios', '1 Obra Activa', 'Soporte por Email'] },
                { name: 'Starter', price: '$24', desc: 'Sincronización de equipos', features: ['Precio por usuario', '5 Obras Activas', 'Gestión de Compras', 'Reportes PDF'] },
                { name: 'Pro', price: '$49', desc: 'Control profesional total', features: ['Precio por usuario', 'Obras Ilimitadas', 'Presupuesto Vivo API', 'Soporte 24/7 Premium'], highlight: true },
                { name: 'Enterprise', price: 'Custom', desc: 'Soluciones a medida', features: ['Usuarios Ilimitados', 'Server Dedicado', 'SSO & Seguridad', 'SLA de Respuesta'] }
              ].map((plan, i) => (
                <LandingCard
                  key={plan.name}
                  index={i}
                  title={plan.name}
                  description={plan.desc}
                  isHighlight={plan.highlight}
                  className="flex flex-col h-full"
                >
                  <div className="mb-10 text-slate-900 dark:text-white mt-auto">
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
                  <LandingButton intent={plan.highlight ? "highlight" : "outline"} size="full" className="mt-auto w-full">
                    {plan.name === 'Enterprise' ? 'Contactar Ventas' : 'Elegir Plan'}
                  </LandingButton>
                </LandingCard>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section id="beneficios" className="w-full py-20 md:py-32 grid lg:grid-cols-2 gap-12 md:gap-20 items-center text-left">
            <div className="px-4 md:px-0">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-8 md:mb-12 text-slate-900 dark:text-white leading-tight font-display text-center lg:text-left text-balance">Por qué elegir <br className="hidden lg:block"/> Sistema EDO</h2>
              <div className="space-y-8 md:space-y-10">
                {[
                  { title: 'Implementación Rápida', desc: 'Migra tus datos en menos de 48 horas con nuestro equipo especializado de soporte.', icon: Zap, color: 'blue' },
                  { title: 'Movilidad Total', desc: 'Accede desde el pie de obra con nuestra app móvil, incluso sin conexión a internet.', icon: Smartphone, color: 'emerald' },
                  { title: 'Seguridad Bancaria', desc: 'Tus datos están protegidos con encriptación AES-256 y respaldos diarios automáticos.', icon: Lock, color: 'purple' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 md:gap-8 group">
                    <div className={cn(
                      "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all border shadow-sm",
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
              style={{ y, rotateX, perspective: 1000 }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-[3rem] blur-3xl opacity-50" />
              <div className="relative p-1 bg-white dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="bg-white dark:bg-[#0b0f1a] rounded-[2.8rem] overflow-hidden border border-slate-100 dark:border-white/5">
                  <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 sm:px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">Dashboard de Control</div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="p-6 sm:p-10 space-y-8 sm:space-y-10 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-primary uppercase mb-1 tracking-widest">Proyecto Activo</div>
                        <div className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">Torre Residencial "Altos"</div>
                      </div>
                      <div className="self-start sm:self-auto px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20">EN FECHA</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="p-5 sm:p-6 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
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
      <footer className="bg-white dark:bg-white/[0.03] backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 pt-20 md:pt-32 pb-12 md:pb-20 px-6 relative z-10 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 relative">
          {/* Decorative Corner Pluses */}
          <CornerPlus className="top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <CornerPlus className="top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <CornerPlus className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <CornerPlus className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 md:gap-20 mb-16 md:mb-24 px-2 sm:px-0">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-8 md:mb-10 group">
                <Logo size={40} className="md:w-[44px] md:h-[44px] group-hover:scale-110 transition-transform" />
                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white group-hover:text-primary transition-colors">Sistema EDO</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-sm mb-8 md:mb-10 leading-relaxed font-medium">
                La plataforma líder en gestión de obras para el mercado hispano. Construyendo el futuro de la ingeniería digital con precisión y potencia.
              </p>
              <div className="flex gap-4">
                {[Share2, AtSign, Twitter, Instagram].map((Icon, i) => {
                  const isSocialDisabled = true; // MVP: Deshabilitar redes momentáneamente
                  return (
                    <Link 
                      key={i} 
                      href="#" 
                      aria-disabled={isSocialDisabled}
                      tabIndex={isSocialDisabled ? -1 : 0}
                      onClick={(e) => isSocialDisabled && e.preventDefault()}
                      title={isSocialDisabled ? 'Próximamente' : undefined}
                      className={cn(
                        "w-11 h-11 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all shadow-sm",
                        isSocialDisabled 
                          ? "pointer-events-none opacity-50" 
                          : "hover:bg-slate-100 dark:hover:bg-white/10 hover:-translate-y-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white"
                      )}>
                      <Icon className={cn("w-5 h-5", isSocialDisabled ? "text-slate-400" : "text-inherit")} />
                    </Link>
                  )
                })}
              </div>
            </div>

            {[
              { 
                title: 'PRODUCTO', 
                links: [
                  { label: 'Funciones', href: '#', disabled: true },
                  { label: 'Integraciones', href: '#', disabled: true },
                  { label: 'Precios', href: '#', disabled: true },
                  { label: 'Roadmap V2', href: '#', disabled: true }
                ] 
              },
              { 
                title: 'COMPAÑÍA', 
                links: [
                  { label: 'Acerca de', href: '#', disabled: true },
                  { label: 'Blog de Obra', href: '#', disabled: true },
                  { label: 'Carreras', href: '#', disabled: true },
                  { label: 'Contacto', href: '#', disabled: true }
                ] 
              },
              { 
                title: 'SOPORTE', 
                links: [
                  { label: 'Centro de Ayuda', href: '#', disabled: true },
                  { label: 'Privacidad', href: '#', disabled: true },
                  { label: 'Términos', href: '#', disabled: true },
                  { label: 'API Docs', href: '#', disabled: true }
                ] 
              }
            ].map((section) => (
              <div key={section.title}>
                <h5 className="font-bold mb-8 text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">{section.title}</h5>
                <ul className="space-y-5 text-[15px] font-medium text-slate-500 dark:text-slate-400">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        aria-disabled={link.disabled}
                        tabIndex={link.disabled ? -1 : 0}
                        onClick={(e) => link.disabled && e.preventDefault()}
                        title={link.disabled ? 'Próximamente' : undefined}
                        className={cn(
                          "transition-colors",
                          link.disabled 
                            ? "pointer-events-none opacity-50" 
                            : "hover:text-blue-600 dark:hover:text-blue-400"
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
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
