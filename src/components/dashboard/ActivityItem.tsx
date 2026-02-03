'use client'

import React from 'react'
import Link from 'next/link'
import { Building2, ShoppingCart, User, HelpCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItemProps {
    type: 'ot' | 'compra' | 'user' | string
    title: string
    desc: string
    time: string
    status?: 'success' | 'warning' | 'info' | 'error'
    link?: string
    metadata?: any
}

const icons: Record<string, any> = {
    ot: Building2,
    compra: ShoppingCart,
    user: User,
    default: HelpCircle
}

const statusColors: Record<string, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    error: 'bg-red-500',
}

export function ActivityItem({ type, title, desc, time, status = 'info', link, metadata }: ActivityItemProps) {
    const Icon = icons[type] || icons.default

    const content = (
        <>
            <div className="relative flex flex-col items-center">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    "bg-apple-gray-50 dark:bg-white/[0.03] text-apple-gray-400",
                    link && "group-hover:scale-110 group-hover:text-apple-blue group-hover:bg-apple-blue/10"
                )}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="w-px h-full bg-apple-gray-100 dark:bg-white/[0.05] my-2" />
                <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-apple-gray-50", statusColors[status])} />
            </div>
            <div className="flex-1 pb-8">
                <div className="flex items-center justify-between mb-1">
                    <h4 className={cn(
                        "text-sm font-bold tracking-tight flex items-center gap-2",
                        link ? "text-foreground group-hover:text-apple-blue" : "text-foreground"
                    )}>
                        {title}
                        {link && <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </h4>
                    <span className="text-[10px] font-medium text-apple-gray-300 uppercase">{time}</span>
                </div>
                <p className="text-xs text-apple-gray-400 font-medium leading-relaxed">{desc}</p>

                {/* Show metadata if available */}
                {metadata && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {metadata.numero && (
                            <span className="px-2 py-0.5 bg-apple-gray-50 dark:bg-white/5 rounded text-[10px] font-bold text-apple-gray-400">
                                #{metadata.numero}
                            </span>
                        )}
                        {metadata.estado && (
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold",
                                metadata.estado === 'en_ejecucion' && "bg-emerald-500/10 text-emerald-600",
                                metadata.estado === 'cerrada' && "bg-blue-500/10 text-blue-600",
                                metadata.estado === 'borrador' && "bg-amber-500/10 text-amber-600",
                                metadata.estado === 'pendiente' && "bg-amber-500/10 text-amber-600",
                                metadata.estado === 'recibida_completa' && "bg-emerald-500/10 text-emerald-600"
                            )}>
                                {metadata.estado.replace('_', ' ')}
                            </span>
                        )}
                        {metadata.costo_estimado && (
                            <span className="px-2 py-0.5 bg-apple-blue/10 text-apple-blue rounded text-[10px] font-bold">
                                ${metadata.costo_estimado.toLocaleString()}
                            </span>
                        )}
                        {metadata.total && (
                            <span className="px-2 py-0.5 bg-apple-blue/10 text-apple-blue rounded text-[10px] font-bold">
                                ${metadata.total.toLocaleString()}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </>
    )

    if (link) {
        return (
            <Link href={link} className="flex gap-4 group cursor-pointer hover:bg-apple-gray-50/50 dark:hover:bg-white/[0.02] -mx-4 px-4 py-2 rounded-2xl transition-all">
                {content}
            </Link>
        )
    }

    return (
        <div className="flex gap-4 group cursor-default">
            {content}
        </div>
    )
}
