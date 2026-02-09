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
    <div className="max-w-7xl mx-auto space-y-12 antialiased pb-20">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-30 pt-4 pb-12 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-600/20">
              Gestión de Proyectos
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Activos: {obras.filter(o => o.estado === 'activa').length}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-[-0.04em] leading-[0.9]">
            Mis Obras<span className="text-blue-500">.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium tracking-tight max-w-xl leading-relaxed">
            Central de operaciones de construcción y control presupuestario.
          </p>
        </div>

        <Link
          href="/obras/nueva"
          className="px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Nueva Obra
        </Link>
      </header>

      {/* Main Content Arena */}
      <main className="pt-8">
        {error && (
          <div className="p-8 bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-[32px] text-red-400 font-bold mb-12 flex items-center gap-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-red-500">Error de Sincronización</p>
              <p className="text-xs font-medium opacity-80">{error.message}</p>
            </div>
          </div>
        )}

        {obras.length === 0 ? (
          <div className="text-center py-40 bg-white/[0.03] backdrop-blur-xl rounded-[64px] border border-white/5 shadow-2xl animate-apple-fade-in group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-32 h-32 bg-white/5 rounded-[48px] flex items-center justify-center mx-auto mb-10 border border-white/5 group-hover:scale-110 transition-transform duration-700">
                <Building2 className="w-16 h-16 text-slate-700" />
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter mb-4 leading-none">Tu portafolio está vacío</h3>
              <p className="text-xl text-slate-400 font-medium mb-12 max-w-md mx-auto leading-relaxed">
                Es el momento de iniciar tu próxima gran construcción. Da el primer paso hoy.
              </p>
              <Link
                href="/obras/nueva"
                className="inline-flex items-center gap-3 px-12 py-6 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-blue-500 transition-all shadow-xl active:scale-[0.95]"
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
                <div className="h-full relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[48px] shadow-2xl hover:border-blue-500/30 hover:-translate-y-3 transition-all duration-700 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="p-10 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center transition-all duration-700 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                        <Building2 className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-500" />
                      </div>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg",
                        obra.estado === 'activa' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          obra.estado === 'pausada' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-white/5 text-slate-500 border-white/5 shadow-none"
                      )}>
                        {obra.estado}
                      </div>
                    </div>

                    <h3 className="text-3xl font-black text-white tracking-[-0.04em] leading-[1.1] mb-6 group-hover:text-blue-400 transition-colors duration-500 uppercase line-clamp-2">
                      {obra.nombre}
                    </h3>

                    <div className="space-y-5 mb-12 flex-1">
                      {obra.direccion && (
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl group-hover:bg-blue-600/5 transition-colors duration-500">
                          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-sm font-bold text-slate-400 truncate tracking-tight">{obra.direccion}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Inversión</p>
                          <p className="text-xl font-black text-white tracking-tighter">
                            {obra.presupuesto_total
                              ? new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(obra.presupuesto_total)
                              : '-'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Inicio</p>
                          <p className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
                            {obra.fecha_inicio
                              ? new Date(obra.fecha_inicio).toLocaleDateString('es-UY', { month: 'short', year: 'numeric' })
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-white/5 mt-auto">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] group-hover:tracking-[0.25em] transition-all">
                        Ver Dashboard de Obra
                      </span>
                      <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-white/5 group-hover:border-blue-500">
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
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
