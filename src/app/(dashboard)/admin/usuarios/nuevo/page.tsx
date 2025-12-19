import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NuevoUsuarioForm } from './NuevoUsuarioForm'
import type { UserRole } from '@/types/database'

export default async function NuevoUsuarioPage() {
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
    .select('rol')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    redirect('/dashboard?error=no_autorizado')
  }

  // Get obras for dropdown
  const { data: obras } = await supabase
    .from('obras')
    .select('id, nombre')
    .eq('estado', 'activa')
    .order('nombre')

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
        <p className="text-gray-600 mt-1">
          Crear una nueva cuenta de usuario
        </p>
      </div>

      <NuevoUsuarioForm obras={obras || []} />
    </div>
  )
}
