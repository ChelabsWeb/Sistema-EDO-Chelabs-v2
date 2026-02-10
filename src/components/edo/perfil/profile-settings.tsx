'use client'

import { useState, useTransition } from 'react'
import { useTheme } from 'next-themes'
import type { Usuario } from '@/types/database'
import { updateUsuarioProfile } from '@/app/actions/usuarios'
import {
    User, Mail, Moon, Sun, Monitor, Camera,
    CheckCircle2, Loader2, Save, LogOut,
    Shield, Calendar, Building2, ChevronRight,
    Palette, Phone, Briefcase, Bell, Key,
    Smartphone, Laptop, Globe, ShieldCheck,
    AlertTriangle, CreditCard, ExternalLink,
    History, Settings2, Sparkles, Zap, Package, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileSettingsProps {
    user: any
    userProfile: Usuario | null
    isDemo: boolean
}

export function ProfileSettings({ user, userProfile, isDemo }: ProfileSettingsProps) {
    const { theme, setTheme } = useTheme()
    const [activeTab, setActiveTab] = useState('account')
    const [isPending, startTransition] = useTransition()

    // States for account info
    const [nombre, setNombre] = useState(userProfile?.nombre || '')
    const [puesto, setPuesto] = useState(userProfile?.rol === 'admin' ? 'Administrador Senior' : 'Jefe de Operaciones')
    const [telefono, setTelefono] = useState('+598 099 123 456')
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    // Simulation of active sessions
    const sessions = [
        { id: 1, device: 'MacBook Pro 14"', location: 'Montevideo, UY', icon: Laptop, current: true, date: 'Ahora' },
        { id: 2, device: 'iPhone 15 Pro', location: 'Punta del Este, UY', icon: Smartphone, current: false, date: 'Hace 2 horas' },
    ]

    const handleSaveAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isDemo) {
            toast.error('Modo demo: Cambios no persistidos')
            return
        }

        startTransition(async () => {
            const result = await updateUsuarioProfile({ nombre })
            if (result.success) {
                toast.success('Información actualizada', {
                    description: 'Tus cambios han sido sincronizados globalmente.'
                })
            } else {
                toast.error(result.error || 'Error al actualizar')
            }
        })
    }

    const themes = [
        { id: 'light', label: 'Light', icon: Sun, color: 'bg-white text-orange-500' },
        { id: 'dark', label: 'Dark', icon: Moon, color: 'bg-slate-900 text-apple-blue' },
        { id: 'system', label: 'System', icon: Monitor, color: 'bg-gradient-to-br from-white to-slate-900 text-slate-500' },
    ]

    const navItems = [
        { id: 'account', label: 'Mi Cuenta', icon: User },
        { id: 'appearance', label: 'Personalización', icon: Palette },
        { id: 'security', label: 'Seguridad', icon: ShieldCheck },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
    ]

    return (
        <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* Sidebar Navigation - Premium Vertical Style */}
            <aside className="w-full lg:w-80 space-y-2 lg:sticky lg:top-32">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-black text-[13px] transition-all relative overflow-hidden uppercase tracking-widest group",
                                isActive
                                    ? "text-apple-blue bg-apple-blue/10 border border-apple-blue/20"
                                    : "text-apple-gray-400 hover:text-foreground hover:bg-apple-gray-50 dark:hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-sidebar-pill"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-apple-blue rounded-r-full"
                                />
                            )}
                            <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                            <span className="tracking-widest">{item.label}</span>
                            {!isActive && (
                                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            )}
                        </button>
                    )
                })}

                <div className="pt-8 px-2">
                    <div className="p-8 bg-slate-900 dark:bg-apple-blue/10 rounded-[2.5rem] text-white shadow-2xl space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-150 transition-transform duration-700">
                            <Zap className="w-20 h-20" />
                        </div>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Plan Profesional</p>
                            <h4 className="text-2xl font-black font-display uppercase">Nivel Core</h4>
                        </div>
                        <p className="text-xs text-white/50 relative z-10 leading-relaxed">Acceso a todas las herramientas de analítica y gestión.</p>
                        <Button className="w-full h-12 bg-white text-slate-900 hover:bg-white/90 rounded-2xl text-[10px] font-black uppercase tracking-widest relative z-10">
                            Mejorar Plan
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 w-full max-w-4xl space-y-12">
                <AnimatePresence mode="wait">

                    {/* TAB: ACCOUNT */}
                    {activeTab === 'account' && (
                        <motion.div
                            key="account"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            {/* Profile Hero Card */}
                            <Card className="rounded-[3rem] glass border border-apple-gray-100 dark:border-white/5 shadow-apple-float overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-[500px] h-full bg-apple-blue/[0.01] -skew-x-12 translate-x-20 pointer-events-none" />
                                <CardContent className="p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 relative z-10">
                                    <div className="relative group">
                                        <div className="absolute -inset-4 bg-gradient-to-tr from-apple-blue via-indigo-400 to-purple-500 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                                        <div className="relative w-40 h-40 bg-apple-blue rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-[1.05] transition-transform duration-700 overflow-hidden border-4 border-white dark:border-apple-gray-50">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-7xl font-black">{nombre.charAt(0).toUpperCase()}</span>
                                            )}
                                            <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                                                <Camera className="w-8 h-8 text-white" />
                                                <span className="text-[10px] font-black uppercase text-white tracking-widest">Cambiar</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-6 text-center md:text-left">
                                        <div className="space-y-2">
                                            <div className="inline-flex gap-2 items-center px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Identidad Corporativa Verificada
                                            </div>
                                            <h2 className="text-5xl font-black font-display text-foreground tracking-tight leading-none uppercase">{nombre}</h2>
                                            <p className="text-xl text-apple-gray-400 font-medium tracking-tight opacity-80">{puesto}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-apple-gray-300">
                                                <Mail className="w-4 h-4 text-apple-blue" /> {user?.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-apple-gray-300">
                                                <Phone className="w-4 h-4 text-apple-blue" /> {telefono}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detailed Form Card */}
                            <Card className="rounded-[3rem] glass border border-apple-gray-100 dark:border-white/5 shadow-apple overflow-hidden">
                                <form onSubmit={handleSaveAccount} className="p-10 md:p-14 space-y-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
                                            <Settings2 className="w-5 h-5 text-apple-blue" />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground tracking-tight uppercase font-display">Campos Operativos</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block">Nombre Completo</label>
                                            <Input
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                className="h-16 px-8 rounded-2xl bg-white dark:bg-black/20 border-apple-gray-100 dark:border-white/10 text-lg font-bold focus:ring-8 focus:ring-apple-blue/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block">Rol / Autoridad</label>
                                            <Input
                                                value={puesto}
                                                onChange={(e) => setPuesto(e.target.value)}
                                                className="h-16 px-8 rounded-2xl bg-white dark:bg-black/20 border-apple-gray-100 dark:border-white/10 text-lg font-bold focus:ring-8 focus:ring-apple-blue/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block">Línea de Contacto</label>
                                            <Input
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                className="h-16 px-8 rounded-2xl bg-white dark:bg-black/20 border-apple-gray-100 dark:border-white/10 text-lg font-bold focus:ring-8 focus:ring-apple-blue/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3 opacity-60">
                                            <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block">Sede / Ubicación</label>
                                            <div className="relative">
                                                <Input
                                                    value="Montevideo, Uruguay"
                                                    disabled
                                                    className="h-16 px-8 rounded-2xl bg-apple-gray-50 dark:bg-black/40 border-apple-gray-100 dark:border-white/10 text-lg font-bold cursor-not-allowed"
                                                />
                                                <Globe className="absolute right-6 top-1/2 -translate-y-1/2 text-apple-gray-300 w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={isPending}
                                            className="h-16 px-14 rounded-[2rem] bg-apple-blue text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-apple-float hover:bg-apple-blue-dark active:scale-[0.95] transition-all flex items-center gap-4 group"
                                        >
                                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-125 transition-transform" />}
                                            Guardar Cambios
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    )}

                    {/* TAB: APPEARANCE */}
                    {activeTab === 'appearance' && (
                        <motion.div
                            key="appearance"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="space-y-2 px-6">
                                <h3 className="text-4xl font-black font-display text-foreground tracking-tight leading-none uppercase">Entorno Visual<span className="text-apple-blue">.</span></h3>
                                <p className="text-xl text-apple-gray-400 font-medium">Personaliza el motor de renderizado y el tema del sistema.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {themes.map((t) => {
                                    const Icon = t.icon
                                    const isSelected = theme === t.id
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={cn(
                                                "relative flex flex-col items-center gap-6 p-8 rounded-[3rem] border transition-all duration-500 active:scale-95 group overflow-hidden",
                                                isSelected
                                                    ? "bg-white dark:bg-white/5 border-apple-blue shadow-apple-float"
                                                    : "bg-apple-gray-50/50 dark:bg-black/20 border-apple-gray-100 dark:border-white/5 hover:border-apple-gray-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-20 h-20 rounded-[22px] flex items-center justify-center transition-all duration-700 shadow-xl group-hover:rotate-6",
                                                t.color,
                                                isSelected ? "scale-110" : "opacity-40"
                                            )}>
                                                <Icon className="w-10 h-10" />
                                            </div>
                                            <span className={cn(
                                                "text-sm font-black uppercase tracking-widest",
                                                isSelected ? "text-foreground" : "text-apple-gray-400"
                                            )}>
                                                {t.label}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 w-6 h-6 bg-apple-blue text-white rounded-full flex items-center justify-center shadow-lg">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            <Card className="rounded-[3rem] glass border border-apple-gray-100 dark:border-white/5 bg-white dark:bg-apple-gray-50 p-10 space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-foreground tracking-tight uppercase font-display">Animaciones Fluidas</h4>
                                        <p className="text-sm font-medium text-apple-gray-400">Activa transiciones de 60fps para una mayor inmersión.</p>
                                    </div>
                                    <button className="w-14 h-8 bg-emerald-500 rounded-full relative transition-colors shadow-lg shadow-emerald-500/20">
                                        <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between border-t border-apple-gray-50 dark:border-white/5 pt-10">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-foreground tracking-tight uppercase font-display">Contraste Alto</h4>
                                        <p className="text-sm font-medium text-apple-gray-400">Aumenta la visibilidad de los elementos de control.</p>
                                    </div>
                                    <button className="w-14 h-8 bg-apple-gray-200 dark:bg-white/10 rounded-full relative transition-colors">
                                        <div className="absolute left-1 top-1 w-6 h-6 bg-white dark:bg-apple-gray-300 rounded-full shadow-sm" />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* TAB: SECURITY */}
                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="space-y-2 px-6">
                                <h3 className="text-4xl font-black font-display text-foreground tracking-tight leading-none uppercase">Criptografía y Acceso<span className="text-apple-blue">.</span></h3>
                                <p className="text-xl text-apple-gray-400 font-medium">Gestiona tus credenciales y monitoriza sesiones activas.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="rounded-[3rem] glass border-apple-gray-100 dark:border-white/5 p-10 space-y-8 group transition-all">
                                    <div className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform">
                                        <Key className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black uppercase tracking-tight font-display">Factor de Clave</h4>
                                        <p className="text-xs font-medium text-apple-gray-400">Protege tu acceso con encriptación avanzada.</p>
                                    </div>
                                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-apple-blue hover:text-white transition-all">
                                        Rotar Contraseña
                                    </Button>
                                </Card>

                                <Card className="rounded-[3rem] glass border-apple-gray-100 dark:border-white/5 p-10 space-y-8 group transition-all">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black uppercase tracking-tight font-display">Verificación 2FA</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3" /> Estado Protegido
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10">
                                        Preferencias 2FA
                                    </Button>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-6">
                                    <History className="w-4 h-4 text-apple-gray-300" />
                                    <h4 className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.4em]">Historial de Dispositivos</h4>
                                </div>
                                <div className="space-y-4">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="p-8 glass rounded-[2.5rem] border-apple-gray-100 dark:border-white/5 flex items-center justify-between group hover:shadow-apple-sm transition-all"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-apple-gray-50 dark:bg-black/20 rounded-2xl flex items-center justify-center text-apple-gray-400 group-hover:text-apple-blue transition-colors shadow-inner">
                                                    <session.icon className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h5 className="text-lg font-black text-foreground uppercase tracking-tight font-display">{session.device}</h5>
                                                    <p className="text-xs font-medium text-apple-gray-400">{session.location} • {session.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {session.current && (
                                                    <span className="px-5 py-2 bg-apple-blue text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-apple-blue/25">Activa Ahora</span>
                                                )}
                                                <button className="w-10 h-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center">
                                                    <LogOut className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB: NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <motion.div
                            key="notifications"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="space-y-2 px-6">
                                <h3 className="text-4xl font-black font-display text-foreground tracking-tight leading-none uppercase">Centro de Alertas<span className="text-apple-blue">.</span></h3>
                                <p className="text-xl text-apple-gray-400 font-medium">Configura el flujo de información en tiempo real.</p>
                            </div>

                            <Card className="rounded-[3rem] glass border-apple-gray-100 dark:border-white/5 overflow-hidden divide-y divide-apple-gray-50 dark:divide-white/5">
                                {[
                                    { title: 'Variaciones Presupuestarias', desc: 'Alertas críticas sobre excedentes financieros por rubro.', icon: Zap },
                                    { title: 'Flujo de Trabajo', desc: 'Notificaciones sobre estados de órdenes y hitos de obra.', icon: History },
                                    { title: 'Alertas de Stock', desc: 'Avisos sobre insumos con inventario en zona de riesgo.', icon: Package },
                                    { title: 'Reportes de Sistema', desc: 'Distribución de analíticas consolidadas mensualmente.', icon: BarChart3 },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-10 flex items-center justify-between group hover:bg-white/[0.01] transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-apple-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-apple-gray-400 group-hover:text-apple-blue transition-colors">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black text-foreground uppercase tracking-tight font-display">{item.title}</h4>
                                                <p className="text-sm font-medium text-apple-gray-400 max-w-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                        <button className="w-14 h-8 bg-apple-blue rounded-full relative shadow-lg shadow-apple-blue/20">
                                            <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                                        </button>
                                    </div>
                                ))}
                            </Card>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Global Actions Bar */}
                <div className="pt-20 border-t border-apple-gray-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-12 bg-red-500/[0.03] rounded-[3.5rem] border border-red-500/10">
                        <div className="space-y-1 text-center md:text-left">
                            <h4 className="text-2xl font-black text-red-600 tracking-tight uppercase font-display">Zona Crítica</h4>
                            <p className="text-sm font-medium text-red-500/60 max-w-sm leading-relaxed">Si decides dar de baja tu perfil, se revocarán todos tus permisos de forma irreversible.</p>
                        </div>
                        <Button variant="ghost" className="h-16 px-12 rounded-3xl bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-500/30 hover:bg-red-600 transition-all flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5" />
                            Finalizar Acceso
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
