'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BentoTileProps {
    children: React.ReactNode
    className?: string
    title?: string
    subtitle?: string
    icon?: any
    span?: 'col-span-1' | 'col-span-2' | 'col-span-3' | 'col-span-4'
    rowSpan?: 'row-span-1' | 'row-span-2'
    delay?: number
}

export function BentoTile({
    children,
    className,
    title,
    subtitle,
    icon: Icon,
    span = 'col-span-1',
    rowSpan = 'row-span-1',
    delay = 0
}: BentoTileProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={cn(
                "bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/[0.05] rounded-[32px] shadow-apple overflow-hidden flex flex-col group",
                span,
                rowSpan,
                className
            )}
        >
            {(title || Icon) && (
                <div className="px-8 pt-8 flex items-center justify-between">
                    <div className="space-y-1">
                        {title && <h3 className="text-[10px] font-black text-apple-gray-300 dark:text-apple-gray-400 uppercase tracking-[0.2em]">{title}</h3>}
                        {subtitle && <p className="text-lg font-bold text-foreground tracking-tight">{subtitle}</p>}
                    </div>
                    {Icon && (
                        <div className="w-10 h-10 rounded-xl bg-apple-gray-50 dark:bg-white/[0.03] flex items-center justify-center text-apple-gray-300 group-hover:text-apple-blue transition-colors">
                            <Icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                    )}
                </div>
            )}
            <div className="flex-1 p-8">
                {children}
            </div>
        </motion.div>
    )
}
