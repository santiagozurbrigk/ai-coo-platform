# Auditoría de datos mock en UI

**Fecha:** 2026-07-03  
**Alcance:** `apps/web` (código de producción; excluye tests, Storybook y rutas de demo explícitas)  
**Objetivo:** Identificar datos hardcodeados o fixtures que se muestran como si fueran reales.

## Metodología

Se buscaron:

- Imports desde `@/mocks/*` en componentes, páginas, providers y actions
- Fallbacks a mock cuando Supabase falla, está vacío o no está configurado
- Arrays/objetos hardcodeados con métricas, nombres o narrativas de ejemplo
- Comentarios y strings con `mock`, `demo`, `fake`, `hardcoded`, `TODO`/`FIXME` ligados a datos visibles
- Estados `usingMock`, `dataSource: "mock"`, `hasRealData={false}`

**Excluido (no reportado como problema):**

- Placeholders de inputs (`placeholder="tu@empresa.com"`, etc.)
- Carpeta `apps/web/mocks/` como definición de fixtures (solo se reporta si se importa en prod)
- Rutas `/demo`, `/redesign-preview`, `components/design-system/showcase.tsx`
- Landing pública (`components/landing/*`)
- Seeds/fixtures no importados en runtime de producción (ver apéndice)
- Empty states intencionales sin métricas ficticias

**Prioridad:**

| Nivel | Criterio |
|-------|----------|
| **Crítico** | Usuario con Supabase en producción puede ver datos falsos como reales (o sin etiqueta clara) |
| **Medio** | Mock visible pero etiquetado, UX no funcional, o fallback solo en error/vacío |
| **Bajo** | Solo sin Supabase, catálogo estático sin métricas, código muerto o cosmético |

---

## Hallazgos

