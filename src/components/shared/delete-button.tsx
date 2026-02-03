'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeleteButtonProps {
  onDelete: () => Promise<{ success: boolean; error?: string }>
  itemName: string
  confirmMessage?: string
  redirectTo?: string
  variant?: 'button' | 'link' | 'icon'
  className?: string
}

export function DeleteButton({
  onDelete,
  itemName,
  confirmMessage,
  redirectTo,
  variant = 'button',
  className = '',
}: DeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await onDelete()

      if (result.success) {
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          router.refresh()
          setShowConfirm(false)
          setIsDeleting(false)
        }
      } else {
        setError(result.error || 'Error al eliminar')
        setIsDeleting(false)
      }
    } catch (e) {
      setError('Ocurrió un error inesperado')
      setIsDeleting(false)
    }
  }

  const baseStyles = {
    button: 'h-10 px-4 flex items-center justify-center gap-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/20',
    link: 'text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest px-2 py-1 hover:bg-red-500/10 rounded-lg',
    icon: 'w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/10 hover:shadow-lg active:scale-90',
  }

  return (
    <>
      {error && (
        <div className="fixed top-6 right-6 z-[100] bg-white dark:bg-black border border-red-500/20 rounded-2xl p-4 shadow-apple-lg max-w-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Error al eliminar</p>
              <p className="text-xs text-apple-gray-400 mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className={cn(baseStyles[variant], className)}
        disabled={isDeleting}
      >
        {variant === 'icon' ? (
          <Trash2 className="w-5 h-5" />
        ) : (
          <>
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </>
        )}
      </button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[32px] border-apple-gray-100 dark:border-white/10 shadow-apple-lg">
          <div className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-[24px] bg-red-500/10 flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-center">¿Estás seguro?</DialogTitle>
                <DialogDescription className="text-base font-medium text-apple-gray-400 text-center max-w-[280px] mx-auto">
                  {confirmMessage || `Esta acción eliminará "${itemName}" y no se puede deshacer.`}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex sm:flex-row flex-col gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowConfirm(false)}
              className="flex-1 h-12 rounded-2xl text-xs font-black uppercase tracking-widest text-apple-gray-400 hover:text-foreground transition-all order-2 sm:order-1"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-[1.5] h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all order-1 sm:order-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Eliminando...</span>
                </div>
              ) : (
                'Sí, eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
