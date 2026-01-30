'use client'

import React from 'react'
import { Building2, ShoppingCart, User, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItemProps {
    type: 'ot' | 'compra' | 'user' | string
    title: string
    desc: string
    time: string
    status?: 'success' | 'warning' | 'info' | 'error'
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

export function ActivityItem({ type, title, desc, time, status = 'info' }: ActivityItemProps) {
    const Icon = icons[type] || icons.default

    return (
        <div className="flex gap-4 group cursor-default">
            <div className="relative flex flex-col items-center">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    "bg-apple-gray-50 dark:bg-white/[0.03] text-apple-gray-400 group-hover:text-apple-blue"
                )}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="w-px h-full bg-apple-gray-100 dark:bg-white/[0.05] my-2" />
                <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-apple-gray-50", statusColors[status])} />
            </div>
            <div className="flex-1 pb-8">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>
                    <span className="text-[10px] font-medium text-apple-gray-300 uppercase">{time}</span>
                </div>
                <p className="text-xs text-apple-gray-400 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
