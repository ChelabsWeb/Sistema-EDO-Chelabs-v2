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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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

    const navItems = [
        { id: 'account', label: 'Mi Cuenta', icon: User },
        { id: 'appearance', label: 'Apariencia', icon: Palette },
        { id: 'security', label: 'Seguridad', icon: ShieldCheck },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
    ]

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 space-y-2 shrink-0">
                <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        )
                    })}
                </nav>

                <div className="pt-8">
                    <Card className="bg-primary text-primary-foreground border-transparent overflow-hidden relative">
                        <div className="absolute right-0 top-0 opacity-10">
                            <Zap className="w-24 h-24 -mr-4 -mt-4" />
                        </div>
                        <CardHeader className="pb-2">
                            <Badge variant="secondary" className="w-fit text-[10px] mb-2 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-transparent">PLAN PROFESIONAL</Badge>
                            <CardTitle>Nivel Core</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-primary-foreground/80 mb-4">Acceso a todas las herramientas de analítica y gestión.</p>
                            <Button variant="secondary" className="w-full shrink-0" size="sm">
                                Mejorar Plan
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 w-full max-w-4xl min-h-[600px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'account' && (
                        <motion.div
                            key="account"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <Card>
                                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full border bg-muted flex items-center justify-center text-muted-foreground overflow-hidden relative">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-4xl font-semibold">{nombre.charAt(0).toUpperCase()}</span>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer">
                                                <Camera className="w-6 h-6 text-white" />
                                                <span className="text-xs font-medium text-white">Cambiar</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2 text-center md:text-left">
                                        <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                            Identidad Verificada
                                        </Badge>
                                        <h2 className="text-2xl font-bold">{nombre}</h2>
                                        <p className="text-muted-foreground font-medium">{puesto}</p>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-4 h-4" /> {user?.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="w-4 h-4" /> {telefono}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Personal</CardTitle>
                                    <CardDescription>Actualiza tus datos de contacto y rol dentro de la plataforma.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form id="account-form" onSubmit={handleSaveAccount} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="nombre">Nombre Completo</Label>
                                                <Input
                                                    id="nombre"
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="puesto">Rol / Autoridad</Label>
                                                <Input
                                                    id="puesto"
                                                    value={puesto}
                                                    onChange={(e) => setPuesto(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="telefono">Línea de Contacto</Label>
                                                <Input
                                                    id="telefono"
                                                    value={telefono}
                                                    onChange={(e) => setTelefono(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="ubicacion">Ubicación</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="ubicacion"
                                                        value="Montevideo, Uruguay"
                                                        disabled
                                                        className="pr-10"
                                                    />
                                                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t pt-6">
                                    <Button
                                        type="submit"
                                        form="account-form"
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Guardar Cambios
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                        <motion.div
                            key="appearance"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2">Apariencia</h3>
                                <p className="text-muted-foreground">Personaliza el tema visual de la plataforma según tus preferencias de lectura.</p>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Tema</CardTitle>
                                    <CardDescription>Selecciona cómo prefieres ver la interfaz del sistema.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={cn(
                                                "border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-colors",
                                                theme === 'light' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                            )}
                                        >
                                            <div className="p-3 bg-secondary rounded-full">
                                                <Sun className="w-6 h-6" />
                                            </div>
                                            <span className="font-semibold text-sm">Claro</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={cn(
                                                "border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-colors",
                                                theme === 'dark' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                            )}
                                        >
                                            <div className="p-3 bg-secondary rounded-full">
                                                <Moon className="w-6 h-6" />
                                            </div>
                                            <span className="font-semibold text-sm">Oscuro</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('system')}
                                            className={cn(
                                                "border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-colors",
                                                theme === 'system' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                            )}
                                        >
                                            <div className="p-3 bg-secondary rounded-full">
                                                <Monitor className="w-6 h-6" />
                                            </div>
                                            <span className="font-semibold text-sm">Sistema</span>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Accesibilidad</CardTitle>
                                    <CardDescription>Ajustes adicionales para mejorar la experiencia visual.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Animaciones Reducidas</Label>
                                            <p className="text-sm text-muted-foreground">Desactiva las animaciones decorativas para mejorar el rendimiento.</p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Modo de Contraste Alto</Label>
                                            <p className="text-sm text-muted-foreground">Aumenta el contraste de los colores para mejorar la legibilidad.</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2">Seguridad</h3>
                                <p className="text-muted-foreground">Administra tus credenciales, métodos de autenticación y monitorea las sesiones activas en la cuenta.</p>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Autenticación</CardTitle>
                                    <CardDescription>Opciones para mantener tu cuenta segura.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                                        <div className="flex items-start gap-3">
                                            <Key className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <Label className="text-base">Contraseña</Label>
                                                <p className="text-sm text-muted-foreground">Actualizada hace 2 meses.</p>
                                            </div>
                                        </div>
                                        <Button variant="outline">Cambiar Contraseña</Button>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-t pt-6">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="w-5 h-5 mt-0.5 text-emerald-500" />
                                            <div>
                                                <Label className="text-base flex items-center gap-2">
                                                    Autenticación de 2 Factores (2FA)
                                                    <Badge variant="outline" className="text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">Activado</Badge>
                                                </Label>
                                                <p className="text-sm text-muted-foreground">Protege tu cuenta agregando una capa extra de seguridad.</p>
                                            </div>
                                        </div>
                                        <Button variant="outline">Configurar</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Sesiones Activas</CardTitle>
                                    <CardDescription>Todos los dispositivos en los que estás conectado actualmente.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {sessions.map((session) => (
                                        <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-muted rounded-md text-foreground">
                                                    <session.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm flex items-center gap-2">
                                                        {session.device}
                                                        {session.current && <Badge variant="secondary" className="text-[10px]">Actual</Badge>}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        {session.location} • {session.date}
                                                    </p>
                                                </div>
                                            </div>
                                            {!session.current && (
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    Revocar acceso
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            key="notifications"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2">Notificaciones</h3>
                                <p className="text-muted-foreground">Configura qué tipo de avisos deseas recibir y a través de qué canales.</p>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Preferencias de Alertas</CardTitle>
                                    <CardDescription>Desliza los interruptores para activar o desactivar las notificaciones por categoría.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {[
                                        { title: 'Variaciones Presupuestarias', desc: 'Alertas críticas sobre excedentes financieros por rubro.', icon: Zap },
                                        { title: 'Flujo de Trabajo (Órdenes)', desc: 'Notificaciones sobre estados de órdenes y hitos de obra.', icon: History },
                                        { title: 'Alertas de Stock de Materiales', desc: 'Avisos sobre insumos con inventario en zona de riesgo.', icon: Package },
                                        { title: 'Reportes Mensuales de Sistema', desc: 'Distribución de analíticas consolidadas mensualmente.', icon: BarChart3 },
                                    ].map((item, idx) => (
                                        <div key={idx} className={cn("flex items-center justify-between py-2", idx !== 0 && "border-t pt-6")}>
                                            <div className="flex gap-4 items-start">
                                                <item.icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                                <div className="space-y-0.5">
                                                    <Label className="text-base">{item.title}</Label>
                                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                                </div>
                                            </div>
                                            <Switch defaultChecked={idx !== 3} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Global Actions Zone */}
                <div className="mt-8 pt-6 border-t">
                    <Card className="border-destructive/20 bg-destructive/5">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="font-semibold text-destructive text-lg">Zona Crítica</h4>
                                <p className="text-sm text-destructive/80 mt-1">Si decides finalizar tu acceso, se revocarán todos tus permisos y sesiones activas en el acto.</p>
                            </div>
                            <Button variant="destructive" className="shrink-0">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Finalizar Acceso
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
