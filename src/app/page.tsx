import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, ArrowRight, ShieldCheck, Zap, BarChart3, ChevronRight } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-apple-blue/20 selection:text-apple-blue overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-black/[0.05] dark:border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-[--color-apple-blue] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,113,227,0.3)] group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Sistema EDO</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/auth/login" className="text-sm font-semibold text-apple-gray-400 hover:text-apple-blue transition-colors">
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 bg-apple-blue text-white text-sm font-bold rounded-full hover:bg-apple-blue-dark transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(0,113,227,0.25)]"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-apple-blue/[0.08] dark:bg-apple-blue/20 border border-apple-blue/20 text-apple-blue text-[11px] font-bold mb-10 animate-apple-fade-in uppercase tracking-[0.1em]">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Versión 2.0 Professional Disponible</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 animate-apple-slide-up max-w-5xl mx-auto leading-[1.05] text-balance">
            Control <span className="text-apple-blue">Total</span> para la <br className="hidden md:block" /> Ejecución de Obras
          </h1>

          <p className="text-xl md:text-2xl text-apple-gray-400 mb-14 animate-apple-slide-up max-w-3xl mx-auto leading-relaxed font-medium">
            Gestión centralizada de presupuestos, órdenes de trabajo y suministros diseñada específicamente para constructoras modernas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32 animate-apple-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-12 py-5 bg-apple-blue text-white text-lg font-bold rounded-full hover:bg-apple-blue-dark transition-all active:scale-[0.95] shadow-[0_20px_40px_rgba(0,113,227,0.3)] flex items-center justify-center gap-2 group"
            >
              Empezar ahora
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-12 py-5 bg-apple-gray-50 dark:bg-apple-gray-100 text-foreground text-lg font-bold rounded-full hover:bg-apple-gray-100 dark:hover:bg-apple-gray-200 transition-all active:scale-[0.95] flex items-center justify-center gap-2 border border-apple-gray-200 dark:border-white/10"
            >
              Ver Funciones
            </Link>
          </div>

          {/* Feature Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-10 mt-20 animate-apple-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              {
                title: 'Órdenes de Trabajo',
                desc: 'Planificación y control detallado de cada ejecución con trazabilidad completa y digital.',
                icon: ShieldCheck,
                color: 'blue'
              },
              {
                title: 'Presupuesto Vivo',
                desc: 'Monitorización en tiempo real de desvíos, costos por rubro y proyecciones de caja.',
                icon: BarChart3,
                color: 'purple'
              },
              {
                title: 'Gestión de Compras',
                desc: 'Control integral de suministros, órdenes de compra y recepción de materiales en obra.',
                icon: Zap,
                color: 'orange'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-10 rounded-[40px] bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/[0.05] shadow-apple hover:shadow-apple-float transition-all duration-500 text-left hover:-translate-y-3"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl transition-transform group-hover:scale-110
                  ${feature.color === 'blue' ? 'bg-gradient-to-br from-[#0071e3] to-[#00c6fb] shadow-[#0071e3]/20' :
                    feature.color === 'purple' ? 'bg-gradient-to-br from-[#af52de] to-[#ff2d55] shadow-[#af52de]/20' :
                      'bg-gradient-to-br from-[#ff9500] to-[#ffcc00] shadow-[#ff9500]/20'}`}
                >
                  <feature.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight leading-tight">{feature.title}</h3>
                <p className="text-apple-gray-400 leading-relaxed mb-8 font-medium">{feature.desc}</p>
                <div className="flex items-center text-apple-blue font-bold text-sm group-hover:gap-2 transition-all">
                  Explorar Detalle <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-apple-gray-100 dark:border-white/[0.05] glass">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-apple-blue rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Sistema EDO</span>
          </div>
          <p className="text-sm text-apple-gray-400 font-medium">
            © 2026 Chelabs v2 — <span className="text-foreground font-bold">Excelencia en Gestión de Obras</span>
          </p>
          <div className="flex gap-10 text-sm font-bold">
            <Link href="#" className="text-apple-gray-400 hover:text-apple-blue transition-colors">Privacidad</Link>
            <Link href="#" className="text-apple-gray-400 hover:text-apple-blue transition-colors">Soporte</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
