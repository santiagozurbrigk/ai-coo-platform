# Auditoría de funcionalidad pendiente

**Fecha:** 2026-07-03  
**Alcance:** Módulos Marketing, Ventas, Producto, Operaciones y Finanzas (`apps/web`)  
**Objetivo:** Mapa de funcionalidades incompletas o no implementadas (no duplica hallazgos de datos mock de `docs/mock-data-audit.md`, salvo cuando el gap es de comportamiento/CRUD distinto).

## Metodología

Se revisaron comentarios `TODO`/`FIXME`/`próximamente`, acciones UI sin efecto, CRUD incompleto, rutas de navegación, server actions que no completan el flujo, nombres `-wip`/`-placeholder`, validaciones ausentes e integraciones a medio conectar. Excluidos: tests, Storybook, rutas `/demo` y fallbacks mock ya documentados en la auditoría anterior.

**Completitud:** `no empezada` · `parcial` · `solo UI sin lógica`  
**Impacto:** `alto` · `medio` · `bajo`

---

## Marketing

### Overview

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Pipeline de atribución por asset no escribe métricas de conversión (`conversations_generated`, `bookings_influenced`, `sales_influenced`, `revenue_influenced`) — solo se leen de DB, siempre en 0 | `apps/web/app/marketing/actions.ts:150-153`; sin escrituras en todo `apps/web` | no empezada | alto |
| Tendencias de alcance/engagement hardcodeadas en 0 aunque haya assets reales | `apps/web/lib/marketing/overview-metrics.ts:53-56,63` | parcial | medio |
| Banda de métricas de engagement (historias, comentarios, crecimiento de perfil) oculta cuando hay métricas reales; solo aparece en modo sin `metricsProp` | `apps/web/components/marketing/overview/metrics-sections.tsx:126-163` | parcial | medio |
| Seguidores / nuevos seguidores siempre 0 en overview | `apps/web/lib/marketing/overview-metrics.ts:66-67` | no empezada | medio |

### Contenido

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Etiquetado IA solo en sync de YouTube; Instagram importa assets sin `ai_content_label` | `apps/web/lib/google/sync-youtube.ts:71-111` vs `apps/web/lib/instagram/sync.ts:28-53` (sin `labelContentAsset`) | parcial | alto |
| Sin etiqueta manual si el asset no tiene label previo (componente retorna `null`) | `apps/web/components/marketing/content-label-badge.tsx:42` | parcial | medio |
| Detalle de contenido con journey/revenue demo cuando el ID no existe en DB (ruta mock) | `apps/web/app/(platform)/marketing/content/[id]/page.tsx:18-20` — ver mock-audit; gap funcional: no hay página de error ni creación | parcial | medio |

### Conexión con Ventas

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Pantalla bloqueada sin Instagram aunque existan ventas/UTMs de YouTube | `apps/web/components/marketing/marketing-sales-connection.tsx:21-49` | parcial | alto |
| Ranking de contenido solo atribuye ventas vía cadena UTM → `youtube_video_id` → `external_id` (excluye Instagram y leads sin UTM) | `apps/web/lib/marketing/content-sales-rank.ts:44-126` | parcial | alto |
| Análisis de patrones de contenido con IA | `apps/web/components/marketing/marketing-sales-connection.tsx:145-146` | no empezada | medio |
| Journeys dependen de cliente cerrado + conversación vinculada; sin puente automático desde closing | `apps/web/components/marketing/marketing-sales-connection.tsx:127-130` | parcial | medio |

### Formularios

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Submódulo en sidebar pero ausente del subnav de Marketing (navegación inconsistente con UTMs) | `apps/web/lib/navigation/sidebar-modules.ts:38` vs `apps/web/components/marketing/marketing-subnav.tsx:7-15` | parcial | bajo |
| Solo listado + sync; sin CRUD de formularios ni desconexión desde esta pantalla | `apps/web/app/(platform)/marketing/forms/page.tsx:7-59` | parcial | bajo |

