import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Plus, ChevronRight, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function ObrasPage() {
  const supabase = await createClient()
  const isDemo = process.env.DEMO_MODE === 'true'

  let user = null
  if (!isDemo) {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/auth/login')
    user = authUser
  }

  type ObraRow = {
    id: string;
    nombre: string;
    direccion: string | null;
    presupuesto_total: number | null;
    fecha_inicio: string | null;
    estado: 'activa' | 'pausada' | 'finalizada'
  }

  let obras: ObraRow[] = []
  let error = null

  if (isDemo) {
    obras = [
      { id: '1', nombre: 'Torres Persea', direccion: 'Luis de la torre 942', presupuesto_total: 5000000, fecha_inicio: '2024-01-15', estado: 'activa' },
      { id: '2', nombre: 'Torre del Valle', direccion: 'Medellín, Colombia', presupuesto_total: 8240000, fecha_inicio: '2023-11-01', estado: 'activa' },
      { id: '3', nombre: 'Horizon Res.', direccion: 'Envigado, Ant.', presupuesto_total: 3120000, fecha_inicio: '2023-06-20', estado: 'activa' },
      { id: '4', nombre: 'Logístico S.J.', direccion: 'Rionegro, Col.', presupuesto_total: 12500000, fecha_inicio: '2023-08-15', estado: 'finalizada' },
    ]
  } else {
    const { data, error: fetchError } = await supabase
      .from('obras')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    obras = (data as ObraRow[]) || []
    error = fetchError
  }

  // Mock progress for demo purposes
  const getProgress = (id: string, estado: string) => {
    if (estado === 'finalizada') return 100;
    if (id === '1') return 65;
    if (id === '2') return 32;
    if (id === '3') return 88;
    return Math.floor(Math.random() * 60) + 10;
  }

  const getEjecutado = (total: number | null, progress: number) => {
    if (!total) return 0;
    return (total * progress) / 100;
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-blue-500/30 bg-grid-pattern transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-10 pb-20 relative z-10">
        {/* Header Section */}
        <header className="pt-16 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/20 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-apple-blue fill-apple-blue" />
                <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Gestión de Proyectos</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/5 flex items-center gap-1.5">
                <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">
                  Activas: {obras.filter(o => o.estado === 'activa').length}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[0.9]">
                Mis Obras<span className="text-apple-blue">.</span>
              </h1>
              <p className="text-lg text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
                Ecosistema centralizado para la orquestación de recursos y control de ejecución física.
              </p>
            </div>
          </div>
          <Link
            href="/obras/nueva"
            className="bg-apple-blue hover:bg-apple-blue-dark text-white px-10 py-5 rounded-full flex items-center gap-4 font-black transition-all shadow-xl shadow-apple-blue/25 group uppercase text-xs tracking-widest"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" strokeWidth={3} />
            <span>NUEVA OBRA</span>
          </Link>
        </header>

        {/* Global Error State */}
        {error && (
          <div className="mb-8 p-6 glass rounded-[2rem] border-red-500/20 text-red-500 flex items-center gap-4 animate-shake">
            <AlertCircle className="w-6 h-6" />
            <p className="font-black text-sm uppercase tracking-tight">{error.message}</p>
          </div>
        )}

        {/* Obras Grid */}
        {obras.length === 0 ? (
          <div className="py-32 text-center glass rounded-[3rem] border border-apple-gray-100 dark:border-white/5">
            <div className="size-20 rounded-full bg-apple-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-8">
              <Building2 className="w-10 h-10 text-apple-gray-300 dark:text-white/10" />
            </div>
            <h3 className="text-3xl font-black font-display uppercase mb-2">Vacío Estratégico</h3>
            <p className="text-apple-gray-400 font-medium mb-10 max-w-sm mx-auto">No hay unidades operativas registradas. Comienza la expansión ahora.</p>
            <Link href="/obras/nueva" className="bg-apple-blue text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
              Crear Obra
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            {obras.map((obra) => {
              const progress = getProgress(obra.id, obra.estado);
              const ejecutado = getEjecutado(obra.presupuesto_total, progress);
              const isFinalizada = obra.estado === 'finalizada';

              return (
                <div key={obra.id} className={cn(
                  "glass p-7 aspect-square flex flex-col justify-between group rounded-[2.25rem] border border-apple-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl transition-all duration-500 relative overflow-hidden",
                  isFinalizada && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                )}>
                  <div className="absolute top-0 right-0 w-32 h-full bg-apple-blue/[0.01] -skew-x-12 translate-x-12 pointer-events-none" />

                  {/* Top: Branding & Status */}
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="size-12 bg-apple-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center border border-apple-gray-200 dark:border-white/10 group-hover:border-apple-blue transition-colors duration-500">
                        <Building2 className="w-6 h-6 text-apple-gray-400 group-hover:text-apple-blue transition-colors" />
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border transition-all shadow-sm",
                        obra.estado === 'activa' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          obra.estado === 'pausada' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                            "bg-apple-gray-100 text-apple-gray-400 border-apple-gray-200"
                      )}>
                        {obra.estado}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className={cn(
                        "text-2xl font-black font-display uppercase tracking-tight leading-tight transition-colors",
                        isFinalizada ? "text-apple-gray-400" : "text-foreground group-hover:text-apple-blue"
                      )}>
                        {obra.nombre}
                      </h3>
                      <div className="flex items-center gap-2 text-apple-gray-400 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-wider">{obra.direccion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Progress & Financials */}
                  <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-apple-gray-400 uppercase tracking-widest">Ejecución Física</p>
                          <div className="size-1 rounded-full bg-apple-blue animate-pulse"></div>
                        </div>
                        <span className={cn(
                          "text-3xl font-black font-display tracking-tight transition-colors",
                          isFinalizada ? "text-apple-gray-400" : "text-apple-blue"
                        )}>
                          {progress}<span className="text-lg">%</span>
                        </span>
                      </div>
                      <div className="h-3 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-apple-gray-200 dark:border-white/5">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-out relative",
                            isFinalizada ? "bg-apple-gray-300" : "bg-apple-blue shadow-[0_0_10px_rgba(43,75,238,0.3)]"
                          )}
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>

                    {/* Financial Boxes */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-apple-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-apple-gray-100 dark:border-white/5">
                        <p className="text-[8px] font-black text-apple-gray-400 uppercase tracking-widest mb-1.5">Certificado</p>
                        <p className={cn(
                          "text-base font-black font-display text-foreground tracking-tight",
                          isFinalizada && "text-apple-gray-500"
                        )}>
                          {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(ejecutado)}
                        </p>
                      </div>
                      <div className="bg-apple-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-apple-gray-100 dark:border-white/5">
                        <p className="text-[8px] font-black text-apple-gray-400 uppercase tracking-widest mb-1.5">Capacidad</p>
                        <p className={cn(
                          "text-base font-black font-display text-foreground tracking-tight",
                          isFinalizada && "text-apple-gray-500"
                        )}>
                          {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(obra.presupuesto_total || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Action Link */}
                  <Link
                    href={`/obras/${obra.id}`}
                    className="pt-6 border-t border-apple-gray-100 dark:border-white/5 flex items-center justify-between group/link relative z-10"
                  >
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.25em] transition-all",
                      isFinalizada ? "text-apple-gray-400" : "text-apple-blue group-hover:tracking-[0.3em]"
                    )}>
                      Sumergirse en Datos
                    </span>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                      isFinalizada ? "bg-apple-gray-100 text-apple-gray-400" : "bg-apple-blue/5 text-apple-blue group-hover/link:bg-apple-blue group-hover/link:text-white group-hover/link:shadow-lg group-hover/link:shadow-apple-blue/20"
                    )}>
                      <ChevronRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Pagination */}
      <footer className="mt-8 px-10 py-12 flex flex-col md:flex-row items-center justify-between border-t border-apple-gray-100 dark:border-white/10 glass rounded-t-[3rem] gap-8">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] mb-1">Métricas de Vista</span>
            <span className="text-base font-black text-foreground">1 - {obras.length} <span className="text-apple-gray-400 font-medium ml-2 uppercase text-[10px] tracking-widest">de {obras.length + 20} Unidades Operativas</span></span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-14 h-14 flex items-center justify-center rounded-full glass border border-apple-gray-100 dark:border-white/5 text-apple-gray-400 hover:text-apple-blue transition-all">
            <ChevronRight className="w-7 h-7 rotate-180" />
          </button>
          {[1, 2, 3].map(page => (
            <button
              key={page}
              className={cn(
                "w-14 h-14 flex items-center justify-center rounded-full font-black transition-all text-sm",
                page === 1 ? "bg-apple-blue text-white shadow-xl shadow-apple-blue/25 scale-110" : "glass border border-apple-gray-100 dark:border-white/5 text-apple-gray-500 hover:text-foreground"
              )}
            >
              {page}
            </button>
          ))}
          <button className="w-14 h-14 flex items-center justify-center rounded-full glass border border-apple-gray-100 dark:border-white/5 text-apple-gray-400 hover:text-apple-blue transition-all">
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </footer>
    </div>
  )
}
