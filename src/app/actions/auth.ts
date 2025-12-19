'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, RateLimits, getClientIdentifier } from '@/lib/rate-limit'
import type { Usuario, UserRole } from '@/types/database'

export type AuthResult = {
  success: boolean
  error?: string
}

// Traducción de errores de Supabase a español
function translateError(errorMessage: string): string {
  const errorTranslations: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos',
    'Email not confirmed': 'El email no ha sido confirmado',
    'User not found': 'Usuario no encontrado',
    'Invalid email or password': 'Email o contraseña incorrectos',
    'Too many requests': 'Demasiados intentos. Esperá unos minutos.',
    'Network error': 'Error de conexión. Verificá tu internet.',
    'User already registered': 'Este email ya está registrado',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  }

  return errorTranslations[errorMessage] || 'Error al procesar la solicitud. Intentá de nuevo.'
}

/**
 * Sign in with email and password
 * Rate limited: 5 attempts per minute per email + IP
 */
export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      success: false,
      error: 'Email y contraseña son requeridos',
    }
  }

  // Rate limit by email + IP combination
  const clientIp = await getClientIdentifier()
  const rateLimitKey = `login:${email.toLowerCase()}:${clientIp}`
  const rateLimitResult = await checkRateLimit(rateLimitKey, RateLimits.LOGIN)

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: rateLimitResult.error || 'Demasiados intentos. Esperá unos minutos.',
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: translateError(error.message),
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

/**
 * Get the current authenticated user and their profile
 */
export async function getCurrentUser(): Promise<{
  user: Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>>['data']['user']
  profile: Usuario | null
} | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return {
    user,
    profile: profile as Usuario | null,
  }
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(
  allowedRoles: UserRole[]
): Promise<boolean> {
  const currentUser = await getCurrentUser()

  if (!currentUser?.profile) {
    return false
  }

  return allowedRoles.includes(currentUser.profile.rol)
}
