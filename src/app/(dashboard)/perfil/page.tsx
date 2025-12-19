import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Usuario } from '@/types/database'
import { getRoleDisplayName } from '@/lib/roles'

export default async function PerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  const userProfile = profile as Usuario | null

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {/* Avatar and Name */}
        <div className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-2xl">
              {userProfile?.nombre?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {userProfile?.nombre || 'Usuario'}
            </h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Role */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Rol
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 font-medium rounded-full text-sm">
              {getRoleDisplayName(userProfile?.rol ?? null)}
            </span>
          </div>
        </div>

        {/* Obra Asignada */}
        {userProfile?.obra_id && (
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Obra Asignada
            </label>
            <p className="text-gray-900">ID: {userProfile.obra_id}</p>
          </div>
        )}

        {/* Account Info */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Cuenta creada
          </label>
          <p className="text-gray-900">
            {userProfile?.created_at
              ? new Date(userProfile.created_at).toLocaleDateString('es-UY', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'N/A'}
          </p>
        </div>

        {/* Sign Out */}
        <div className="p-6">
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
