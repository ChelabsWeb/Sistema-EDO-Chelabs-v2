# Epic 5 Retrospective: Procurement & Receiving

## Status: Done
## Date: 2025-12-19

## Epic Summary

**Epic 5: Procurement & Receiving** implemento el flujo completo de compras:
- Story 5-1: Create Material Requisition (Done)
- Story 5-2: View All Requisitions (Done)
- Story 5-3: Create Orden de Compra (Done)
- Story 5-4: Specify OC Details (Done)
- Story 5-5: Register Material Reception (Done)
- Story 5-6: Alert Quantity Differences (Done)
- Story 5-7: Link OC Costs to OTs (Backlog - deferred to Epic 6)

## Issues Identified & Resolved

### 1. Security Issues (1 WARN) - SKIPPED

| Issue | Severity | Status |
|-------|----------|--------|
| Leaked Password Protection | WARN | Requires Supabase Pro plan |

**Note:** This feature requires Supabase Pro subscription. Not critical for MVP.

---

### 2. Performance Issues - Unindexed Foreign Keys (10 tables) - FIXED

| Table | FK Name | Column |
|-------|---------|--------|
| consumo_materiales | consumo_materiales_registrado_por_fkey | registrado_por |
| lineas_oc | lineas_oc_insumo_id_fkey | insumo_id |
| ordenes_compra | ordenes_compra_created_by_fkey | created_by |
| ordenes_trabajo | ordenes_trabajo_created_by_fkey | created_by |
| ot_fotos | ot_fotos_subida_por_fkey | subida_por |
| ot_historial | ot_historial_acknowledged_by_fkey | acknowledged_by |
| ot_historial | ot_historial_usuario_id_fkey | usuario_id |
| ot_insumos_estimados | ot_insumos_estimados_insumo_id_fkey | insumo_id |
| recepciones | recepciones_created_by_fkey | created_by |
| recepciones | recepciones_orden_compra_id_fkey | orden_compra_id |

**Status:** FIXED via migration `add_missing_fk_indexes`

---

### 3. Performance Issues - RLS Policies Re-evaluating auth functions - FIXED

Tables affected:
- usuarios, formulas, configuracion
- ot_fotos, consumo_materiales
- requisiciones, requisicion_items
- oc_requisiciones, recepciones

**Issue:** Using `auth.uid()` instead of `(select auth.uid())`

**Status:** FIXED via migration `optimize_rls_policies_v2`

---

### 4. Performance Issues - Multiple Permissive Policies - FIXED

Tables consolidated:
- obras (3 policies → 1)
- insumos (ALL+SELECT → 4 separate)
- rubros (ALL+SELECT → 4 separate)
- ordenes_compra (ALL+SELECT → 4 separate)
- lineas_oc (ALL+SELECT → 4 separate)
- tareas (ALL+SELECT → 4 separate)
- usuarios (ALL+SELECT → 4 separate)
- ot_historial (4 policies → 4 consolidated)
- ot_insumos_estimados (4 policies → 4 consolidated)

**Status:** FIXED via migrations:
- `consolidate_rls_policies`
- `consolidate_ot_historial_policies`

---

### 5. Sprint Status Desactualizado - FIXED

**Status:** FIXED - sprint-status.yaml updated

---

## Action Items

- [x] Update sprint-status.yaml to mark Epic 5 stories as done
- [x] Create migration for FK indexes (`add_missing_fk_indexes`)
- [x] Create migration to update RLS policies with select pattern (`optimize_rls_policies_v2`)
- [x] Create migration to consolidate permissive policies (`consolidate_rls_policies`, `consolidate_ot_historial_policies`)
- [x] ~~Enable leaked password protection in Supabase dashboard~~ (Requires Supabase Pro plan - skipped)

## Migrations Applied

1. `add_missing_fk_indexes` - Added 10 indexes for foreign keys
2. `optimize_rls_policies_v2` - Updated RLS policies to use `(select auth.uid())` pattern
3. `consolidate_rls_policies` - Consolidated policies for obras, insumos, rubros, ordenes_compra, lineas_oc, tareas, usuarios
4. `consolidate_ot_historial_policies` - Consolidated policies for ot_historial, ot_insumos_estimados

## Verification Results

After applying all migrations, Supabase Performance Advisor shows:
- **0 WARN issues** (all resolved)
- **22 INFO issues** (unused indexes - expected for new system, will be used as traffic increases)

## Lessons Learned

1. RLS policies should always use `(select auth.uid())` not `auth.uid()` for performance
2. FKs should have covering indexes for JOIN performance
3. Avoid multiple permissive policies for same role/action - consolidate with OR conditions
4. Keep sprint-status.yaml updated after completing stories
5. Run Supabase advisors after each epic to catch performance/security issues early
