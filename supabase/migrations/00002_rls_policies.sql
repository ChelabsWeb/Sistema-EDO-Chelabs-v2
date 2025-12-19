-- ============================================
-- Sistema EDO Chelabs - Row Level Security Policies
-- Migration: 00002_rls_policies
-- Created: 2025-12-18
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubros ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineas_oc ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's role from usuarios table
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's obra_id from usuarios table
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is admin or director_obra (DO)
CREATE OR REPLACE FUNCTION is_admin_or_do()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'director_obra');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- OBRAS POLICIES
-- ============================================

-- Admin and DO can view all obras
CREATE POLICY "Admin y DO pueden ver todas las obras"
    ON obras FOR SELECT
    USING (is_admin_or_do());

-- Users can view their assigned obra
CREATE POLICY "Usuarios pueden ver su obra asignada"
    ON obras FOR SELECT
    USING (id = get_user_obra_id());

-- Only admin can create obras
CREATE POLICY "Solo admin puede crear obras"
    ON obras FOR INSERT
    WITH CHECK (get_user_role() = 'admin');

-- Admin and DO can update obras
CREATE POLICY "Admin y DO pueden actualizar obras"
    ON obras FOR UPDATE
    USING (is_admin_or_do());

-- ============================================
-- USUARIOS POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON usuarios FOR SELECT
    USING (auth_user_id = auth.uid());

-- Admin can do everything with usuarios
CREATE POLICY "Admin tiene control total de usuarios"
    ON usuarios FOR ALL
    USING (get_user_role() = 'admin');

-- DO can read all users
CREATE POLICY "DO puede ver todos los usuarios"
    ON usuarios FOR SELECT
    USING (get_user_role() = 'director_obra');

-- DO can insert new users
CREATE POLICY "DO puede crear usuarios"
    ON usuarios FOR INSERT
    WITH CHECK (get_user_role() = 'director_obra');

-- DO can update users (except other admins)
CREATE POLICY "DO puede actualizar usuarios"
    ON usuarios FOR UPDATE
    USING (get_user_role() = 'director_obra' AND rol != 'admin');

-- Users from same obra can see each other
CREATE POLICY "Usuarios de misma obra pueden verse"
    ON usuarios FOR SELECT
    USING (obra_id = get_user_obra_id() AND obra_id IS NOT NULL);

-- ============================================
-- RUBROS POLICIES
-- ============================================

-- Admin and DO can do everything with rubros
CREATE POLICY "Admin y DO gestionan rubros"
    ON rubros FOR ALL
    USING (is_admin_or_do());

-- Users can view rubros from their obra
CREATE POLICY "Usuarios ven rubros de su obra"
    ON rubros FOR SELECT
    USING (obra_id = get_user_obra_id());

-- ============================================
-- INSUMOS POLICIES
-- ============================================

-- Admin, DO and Compras can manage insumos
CREATE POLICY "Admin, DO y Compras gestionan insumos"
    ON insumos FOR ALL
    USING (get_user_role() IN ('admin', 'director_obra', 'compras'));

-- Users can view insumos from their obra
CREATE POLICY "Usuarios ven insumos de su obra"
    ON insumos FOR SELECT
    USING (obra_id = get_user_obra_id());

-- ============================================
-- ORDENES_TRABAJO POLICIES
-- ============================================

-- Admin and DO can view all OTs
CREATE POLICY "Admin y DO ven todas las OTs"
    ON ordenes_trabajo FOR SELECT
    USING (is_admin_or_do());

-- Users can view OTs from their obra
CREATE POLICY "Usuarios ven OTs de su obra"
    ON ordenes_trabajo FOR SELECT
    USING (obra_id = get_user_obra_id());

-- Admin and DO can create OTs
CREATE POLICY "Admin y DO pueden crear OTs"
    ON ordenes_trabajo FOR INSERT
    WITH CHECK (is_admin_or_do());

-- Admin, DO and JO can update OTs
CREATE POLICY "Admin, DO y JO pueden actualizar OTs"
    ON ordenes_trabajo FOR UPDATE
    USING (get_user_role() IN ('admin', 'director_obra', 'jefe_obra'));

-- ============================================
-- TAREAS POLICIES
-- ============================================

-- Admin, DO and JO can manage tareas
CREATE POLICY "Admin, DO y JO gestionan tareas"
    ON tareas FOR ALL
    USING (get_user_role() IN ('admin', 'director_obra', 'jefe_obra'));

-- Users can view tareas from OTs in their obra
CREATE POLICY "Usuarios ven tareas de OTs en su obra"
    ON tareas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ordenes_trabajo ot
            WHERE ot.id = tareas.orden_trabajo_id
            AND (ot.obra_id = get_user_obra_id() OR is_admin_or_do())
        )
    );

-- ============================================
-- ORDENES_COMPRA POLICIES
-- ============================================

-- Admin, DO and Compras can view all OCs
CREATE POLICY "Admin, DO y Compras ven todas las OCs"
    ON ordenes_compra FOR SELECT
    USING (get_user_role() IN ('admin', 'director_obra', 'compras'));

-- Users can view OCs from their obra
CREATE POLICY "Usuarios ven OCs de su obra"
    ON ordenes_compra FOR SELECT
    USING (obra_id = get_user_obra_id());

-- Compras can manage OCs
CREATE POLICY "Compras gestiona OCs"
    ON ordenes_compra FOR ALL
    USING (get_user_role() IN ('admin', 'director_obra', 'compras'));

-- ============================================
-- LINEAS_OC POLICIES
-- ============================================

-- Admin, DO and Compras can manage lineas_oc
CREATE POLICY "Admin, DO y Compras gestionan lineas OC"
    ON lineas_oc FOR ALL
    USING (get_user_role() IN ('admin', 'director_obra', 'compras'));

-- Users can view lineas from OCs in their obra
CREATE POLICY "Usuarios ven lineas de OCs en su obra"
    ON lineas_oc FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ordenes_compra oc
            WHERE oc.id = lineas_oc.orden_compra_id
            AND (oc.obra_id = get_user_obra_id() OR get_user_role() IN ('admin', 'director_obra', 'compras'))
        )
    );

-- ============================================
-- AUTH TRIGGER: Create user profile on signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile after auth signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
