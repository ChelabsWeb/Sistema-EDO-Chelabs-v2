'use client'

import { DeleteButton } from '@/components/shared/delete-button'
import { deleteInsumo } from '@/app/actions/insumos'

interface DeleteInsumoButtonProps {
  insumoId: string
  insumoNombre: string
}

export function DeleteInsumoButton({ insumoId, insumoNombre }: DeleteInsumoButtonProps) {
  const handleDelete = async () => {
    return await deleteInsumo(insumoId)
  }

  return (
    <DeleteButton
      onDelete={handleDelete}
      itemName={`el insumo "${insumoNombre}"`}
      variant="link"
      className="text-red-600 hover:text-red-800 ml-4"
    />
  )
}
