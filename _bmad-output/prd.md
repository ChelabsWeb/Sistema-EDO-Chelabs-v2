---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - '_bmad-output/analysis/product-brief-Sistema-EDO-Chelabs-v2-2025-12-16.md'
  - '_bmad-output/analysis/brainstorming-session-2025-12-16.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'prd'
lastStep: 11
status: complete
project_name: 'Sistema-EDO-Chelabs-v2'
user_name: 'Estudiante UCU'
date: '2025-12-16'
ui_framework: 'shadcn/ui'
project_type: 'web_app'
domain: 'construction'
complexity: 'medium'
---

# Product Requirements Document - Sistema-EDO-Chelabs-v2

**Author:** Estudiante UCU
**Date:** 2025-12-16

## Executive Summary

**Sistema EDO Chelabs** es una plataforma web de gestión y control de ejecución de obras de construcción, inicialmente enfocada en cooperativas de vivienda uruguayas pero extensible a constructoras pequeñas y medianas.

El sistema resuelve la falta de visibilidad en tiempo real sobre el avance físico y financiero de las obras. Actualmente, la información está dispersa en planillas Excel, papeles físicos, mensajes de WhatsApp y la memoria de las personas. Cuando el Director de Obra detecta un desvío de presupuesto o avance, ya es demasiado tarde para corregirlo sin impacto significativo.

La solución se construye alrededor de la **Orden de Trabajo (OT)** como eje central que conecta:
- **Planificación:** Qué se va a hacer, con qué recursos, a qué costo estimado
- **Ejecución:** Avance real mediante tareas completadas y evidencia fotográfica
- **Control Financiero:** Presupuesto vivo comparando estimado vs real por rubro
- **Detección de Desvíos:** Comparación automática planificado vs real vs certificado

### What Makes This Special

1. **OT como eje central** - Todo converge en la Orden de Trabajo, no es un CRUD genérico de tareas
2. **Flexibilidad operativa** - El sistema alerta inconsistencias sin bloquear el trabajo (acepta la realidad de obra)
3. **Dual tracking** - Avance real vs avance certificado por el Ministerio (crítico para flujo de caja)
4. **Multimoneda UR/Pesos** - Presupuesto en Unidad Reajustable, compras en pesos uruguayos, conversión automática
5. **Costo $0 para piloto** - Stack gratuito permite validar valor antes de invertir
6. **Desarrollo con IA** - Iteración rápida en días, no meses; ajustes sin dependencia de proveedor externo

### What This System Is NOT

- **No es sistema contable** - Exporta datos para contabilidad, no la reemplaza
- **No es gestión de RRHH** - Mano de obra se modela como insumo (tipo + costo), no personas individuales
- **No es PM genérico** - Específico para construcción con el modelo OT/Rubros/Insumos

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Technical Type** | Web App (PWA responsive, offline-first) |
| **Domain** | Construction / Project Management |
| **Complexity** | Medium |
| **Project Context** | Greenfield - new project |
| **Target Market** | Cooperativas de vivienda uruguayas, extensible a constructoras PyMEs |

### Technical Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | Next.js 14 + React + Tailwind + **shadcn/ui** | SSR, PWA ready, componentes accesibles |
| Backend | Supabase (PostgreSQL + Auth + Storage) | BD relacional, Auth incluido, Storage para fotos |
| Hosting | Vercel | Deploy automático, free tier generoso |
| Offline | PWA + Service Workers | Conectividad irregular en obra |

## Success Criteria

### User Success

| Usuario | Métrica | Target | Momento "Aha!" |
|---------|---------|--------|----------------|
| **DO** | Tiempo para ver estado de obras | < 30 segundos | "Abro el dashboard y sé cómo van todas mis obras sin llamar a nadie" |
| **DO** | Decisiones informadas | 0 decisiones "a ciegas" | "Puedo responder con datos cuando la cooperativa pregunta" |
| **JO** | Tiempo de carga de avance diario | < 2 minutos | "Cargo el avance desde el celular en obra y listo" |
| **JO** | Reducción de interrupciones | -50% llamadas del DO | "Ya no me llaman para preguntar cosas que pueden ver solos" |
| **Compras** | Requisiciones con contexto | 100% vienen de OT aprobada | "Sé que hay presupuesto antes de comprar" |
| **Todos** | Adopción activa | 80% usuarios activos/semana | "Es más fácil que el Excel" |

**User Success Themes:**

- **Tiempo recuperado** - No más horas armando reportes o llamando al JO
- **Tranquilidad** - El sistema alerta si algo se desvía
- **Credibilidad** - Respuestas basadas en datos, no intuición
- **Control** - Decisiones informadas, gestión proactiva

### Business Success

**North Star Metric:**
> "Número de desvíos detectados antes de que impacten"

**Objetivos por Plazo:**

