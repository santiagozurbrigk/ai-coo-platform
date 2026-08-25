# PENDIENTES.md — Backlog de trabajo pendiente en OTC

> **Para Claude Code y cualquier asistente IA:**  
> Leer este archivo junto con `CHANGES.md` al inicio de cada sesión.  
> Actualizar este archivo cuando se completa un ítem o se agregan nuevos pendientes.  
> Al completar un ítem: moverlo a la sección `## ✅ Completados` con fecha.

---

## 🔴 Urgente — Hacer antes de usar con clientes reales

*(Sin ítems urgentes pendientes)*

---

## 🟡 Trial Reels — Feature en producción, mejoras pendientes

### [TRIAL-1] Re-intentar variante fallida individualmente

**Qué es:** Si una variante termina en estado `"failed"` (ej. error transitorio de Zernio o Supabase), hoy no hay forma de reintentarla sin recrear el job completo.  
**Scope:**
- Botón "Reintentar" en `variation-card.tsx` (solo visible si `status === "failed"`)
- Server Action que vuelve a poner la variante en `"scheduled"` y la encola en QStash
- Reutilizar lógica de `publishVariationsAction` para un índice específico

**Complejidad:** Baja  
**Archivos clave:** `components/marketing/trial-reels/variation-card.tsx`, `app/marketing/content/reel-variation-actions.ts`

---


### [TRIAL-4] Assets reales de LUT y música en el worker (Fly.io)

**Qué es:** `apps/reel-worker/luts/` solo tiene `.gitkeep`. Las variantes V3 (música) y V5 (color) usan fallbacks de baja calidad.  
**Efecto actual:**
- V5 (color): usa `eq` filter en lugar del LUT cálido → colorimetría plana
- V3 (música): sale en silencio si no hay `background-music.mp3`

**Acción:** Conseguir/crear un `warm.cube` (LUT cálido) y un `background-music.mp3` libre de derechos, ponerlos en `apps/reel-worker/luts/` y hacer redeploy en Fly.io.  
**Quién puede hacerlo:** Santiago (conseguir los assets) + Claude (commit + redeploy)

---

## 🟠 Bugs conocidos — Verificar en producción

### [BUG-1] Stories de Instagram — verificar en producción

**Contexto:** Se implementó sync doble: `POST /posts/sync-stories` (con fallback gracioso si 404/405) + `GET /posts?type=story&source=external`. Ambos resultados se combinan con dedup.  
**Para verificar:** Publicar una historia en Instagram → sync manual desde `/marketing/content` → ver en logs de Vercel si `fromSyncEndpoint > 0` o `fromListWithType > 0`.  
**Si sigue en 0:** el problema está en Zernio (no expone stories en esos endpoints). Escalar a equipo Zernio para confirmar el endpoint correcto.  
**Archivos clave:** `app/marketing/content/sync-actions.ts`, `lib/zernio/client.ts`

---

### [BUG-2] Gráfico "Distribución de contenido publicado" no incluye contenido de Zernio

**Contexto:** El gráfico usa solo `content_assets` (tabla legacy de Instagram Graph). Todo el contenido nuevo vive en `content_pieces` (Zernio) y no aparece ahí.  
**Fix requerido:** Refactorizar `getContentDistributionDataAction` para incluir `content_pieces` con mapeo de `analysis->>'ai_label'` → AUTORIDAD / ATRACCIÓN / NUTRICIÓN / VENTA.  
**Archivos clave:** `app/marketing/actions.ts` — `getContentDistributionDataAction`

---

### [BUG-3] Patrón UTC-midnight en comparaciones de fecha

**Contexto:** Se encontró y corrigió un bug en el dashboard donde `new Date("YYYY-MM-DD").getMonth()` devolvía un mes incorrecto en UTC-3. Puede haber otros en el código.  
**Acción:** Buscar con `grep -rn "new Date.*getMonth\|new Date.*getFullYear" apps/web/` y revisar cada caso.

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

### [FEAT-EXCEL-IMPORT-FASE3-RESTANTE] Plantilla descargable + importación de pagos

**Qué es:** Lo que queda de Fase 3 (§2.4 del plan original fue descartado por Santiago — sin plantilla OTC). Pendiente:
- Importación de pagos (tab "Pagos") — la Fase 2 cubre clientes y llamadas, no pagos
- Oportunidades de GHL (pipeline) → closing_calls como stretch goal

**Estado:** Column mapper (§2.5) implementado en esta sesión. Plantilla OTC descartada. Pagos e importación desde pipeline GHL pendientes.
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
| 2026-08-25 | FEAT-EXCEL-COLUMN-MAPPER: UI de mapeo columna-a-columna para archivos Excel propios — paso "mapper" en wizard, auto-mapeo, vista previa, validación de campos requeridos | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-UTM: Atribución UTM en closing calls — fetch attributionSource del contacto GHL durante sync, columna + panel de detalle en UI | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-PHASE2: Importación datos históricos GHL contacts + Excel clientes/llamadas — wizard 3 pasos, parsers Excel, preview GHL, server actions | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FIX-GHL-TIMESTAMPS: GHL `/calendars/events` requiere Unix ms, no ISO 8601 — fix sync que devolvía 0 citas | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-PHASE1: Integración GoHighLevel Calendar — Private Integration Token, sync horario, UI dialog multi-paso, badges de origen en closing | `claude/ghl-integration-data-loading-9cd72n` |
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