| Archivo | Línea(s) | Qué mock / hardcode | Pantalla / feature | Prioridad |
|---------|----------|---------------------|-------------------|-----------|
| `apps/web/components/dashboard/next-actions-strip.tsx` | 7–31 | Array `ACTIONS` con textos inventados: «12 sin responder», «Reporte Semana 20», «Generado el lunes» | Dashboard → «Qué hacer ahora» | **Crítico** |
| `apps/web/lib/metrics/sparkline-series.ts` | 3–21, 45–53 | `SPARKLINE_SERIES` — curvas de 7 puntos fijas (revenue, bookingRate, reach, etc.) | Sparklines en dashboard y métricas | **Crítico** |
| `apps/web/components/shared/metrics-band.tsx` | 31–32 | Usa `DASHBOARD_SPARKLINE_BY_ID` + `sparklineProps()` | Bandas de métricas del panel | **Crítico** |
| `apps/web/components/shared/metric-grid.tsx` | 30–31 | Idem sparklines hardcodeadas | Grid de métricas | **Crítico** |
| `apps/web/components/dashboard/sales-metrics-section.tsx` | 30 | `sparklineProps()` sobre series fijas | Dashboard → sección ventas | **Crítico** |
| `apps/web/lib/metrics/frequent-objections.ts` | 122–155, 246–249 | `mockFrequentObjections` → `mockFrequentObjectionSummaries()` cuando no hay `call_analyses` ni objeciones en conversaciones | Dashboard, Ventas → métricas | **Crítico** |
| `apps/web/app/(platform)/dashboard/page.tsx` | 14–29 | Fallback explícito a `mockFrequentObjectionSummaries()` sin Supabase o si falla auth | `/dashboard` | **Crítico** (sin Supabase) / **Medio** (con Supabase, hereda fallback de `getFrequentObjections`) |
| `apps/web/app/(platform)/sales/metrics/page.tsx` | 7–23 | Mismo fallback de objeciones frecuentes | `/sales/metrics` | **Crítico** |
| `apps/web/components/sales/frequent-objections-panel.tsx` | 50, 62, 67 | `dataSource = "mock"` por defecto; badge «Datos de demostración» | Dashboard / métricas ventas | **Medio** (bien etiquetado cuando aplica) |
| `apps/web/app/sales/actions.ts` | 61–124 | `mockTeamRanking` si no hay Supabase, tabla ausente, sin filas o error | Ventas → ranking de closers; detalle cliente | **Crítico** |
| `apps/web/app/sales/actions.ts` | 128–165 | `mockCloserEvolution` por nombre del closer en todos los fallbacks | Detalle cliente → evolución del closer | **Crítico** |
| `apps/web/app/sales/actions.ts` | 168–169 | `getTeamAverageEvolutionAction()` **siempre** devuelve `getTeamAverageEvolution()` desde mocks; nunca consulta DB | Detalle cliente → línea de promedio del equipo | **Crítico** |
| `apps/web/mocks/call-analyses.ts` | 3–233 | Fuente: scores, objeciones y rankings de Laura/Carlos/etc. | Ventas (vía actions anteriores) | **Crítico** (fuente) |
| `apps/web/providers/platform-data-provider.tsx` | 187–207 | `mockConversations`, `mockClosingCalls`, `mockClients`, `mockSalesMetrics` cuando `!isSupabaseConfigured()` | Inbox, Closing, Clientes, Dashboard | **Bajo** (solo sin Supabase) |
| `apps/web/providers/platform-data-provider.tsx` | 199–203 | Durante loading usa `mockSalesMetrics.closerBreakdown` en `deriveSalesMetrics` | Dashboard → métricas ventas (flash al cargar) | **Medio** |
| `apps/web/mocks/sales.ts` | 26–240 | Conversaciones demo con nombres, scores y métricas de ventas | Ventas / Dashboard (modo sin Supabase) | **Bajo** (fuente) |
| `apps/web/mocks/clients.ts` | 18–124 | Clientes demo con análisis de llamadas embebido | `/clients` (modo sin Supabase) | **Bajo** (fuente) |
| `apps/web/mocks/closing.ts` | 26–91 | Llamadas de cierre demo | `/closing` (modo sin Supabase) | **Bajo** (fuente) |
| `apps/web/components/operations/operations-overview.tsx` | 33–50 | `mockOperationsOverview` completo (reporte ejecutivo, riesgos, cuellos, recomendaciones, grid) si no hay reporte semanal `ready` | `/operations/overview` | **Crítico** |
| `apps/web/app/(platform)/operations/overview/page.tsx` | 12–23 | `mockOperationsOverview.departments` si no hay Supabase o falla `computeDepartmentStatuses` | `/operations/overview` → grid departamentos | **Crítico** |
| `apps/web/mocks/operations-overview.ts` | 3–162 | Narrativa demo (Juan sin responder, SOP desactualizado, métricas de mayo, etc.) | Operaciones (fuente del fallback anterior) | **Crítico** (fuente) |
| `apps/web/components/operations/weekly-input-form.tsx` | 222–228, 304 | `handleMockRecording` — toast «Mock — en producción se transcribirá…»; grabación simulada | Operaciones → inputs semanales | **Medio** (UX mock, no inyecta listas falsas) |
| `apps/web/components/operations/weekly-inputs-page-content.tsx` | 124 | Banner «Modo demo — conectá Supabase…» | `/operations/weekly-inputs` | **Bajo** |
| `apps/web/components/workboard/workboard-time-report.tsx` | 166–183, 214–217 | `mockMemberTimeReports` como estado inicial y fallback; badge «Datos demo» | Workboard → vista «Tiempo por persona» | **Crítico** |
| `apps/web/mocks/workboard-time.ts` | 4–122 | Reportes de Valentina Ruiz, Juan Pérez, horas y tareas inventadas | Workboard (fuente) | **Crítico** (fuente) |
| `apps/web/app/(platform)/marketing/content/[id]/page.tsx` | 18–20 | Si no hay asset en DB, `getContentById(id)` desde mocks (`c1`, `c2`, etc.) | `/marketing/content/[id]` | **Crítico** |
| `apps/web/components/marketing/marketing-content-detail.tsx` | 92–149 | Render con `mockContent`; labels «Revenue influenciado (demo)», «Participación en el journey (demo)» | Detalle de contenido (ruta mock) | **Crítico** (etiquetado) |
| `apps/web/mocks/marketing-insights.ts` | 37–305 | Assets, journeys y métricas de marketing demo | Marketing contenido (fuente) | **Crítico** (fuente) |
| `apps/web/components/marketing/overview/metrics-sections.tsx` | 77, 126–163 | `metricsProp ?? mockMarketingOverview` + `additionalMarketingMetrics` hardcodeados | Marketing overview (fallback latente si se monta sin `metrics`) | **Medio** — hoy `marketing-overview.tsx` solo monta el componente con métricas reales o empty state |
| `apps/web/mocks/marketing.ts` | 12–178 | `mockMarketingOverview`, series y funnels demo | Marketing (fuente) | **Medio** (fuente) |
| `apps/web/components/business-context/suggested-call-tasks-panel.tsx` | 9–57 | `getSuggestedTasksForDocument`, `SUGGESTED_TASK_ASSIGNEES` (Valentina, Juan, etc.); toast simula «Tarea agregada» sin persistir | Business context → detalle doc Fathom | **Crítico** |
| `apps/web/mocks/suggested-call-tasks.ts` | 3–86 | Tareas IA hardcodeadas por `document.id` (`doc1`, `doc2`, `doc7`) | Business context (fuente) | **Crítico** (fuente) |
| `apps/web/app/integrations/actions.ts` | 262–364 | Catálogo base desde `mockIntegrations`; proveedores no implementados forzados a `not_connected` | `/integrations` | **Bajo** — catálogo de integraciones, conteos reales para providers activos |
| `apps/web/mocks/integrations.ts` | 45–47 | Notion/Airtable/Sheets con `status: connected` y `recordsSynced` en el fixture | Integraciones (solo metadata del array; se sobrescribe en action) | **Bajo** |
| `apps/web/app/finance/actions.ts` | 83–91 | Import dinámico de `mockFixedExpenses`, `mockSubscriptions`, etc. si `!isSupabaseConfigured()` | `/finance`, Gastos | **Bajo** |
| `apps/web/providers/finance-data-provider.tsx` | 287, 305 | `mockFinanceSummary`, `mockMonthlySeries` sin Supabase | Finanzas, Dashboard | **Bajo** |
| `apps/web/mocks/expenses.ts` | 9–143 | Gastos, suscripciones y compensación demo | Finanzas (fuente) | **Bajo** (fuente) |
| `apps/web/mocks/finance.ts` | 7–68 | Resumen financiero y plataformas demo | Finanzas (fuente) | **Bajo** (fuente) |
| `apps/web/components/finance/payment-platforms-section.tsx` | 17 | `PLATFORM_SUGGESTIONS` — nombres sugeridos al crear plataforma | Finanzas → plataformas de pago | **Bajo** (autocomplete, no métricas) |
| `apps/web/app/agent/actions.ts` | 60–61, 544–551 | `MOCK_REPLY` fijo si Claude/API falla | `/agent` | **Crítico** (fallback en error) |
| `apps/web/providers/floating-chat-provider.tsx` | 51–52, 141 | Mismo `MOCK_REPLY` en catch de `sendAgentMessageAction` | Chat flotante global | **Crítico** (fallback en error) |
| `apps/web/components/clients/client-detail.tsx` | 204–209 | Título «Insights de IA **(mock)**» aunque `aiInsights` puede ser texto real generado al cerrar deal | `/clients/[id]` | **Medio** |
| `apps/web/components/closing/payment-modal.tsx` | 44, 244, 278 | Dropzone «Subir comprobante (mock)» — upload no implementado | Closing → modal de pago | **Medio** |
| `apps/web/components/super-admin/infrastructure-page.tsx` | 10–43 | Array fijo de estados de integraciones («Configurado ✓», «Pendiente aprobación») no leídos de runtime | Super Admin → infraestructura | **Medio** |
| `apps/web/components/super-admin/organization-detail.tsx` | 124 | Toast «Mock — datos de prueba restaurados» en botón Resetear | Super Admin → detalle org | **Bajo** |
| `apps/web/app/login/page.tsx` | 7–8 | `MockLoginPage` si `!isSupabaseConfigured()` | `/login` | **Bajo** |
| `apps/web/components/auth/login-screen.tsx` | 9–36, 64 | `MOCK_CLIENT_CREDENTIALS`, hints de demo | Login sin Supabase | **Bajo** |
| `apps/web/lib/auth/mock-credentials.ts` | 3–8 | `demo@client.com` / `demo123` | Auth local | **Bajo** |
| `apps/web/components/product/mock-phase-badge.tsx` | 12–20 | Badge «Sin datos configurados» cuando `!hasRealData` | Producto (avatares, ofertas) | **Bajo** |
| `apps/web/lib/youtube/retention.ts` | 8–17 | `estimateRetentionAtCTA` — curva exponencial estimada, no Analytics API | Marketing → métricas YouTube | **Medio** (algoritmo placeholder, no narrativa demo) |
| `apps/web/components/marketing-insights/lead-journey-timeline.tsx` | 7, 12 | `getContentById` desde mocks | — (componente sin referencias en rutas actuales) | **Bajo** (código muerto) |
| `apps/web/types/sales.ts` | 30 | Comentario «Scoring automático (mock / Phase 2 IA)» en `qualificationScore` | Tipos ventas | **Bajo** (documentación; scoring real vía DB cuando existe) |

