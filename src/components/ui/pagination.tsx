'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { PAGE_SIZE_OPTIONS } from '@/lib/constants/app'

interface PaginationProps {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (params: Record<string, string | number>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        newParams.set(key, String(value))
      })
      return newParams.toString()
    },
    [searchParams]
  )

  const goToPage = (newPage: number) => {
    router.push(`${pathname}?${createQueryString({ page: newPage, pageSize })}`)
  }

  const changePageSize = (newSize: number) => {
    router.push(`${pathname}?${createQueryString({ page: 1, pageSize: newSize })}`)
  }

  if (totalCount === 0) return null

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Info */}
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-medium">{startItem}</span> a{' '}
        <span className="font-medium">{endItem}</span> de{' '}
        <span className="font-medium">{totalCount}</span> resultados
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-gray-600">
            Por página:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => changePageSize(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={!hasPrevPage}
            className="rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Primera página"
          >
            ««
          </button>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={!hasPrevPage}
            className="rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {/* Page indicator */}
          <span className="px-3 py-1 text-sm text-gray-600">
            Página <span className="font-medium">{page}</span> de{' '}
            <span className="font-medium">{totalPages}</span>
          </span>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={!hasNextPage}
            className="rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={!hasNextPage}
            className="rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Última página"
          >
            »»
          </button>
        </div>
      </div>
    </div>
  )
}
