import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayoutClient } from '@/components/layouts/DashboardLayoutClient'
import type { Usuario } from '@/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  const userProfile = profile as Usuario | null

  return (
    <DashboardLayoutClient
      userRole={userProfile?.rol ?? null}
      userName={userProfile?.nombre ?? null}
      userEmail={user.email ?? null}
    >
      {children}
    </DashboardLayoutClient>
  )
}
