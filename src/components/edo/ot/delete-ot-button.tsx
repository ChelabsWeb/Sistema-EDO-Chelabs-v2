'use client'

import { DeleteButton } from '@/components/shared/delete-button'
import { deleteOT } from '@/app/actions/ordenes-trabajo'

interface DeleteOTButtonProps {
  otId: string
  otNumero: number
  obraId: string
  disabled?: boolean
}

export function DeleteOTButton({ otId, otNumero, obraId, disabled }: DeleteOTButtonProps) {
  const handleDelete = async () => {
    return await deleteOT(otId)
  }

  if (disabled) {
    return null
  }

  return (
    <DeleteButton
      onDelete={handleDelete}
      itemName={`la OT-${otNumero}`}
      confirmMessage={`¿Esta seguro que desea eliminar la OT-${otNumero}? Se eliminaran todas las tareas y datos asociados. Esta accion no se puede deshacer.`}
      redirectTo={`/obras/${obraId}/ordenes-trabajo`}
    />
  )
}
