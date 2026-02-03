import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    getConfig,
    getCotizacionUR,
    updateCotizacionUR,
    getAllConfig,
} from '@/app/actions/configuracion'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { userFixtures } from '@/test-utils/fixtures'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('configuracion.ts - Configuration Management', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('getConfig', () => {
        it('should return config value by key', async () => {
            const mockClient = createMockSupabaseClient()
            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { valor: '1000' },
                    error: null,
                }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getConfig('cotizacion_ur')

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe('1000')
            }
        })

        it('should return error if config not found', async () => {
            const mockClient = createMockSupabaseClient()
            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' },
                }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getConfig('nonexistent')

            expect(result.success).toBe(false)
        })
    })

    describe('getCotizacionUR', () => {
        it('should return UR exchange rate', async () => {
            const mockClient = createMockSupabaseClient()
            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { valor: '1250.50' },
                    error: null,
                }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getCotizacionUR()

            expect(result).toBe(1250.5)
        })

        it('should return default value if config not found', async () => {
            const mockClient = createMockSupabaseClient()
            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' },
                }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getCotizacionUR()

            expect(result).toBeGreaterThan(0) // Should return DEFAULT_COTIZACION_UR
        })
    })

    describe('updateCotizacionUR', () => {
        it('should update UR exchange rate as admin', async () => {
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
                if (table === 'configuracion') {
                    return {
                        update: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockResolvedValue({ error: null }),
                    }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateCotizacionUR(1300)

            expect(result.success).toBe(true)
        })

        it('should reject negative or zero values', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: admin, error: null }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateCotizacionUR(0)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('mayor a 0')
            }
        })

        it('should reject unauthorized role', async () => {
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

            const result = await updateCotizacionUR(1300)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('permisos')
            }
        })
    })

    describe('getAllConfig', () => {
        it('should return all configuration values', async () => {
            const mockClient = createMockSupabaseClient()
            const mockConfigs = [
                { clave: 'cotizacion_ur', valor: '1000' },
                { clave: 'other_setting', valor: 'value' },
            ]

            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: mockConfigs, error: null }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getAllConfig()

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(2)
            }
        })

        it('should return an empty array if no configurations are found', async () => {
            const mockClient = createMockSupabaseClient()
            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getAllConfig()

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(0)
            }
        })

        it('should return error if database query fails', async () => {
            const mockClient = createMockSupabaseClient()
            const mockError = { message: 'Database error', code: '500' }
            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getAllConfig()

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('Database error')
            }
        })

        it('should handle unexpected data format from database', async () => {
            const mockClient = createMockSupabaseClient()
            const malformedData = [{ key: 'clave',