| Plazo | Objetivo | Indicador de Éxito |
|-------|----------|-------------------|
| 1 mes | Sistema funcional en producción | MVP desplegado con usuarios reales |
| 3 meses | Validación de valor | Al menos 1 desvío detectado antes de impactar |
| 6 meses | Escalabilidad probada | 2-3 obras usando el sistema |
| 12 meses | Sostenibilidad | Sistema se mantiene con power user interno |

**Go/No-Go Criteria (Piloto → Fase 2):**

| Criterio | Umbral Mínimo | Acción si No se Cumple |
|----------|---------------|------------------------|
| Adopción | ≥ 3 usuarios activos/semana | Revisar UX, simplificar |
| Completitud | ≥ 50% OTs con datos completos | Reducir campos obligatorios |
| Valor demostrado | ≥ 1 desvío detectado | Revisar lógica de alertas |
| Satisfacción | NPS ≥ 6 | Iterar con feedback directo |

### Technical Success

| Métrica | Target | Justificación |
|---------|--------|---------------|
| Uptime | > 99% | Sistema crítico para operación diaria |
| Sync offline | 100% sin pérdida | Conectividad irregular en obra |
| Tiempo de carga | < 3 segundos | UX fluida, especialmente en móvil |
| PWA instalable | Sí | Acceso rápido desde pantalla de inicio |
| Datos seguros | Backup diario | Información crítica del negocio |

### Measurable Outcomes

**KPIs de Adopción:**

- DAU/MAU > 50%
- Completitud de datos > 80% OTs con campos cargados
- Tiempo de onboarding < 1 hora hasta primera OT creada

**KPIs de Valor:**

- Desvíos detectados ≥ 1 en piloto
- Ahorro estimado documentado cualitativamente
- NPS post-piloto > 7

## Product Scope

### MVP - Minimum Viable Product

**Sprint 0: Fundamentos**

- Auth + Roles (DO, JO, Compras, Admin)
- CRUD Obras
- CRUD Rubros (presupuesto por rubro)
- CRUD Insumos (catálogo de materiales)
- CRUD Usuarios

**Sprint 1: Ciclo de OT (Core)**

- CRUD Órdenes de Trabajo
- Flujo de estados (Borrador → Aprobada → En Ejecución → Cerrada)
- Tareas/Checklist por OT
- Carga de fotos con timestamp

**Sprint 2: Compras Básico**

- Crear Órdenes de Compra
- Vincular OC a OT
- Registrar recepción de materiales

**Sprint 3: Control y Visibilidad**

- Costo real por OT (suma automática)
- Dashboard obra con indicadores
- Alertas de desvíos (costo > estimado)
- Exportación CSV

### Growth Features (Post-MVP)

| Feature | Fase | Justificación |
|---------|------|---------------|
| Certificaciones del Ministerio | 2.0 | Flujo paralelo complejo |
| Notificaciones push | 2.0 | Email primero |
| Modo offline robusto | 2.0 | PWA básica primero |
| Múltiples fórmulas por rubro | 2.0 | Simplificar MVP |
| Integración contable API | 2.0 | CSV primero |
| Multi-obra dashboard avanzado | 2.0 | Dashboard básico primero |

### Vision (Future - 12-24 meses)

| Feature | Fase | Descripción |
|---------|------|-------------|
| OCR de remitos | 3.0 | Extraer datos de fotos automáticamente |
| Carga por voz | 3.0 | "Consumí 50 bolsas de cemento en OT-015" |
| Predicción de desvíos con ML | 3.0 | Alertas predictivas, no solo reactivas |
| Dashboard ejecutivo cooperativa | 3.0 | Vista para socios de la cooperativa |
| Multi-empresa | 3.0 | Varias cooperativas en una instancia |

**Visión a 3 años:**
> Sistema referente para cooperativas de vivienda en Uruguay, usado por 10+ cooperativas, con funcionalidades que los ERPs grandes no ofrecen para este nicho.

## User Journeys

### Roles y Permisos MVP

| Rol | Permisos | Scope |
|-----|----------|-------|
| **DO** (Director de Obra) | Todo: configura obra, rubros, aprueba OTs, ve dashboards, gestiona usuarios | Todas las obras |
| **JO** (Jefe de Obra) | Carga avances, consumos, recepciones. Ve estado de sus OTs y stock | Solo su obra asignada |
| **Compras** | Gestiona OCs, carga recepciones, ve requisiciones pendientes | Todas las obras |

**Modelo de Permisos:**

```
Usuario
├── rol: DO | JO | Compras
├── obras: [array de obras asignadas, o "todas"]
```

Para JO, filtrar todo por su obra asignada. Para DO y Compras, mostrar selector de obra o vista agregada.

### Journey 1: Arq. Martín (DO) - De Bombero a Gestor

