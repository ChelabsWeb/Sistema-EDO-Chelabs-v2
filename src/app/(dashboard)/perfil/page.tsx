import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Usuario } from '@/types/database'
import { ProfileSettings } from '@/components/edo/perfil/profile-settings'
import { Sparkles, Calendar } from 'lucide-react'

export default async function PerfilPage() {
  const supabase = await createClient()
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  let user = null
  let userProfile: Usuario | null = null

  if (isDemo) {
    user = { email: 'demo@chelabs.com' }
    userProfile = {
      id: 'demo-1',
      nombre: 'Administrador Demo',
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
    <div className="min-h-screen bg-grid-pattern transition-all duration-500 overflow-x-hidden">
      <div className="max-w-[1500px] mx-auto space-y-16 py-12 px-6 md:px-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-apple-blue fill-apple-blue" />
                <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Preferencia del Sistema</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-apple-gray-400" />
                <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">
                  ÚLTIMA ACTUALIZACIÓN: HOY
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[0.9]">
                Ajustes<span className="text-apple-blue">.</span>
              </h1>
              <p className="text-lg text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
                Personaliza tu experiencia, gestiona tu identidad y refuerza la seguridad de tu acceso.
              </p>
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
    </div>
  )
}
