# Story 5.6: Alert Quantity Differences

## Status: Done
## Completed: 2025-12-19

## Story

**As a** user,
**I want to** see alerts when received quantities differ from ordered,
**So that** I can address discrepancies.

## Acceptance Criteria

1. **AC1:** Given I register reception with cantidad_recibida < cantidad_pedida, When I save the reception, Then I see a warning: "Recepcion parcial: faltan X unidades"
2. **AC2:** Given cantidad_recibida > cantidad_pedida, When I save, Then I see an alert: "Se recibio mas de lo pedido", And the difference is highlighted
3. **AC3:** Given there are discrepancies, When I view the OC or reception history, Then discrepancies are visually marked

## Tasks / Subtasks

- [x] **Task 1: Add alerts in reception modal** (AC: 1, 2)
  - [x] 1.1 Show real-time warnings when entering quantities
  - [x] 1.2 Highlight over-received items (cantidad > pendiente)
  - [x] 1.3 Show summary alert before submitting

- [x] **Task 2: Add visual indicators in OC list** (AC: 3)
  - [x] 2.1 Show discrepancy indicators in expanded OC details
  - [x] 2.2 Color-code items based on reception status
  - [x] 2.3 Add summary badges for OCs with issues

- [x] **Task 3: Verify build and types**
  - [x] 3.1 Run `npx tsc --noEmit` - Passed
  - [x] 3.2 Run `npm run build` - Passed

## Dev Notes

### Alert Types

1. **Partial Reception** (yellow warning):
   - When cantidad_recibida < cantidad_solicitada
   - Message: "Recepcion parcial: faltan X unidades de [insumo]"

2. **Over-Reception** (red alert):
   - When cantidad_recibida > cantidad_solicitada
   - Message: "Se recibio mas de lo pedido: +X unidades de [insumo]"
   - This could indicate a delivery error

### Visual Indicators

- Green: Item fully received (cantidad_recibida >= cantidad_solicitada)
- Yellow: Item partially received (0 < cantidad_recibida < cantidad_solicitada)
- Red: Item over-received (cantidad_recibida > cantidad_solicitada)
- Gray: Item not yet received (cantidad_recibida = 0)

### Files to Modify

- `src/app/(dashboard)/compras/ordenes-compra/page.tsx` - Add visual indicators and alerts

### References

- [Source: _bmad-output/epics.md#Epic-5-Story-5.6]
- [Source: Story 5-5 implementation]
- Covers: FR31

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

1. Updated OC details expanded view with reception status indicators:
   - Added "Recibida" and "Estado" columns to items table
   - Color-coded rows based on reception status:
     - Green background + "Completo" badge for fully received items
     - Yellow background + "Faltan X" badge for partially received
     - Red background + "+X extra" badge for over-received items
     - Gray "Pendiente" badge for items not yet received

2. Enhanced reception modal with real-time alerts:
   - Added "Alerta" column to reception items table
   - Real-time badge showing "+X extra" for over-reception
   - "Parcial" badge for partial reception
   - Input field styling changes based on over-reception (red border/background)
   - Removed max limit on input to allow over-reception with warning
   - Added step="0.01" for decimal quantities

3. Added Alerts Summary section in reception modal:
   - Shows all warnings and errors before the Notas section
   - Error alerts (red) for over-reception with exact quantities
   - Warning alerts (yellow) for partial reception with remaining quantities
   - SVG icons for each alert type
   - Only displays when there are alerts to show

4. User can still submit over-received quantities but sees clear warnings

### File List

**Modified Files:**
- `src/app/(dashboard)/compras/ordenes-compra/page.tsx` - Added visual indicators and alerts