### UTMs

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Bug: al crear UTM desde video de YouTube se guarda UUID interno del asset, no `external_id`; rompe atribución en ranking | `apps/web/components/marketing/utm-generator.tsx:58-60,119-120` vs `apps/web/lib/marketing/content-sales-rank.ts:121-126` | parcial | alto |
| Solo crear UTMs; sin editar ni eliminar | `apps/web/app/marketing/actions.ts:412-507` (solo `createUTMLinkAction` / `getUTMLinksAction`) | parcial | medio |
| Ruta UTMs en subnav pero no en sidebar | `apps/web/components/marketing/marketing-subnav.tsx:14` vs `apps/web/lib/navigation/sidebar-modules.ts:31-38` | parcial | bajo |

---

## Ventas

### Bandeja (Inbox)

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Bandeja de solo lectura: no hay composer para responder mensajes | `apps/web/components/sales/conversation-thread.tsx:9-63` (solo render de mensajes) | parcial | alto |
| Flag `unread` se setea al recibir lead pero nunca se limpia al abrir conversación | `apps/web/lib/sales/upsert-inbound-conversation.ts:124,161`; sin `markAsRead` en providers | parcial | medio |
| Análisis IA de conversación pendiente hasta 3+ mensajes; sin trigger manual | `apps/web/components/sales/conversation-analysis.tsx:75-82` | parcial | medio |
| Journey inline enlaza a closing genérico, no a la llamada específica | `apps/web/components/sales/lead-journey-inline.tsx:132-135` | parcial | bajo |

### Métricas

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Tendencia de agendamientos usa `lastMessageAt` de conversaciones booked, no fecha real de booking | `apps/web/lib/metrics/derive-sales-metrics.ts:26-28` | parcial | medio |
| Ranking de closers con `trend: "stable"` fijo; no calcula tendencia real | `apps/web/app/sales/actions.ts:152` | parcial | medio |
| Objeciones frecuentes con fallback mock | Ver `docs/mock-data-audit.md` — no repetido aquí | — | — |

### Closing

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Botones de resultado visibles aunque la llamada ya esté cerrada / no show (sin guard de estado) | `apps/web/components/closing/closing-overview.tsx:395-407` | parcial | alto |
| Re-cierre puede crear cliente duplicado (`markCallClosed` siempre llama `addClient`) | `apps/web/providers/platform-data-provider.tsx:478-504` | parcial | alto |
| `closedByName` hardcodeado en modal de pago | `apps/web/components/closing/payment-modal.tsx:147` | parcial | medio |
| URL Fathom guardada pero sin análisis de llamada vinculado al cliente post-cierre | `apps/web/components/closing/payment-modal.tsx:159`; `apps/web/components/closing/closing-overview.tsx:377-391` (solo link externo) | parcial | medio |
| Vista previa Fathom es placeholder estático | `apps/web/components/closing/closing-overview.tsx:383-384` | solo UI sin lógica | bajo |

---

## Producto

### Módulo principal (`/product`)

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Frameworks de ventas: tabla `sales_frameworks` + actions, pero sin UI dedicada de CRUD (solo vía RAG suggest) | `apps/web/app/product/actions.ts:342-387`; `apps/web/components/product/product-rag-suggest.tsx` | parcial | medio |
| Stats de oferta en mapper son placeholders (`—`, `0`, strings vacíos) | `apps/web/lib/product/mapper.ts:138-147` | solo UI sin lógica | medio |
| Escalera de valor en vista detalle: métricas `closesPerMonth` / `closeRate` placeholder | `apps/web/lib/product/mapper.ts:162-163,174-175` | solo UI sin lógica | bajo |

### Avatar (`/product/avatar/[id]`)

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Insights IA del avatar dependen de datos reales de ventas aún no cableados al mapper | `apps/web/lib/product/mapper.ts` (campos `aiInsight` vacíos en filas relacionadas) | parcial | bajo |

