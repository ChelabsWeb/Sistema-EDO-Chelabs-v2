import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    getDeletedItems,
    restoreItem,
    permanentDelete,
    emptyTrash,
} from '@/app/actions/papelera'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { userFixtures } from '@/test-utils/fixtures'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

const MOCK_IDS = {
    OBRA: '123e4567-e89b-12d3-a456-426614174000',
}

describe('papelera.ts - Trash Management', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('getDeletedItems', () => {
        it('should return deleted items for admin', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    not: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                } else if (table === 'obras') {
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({
                            data: [{ id: MOCK_IDS.OBRA, nombre: 'Deleted Obra', deleted_at: '2024-01-01' }],
                            error: null,
                        })
                    )
                } else {
                    mockBuilder.then = vi.fn((resolve) => resolve({ data: [], error: null }))
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getDeletedItems()

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.length).toBeGreaterThan(0)
            }
        })

        it('should reject non-admin', async () => {
            const jefe = { ...userFixtures.admin(), rol: 'jefe_obra' }
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: jefe.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: jefe, error: null }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getDeletedItems()

            expect(result.success).toBe(false)
        })
    })

    describe('restoreItem', () => {
        it('should restore obra with cascading restore', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                    update: vi.fn().mockReturnThis(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                } else if (table === 'obras') {
                    mockBuilder.single.mockResolvedValue({
                        data: { deleted_at: '2024-01-01' },
                        error: null,
                    })
                    mockBuilder.then = vi.fn((resolve) => resolve({ error: null }))
                } else {
                    mockBuilder.then = vi.fn((resolve) => resolve({ error: null }))
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await restoreItem('obras', MOCK_IDS.OBRA)

            expect(result.success).toBe(true)
        })

        it('should restore single item', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null }),
                    }
                }
                return {
                    update: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await restoreItem('rubros', MOCK_IDS.OBRA)

            expect(result.success).toBe(true)
        })
    })

    describe('permanentDelete', () => {
        it('should permanently delete item', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null }),
                    }
                }
                return {
                    delete: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await permanentDelete('rubros', MOCK_IDS.OBRA)

            expect(result.success).toBe(true)
        })
    })
})
