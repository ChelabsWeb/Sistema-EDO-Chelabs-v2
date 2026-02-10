'use client'

import * as React from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as PopoverPrimitive from '@radix-ui/react-popover'

interface Option {
    id: string
    nombre: string
    unidad?: string | null
    subtitle?: string
}

interface AppleSelectorProps {
    options: Option[]
    value: string
    onSelect: (id: string) => void
    placeholder?: string
    label?: string
    icon?: React.ReactNode
    className?: string
    disabled?: boolean
    searchPlaceholder?: string
    size?: 'default' | 'sm'
}

export function AppleSelector({
    options,
    value,
    onSelect,
    placeholder = "Seleccionar...",
    label,
    icon,
    className,
    disabled = false,
    searchPlaceholder = "Buscar...",
    size = 'default'
}: AppleSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')

    const selectedOption = options.find(o => o.id === value)

    const filteredOptions = options.filter(o =>
        o.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (o.subtitle && o.subtitle.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className={cn("space-y-4 w-full", className)}>
            {label && (
                <div className="flex items-center gap-3 px-2">
                    {icon}
                    <label className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">{label}</label>
                </div>
            )}

            <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
                <PopoverPrimitive.Trigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        className={cn(
                            "w-full pl-8 pr-16 bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-200 dark:border-white/10 rounded-[28px] text-left outline-none transition-all flex flex-col justify-center gap-1 group relative",
                            size === 'sm' ? 'h-14 rounded-[20px] px-6' : 'h-20',
                            open ? "ring-8 ring-apple-blue/10 border-apple-blue shadow-apple-md" : "hover:border-apple-gray-300 dark:hover:border-white/20",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {selectedOption ? (
                            <>
                                <span className={cn(
                                    "font-black text-foreground tracking-tight line-clamp-1",
                                    size === 'sm' ? 'text-sm' : 'text-xl'
                                )}>
                                    {selectedOption.nombre} {selectedOption.unidad ? `(${selectedOption.unidad})` : ''}
                                </span>
                                {selectedOption.subtitle && size === 'default' && (
                                    <span className="text-[10px] font-bold text-apple-gray-300 uppercase tracking-widest leading-none">
                                        {selectedOption.subtitle}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className={cn(
                                "font-black text-apple-gray-200 dark:text-apple-gray-400/30 group-hover:text-apple-gray-400 transition-colors",
                                size === 'sm' ? 'text-sm' : 'text-xl'
                            )}>
                                {placeholder}
                            </span>
                        )}

                        <div className={cn(
                            "absolute top-1/2 -translate-y-1/2 text-apple-gray-300 group-hover:text-apple-blue transition-colors",
                            size === 'sm' ? 'right-5' : 'right-8'
                        )}>
                            <ChevronDown className={cn(
                                "transition-transform duration-500",
                                size === 'sm' ? 'w-4 h-4' : 'w-6 h-6',
                                open && "rotate-180"
                            )} />
                        </div>
                    </button>
                </PopoverPrimitive.Trigger>

                <PopoverPrimitive.Portal>
                    <PopoverPrimitive.Content
                        align="start"
                        sideOffset={12}
                        className={cn(
                            "z-[100] w-[var(--radix-popover-trigger-width)] max-h-[460px] bg-white/95 dark:bg-apple-gray-50/95 backdrop-blur-2xl rounded-[40px] border border-apple-gray-100 dark:border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col animate-apple-fade-in",
                            "focus:outline-none"
                        )}
                    >
                        {/* Search Input */}
                        <div className="p-6 border-b border-apple-gray-100 dark:border-white/5 relative bg-apple-gray-50/50 dark:bg-black/20">
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-300" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-14 pl-12 pr-6 bg-white dark:bg-white/5 border border-apple-gray-100 dark:border-white/5 rounded-2xl text-base font-bold text-foreground focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all"
                                autoFocus
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-10 top-1/2 -translate-y-1/2 text-apple-gray-300 hover:text-foreground transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Options List */}
                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="py-16 text-center text-apple-gray-300 font-bold">
                                    No se encontraron resultados
                                </div>
                            ) : (
                                <div className="grid gap-1">
                                    {filteredOptions.map((option) => {
                                        const isSelected = option.id === value
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    onSelect(option.id)
                                                    setOpen(false)
                                                    setSearch('')
                                                }}
                                                className={cn(
                                                    "w-full p-6 rounded-[24px] text-left transition-all flex items-center justify-between group",
                                                    isSelected
                                                        ? "bg-apple-blue text-white shadow-lg shadow-apple-blue/20"
                                                        : "hover:bg-apple-gray-50 dark:hover:bg-white/5 text-foreground"
                                                )}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "text-lg font-black tracking-tight leading-none",
                                                        isSelected ? "text-white" : "text-foreground group-hover:text-apple-blue"
                                                    )}>
                                                        {option.nombre} {option.unidad ? `(${option.unidad})` : ''}
                                                    </span>
                                                    {option.subtitle && (
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest opacity-60",
                                                            isSelected ? "text-white" : "text-apple-gray-300"
                                                        )}>
                                                            {option.subtitle}
                                                        </span>
                                                    )}
                                                </div>
                                                {isSelected && <Check className="w-6 h-6 text-white" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer Decoration */}
                        <div className="h-6 bg-gradient-to-b from-transparent to-apple-gray-50/10 dark:to-white/5 shrink-0" />
                    </PopoverPrimitive.Content>
                </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
        </div>
    )
}
