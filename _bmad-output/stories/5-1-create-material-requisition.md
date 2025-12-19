# Story 5.1: Create Material Requisition

## Story

**As a** JO (Jefe de Obra),
**I want to** create a requisition for materials linked to an OT,
**So that** Compras knows what I need and why.

## Status

**Status:** ready-for-dev
**Epic:** 5 - Procurement & Receiving
**Created:** 2025-12-18
**FR Covered:** FR26

---

## Acceptance Criteria

### AC1: Access Requisition Form from OT

**Given** I am viewing an OT with estado = "En Ejecución"
**When** I click "Nueva Requisición"
**Then** I see a form to request materials
**And** the form shows which OT this requisition is for (código, descripción)

### AC2: Select Insumos and Quantities

**Given** I am creating a requisition
**When** I select insumos and quantities
**Then** I can add multiple items to the requisition
**And** each item shows the insumo nombre, unidad, and cantidad
**And** I can remove items before submitting

### AC3: Submit Requisition Successfully

**Given** I have added at least one item
**When** I submit the requisition
**Then** the requisition is saved with estado = "pendiente"
**And** it is linked to the OT via ot_id
**And** I see a success toast: "Requisición creada correctamente"
**And** I am redirected back to the OT detail page

### AC4: View Created Requisition

**Given** I have created a requisition for an OT
**When** I view the OT detail page
**Then** I see the requisition in a "Requisiciones" section
**And** it shows: fecha, estado, cantidad de items

### AC5: Validation Requirements

**Given** I try to submit a requisition
**When** no items have been added
**Then** I see an error: "Debe agregar al menos un insumo"
**And** the form does not submit

**Given** I try to add an item
**When** cantidad is 0 or negative
**Then** I see an error: "La cantidad debe ser mayor a 0"

---

## Technical Requirements

### Database Migration

Create new tables for requisitions:

```sql
-- Table: requisiciones
CREATE TABLE requisiciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ot_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valid estados: 'pendiente', 'en_proceso', 'completada', 'cancelada'
-- Add check constraint
ALTER TABLE requisiciones
ADD CONSTRAINT requisiciones_estado_check
CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'cancelada'));

-- Table: requisicion_items
CREATE TABLE requisicion_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisicion_id UUID NOT NULL REFERENCES requisiciones(id) ON DELETE CASCADE,
  insumo_id UUID NOT NULL REFERENCES insumos(id),
  cantidad DECIMAL(12, 4) NOT NULL CHECK (cantidad > 0),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_requisiciones_ot_id ON requisiciones(ot_id);
CREATE INDEX idx_requisiciones_estado ON requisiciones(estado);
CREATE INDEX idx_requisiciones_created_by ON requisiciones(created_by);
CREATE INDEX idx_requisicion_items_requisicion_id ON requisicion_items(requisicion_id);
CREATE INDEX idx_requisicion_items_insumo_id ON requisicion_items(insumo_id);

-- Trigger for updated_at
CREATE TRIGGER update_requisiciones_updated_at
  BEFORE UPDATE ON requisiciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### RLS Policies

```sql
-- Requisiciones RLS
ALTER TABLE requisiciones ENABLE ROW LEVEL SECURITY;

-- Users can view requisiciones from their obras
CREATE POLICY "requisiciones_select_policy" ON requisiciones
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ordenes_trabajo ot
    JOIN usuario_obras uo ON uo.obra_id = ot.obra_id
    WHERE ot.id = requisiciones.ot_id
    AND uo.usuario_id = auth.uid()
  )
);

-- JO and admin can create requisiciones for their obras
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

-- Requisicion Items RLS
ALTER TABLE requisicion_items ENABLE ROW LEVEL SECURITY;

