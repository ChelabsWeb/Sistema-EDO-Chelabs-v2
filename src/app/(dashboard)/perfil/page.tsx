import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Usuario } from '@/types/database'
import { getRoleDisplayName } from '@/lib/roles'
import { User, Mail, Shield, Building2, Calendar, LogOut, LayoutGrid, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function PerfilPage() {
  const supabase = await createClient()
  const isDemo = process.env.DEMO_MODE === 'true'

  let user = null
  let userProfile: Usuario | null = null

  if (isDemo) {
    user = { email: 'demo@chelabs.com' }
    userProfile = {
      id: 'demo-1',
      nombre: 'Administrador de Pruebas',
      email: 'demo@chelabs.com',
      rol: 'admin',
      activo: true,
      created_at: '2023-01-01T00:00:00Z',
      auth_user_id: 'demo-auth-1',
      obra_id: null,
      updated_at: '2023-01-01T00:00:00Z'
    } as Usuario
  } else {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/auth/login')
    user = authUser

    const { data: profile } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    userProfile = profile as Usuario | null
  }

  const roleStyles: Record<string, string> = {
    admin: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    director_obra: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    jefe_obra: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    compras: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  }

  return (
    <div className="p-8 md:p-14 max-w-4xl mx-auto space-y-12 animate-apple-fade-in antialiased">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-apple-gray-100 dark:border-white/5">
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tighter leading-[1.1]">
            Mi Perfil
          </h1>
          <p className="text-xl text-apple-gray-400 mt-4 font-medium tracking-tight">
            Información de acceso e identidad en el sistema.
          </p>
        </div>
        {isDemo && (
          <div className="px-4 py-1.5 bg-apple-blue/10 text-apple-blue text-[11px] font-black uppercase tracking-widest rounded-full border border-apple-blue/20">
            Modo Demostración
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Identity Card */}
        <aside className="lg:col-span-1">
          <Card className="rounded-[40px] overflow-hidden border border-apple-gray-100 dark:border-white/5 shadow-apple-float bg-white dark:bg-apple-gray-50">
            <CardContent className="p-8 text-center space-y-6">
              <div className="relative w-28 h-28 mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-apple-blue to-indigo-400 rounded-[34px] blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative w-28 h-28 bg-apple-blue rounded-[32px] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-[1.05] transition-transform duration-500 active:scale-95">
                  <span className="text-white font-black text-4xl">
                    {userProfile?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-none pt-2">
                  {userProfile?.nombre || 'Usuario Registrado'}
                </h2>
                <div className="flex items-center justify-center gap-1.5 text-apple-gray-400 font-medium text-sm">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <span className={cn(
                  "inline-flex px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border mx-auto",
                  roleStyles[userProfile?.rol || ''] || roleStyles.jefe_obra
                )}>
                  {getRoleDisplayName(userProfile?.rol ?? null)}
                </span>
                <div className="flex items-center justify-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cuenta Activa
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Right: Details & Actions */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[40px] border border-apple-gray-100 dark:border-white/5 shadow-apple bg-white dark:bg-apple-gray-50 overflow-hidden">
            <CardContent className="p-0 divide-y divide-apple-gray-50 dark:divide-white/5">
              {/* Account Details */}
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-1">
                      <Shield className="w-3 h-3" />
                      Rol de Sistema
                    </label>
                    <p className="text-lg font-bold text-foreground pl-1">
                      {getRoleDisplayName(userProfile?.rol ?? null)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-1">
                      <Calendar className="w-3 h-3" />
                      Fecha de Registro
                    </label>
                    <p className="text-lg font-bold text-foreground pl-1">
                      {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('es-UY', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {userProfile?.obra_id && (
                  <div className="space-y-3 p-6 bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-[28px] border border-apple-gray-100 dark:border-white/5">
                    <label className="flex items-center gap-2 text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-1">
                      <Building2 className="w-3 h-3 text-apple-blue" />
                      Obra Asignada
                    </label>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-extrabold text-foreground pl-1">ID: {userProfile.obra_id}</p>
                      <Link href={`/obras/${userProfile.obra_id}`} className="text-apple-blue text-sm font-bold hover:underline">Ver Obra →</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Actions */}
              <div className="p-10 bg-apple-gray-50/20 dark:bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] mb-6">Seguridad y Sesión</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isDemo ? (
                    <Link
                      href="/auth/login"
                      className="flex-1 flex items-center justify-center gap-2 px-8 py-5 bg-red-500/10 text-red-600 rounded-[20px] font-bold text-lg hover:bg-red-500 hover:text-white transition-all active:scale-[0.97] border border-red-500/10 group"
                    >
                      <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      Salir del Modo Demo
                    </Link>
                  ) : (
                    <form action="/api/auth/signout" method="post" className="flex-1">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-red-500/10 text-red-600 rounded-[20px] font-bold text-lg hover:bg-red-500 hover:text-white transition-all active:scale-[0.97] border border-red-500/10 group"
                      >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Cerrar Sesión
                      </button>
                    </form>
                  )}

                  <button className="flex-1 px-8 py-5 bg-apple-gray-100 dark:bg-white/5 text-foreground rounded-[20px] font-bold text-lg hover:bg-apple-gray-200 dark:hover:bg-white/10 transition-all active:scale-[0.97] border border-apple-gray-200 dark:border-white/10">
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Info */}
          <div className="p-8 bg-apple-gray-50/30 dark:bg-white/[0.02] rounded-[32px] border border-apple-gray-100 dark:border-white/5 flex items-start gap-5">
            <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center shrink-0">
              <LayoutGrid className="w-6 h-6 text-apple-blue" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-foreground">Soporte del Sistema</h4>
              <p className="text-sm font-medium text-apple-gray-400 leading-relaxed">
                ¿Necesitas cambiar tu rol o permisos asignados? Ponte en contacto con el administrador del sistema para solicitar modificaciones en tu perfil operativo.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
