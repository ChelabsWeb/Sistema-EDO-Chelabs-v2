-- ============================================
-- Sistema EDO Chelabs - Initial Database Schema
-- Migration: 00001_initial_schema
-- Created: 2025-12-18
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User roles: admin (super), director_obra (DO), jefe_obra (JO), compras
CREATE TYPE user_role AS ENUM ('admin', 'director_obra', 'jefe_obra', 'compras');

-- Obra status
CREATE TYPE obra_estado AS ENUM ('activa', 'pausada', 'finalizada');

-- OT status (state machine)
CREATE TYPE ot_status AS ENUM ('borrador', 'aprobada', 'en_ejecucion', 'cerrada');

-- OC status
CREATE TYPE oc_status AS ENUM ('pendiente', 'enviada', 'recibida_parcial', 'recibida_completa', 'cancelada');

-- ============================================
-- TABLES
-- ============================================

-- 1. OBRAS (Construction projects)
CREATE TABLE obras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    direccion TEXT,
    presupuesto_total DECIMAL(15,2),
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    estado obra_estado DEFAULT 'activa',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. USUARIOS (System users with roles)
-- Note: Uses auth_user_id to link with Supabase Auth
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    rol user_role NOT NULL,
    obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. RUBROS (Budget categories per obra)
CREATE TABLE rubros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    presupuesto DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. INSUMOS (Materials catalog per obra)
CREATE TABLE insumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    unidad TEXT NOT NULL,
    precio_unitario DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. ORDENES_TRABAJO (OT - Core entity)
CREATE TABLE ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    rubro_id UUID NOT NULL REFERENCES rubros(id) ON DELETE RESTRICT,
    numero SERIAL,
    descripcion TEXT NOT NULL,
    costo_estimado DECIMAL(15,2) NOT NULL DEFAULT 0,
    costo_real DECIMAL(15,2),
    estado ot_status DEFAULT 'borrador' NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    created_by UUID NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(obra_id, numero)
);

-- 6. TAREAS (Task checklist per OT)
CREATE TABLE tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_trabajo_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    completada BOOLEAN DEFAULT false NOT NULL,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. ORDENES_COMPRA (Purchase orders)
CREATE TABLE ordenes_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    numero SERIAL,
    proveedor TEXT,
    estado oc_status DEFAULT 'pendiente' NOT NULL,
    total DECIMAL(15,2),
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_recepcion DATE,
    created_by UUID NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(obra_id, numero)
);

-- 8. LINEAS_OC (Purchase order line items)
CREATE TABLE lineas_oc (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_compra_id UUID NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    orden_trabajo_id UUID REFERENCES ordenes_trabajo(id) ON DELETE SET NULL,
    insumo_id UUID NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
    cantidad_solicitada DECIMAL(12,2) NOT NULL,
    cantidad_recibida DECIMAL(12,2),
    precio_unitario DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX idx_usuarios_obra_id ON usuarios(obra_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_rubros_obra_id ON rubros(obra_id);
CREATE INDEX idx_insumos_obra_id ON insumos(obra_id);
CREATE INDEX idx_ordenes_trabajo_obra_id ON ordenes_trabajo(obra_id);
CREATE INDEX idx_ordenes_trabajo_rubro_id ON ordenes_trabajo(rubro_id);
CREATE INDEX idx_ordenes_trabajo_estado ON ordenes_trabajo(estado);
CREATE INDEX idx_tareas_orden_trabajo_id ON tareas(orden_trabajo_id);
CREATE INDEX idx_ordenes_compra_obra_id ON ordenes_compra(obra_id);
CREATE INDEX idx_lineas_oc_orden_compra_id ON lineas_oc(orden_compra_id);
CREATE INDEX idx_lineas_oc_orden_trabajo_id ON lineas_oc(orden_trabajo_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_obras_updated_at
    BEFORE UPDATE ON obras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rubros_updated_at
    BEFORE UPDATE ON rubros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insumos_updated_at
    BEFORE UPDATE ON insumos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_trabajo_updated_at
    BEFORE UPDATE ON ordenes_trabajo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tareas_updated_at
    BEFORE UPDATE ON tareas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_compra_updated_at
    BEFORE UPDATE ON ordenes_compra
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lineas_oc_updated_at
    BEFORE UPDATE ON lineas_oc
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
