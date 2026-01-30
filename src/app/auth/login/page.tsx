'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Building2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Traducción de errores de Supabase a español
function translateError(errorMessage: string): string {
  const errorTranslations: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos',
    'Email not confirmed': 'El email no ha sido confirmado',
    'User not found': 'Usuario no encontrado',
    'Invalid email or password': 'Email o contraseña incorrectos',
    'Too many requests': 'Demasiados intentos. Esperá unos minutos.',
    'Network error': 'Error de conexión. Verificá tu internet.',
  }

  return errorTranslations[errorMessage] || 'Error al iniciar sesión. Intentá de nuevo.'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const cardRef = useRef<HTMLDivElement>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Demo Mode Auto-Login setup
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (isDemo) {
      setTimeout(() => {
        router.push('/dashboard')
      }, 800)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(translateError(error.message))
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Apple-style Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-apple-blue/10 dark:bg-apple-blue/20 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div className="glass p-12 rounded-[48px] shadow-apple-float border border-white/40 dark:border-white/10 backdrop-blur-3xl">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-apple-blue rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
              <Building2 className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-foreground mb-3">Sistema EDO</h1>
            <p className="text-apple-gray-400 font-medium text-lg leading-tight uppercase tracking-widest text-[10px]">Portal de Acceso Professional</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-apple-gray-400 uppercase tracking-[0.2em] ml-2">Email del Usuario</label>
              <input
                type="email"
                placeholder="ejemplo@chelabs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-15 px-6 bg-apple-gray-50/50 dark:bg-white/[0.03] border border-apple-gray-100 dark:border-white/10 rounded-[20px] focus:ring-2 focus:ring-apple-blue outline-none transition-all font-medium text-foreground placeholder:text-apple-gray-300 shadow-sm"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[11px] font-bold text-apple-gray-400 uppercase tracking-[0.2em]">Contraseña</label>
                <Link href="#" className="text-[11px] font-bold text-apple-blue hover:text-apple-blue-dark transition-colors uppercase tracking-[0.1em]">¿Olvidaste tu clave?</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-15 px-6 bg-apple-gray-50/50 dark:bg-white/[0.03] border border-apple-gray-100 dark:border-white/10 rounded-[20px] focus:ring-2 focus:ring-apple-blue outline-none transition-all font-medium text-foreground placeholder:text-apple-gray-300 shadow-sm"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/10 rounded-[20px] flex items-center gap-4 text-red-600 dark:text-red-400 text-sm font-bold"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p>{translateError(error)}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-apple-blue text-white rounded-[20px] font-bold hover:bg-apple-blue-dark transition-all active:scale-[0.97] disabled:opacity-50 disabled:scale-100 shadow-[0_15px_30px_rgba(0,113,227,0.3)] flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="text-lg">Ingresar al Sistema</span>
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-apple-gray-100 dark:border-white/10 text-center">
            <p className="text-sm text-apple-gray-400 font-medium">
              V2.0.1 — <span className="text-foreground tracking-tighter font-bold">Chelabs Engineering</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
