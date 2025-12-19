-- Migration: 00004_requisiciones
-- Description: Create tables for material requisitions (Story 5.1)
-- Created: 2025-12-18

-- =====================================================
-- Table: requisiciones
-- =====================================================
CREATE TABLE requisiciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ot_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint for valid estados
  CONSTRAINT requisiciones_estado_check
    CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'cancelada'))
);

-- Comment on table
COMMENT ON TABLE requisiciones IS 'Material requisitions created by JO linked to OTs';

-- =====================================================
-- Table: requisicion_items
-- =====================================================
CREATE TABLE requisicion_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisicion_id UUID NOT NULL REFERENCES requisiciones(id) ON DELETE CASCADE,
  insumo_id UUID NOT NULL REFERENCES insumos(id),
  cantidad DECIMAL(12, 4) NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint for positive quantity
  CONSTRAINT requisicion_items_cantidad_positive CHECK (cantidad > 0)
);

-- Comment on table
COMMENT ON TABLE requisicion_items IS 'Line items for material requisitions';

-- =====================================================
-- Indexes
-- =====================================================
CREATE INDEX idx_requisiciones_ot_id ON requisiciones(ot_id);
CREATE INDEX idx_requisiciones_estado ON requisiciones(estado);
CREATE INDEX idx_requisiciones_created_by ON requisiciones(created_by);
CREATE INDEX idx_requisiciones_created_at ON requisiciones(created_at DESC);

CREATE INDEX idx_requisicion_items_requisicion_id ON requisicion_items(requisicion_id);
CREATE INDEX idx_requisicion_items_insumo_id ON requisicion_items(insumo_id);

-- =====================================================
-- Trigger: updated_at
-- =====================================================
CREATE TRIGGER update_requisiciones_updated_at
  BEFORE UPDATE ON requisiciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS Policies: requisiciones
-- =====================================================
ALTER TABLE requisiciones ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view requisiciones from OTs in their obras
CREATE POLICY "requisiciones_select_policy" ON requisiciones
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ordenes_trabajo ot
    JOIN usuario_obras uo ON uo.obra_id = ot.obra_id
    WHERE ot.id = requisiciones.ot_id
    AND uo.usuario_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.rol IN ('admin', 'compras')
  )
);

-- INSERT: JO and admin can create requisiciones for OTs in their obras
CREATE POLICY "requisiciones_insert_policy" ON requisiciones
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM ordenes_trabajo ot
    JOIN usuario_obras uo ON uo.obra_id = ot.obra_id
    JOIN usuarios u ON u.id = auth.uid()
    WHERE ot.id = ot_id
    AND uo.usuario_id = auth.uid()
    AND u.rol IN ('admin', 'jefe_obra')
  )
);

-- UPDATE: Creator or admin/compras can update
CREATE POLICY "requisiciones_update_policy" ON requisiciones
FOR UPDATE USING (
  created_by = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.rol IN ('admin', 'compras')
  )
);

-- DELETE: Only admin can delete
CREATE POLICY "requisiciones_delete_policy" ON requisiciones
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.rol = 'admin'
  )
);

-- =====================================================
-- RLS Policies: requisicion_items
-- =====================================================
ALTER TABLE requisicion_items ENABLE ROW LEVEL SECURITY;

-- SELECT: Follow parent requisicion permissions
CREATE POLICY "requisicion_items_select_policy" ON requisicion_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM requisiciones r
    JOIN ordenes_trabajo ot ON ot.id = r.ot_id
    JOIN usuario_obras uo ON uo.obra_id = ot.obra_id
    WHERE r.id = requisicion_items.requisicion_id
    AND uo.usuario_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.rol IN ('admin', 'compras')
  )
);

-- INSERT: Same as parent requisicion
CREATE POLICY "requisicion_items_insert_policy" ON requisicion_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM requisiciones r
    JOIN ordenes_trabajo ot ON ot.id = r.ot_id
    JOIN usuario_obras uo ON uo.obra_id = ot.obra_id
    JOIN usuarios u ON u.id = auth.uid()
    WHERE r.id = requisicion_id
    AND uo.usuario_id = auth.uid()
    AND u.rol IN ('admin', 'jefe_obra')
  )
);

-- UPDATE: Follow parent permissions
CREATE POLICY "requisicion_items_update_policy" ON requisicion_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM requisiciones r
    WHERE r.id = requisicion_items.requisicion_id
    AND (
      r.created_by = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM usuarios u
        WHERE u.id = auth.uid()
        AND u.rol IN ('admin', 'compras')
      )
    )
  )
);

-- DELETE: Only admin
CREATE POLICY "requisicion_items_delete_policy" ON requisicion_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.rol = 'admin'
  )
);
