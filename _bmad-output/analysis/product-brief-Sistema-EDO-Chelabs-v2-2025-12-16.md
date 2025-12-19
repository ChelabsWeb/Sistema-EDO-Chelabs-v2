---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - '_bmad-output/analysis/brainstorming-session-2025-12-16.md'
workflowType: 'product-brief'
lastStep: 0
project_name: 'Sistema-EDO-Chelabs-v2'
user_name: 'Estudiante UCU'
date: '2025-12-16'
---

# Product Brief: Sistema-EDO-Chelabs-v2

**Date:** 2025-12-16
**Author:** Estudiante UCU

---

## Executive Summary

**Sistema EDO Chelabs** es una herramienta de gestión y control de ejecución de obras para cooperativas de vivienda uruguayas. Reemplaza el control manual disperso (Excel, papeles, WhatsApp) por un sistema centralizado que permite al Director de Obra tener visibilidad en tiempo real del avance físico y financiero, detectando desvíos antes de que impacten la rentabilidad o viabilidad del proyecto.

El sistema se construye alrededor de la **Orden de Trabajo (OT)** como unidad atómica que conecta planificación, ejecución y control. Está diseñado para funcionar con conectividad irregular, ser operado por usuarios no técnicos desde el celular, y alertar inconsistencias sin bloquear el trabajo diario.

**Stack técnico:** Next.js + React + Supabase (PostgreSQL) - Costo inicial $0.

---

## Core Vision

### Problem Statement

El Director de Obra de cooperativas de vivienda en Uruguay no tiene visibilidad en tiempo real del estado de sus obras. La información está dispersa en planillas Excel, papeles físicos, mensajes de WhatsApp y la memoria de las personas. Cuando detecta un desvío de presupuesto o avance, ya es demasiado tarde para corregirlo sin impacto significativo.

### Problem Impact

**Para el Director de Obra:**

- Trabaja "de bombero", apagando incendios en vez de previniendo problemas
- Es responsable ante la cooperativa y el Ministerio sin tener las herramientas para cumplir
- No puede responder con certeza "¿cómo vamos?" cuando le preguntan

**Para la Cooperativa:**

- Obras que se pasan del presupuesto sin detectarlo a tiempo
- Desfasaje entre avance real y certificaciones del Ministerio = problemas de flujo de caja
- Compras ineficientes por urgencia o falta de control
- Desconfianza de los socios por falta de información clara

**Para el Jefe de Obra:**

- Pierde tiempo haciendo reportes manuales que nadie lee en tiempo real
- Su conocimiento del avance real queda en su cabeza o en papeles que se pierden

### Why Existing Solutions Fall Short

| Solución Actual | Por qué falla |
|-----------------|---------------|
| **ERPs de construcción** | Caros, complejos, pensados para constructoras grandes. No contemplan procesos de cooperativas (certificación Ministerio, ayuda mutua). |
| **Excel** | No colaborativo, sin alertas, versiones duplicadas, no conecta información entre áreas. "Funciona" hasta que explota. |
| **Intento 2019 (Sistemas Mapache)** | Alcance demasiado ambicioso, costo alto, brecha entre lo que el consultor entendía y la necesidad real. No se concretó. |
| **No hacer nada** | El costo de seguir igual parece menor que el de cambiar... hasta que un desvío grande impacta la obra. |

### Proposed Solution

Un sistema web/móvil centrado en la **Orden de Trabajo (OT)** como eje que conecta:

1. **Planificación:** Qué se va a hacer, con qué recursos, a qué costo estimado
2. **Ejecución:** Avance real mediante tareas completadas y evidencia fotográfica
3. **Control de Presupuesto:** Presupuesto vivo que compara estimado vs real por rubro, con proyección a término
4. **Detección de Desvíos:** Comparación automática planificado vs real, alertas tempranas

**Principio de diseño fundamental:**

> "El sistema debe ser flexible con el orden de carga, no rígido. Alertar inconsistencias, no impedirlas."

Esto reconoce la realidad de obra: a veces se compra antes de aprobar la OT, a veces el reporte se hace al final de la semana. El sistema acepta esa realidad y señala inconsistencias en vez de bloquear el trabajo.

### Key Differentiators

