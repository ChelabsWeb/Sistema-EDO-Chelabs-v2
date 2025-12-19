import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PapeleraClient } from './papelera-client'

export default async function PapeleraPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check if user is admin
  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.rol !== 'admin') {
    redirect('/dashboard')
  }

  return <PapeleraClient />
}
