'use client'

import { DeleteButton } from '@/components/shared/delete-button'
import { deleteRubro } from '@/app/actions/rubros'

interface DeleteRubroButtonProps {
  rubroId: string
  rubroNombre: string
}

export function DeleteRubroButton({ rubroId, rubroNombre }: DeleteRubroButtonProps) {
  const handleDelete = async () => {
    return await deleteRubro(rubroId)
  }

  return (
    <DeleteButton
      onDelete={handleDelete}
      itemName={`el rubro "${rubroNombre}"`}
      variant="link"
    />
  )
}