### Oferta (`/product/offer/[id]`)

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Página de detalle solo lectura; editar/archivar solo desde vista detalle del módulo principal | `apps/web/components/product/offer-detail.tsx` (sin botones Editar) vs `apps/web/components/product/detail-view.tsx:104-116` | parcial | medio |
| Objeción principal y handler siempre vacíos en mapper | `apps/web/lib/product/mapper.ts:138-139` | parcial | bajo |

### Escalera de valor (`/product/value-ladder`)

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Vista read-only; sin reordenar, editar steps ni marcar core offer desde esta página | `apps/web/components/product/value-ladder-section.tsx:23-36` (solo navegación a oferta) | parcial | medio |
| Métricas por step no calculadas desde ventas reales | `apps/web/lib/product/mapper.ts:162-163` | no empezada | bajo |

### Propuesta de valor (`/product/proposition`)

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Campos editables en UI pero sin persistencia (solo `useState` local) | `apps/web/components/product/proposition-section.tsx:24,59-66` | solo UI sin lógica | alto |
| Texto promete inyección al Agente pero los cambios locales no se guardan ni propagan | `apps/web/components/product/proposition-section.tsx:81-85` | parcial | alto |

---

## Operaciones

### Overview

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Contenido ejecutivo (riesgos, cuellos, recomendaciones) depende de reporte semanal IA con `status === "ready"` | `apps/web/components/operations/operations-overview.tsx:29-40` | parcial | alto |
| Sin reporte listo solo muestra empty state + grid de departamentos (sin generación manual) | `apps/web/components/operations/operations-report-empty-state.tsx` (montado desde overview) | parcial | medio |

### Inputs semanales

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Grabación de voz simulada (toast mock, sin transcripción) | `apps/web/components/operations/weekly-input-form.tsx:222-228` | solo UI sin lógica | medio |
| `getWeeklyInputsHistoryAction` implementada pero sin UI de historial | `apps/web/app/operations/actions.ts:130-145` (sin referencias en componentes) | parcial | medio |
| Sin editar ni eliminar inputs ya enviados | `apps/web/app/operations/actions.ts:56-87` (solo upsert) | parcial | bajo |

### SOPs

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Adjuntos en creador de SOP marcados como próximamente | `apps/web/components/sops/sop-creator-form.tsx:193` | no empezada | medio |

### Team Inputs

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Reutiliza mismos datos que weekly inputs; lista solo lectura | `apps/web/app/(platform)/operations/team-inputs/page.tsx:10-18`; `apps/web/components/operations/team-inputs-list.tsx:5-26` | parcial | medio |
| Sin editar/eliminar inputs del equipo | `apps/web/components/operations/team-inputs-list.tsx` | parcial | bajo |

### Inteligencia

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Snapshot depende de job/cron que escribe `intelligence_snapshots`; sin datos → empty state permanente | `apps/web/app/intelligence/actions.ts:36-58`; `apps/web/components/intelligence/intelligence-page-content.tsx:14-21` | parcial | alto |
| Subrutas (`/insights`, `/recommendations`, etc.) solo redirigen a anchors en la página principal | `apps/web/app/(platform)/intelligence/insights/page.tsx:4-5` | parcial | bajo |
| Links de cards usan `flowLinks` con mapas hardcodeados a IDs demo para IDs desconocidos | `apps/web/lib/navigation/flow-links.ts:9-60` | parcial | bajo |

### Reportes ejecutivos

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Sidebar solo enlaza reporte semanal; mensual e historial existen pero no están en nav | `apps/web/lib/navigation/sidebar-modules.ts:59` vs `apps/web/app/(platform)/executive-reports/monthly/page.tsx`, `.../history/page.tsx` | parcial | medio |
| Sin reportes generados → empty state; no hay botón de generación manual | `apps/web/app/(platform)/executive-reports/weekly/page.tsx:9-16` | parcial | medio |