**Perfil:** Arquitecto, 45 años, dirige obras para 2 cooperativas, maneja 2-4 obras simultáneas.

**Su historia actual:**
Martín es arquitecto y dirige obras para 2 cooperativas de vivienda. Cada mañana empieza igual: llamar a Carlos (JO de Obra Norte) y a Pedro (JO de Obra Sur) para preguntar "¿cómo vamos?". Después, junta los datos en un Excel que actualiza a mano. Cuando la cooperativa pregunta en la reunión mensual, arma un reporte la noche anterior combinando WhatsApp, emails y su memoria. A veces descubre que una OT se pasó del presupuesto... dos semanas después de que ocurrió.

**Cómo Sistema EDO cambia su vida:**

Es lunes 7:30 AM. Martín abre el sistema desde su celular mientras toma el mate. En 15 segundos ve:

- **Obra Norte:** 72% avance, 68% del presupuesto consumido ✅
- **Obra Sur:** 45% avance, 52% del presupuesto consumido ⚠️

El ícono amarillo lo alerta. Hace tap y ve que la OT-023 (mampostería bloque 3) tiene costo real 18% mayor al estimado. Carlos ya subió fotos mostrando que hubo que reforzar una columna no prevista.

Martín aprueba una nueva OT para regularizar el refuerzo, ajusta el presupuesto del rubro, y llega a la reunión con la cooperativa con datos actualizados. Cuando le preguntan "¿cómo vamos?", comparte su pantalla y muestra el dashboard en vivo.

**Breakthrough moment:** En la reunión trimestral, el presidente de la cooperativa dice "Martín, es la primera vez que entendemos exactamente dónde está nuestra plata".

**Acciones clave en el sistema:**

- Ver dashboard multi-obra
- Drill-down a OT con desvío
- Aprobar/rechazar OTs
- Configurar obra, rubros, usuarios
- Exportar reportes

### Journey 2: Carlos (JO) - Que me dejen trabajar

**Perfil:** Técnico en construcción, 38 años, 100% en campo, usa WhatsApp todo el día.

**Su historia actual:**
Carlos es jefe de obra en Obra Norte hace 3 años. Conoce cada rincón del terreno. Su frustración: pasa más tiempo reportando que ejecutando. El DO lo llama 3 veces por día para preguntar cosas. El administrativo le manda WhatsApp pidiendo datos de materiales. Al final de la semana tiene que completar un Excel que nadie lee hasta que hay un problema.

**Cómo Sistema EDO cambia su vida:**

Es viernes 4 PM, Carlos termina de supervisar el colado de una losa. Saca el celular, abre el sistema, y en 90 segundos:

1. Marca completadas las 3 tareas de la OT-018 (losa nivel 2)
2. Sube 2 fotos del hormigón curado
3. Registra que consumió 45 bolsas de cemento (el sistema resta del stock)

El sistema calcula automáticamente: OT-018 está al 100%, dentro del presupuesto. El DO puede verlo sin llamarlo.

El lunes, Carlos recibe una sola notificación: "OT-019 aprobada - Mampostería bloque 4". No tuvo que esperar una llamada del DO para saber qué sigue.

**Breakthrough moment:** Pasan 3 días sin que el DO lo llame para pedir datos. Carlos le dice a su mujer "por fin puedo hacer mi trabajo tranquilo".

**Acciones clave en el sistema:**

- Ver OTs asignadas a su obra
- Marcar tareas completadas
- Subir fotos con timestamp
- Registrar consumo de materiales
- Crear requisiciones de materiales
- Registrar recepciones en obra

### Journey 3: Laura (Compras) - Contexto antes de comprar

**Perfil:** Administrativa, 32 años, 100% oficina, cómoda con Excel y sistemas.

**Su historia actual:**
Laura maneja compras para las 2 obras de la cooperativa. Su día típico: 15 mensajes de WhatsApp pidiendo materiales, sin saber para qué OT, sin saber si hay presupuesto. Arma órdenes de compra en Excel, las envía por email al proveedor, y después tiene que reconciliar a mano qué llegó vs qué se pidió. Cuando algo no cuadra, empieza el detective work.

**Cómo Sistema EDO cambia su vida:**

Es martes 10 AM. Laura abre el sistema y ve 3 requisiciones pendientes:

- OT-018 (Obra Norte): 50 bolsas cemento, 20 varillas ø12 - Estado: Aprobada ✅
- OT-019 (Obra Norte): 200 bloques 15cm - Estado: Aprobada ✅
- OT-007 (Obra Sur): 30 bolsas cal - Estado: Borrador ⚠️

Laura ignora la de Obra Sur (no está aprobada, no tiene presupuesto confirmado). Para las otras dos, crea una OC agrupando los materiales por proveedor. El sistema ya tiene los precios de referencia del catálogo de insumos.

