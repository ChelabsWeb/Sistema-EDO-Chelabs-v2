'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveOT, startOTExecution, closeOT, deleteOT } from '@/app/actions/ordenes-trabajo'
import { formatPesos } from '@/lib/utils/currency'
import type { OTStatus } from '@/types/database'
import {
  CheckCircle2, PlayCircle, Archive, Trash2,
  X, AlertCircle, Loader2, Info, TrendingDown,
  ChevronRight, Sparkles, Building2, Edit3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OTActionsProps {
  otId: string
  obraId: string
  estado: OTStatus | string
  canApprove: boolean
  canExecute: boolean
  costoEstimado: number
  costoReal: number
}

export function OTActions({
  otId,
  obraId,
  estado,
  canApprove,
  canExecute,
  costoEstimado,
  costoReal,
}: OTActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState<'approve' | 'start' | 'close' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [acknowledgeDeviation, setAcknowledgeDeviation] = useState(false)

  const desvio = costoReal - costoEstimado
  const hasDeviation = desvio > 0
  const desvioPercent = costoEstimado > 0 ? (desvio / costoEstimado) * 100 : 0

  const handleApprove = async () => {
    setIsLoading(true); setError(null)
    const result = await approveOT({ id: otId, acknowledge_budget_exceeded: true })
    if (result.success) { setShowConfirmModal(null); router.refresh() }
    else setError(result.error); setIsLoading(false)
  }

  const handleStart = async () => {
    setIsLoading(true); setError(null)
    const result = await startOTExecution(otId)
    if (result.success) { setShowConfirmModal(null); router.refresh() }
    else setError(result.error); setIsLoading(false)
  }

  const handleClose = async () => {
    setIsLoading(true); setError(null)
    const result = await closeOT({ id: otId, acknowledge_deviation: acknowledgeDeviation || !hasDeviation })
    if (result.success) { setShowConfirmModal(null); router.refresh() }
    else setError(result.error); setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true); setError(null)
    const result = await deleteOT(otId)
    if (result.success) router.push(`/obras/${obraId}/ordenes-trabajo`)
    else setError(result.error); setIsLoading(false)
  }

  const closeModal = () => {
    setShowConfirmModal(null)
    setError(null)
    setAcknowledgeDeviation(false)
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Approve - only for borrador and DO */}
        {estado === 'borrador' && canApprove && (
          <div className="flex items-center gap-2">
            <Link
              href={`/obras/${obraId}/ordenes-trabajo/${otId}/editar`}
              className="h-12 px-6 bg-white dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 text-apple-gray-400 hover:text-apple-blue rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Editar Borrador
            </Link>
            <button
              onClick={() => setShowConfirmModal('approve')}
              className="h-12 px-8 bg-apple-blue text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-apple-blue-dark transition-all active:scale-95 shadow-apple-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aprobar Orden
            </button>
          </div>
        )}

        {/* Start Execution - only for aprobada */}
        {estado === 'aprobada' && canExecute && (
          <button
            onClick={() => setShowConfirmModal('start')}
            className="h-12 px-8 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-95 shadow-apple-sm flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            Iniciar Ejecución
          </button>
        )}

        {/* Close - only for en_ejecucion */}
        {estado === 'en_ejecucion' && canExecute && (
          <button
            onClick={() => setShowConfirmModal('close')}
            className="h-12 px-8 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-apple-sm flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            Finalizar Trabajo
          </button>
        )}

        {/* Delete - DO only */}
        {canApprove && (
          <button
            onClick={() => setShowConfirmModal('delete')}
            className="w-12 h-12 flex items-center justify-center text-apple-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all active:scale-90"
            title="Archivar Orden"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Premium Confirmation Modals */}
      <Dialog open={!!showConfirmModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md bg-white dark:bg-apple-gray-50 flex flex-col p-0 overflow-hidden rounded-[48px] border border-apple-gray-100 dark:border-white/5 shadow-2xl gap-0">
          <div className="p-10 space-y-8">
            {/* Modal Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "w-20 h-20 rounded-[32px] flex items-center justify-center shadow-inner",
                showConfirmModal === 'delete' ? "bg-red-500/10 text-red-500" :
                  showConfirmModal === 'approve' ? "bg-apple-blue/10 text-apple-blue" :
                    showConfirmModal === 'start' ? "bg-amber-500/10 text-amber-500" :
                      "bg-emerald-500/10 text-emerald-500"
              )}>
                {showConfirmModal === 'delete' && <Trash2 className="w-10 h-10" />}
                {showConfirmModal === 'approve' && <CheckCircle2 className="w-10 h-10" />}
                {showConfirmModal === 'start' && <PlayCircle className="w-10 h-10" />}
                {showConfirmModal === 'close' && <Archive className="w-10 h-10" />}
              </div>
              <DialogHeader className="m-0 space-y-2">
                <DialogTitle className="text-2xl font-black text-foreground tracking-tighter uppercase text-center m-0">
                  {showConfirmModal === 'approve' ? 'Confirmar Aprobación' :
                    showConfirmModal === 'start' ? 'Iniciar Operación' :
                      showConfirmModal === 'close' ? 'Certificar Finalización' :
                        'Archivar Documento'}
                </DialogTitle>
                <p className="text-sm font-medium text-apple-gray-400 leading-relaxed text-center">
                  {showConfirmModal === 'approve' ? 'Se comprometerá el presupuesto y se autorizará la ejecución.' :
                    showConfirmModal === 'start' ? 'La orden pasará a estado activo para registro de avances.' :
                      showConfirmModal === 'close' ? 'Se darán por concluidas las tareas y se cerrarán costeo finales.' :
                        'Esta orden será movida a la papelera del sistema.'}
                </p>
              </DialogHeader>
            </div>

            {/* Context Cards */}
            {showConfirmModal === 'approve' && (
              <div className="p-6 bg-apple-gray-50 dark:bg-black/20 rounded-3xl border border-apple-gray-100 dark:border-white/5 flex flex-col items-center">
                <span className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Inversión Estimada</span>
                <span className="text-2xl font-black text-apple-blue tracking-tighter">{formatPesos(costoEstimado)}</span>
              </div>
            )}

            {showConfirmModal === 'close' && hasDeviation && (
              <div className="space-y-4">
                <div className="p-6 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between text-red-500">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[11px] font-black uppercase tracking-wider">Alerta de Desvío</span>
                    </div>
                    <span className="text-lg font-black tracking-tighter">+{desvioPercent.toFixed(1)}%</span>
                  </div>
                  <label className="flex items-start gap-4 cursor-pointer">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={acknowledgeDeviation}
                        onChange={(e) => setAcknowledgeDeviation(e.target.checked)}
                        className="w-5 h-5 rounded-lg text-red-600 border-red-200 focus:ring-red-500/20 transition-all"
                      />
                    </div>
                    <span className="text-xs font-bold text-red-600/70 leading-relaxed">
                      Reconozco que el costo real ha superado la estimación inicial por {formatPesos(desvio)}.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-black uppercase tracking-tight">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={
                  showConfirmModal === 'approve' ? handleApprove :
                    showConfirmModal === 'start' ? handleStart :
                      showConfirmModal === 'close' ? handleClose :
                        handleDelete
                }
                disabled={isLoading || (showConfirmModal === 'close' && hasDeviation && !acknowledgeDeviation)}
                className={cn(
                  "h-16 w-full rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-30",
                  showConfirmModal === 'delete' ? 'bg-red-500 text-white' :
                    showConfirmModal === 'approve' ? 'bg-apple-blue text-white' :
                      showConfirmModal === 'start' ? 'bg-amber-500 text-white' :
                        'bg-emerald-500 text-white'
                )}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                  showConfirmModal === 'approve' ? 'Confirmar Aprobación' :
                    showConfirmModal === 'start' ? 'Iniciar Ahora' :
                      showConfirmModal === 'close' ? 'Cerrar con Éxito' :
                        'Confirmar Archivado'}
              </button>
              <button
                onClick={closeModal}
                className="h-16 w-full text-[10px] font-black text-apple-gray-300 uppercase tracking-widest hover:text-foreground transition-all"
              >
                Mejor no, volver
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