---

## Resumen

| Métrica | Valor |
|---------|-------|
| **Hallazgos reportados** | **52** |
| **Crítico** | **22** |
| **Medio** | **12** |
| **Bajo** | **18** |

### Módulos más afectados (por cantidad de hallazgos críticos + medio)

| Módulo | Crítico | Medio | Bajo | Total |
|--------|---------|-------|------|-------|
| **Dashboard / métricas compartidas** | 8 | 2 | 1 | 11 |
| **Ventas** | 6 | 1 | 4 | 11 |
| **Operaciones** | 3 | 1 | 1 | 5 |
| **Workboard** | 2 | 0 | 0 | 2 |
| **Marketing** | 3 | 2 | 0 | 5 |
| **Business context** | 2 | 0 | 0 | 2 |
| **Agente / chat** | 2 | 0 | 0 | 2 |
| **Clientes / Closing** | 0 | 2 | 0 | 2 |
| **Finanzas** | 0 | 0 | 5 | 5 |
| **Integraciones** | 0 | 0 | 2 | 2 |
| **Auth / Super Admin / Producto** | 0 | 1 | 5 | 6 |

### Prioridades recomendadas para limpieza

1. **Dashboard:** reemplazar `next-actions-strip` y sparklines por datos derivados de queries reales (o ocultar sparklines hasta tener series).
2. **Ventas:** eliminar fallback silencioso a `mockTeamRanking` / `mockCloserEvolution`; implementar `getTeamAverageEvolution` contra `call_analyses`; empty state en objeciones frecuentes en lugar de mock.
3. **Operaciones:** no renderizar `mockOperationsOverview` en producción; mostrar solo empty state hasta tener reporte semanal.
4. **Workboard:** empty state en reporte de tiempo en lugar de `mockMemberTimeReports`.
5. **Marketing contenido:** quitar fallback a `getContentById` mock en `[id]/page.tsx`.
6. **Business context:** conectar `SuggestedCallTasksPanel` a generación real o ocultar el panel.
7. **Agente:** empty/error state en lugar de `MOCK_REPLY` genérico.