Cuando llega el camión del proveedor, Laura (o Carlos en obra) registra la recepción:

- Cemento: Pedido 50, Recibido 48 → Sistema alerta diferencia
- Varillas: Pedido 20, Recibido 20 ✅

El sistema actualiza automáticamente el costo real de la OT-018.

**Breakthrough moment:** Fin de mes, Laura exporta el CSV para contabilidad en 2 clicks. Ya no tiene que armar el archivo a mano cruzando 5 Excel.

**Acciones clave en el sistema:**

- Ver requisiciones pendientes (todas las obras)
- Crear OC desde requisiciones
- Registrar recepciones
- Ver diferencias OC vs recibido
- Exportar datos para contabilidad

### Journey Requirements Summary

| Journey | Capabilities Reveladas |
|---------|----------------------|
| **DO - Dashboard** | Vista multi-obra, indicadores de avance/costo, alertas visuales, drill-down |
| **DO - Gestión** | CRUD obras/rubros/usuarios, aprobación de OTs, configuración |
| **JO - Ejecución** | Lista de OTs por obra, checklist de tareas, carga de fotos, registro de consumos |
| **JO - Requisiciones** | Crear pedidos de materiales vinculados a OT |
| **Compras - OC** | Ver requisiciones, crear OC, agrupar por proveedor |
| **Compras - Recepción** | Registrar llegada, comparar vs pedido, alertar diferencias |
| **Todos - Export** | Exportación CSV/Excel para reportes y contabilidad |

## Innovation & Design Principles

### Innovation 1: "Alertar, No Bloquear" - Flexible Reality Design

**Tipo:** Innovación de Diseño/UX

**El Insight:**
Los sistemas de gestión de obra existentes (ERPs, software de construcción) asumen un mundo ideal donde todo se hace en orden. La realidad de la obra es caótica:

- Se compra antes de aprobar la OT porque hay urgencia
- El JO anota los consumos 3 días después
- Llega material que nadie pidió formalmente pero se necesitaba

**El Principio:**
> "Si el sistema bloquea, la gente lo evade. Si el sistema alerta pero deja hacer, la gente lo usa y la información es real."

**Implementación Concreta:**

| Escenario | Sistema Tradicional | Sistema EDO |
|-----------|---------------------|-------------|
| Recepción sin OC | ❌ Bloqueado | ✅ Acepta + marca "sin OC, regularizar" |
| Cerrar OT con consumos diferentes a fórmula | ❌ Bloqueado | ✅ Calcula desvío, alerta, permite cerrar |
| Aprobar OT que excede presupuesto | ❌ Bloqueado | ✅ Advertencia clara, DO decide |
| Compra antes de aprobar OT | ❌ Bloqueado | ✅ Permite vincular después |

**Por qué funciona:**

- La gente usa el sistema en tiempo real (no "después para cumplir")
- Los datos reflejan la realidad, no una versión ideal falsa
- El DO ve las inconsistencias y decide cómo manejarlas
- Menor fricción = mayor adopción

**Validación:**

- Observar si los usuarios cargan datos en tiempo real vs retrospectivamente
- Medir % de registros con alertas de inconsistencia (esperado: ~20%)
- Comparar adopción vs sistemas que la cooperativa haya probado antes

---

### Innovation 2: OT como "Contrato Interno"

**Tipo:** Innovación de Producto

**El Concepto:**
En la mayoría de sistemas, la OT es solo una lista de tareas. En Sistema EDO, la OT es un **mini-contrato** que captura todo el ciclo:

**Al crear la OT (contrato):**

- Qué se va a hacer (descripción, rubro, tareas)
- Qué se necesita (insumos calculados automáticamente desde fórmula)
- Cuánto debería costar (costo estándar = cantidad × precio referencia)
- Quién lo aprobó y cuándo (trazabilidad de autorización)

**Al cerrar la OT (liquidación):**

- Qué se hizo realmente (tareas completadas, fotos)
- Qué se consumió realmente (insumos registrados)
- Cuánto costó realmente (costo real desde OCs/recepciones)
- **Análisis de variación automático** (desvío $ y %)

**Valor Único:**
Cada OT cerrada es una **unidad de aprendizaje**. Al final de la obra:

- No solo sabés cuánto gastaste
- Sabés exactamente **dónde y por qué** te desviaste del plan
- Podés mejorar las fórmulas para futuras obras

**Implicaciones de Diseño:**

- La OT tiene estados claros con significado de negocio (Borrador → Aprobada → Ejecutando → Cerrada)
- Cerrar una OT dispara cálculo automático de desvío
- Dashboard muestra acumulado de desvíos por rubro/obra

---

### Innovation 3: Nicho Específico - Cooperativas de Vivienda Uruguayas

**Tipo:** Innovación de Mercado

