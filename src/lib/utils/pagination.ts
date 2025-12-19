/**
 * Pagination utilities for consistent list handling
 */

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants/app'

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

/**
 * Normalize pagination parameters with defaults and limits
 */
export function normalizePagination(params: PaginationParams = {}): {
  page: number
  pageSize: number
  from: number
  to: number
} {
  const page = Math.max(1, params.page || 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize || DEFAULT_PAGE_SIZE))

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  return { page, pageSize, from, to }
}

/**
 * Build pagination metadata from query results
 */
export function buildPaginationMeta(
  totalCount: number,
  page: number,
  pageSize: number
): PaginatedResponse<never>['pagination'] {
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

/**
 * Create a paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: buildPaginationMeta(totalCount, page, pageSize),
  }
}
