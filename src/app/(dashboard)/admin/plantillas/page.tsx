import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { UserRole } from '@/types/database'
import { getPlantillasRubros } from '@/app/actions/plantillas'
import {
  Plus, Boxes, LayoutGrid, Sparkles, BookOpen,
  Search, Filter, ChevronRight, Layers, User,
  Info, Zap, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function PlantillasPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check role - only admin and director_obra can access
  const { data: currentProfile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    redirect('/dashboard?error=no_autorizado')
  }

  // Get plantillas
  const plantillasResult = await getPlantillasRubros()
  const plantillas = plantillasResult.success ? plantillasResult.data || [] : []

  // Separate system and personal templates
  const plantillasSistema = plantillas.filter(p => p.es_sistema)
  const plantillasPersonales = plantillas.filter(p => !p.es_sistema)

  return (
    <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-6 md:p-14 max-w-7xl mx-auto space-y-12 antialiased animate-apple-fade-in">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-30 -mx-4 md:-mx-8 px-8 md:px-12 py-10 backdrop-blur-xl bg-white/70 dark:bg-apple-gray-50/70 border-b border-apple-gray-100 dark:border-white/5 rounded-b-[48px] shadow-apple-sm transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-apple-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-apple-sm">
              Biblioteca Técnica
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-white/5 rounded-full border border-apple-gray-100 dark:border-white/10 shadow-apple-sm">
              <Boxes className="w-3.5 h-3.5 text-apple-gray-300" />
              <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">{plantillas.length} Unidades</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-[-0.04em] leading-[0.9]">
            Plantillas<span className="text-apple-blue">.</span>
          </h1>
          <p className="text-xl text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
            Estandarización de rubros y configuraciones maestras de obra.
          </p>
        </div>

        {currentProfile.rol === 'admin' && (
          <Link
            href="/admin/plantillas/nueva"
            className="px-10 py-5 bg-apple-blue text-white rounded-[24px] font-black text-xs uppercase tracking-[0.15em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.95] flex items-center justify-center gap-3 group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Nueva Plantilla
          </Link>
        )}
      </header>

      {/* Hero Info Box */}
      <section className="animate-apple-slide-up">
        <div className="p-10 bg-gradient-to-br from-apple-blue to-indigo-600 rounded-[48px] shadow-apple-float text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[28px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-700">
              <Zap className="w-10 h-10 text-white fill-current" />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h3 className="text-3xl font-black tracking-tight leading-none">Acelera tu Presupuestación</h3>
              <p className="text-lg font-medium text-white/80 max-w-xl">
                Al crear un rubro, selecciona una plantilla para precargar materiales y mano de obra. Optimiza el tiempo de carga y reduce errores.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4 px-8 py-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <Info className="w-5 h-5 text-white/60" />
              <span className="text-[10px] font-black uppercase tracking-widest">Guía de Uso Integrada</span>
            </div>
          </div>
        </div>
      </section>

      {/* System Templates Row */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shadow-sm">
              <Star className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Estandar del Sistema</h2>
          </div>
          <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">{plantillasSistema.length} Master Items</span>
        </div>

        {plantillasSistema.length === 0 ? (
          <div className="py-20 glass dark:glass-dark rounded-[40px] text-center space-y-4 border border-apple-gray-100 dark:border-white/5 animate-apple-fade-in shadow-apple-sm">
            <Boxes className="w-12 h-12 text-apple-gray-100 mx-auto" />
            <p className="text-apple-gray-400 font-bold uppercase tracking-widest text-xs">No hay plantillas de sistema registradas</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plantillasSistema.map((plantilla) => (
              <PlantillaCard key={plantilla.id} plantilla={plantilla} />
            ))}
          </div>
        )}
      </section>

      {/* User Templates Row */}
      <section className="space-y-8 pt-10 border-t border-apple-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Mis Plantillas</h2>
          </div>
          <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">{plantillasPersonales.length} Personal Items</span>
        </div>

        {plantillasPersonales.length === 0 ? (
          <div className="py-24 bg-white/50 dark:bg-white/[0.02] rounded-[48px] text-center space-y-6 border border-apple-gray-100 dark:border-white/5 shadow-inner">
            <div className="w-20 h-20 bg-apple-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <BookOpen className="w-8 h-8 text-apple-gray-200" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-foreground">Tu catálogo personal está vacío</h4>
              <p className="text-sm font-medium text-apple-gray-400 max-w-sm mx-auto">
                Puedes guardar rubros de tus obras como plantillas personales desde el dashboard de proyecto.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plantillasPersonales.map((plantilla) => (
              <PlantillaCard key={plantilla.id} plantilla={plantilla} isPersonal />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function PlantillaCard({ plantilla, isPersonal }: { plantilla: any, isPersonal?: boolean }) {
  return (
    <Link href={`/admin/plantillas/${plantilla.id}`} className="group block h-full">
      <div className="h-full bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/[0.05] rounded-[40px] p-8 shadow-apple hover:shadow-apple-float hover:border-apple-blue/30 transition-all duration-700 relative overflow-hidden flex flex-col">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-8">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-sm",
              isPersonal ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500"
            )}>
              <Layers className="w-7 h-7" />
            </div>
            <div className={cn(
              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-apple-sm",
              isPersonal ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
            )}>
              {isPersonal ? 'Personal' : 'Sistema'}
            </div>
          </div>

          <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors duration-500 mb-3 leading-tight uppercase line-clamp-2">
            {plantilla.nombre}
          </h3>

          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 bg-apple-gray-50 dark:bg-black/20 rounded-lg text-[10px] font-black text-apple-gray-400 uppercase tracking-widest border border-apple-gray-100 dark:border-white/5">
              U. {plantilla.unidad}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-apple-gray-300 uppercase tracking-widest">
              <Boxes className="w-3.5 h-3.5" />
              {plantilla.insumos?.length || 0} Insumos
            </div>
          </div>

          {plantilla.descripcion && (
            <p className="text-sm font-medium text-apple-gray-400 line-clamp-3 mb-8 flex-1 leading-relaxed">
              {plantilla.descripcion}
            </p>
          )}

          <div className="pt-6 border-t border-apple-gray-100 dark:border-white/5 flex items-center justify-between mt-auto">
            <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
              Ver Ficha Técnica
            </span>
            <div className="w-10 h-10 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-apple-blue group-hover:text-white transition-all duration-500">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Subtle Decorative Gradient */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
          isPersonal ? "bg-gradient-to-br from-emerald-500/5 to-transparent" : "bg-gradient-to-br from-apple-blue/5 to-transparent"
        )} />
      </div>
    </Link>
  )
}
