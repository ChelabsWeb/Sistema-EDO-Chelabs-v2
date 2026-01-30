import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PapeleraClient } from './papelera-client'
import type { UserRole } from '@/types/database'

export default async function PapeleraPage() {
  const supabase = await createClient()
  const isDemo = process.env.DEMO_MODE === 'true'

  let user = null
  if (!isDemo) {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/auth/login')
    user = authUser

    // Check if user is admin
    const { data: profile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('auth_user_id', user.id)
      .single() as { data: { rol: UserRole } | null }

    if (!profile || profile.rol !== 'admin') {
      redirect('/dashboard')
    }
  }

  return <PapeleraClient />
}