### Área del fundador

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Mismo snapshot de inteligencia; sin vistas o acciones exclusivas de fundador más allá del briefing | `apps/web/app/(founder)/founder/page.tsx:4-6`; `apps/web/components/founder/founder-overview.tsx:16-80` | parcial | medio |

---

## Finanzas

### Overview

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Empty state pide configurar plataformas en Gastos, pero el CRUD de plataformas está en Configuración | `apps/web/components/finance/finance-overview.tsx:40-45` vs `apps/web/components/settings/payment-platforms-settings-section.tsx` | parcial | medio |
| Componentes Stripe/MercadoPago huérfanos (ya no montados en overview tras quitar integraciones) | `apps/web/components/finance/stripe-section.tsx`, `mercadopago-section.tsx` vs `apps/web/components/finance/finance-overview.tsx` | parcial | bajo |
| Balances por plataforma dependen de pagos registrados en cierres; sin vista de gestión de plataformas en `/finance` | `apps/web/components/finance/finance-metrics.tsx` | parcial | bajo |

### Gastos

| Funcionalidad pendiente | Evidencia | Completitud | Impacto |
|-------------------------|-----------|-------------|---------|
| Compensación de equipo: solo editar miembros existentes; sin alta ni baja | `apps/web/components/expenses/expenses-overview.tsx:256-315` (solo `updateTeamCompensation`) | parcial | medio |
| Validación laxa en modales (nombres con fallback `"Gasto"` / `"Suscripción"` si campo vacío) | `apps/web/components/expenses/expenses-overview.tsx:507,600` | parcial | bajo |
| Modo sin Supabase sirve mocks | Ver `docs/mock-data-audit.md` — no repetido | — | — |

---

## Resumen

### Conteo por módulo

| Módulo | Hallazgos |
|--------|-----------|
| Marketing | 18 |
| Ventas | 12 |
| Producto | 11 |
| Operaciones | 14 |
| Finanzas | 6 |
| **Total** | **61** |

### Top 10 — mayor impacto en UX si no se resuelven

1. **Bandeja de ventas sin poder responder** — el equipo no puede contestar leads desde la plataforma (`conversation-thread.tsx`).
2. **Pipeline de atribución marketing→ventas no escribe métricas por contenido** — funnels y top converting muestran ceros aunque haya actividad real (`marketing/actions.ts` + ausencia de escrituras).
3. **Bug UTM: UUID interno vs `external_id` de YouTube** — rompe ranking y atribución de ventas a videos (`utm-generator.tsx` + `content-sales-rank.ts`).
4. **Closing sin guard de estado / riesgo de clientes duplicados** — se puede re-cerrar la misma llamada (`closing-overview.tsx`, `platform-data-provider.tsx`).
5. **Propuesta de valor editable pero no persistente** — el usuario cree que alimenta al Agente pero los cambios se pierden (`proposition-section.tsx`).
6. **Conexión Marketing–Ventas bloqueada sin Instagram** — oculta datos útiles de YouTube/UTM (`marketing-sales-connection.tsx`).
7. **Operaciones Overview vacío hasta que corra el job de reporte semanal IA** — sin alternativa manual (`operations-overview.tsx`).
8. **Inteligencia / Área fundador vacíos hasta snapshot automático** — misma dependencia de pipeline batch (`intelligence/actions.ts`).
9. **Etiquetado IA de contenido solo en YouTube** — biblioteca de Instagram sin labels automáticos ni manual inicial (`instagram/sync.ts` vs `sync-youtube.ts`).
10. **`closedByName` hardcodeado en cierre** — registros de quién cerró incorrectos para todo el equipo (`payment-modal.tsx:147`).

---

*Generado por relevamiento estático del código. No se modificó código de producción.*
