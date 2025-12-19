-- ============================================
-- Sistema EDO Chelabs - Database Schema
-- ============================================
-- Ejecutar este script en Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'director_obra', 'jefe_obra', 'compras');
CREATE TYPE obra_estado AS ENUM ('activa', 'pausada', 'finalizada');
CREATE TYPE ot_status AS ENUM ('borrador', 'aprobada', 'en_ejecucion', 'cerrada');
CREATE TYPE oc_status AS ENUM ('pendiente', 'enviada', 'recibida_parcial', 'recibida_completa', 'cancelada');

-- ============================================
-- TABLES
-- ============================================

-- 1. OBRAS (Proyectos de construcción)
CREATE TABLE obras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    direccion TEXT,
    presupuesto_total DECIMAL(15,2),
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    estado obra_estado DEFAULT 'activa',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USUARIOS (Usuarios del sistema con roles)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    rol user_role NOT NULL,
    obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RUBROS (Partidas presupuestarias por obra)
CREATE TABLE rubros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    presupuesto DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INSUMOS (Catálogo de materiales por obra)
CREATE TABLE insumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    unidad TEXT NOT NULL, -- ej: 'kg', 'unidad', 'm3', 'bolsa'
    precio_unitario DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDENES_TRABAJO (OT - Eje central del sistema)
CREATE TABLE ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    rubro_id UUID NOT NULL REFERENCES rubros(id) ON DELETE RESTRICT,
    numero SERIAL,
    descripcion TEXT NOT NULL,
    costo_estimado DECIMAL(15,2) NOT NULL DEFAULT 0,
    costo_real DECIMAL(15,2),
    estado ot_status DEFAULT 'borrador',
    fecha_inicio DATE,
    fecha_fin DATE,
    created_by UUID NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(obra_id, numero)
);

-- 6. TAREAS (Checklist de tareas por OT)
CREATE TABLE tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_trabajo_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    completada BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDENES_COMPRA (OC)
CREATE TABLE ordenes_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    numero SERIAL,
    proveedor TEXT,
    estado oc_status DEFAULT 'pendiente',
    total DECIMAL(15,2),
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_recepcion DATE,
    created_by UUID NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(obra_id, numero)
);

-- 8. LINEAS_OC (Detalle de cada OC)
CREATE TABLE lineas_oc (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_compra_id UUID NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    orden_trabajo_id UUID REFERENCES ordenes_trabajo(id) ON DELETE SET NULL,
    insumo_id UUID NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
    cantidad_solicitada DECIMAL(12,2) NOT NULL,
    cantidad_recibida DECIMAL(12,2),
    precio_unitario DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX idx_usuarios_obra_id ON usuarios(obra_id);
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
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON obras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rubros_updated_at BEFORE UPDATE ON rubros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insumos_updated_at BEFORE UPDATE ON insumos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ordenes_trabajo_updated_at BEFORE UPDATE ON ordenes_trabajo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON tareas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ordenes_compra_updated_at BEFORE UPDATE ON ordenes_compra FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lineas_oc_updated_at BEFORE UPDATE ON lineas_oc FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubros ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineas_oc ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
    role user_role;
BEGIN
    SELECT u.rol INTO role
    FROM usuarios u
    WHERE u.auth_user_id = auth.uid();
    RETURN role;
END;
$$ language plpgsql SECURITY DEFINER;

-- Helper function to get current user's obra_id
CREATE OR REPLACE FUNCTION get_user_obra_id()
RETURNS UUID AS $$
DECLARE
    obra UUID;
BEGIN
    SELECT u.obra_id INTO obra
    FROM usuarios u
    WHERE u.auth_user_id = auth.uid();
    RETURN obra;
END;
$$ language plpgsql SECURITY DEFINER;

-- OBRAS policies
CREATE POLICY "Admin puede ver todas las obras" ON obras
    FOR SELECT USING (get_user_role() = 'admin' OR get_user_role() = 'director_obra');

CREATE POLICY "Admin puede crear obras" ON obras
    FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin y DO pueden actualizar obras" ON obras
    FOR UPDATE USING (get_user_role() IN ('admin', 'director_obra'));

CREATE POLICY "Usuarios asignados pueden ver su obra" ON obras
    FOR SELECT USING (id = get_user_obra_id());

-- USUARIOS policies
CREATE POLICY "Admin puede todo en usuarios" ON usuarios
    FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Usuarios pueden ver su propio registro" ON usuarios
    FOR SELECT USING (auth_user_id = auth.uid());

-- RUBROS, INSUMOS - usuarios asignados a la obra pueden ver
CREATE POLICY "Ver rubros de obra asignada" ON rubros
    FOR SELECT USING (obra_id = get_user_obra_id() OR get_user_role() IN ('admin', 'director_obra'));

CREATE POLICY "DO puede gestionar rubros" ON rubros
    FOR ALL USING (get_user_role() IN ('admin', 'director_obra'));

CREATE POLICY "Ver insumos de obra asignada" ON insumos
    FOR SELECT USING (obra_id = get_user_obra_id() OR get_user_role() IN ('admin', 'director_obra'));

CREATE POLICY "DO y Compras pueden gestionar insumos" ON insumos
    FOR ALL USING (get_user_role() IN ('admin', 'director_obra', 'compras'));

-- ORDENES_TRABAJO policies
CREATE POLICY "Ver OT de obra asignada" ON ordenes_trabajo
    FOR SELECT USING (obra_id = get_user_obra_id() OR get_user_role() IN ('admin', 'director_obra'));

CREATE POLICY "DO puede crear OT" ON ordenes_trabajo
    FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'director_obra'));

