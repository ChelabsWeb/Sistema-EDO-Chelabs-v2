'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Search, ChevronDown, SlidersHorizontal, X, Sliders } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { AppleSelector } from '@/components/ui/apple-selector'

interface OTFiltersProps {
  currentEstado?: string
  currentSearch?: string
}

const ESTADOS_OT = [
  { id: 'todos', nombre: 'Ver todos los estados' },
  { id: 'borrador', nombre: 'Borrador' },
  { id: 'aprobada', nombre: 'Aprobada' },
  { id: 'en_ejecucion', nombre: 'En Ejecución' },
  { id: 'cerrada', nombre: 'Cerrada' },
]

export function OTFilters({ currentEstado, currentSearch }: OTFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentSearch || '')
  const [isFocused, setIsFocused] = useState(false)

  const updateFilters = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'todos') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const handleSearch = () => {
    updateFilters('search', searchValue || null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 w-full animate-apple-fade-in">
      {/* Premium Search Container */}
      <div className="relative flex-1 w-full group">
        <div className={cn(
          "absolute left-6 top-1/2 -translate-y-1/2 transition-all duration-500 z-10",
          isFocused ? "text-apple-blue scale-110" : "text-apple-gray-300"
        )}>
          <Search className="w-5 h-5" strokeWidth={2.5} />
        </div>

        <input
          type="text"
          placeholder="Buscar órdenes de trabajo por descripción o número..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full h-16 pl-16 pr-14 bg-white dark:bg-apple-gray-50 border rounded-[22px] text-base font-bold tracking-tight outline-none transition-all duration-500 shadow-apple-sm",
            isFocused
              ? "border-apple-blue ring-8 ring-apple-blue/10 shadow-apple-md"
              : "border-apple-gray-100 dark:border-white/5 hover:border-apple-gray-200 dark:hover:border-white/10"
          )}
        />

        <AnimatePresence>
          {searchValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setSearchValue('')
                updateFilters('search', null)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-apple-gray-50 dark:bg-white/10 text-apple-gray-400 hover:text-foreground hover:bg-apple-gray-100 transition-all z-10"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* State AppleSelector */}
      <div className="w-full sm:w-[280px]">
        <AppleSelector
          options={ESTADOS_OT}
          value={currentEstado || 'todos'}
          onSelect={(val) => updateFilters('estado', val)}
          size="sm"
          placeholder="Estado de la Orden"
          searchPlaceholder="Filtrar estados..."
        />
      </div>

      {/* Execute Button */}
      <button
        onClick={handleSearch}
        className="w-full sm:w-auto h-16 px-10 bg-foreground text-background dark:bg-white dark:text-black rounded-[22px] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.03] active:scale-[0.97] transition-all shadow-apple-float"
      >
        Filtrar
      </button>
    </div>
  )
}
