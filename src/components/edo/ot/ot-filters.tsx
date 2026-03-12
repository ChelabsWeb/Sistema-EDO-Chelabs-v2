'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OTStatusBadge } from './ot-status-badge'

interface OTFiltersProps {
  currentEstado?: string
  currentSearch?: string
}

const ESTADOS_OT = [
  { id: 'todos', nombre: 'Todos los estados' },
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
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar órdenes de trabajo por descripción o número..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-10 bg-background"
        />
        {searchValue && (
          <button
            onClick={() => {
              setSearchValue('')
              updateFilters('search', null)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="w-full sm:w-[240px]">
        <Select
          value={currentEstado || 'todos'}
          onValueChange={(val) => updateFilters('estado', val)}
        >
          <SelectTrigger className="w-full bg-background font-medium">
            <SelectValue placeholder="Estado de la Orden" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_OT.map((estado) => (
              <SelectItem key={estado.id} value={estado.id} className="cursor-pointer">
                {estado.id === 'todos' ? (
                  estado.nombre
                ) : (
                  <div className="flex items-center">
                    <OTStatusBadge estado={estado.id} size="sm" />
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleSearch}
        className="w-full sm:w-auto"
      >
        Filtrar
      </Button>
    </div>
  )
}
