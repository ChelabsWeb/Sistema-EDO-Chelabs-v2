import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { UserRole } from '@/types/database'
import { getPlantillaWithDetails } from '@/app/actions/plantillas'
import { formatPesos } from '@/lib/utils/currency'
import {
  ArrowLeft, Edit3, Layers, Boxes, Package,
  Users, User, Star, Zap, ChevronRight,
  LayoutGrid, BookOpen, Clock, Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PlantillaDetailPage({ params }: PageProps) {
  const { id } = await params
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
    .select('rol, id')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole; id: string } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    redirect('/dashboard?error=no_autorizado')
  }

  // Get plantilla details
  const plantillaResult = await getPlantillaWithDetails(id)

  if (!plantillaResult.success || !plantillaResult.data) {
    notFound()
  }

  const plantilla = plantillaResult.data
  const canEdit = currentProfile.rol === 'admin' ||
    (!plantilla.es_sistema && plantilla.created_by === currentProfile.id)

  // Group insumos by type
  const materiales = plantilla.insumos?.filter(i => i.tipo === 'material') || []
  const manoDeObra = plantilla.insumos?.filter(i => i.tipo === 'mano_de_obra') || []

  return (
    <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-6 md:p-14 max-w-5xl mx-auto space-y-12 antialiased animate-apple-fade-in">
      {/* Navigation & Actions */}
      <nav className="flex items-center justify-between mb-8 animate-apple-fade-in">
        <div className="flex items-center gap-6">
          <Link
            href="/admin/plantillas"
            className="w-12 h-12 glass dark:glass-dark rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
          >
            <ArrowLeft className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue" />
          </Link>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-[10px] font-black text-apple-gray-200 uppercase tracking-[0.2em]">
              <BookOpen className="w-3 h-3" />
              Biblioteca de Rubros / Detalle
            </div>
          </div>
        </div>

        {canEdit && (
          <Link
            href={`/admin/plantillas/${plantilla.id}/editar`}
            className="px-8 py-3.5 bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-foreground hover:bg-apple-blue hover:text-white hover:border-apple-blue transition-all shadow-apple-sm flex items-center gap-2 group"
          >
            <Edit3 className="w-4 h-4 transition-transform group-hover:-rotate-12" />
            Editar Plantilla
          </Link>
        )}
      </nav>

      {/* Main Spec Card */}
      <main className="space-y-10">
        <header className="relative bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-float border border-apple-gray-100 dark:border-white/[0.05] overflow-hidden animate-apple-slide-up">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple-blue/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="p-10 md:p-16 flex flex-col md:flex-row gap-12 items-start md:items-center relative z-10">
            <div className={cn(
              "w-32 h-32 rounded-[40px] flex items-center justify-center shadow-lg transition-transform duration-700 hover:scale-105",
              plantilla.es_sistema ? "bg-indigo-500/10 text-indigo-500" : "bg-emerald-500/10 text-emerald-500"
            )}>
              <Layers className="w-16 h-16" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase leading-[1.1]">
                  {plantilla.nombre}
                </h1>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-apple-sm",
                  plantilla.es_sistema ? "bg-indigo-50/50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
                    : "bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                )}>
                  {plantilla.es_sistema ? 'Sistema Master' : 'Personal Custom'}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-apple-gray-50 dark:bg-black/20 rounded-xl border border-apple-gray-100 dark:border-white/5">
                  <Tag className="w-4 h-4 text-apple-blue" />
                  <span className="text-sm font-black text-apple-gray-400 uppercase tracking-widest leading-none pt-0.5">UNIDAD: {plantilla.unidad}</span>
                </div>
                {plantilla.creador && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-apple-gray-100 flex items-center justify-center"><User className="w-3.5 h-3.5 text-apple-gray-300" /></div>
                    <span className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest">por {plantilla.creador.nombre}</span>
                  </div>
                )}
              </div>

              {plantilla.descripcion && (
                <p className="text-lg font-medium text-apple-gray-400 max-w-2xl leading-relaxed">
                  "{plantilla.descripcion}"
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[40px] border border-apple-gray-100 dark:border-white/5 shadow-apple-sm flex items-center justify-between group">
            <div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Insumos Totales</p>
              <h4 className="text-4xl font-black text-foreground tracking-tighter">{plantilla.insumos?.length || 0}</h4>
            </div>
            <div className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform"><Boxes className="w-8 h-8" /></div>
          </div>

          <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[40px] border border-apple-gray-100 dark:border-white/5 shadow-apple-sm flex items-center justify-between group">
            <div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Materiales</p>
              <h4 className="text-4xl font-black text-indigo-500 tracking-tighter">{materiales.length}</h4>
            </div>
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Package className="w-8 h-8" /></div>
          </div>

          <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[40px] border border-apple-gray-100 dark:border-white/5 shadow-apple-sm flex items-center justify-between group">
            <div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Labor / MO</p>
              <h4 className="text-4xl font-black text-emerald-500 tracking-tighter">{manoDeObra.length}</h4>
            </div>
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><Users className="w-8 h-8" /></div>
          </div>
        </div>

        {/* Detailed List */}
        <section className="bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-lg border border-apple-gray-100 dark:border-white/[0.05] overflow-hidden">
          <div className="p-10 border-b border-apple-gray-50 dark:border-white/[0.05] flex items-center justify-between bg-apple-gray-50/50 dark:bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center shadow-lg text-white"><LayoutGrid className="w-6 h-6" /></div>
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Estructura del Rubro</h3>
                <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Precarga Automática de Insumos</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white dark:bg-apple-gray-50 rounded-2xl border border-apple-gray-100 dark:border-white/10 shadow-sm">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Acción de Alta Velocidad</span>
            </div>
          </div>

          <div className="p-10 space-y-12">
            {(!plantilla.insumos || plantilla.insumos.length === 0) ? (
              <div className="py-20 text-center space-y-4">
                <Boxes className="w-16 h-16 text-apple-gray-100 mx-auto" strokeWidth={1} />
                <p className="text-apple-gray-300 font-bold uppercase tracking-widest text-sm">Esta plantilla no define insumos base</p>
              </div>
            ) : (
              <div className="space-y-16">
                {/* Materials */}
                {materiales.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      <h4 className="text-xs font-black text-apple-gray-300 uppercase tracking-[0.2em]">Materiales de Base ({materiales.length})</h4>
                    </div>
                    <div className="grid gap-4">
                      {materiales.map((insumo) => (
                        <div key={insumo.id} className="flex items-center justify-between p-6 bg-apple-gray-50/50 dark:bg-black/10 rounded-3xl border border-apple-gray-100 dark:border-white/5 hover:border-apple-blue/20 transition-all duration-300 group">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
                              <Package className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[15px] font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors uppercase">{insumo.nombre}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">
                                <span>Referencia:</span>
                                <span className="px-1.5 py-0.5 bg-white dark:bg-white/5 rounded border border-current/10">{insumo.unidad}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] mb-1 leading-none">Precio Estimado</p>
                            <p className="text-xl font-black text-foreground tracking-tighter">{insumo.precio_referencia ? formatPesos(insumo.precio_referencia) : '-'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Labor */}
                {manoDeObra.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <h4 className="text-xs font-black text-apple-gray-300 uppercase tracking-[0.2em]">Mano de Obra Especializada ({manoDeObra.length})</h4>
                    </div>
                    <div className="grid gap-4">
                      {manoDeObra.map((insumo) => (
                        <div key={insumo.id} className="flex items-center justify-between p-6 bg-apple-gray-50/50 dark:bg-black/10 rounded-3xl border border-apple-gray-100 dark:border-white/5 hover:border-apple-blue/20 transition-all duration-300 group">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                              <Users className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[15px] font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors uppercase">{insumo.nombre}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">
                                <span>Calculado por:</span>
                                <span className="px-1.5 py-0.5 bg-white dark:bg-white/5 rounded border border-current/10">{insumo.unidad}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] mb-1 leading-none">Tarifa REF</p>
                            <p className="text-xl font-black text-foreground tracking-tighter">{insumo.precio_referencia ? formatPesos(insumo.precio_referencia) : '-'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-8 bg-apple-gray-50/30 dark:bg-white/[0.01] border-t border-apple-gray-50 dark:border-white/[0.05] text-center">
            <p className="text-[10px] font-black text-apple-gray-200 uppercase tracking-[0.4em]">Ficha Técnica Codificada • Chelabs EDO v2.0</p>
          </div>
        </section>
      </main>

      {/* Action Footer */}
      <footer className="mt-12 flex justify-center">
        <Link href="/admin/plantillas" className="flex items-center gap-3 px-10 py-5 glass dark:glass-dark rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300 hover:text-apple-blue transition-all active:scale-95 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver a la Biblioteca
        </Link>
      </footer>
    </div>
  )
}
