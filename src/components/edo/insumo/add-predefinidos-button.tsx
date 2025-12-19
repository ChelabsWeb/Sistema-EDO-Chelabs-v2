'use client'

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { InsumosPredefinidosDialog } from './insumos-predefinidos-dialog'
import { Button } from '@/components/ui/button'

interface AddPredefinidosButtonProps {
  obraId: string
}

export function AddPredefinidosButton({ obraId }: AddPredefinidosButtonProps) {
  const router = useRouter()

  const handleInsumosAdded = (result: { creados: number; omitidos: number }) => {
    if (result.creados > 0) {
      toast.success(
        `Se agregaron ${result.creados} insumo(s)${
          result.omitidos > 0 ? ` (${result.omitidos} omitidos por duplicados)` : ''
        }`
      )
    } else if (result.omitidos > 0) {
      toast.info(`Todos los insumos seleccionados ya existen en la obra`)
    }
    router.refresh()
  }

  return (
    <InsumosPredefinidosDialog
      obraId={obraId}
      onInsumosAdded={handleInsumosAdded}
      trigger={
        <Button variant="outline" className="gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Agregar Predefinidos
        </Button>
      }
    />
  )
}
