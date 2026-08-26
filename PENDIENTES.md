# PENDIENTES.md — Backlog de trabajo pendiente en OTC

> **Para Claude Code y cualquier asistente IA:**  
> Leer este archivo junto con `CHANGES.md` al inicio de cada sesión.  
> Actualizar este archivo cuando se completa un ítem o se agregan nuevos pendientes.  
> Al completar un ítem: moverlo a la sección `## ✅ Completados` con fecha.

---

## 🔴 Urgente — Hacer antes de usar con clientes reales

~~### [DB-PLANES] Aplicar migración de tabla plans en Supabase~~ ✅ Completado 2026-08-26

---

## 🟡 Trial Reels — Feature en producción, mejoras pendientes



### [TRIAL-4] Assets reales de LUT y música en el worker (Fly.io)

**Qué es:** `apps/reel-worker/luts/` solo tiene `.gitkeep`. Las variantes V3 (música) y V5 (color) usan fallbacks de baja calidad.  
**Efecto actual:**
- V5 (color): usa `eq` filter en lugar del LUT cálido → colorimetría plana
- V3 (música): sale en silencio si no hay `background-music.mp3`

**Acción:** Conseguir/crear un `warm.cube` (LUT cálido) y un `background-music.mp3` libre de derechos, ponerlos en `apps/reel-worker/luts/` y hacer redeploy en Fly.io.  
**Quién puede hacerlo:** Santiago (conseguir los assets) + Claude (commit + redeploy)

---

## 🟠 Bugs conocidos — Verificar en producción

### [BUG-1] Stories de Instagram — verificar en producción tras fix

**Contexto:** Fix deployado en `claude/architecture-review-improvements-fdj4ae`. Ahora usa el endpoint correcto `GET /v1/accounts/{accountId}/instagram/stories` + fallbacks. Las historias se fuerzan a `postType='story'` antes del dedup y entran primero en `allPosts`.  
**Para verificar:** Con una historia activa en Instagram → sync manual desde `/marketing/content` → el log `[syncZernioContent] stories sync` debe mostrar `fromDedicatedEndpoint > 0` → ir al tab "Historias" en la UI.  
**Si sigue sin aparecer:** Revisar que el registro en DB tenga `type='story'` (puede ser que exista como `type='post'` de syncs anteriores; el próximo sync lo corrige vía UPDATE).  
**Archivos clave:** `app/marketing/content/sync-actions.ts`, `lib/zernio/client.ts`

---


## 🟣 Nuevos Features — Implementar cuando Santiago lo indique

### [FEAT-GHL-OAUTH] GHL OAuth / Marketplace App — migrar de Private Integration Token a OAuth

**Qué es:** Cuando OTC sea aprobado como app en el GHL Marketplace, reemplazar el flujo de Private Integration Token por OAuth estándar ("Connect with GHL"). El proceso de aprobación de GHL es lento.
**Estado actual:** Integración funcional con Private Integration Token. El usuario pega el token + Location ID manualmente.
**Pendiente:**
1. Registrar OTC como app en GHL Marketplace (proceso manual de Santiago)
2. Agregar `GHL_CLIENT_ID` y `GHL_CLIENT_SECRET` a env vars
3. Implementar `/api/integrations/ghl/oauth/start` → `/api/integrations/ghl/oauth/callback`
4. Reemplazar StepCredentials en `ghl-connect-dialog.tsx` por botón "Conectar con GHL"
5. Actualizar `ghl_integrations` para guardar `access_token` + `refresh_token` en lugar de `api_key_encrypted`

**Decisión tomada:** Private Integration Token ahora; OAuth cuando sea posible.

---

### [FEAT-EXCEL-IMPORT-FASE3-RESTANTE] Importación de pagos y consumo de metrics_snapshots

**Qué es:** Lo que queda de importación de datos:
- Importación de pagos (tab "Pagos") — clientes y llamadas cubiertos, pagos no
- Oportunidades de GHL (pipeline) → closing_calls como stretch goal
- Conectar `metrics_snapshots` a módulos de Finanzas y Métricas de ventas para visualizar los datos importados

**Estado:** ✅ **COMPLETADO (2026-08-25)**. Arquitectura baseline-live implementada en todos los paneles: `finance-data-provider` (financeSummary + monthlySeries), Dashboard, Finance metrics, Intelligence module, Agente de IA (org-context). Column mapper implementado. Deuda menor: si el archivo tiene filas de totales/subtítulos en columna A, aparecen como opciones en el dropdown — sin filtrado por ahora.
**Complejidad:** Media

---

### [FEAT-1] Secuencias de historias

