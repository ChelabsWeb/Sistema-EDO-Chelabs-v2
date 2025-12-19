-- ============================================
-- Add Compras cross-obra visibility
-- Story 1.6: Automatic Role-Based Data Filtering
-- ============================================

-- Compras needs to see all obras for cross-obra visibility
CREATE POLICY "Compras puede ver todas las obras"
    ON obras FOR SELECT
    USING (get_user_role() = 'compras');

-- Update OT SELECT policy to include Compras
-- First drop the existing policy
DROP POLICY IF EXISTS "Ver OT de obra asignada" ON ordenes_trabajo;

-- Recreate with Compras included
CREATE POLICY "Ver OT de obra asignada o rol con acceso global"
    ON ordenes_trabajo FOR SELECT
    USING (
        obra_id = get_user_obra_id()
        OR get_user_role() IN ('admin', 'director_obra', 'compras')
    );

-- Update tareas SELECT policy to include Compras visibility
DROP POLICY IF EXISTS "Ver tareas de OT accesible" ON tareas;

CREATE POLICY "Ver tareas de OT accesible"
    ON tareas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ordenes_trabajo ot
            WHERE ot.id = tareas.orden_trabajo_id
            AND (
                ot.obra_id = get_user_obra_id()
                OR get_user_role() IN ('admin', 'director_obra', 'compras')
            )
        )
    );
