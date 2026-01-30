import type { UserRole } from '@/types/database'

/**
 * Test fixtures for common entities
 * Provides factory functions to create test data
 */

// ============================================================================
// USER FIXTURES
// ============================================================================

export const userFixtures = {
    admin: (overrides = {}) => ({
        id: 'user-admin-1',
        auth_user_id: 'auth-admin-1',
        email: 'admin@test.com',
        nombre: 'Admin User',
        rol: 'admin' as UserRole,
        activo: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        obra_id: null,
        ...overrides,
    }),

    director: (overrides = {}) => ({
        id: 'user-director-1',
        auth_user_id: 'auth-director-1',
        email: 'director@test.com',
        nombre: 'Director Obra',
        rol: 'director_obra' as UserRole,
        activo: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        obra_id: null,
        ...overrides,
    }),

    jefe: (overrides = {}) => ({
        id: 'user-jefe-1',
        auth_user_id: 'auth-jefe-1',
        email: 'jefe@test.com',
        nombre: 'Jefe Obra',
        rol: 'jefe_obra' as UserRole,
        activo: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        obra_id: 'obra-1',
        ...overrides,
    }),

    compras: (overrides = {}) => ({
        id: 'user-compras-1',
        auth_user_id: 'auth-compras-1',
        email: 'compras@test.com',
        nombre: 'Compras User',
        rol: 'compras' as UserRole,
        activo: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        obra_id: null,
        ...overrides,
    }),
}

// ============================================================================
// OBRA FIXTURES
// ============================================================================

export const obraFixtures = {
    active: (overrides = {}) => ({
        id: 'obra-1',
        nombre: 'Edificio Test',
        direccion: 'Av. Test 1234',
        cooperativa: 'Cooperativa Test',
        presupuesto_total: 1000000,
        fecha_inicio: '2024-01-01',
        fecha_fin_estimada: '2024-12-31',
        estado: 'activa',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),

    withRubros: (overrides = {}) => ({
        ...obraFixtures.active(),
        rubros: [rubroFixtures.default()],
        ...overrides,
    }),
}

// ============================================================================
// RUBRO FIXTURES
// ============================================================================

export const rubroFixtures = {
    default: (overrides = {}) => ({
        id: 'rubro-1',
        obra_id: 'obra-1',
        nombre: 'Albañilería',
        unidad: 'm2',
        presupuesto: 100000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),

    excavacion: (overrides = {}) => ({
        id: 'rubro-2',
        obra_id: 'obra-1',
        nombre: 'Excavación',
        unidad: 'm3',
        presupuesto: 50000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),
}

// ============================================================================
// INSUMO FIXTURES
// ============================================================================

export const insumoFixtures = {
    cemento: (overrides = {}) => ({
        id: 'insumo-1',
        obra_id: 'obra-1',
        nombre: 'Cemento Portland',
        unidad: 'kg',
        tipo: 'material' as const,
        precio_referencia: 15,
        precio_unitario: 15,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),

    arena: (overrides = {}) => ({
        id: 'insumo-2',
        obra_id: 'obra-1',
        nombre: 'Arena Fina',
        unidad: 'm3',
        tipo: 'material' as const,
        precio_referencia: 1200,
        precio_unitario: 1200,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),

    manoObra: (overrides = {}) => ({
        id: 'insumo-3',
        obra_id: 'obra-1',
        nombre: 'Oficial Albañil',
        unidad: 'hora',
        tipo: 'mano_de_obra' as const,
        precio_referencia: 500,
        precio_unitario: 500,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),
}

// ============================================================================
// ORDEN DE TRABAJO FIXTURES
// ============================================================================

export const otFixtures = {
    draft: (overrides = {}) => ({
        id: 'ot-1',
        obra_id: 'obra-1',
        rubro_id: 'rubro-1',
        descripcion: 'OT de prueba en borrador',
        cantidad: 1,
        estado: 'borrador' as const,
        costo_estimado: 50000,
        costo_real: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),

    active: (overrides = {}) => ({
        id: 'ot-2',
        obra_id: 'obra-1',
        rubro_id: 'rubro-1',
        descripcion: 'OT en ejecución',
        cantidad: 1,
        estado: 'en_ejecucion' as const,
        costo_estimado: 75000,
        costo_real: 72000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),

    closed: (overrides = {}) => ({
        id: 'ot-3',
        obra_id: 'obra-1',
        rubro_id: 'rubro-1',
        descripcion: 'OT cerrada',
        cantidad: 1,
        estado: 'cerrada' as const,
        costo_estimado: 60000,
        costo_real: 65000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),
}

// ============================================================================
// CONSUMO MATERIAL FIXTURES
// ============================================================================

export const consumoFixtures = {
    default: (overrides = {}) => ({
        id: 'consumo-1',
        orden_trabajo_id: 'ot-1',
        insumo_id: 'insumo-1',
        cantidad_consumida: 100,
        cantidad_estimada: 90,
        notas: null,
        registrado_por: 'user-jefe-1',
        registrado_en: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        ...overrides,
    }),

    overBudget: (overrides = {}) => ({
        id: 'consumo-2',
        orden_trabajo_id: 'ot-1',
        insumo_id: 'insumo-2',
        cantidad_consumida: 150,
        cantidad_estimada: 100,
        notas: 'Consumo mayor al estimado',
        registrado_por: 'user-jefe-1',
        registrado_en: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        ...overrides,
    }),
}

// ============================================================================
// ORDEN DE COMPRA FIXTURES
// ============================================================================

export const ordenCompraFixtures = {
    pending: (overrides = {}) => ({
        id: 'oc-1',
        obra_id: 'obra-1',
        proveedor: 'Proveedor Test SA',
        fecha_emision: '2024-01-10',
        fecha_entrega_estimada: '2024-01-20',
        estado: 'pendiente' as const,
        subtotal: 10000,
        iva: 2200,
        total: 12200,
        notas: null,
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),

    received: (overrides = {}) => ({
        id: 'oc-2',
        obra_id: 'obra-1',
        proveedor: 'Proveedor Test SA',
        fecha_emision: '2024-01-05',
        fecha_entrega_estimada: '2024-01-15',
        estado: 'recibida' as const,
        subtotal: 15000,
        iva: 3300,
        total: 18300,
        notas: null,
        created_at: '2024-01-05T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        deleted_at: null,
        ...overrides,
    }),
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a complete obra with related entities
 */
export function createCompleteObra() {
    const obra = obraFixtures.active()
    const rubro = rubroFixtures.default({ obra_id: obra.id })
    const insumos = [
        insumoFixtures.cemento({ obra_id: obra.id }),
        insumoFixtures.arena({ obra_id: obra.id }),
    ]
    const ot = otFixtures.active({ obra_id: obra.id, rubro_id: rubro.id })

    return { obra, rubro, insumos, ot }
}

/**
 * Creates a complete OT with consumptions
 */
export function createOTWithConsumos() {
    const ot = otFixtures.active()
    const consumos = [
        consumoFixtures.default({ orden_trabajo_id: ot.id }),
        consumoFixtures.overBudget({ orden_trabajo_id: ot.id }),
    ]

    return { ot, consumos }
}
