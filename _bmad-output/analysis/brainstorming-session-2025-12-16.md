---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Sistema de Gestión y Control de Ejecución de Obras para Cooperativas de Vivienda'
session_goals: 'Funcionalidades Core, Flujos de Trabajo, Modelo de Datos, Priorización, Stack Tecnológico, Restricciones'
selected_approach: 'Progressive Flow'
techniques_used: ['SCAMPER', 'Mind Mapping', 'Constraint Mapping', 'Morphological Analysis', 'Six Thinking Hats', 'Resource Constraints']
ideas_generated: [25]
context_file: '_bmad/bmm/data/project-context-template.md'
status: 'completed'
---

# Brainstorming Session: Sistema EDO Chelabs

**Date:** 2025-12-16
**Facilitator:** Mary (Business Analyst)
**Participant:** Estudiante UCU
**Status:** COMPLETADO

---

## Executive Summary

Sistema de gestión y control de ejecución de obras para cooperativas de vivienda que reemplaza el control manual/disperso (Excel, papeles, WhatsApp) por una herramienta centralizada con alertas automáticas.

**Decisión clave:** La Orden de Trabajo (OT) es el eje central del sistema - todo converge en ella.

**Stack seleccionado:** Next.js + React + Supabase (PostgreSQL) - Costo $0 inicial.

---

## 1. Problema a Resolver

### Situación Actual

- Control disperso en Excel, papeles y memoria
- Sin visibilidad en tiempo real del avance físico y financiero
- Detección tardía de desvíos que impactan rentabilidad
- Comunicación caótica por WhatsApp sin trazabilidad
- Conciliación manual de compras propensa a errores

### Objetivo del Sistema

- Planificar obras mediante Órdenes de Trabajo
- Controlar avance físico y financiero en tiempo real
- Gestionar ciclo de compras (requisiciones - OC - recepciones)
- Detectar desvíos antes de que impacten la viabilidad del proyecto

---

## 2. Restricciones Confirmadas

| Categoría | Restricción | Implicancia para el Sistema |
|-----------|-------------|----------------------------|
| Conectividad | Irregular en obra | PWA con modo offline obligatorio |
| Usuarios | 20-40 totales, nivel técnico bajo | UI ultra-simple, tipo formulario |
| Mantenimiento | Sin desarrollador interno inicialmente | Código limpio, bien documentado |
| Presupuesto | $0 en primeros meses de prueba | Stack 100% gratuito |
| Integración | Exportación CSV primero | MVP sin integraciones API complejas |
| Coexistencia | WhatsApp y Drive permanecen | Sistema complementa, no elimina todo |

---

## 3. Arquitectura de la Solución

### Stack Tecnológico (Costo $0)

```
ARQUITECTURA MVP
================

┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│              Next.js 14 + React + Tailwind              │
│                  (PWA - funciona offline)               │
└─────────────────────────┬───────────────────────────────┘
                          │ API REST
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      SUPABASE                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ PostgreSQL  │  │    Auth     │  │   Storage   │     │
│  │   (BD)      │  │  (Usuarios) │  │   (Fotos)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘

Límites Free Tier:
- Supabase: 500MB BD, 1GB storage, 50k filas
- Vercel: 100GB bandwidth/mes
```

### Roles del Sistema

| Rol | Permisos | Acciones Principales |
|-----|----------|---------------------|
| **DO** (Director de Obra) | Todo | Aprobar OTs, ver dashboards, configurar obra |
| **JO** (Jefe de Obra) | Su obra | Crear OTs, registrar avances, subir fotos, crear requisiciones |
| **Compras** | Compras | Gestionar OCs, registrar recepciones |
| **Administrativo** | Lectura + Exportar | Ver reportes, exportar datos |

---

## 4. Modelo de Datos MVP

### Entidades Core (7 tablas)

| Entidad | Campos Clave | Relaciones |
|---------|--------------|------------|
| **OBRA** | id, codigo, nombre, direccion, fecha_inicio, estado, presupuesto_total | - |
| **USUARIO** | id, nombre, email, rol, obra_id (nullable) | obra |
| **RUBRO** | id, obra_id, codigo, nombre, monto_presupuestado, unidad_medida | obra |
| **ORDEN_TRABAJO** | id, obra_id, rubro_id, codigo, descripcion, estado, responsable_id, costo_estimado, costo_real | obra, rubro, usuario |
| **TAREA** | id, ot_id, descripcion, completada, fecha_completado | orden_trabajo |
| **INSUMO** | id, codigo, nombre, unidad, precio_referencia, stock_actual, obra_id | obra |
| **ORDEN_COMPRA** | id, proveedor, estado, monto_total, fecha_emision | - |
| **LINEA_OC** | id, oc_id, insumo_id, ot_id, cantidad_solicitada, cantidad_recibida, precio_unitario | orden_compra, insumo, orden_trabajo |

### Diagrama de Relaciones

```
OBRA (1) ──────┬────── (*) RUBRO
               │
               ├────── (*) ORDEN_TRABAJO ──── (*) TAREA
               │              │
               │              └────── (*) LINEA_OC
               │                           │
               ├────── (*) INSUMO ─────────┘
               │
               └────── (*) USUARIO

ORDEN_COMPRA (1) ────── (*) LINEA_OC
```

### Estados de la OT

