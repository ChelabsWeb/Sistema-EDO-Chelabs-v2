/**
 * Currency conversion utilities for UR (Unidad Reajustable) and UYU (Pesos Uruguayos)
 */

import { DEFAULT_COTIZACION_UR } from '@/lib/constants/app'

const DEFAULT_COTIZACION = DEFAULT_COTIZACION_UR

/**
 * Convert UR to Pesos Uruguayos
 */
export function convertURtoPesos(ur: number, cotizacion: number = DEFAULT_COTIZACION): number {
  return ur * cotizacion
}

/**
 * Convert Pesos Uruguayos to UR
 */
export function convertPesosToUR(pesos: number, cotizacion: number = DEFAULT_COTIZACION): number {
  if (cotizacion === 0) return 0
  return pesos / cotizacion
}

/**
 * Format a number as Uruguayan Pesos
 */
export function formatPesos(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-'
  return `$${Number(amount).toLocaleString('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

/**
 * Format a number as UR
 */
export function formatUR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-'
  return `${Number(amount).toLocaleString('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} UR`
}

/**
 * Format amount showing both UR and Pesos
 */
export function formatURWithPesos(
  urAmount: number | null | undefined,
  cotizacion: number = DEFAULT_COTIZACION
): string {
  if (urAmount === null || urAmount === undefined) return '-'
  const pesos = convertURtoPesos(urAmount, cotizacion)
  return `${formatUR(urAmount)} (${formatPesos(pesos)})`
}
