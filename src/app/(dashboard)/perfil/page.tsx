import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Usuario } from '@/types/database'
import { ProfileSettings } from '@/components/edo/perfil/profile-settings'
import { Badge } from '@/components/ui/badge'
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
    <div className="flex-1 flex flex-col space-y-8 h-full">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between py-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5" />
              Preferencia del Sistema
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
              <Calendar className="w-3.5 h-3.5" />
              ÚLTIMA ACTUALIZACIÓN: HOY
            </Badge>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ajustes</h2>
            <p className="text-muted-foreground mt-1 text-lg max-w-xl">
              Personaliza tu experiencia, gestiona tu identidad y refuerza la seguridad de tu acceso.
            </p>
          </div>
        </div>
      </div>

      <main className="w-full">
        <ProfileSettings
          user={user}
          userProfile={userProfile}
          isDemo={isDemo}
        />
      </main>
    </div>
  )
}
