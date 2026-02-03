import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Usuario } from '@/types/database'
import { ProfileSettings } from '@/components/edo/perfil/profile-settings'

export default async function PerfilPage() {
  const supabase = await createClient()
  const isDemo = process.env.DEMO_MODE === 'true'

  let user = null
  let userProfile: Usuario | null = null

  if (isDemo) {
    user = { email: 'demo@chelabs.com' }
    userProfile = {
      id: 'demo-1',
      nombre: 'Usuario Demo',
      email: 'demo@chelabs.com',
      rol: 'admin',
      activo: true,
      created_at: '2024-01-01T00:00:00Z',
      auth_user_id: 'demo-auth-1',
      obra_id: null,
      updated_at: '2024-01-01T00:00:00Z'
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

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black p-6 md:p-14 antialiased selection:bg-apple-blue/10">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-apple-fade-in pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1 bg-apple-blue/10 text-apple-blue text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-apple-blue/10">
              Sistema EDO v2.0
            </div>
            <div className="w-1 h-1 rounded-full bg-apple-gray-100" />
            <span className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest">Ajustes Globales</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-[-0.04em] leading-[0.9]">
            Configuración<span className="text-apple-blue">.</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-4 text-right">
          <div>
            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em]">Última Sincronización</p>
            <p className="text-sm font-bold text-foreground">Hoy, 20:55 PM</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <ProfileSettings
          user={user}
          userProfile={userProfile}
          isDemo={isDemo}
        />
      </main>
    </div>
  )
}