| Diferenciador | Por qué importa |
|---------------|-----------------|
| **Desarrollo con IA (Claude Code)** | Iteración rápida en días, no meses. Ajustes sin depender de proveedor externo. |
| **MVP mínimo real** | Solo OT + loop planificado→real→desvío. Nada más al inicio. |
| **Diseñado desde el dolor** | Basado en mapeo de procesos reales de 2019, no en features inventadas. |
| **UI simple como métrica** | Si el JO no puede usarlo en 30 segundos desde el celular en obra, no sirve. |
| **Offline-first** | PWA que funciona con conectividad irregular y sincroniza después. |
| **Costo $0 inicial** | Stack gratuito permite piloto sin inversión hasta validar valor. |

---

## Target Users

### Primary User: Director de Obra (DO)

**Perfil Típico:**

| Aspecto | Descripción |
|---------|-------------|
| **Nombre ejemplo** | Arq. Martín, 45 años |
| **Formación** | Arquitecto o Ingeniero Civil con experiencia en dirección |
| **Obras simultáneas** | 2-4 obras activas en distintas etapas |
| **Relación con tecnología** | Usa Excel y email. No es early adopter pero adopta lo que funciona sin complicaciones. |

**Día Típico:**

- Mañanas: Visita obras, recorre, resuelve temas en campo
- Tardes: Oficina para gestión, reuniones, reportes
- Revisa información: Primera hora, entre obras (rápido en el celular), final del día

**Frustraciones Actuales:**

- Llamar al JO para preguntar "¿cómo vamos?"
- Armar reportes juntando datos de distintos Excel
- Reconciliar versiones: lo que dice el JO vs Compras vs Contabilidad
- Tomar decisiones a ciegas: ¿puedo aprobar esta OT sin pasarme del presupuesto?

**Momento "Aha" con el Sistema:**

> "Abro el sistema y en 10 segundos veo: Obra Norte va 15% atrasada y 8% por encima del costo. Obra Sur va bien. Hay 3 OC pendientes de recibir. La OT-023 tiene un desvío de materiales."

**Métrica de Éxito:** Ve estado de todas las obras en 30 segundos sin preguntar a nadie.

---

### Secondary User: Jefe de Obra (JO)

**Perfil Típico:**

| Aspecto | Descripción |
|---------|-------------|
| **Nombre ejemplo** | Carlos, 38 años |
| **Formación** | Técnico en construcción o capataz con experiencia |
| **Foco** | 100% en una sola obra |
| **Relación con tecnología** | Usa WhatsApp todo el día. Si es intuitivo, lo adopta. Si requiere muchos pasos, lo abandona. |

**Día Típico:**

- 90% en campo: supervisando, resolviendo problemas, coordinando cuadrillas
- Tiempo administrativo: ~30 min mañana + 30 min tarde
- Momentos de carga: inicio del día (plan), final (reporte), cuando llega material

**Frustraciones Actuales:**

- Reportar lo mismo varias veces: WhatsApp al DO, Excel, y después lo preguntan de nuevo
- Interrupciones: llamadas para pedir datos que deberían poder ver solos
- No saber qué materiales vienen en camino

**Motivación para Usar el Sistema:**

> "Si el sistema reemplaza el Excel que tengo que llenar igual, y evita que me llamen para preguntar cosas, lo uso. Si es un paso extra, no lo uso."

**Lo que gana:** Que lo dejen tranquilo. Que el DO vea los datos sin llamarlo.

**Métrica de Éxito:** Carga avance y consumo en menos de 2 minutos desde el celular.

---

### Tertiary User: Compras/Administrativo

**Perfil Típico:**

| Aspecto | Descripción |
|---------|-------------|
| **Nombre ejemplo** | Laura, 32 años |
| **Rol** | Administrativo que maneja compras entre otras tareas |
| **Ubicación** | 100% oficina |
| **Relación con tecnología** | Cómoda con Excel y sistemas administrativos |

**Frustraciones Actuales:**

- Pedidos por WhatsApp sin contexto: "Necesito 100 bolsas de cemento" → ¿Para qué OT? ¿Hay presupuesto?
- Reconciliación manual: OC vs remito vs factura, todo en Excel
- Sin historial centralizado de proveedores

**Motivación para Usar el Sistema:**

> "Que la requisición venga de una OT aprobada, así ya sé que hay presupuesto. Que cuando cargo la recepción, el sistema compare automáticamente con la OC."

**Métrica de Éxito:** Requisiciones llegan con OT y presupuesto asociado, sin tener que preguntar.

---

### User Journey: Flujo Principal

```text
DO crea OT → JO ejecuta y reporta avance → Sistema calcula desvíos
     ↓              ↓                              ↓
   Aprueba    Carga consumo/fotos            Alertas al DO
     ↓              ↓                              ↓
  Compras      Requisición                   Dashboard
 recibe OC    automática                     actualizado
```

