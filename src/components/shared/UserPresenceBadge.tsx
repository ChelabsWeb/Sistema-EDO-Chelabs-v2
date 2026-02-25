'use client'

import { usePresence } from '@/components/providers/presence-provider'
import { cn } from '@/lib/utils'

interface UserPresenceBadgeProps {
    userId: string
    className?: string
    showText?: boolean
}

export function UserPresenceBadge({ userId, className, showText = false }: UserPresenceBadgeProps) {
    const { isOnline } = usePresence()
    const online = isOnline(userId)

    return (
        <div className={cn("flex items-center gap-2", className)} title={online ? "En línea" : "Desconectado"}>
            <div
                className={cn(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300",
                    online ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-700"
                )}
            />
            {showText && (
                <span className={cn(
                    "text-[10px] uppercase tracking-widest font-bold",
                    online ? "text-emerald-500" : "text-slate-400"
                )}>
                    {online ? 'Online' : 'Offline'}
                </span>
            )}
        </div>
    )
}