-- Items follow parent requisicion permissions
CREATE POLICY "requisicion_items_select_policy" ON requisicion_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM requisiciones r
    JOIN ordenes_trabajo ot ON ot.id = r.ot_id
    JOIN usuario_obras uo ON uo.obra_id = ot.obra_id
    WHERE r.id = requisicion_items.requisicion_id
    AND uo.usuario_id = auth.uid()
  )
);

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
```

### TypeScript Types

After migration, regenerate types:
```bash
npx supabase gen types typescript --local > src/types/database.ts
```

Expected new types (for reference):
```typescript
// In src/types/database.ts (auto-generated)
interface Requisicion {
  id: string
  ot_id: string
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
  notas: string | null
  created_by: string
  created_at: string
  updated_at: string
}

interface RequisicionItem {
  id: string
  requisicion_id: string
  insumo_id: string
  cantidad: number
  notas: string | null
  created_at: string
}
```

### Server Actions

Create: `src/app/actions/requisiciones.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createErrorResult, ErrorCodes } from '@/lib/errors'

// Zod schemas
const RequisicionItemSchema = z.object({
  insumo_id: z.string().uuid(),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  notas: z.string().optional(),
})

const CreateRequisicionSchema = z.object({
  ot_id: z.string().uuid(),
  items: z.array(RequisicionItemSchema).min(1, 'Debe agregar al menos un insumo'),
  notas: z.string().optional(),
})

// Get requisiciones by OT
export async function getRequisicionesByOT(otId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('requisiciones')
    .select(`
      *,
      requisicion_items(
        *,
        insumo:insumos(id, nombre, unidad)
      ),
      creador:usuarios(id, nombre)
    `)
    .eq('ot_id', otId)
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Create new requisicion
export async function createRequisicion(input: z.infer<typeof CreateRequisicionSchema>) {
  const supabase = await createClient()

  // Validate input
  const validation = CreateRequisicionSchema.safeParse(input)
  if (!validation.success) {
    return createErrorResult(ErrorCodes.VAL_INVALID_INPUT, validation.error.errors[0].message)
  }

  const { ot_id, items, notas } = validation.data

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return createErrorResult(ErrorCodes.AUTH_NOT_AUTHENTICATED)
  }

  // Verify OT exists and is in execution
  const { data: ot, error: otError } = await supabase
    .from('ordenes_trabajo')
    .select('id, estado, obra_id')
    .eq('id', ot_id)
    .is('deleted_at', null)
    .single()

  if (otError || !ot) {
    return createErrorResult(ErrorCodes.RES_NOT_FOUND, 'OT no encontrada')
  }

  if (ot.estado !== 'en_ejecucion') {
    return createErrorResult(
      ErrorCodes.BIZ_OPERATION_NOT_ALLOWED,
      'Solo se pueden crear requisiciones para OTs en ejecución'
    )
  }

  // Create requisicion
  const { data: requisicion, error: reqError } = await supabase
    .from('requisiciones')
    .insert({
      ot_id,
      notas,
      created_by: user.id,
    })
    .select()
    .single()

  if (reqError) {
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, reqError.message)
  }

  // Create items
  const itemsToInsert = items.map(item => ({
    requisicion_id: requisicion.id,
    insumo_id: item.insumo_id,
    cantidad: item.cantidad,
    notas: item.notas,
  }))

  const { error: itemsError } = await supabase
    .from('requisicion_items')
    .insert(itemsToInsert)

  if (itemsError) {
    // Rollback: delete the requisicion
    await supabase.from('requisiciones').delete().eq('id', requisicion.id)
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, itemsError.message)
  }

  revalidatePath(`/obras/${ot.obra_id}/ordenes-trabajo/${ot_id}`)

  return {
    success: true,
    data: requisicion,
    message: 'Requisición creada correctamente'
  }
}