**Momentos Clave:**

| Momento | Usuario | Acción | Valor |
|---------|---------|--------|-------|
| Planificación | DO | Crea OT con estimado | Define qué se va a hacer |
| Aprobación | DO | Aprueba OT | Habilita ejecución y compras |
| Ejecución | JO | Marca tareas, sube fotos | Evidencia de avance real |
| Requisición | JO | Pide materiales desde OT | Compras recibe con contexto |
| Compra | Compras | Genera OC | Trazabilidad de pedido |
| Recepción | JO/Compras | Registra llegada | Detecta diferencias OC vs real |
| Cierre | JO | Cierra OT | Captura costo real |
| Control | DO | Ve dashboard | Detecta desvíos temprano |

---

## Success Metrics

### User Success Metrics

| Usuario | Métrica | Target | Cómo Medir |
|---------|---------|--------|------------|
| **DO** | Tiempo para ver estado de obras | < 30 segundos | Analytics: tiempo en dashboard |
| **DO** | Decisiones informadas | 0 decisiones "a ciegas" reportadas | Feedback cualitativo |
| **JO** | Tiempo de carga de avance diario | < 2 minutos | Analytics: tiempo en formulario |
| **JO** | Reducción de interrupciones | -50% llamadas del DO pidiendo datos | Feedback cualitativo |
| **Compras** | Requisiciones con contexto | 100% vienen de OT aprobada | Query BD |
| **Todos** | Adopción activa | 80% usuarios activos/semana | Analytics |

### Business Objectives

**Objetivo Principal (3 meses - Piloto):**

> Demostrar que el sistema genera valor real en al menos 1 obra piloto, medido por detección temprana de al menos 1 desvío significativo.

**Objetivos Secundarios:**

| Plazo | Objetivo | Indicador |
|-------|----------|-----------|
| 1 mes | Sistema funcional en producción | MVP desplegado con usuarios reales |
| 3 meses | Validación de valor | Al menos 1 desvío detectado antes de impactar |
| 6 meses | Escalabilidad probada | 2-3 obras usando el sistema |
| 12 meses | Sostenibilidad | Sistema se mantiene solo con usuario "power user" |

### Key Performance Indicators (KPIs)

**KPIs de Adopción:**

| KPI | Definición | Target MVP |
|-----|------------|------------|
| DAU/MAU | Usuarios activos diarios / mensuales | > 50% |
| Completitud de datos | OTs con todos los campos cargados | > 80% |
| Tiempo de onboarding | Tiempo hasta primera OT creada | < 1 hora |

**KPIs de Valor:**

| KPI | Definición | Target MVP |
|-----|------------|------------|
| Desvíos detectados | Alertas que identificaron problemas reales | ≥ 1 en piloto |
| Ahorro estimado | Valor del desvío detectado temprano | Documentar cualitativamente |
| NPS usuarios | Net Promoter Score post-piloto | > 7 |

**KPIs Técnicos:**

| KPI | Definición | Target MVP |
|-----|------------|------------|
| Uptime | Disponibilidad del sistema | > 99% |
| Sync offline | Datos sincronizados sin pérdida | 100% |
| Tiempo de carga | Página principal | < 3 segundos |

### North Star Metric

> **"Número de desvíos detectados antes de que impacten"**

Esta métrica captura el valor central del sistema: transformar al DO de bombero reactivo a gestor proactivo.

---

## MVP Scope

### Core Features (Must Have)

**Sprint 0: Fundamentos**

| Feature | Descripción | Justificación |
|---------|-------------|---------------|
| Auth + Roles | Login con 4 roles (DO, JO, Compras, Admin) | Sin esto no hay sistema |
| CRUD Obras | Crear, listar, editar obras | Entidad raíz |
| CRUD Rubros | Presupuesto por rubro por obra | Base del control financiero |
| CRUD Insumos | Catálogo de materiales | Base de compras |
| CRUD Usuarios | Gestionar usuarios y asignar a obras | Acceso controlado |

**Sprint 1: Ciclo de OT (Core del Sistema)**

| Feature | Descripción | Justificación |
|---------|-------------|---------------|
| CRUD OT | Crear, editar, listar órdenes de trabajo | Eje central |
| Flujo de estados | Borrador → Aprobada → En Ejecución → Cerrada | Trazabilidad |
| Tareas/Checklist | Lista de tareas por OT con checkbox | Avance medible |
| Carga de fotos | Subir fotos con timestamp | Evidencia |

