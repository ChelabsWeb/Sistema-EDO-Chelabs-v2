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
    History, Settings2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

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
        { id: 'dark', label: 'Dark', icon: Moon, color: 'bg-slate-900 text-blue-400' },
        { id: 'system', label: 'System', icon: Monitor, color: 'bg-gradient-to-br from-white to-slate-900 text-slate-500' },
    ]

    const navItems = [
        { id: 'account', label: 'Mi Cuenta', icon: User },
        { id: 'appearance', label: 'Personalización', icon: Palette },
        { id: 'security', label: 'Seguridad', icon: ShieldCheck },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
    ]

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto">

            {/* Sidebar Navigation - Apple Desktop Style */}
            <aside className="w-full lg:w-72 space-y-2 sticky top-32">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden group",
                                isActive
                                    ? "text-apple-blue bg-apple-blue/10"
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
                            <span className="tracking-tight">{item.label}</span>
                            {!isActive && (
                                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            )}
                        </button>
                    )
                })}

                <div className="pt-8 px-6">
                    <div className="p-5 bg-gradient-to-br from-apple-blue to-indigo-600 rounded-3xl text-white shadow-xl shadow-blue-500/20 space-y-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-150 transition-transform duration-700">
                            <CreditCard className="w-16 h-16" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Plan Profesional</p>
                        <h4 className="text-xl font-black">Empresarial</h4>
                        <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest h-10">
                            Ver Facturación
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 w-full pb-20">
                <AnimatePresence mode="wait">

                    {/* TAB: ACCOUNT */}
                    {activeTab === 'account' && (
                        <motion.div
                            key="account"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Header Card */}
                            <Card className="rounded-[40px] border border-apple-gray-100 dark:border-white/5 shadow-apple-float bg-white dark:bg-apple-gray-50 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-[400px] h-full bg-apple-blue/[0.02] -skew-x-12 translate-x-20 pointer-events-none" />
                                <CardContent className="p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 relative z-10">
                                    <div className="relative group">
                                        <div className="absolute -inset-2 bg-gradient-to-tr from-apple-blue via-indigo-400 to-purple-500 rounded-[44px] blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                                        <div className="relative w-40 h-40 bg-apple-blue rounded-[40px] flex items-center justify-center text-white shadow-2xl group-hover:scale-[1.02] transition-transform duration-700 overflow-hidden border-4 border-white dark:border-apple-gray-50">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-7xl font-black">{nombre.charAt(0).toUpperCase()}</span>
                                            )}
                                            <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                                                <Camera className="w-8 h-8 text-white animate-apple-slide-up" />
                                                <span className="text-[10px] font-black uppercase text-white tracking-widest">Cambiar</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-6 text-center md:text-left">
                                        <div className="space-y-2">
                                            <div className="inline-flex gap-2 items-center px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Identidad Verificada
                                            </div>
                                            <h2 className="text-5xl font-black text-foreground tracking-tight leading-none">{nombre}</h2>
                                            <p className="text-xl text-apple-gray-400 font-medium tracking-tight uppercase italic">{puesto}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-apple-gray-300">
                                                <Mail className="w-4 h-4" /> {user?.email}
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-apple-gray-100" />
                                            <div className="flex items-center gap-2 text-sm font-bold text-apple-gray-300">
                                                <Phone className="w-4 h-4" /> {telefono}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Section */}
                            <Card className="rounded-[40px] border border-apple-gray-100 dark:border-white/5 shadow-apple bg-white dark:bg-apple-gray-50 overflow-hidden">
                                <form onSubmit={handleSaveAccount} className="p-10 md:p-14 space-y-12">
                                    <div className="flex items-center gap-4">
                                        <Settings2 className="w-6 h-6 text-apple-blue" />
                                        <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Configuración de Perfil</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block italic">Nombre Público</label>
                                            <Input
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                className="h-16 px-8 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/10 text-lg font-bold focus:ring-8 focus:ring-apple-blue/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block italic">Cargo o Puesto</label>
                                            <Input
                                                value={puesto}
                                                onChange={(e) => setPuesto(e.target.value)}
                                                className="h-16 px-8 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/10 text-lg font-bold focus:ring-8 focus:ring-apple-blue/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block italic">Teléfono de Contacto</label>
                                            <Input
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                className="h-16 px-8 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/10 text-lg font-bold focus:ring-8 focus:ring-apple-blue/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3 opacity-60">
                                            <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block italic">Ubicación Preferida</label>
                                            <div className="relative">
                                                <Input
                                                    value="Montevideo, Uruguay"
                                                    disabled
                                                    className="h-16 px-8 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/10 text-lg font-bold"
                                                />
                                                <Globe className="absolute right-6 top-1/2 -translate-y-1/2 text-apple-gray-300 w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={isPending}
                                            className="h-16 px-14 rounded-3xl bg-apple-blue text-white font-black text-[13px] uppercase tracking-[0.3em] shadow-apple-float hover:bg-apple-blue-dark active:scale-[0.98] transition-all flex items-center gap-4"
                                        >
                                            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                            Sincronizar Datos
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
                            <div className="space-y-2 px-4">
                                <h3 className="text-4xl font-black text-foreground tracking-tight leading-none italic uppercase">Estética Visual<span className="text-apple-blue">.</span></h3>
                                <p className="text-xl text-apple-gray-400 font-medium">Define cómo interactúas visualmente con la plataforma.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {themes.map((t) => {
                                    const Icon = t.icon
                                    const isSelected = theme === t.id
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={cn(
                                                "relative flex flex-col items-center gap-6 p-10 rounded-[48px] border-2 transition-all duration-700 active:scale-95 group overflow-hidden",
                                                isSelected
                                                    ? "bg-white dark:bg-white/[0.05] border-apple-blue shadow-apple-float ring-12 ring-apple-blue/5"
                                                    : "bg-apple-gray-50/50 dark:bg-black/20 border-apple-gray-100 dark:border-white/5 hover:border-apple-gray-400"
                                            )}
                                        >
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="theme-glow-full"
                                                    className="absolute inset-0 bg-gradient-to-br from-apple-blue/10 to-transparent pointer-events-none"
                                                />
                                            )}

                                            <div className={cn(
                                                "w-24 h-24 rounded-[32px] flex items-center justify-center transition-all duration-700 shadow-2xl group-hover:rotate-12",
                                                t.color,
                                                isSelected ? "scale-110 rotate-12" : "opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                                            )}>
                                                <Icon className="w-12 h-12" />
                                            </div>

                                            <div className="text-center space-y-1">
                                                <span className={cn(
                                                    "text-lg font-black uppercase tracking-tight",
                                                    isSelected ? "text-foreground" : "text-apple-gray-400"
                                                )}>
                                                    {t.label}
                                                </span>
                                                {isSelected && (
                                                    <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Activado</motion.p>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <div className="absolute top-6 right-6 w-8 h-8 bg-apple-blue text-white rounded-full flex items-center justify-center animate-apple-fade-in shadow-lg">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            <Card className="rounded-[40px] border border-apple-gray-100 dark:border-white/5 bg-white dark:bg-apple-gray-50 p-10 md:p-14 space-y-12">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-foreground tracking-tight uppercase italic">Interfaz Compacta</h4>
                                        <p className="text-sm font-medium text-apple-gray-400">Reduce el espaciado para mostrar más información a la vez.</p>
                                    </div>
                                    <button className="w-14 h-8 bg-apple-gray-100 dark:bg-white/10 rounded-full relative transition-colors">
                                        <div className="absolute left-1 top-1 w-6 h-6 bg-white dark:bg-apple-gray-200 rounded-full shadow-md" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between border-t border-apple-gray-50 dark:border-white/5 pt-10">
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-foreground tracking-tight uppercase italic">Reducir Movimiento</h4>
                                        <p className="text-sm font-medium text-apple-gray-400">Desactiva las animaciones complejas de la interfaz.</p>
                                    </div>
                                    <button className="w-14 h-8 bg-emerald-500 rounded-full relative transition-colors shadow-lg shadow-emerald-500/20">
                                        <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md" />
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
                            <div className="space-y-2 px-4">
                                <h3 className="text-4xl font-black text-foreground tracking-tight leading-none italic uppercase">Blindaje de Cuenta<span className="text-apple-blue">.</span></h3>
                                <p className="text-xl text-apple-gray-400 font-medium">Controla el acceso y mantén tus datos protegidos.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="rounded-[40px] border border-apple-gray-100 dark:border-white/5 bg-white dark:bg-apple-gray-50 p-10 space-y-8 group hover:border-apple-blue/30 transition-all">
                                    <div className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue">
                                        <Key className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black italic uppercase tracking-tight">Clave de Acceso</h4>
                                        <p className="text-sm font-medium text-apple-gray-400">Ultima actualización: hace 3 meses.</p>
                                    </div>
                                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-2 hover:bg-apple-blue hover:text-white transition-all">
                                        Cambiar Contraseña
                                    </Button>
                                </Card>

                                <Card className="rounded-[40px] border border-apple-gray-100 dark:border-white/5 bg-white dark:bg-apple-gray-50 p-10 space-y-8 group hover:border-emerald-500/30 transition-all">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                        <ShieldCheck className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black italic uppercase tracking-tight">Verificación 2FA</h4>
                                        <p className="text-sm font-medium text-emerald-500/70 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Activada
                                        </p>
                                    </div>
                                    <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10">
                                        Gestionar Métodos
                                    </Button>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-6">
                                    <History className="w-4 h-4 text-apple-gray-300" />
                                    <h4 className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.4em]">Sesiones Activas</h4>
                                </div>
                                <div className="space-y-3 px-2">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="p-8 bg-apple-gray-50/50 dark:bg-white/[0.03] border border-apple-gray-100 dark:border-white/10 rounded-[32px] flex items-center justify-between group hover:shadow-apple-sm transition-all"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white dark:bg-black/20 rounded-[22px] flex items-center justify-center text-apple-gray-400 shadow-inner group-hover:text-apple-blue transition-colors">
                                                    <session.icon className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h5 className="text-lg font-black text-foreground">{session.device}</h5>
                                                    <p className="text-xs font-medium text-apple-gray-400">{session.location} • {session.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {session.current && (
                                                    <span className="px-4 py-1.5 bg-apple-blue text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-apple-blue/20">Sesión Actual</span>
                                                )}
                                                <button className="p-4 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
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
                            <div className="space-y-2 px-4">
                                <h3 className="text-4xl font-black text-foreground tracking-tight leading-none italic uppercase">Notificaciones<span className="text-apple-blue">.</span></h3>
                                <p className="text-xl text-apple-gray-400 font-medium">Controla cuándo y cómo quieres ser contactado.</p>
                            </div>

                            <Card className="rounded-[40px] border border-apple-gray-100 dark:border-white/5 bg-white dark:bg-apple-gray-50 overflow-hidden divide-y divide-apple-gray-50 dark:divide-white/5">
                                {[
                                    { title: 'Alertas de Presupuesto', desc: 'Recibe avisos cuando una OC supere el presupuesto del rubro.', icon: Bell },
                                    { title: 'Estados de OT', desc: 'Cambios en el flujo de ejecución: aprobación, cierre.', icon: History },
                                    { title: 'Insumos Críticos', desc: 'Notificaciones sobre stock bajo o variaciones de precio altas.', icon: AlertTriangle },
                                    { title: 'Reportes Semanales', desc: 'Resumen ejecutivo de rendimientos y costos los lunes.', icon: Globe },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-10 flex items-center justify-between group hover:bg-apple-gray-50/50 dark:hover:bg-white/[0.01] transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-apple-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-apple-gray-400 group-hover:text-apple-blue transition-colors">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black text-foreground uppercase tracking-tight italic">{item.title}</h4>
                                                <p className="text-sm font-medium text-apple-gray-400 max-w-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                        <button className="w-14 h-8 bg-apple-blue rounded-full relative shadow-lg shadow-apple-blue/20">
                                            <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                                        </button>
                                    </div>
                                ))}
                            </Card>

                            <div className="p-10 bg-apple-blue/[0.03] dark:bg-white/[0.02] border border-apple-blue/10 rounded-[40px] flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <Mail className="w-8 h-8 text-apple-blue" />
                                    <div>
                                        <h4 className="text-lg font-black italic uppercase">Resumen por Email</h4>
                                        <p className="text-sm font-medium text-apple-gray-400">Recibir todos los avisos consolidados en un correo diario.</p>
                                    </div>
                                </div>
                                <Button variant="link" className="text-apple-blue font-black tracking-widest uppercase italic gap-2 group">
                                    Configurar <ExternalLink className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Danger Zone - Global */}
                <div className="mt-20 pt-10 border-t border-apple-gray-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-red-500/5 dark:bg-red-500/[0.02] rounded-[48px] border border-red-500/10">
                        <div className="space-y-1 text-center md:text-left">
                            <h4 className="text-2xl font-black text-red-600 tracking-tight italic uppercase">Zona de Peligro</h4>
                            <p className="text-sm font-medium text-red-500/60 max-w-sm leading-relaxed">¿Deseas dar de baja tu acceso? Esta acción notificará al administrador y desactivará tu cuenta de forma inmediata.</p>
                        </div>
                        <Button variant="ghost" className="h-16 px-12 rounded-[24px] bg-red-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5" />
                            Solicitar Baja de Perfil
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