CREATE POLICY "DO y JO pueden actualizar OT" ON ordenes_trabajo
    FOR UPDATE USING (get_user_role() IN ('admin', 'director_obra', 'jefe_obra'));

-- TAREAS policies
CREATE POLICY "Ver tareas de OT accesible" ON tareas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ordenes_trabajo ot
            WHERE ot.id = tareas.orden_trabajo_id
            AND (ot.obra_id = get_user_obra_id() OR get_user_role() IN ('admin', 'director_obra'))
        )
    );

CREATE POLICY "JO puede gestionar tareas" ON tareas
    FOR ALL USING (get_user_role() IN ('admin', 'director_obra', 'jefe_obra'));

-- ORDENES_COMPRA policies
CREATE POLICY "Ver OC de obra asignada" ON ordenes_compra
    FOR SELECT USING (obra_id = get_user_obra_id() OR get_user_role() IN ('admin', 'director_obra', 'compras'));

CREATE POLICY "Compras puede gestionar OC" ON ordenes_compra
    FOR ALL USING (get_user_role() IN ('admin', 'director_obra', 'compras'));

-- LINEAS_OC policies
CREATE POLICY "Ver lineas de OC accesible" ON lineas_oc
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ordenes_compra oc
            WHERE oc.id = lineas_oc.orden_compra_id
            AND (oc.obra_id = get_user_obra_id() OR get_user_role() IN ('admin', 'director_obra', 'compras'))
        )
    );

CREATE POLICY "Compras puede gestionar lineas OC" ON lineas_oc
    FOR ALL USING (get_user_role() IN ('admin', 'director_obra', 'compras'));

-- ============================================
-- FUNCTION: Create user profile after signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (auth_user_id, nombre, email, rol)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'jefe_obra')
    );
    RETURN NEW;
END;
$$ language plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SAMPLE DATA (optional - comment out in production)
-- ============================================

-- Uncomment to insert sample data after first admin user is created
/*
INSERT INTO obras (nombre, direccion, presupuesto_total, estado) VALUES
    ('Cooperativa Las Acacias', 'Av. Rivera 1234, Montevideo', 2500000.00, 'activa'),
    ('Cooperativa Los Robles', 'Ruta 5 km 23, Canelones', 1800000.00, 'activa');
*/