```
┌──────────┐    Aprueba DO    ┌──────────┐    JO inicia    ┌─────────────┐
│ BORRADOR │ ───────────────► │ APROBADA │ ──────────────► │ EN_EJECUCION│
└──────────┘                  └──────────┘                 └──────┬──────┘
                                                                  │
                              ┌──────────┐    JO completa   ◄─────┘
                              │ CERRADA  │ ◄────────────────
                              └──────────┘
```

---

## 5. Funcionalidades MVP por Sprint

### Sprint 0: Fundamentos

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| Setup proyecto | Next.js + Supabase + Auth | P0 |
| CRUD Obras | Crear, listar, editar obras | P0 |
| CRUD Usuarios | Gestión de usuarios y roles | P0 |
| CRUD Rubros | Presupuesto por rubro | P0 |
| CRUD Insumos | Catálogo de materiales | P0 |

### Sprint 1: Ciclo de OT

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| CRUD OT | Crear, editar órdenes de trabajo | P0 |
| Flujo de estados | Borrador - Aprobada - En Ejecución - Cerrada | P0 |
| Tareas/Checklist | Lista de tareas por OT | P0 |
| Carga de fotos | Evidencia visual con timestamp | P1 |
| % Avance calculado | Basado en tareas completadas | P1 |

### Sprint 2: Compras Básico

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| Crear OC | Orden de compra con líneas | P0 |
| Vincular OC a OT | Trazabilidad de qué se compró para qué | P0 |
| Registrar recepción | Marcar cantidades recibidas | P0 |
| Alerta diferencias | OC vs Recibido | P1 |

### Sprint 3: Control Financiero

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| Costo real por OT | Suma de líneas OC cerradas | P0 |
| Comparación presupuesto | Rubro: Presupuestado vs Gastado | P0 |
| Dashboard obra | Vista resumen con indicadores | P1 |
| Exportación CSV | Para contabilidad externa | P1 |

---

## 6. Principios de Diseño

### Principio Fundamental

> "El sistema tiene que ser flexible con el orden de carga, no rígido. Alertar inconsistencias, no impedirlas."

### Implicancias

- No bloquear acciones por falta de pasos previos
- Permitir regularizar después (compra sin OT - vincular OT después)
- Alertar inconsistencias visualmente, no con errores bloqueantes
- Priorizar velocidad de carga sobre perfección de datos

### UX Crítica

- UI ultra-simple (nivel WhatsApp/formulario Google)
- Máximo 3-4 campos por pantalla
- Botones grandes para uso en obra
- Feedback visual inmediato
- Funcionar offline y sincronizar después

---

## 7. Fuera del Alcance MVP

| Feature | Razón | Fase Futura |
|---------|-------|-------------|
| Dependencias entre OTs | Complejidad, poco valor inicial | Fase 2 |
| Múltiples fórmulas por rubro | Simplificar a 1 activa | Fase 2 |
| Sistema de reservas de stock | Complejidad | Fase 2 |
| Certificaciones del Ministerio | Flujo paralelo complejo | Fase 2 |
| Carga por voz | Técnicamente complejo | Fase 3 |
| OCR de remitos | Requiere integración IA | Fase 3 |
| Integración contable API | MVP usa exportación CSV | Fase 2 |

---

## 8. Métricas de Éxito del Piloto

| Métrica | Target | Cómo Medir |
|---------|--------|------------|
| Adopción | 80% usuarios activos/semana | Analytics |
| Tiempo de carga OT | < 2 minutos | Observación |
| Datos completos | > 90% OTs con todos los campos | Query BD |
| Detección desvíos | Al menos 1 alerta útil detectada | Feedback usuarios |
| Satisfacción | NPS > 7 | Encuesta post-piloto |

---

## 9. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| "Es más trabajo" | Alta | Alto | UI mínima, valor visible inmediato |
| Resistencia al cambio | Media | Alto | Piloto con early adopters, mostrar wins rápidos |
| Conectividad en obra | Alta | Medio | PWA con offline-first |
| Datos incompletos | Media | Medio | Campos obligatorios mínimos, completar después |
| Complejidad percibida | Media | Alto | Onboarding guiado, tooltips |

---

## 10. Próximos Pasos

| # | Acción | Entregable |
|---|--------|------------|
| 1 | Crear proyecto Next.js con estructura base | Repo inicializado |
| 2 | Configurar Supabase (BD + Auth) | Proyecto Supabase listo |
| 3 | Crear esquema SQL de las 8 tablas | Migrations ejecutadas |
| 4 | Implementar autenticación | Login/logout funcional |
| 5 | CRUD de Obras y Rubros | Pantallas básicas |
| 6 | CRUD de OT con flujo de estados | Core del sistema |

---

## Anexo: Ideas Creativas para Fases Futuras

De la sesión de brainstorming emergieron ideas para implementar después del MVP:

1. **Termómetro visual de avance** - Indicador gráfico simple rojo/amarillo/verde
2. **Resumen diario automático** - Email/push matutino al DO con estado de obras
3. **Triangulación de avance** - Cruzar avance declarado vs consumos vs fotos
4. **Foto inteligente** - OCR para extraer datos de remitos automáticamente
5. **Carga por voz** - "Consumí 50 bolsas de cemento en OT-015"

---

*Documento generado en sesión de brainstorming facilitada por Mary (Business Analyst Agent)*
*Sistema BMAD v6.0*
