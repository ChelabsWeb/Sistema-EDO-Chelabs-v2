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
      { id: '1', nombre: 'Edificio Residencial Las Palmas', direccion: 'Av. Brasil 2520, Montevideo', presupuesto_total: 1250000, fecha_inicio: '2024-01-15', estado: 'activa' },
      { id: '2', nombre: 'Complejo Logístico Ruta 5', direccion: 'Ruta 5 km 20, Canelones', presupuesto_total: 3400000, fecha_inicio: '2023-11-01', estado: 'activa' },
      { id: '3', nombre: 'Torre de Oficinas World Trade', direccion: 'Dr. Luis Bonavita 1294', presupuesto_total: 8900000, fecha_inicio: '2023-06-20', estado: 'pausada' },
      { id: '4', nombre: 'Reforma Hospital Británico', direccion: 'Av. Italia 2420', presupuesto_total: 450000, fecha_inicio: '2024-02-10', estado: 'activa' },
      { id: '5', nombre: 'Urbanización Marinas de Santa Lucía', direccion: 'Ruta 1, km 42', presupuesto_total: 2100000, fecha_inicio: '2023-08-15', estado: 'finalizada' },
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

  return (
    <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-6 md:p-14 max-w-7xl mx-auto space-y-12 antialiased">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-30 -mx-4 md:-mx-8 px-8 md:px-12 py-10 backdrop-blur-xl bg-white/70 dark:bg-apple-gray-50/70 border-b border-apple-gray-100 dark:border-white/5 rounded-b-[48px] shadow-apple-sm transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-apple-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-apple-sm">
              Gestión de Proyectos
            </div>
            <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Activos: {obras.filter(o => o.estado === 'activa').length}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-[-0.04em] leading-[0.9]">
            Mis Obras<span className="text-apple-blue">.</span>
          </h1>
          <p className="text-xl text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
            Central de operaciones de construcción y control presupuestario.
          </p>
        </div>

        <Link
          href="/obras/nueva"
          className="px-10 py-5 bg-apple-blue text-white rounded-[24px] font-black text-xs uppercase tracking-[0.15em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.95] flex items-center justify-center gap-3 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Nueva Obra
        </Link>
      </header>

      {/* Main Content Arena */}
      <main className="pt-8">
        {error && (
          <div className="p-8 glass dark:glass-dark border border-red-500/20 rounded-[32px] text-red-600 dark:text-red-400 font-bold mb-12 flex items-center gap-4 animate-apple-slide-up shadow-apple-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Error de Sincronización</p>
              <p className="text-xs font-medium opacity-80">{error.message}</p>
            </div>
          </div>
        )}

        {obras.length === 0 ? (
          <div className="text-center py-40 bg-white/50 dark:bg-apple-gray-50/50 backdrop-blur-xl rounded-[64px] border border-apple-gray-100 dark:border-white/5 shadow-apple-float animate-apple-fade-in group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-apple-blue/[0.02] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-32 h-32 bg-apple-gray-50 dark:bg-white/5 rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Building2 className="w-16 h-16 text-apple-gray-200" />
              </div>
              <h3 className="text-4xl font-black text-foreground tracking-tighter mb-4 leading-none">Tu portafolio está vacío</h3>
              <p className="text-xl text-apple-gray-400 font-medium mb-12 max-w-md mx-auto leading-relaxed">
                Es el momento de iniciar tu próxima gran construcción. Da el primer paso hoy.
              </p>
              <Link
                href="/obras/nueva"
                className="inline-flex items-center gap-3 px-12 py-6 bg-apple-blue text-white text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.95]"
              >
                Crear primera obra
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 animate-apple-slide-up">
            {obras.map((obra) => (
              <Link key={obra.id} href={`/obras/${obra.id}`} className="block group">
                <div className="h-full relative bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 rounded-[48px] shadow-apple hover:shadow-apple-float hover:-translate-y-3 transition-all duration-700 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="p-10 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-16 h-16 rounded-[24px] bg-apple-gray-50 dark:bg-black/20 flex items-center justify-center transition-all duration-700 group-hover:bg-apple-blue group-hover:shadow-apple-sm">
                        <Building2 className="w-8 h-8 text-apple-blue group-hover:text-white transition-colors duration-500" />
                      </div>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-apple-sm",
                        obra.estado === 'activa' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          obra.estado === 'pausada' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                            "bg-apple-gray-100 dark:bg-white/5 text-apple-gray-400 border-apple-gray-200"
                      )}>
                        {obra.estado}
                      </div>
                    </div>

                    <h3 className="text-3xl font-black text-foreground tracking-[-0.04em] leading-[1.1] mb-6 group-hover:text-apple-blue transition-colors duration-500 uppercase line-clamp-2">
                      {obra.nombre}
                    </h3>

                    <div className="space-y-5 mb-12 flex-1">
                      {obra.direccion && (
                        <div className="flex items-center gap-3 p-3 bg-apple-gray-50/50 dark:bg-black/10 rounded-2xl group-hover:bg-apple-blue/5 transition-colors duration-500">
                          <MapPin className="w-4 h-4 text-apple-blue shrink-0" />
                          <span className="text-sm font-bold text-apple-gray-400 truncate">{obra.direccion}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-apple-gray-100 dark:border-white/5">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest leading-none">Inversión</p>
                          <p className="text-xl font-black text-foreground tracking-tighter">
                            {obra.presupuesto_total
                              ? new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(obra.presupuesto_total)
                              : '-'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest leading-none">Inicio</p>
                          <p className="text-xl font-black text-foreground tracking-tighter flex items-center gap-2">
                            {obra.fecha_inicio
                              ? new Date(obra.fecha_inicio).toLocaleDateString('es-UY', { month: 'short', year: 'numeric' })
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-apple-gray-100 dark:border-white/5 mt-auto">
                      <span className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em] group-hover:tracking-[0.25em] transition-all">
                        Ver Dashboard de Obra
                      </span>
                      <div className="w-10 h-10 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-apple-blue group-hover:text-white transition-all duration-500">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
