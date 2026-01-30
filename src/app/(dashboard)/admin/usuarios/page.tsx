import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Usuario, UserRole } from '@/types/database'
import { getRoleDisplayName } from '@/lib/roles'
import { Users, UserPlus, Shield, ChevronRight, CheckCircle2, XCircle, Mail, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const isDemo = process.env.DEMO_MODE === 'true'

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
    director_obra: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    jefe_obra: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    compras: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  }

  return (
    <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-6 md:p-14 max-w-7xl mx-auto space-y-12 antialiased">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-30 -mx-4 md:-mx-8 px-8 md:px-12 py-10 backdrop-blur-xl bg-white/70 dark:bg-apple-gray-50/70 border-b border-apple-gray-100 dark:border-white/5 rounded-b-[48px] shadow-apple-sm transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-apple-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-apple-sm">
              Administración
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-white/5 rounded-full border border-apple-gray-100 dark:border-white/10 shadow-apple-sm">
              <Users className="w-3.5 h-3.5 text-apple-gray-300" />
              <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">{userList.length} Miembros</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-[-0.04em] leading-[0.9]">
            Usuarios<span className="text-apple-blue">.</span>
          </h1>
          <p className="text-xl text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
            Gestión centralizada de accesos, roles y permisos del equipo.
          </p>
        </div>

        <Link
          href="/admin/usuarios/nuevo"
          className="px-10 py-5 bg-apple-blue text-white rounded-[24px] font-black text-xs uppercase tracking-[0.15em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.95] flex items-center justify-center gap-3 group"
        >
          <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
          Registrar Usuario
        </Link>
      </header>

      {/* Content Area */}
      <main className="pt-8">
        {error && (
          <div className="p-8 glass dark:glass-dark border border-red-500/20 rounded-[32px] text-red-600 dark:text-red-400 font-bold mb-12 flex items-center gap-4 animate-apple-slide-up shadow-apple-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Error de Datos</p>
              <p className="text-xs font-medium opacity-80">{error.message}</p>
            </div>
          </div>
        )}

        {userList.length === 0 ? (
          <div className="text-center py-40 bg-white dark:bg-apple-gray-50 rounded-[64px] border border-apple-gray-100 dark:border-white/5 shadow-apple-float animate-apple-fade-in group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-apple-blue/[0.02] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-32 h-32 bg-apple-gray-50 dark:bg-white/5 rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Users className="w-16 h-16 text-apple-gray-200" />
              </div>
              <h3 className="text-4xl font-black text-foreground tracking-tighter mb-4 leading-none">No hay usuarios</h3>
              <p className="text-xl text-apple-gray-400 font-medium mb-12 max-w-md mx-auto leading-relaxed">
                Parece que eres el único aquí. Invita a tu equipo para empezar a colaborar.
              </p>
              <Link
                href="/admin/usuarios/nuevo"
                className="inline-flex items-center gap-3 px-12 py-6 bg-apple-blue text-white text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.95]"
              >
                Registrar primer usuario
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 animate-apple-slide-up">
            {userList.map((usuario) => (
              <Link key={usuario.id} href={`/admin/usuarios/${usuario.id}`} className="block group">
                <div className="bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group-hover:shadow-apple-lg group-hover:-translate-y-1 group-hover:border-apple-blue/20 transition-all duration-500">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-apple-blue to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-500">
                        <span className="text-white font-black text-2xl tracking-tighter">
                          {usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </span>
                      </div>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-[3px] border-white dark:border-apple-gray-50 flex items-center justify-center",
                        usuario.activo ? "bg-emerald-500" : "bg-apple-gray-200"
                      )}>
                        {usuario.activo ? <CheckCircle2 className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors outline-none">
                          {usuario.nombre}
                        </h3>
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                          roleStyles[usuario.rol] || roleStyles.jefe_obra
                        )}>
                          {getRoleDisplayName(usuario.rol)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-apple-gray-400">
                          <Mail className="w-3.5 h-3.5 opacity-50" />
                          {usuario.email}
                        </div>
                        <div className="h-1 w-1 rounded-full bg-apple-gray-200" />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-apple-gray-400">
                          <Calendar className="w-3.5 h-3.5 opacity-50" />
                          Desde {new Date(usuario.created_at).toLocaleDateString('es-UY', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden lg:flex flex-col items-end">
                      <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Nivel de Acceso</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4].map(i => (
                          <Shield key={i} className={cn(
                            "w-3 h-3",
                            i <= (usuario.rol === 'admin' ? 4 : usuario.rol === 'director_obra' ? 3 : 2)
                              ? "text-apple-blue" : "text-apple-gray-100"
                          )} fill="currentColor" />
                        ))}
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-apple-blue group-hover:text-white transition-all duration-500">
                      <ChevronRight className="w-6 h-6" />
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