// Get single requisicion with items
export async function getRequisicion(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('requisiciones')
    .select(`
      *,
      ot:ordenes_trabajo(id, codigo, descripcion, obra_id),
      requisicion_items(
        *,
        insumo:insumos(id, nombre, unidad, tipo)
      ),
      creador:usuarios(id, nombre)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Cancel requisicion (soft state change)
export async function cancelRequisicion(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return createErrorResult(ErrorCodes.AUTH_NOT_AUTHENTICATED)
  }

  // Verify requisicion exists and is pending
  const { data: req, error: reqError } = await supabase
    .from('requisiciones')
    .select('id, estado, ot_id')
    .eq('id', id)
    .single()

  if (reqError || !req) {
    return createErrorResult(ErrorCodes.RES_NOT_FOUND)
  }

  if (req.estado !== 'pendiente') {
    return createErrorResult(
      ErrorCodes.BIZ_INVALID_STATE_TRANSITION,
      'Solo se pueden cancelar requisiciones pendientes'
    )
  }

  const { error } = await supabase
    .from('requisiciones')
    .update({ estado: 'cancelada' })
    .eq('id', id)

  if (error) {
    return createErrorResult(ErrorCodes.DB_QUERY_ERROR, error.message)
  }

  revalidatePath(`/obras`)

  return { success: true, message: 'Requisición cancelada' }
}
```

### UI Components

#### 1. Requisicion Form Component

Create: `src/components/edo/requisiciones/requisicion-form.tsx`

- Multi-item form with dynamic add/remove
- Insumo selector dropdown (filtered by obra)
- Cantidad input with validation
- Notas opcional
- Submit and cancel buttons

#### 2. Requisiciones List Component

Create: `src/components/edo/requisiciones/requisiciones-list.tsx`

- Shows list of requisiciones for an OT
- Displays: fecha, estado badge, items count
- Click to expand/view items

#### 3. OT Detail Integration

Update: `src/app/(dashboard)/obras/[id]/ordenes-trabajo/[otId]/page.tsx`

- Add "Nueva Requisición" button (only for estado = 'en_ejecucion')
- Add "Requisiciones" section showing the list
- Link to requisition detail/form

### UI Flow

```
OT Detail Page (en_ejecucion)
    │
    ├── [Nueva Requisición] button
    │       │
    │       └── Opens RequisicionForm modal/drawer
    │               │
    │               ├── Select insumos from catalog
    │               ├── Set cantidad for each
    │               ├── Add/remove items dynamically
    │               │
    │               └── Submit → createRequisicion()
    │                       │
    │                       └── Success → Back to OT with toast
    │
    └── Requisiciones section
            │
            └── List of requisiciones with estado badges
```

### Estado Badge Colors

```typescript
const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-gray-100 text-gray-800',
}
```

---

## Out of Scope

- Editing requisiciones after creation (future story)
- Linking requisiciones to Ordenes de Compra (Story 5.3)
- Email notifications to Compras role (Epic 9)
- Requisicion approval workflow (not in PRD)

---

## Dependencies

- **Story 4.5** (Register Material Consumption) - Uses same insumos catalog
- **Story 3.3** (JO Starts OT Execution) - OT must be in 'en_ejecucion' state
- Insumos table must exist with obra-specific filtering

---

## Dev Notes

### Existing Patterns to Follow

1. **Server Actions pattern** - See `src/app/actions/ordenes-trabajo.ts`
2. **Error handling** - Use `createErrorResult()` from `src/lib/errors`
3. **Zod validation** - See `src/lib/validations/`
4. **Toast notifications** - Use existing toast implementation

### Testing Considerations

- Test with OT in different states (should only allow 'en_ejecucion')
- Test with empty items array (should fail validation)
- Test with invalid insumo_id (should fail)
- Test RLS: JO should only see requisiciones from their obra

### Performance Notes

- Use pagination for requisiciones list if > 20 items
- Consider using optimistic UI for better UX when creating

---

## Definition of Done

- [ ] Migration applied and types regenerated
- [ ] Server actions created with proper validation
- [ ] RLS policies tested and working
- [ ] RequisicionForm component implemented
- [ ] RequisicionesList component implemented
- [ ] OT detail page updated with requisiciones section
- [ ] Success/error toasts working
- [ ] Manual testing completed
- [ ] No TypeScript errors
- [ ] Build passes
