# PENDIENTES.md — Backlog de trabajo pendiente en OTC

> **Para Claude Code y cualquier asistente IA:**  
> Leer este archivo junto con `CHANGES.md` al inicio de cada sesión.  
> Actualizar este archivo cuando se completa un ítem o se agregan nuevos pendientes.  
> Al completar un ítem: moverlo a la sección `## ✅ Completados` con fecha.

---

## 🔴 Urgente — Hacer antes de usar con clientes reales

### [SEED] Eliminar datos seed de la base de datos de Supabase

**Contexto:** Se insertaron ~171 registros ficticios para testear los dashboards.  
**Acción requerida:** Ejecutar el script SQL en Supabase Dashboard → SQL Editor:

```sql
-- Ejecutar en este orden para respetar FK constraints
DELETE FROM call_analyses
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND fathom_call_id LIKE 'seed_%';

DELETE FROM client_payments
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND payment_received_from = '_seed_otc';

DELETE FROM closing_calls
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND notes = '_seed_otc';

DELETE FROM conversations
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND external_ref LIKE '_seed_otc_%';

DELETE FROM content_pieces
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND drive_file_name = '_seed_otc';

DELETE FROM clients
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND nickname = '_seed_otc';
```

**Quién ejecuta:** Santiago (acción en Supabase Dashboard, no requiere código)  
**Documentado en:** `CHANGES.md` — entrada 2026-08-09 "Seed data ficticio"

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

### [TRIAL-2] Regenerar captions/hashtags con IA por variante

**Qué es:** Botón "Generar con IA" en cada variante para que Claude regenere la descripción y los hashtags, sin tocar el video.  
**Scope:**
- Botón en `variation-card.tsx` (solo si `status !== "processing"`)
- Server Action que llama `callClaudeText` con contexto del negocio + tipo de variante
- Actualiza `variation.description` + `variation.hashtags` en DB via patch del array `variations`

**Complejidad:** Baja-media  
**Archivos clave:** `variation-card.tsx`, `reel-variation-actions.ts`, `lib/ai/anthropic.ts`

---

### [TRIAL-3] Música personalizable por org

**Qué es:** Cada org puede subir su propio track de música de fondo para la variante `music` (hoy usa `background-music.mp3` hardcodeado en Fly.io, que está vacío).  
**Scope:**
- UI de upload en `/integrations` o `/settings` (sección Trial Reels)
- Supabase Storage bucket (o `trial-reels` bucket con path `org-id/music/background.mp3`)
- Migración DB: columna `reel_music_path TEXT` en `organizations` o tabla aparte
- Worker: descarga el track de la org antes de correr FFmpeg para la variante `music`

**Complejidad:** Media  
**Archivos clave:** `apps/reel-worker/src/ffmpeg-variants.ts`, `apps/reel-worker/src/processor.ts`

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

### [BUG-1] Stories de Instagram no aparecen en sync de Zernio

**Contexto:** Se agregó llamada a `listPublishedPosts({ source: "external" })` además de `syncExternalPosts` para intentar traer stories. No hay confirmación de que funcione.  
**Para verificar:** Después de publicar una historia en Instagram, hacer sync manual desde `/marketing/content` y ver en los logs de Vercel si `storyCount > 0`.  
**Si storyCount sigue siendo 0:** el problema está en Zernio (no expone stories en ese endpoint). Solución: endpoint separado en Zernio o alternativa.  
**Archivos clave:** `app/marketing/content/sync-actions.ts` — función `fetchExternalPostsViaSync`

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

## 🟣 Nuevos Features — Analizar, planear e implementar

### [FEAT-1] Secuencias de historias

**Qué es:** Feature para planificar y publicar secuencias de historias de Instagram como una unidad cohesiva (no historias sueltas).  
**Estado:** Pendiente de análisis completo — investigar cómo funciona la API de Zernio para historias, si soporta publicación programada de múltiples stories en secuencia, y qué hace el flujo para el founder.  
**Preguntas a resolver antes de implementar:**
- ¿Zernio soporta publicación de historias? ¿Individual o en lote?
- ¿Qué tipo de contenido va en cada historia de la secuencia (video, imagen, encuesta)?
- ¿El founder define la secuencia en OTC o en Zernio?
- ¿Hay delay entre historias de la misma secuencia?
- ¿Cómo se integra con el módulo de Marketing/Contenido existente?

---

### [FEAT-2] Análisis de competidores

**Qué es:** Feature para que el founder monitoree cuentas de competidores y extraiga insights de su estrategia de contenido.  
**Estado:** Pendiente de análisis completo — definir qué datos se pueden obtener, de qué fuentes, y qué análisis hace la IA.  
**Preguntas a resolver antes de implementar:**
- ¿Desde dónde se obtienen los datos? (Zernio tiene endpoints de competidores, scraping, API de Meta)
- ¿Qué se analiza? (frecuencia de publicación, formatos, hooks, CTAs, temas, engagement)
- ¿Dónde vive en el producto? (¿tab en Marketing? ¿módulo separado?)
- ¿La IA genera un reporte periódico o es on-demand?
- ¿Cuántos competidores por org? ¿Hay límite?

---

## 🟢 Deuda técnica — Phase 2 (baja urgencia)

### [TECH-1] Fathom: análisis async con BullMQ

**Contexto:** `lib/fathom/analyze-transcript.ts` tiene 2 TODOs hardcodeados en el código:
- BullMQ queue `fathom-analysis` para procesar async (hoy es sincrónico en el cron)
- Prompt caching para SOPs y contexto org

**Impacto actual:** El procesamiento de transcripts largos puede timeout en el cron de 10 min. En producción con volumen alto de llamadas podría ser un problema.  
**Archivos clave:** `lib/fathom/analyze-transcript.ts:14-15`, `lib/fathom/process-call.ts:282`

---

### [TECH-2] YouTube: retención real de Analytics API

**Contexto:** `lib/youtube/retention.ts` usa un placeholder en lugar de la API real de YouTube Analytics.  
**Requiere:** Scope OAuth `yt-analytics.readonly` + reports de audiencia.  
**Archivos clave:** `lib/youtube/retention.ts:5`

---

### [TECH-3] Módulos add-on sin acceso desde la navegación

**Contexto:** Cinco módulos existen en el código pero no tienen entrada en el sidebar. El plan era venderlos como add-ons por org.

| Módulo | Ruta | Estado |
|--------|------|--------|
| Operaciones | `/operations/*` | Código completo, sin nav |
| Reportes Ejecutivos | `/executive-reports` | Código completo, sin nav |
| Inteligencia | `/intelligence` | Código completo, sin nav |
| Producto | `/product/*` | Código completo, sin nav |
| Tablero de trabajo | `/workboard` | Código completo, sin nav |

**Pendiente:** Definir el mecanismo de activación por org (columna en `organizations`, feature flags, etc.) para poder activar/desactivar módulos por cliente.

---

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