**El Vacío:**

| Opción Existente | Por qué no sirve |
|------------------|------------------|
| ERPs grandes (SAP, Oracle) | Carísimos, complejos, pensados para otra escala |
| Software construcción (Procore) | Caros, en inglés, no entienden contexto uruguayo |
| Sistemas locales genéricos | No específicos para obras |
| Excel | Es lo que usan, y no funciona bien |

**Particularidades del Nicho:**

- **Certificaciones MVOTMA:** Flujo paralelo de avance real vs certificado
- **Unidad Reajustable (UR):** Presupuestos en UR, compras en pesos
- **Escala pequeña:** 20-40 usuarios, no 500
- **Ayuda mutua:** Modelo de trabajo cooperativo con particularidades
- **Sin equipo IT:** El sistema debe mantenerse solo o con power user

**Por qué importa:**
Nadie le habla directamente a este mercado. Sistema EDO habla su idioma, entiende sus procesos, y cuesta $0 para empezar.

---

### Risk Mitigation

| Innovación | Riesgo | Mitigación |
|------------|--------|------------|
| "Alertar, no bloquear" | Usuarios ignoran alertas | Dashboard destaca alertas pendientes, resumen diario |
| OT como contrato | Complejidad percibida | UI simple, campos mínimos, autocompletar desde fórmula |
| Nicho específico | Mercado pequeño | Diseño extensible a constructoras PyMEs |

### Validation Approach

**Para "Alertar, no bloquear":**

- KPI: % de datos cargados en tiempo real (< 24h del evento)
- KPI: % de OTs con alertas de inconsistencia (target: 10-30%)
- Cualitativo: "¿Es más fácil que el Excel?" en entrevistas

**Para OT como contrato:**

- KPI: % de OTs cerradas con análisis de desvío completo
- Cualitativo: "¿Entendiste dónde te desviaste?" post-piloto

**Para nicho específico:**

- Adopción en piloto sin marketing (solo boca a boca)
- Feedback: "¿Esto lo hizo alguien que entiende lo que hacemos?"

## Web App Specific Requirements

### Project-Type Overview

Sistema EDO es una **PWA (Progressive Web App)** diseñada para operar en dos contextos muy diferentes:
- **Oficina:** Desktop con conexión estable (DO, Compras)
- **Obra:** Mobile con conectividad intermitente (JO)

Esta dualidad define las decisiones arquitectónicas: debe funcionar perfectamente en ambos extremos.

### Browser & Device Matrix

| Contexto | Dispositivo | Browser Principal | Prioridad |
|----------|-------------|-------------------|-----------|
| JO en obra | Android móvil | Chrome Mobile | **Crítico** |
| JO en obra | iPhone | Safari Mobile | Alta |
| DO oficina | Desktop | Chrome/Edge | Alta |
| Compras oficina | Desktop | Chrome/Edge | Alta |
| DO móvil ocasional | Cualquiera | Chrome/Safari | Media |

**Soporte mínimo:** Chrome 90+, Safari 14+, Edge 90+. No es necesario soportar IE o browsers legacy.

### Responsive Design Strategy

**Mobile-First con breakpoints clave:**

| Breakpoint | Uso | Componentes clave |
|------------|-----|-------------------|
| < 640px (sm) | JO en obra | Lista de OTs, checklist tareas, cámara fotos |
| 640-1024px (md) | Tablet/transición | Híbrido móvil-desktop |
| > 1024px (lg) | DO/Compras desktop | Dashboard multi-obra, tablas, formularios complejos |

**Regla de diseño:** Todo lo que JO hace debe funcionar con una mano en pantalla < 6".

### Performance Targets

| Métrica | Target | Contexto |
|---------|--------|----------|
| **FCP (First Contentful Paint)** | < 1.5s | Conexión 3G en obra |
| **LCP (Largest Contentful Paint)** | < 2.5s | Incluye dashboard con datos |
| **TTI (Time to Interactive)** | < 3s | Usuario puede interactuar |
| **Bundle size inicial** | < 200KB gzip | Next.js code-split automático |
| **Imágenes de fotos** | Compresión client-side | < 500KB por foto antes de subir |

**Estrategias:**
- Server-Side Rendering con Next.js para FCP rápido
- Code splitting por ruta
- Lazy load de componentes pesados (gráficos dashboard)
- Compresión de fotos en cliente antes de upload

### PWA & Offline Strategy

**Nivel de offline: MVP básico → Fase 2 robusto**

| Fase | Capacidad Offline |
|------|-------------------|
| **MVP** | PWA instalable, service worker para assets estáticos, formularios guardan en localStorage si hay error de red |
| **Fase 2** | Sync queue completo, trabajo offline con reconciliación al reconectar |

