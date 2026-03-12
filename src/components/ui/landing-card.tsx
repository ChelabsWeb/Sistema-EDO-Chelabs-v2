'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ColorScheme = 'blue' | 'purple' | 'orange' | 'emerald' | 'slate'

interface LandingCardProps {
  title: string
  description: string
  icon?: LucideIcon
  colorScheme?: ColorScheme
  index?: number
  className?: string
  actionLabel?: string
  isHighlight?: boolean
  children?: React.ReactNode
}

const colorMaps: Record<ColorScheme, string> = {
  blue: "bg-primary/10 text-primary border border-primary/20",
  purple: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
  emerald: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  slate: "bg-secondary/50 text-muted-foreground border border-border/50",
}

export function LandingCard({
  title, description, icon: Icon, colorScheme = 'blue', 
  index = 0, className, actionLabel, isHighlight, children
}: LandingCardProps) {
  
  const baseCardStyle = isHighlight
    ? "bg-primary/5 dark:bg-primary/10 border-primary shadow-md z-10 scale-100 hover:scale-[1.02]"
    : "bg-card dark:bg-card/40 border-border dark:border-white/5 shadow-sm hover:border-primary/30 dark:hover:border-white/10 hover:-translate-y-2 backdrop-blur-sm"

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative p-10 md:p-12 rounded-[48px] border transition-transform duration-500 flex flex-col items-start text-left overflow-hidden",
        baseCardStyle,
        className
      )}
    >
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

      {isHighlight && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-b-2xl shadow-sm z-20">
          Más Popular
        </div>
      )}

      {Icon && (
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 shrink-0 relative z-10",
          colorMaps[colorScheme]
        )}>
          <Icon className="w-7 h-7" strokeWidth={1.5} />
        </div>
      )}

      <h3 className="text-2xl font-bold mb-4 tracking-tight leading-tight text-foreground relative z-10">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 relative z-10 leading-relaxed">
        {description}
      </p>

      {children && <div className="w-full mb-8 flex-1 relative z-10">{children}</div>}

      {actionLabel && (
        <div className="flex items-center text-primary font-bold text-sm mt-auto relative z-10 group-hover:gap-2 transition-all">
          {actionLabel} <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </motion.div>
  )
}
