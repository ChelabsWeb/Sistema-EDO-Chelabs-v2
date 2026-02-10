'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ArrowRight, AlertCircle, Loader2, Mail, Lock, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

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
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(translateError(error.message))
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#13131a] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1000px] flex flex-col md:flex-row bg-[#1c1c26] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/5 relative z-10 min-h-[640px]"
      >
        {/* Left Side: Visual Image Section */}
        <div className="hidden md:flex md:w-[48%] relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80"
            alt="Arquitectura"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c26] via-transparent to-black/20" />

          {/* Logo Top Left */}
          <div className="absolute top-8 left-8 flex items-center gap-3">
            <Logo size={36} />
            <span className="text-white font-extrabold tracking-tighter text-lg">EDO</span>
          </div>

          {/* Back Link Top Right */}
          <Link href="/" className="absolute top-8 right-8 flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white transition-colors group">
            Volver al inicio
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Hero Text Bottom */}
          <div className="absolute bottom-12 left-10 right-10">
            <h2 className="text-3xl font-bold text-white leading-tight mb-6">
              Controlando el futuro, <br />
              gestionando la excelencia.
            </h2>
            <div className="flex gap-1.5">
              <div className="w-6 h-1 bg-white/40 rounded-full" />
              <div className="w-6 h-1 bg-white/40 rounded-full" />
              <div className="w-10 h-1 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="w-full md:w-[52%] p-10 md:p-16 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Iniciar Sesión</h1>
              <p className="text-slate-400 font-medium text-sm">
                ¿Todavía no tienes acceso? <Link href="#" className="text-blue-500 hover:text-blue-400 hover:underline transition-all">Soporte Técnico</Link>
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#13131a] border border-white/5 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  required
                />
              </div>

              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#13131a] border border-white/5 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-[#13131a] text-blue-600 focus:ring-offset-0 focus:ring-0 transition-all" />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Recordar sesión</span>
                </label>
                <Link href="#" className="text-xs text-blue-500 hover:text-blue-400 transition-colors font-medium">¿Olvidaste la clave?</Link>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-[15px] hover:bg-blue-500 shadow-lg shadow-blue-600/10 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ingresar"}
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center"><span className="bg-[#1c1c26] px-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">O inicia sesión con</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 px-4 bg-transparent hover:bg-white/5 rounded-xl transition-all text-xs font-bold border border-white/10 text-white shadow-sm">
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-4 h-4" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 py-3 px-4 bg-transparent hover:bg-white/5 rounded-xl transition-all text-xs font-bold border border-white/10 text-white shadow-sm font-sans group">
                <svg className="w-4 h-4 fill-white transition-opacity group-hover:opacity-90" viewBox="0 0 24 24" style={{ marginTop: '-2px' }}>
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.51 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                </svg>
                Apple
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subtle branding footer */}
      <div className="fixed bottom-10 left-0 w-full text-center opacity-30 select-none pointer-events-none">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">
          Chelabs Engineering — 2026
        </p>
      </div>
    </div>
  )
}
