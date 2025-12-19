# Story 6.5: Close OT with Deviation Acknowledgment

## Status: Done
## Completed: 2025-12-19

## Story

**As a** DO,
**I want to** close an OT that has deviation while acknowledging the situation,
**So that** work can be finalized without being blocked.

## Acceptance Criteria

- [x] Given an OT has desvio > 0 and I want to close it, When I click "Cerrar OT", Then I see a confirmation showing the desvio amount and percentage
- [x] Given I confirm closing, When the action completes, Then the OT closes successfully
- [x] And the system records that DO acknowledged the desvio
- [x] And historial shows: "Cerrada con desvio de $X (Y%) - Aprobado por [DO]"
- [x] Given future reports, When I view closed OTs with desvio, Then I can see which were acknowledged and by whom

## Tasks / Subtasks

- [x] **Task 1: Verify backend implementation (already existed)**
  - [x] 1.1 closeOT action checks for deviation
  - [x] 1.2 Returns error if deviation exists and not acknowledged
  - [x] 1.3 Records acknowledged_by and acknowledged_at in historial
  - [x] 1.4 Includes deviation info in notas

- [x] **Task 2: Improve close modal UI**
  - [x] 2.1 Add deviation percentage display to modal
  - [x] 2.2 Show warning box with checkbox for acknowledgment
  - [x] 2.3 Disable confirm button until acknowledged

- [x] **Task 3: Improve history display**
  - [x] 3.1 Update HistorialItem interface to include acknowledged_usuario
  - [x] 3.2 Fetch acknowledger's name in OT detail page
  - [x] 3.3 Display "Desvio reconocido por [nombre]" in history timeline

- [x] **Task 4: Verify build and types**
  - [x] 4.1 Run `npx tsc --noEmit` - Passed
  - [x] 4.2 Run `npm run build` - Passed

## Dev Notes

### "Alertar, No Bloquear" Principle

This story implements the principle that the system should alert users about issues but not block operations. When closing an OT with deviation:

1. User sees clear warning about the deviation amount and percentage
2. User must explicitly acknowledge by checking a checkbox
3. The system records the acknowledgment but allows the operation
4. The history shows who acknowledged and when

### Database Columns Used

- `ot_historial.acknowledged_by` - UUID of user who acknowledged
- `ot_historial.acknowledged_at` - Timestamp of acknowledgment
- `ot_historial.notas` - Contains deviation info: "[DESVIO: $X (Y%)]"

### UI Flow

1. User clicks "Cerrar OT" on OT in execution
2. Modal shows with deviation warning (if deviation > 0)
3. User must check "Reconozco el desvio y deseo cerrar la OT"
4. Confirm button becomes enabled
5. On confirm, OT closes and history records acknowledgment

### References

- Covers: FR37
- Epic: 6 - Financial Control & Deviation Alerts

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

1. Verified existing backend implementation in `src/app/actions/ordenes-trabajo.ts`:
   - `closeOT` already calculates deviation
   - Already requires `acknowledge_deviation` flag if deviation > 0
   - Already records `acknowledged_by` and `acknowledged_at` in historial

2. Updated `src/components/edo/ot/ot-actions.tsx`:
   - Added `desvioPercent` calculation
   - Added percentage display in deviation warning modal

3. Updated `src/components/edo/ot/ot-history-timeline.tsx`:
   - Extended HistorialItem interface with `acknowledged_usuario`
   - Updated badge to show "Desvio reconocido por [nombre]"

4. Updated `src/app/(dashboard)/obras/[id]/ordenes-trabajo/[otId]/page.tsx`:
   - Added logic to fetch acknowledged user's name
   - Optimized to reuse existing user when acknowledged_by === usuario_id

### File List

**Modified Files:**
- `src/components/edo/ot/ot-actions.tsx` - Added percentage display
- `src/components/edo/ot/ot-history-timeline.tsx` - Enhanced acknowledgment display
- `src/app/(dashboard)/obras/[id]/ordenes-trabajo/[otId]/page.tsx` - Fetch acknowledged user
