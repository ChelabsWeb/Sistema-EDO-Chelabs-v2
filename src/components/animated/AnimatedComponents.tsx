'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ArrowRight, Package, TrendingUp, AlertCircle,
    CheckCircle2, Clock, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Collection of animated components using Framer Motion + shadcn
 * Ready to use in your app!
 */

// 1. Animated Card with Hover Effect
export function AnimatedCard({
    title,
    description,
    children,
    className
}: {
    title: string
    description?: string
    children?: React.ReactNode
    className?: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                y: -8,
                boxShadow: '0 20px 40px rgba(0,113,227,0.15)'
            }}
            transition={{ duration: 0.3 }}
            className={className}
        >
            <Card className="border-apple-gray-100 dark:border-white/5">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                {children && <CardContent>{children}</CardContent>}
            </Card>
        </motion.div>
    )
}

// 2. Staggered List Animation
export function StaggeredList({
    items
}: {
    items: Array<{ id: string; content: React.ReactNode }>
}) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
        >
            {items.map((listItem) => (
                <motion.div key={listItem.id} variants={item}>
                    {listItem.content}
                </motion.div>
            ))}
        </motion.div>
    )
}

// 3. Animated Stats Card
export function AnimatedStatCard({
    title,
    value,
    change,
    icon: Icon,
    trend = 'up'
}: {
    title: string
    value: string | number
    change?: string
    icon: any
    trend?: 'up' | 'down' | 'neutral'
}) {
    const trendColors = {
        up: 'text-emerald-500',
        down: 'text-red-500',
        neutral: 'text-apple-gray-400'
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="border-apple-gray-100 dark:border-white/5">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest mb-2">
                                {title}
                            </p>
                            <motion.h3
                                className="text-4xl font-black text-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {value}
                            </motion.h3>
                            {change && (
                                <p className={cn("text-sm font-bold mt-2", trendColors[trend])}>
                                    {change}
                                </p>
                            )}
                        </div>
                        <motion.div
                            className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center"
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Icon className="w-7 h-7 text-apple-blue" />
                        </motion.div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// 4. Animated Button with Loading State
export function AnimatedButton({
    children,
    loading = false,
    icon: Icon,
    ...props
}: {
    children: React.ReactNode
    loading?: boolean
    icon?: any
} & React.ComponentProps<typeof Button>) {
    return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button {...props} disabled={loading || props.disabled}>
                {loading ? (
                    <>
                        <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Cargando...
                    </>
                ) : (
                    <>
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        {children}
                    </>
                )}
            </Button>
        </motion.div>
    )
}

// 5. Page Transition Wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    )
}

// 6. Animated Badge
export function AnimatedBadge({
    children,
    variant = 'default',
    pulse = false
}: {
    children: React.ReactNode
    variant?: 'default' | 'success' | 'warning' | 'error'
    pulse?: boolean
}) {
    const variants = {
        default: 'bg-apple-blue/10 text-apple-blue border-apple-blue/20',
        success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        error: 'bg-red-500/10 text-red-600 border-red-500/20'
    }

    return (
        <motion.span
            className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border",
                variants[variant]
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            {...(pulse && {
                animate: {
                    scale: [1, 1.05, 1],
                },
                transition: {
                    duration: 2,
                    repeat: Infinity,
                }
            })}
        >
            {children}
        </motion.span>
    )
}

// 7. Animated Progress Bar
export function AnimatedProgress({
    value,
    max = 100,
    color = 'bg-apple-blue'
}: {
    value: number
    max?: number
    color?: string
}) {
    const percentage = (value / max) * 100

    return (
        <div className="w-full h-2 bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
                className={cn("h-full rounded-full", color)}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
        </div>
    )
}

// 8. Animated Number Counter
export function AnimatedNumber({
    value,
    duration = 1
}: {
    value: number
    duration?: number
}) {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.span
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration }}
            >
                {value.toLocaleString()}
            </motion.span>
        </motion.span>
    )
}

// 9. Floating Action Button
export function FloatingActionButton({
    icon: Icon,
    label,
    onClick
}: {
    icon: any
    label: string
    onClick: () => void
}) {
    return (
        <motion.button
            className="fixed bottom-8 right-8 w-14 h-14 bg-apple-blue text-white rounded-full shadow-apple-float flex items-center justify-center group hover:w-auto hover:px-6 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
        >
            <Icon className="w-6 h-6" />
            <motion.span
                className="ml-2 font-bold text-sm whitespace-nowrap overflow-hidden"
                initial={{ width: 0, opacity: 0 }}
                whileHover={{ width: 'auto', opacity: 1 }}
            >
                {label}
            </motion.span>
        </motion.button>
    )
}

// 10. Animated Alert
export function AnimatedAlert({
    title,
    description,
    variant = 'info'
}: {
    title: string
    description: string
    variant?: 'info' | 'success' | 'warning' | 'error'
}) {
    const config = {
        info: { icon: AlertCircle, color: 'text-apple-blue', bg: 'bg-apple-blue/10', border: 'border-apple-blue/20' },
        success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        warning: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/20' }
    }

    const { icon: Icon, color, bg, border } = config[variant]

    return (
        <motion.div
            className={cn("p-4 rounded-2xl border flex items-start gap-4", bg, border)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
            >
                <Icon className={cn("w-6 h-6", color)} />
            </motion.div>
            <div className="flex-1">
                <h4 className="font-black text-foreground mb-1">{title}</h4>
                <p className="text-sm text-apple-gray-400">{description}</p>
            </div>
        </motion.div>
    )
}
