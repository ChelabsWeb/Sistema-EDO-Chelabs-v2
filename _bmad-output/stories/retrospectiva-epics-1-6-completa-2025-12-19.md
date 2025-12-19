# Retrospectiva Completa - Epics 1-6
# Sistema-EDO-Chelabs-v2

**Fecha:** 2025-12-19
**Facilitador:** Bob (Scrum Master)
**Participantes:** Estudiante UCU (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Resumen Ejecutivo

| Epic | Stories | Estado | Observaciones |
|------|---------|--------|---------------|
| Epic 1: Project Foundation & Authentication | 6/6 | DONE | Base sólida |
| Epic 2: Obras & Configuration Management | 6/6 | DONE | Necesita plantillas |
| Epic 3: OT Lifecycle Core | 5/5 | DONE | Funciona bien |
| Epic 4: Task Execution & Evidence | 6/6 | DONE | Falta offline real |
| Epic 5: Procurement & Receiving | 6/7 | DONE | 1 story en backlog |
| Epic 6: Financial Control & Deviation Alerts | 5/5 | DONE | Completo |
| **TOTAL** | **34/35** | **97%** | |

---

## Epic 1: Project Foundation & Authentication

### Lo Que Salió Bien
- TypeScript end-to-end con type safety completo
- 4 roles implementados: admin, director_obra, jefe_obra, compras
- Filtrado automático por obra con Row Level Security (RLS)
- Server Actions Pattern con validación Zod
- Result Pattern consistente `{ success, data, error }`
- Permisos granulares en `src/lib/auth/permissions.ts`

### Problemas Identificados
- Sin tests automatizados desde el inicio
- Middleware básico sin rate limiting

### Archivos Clave
- `src/lib/auth/permissions.ts` - Sistema de permisos
- `src/app/actions/auth.ts` - Server Actions de autenticación
- `src/middleware.ts` - Protección de rutas

---

## Epic 2: Obras & Configuration Management

### Lo Que Salió Bien
- CRUD completo de Obras
- Rubros con presupuesto en Unidades Reajustables (UR)
- Catálogo de insumos (material/mano_de_obra)
- Fórmulas por rubro (insumo + cantidad por unidad)
- Asignación de usuarios a obras
- Conversión UR/Pesos con cotización configurable

### Problema Principal Identificado

**FALTA: Plantillas de Rubros Predefinidas**

Actualmente:
```
Obra Nueva → Crear Rubro manualmente → Definir Fórmulas una por una → Agregar insumos uno por uno
```

Esto significa que si creás "Electricidad" en Obra A con 10 insumos, y después creás Obra B, tenés que configurar todo de nuevo.

### Mejora Propuesta: Catálogo de Plantillas

**Estado Deseado:**
```
Obra Nueva → Seleccionar Plantilla "Electricidad" → Rubro + Fórmulas + Insumos automáticamente
```

**Modelo de Datos Propuesto:**

```
plantilla_rubros
├── id
├── nombre (ej: "Electricidad Básica", "Plomería Estándar")
├── unidad
├── descripcion
├── es_sistema (boolean) - true = plantilla del sistema, false = del DO
├── created_by (nullable) - null si es del sistema, user_id si es del DO

plantilla_insumos
├── id
├── plantilla_rubro_id
├── nombre (ej: "Cable 2.5mm", "Tomacorriente doble")
├── unidad
├── tipo (material/mano_de_obra)
├── precio_referencia

plantilla_formulas
├── id
├── plantilla_rubro_id
├── plantilla_insumo_id
├── cantidad_por_unidad (ej: 15 metros de cable por punto)
```

**Permisos Definidos:**
- Plantillas del sistema: Solo admin puede crear/editar
- Plantillas personales: Cada DO puede crear las suyas (reutilizables entre sus obras)

**Flujo de Uso:**
1. DO va a crear un rubro en una obra
2. Sistema muestra: "Crear desde cero" o "Usar plantilla"
3. Si elige plantilla, ve lista de plantillas (sistema + suyas)
4. Al seleccionar, se copian: rubro, insumos (si no existen), fórmulas
5. DO puede modificar cantidades/precios después

---

## Epic 3: OT Lifecycle Core

### Lo Que Salió Bien
- Ciclo completo: BORRADOR → APROBADA → EN_EJECUCIÓN → CERRADA
- Auto-cálculo de insumos desde fórmulas del rubro
- Sistema de acknowledgment para presupuestos excedidos
- Filosofía "alertar, no bloquear" implementada
- Historial completo con timestamps y usuario
- Filtrado por estado funciona correctamente

### Problemas Menores
- Código de OT se genera secuencial sin formato configurable (ej: OT-2024-001)

### Archivos Clave
- `src/app/actions/ordenes-trabajo.ts` - CRUD de OTs
- `src/components/edo/ot/` - Componentes de OT

---

## Epic 4: Task Execution & Evidence

### Lo Que Salió Bien
- Checklist de tareas con UI optimista (actualización inmediata)
- Vibración al completar tareas (feedback táctil móvil)
- Progress bar automático basado en tareas completadas
- Subida de fotos con timestamp y geolocalización
- Compresión de fotos client-side (<500KB)
- Registro de consumo de materiales
- Comparación consumo real vs estimado con semáforo:
  - Verde: consumo ≤ 100% del estimado
  - Amarillo: 100-120%
  - Rojo: >120%

### Problemas Identificados
- Sin soporte offline real (solo localStorage fallback básico)
- Cola de operaciones pendientes no implementada completamente

### Archivos Clave
- `src/app/actions/tareas.ts` - Gestión de tareas
- `src/app/actions/consumo-materiales.ts` - Registro de consumos
- `src/components/edo/tareas/` - Componentes de tareas

---

## Epic 5: Procurement & Receiving

### Lo Que Salió Bien
- Requisiciones de materiales vinculadas a OTs
- Vista cross-obra para rol Compras
- Órdenes de Compra agrupando requisiciones por proveedor
- Registro de recepciones con cantidades
- Alertas de diferencias (cantidad pedida vs recibida)

### Fixes de Performance Aplicados

| Issue | Migración Aplicada |
|-------|-------------------|
| 10 Foreign Keys sin índices | `add_missing_fk_indexes` |
| RLS usando `auth.uid()` ineficiente | `optimize_rls_policies_v2` |
| Múltiples políticas permisivas | `consolidate_rls_policies` |
| Políticas ot_historial duplicadas | `consolidate_ot_historial_policies` |

### Pendientes
- Story 5-7: Link OC Costs to OTs (movido a Epic 6)
- Leaked Password Protection (requiere Supabase Pro)

### Lecciones Aprendidas
- Usar `(select auth.uid())` en vez de `auth.uid()` en RLS
- Correr `supabase advisors` después de cada epic
- FKs deben tener índices para performance en JOINs

---

## Epic 6: Financial Control & Deviation Alerts

### Lo Que Salió Bien
- Cálculo automático de costo real (consumos × precio)
- Desvío en $ y % calculado en tiempo real
- Agregación de desvíos por rubro
- Alertas visuales en dashboard y listas de OTs
- Cierre de OT con acknowledgment de desvío
- Módulo centralizado de costos

### Lógica de Precios
1. Precio de OC (lineas_oc.precio_unitario) - promedio ponderado si hay múltiples
2. Precio catálogo (insumos.precio_unitario) - fallback

### Triggers Automáticos
- Al registrar consumo → recalcula costo OT
- Al registrar recepción → actualiza OTs afectadas

### Workaround Aplicado
- FK join para `acknowledged_by` no funcionaba con PostgREST
- Solución: query separada para obtener usuario

### Archivos Clave
- `src/app/actions/costos.ts` - Módulo centralizado de cálculos
- `src/components/edo/costos/rubro-deviations.tsx` - Tabla de desvíos

---

## Patrones Exitosos a Mantener

| Patrón | Descripción | Ubicación |
|--------|-------------|-----------|
| Result Pattern | `{ success, data, error }` en Server Actions | Todas las actions |
| Type Safety | TypeScript end-to-end con tipos de Supabase | `src/types/database.ts` |
| Validación Zod | Schemas de validación server-side | `src/lib/validations/` |
| Semáforo System | Alertas visuales verde/amarillo/rojo | Componentes UI |
| Soft Delete | `deleted_at` con papelera y restauración | Entidades principales |
| Permisos Granulares | Verificación server-side en cada action | `src/lib/auth/permissions.ts` |
| Historial | Trazabilidad de cambios de estado | `ot_historial` table |

---

## Deuda Técnica Acumulada

| Issue | Severidad | Epic Origen | Impacto |
|-------|-----------|-------------|---------|
| Sin tests automatizados | ALTA | Epic 1 | Riesgo de regresiones |
| Sin soporte offline real | MEDIA | Epic 4 | JOs sin señal no pueden trabajar |
| Sin rate limiting | MEDIA | Epic 1 | Vulnerabilidad a abuso |
| Formato código OT fijo | BAJA | Epic 3 | Solo cosmético |

---

## Mejoras Propuestas

### 1. Plantillas de Rubros (PRIORIDAD ALTA)

**Problema:** Configuración manual repetitiva entre obras
**Solución:** Catálogo de plantillas con rubros + fórmulas + insumos predefinidos
**Alcance:**
- 3 nuevas tablas de base de datos
- Server Actions para CRUD de plantillas
- UI en `/admin/plantillas`
- Modificar UI de creación de rubros
- Seed data con plantillas comunes de construcción

**Permisos:**
- Admin: puede crear/editar plantillas del sistema
- DO: puede crear/editar sus propias plantillas personales

### 2. Soporte Offline (PRIORIDAD MEDIA)

**Problema:** JOs en obras sin señal no pueden registrar trabajo
**Solución:** PWA con Service Worker y cola de operaciones
**Alcance:**
- Configurar PWA con manifest.json
- Service Worker para cache de assets
- IndexedDB para datos offline
- Cola de sincronización cuando vuelve la conexión

### 3. Tests Automatizados (PRIORIDAD MEDIA)

**Problema:** Sin tests = riesgo de regresiones
**Solución:** Implementar testing progresivo
**Alcance:**
- Vitest para unit tests
- Testing Library para componentes
- Playwright para E2E
- Empezar por flujos críticos: auth, OT lifecycle, compras

---

## Próximos Pasos Recomendados

1. **INMEDIATO:** Implementar Plantillas de Rubros antes de Epic 7
2. **Epic 7:** Dashboard & Visibility (ya planificado)
3. **Paralelo:** Agregar tests para nuevas funcionalidades
4. **Futuro:** Evaluar soporte offline según feedback de JOs

---

## Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Stories Completadas | 34/35 (97%) |
| Epics Completados | 6/9 (67%) |
| TypeScript Errors | 0 |
| Build Status | Passing |
| Server Actions | ~20 archivos |
| Componentes | ~40+ |
| Tablas DB | ~15 |
| Migraciones | ~10 |
| Test Coverage | 0% (pendiente) |

---

## Firma

**Retrospectiva completada:** 2025-12-19
**Próximo epic planificado:** Epic 7 - Dashboard & Visibility
**Mejora prioritaria:** Plantillas de Rubros con Fórmulas e Insumos

---

*Documento generado durante sesión de retrospectiva con equipo BMAD*
