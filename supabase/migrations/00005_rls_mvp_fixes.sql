-- Migration: Fix RLS policies to match MVP logic
-- File: supabase/migrations/00005_rls_mvp_fixes.sql

-- 1. Fix ORDENES_TRABAJO Insert Policy
-- Previous: Only DO and Admin could insert
-- New: JO can also insert, but only for their assigned obra_id
DROP POLICY IF EXISTS "DO puede crear OT" ON ordenes_trabajo;
CREATE POLICY "Admin, DO y JO pueden crear OT" ON ordenes_trabajo
    FOR INSERT WITH CHECK (
        get_user_role() IN ('admin', 'director_obra') OR 
        (get_user_role() = 'jefe_obra' AND obra_id = get_user_obra_id())
    );

-- 2. Fix ORDENES_TRABAJO Update Policy
-- Previous: JO could update any OT (no obra restriction)
-- New: JO can only update OTs within their assigned obra_id
DROP POLICY IF EXISTS "DO y JO pueden actualizar OT" ON ordenes_trabajo;
CREATE POLICY "Admin, DO y JO pueden actualizar OT" ON ordenes_trabajo
    FOR UPDATE USING (
        get_user_role() IN ('admin', 'director_obra') OR
        (get_user_role() = 'jefe_obra' AND obra_id = get_user_obra_id())
    );

-- 3. Fix USUARIOS Select Policy
-- Previous: Users could only see themselves and Admin could see all
-- New: Users can see all members within their same obra_id (for the Team UI), or DO/Admin can see all
DROP POLICY IF EXISTS "Usuarios pueden ver su propio registro" ON usuarios;
CREATE POLICY "Usuarios pueden ver su propio registro o su equipo" ON usuarios
    FOR SELECT USING (
        auth_user_id = auth.uid() OR
        obra_id = get_user_obra_id() OR
        get_user_role() IN ('admin', 'director_obra')
    );