**Qué es:** Feature para planificar y publicar secuencias de historias de Instagram como una unidad cohesiva.  
**Estado DB:** Tablas `story_sequences` y `story_frames` ya creadas en producción (migración 20260811140000). Listas para usar.  
**Pendiente:** Análisis conjunto con Santiago + implementación de UI y acciones.  
**Preguntas a resolver antes de implementar:**
- ¿Zernio soporta publicación de historias? ¿Individual o en lote?
- ¿Qué tipo de contenido va en cada historia (video, imagen, texto)?
- ¿El founder define la secuencia en OTC o en Zernio?
- ¿Hay delay entre historias de la misma secuencia?
- ¿Cómo se integra con el módulo de Marketing/Contenido existente?

---

### [FEAT-2] Análisis de competidores

**Qué es:** Feature para que el founder monitoree cuentas de competidores y extraiga insights de su estrategia de contenido.  
**Estado DB:** Tablas `competitors` y `competitor_posts` ya creadas en producción (migración 20260811150000). Listas para usar.  
**Pendiente:** Análisis conjunto con Santiago + implementación de UI, acciones y análisis IA.  
**Preguntas a resolver antes de implementar:**
- ¿Desde dónde se obtienen los datos? (Zernio, scraping, API de Meta, entrada manual)
- ¿Qué se analiza? (frecuencia, formatos, hooks, CTAs, temas, engagement)
- ¿Dónde vive en el producto? (¿tab en Marketing? ¿módulo separado?)
- ¿La IA genera un reporte periódico o es on-demand?
- ¿Cuántos competidores por org?

---

## 🟢 Deuda técnica — Phase 2 (baja urgencia)

*(TECH-1 y TECH-2 completados — ver tabla abajo)*




### [TECH-4] VSL Player placeholder en landing

**Contexto:** `components/landing/vsl-player.tsx:37` renderiza un placeholder cuando no hay `NEXT_PUBLIC_VSL_URL`. Cuando exista el video de ventas real, setear esa env var en Vercel.  
**Archivos clave:** `components/landing/vsl-player.tsx`

---

### [TECH-5] Badge `children` en React 19 — revisión global

**Contexto:** `packages/ui/src/primitives/badge.tsx` fue corregido, pero hay ~15 archivos pre-existentes con el mismo patrón (`extends React.HTMLAttributes` sin `children?: React.ReactNode`) que Vercel ignora por caché de Turbo. En un rebuild limpio fallarían.  
**Acción:** Hacer un `grep -rn "HTMLAttributes" packages/ui/src/` y agregar `children?: React.ReactNode` a todos los componentes que lo necesiten.

---

## ✅ Completados (referencia histórica)