**Sprint 2: Compras Básico**

| Feature | Descripción | Justificación |
|---------|-------------|---------------|
| Crear OC | Orden de compra con líneas de insumos | Trazabilidad de compras |
| Vincular OC a OT | Cada línea de OC asociada a una OT | Contexto de gasto |
| Registrar recepción | Marcar cantidades recibidas | Detectar diferencias |

**Sprint 3: Control y Visibilidad**

| Feature | Descripción | Justificación |
|---------|-------------|---------------|
| Costo real por OT | Suma automática de líneas OC | Control financiero |
| Dashboard obra | Vista resumen con indicadores clave | Visibilidad DO |
| Alerta de desvíos | Notificación cuando costo > estimado | North Star Metric |

---

### Out of Scope for MVP

| Feature | Razón | Fase |
|---------|-------|------|
| Dependencias entre OTs | Complejidad, poco valor inicial | 2.0 |
| Múltiples fórmulas por rubro | Simplificar a 1 activa | 2.0 |
| Sistema de reservas de stock | Complejidad | 2.0 |
| Certificaciones del Ministerio | Flujo paralelo complejo | 2.0 |
| Carga por voz | Técnicamente complejo | 3.0 |
| OCR de remitos | Requiere integración IA | 3.0 |
| Integración contable API | MVP usa exportación CSV | 2.0 |
| Notificaciones push | Emails primero | 2.0 |
| Modo offline completo | PWA básica primero, offline robusto después | 2.0 |

---

### MVP Success Criteria

**Go/No-Go para Fase 2:**

| Criterio | Umbral | Decisión |
|----------|--------|----------|
| Adopción | ≥ 3 usuarios activos/semana | Si no, revisar UX |
| Completitud | ≥ 50% OTs con datos completos | Si no, simplificar carga |
| Valor demostrado | ≥ 1 desvío detectado | Si no, revisar alertas |
| Satisfacción | NPS ≥ 6 | Si no, iterar con feedback |

**Piloto:**

- **Duración:** 4-6 semanas con 1 obra real
- **Usuarios:** 1 DO + 1-2 JO + 1 Compras
- **Criterio de éxito:** Sistema usado activamente sin volver a Excel

---

### Future Vision (Post-MVP)

**Fase 2.0 (6-12 meses):**

- Certificaciones del Ministerio integradas
- Notificaciones push y alertas avanzadas
- Modo offline robusto con sincronización
- Múltiples fórmulas por rubro
- Integración con sistema contable vía API

**Fase 3.0 (12-24 meses):**

- OCR de remitos y facturas
- Carga por voz
- Predicción de desvíos con ML
- Dashboard ejecutivo para cooperativa
- Multi-empresa (varias cooperativas)

**Visión a 3 años:**

> Sistema referente para cooperativas de vivienda en Uruguay, usado por 10+ cooperativas, con funcionalidades que los ERPs grandes no ofrecen para este nicho.

---

## Technical Architecture

### Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend** | Next.js 14 + React + Tailwind | SSR, PWA ready, UI rápida |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) | BD real, Auth incluido, Storage para fotos |
| **Hosting** | Vercel | Deploy automático, free tier generoso |
| **Offline** | PWA + Service Workers | Conectividad irregular en obra |

### Modelo de Datos (8 Entidades)

```text
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

### Costos Estimados

| Fase | Costo Mensual | Notas |
|------|---------------|-------|
| MVP (Piloto) | $0 | Free tiers de Supabase + Vercel |
| Producción (10 usuarios) | ~$25 | Supabase Pro si se exceden límites |
| Escalado (50 usuarios) | ~$50-100 | Depende de storage de fotos |

---

## Risks and Mitigations

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| "Es más trabajo" para JO | Alta | Alto | UI mínima, valor visible inmediato, menos campos |
| Resistencia al cambio | Media | Alto | Piloto con early adopters, mostrar wins rápidos |
| Conectividad en obra | Alta | Medio | PWA con offline-first, sync cuando hay señal |
| Datos incompletos | Media | Medio | Campos obligatorios mínimos, completar después |
| Complejidad percibida | Media | Alto | Onboarding guiado, máximo 3-4 campos por pantalla |

---

## Document Metadata

**Status:** COMPLETADO
**Workflow:** product-brief
**Created:** 2025-12-16
**Author:** Estudiante UCU
**Facilitator:** Mary (Business Analyst Agent)
**Input Documents:** brainstorming-session-2025-12-16.md