---

## Apéndice: fixtures en `mocks/` no cableados a UI de producción

Estos archivos existen pero **no** se importan hoy en rutas `(platform)` ni providers activos. Riesgo bajo salvo que se vuelvan a conectar:

| Archivo | Contenido |
|---------|-----------|
| `mocks/dashboard.ts` | `mockDashboard` — resumen ejecutivo y métricas del panel |
| `mocks/sops.ts` | SOPs demo (`sop-1`, etc.) |
| `mocks/executive-reports.ts` | Reportes ejecutivos demo |
| `mocks/business-context.ts` | Documentos de contexto demo |
| `mocks/intelligence.ts` | Insights, bottlenecks, oportunidades demo |
| `mocks/marketing-content.ts` | `mockMarketingContentAssets` para biblioteca |
| `mocks/utm-links.ts` | Links UTM y leads capturados demo |
| `mocks/product.ts` | Producto, avatares y nodos espaciales demo |
| `mocks/team.ts` | Miembros y roles demo |
| `mocks/operations.ts` | Inputs semanales demo |

Las rutas **SOPs**, **Executive reports**, **Intelligence** y **Team** usan queries/actions reales; los mocks anteriores quedaron de Fase 0.

---

## Rutas excluidas de esta auditoría

- `/demo` — recorrido guiado intencional
- `/redesign-preview` — prototipo visual
- `/login` con `MockLoginPage` — solo entorno sin Supabase
- `components/design-system/showcase.tsx` — showcase interno
- `components/landing/*` — marketing site público
