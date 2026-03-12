'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    ClipboardList,
    TrendingUp,
    Package,
    Users,
    Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'

interface ProjectHeaderProps {
    projectId: string
    userRole: string | null
    userName: string | null
}

export function ProjectHeader({ projectId, userRole, userName }: ProjectHeaderProps) {
    const pathname = usePathname()

    const tabs = [
        {
            name: 'Resumen',
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
            name: 'Insumos',
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
        <div className="flex flex-col space-y-6 md:space-y-8 mb-8">
            {/* Upper header - matching Panel de Control accurately */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between py-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Proyecto: {projectId.split('-')[0].toUpperCase()}</h2>
                    <p className="text-muted-foreground mt-1">
                        Gestión de obra y control de recursos. El ecosistema operativo se mantiene estable.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <Button variant="outline" size="icon" className="relative">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background"></span>
                    </Button>
                    <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
                        <div className="flex flex-col mr-2 text-right hidden sm:block">
                            <span className="text-sm font-semibold">{userName || 'Usuario'}</span>
                            <span className="text-xs text-muted-foreground capitalize">{userRole?.replace('_', ' ') || 'Rol'}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                            {userName ? userName.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-border pb-px overflow-x-auto custom-scrollbar-hide">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-2 py-2 px-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap",
                            tab.active
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </Link>
                ))}
            </div>
        </div>
    )
}
