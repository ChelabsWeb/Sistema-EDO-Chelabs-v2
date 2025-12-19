'use client'

import { DeleteButton } from '@/components/shared/delete-button'
import { deleteObra } from '@/app/actions/obras'

interface DeleteObraButtonProps {
  obraId: string
  obraNombre: string
}

export function DeleteObraButton({ obraId, obraNombre }: DeleteObraButtonProps) {
  const handleDelete = async () => {
    return await deleteObra(obraId)
  }

  return (
    <DeleteButton
      onDelete={handleDelete}
      itemName={`la obra "${obraNombre}"`}
      confirmMessage={`¿Esta seguro que desea eliminar la obra "${obraNombre}"? Se eliminaran todos los rubros, insumos y OTs en borrador asociados. Esta accion no se puede deshacer.`}
      redirectTo="/obras"
    />
  )
}
