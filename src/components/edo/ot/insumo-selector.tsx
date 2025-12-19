'use client'

import { useState, useEffect, useMemo } from 'react'
import { formatPesos } from '@/lib/utils/currency'

export interface InsumoSeleccionado {
  insumo_id: string
  nombre: string
  unidad: string
  cantidad: number
  precio_unitario: number
  seleccionado: boolean
  es_sugerido: boolean // true si viene de la fórmula del rubro
}

interface FormulaItem {
  insumo_id: string
  nombre: string
  unidad: string
  cantidad_por_unidad: number
  precio_referencia: number
}

interface InsumoObra {
  id: string
  nombre: string
  unidad: string
  tipo: 'material' | 'mano_de_obra'
  precio_referencia: number | null
  precio_unitario: number | null
}

interface InsumoSelectorProps {
  obraId: string
  rubroId: string
  formulaItems: FormulaItem[]
  insumosObra: InsumoObra[]
  onChange: (insumos: InsumoSeleccionado[]) => void
  isLoading?: boolean
}

export function InsumoSelector({
  obraId,
  rubroId,
  formulaItems,
  insumosObra,
  onChange,
  isLoading = false,
}: InsumoSelectorProps) {
  const [insumos, setInsumos] = useState<InsumoSeleccionado[]>([])
  const [showAddInsumo, setShowAddInsumo] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Initialize insumos from formula items when they change
  useEffect(() => {
    if (formulaItems.length === 0) {
      setInsumos([])
      return
    }

    const nuevosInsumos: InsumoSeleccionado[] = formulaItems.map((item) => ({
      insumo_id: item.insumo_id,
      nombre: item.nombre,
      unidad: item.unidad,
      cantidad: item.cantidad_por_unidad, // Default to formula amount
      precio_unitario: item.precio_referencia,
      seleccionado: true, // Pre-selected by default
      es_sugerido: true,
    }))

    setInsumos(nuevosInsumos)
  }, [formulaItems])

  // Notify parent when insumos change
  useEffect(() => {
    onChange(insumos.filter((i) => i.seleccionado))
  }, [insumos, onChange])

  // Available insumos to add (not already in the list)
  const insumosDisponibles = useMemo(() => {
    const idsEnLista = new Set(insumos.map((i) => i.insumo_id))
    return insumosObra.filter(
      (i) =>
        !idsEnLista.has(i.id) &&
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [insumosObra, insumos, searchTerm])

  // Calculate totals
  const totales = useMemo(() => {
    const seleccionados = insumos.filter((i) => i.seleccionado)
    const materiales = seleccionados.filter((i) => {
      const insumoObra = insumosObra.find((io) => io.id === i.insumo_id)
      return insumoObra?.tipo === 'material'
    })
    const manoDeObra = seleccionados.filter((i) => {
      const insumoObra = insumosObra.find((io) => io.id === i.insumo_id)
      return insumoObra?.tipo === 'mano_de_obra'
    })

    const costoMateriales = materiales.reduce(
      (sum, i) => sum + i.cantidad * i.precio_unitario,
      0
    )
    const costoManoDeObra = manoDeObra.reduce(
      (sum, i) => sum + i.cantidad * i.precio_unitario,
      0
    )

    return {
      total: costoMateriales + costoManoDeObra,
      materiales: costoMateriales,
      manoDeObra: costoManoDeObra,
      cantidadSeleccionados: seleccionados.length,
    }
  }, [insumos, insumosObra])

  const toggleInsumo = (insumoId: string) => {
    setInsumos((prev) =>
      prev.map((i) =>
        i.insumo_id === insumoId ? { ...i, seleccionado: !i.seleccionado } : i
      )
    )
  }

  const updateCantidad = (insumoId: string, cantidad: number) => {
    setInsumos((prev) =>
      prev.map((i) =>
        i.insumo_id === insumoId ? { ...i, cantidad: Math.max(0, cantidad) } : i
      )
    )
  }

  const addInsumo = (insumoObra: InsumoObra) => {
    const nuevoInsumo: InsumoSeleccionado = {
      insumo_id: insumoObra.id,
      nombre: insumoObra.nombre,
      unidad: insumoObra.unidad,
      cantidad: 1,
      precio_unitario: insumoObra.precio_referencia || insumoObra.precio_unitario || 0,
      seleccionado: true,
      es_sugerido: false,
    }
    setInsumos((prev) => [...prev, nuevoInsumo])
    setShowAddInsumo(false)
    setSearchTerm('')
  }

  const removeInsumo = (insumoId: string) => {
    setInsumos((prev) => prev.filter((i) => i.insumo_id !== insumoId || i.es_sugerido))
    // If it's a suggested one, just deselect it instead of removing
    setInsumos((prev) =>
      prev.map((i) =>
        i.insumo_id === insumoId && i.es_sugerido ? { ...i, seleccionado: false } : i
      )
    )
  }

  const selectAll = () => {
    setInsumos((prev) => prev.map((i) => ({ ...i, seleccionado: true })))
  }

  const deselectAll = () => {
    setInsumos((prev) => prev.map((i) => ({ ...i, seleccionado: false })))
  }

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full" />
          <span className="ml-2 text-sm text-gray-500">Cargando insumos sugeridos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-md">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Insumos para la OT</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {totales.cantidadSeleccionados} insumo(s) seleccionado(s)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Seleccionar todos
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Ninguno
          </button>
        </div>
      </div>

      {/* Insumos list */}
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {insumos.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Este rubro no tiene insumos sugeridos en su formula.
            <br />
            Puede agregar insumos manualmente.
          </div>
        ) : (
          insumos.map((insumo) => (
            <div
              key={insumo.insumo_id}
              className={`p-3 flex items-center gap-3 ${
                insumo.seleccionado ? 'bg-white' : 'bg-gray-50 opacity-60'
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={insumo.seleccionado}
                onChange={() => toggleInsumo(insumo.insumo_id)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />

              {/* Insumo info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {insumo.nombre}
                  </span>
                  {insumo.es_sugerido && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      Sugerido
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPesos(insumo.precio_unitario)} / {insumo.unidad}
                </div>
              </div>

              {/* Cantidad input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={insumo.cantidad}
                  onChange={(e) =>
                    updateCantidad(insumo.insumo_id, parseFloat(e.target.value) || 0)
                  }
                  disabled={!insumo.seleccionado}
                  min="0"
                  step="0.01"
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
                <span className="text-xs text-gray-500 w-8">{insumo.unidad}</span>
              </div>

              {/* Subtotal */}
              <div className="text-right min-w-[80px]">
                <div className="text-sm font-medium text-gray-900">
                  {formatPesos(insumo.cantidad * insumo.precio_unitario)}
                </div>
              </div>

              {/* Remove button for non-suggested */}
              {!insumo.es_sugerido && (
                <button
                  type="button"
                  onClick={() => removeInsumo(insumo.insumo_id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Quitar insumo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add insumo section */}
      <div className="border-t border-gray-200 p-3">
        {showAddInsumo ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Buscar insumo de la obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              {insumosDisponibles.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No hay insumos disponibles
                </div>
              ) : (
                insumosDisponibles.slice(0, 10).map((insumo) => (
                  <button
                    key={insumo.id}
                    type="button"
                    onClick={() => addInsumo(insumo)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-900">{insumo.nombre}</span>
                    <span className="text-xs text-gray-500">{insumo.unidad}</span>
                  </button>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddInsumo(false)
                setSearchTerm('')
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddInsumo(true)}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar otro insumo de la obra
          </button>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Materiales:</span>
            <span>{formatPesos(totales.materiales)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Mano de Obra:</span>
            <span>{formatPesos(totales.manoDeObra)}</span>
          </div>
          <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-200">
            <span>Total Estimado:</span>
            <span className="text-blue-600">{formatPesos(totales.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