**Service Worker scope:**
- Cache de assets estáticos (CSS, JS, imágenes UI)
- Cache de datos frecuentes (catálogo insumos, lista de obras)
- Queue de operaciones pendientes cuando hay error de red

### SEO Strategy

**Prioridad: Baja** - Sistema es aplicación interna, no necesita posicionamiento público.

- No se requiere SSR para SEO
- No se requieren meta tags elaborados
- Login protege todo el contenido
- SSR se usa por performance, no por SEO

### Accessibility Level

**Target: WCAG 2.1 AA básico**

| Área | Implementación |
|------|----------------|
| **Contraste** | shadcn/ui cumple por defecto |
| **Keyboard navigation** | Formularios navegables con Tab |
| **Labels** | Todos los inputs con labels asociados |
| **Errores** | Mensajes claros, no solo color rojo |
| **Touch targets** | Mínimo 44x44px para botones móviles |

**Nota:** No es sistema público ni regulado, AA básico es suficiente.

### Real-Time Considerations

**MVP: Sin real-time**
- Datos se cargan al abrir/refrescar
- Pull-to-refresh en móvil
- Suficiente para flujos actuales

**Fase 2: Real-time opcional**
- Supabase Realtime para notificaciones
- Dashboard con auto-refresh cada 30s (no WebSocket pesado)

### Implementation Considerations

**shadcn/ui específicos:**

| Componente | Uso en Sistema EDO |
|------------|-------------------|
| `DataTable` | Listas de OTs, OCs, Insumos |
| `Card` | Dashboard widgets, OT summary |
| `Form` + `Input` | Todos los formularios |
| `Sheet` | Detalles de OT en móvil (slide-up) |
| `Dialog` | Confirmaciones, alertas |
| `Badge` | Estados de OT, alertas de desvío |
| `Tabs` | Navegación dentro de OT (Tareas/Consumos/Fotos) |

**Next.js App Router patterns:**

- Route groups para layouts (dashboard vs auth)
- Server Components para data fetch inicial
- Client Components para interactividad
- API Routes solo si Supabase no cubre el caso

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Approach:** Problem-Solving MVP

Sistema EDO sigue un enfoque de MVP que resuelve el problema core con features mínimas. El objetivo no es impresionar, sino demostrar que el concepto de "OT como eje central + alertar sin bloquear" genera valor real.

**Principios de Scoping:**

| Principio | Aplicación |
|-----------|------------|
| **Menos es más** | Cada feature debe justificar su existencia |
| **Manual antes de automático** | Exportar CSV antes de integración API |
| **Un usuario feliz** | DO satisfecho vale más que 10 features sin adopción |
| **Validar antes de escalar** | Piloto en 1 obra antes de multi-obra complejo |

**Resource Requirements:**

| Rol | Cantidad | Perfil |
|-----|----------|--------|
| Desarrollador Full-Stack | 1 | Next.js + Supabase (puede ser con apoyo IA) |
| Product Owner / Domain Expert | 1 | Conoce el proceso de obra (puede ser el DO) |
| Usuarios Piloto | 3-5 | DO, JO, Compras dispuestos a dar feedback |

### MVP Boundaries Confirmation

**Journeys Soportados en MVP:**

| Journey | Cobertura MVP | Comentario |
|---------|---------------|------------|
| DO - Dashboard | ✅ Completo | Core del valor |
| DO - Gestión | ✅ Completo | Configuración necesaria |
| JO - Ejecución | ✅ Completo | Carga de datos en campo |
| JO - Requisiciones | ✅ Básico | Crear pedido vinculado a OT |
| Compras - OC | ✅ Básico | Crear OC desde requisición |
| Compras - Recepción | ✅ Básico | Registrar llegada |

**Features Explícitamente FUERA del MVP:**

| Feature | Por qué no MVP | Cuándo |
|---------|----------------|--------|
| Certificaciones MVOTMA | Flujo paralelo complejo, no bloquea validación | Fase 2 |
| Notificaciones push | Email/observación manual suficiente para piloto | Fase 2 |
| Modo offline robusto | PWA básica cubre 80% de casos | Fase 2 |
| OCR de remitos | Nice-to-have, no esencial | Fase 3 |
| Carga por voz | Innovación futura | Fase 3 |
| Multi-empresa | Escalar después de validar | Fase 3 |

### Risk Mitigation Strategy

**Technical Risks:**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| PWA no funciona offline | Media | Alto | MVP: localStorage fallback simple, mejorar en Fase 2 |
| Performance con muchos datos | Baja | Medio | Paginación desde el inicio, Supabase escala bien |
| Supabase free tier insuficiente | Baja | Bajo | Piloto cabe holgado, upgrade si hay tracción |

