'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Building2, ArrowRight, AlertCircle, Loader2, Mail, Lock, ChevronLeft, Lightbulb, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0b0f1a] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-500/30 transition-colors duration-500">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.3] dark:opacity-[0.1]"
        style={{ backgroundImage: `radial-gradient(#94a3b8 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl flex flex-col md:flex-row bg-white dark:bg-[#121218] rounded-[32px] overflow-hidden shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-white/5 relative z-10 min-h-[700px]"
      >
        {/* Left Side: Visual & Branding */}
        <div className="hidden md:flex md:w-[45%] relative overflow-hidden bg-blue-600">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d81bb19040ff?auto=format&fit=crop&q=80"
            alt="Construcción"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/90 via-blue-600/40 to-transparent" />

          <div className="relative z-10 p-12 flex flex-col h-full justify-between items-start">
            <Link href="/" className="flex items-center gap-4 group text-white">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight leading-none uppercase">SISTEMA <span className="text-blue-200">EDO</span></span>
                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase mt-1">Management Suite</span>
              </div>
            </Link>

            <div className="space-y-8 max-w-sm">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <div className="flex items-center gap-2 mb-3 text-white">
                  <Lightbulb className="w-4 h-4 text-yellow-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">Tip del día</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed font-medium italic">
                  "Optimiza el rendimiento de tu obra revisando los reportes de avance diario antes de las 9:00 AM."
                </p>
              </div>

              <div className="flex gap-2">
                <div className="w-8 h-1.5 bg-white rounded-full" />
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] p-8 md:p-20 flex flex-col justify-center relative bg-white dark:bg-[#1f202e]">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-12">
              <h1 className="text-3xl font-black text-[#0f172a] dark:text-white mb-3">Iniciar Sesión</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Bienvenido de nuevo a la gestión inteligente de obras.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Corporativo</label>
                <div className="group relative flex items-center">
                  <div className="absolute left-4 pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="nombre@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-[#0f172a] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-[15px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contraseña</label>
                  <Link href="#" className="text-[11px] font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 uppercase tracking-widest">¿Olvidaste tu clave?</Link>
                </div>
                <div className="group relative flex items-center">
                  <div className="absolute left-4 pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-12 py-4 text-[#0f172a] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-[15px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0070f3] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]"><span className="bg-white dark:bg-[#1f202e] px-4 text-slate-400 dark:text-slate-600 font-black">O continúa con</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-50 dark:bg-[#2a2b3d] hover:bg-slate-100 dark:hover:bg-[#32334a] rounded-2xl transition-all text-sm font-bold border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 shadow-sm">
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5 object-contain" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-50 dark:bg-[#2a2b3d] hover:bg-slate-100 dark:hover:bg-[#32334a] rounded-2xl transition-all text-sm font-bold border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-83.6-20.8-54.3 0-101.4 35.7-124.9 87.7-22.9 50.4-16.7 124.7 11.2 181.8 12.8 26.2 29.3 54.1 52.4 54.1 21.8 0 28.5-13.8 55.4-13.8 26.8 0 33.7 13.8 56.4 13.8 23.9 0 38-25.1 51.5-52.5 16.4-32.9 22.1-61.9 22.3-63.5-.6-.2-43.2-16.1-43.2-64.1zM290.3 83.4c15.1-18.3 25.4-43.7 22.6-69.1-22.1 1-48.4 14.8-64.2 33.2-13.8 15.9-26 42.1-22.8 67.1 24.6 1.9 49.3-12.9 64.4-31.2z"></path></svg>
                Apple
              </button>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                ¿No tienes una cuenta? <Link href="#" className="text-blue-600 dark:text-blue-400 font-black hover:underline uppercase tracking-widest text-[11px] ml-2">Contactar Soporte</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <footer className="fixed bottom-8 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Desarrollado por</span>
          <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 tracking-[0.2em] uppercase">Chelabs Engineering</span>
        </div>
        <p className="text-[8px] text-slate-400 uppercase tracking-[0.4em] font-medium">Excelencia en Gestión de Obras © 2026</p>
      </footer>
    </div>
  )
}
