import { vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a mock Supabase client for testing
 * Provides chainable methods for common Supabase operations
 */
export function createMockSupabaseClient(overrides: Partial<MockSupabaseConfig> = {}): SupabaseClient {
    const config: MockSupabaseConfig = {
        auth: {
            user: overrides.auth?.user || null,
            session: overrides.auth?.session || null,
            error: overrides.auth?.error || null,
        },
        select: overrides.select || { data: [], error: null },
        insert: overrides.insert || { data: null, error: null },
        update: overrides.update || { data: null, error: null },
        delete: overrides.delete || { data: null, error: null },
        single: overrides.single || { data: null, error: null },
    }

    const mockQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        like: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        containedBy: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(function (this: any) {
            return Promise.resolve(config.single)
        }),
        maybeSingle: vi.fn().mockImplementation(function (this: any) {
            return Promise.resolve(config.single)
        }),
        then: vi.fn().mockImplementation(function (this: any, callback: any) {
            if (callback) return Promise.resolve(callback(config.select))
            return Promise.resolve(config.select)
        }),
    }

    const mockClient: any = {
        auth: {
            getUser: vi.fn().mockImplementation(() => Promise.resolve({
                data: { user: config.auth.user },
                error: config.auth.error,
            })),
            getSession: vi.fn().mockImplementation(() => Promise.resolve({
                data: { session: config.auth.session },
                error: config.auth.error,
            })),
            signInWithPassword: vi.fn().mockImplementation(() => Promise.resolve({
                data: { user: config.auth.user, session: config.auth.session },
                error: config.auth.error,
            })),
            signOut: vi.fn().mockImplementation(() => Promise.resolve({ error: null })),
        },
        from: vi.fn().mockReturnValue(mockQueryBuilder),
        // Helper aliases also need to delegate or be absent? 
        // Supabase client has .from(). .rpc() etc.
        // It does NOT have .select() directly usually.
    }

    // Some tests might rely on mockClient.select() existing if they used simplified mocks?
    // But real Supabase client uses .from().

    // Adding storage mock just in case
    mockClient.storage = {
        from: vi.fn().mockReturnValue({
            upload: vi.fn(),
            getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com' } })
        })
    }

    return mockClient as unknown as SupabaseClient
}

/**
 * Mock Supabase configuration interface
 */
export interface MockSupabaseConfig {
    auth: {
        user: any
        session: any
        error: any
    }
    select: {
        data: any
        error: any
    }
    insert: {
        data: any
        error: any
    }
    update: {
        data: any
        error: any
    }
    delete: {
        data: any
        error: any
    }
    single: {
        data: any
        error: any
    }
}


/**
 * Clears all Supabase mocks
 */
export function clearSupabaseMocks() {
    vi.clearAllMocks()
}