**Market Risks:**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| DO no adopta | Media | Crítico | Involucrar DO en diseño, MVP ultra simple |
| JO rechaza (muy técnico) | Media | Alto | UI mobile-first, mínimos campos, fotos como input principal |
| Cooperativa no ve valor | Baja | Alto | Dashboard con métricas visibles desde día 1 |

**Resource Risks:**

| Riesgo | Mitigación |
|--------|------------|
| Desarrollador no disponible | Stack simple permite onboarding rápido, documentación AI-friendly |
| Tiempo limitado | MVP priorizado agresivamente, features recortables definidas |
| Sin presupuesto | Stack $0 para piloto, escala de costos predecible |

### Phased Development Summary

**Fase 1 - MVP (Sprints 0-3):**
Validar que el sistema genera valor real en una obra piloto.

- Core: OT lifecycle, carga de avances, dashboard, alertas de desvío
- Exit criteria: 3+ usuarios activos/semana, 1+ desvío detectado

**Fase 2 - Growth (Post-validación):**
Expandir a más obras y agregar features que mejoran adopción.

- Certificaciones MVOTMA, offline robusto, notificaciones
- Exit criteria: 2-3 obras usando activamente

**Fase 3 - Expansion (12-24 meses):**
Escalar a otras cooperativas y agregar diferenciadores.

- OCR, voz, multi-empresa, ML para predicciones
- Exit criteria: 10+ cooperativas, modelo de negocio sostenible

## Functional Requirements

### Gestión de Obras y Configuración

- FR1: DO puede crear, editar y archivar obras con datos básicos (nombre, dirección, cooperativa)
- FR2: DO puede definir rubros para una obra con nombre, unidad y presupuesto asignado en UR
- FR3: DO puede crear un catálogo de insumos con nombre, unidad, tipo (material/mano de obra) y precio referencia
- FR4: DO puede definir fórmulas por rubro que especifican insumos y cantidades estándar
- FR5: DO puede asignar usuarios a obras con sus respectivos roles
- FR6: Sistema puede convertir automáticamente valores entre UR y pesos uruguayos usando cotización configurable

### Gestión de Usuarios y Permisos

- FR7: Sistema puede autenticar usuarios mediante email y contraseña
- FR8: DO puede crear usuarios con rol (DO, JO, Compras) y asignarlos a obras
- FR9: JO solo puede ver y operar sobre la obra que tiene asignada
- FR10: DO y Compras pueden ver y operar sobre todas las obras
- FR11: Sistema puede filtrar automáticamente datos según el scope del usuario logueado

### Ciclo de Vida de Órdenes de Trabajo

- FR12: DO/JO puede crear OT en estado Borrador con rubro, descripción y cantidad
- FR13: Sistema puede calcular automáticamente insumos necesarios y costo estimado desde la fórmula del rubro
- FR14: DO puede aprobar OT cambiando estado a "Aprobada"
- FR15: JO puede iniciar ejecución de OT aprobada cambiando estado a "En Ejecución"
- FR16: JO puede marcar OT como "Cerrada" cuando el trabajo está completo
- FR17: Sistema puede registrar timestamps y usuario para cada cambio de estado de OT
- FR18: DO puede ver historial completo de cambios de estado de una OT

### Ejecución y Avance de Tareas

- FR19: JO puede ver lista de OTs asignadas a su obra filtradas por estado
- FR20: JO puede crear tareas/checklist dentro de una OT
- FR21: JO puede marcar tareas como completadas
- FR22: Sistema puede calcular porcentaje de avance de OT basado en tareas completadas
- FR23: JO puede subir fotos asociadas a una OT con timestamp automático
- FR24: JO puede registrar consumo real de insumos en una OT (tipo, cantidad)
- FR25: Sistema puede comparar consumo real vs estimado por fórmula y calcular diferencia

### Gestión de Compras y Recepciones

- FR26: JO puede crear requisición de materiales vinculada a una OT
- FR27: Compras puede ver todas las requisiciones pendientes de todas las obras
- FR28: Compras puede crear Orden de Compra agrupando requisiciones por proveedor
- FR29: Compras puede especificar proveedor, precios y condiciones en la OC
- FR30: JO/Compras puede registrar recepción de materiales indicando cantidades recibidas
- FR31: Sistema puede comparar cantidad pedida vs recibida y alertar diferencias
- FR32: Sistema puede vincular costo de OC a las OTs que generaron las requisiciones

### Control Financiero y Desvíos

- FR33: Sistema puede calcular costo real de una OT sumando insumos consumidos × precio real
- FR34: Sistema puede comparar costo estimado vs costo real de una OT y calcular desvío en $ y %
- FR35: Sistema puede agregar desvíos por rubro mostrando acumulado
- FR36: Sistema puede alertar visualmente cuando una OT supera el costo estimado (principio "alertar, no bloquear")
- FR37: Sistema puede permitir cerrar OT aunque tenga desvío, registrando la decisión del DO

