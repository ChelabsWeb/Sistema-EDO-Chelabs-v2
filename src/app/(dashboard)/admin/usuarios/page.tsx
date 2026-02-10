import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Usuario, UserRole } from '@/types/database'
import { getRoleDisplayName } from '@/lib/roles'
import { Users, UserPlus, Shield, ChevronRight, CheckCircle2, XCircle, Mail, Calendar, AlertCircle, Search, Filter, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  let user = null
  if (!isDemo) {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/auth/login')
    user = authUser
  }

  // Role check skip in demo mode
  if (!isDemo) {
    const { data: currentProfile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('auth_user_id', user!.id)
      .single() as { data: { rol: UserRole } | null }

    if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
      redirect('/dashboard?error=no_autorizado')
    }
  }

  let userList: Usuario[] = []
  let error = null

  if (isDemo) {
    userList = [
      { id: '1', nombre: 'Juan Pérez', email: 'juan.perez@chelabs.com', rol: 'admin', activo: true, created_at: '2023-01-10', auth_user_id: '1', obra_id: null, updated_at: null },
      { id: '2', nombre: 'María García', email: 'maria.garcia@chelabs.com', rol: 'director_obra', activo: true, created_at: '2023-02-15', auth_user_id: '2', obra_id: null, updated_at: null },
      { id: '3', nombre: 'Carlos Rodríguez', email: 'carlos.rod@chelabs.com', rol: 'jefe_obra', activo: true, created_at: '2023-03-20', auth_user_id: '3', obra_id: null, updated_at: null },
      { id: '4', nombre: 'Ana López', email: 'ana.lopez@chelabs.com', rol: 'compras', activo: false, created_at: '2023-04-25', auth_user_id: '4', obra_id: null, updated_at: null },
      { id: '5', nombre: 'Roberto Silva', email: 'r.silva@chelabs.com', rol: 'jefe_obra', activo: true, created_at: '2023-05-30', auth_user_id: '5', obra_id: null, updated_at: null },
    ]
  } else {
    const { data, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    userList = (data as Usuario[]) || []
    error = fetchError
  }

  const roleStyles: Record<string, string> = {
    admin: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    director_obra: 'bg-apple-blue/10 text-apple-blue dark:text-apple-blue border-apple-blue/20',
    jefe_obra: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    compras: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  }

  return (
    <div className="min-h-screen bg-grid-pattern p-6 md:p-14 max-w-7xl mx-auto space-y-12 antialiased">
      {/* Premium Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/20 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-apple-blue fill-apple-blue" />
              <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Seguridad de Acceso</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-apple-gray-200 dark:border-white/5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-apple-gray-400" />
              <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">
                {userList.length} Miembros Activos
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[0.9]">
              Equipo<span className="text-apple-blue">.</span>
            </h1>
            <p className="text-lg text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
              Administración centralizada de perfiles y niveles de autoridad operativa.
            </p>
          </div>
        </div>

        <Link
          href="/admin/usuarios/nuevo"
          className="flex items-center gap-3 px-10 py-4 rounded-full bg-apple-blue text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-apple-blue/25 hover:bg-apple-blue-dark active:scale-95 transition-all group"
        >
          <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
          Registrar Usuario
        </Link>
      </header>

      {/* Modern Tool Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-300 group-focus-within:text-apple-blue transition-colors" />
          <input
            type="text"
            placeholder="Filtrar por nombre o email..."
            className="w-full h-16 pl-16 pr-8 rounded-[2rem] glass border border-apple-gray-100 dark:border-white/10 text-lg font-bold focus:ring-8 focus:ring-apple-blue/5 outline-none transition-all"
          />
        </div>
        <button className="h-16 px-10 rounded-[2rem] glass border border-apple-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <Filter className="w-5 h-5" />
          Permisos
        </button>
      </div>

      <main>
        {error && (
          <div className="p-8 glass border-red-500/20 text-red-600 dark:text-red-400 font-bold mb-12 flex items-center gap-4 animate-apple-slide-up">
            <AlertCircle className="w-6 h-6" />
            <p className="text-sm font-extrabold uppercase tracking-widest">{error.message}</p>
          </div>
        )}

        {userList.length === 0 ? (
          <div className="text-center py-40 glass rounded-[3rem] animate-apple-fade-in">
            <div className="w-24 h-24 bg-apple-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
              <Users className="w-12 h-12 text-apple-gray-200" />
            </div>
            <h3 className="text-4xl font-black text-foreground tracking-tight mb-4 leading-none uppercase font-display">Sin Miembros</h3>
            <p className="text-xl text-apple-gray-400 font-medium mb-12 max-w-md mx-auto leading-relaxed">
              Comienza a construir tu equipo registrando al primer colaborador administrativo.
            </p>
            <Link
              href="/admin/usuarios/nuevo"
              className="inline-flex items-center gap-3 px-12 py-5 bg-apple-blue text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-apple-blue/25 hover:bg-apple-blue-dark active:scale-95 transition-all"
            >
              Registrar primer usuario
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-apple-slide-up">
            {userList.map((usuario) => (
              <Link key={usuario.id} href={`/admin/usuarios/${usuario.id}`} className="group block">
                <div className="glass p-10 rounded-[3rem] border-apple-gray-100 dark:border-white/5 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-apple-blue/[0.02] -skew-x-12 translate-x-10 pointer-events-none" />

                  <div className="flex justify-between items-start relative z-10">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-apple-blue to-indigo-600 flex items-center justify-center shadow-xl group-hover:scale-105 transition-all duration-500">
                        <span className="text-white font-black text-2xl tracking-tighter">
                          {usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </span>
                      </div>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-[4px] border-white dark:border-[#1a1c1e] flex items-center justify-center",
                        usuario.activo ? "bg-emerald-500" : "bg-slate-300"
                      )}>
                        {usuario.activo && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        roleStyles[usuario.rol] || roleStyles.jefe_obra
                      )}>
                        {getRoleDisplayName(usuario.rol)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors font-display">
                      {usuario.nombre}
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-apple-gray-400">
                      <Mail className="w-4 h-4 opacity-50" />
                      {usuario.email}
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-apple-gray-50 dark:border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" />
                        Diciembre 2023
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <Shield key={i} className={cn(
                          "w-3 h-3",
                          i <= (usuario.rol === 'admin' ? 4 : usuario.rol === 'director_obra' ? 3 : 2)
                            ? "text-apple-blue" : "text-apple-gray-100 dark:text-white/5"
                        )} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                    <ChevronRight className="w-6 h-6 text-apple-blue" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Security Tip */}
      <div className="bg-slate-900 dark:bg-apple-blue/10 p-12 rounded-[3.5rem] text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-apple-blue/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 w-fit border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-apple-blue-light fill-current" />
              <span className="text-[9px] font-black uppercase tracking-widest">Protocolo de Privacidad</span>
            </div>
            <h4 className="text-3xl font-black font-display tracking-tight">Control Robusto de Jerarquías</h4>
            <p className="text-white/60 text-lg font-medium max-w-2xl leading-relaxed">
              El sistema garantiza que cada usuario solo acceda a los módulos críticos bajo su responsabilidad directa, manteniendo la integridad operativa y financiera de la empresa.
            </p>
          </div>
          <Link
            href="/admin/usuarios/nuevo"
            className="w-20 h-20 rounded-[32px] bg-white text-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
          >
            <UserPlus className="w-8 h-8" />
          </Link>
        </div>
      </div>
    </div>
  )
}
