# Story 6.1: Calculate Real OT Cost

## Status: Done
## Completed: 2025-12-19

## Story

**As a** user,
**I want** the system to calculate the real cost of an OT automatically,
**So that** I can see actual spending in real-time.

## Acceptance Criteria

- [x] Given an OT has consumos registered, When I view the OT detail, Then I see costo_real calculated as sum of (cantidad_consumida x precio_real)
- [x] Given OC costs are linked to the OT via lineas_oc, When materials are received, Then costo_real includes the actual purchase prices
- [x] Given costo_real changes, When I view any OT list, Then the displayed cost reflects the current calculation

## Tasks / Subtasks

- [x] **Task 1: Create costo_real calculation function**
  - [x] 1.1 Create server action `calculateOTCostoReal(otId)`
  - [x] 1.2 Calculate from consumo_materiales: sum(cantidad_consumida x precio)
  - [x] 1.3 Use lineas_oc.precio_unitario when available, fallback to insumos.precio_unitario
  - [x] 1.4 Update ordenes_trabajo.costo_real with calculated value

- [x] **Task 2: Add recalculation triggers**
  - [x] 2.1 Recalculate on consumo_materiales insert/update/delete
  - [x] 2.2 Recalculate on lineas_oc price update (via reception)

- [x] **Task 3: Update OT UI to show costo_real**
  - [x] 3.1 Display costo_real in OT detail page (already implemented)
  - [x] 3.2 Display desvio in OT list (already implemented)
  - [x] 3.3 Format currency correctly (pesos uruguayos)

- [x] **Task 4: Verify build and types**
  - [x] 4.1 Run `npx tsc --noEmit` - Passed
  - [x] 4.2 Run `npm run build` - Passed

## Dev Notes

### Calculation Logic

```
costo_real = SUM(consumo_materiales.cantidad_consumida * precio_efectivo)

Where precio_efectivo is:
1. lineas_oc.precio_unitario (if exists for that insumo+OT) - weighted average if multiple OCs
2. insumos.precio_unitario or precio_referencia (fallback)
```

### Files Created/Modified

**New Files:**
- `src/app/actions/costos.ts` - Cost calculation functions:
  - `calculateOTCostoReal(otId)` - Calculates costo_real from consumos
  - `updateOTCostoReal(otId)` - Recalculates and updates OT
  - `getOTCostSummary(otId)` - Returns cost summary with deviation

**Modified Files:**
- `src/app/actions/consumo-materiales.ts` - Added auto-recalculation on insert/update/delete
- `src/app/actions/recepciones.ts` - Added auto-recalculation for affected OTs on reception

### Existing UI (No Changes Needed)

The following pages already display costo_real and desvio:
- OT Detail Page: Shows Costo Estimado, Costo Real, and Desvio with color coding
- OT List Page: Shows Desvio column with percentage

### References

- Covers: FR33
- Epic: 6 - Financial Control & Deviation Alerts

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

1. Created `src/app/actions/costos.ts` with three functions:
   - `calculateOTCostoReal` - Fetches consumos and calculates cost using OC prices or insumo prices
   - `updateOTCostoReal` - Updates the OT's costo_real field and revalidates paths
   - `getOTCostSummary` - Returns complete cost summary including deviation

2. Updated `src/app/actions/consumo-materiales.ts`:
   - Added import for `updateOTCostoReal`
   - Added call to `updateOTCostoReal` after registerConsumo (both insert and update paths)
   - Added call to `updateOTCostoReal` after deleteConsumo

3. Updated `src/app/actions/recepciones.ts`:
   - Added import for `updateOTCostoReal`
   - After reception registration, gets affected OT IDs from lineas_oc
   - Calls `updateOTCostoReal` for each affected OT

4. Verified existing UI already displays costs correctly:
   - OT detail page shows costo_real and desvio with color coding
   - OT list page shows desvio column

### File List

**New Files:**
- `src/app/actions/costos.ts`

**Modified Files:**
- `src/app/actions/consumo-materiales.ts`
- `src/app/actions/recepciones.ts`