### Dashboard y Visibilidad

- FR38: DO puede ver dashboard con estado de todas sus obras en una sola vista
- FR39: Dashboard puede mostrar indicadores de avance físico (%) por obra
- FR40: Dashboard puede mostrar indicadores de consumo presupuestario (%) por obra
- FR41: Dashboard puede destacar obras/OTs con alertas de desvío usando indicadores visuales
- FR42: DO puede hacer drill-down desde dashboard a OT específica con desvío
- FR43: JO puede ver resumen de su obra con OTs activas y estado de cada una

### Exportación de Datos

- FR44: DO/Compras puede exportar listado de OTs a CSV con filtros por obra/estado/fecha
- FR45: Compras puede exportar listado de OCs y recepciones a CSV para contabilidad
- FR46: DO puede exportar resumen de desvíos por rubro a CSV

### Flexibilidad Operativa (Innovación "Alertar, No Bloquear")

- FR47: Sistema puede aceptar recepción de materiales sin OC previa, marcando como "pendiente de regularizar"
- FR48: Sistema puede permitir aprobar OT aunque exceda presupuesto disponible del rubro, con advertencia visible
- FR49: Sistema puede vincular OC a OT después de que la compra fue realizada
- FR50: Sistema puede registrar operaciones fuera de secuencia normal sin bloquear, generando alerta para revisión

## Non-Functional Requirements

### Performance

| Métrica | Requirement | Contexto |
|---------|-------------|----------|
| **Tiempo de respuesta** | < 2 segundos para operaciones CRUD | Usuario no debe esperar |
| **Dashboard load** | < 3 segundos con datos de 3+ obras | DO necesita vista rápida |
| **Carga de foto** | < 5 segundos incluyendo compresión | JO en campo con 3G |
| **Búsqueda/filtros** | < 1 segundo | Interacción fluida |
| **Cálculos de desvío** | En tiempo real al guardar datos | Feedback inmediato |

**Condiciones de prueba:**

- Conexión: 3G móvil (1 Mbps down)
- Datos: 50 OTs por obra, 3 obras activas
- Usuarios concurrentes: 5 simultáneos

### Security

| Área | Requirement |
|------|-------------|
| **Autenticación** | Email + contraseña con Supabase Auth |
| **Autorización** | Row Level Security (RLS) en todas las tablas |
| **Datos en tránsito** | HTTPS obligatorio (Vercel default) |
| **Datos en reposo** | Encriptación en PostgreSQL (Supabase default) |
| **Sesiones** | JWT con expiración configurable |
| **Permisos** | JO solo accede a su obra, enforced en BD |

**Nota:** No manejamos pagos ni datos de salud. Seguridad estándar de aplicación web interna es suficiente.

### Reliability & Availability

| Métrica | Requirement | Justificación |
|---------|-------------|---------------|
| **Uptime** | > 99% mensual | Obra no puede quedarse sin sistema por días |
| **Backups** | Diario automático | Supabase incluye backup diario |
| **Recovery** | < 4 horas RTO | Tiempo aceptable para restaurar |
| **Data loss** | < 24 horas RPO | Pérdida máxima de 1 día de datos |

**Degradación elegante:**

- Si Supabase no disponible: mostrar mensaje claro, no errores crípticos
- Si foto no sube: guardar en localStorage y reintentar
- Si cálculo falla: mostrar último valor conocido con indicador

### Scalability (Diseño para Crecimiento)

| Fase | Capacidad Target |
|------|------------------|
| **MVP** | 1 obra, 5 usuarios, 100 OTs |
| **Fase 2** | 3 obras, 15 usuarios, 500 OTs |
| **Fase 3** | 10 obras, 50 usuarios, 2000 OTs |

**Diseño desde MVP:**

- Todas las queries filtran por obra_id
- Paginación en listados (20 items default)
- Índices en columnas de filtro frecuente
- Supabase free tier soporta hasta Fase 2 sin upgrade

### Data Management

| Área | Requirement |
|------|-------------|
| **Retención de fotos** | Indefinida (Storage de Supabase) |
| **Retención de datos** | Indefinida (PostgreSQL) |
| **Exportación** | CSV descargable para cualquier listado |
| **Portabilidad** | Exportación completa de obra a JSON (Fase 2) |
| **Auditoría** | Timestamps created_at/updated_at en todas las tablas |

### Usability (Específico para Contexto de Obra)

| Área | Requirement |
|------|-------------|
| **Tiempo de onboarding** | < 1 hora hasta primera OT creada |
| **Uso con una mano** | Todas las acciones de JO operables con thumb |
| **Sin manual** | UI autoexplicativa, sin necesidad de capacitación formal |
| **Errores recuperables** | Toda operación destructiva requiere confirmación |
| **Español** | UI 100% en español uruguayo |

