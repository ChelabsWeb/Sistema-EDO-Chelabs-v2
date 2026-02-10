'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Building2,
    ChevronRight,
    LayoutDashboard,
    ClipboardList,
    TrendingUp,
    Package,
    Users,
    ArrowLeft,
    Bell,
    Moon,
    Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

interface ProjectHeaderProps {
    projectId: string
    userRole: string | null
    userName: string | null
}

export function ProjectHeader({ projectId, userRole, userName }: ProjectHeaderProps) {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()

    const tabs = [
        {
            name: 'Dashboard',
            href: `/obras/${projectId}`,
            icon: LayoutDashboard,
            active: pathname === `/obras/${projectId}`
        },
        {
            name: 'Órdenes de Trabajo',
            href: `/obras/${projectId}/ordenes-trabajo`,
            icon: ClipboardList,
            active: pathname.includes('/ordenes-trabajo')
        },
        {
            name: 'Recursos',
            href: `/obras/${projectId}/insumos`,
            icon: Package,
            active: pathname.includes('/insumos') || pathname.includes('/rubros')
        },
        {
            name: 'Equipo',
            href: `/obras/${projectId}/usuarios`,
            icon: Users,
            active: pathname.includes('/usuarios')
        },
        {
            name: 'Analítica',
            href: `/obras/${projectId}/analitica`,
            icon: TrendingUp,
            active: pathname.includes('/analitica')
        }
    ]

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-apple-gray-100 dark:border-white/10 px-8 py-4 backdrop-blur-xl">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
                {/* Top Row: Navigation & Meta */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/obras"
                            className="group flex items-center gap-2 text-apple-gray-400 hover:text-apple-blue transition-colors font-bold text-xs uppercase tracking-widest"
                        >
                            <div className="size-10 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center border border-apple-gray-100 dark:border-white/10 group-hover:bg-apple-blue/10 transition-all">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span>Panel Global</span>
                        </Link>

                        <div className="h-6 w-px bg-apple-gray-100 dark:bg-white/10" />

                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue border border-apple-blue/20">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em] leading-none mb-1">PROYECTO ACTIVO</p>
                                <h1 className="text-xl font-black tracking-tight text-foreground truncate max-w-[300px]">Moviéndose en {projectId}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border-r border-apple-gray-200 dark:border-white/10 pr-4">
                            <ThemeToggle />
                            <button className="relative size-12 rounded-full bg-white dark:bg-white/5 text-apple-gray-400 hover:text-apple-blue transition-all border border-apple-gray-100 dark:border-white/10 shadow-sm hover:scale-110 flex items-center justify-center">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-0.5 right-0.5 size-2.5 bg-apple-blue rounded-full ring-2 ring-white dark:ring-[#0f111a] translate-x-1/4 -translate-y-1/4"></span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pl-2">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-foreground">{userName}</span>
                                <span className="text-[10px] font-bold text-apple-blue uppercase tracking-widest">{userRole}</span>
                            </div>
                            <div className="size-12 rounded-full bg-gradient-to-br from-apple-blue to-indigo-600 p-[2px] shadow-lg shadow-apple-blue/20">
                                <div className="w-full h-full rounded-full bg-white dark:bg-[#0f111a] flex items-center justify-center overflow-hidden">
                                    <span className="text-apple-blue font-black text-sm tracking-tighter">
                                        {userName?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Row */}
                <nav className="flex items-center gap-2">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 group",
                                tab.active
                                    ? "bg-apple-blue text-white shadow-lg shadow-apple-blue/20"
                                    : "text-apple-gray-400 hover:text-foreground hover:bg-apple-gray-50 dark:hover:bg-white/5"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", tab.active ? "text-white" : "text-apple-gray-400")} />
                            <span>{tab.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