| Fecha | Ítem | Branch |
|-------|------|--------|
| 2026-08-26 | FEAT-GHL-MULTI-CALENDAR: multi-selección de calendarios GHL + filtro en closing panel | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-26 | UI-CLEANUP: Eliminación botón flotante del agente (FloatingChat) + fix layout integrations page (min-w-0) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-PLANES-CUOTAS-CLIENTES: planes con sistemas de cuotas, eliminar clientes, asignar plan, closing con cuotas manuales — migración SQL pendiente de aplicar en Supabase | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-VENTAS-CASH-COLLECTED: panel de métricas de ventas usa gastosTotales del provider (no snapshot) para cash collected | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-BASELINE-GAPS: Baseline fallback en Intelligence module (collect-context.ts) y monthlySeries (finance-data-provider) — cierran los dos últimos vacíos de la arquitectura baseline | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-BASELINE-ARCHITECTURE: Arquitectura baseline escalable — baseline-service.ts, finance-data-provider fallback, Dashboard, Finance metrics, agente IA, data_source column en metrics_snapshots | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-METRICS-DERIVE: Auto-derivación de métricas combinadas al importar — deriveSalesMetrics (close_rate, show_rate, tasa_agendamiento, tasa_fantasma, inasistencias, no_cierres) y deriveFinanceMetrics (margen, pct_margen); mapper de filas reducido a solo métricas primarias (11 ventas, 4 finanzas) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-TRANSPOSED-ROW-MAPPER: Mapeo manual de filas en formato pivot — TransposedRowMapper con dropdowns por campo OTC, auto-sugerencia desde diccionario, rowMapping pasado al parser, texto de confirm corregido (upsert) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-PIVOT: Soporte formato pivot en importación de métricas — auto-detección de meses como columnas, parser transpuesto, banner "Formato tabla detectado", fix preview para archivos con título merged (resuelve __EMPTY) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-EXCEL-PREVIEW: getExcelPreviewAction ahora usa { header: 1 } y salta filas de título — fix para archivos con celdas merged/título en la primera fila | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-VERCEL-BUILD x4: prefer-const, unused imports/props, SectionDef[] filter inference, keyof Union type — 4 errores de build de Vercel corregidos en serie | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-MULTISHEET: Selector de hoja en wizard de importación Excel — heurística pickBestSheet, SheetSelector UI, re-fetch al cambiar hoja, re-auto-mapeo | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-COLUMN-MAPPER: UI de mapeo columna-a-columna para archivos Excel propios — paso "mapper" en wizard, auto-mapeo, vista previa, validación de campos requeridos | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-UTM: Atribución UTM en closing calls — fetch attributionSource del contacto GHL durante sync, columna + panel de detalle en UI | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-PHASE2: Importación datos históricos GHL contacts + Excel clientes/llamadas — wizard 3 pasos, parsers Excel, preview GHL, server actions | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FIX-GHL-TIMESTAMPS: GHL `/calendars/events` requiere Unix ms, no ISO 8601 — fix sync que devolvía 0 citas | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-PHASE1: Integración GoHighLevel Calendar — Private Integration Token, sync horario, UI dialog multi-paso, badges de origen en closing | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-23 | BUG-3: Patrón UTC-midnight — isInCurrentMonth (enrich-team-compensation.ts) + periodBounds (cta-actions.ts) | `feat/trial-retry-variation` |
| 2026-08-23 | BUG-2: Gráfico distribución ya incluye content_pieces Zernio (ya estaba implementado) | `main` |
| 2026-08-23 | TRIAL-1: Reintentar variante fallida — botón en variation-card.tsx + retryVariationAction (ya existía implementado) | `main` |
| 2026-08-23 | refactor(agent/marketing): split de action files grandes — agent/actions.ts (1665→1252 líneas) + canvas-actions.ts + workboard-actions.ts; marketing/actions.ts (963→536 líneas) + utm-actions.ts | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | Sentry integration (client/server/edge configs + withSentryConfig en next.config.ts) | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | perf(holding): RPC get_holding_dashboard_stats — 28 queries → 2 paralelas | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | fix(holding): dropdown del switcher de negocios scrollable (max-h-[280px]) | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | feat(crons): fan-out QStash para sync-metrics, intelligence-snapshot, executive-report, founder-tone | `claude/qstash-fanout-playwright` |
| 2026-08-24 | fix(e2e): clearCookies() en beforeEach para garantizar refresh token virgen (tests 6/7 holding) | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | feat(testing): Playwright E2E setup + tests holding flow (pendiente ejecutar con cuenta real) | `claude/qstash-fanout-playwright` |
| 2026-08-11 | TECH-1: Fathom deep analysis vía QStash (reemplaza void pattern que se perdía en Vercel) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | TECH-2: Retención real YouTube Analytics API (fallback gracioso a estimación) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | SEED: Limpieza de 171 registros ficticios en Supabase prod (org `46cce98c-...`) | directo en DB |
| 2026-08-11 | TECH-3: Mecanismo add-ons por org (DB + permisos + sidebar dinámico + super-admin toggle) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | TRIAL-3: Música personalizable por org en Trial Reels | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | TRIAL-2: Botón "Generar con IA" para captions/hashtags por variante | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | BUG-1: Sync de stories de Instagram via Zernio (doble estrategia con fallback) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | Upload real de video a Zernio en Trial Reels (bug crítico) | `feat/trial-reels-video-upload` |
| 2026-08-11 | Email de notificación cuando todos los reels terminan de publicar | `feat/trial-reels-video-upload` |
| 2026-08-11 | Cron de limpieza de Storage (`trial-reels` bucket, 30 días) | `feat/trial-reels-video-upload` |
| 2026-08-11 | Delay real entre publicaciones con QStash (reemplazó setTimeout fake) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | Estado "scheduled" para variantes encoladas en QStash | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-10 | Fix reel-worker crasheaba en Node.js 20 (migrar a Node.js 22) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-10 | Auth triple redundancia worker (X-Worker-Secret + Bearer + query param) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-09 | Fix MRR=0 y Nuevos clientes=0 en Panel General | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix errores 403 en consola por URLs CDN de Instagram expiradas | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix React #418 (hidratación) en detalle de contenido | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix "Conectá tus redes" en dashboard aunque Zernio estuviera conectado | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix panel ManyChat roto en página de integraciones | `claude/marketing-module-console-errors-g2py5w` |

---

*Creado: 2026-08-11. Actualizar con cada sesión — mover ítems completados a la tabla de abajo.*
