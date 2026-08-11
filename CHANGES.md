# CHANGES.md — Registro de cambios del monorepo OTC

> **Para Claude Code y cualquier asistente IA que trabaje en este repo:**
>
> **OBLIGATORIO — leer este archivo al inicio de cada sesión** que involucre cambios al código.  
> **OBLIGATORIO — actualizar este archivo al final de cada sesión** (o después de cada bloque de cambios significativo).
>
> El formato de cada entrada está documentado en la sección [Formato de entrada](#formato-de-entrada).  
> No omitir este paso aunque el cambio parezca pequeño — la continuidad del contexto depende de esto.

---

## Formato de entrada

Cada entrada debe seguir esta estructura:

```
### [FECHA] — [TÍTULO CORTO DEL CAMBIO]

**Rama/branch:** `nombre-del-branch`  
**Commit(s):** `hash_corto` — mensaje  
**Autor:** Claude / Devin / Santiago / etc.  
**Módulo(s) afectado(s):** marketing, ventas, ui, agent, etc.

**Qué se hizo:**
Descripción clara de los cambios realizados. Qué archivos se tocaron y por qué.

**Por qué / finalidad:**
El problema que resolvía, la feature que implementaba, o la deuda técnica que saldaba.

**Decisiones de diseño relevantes:**
Opciones consideradas, trade-offs, patrones usados o evitados.

**Riesgos / deuda técnica pendiente:**
Qué quedó sin hacer, qué puede romperse, qué hay que revisar luego.
```

---

## Historial de cambios

---

### 2026-08-11 — chore: migraciones DB para FEAT-1 y FEAT-2 (solo DB, sin UI)

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Autor:** Claude  
**Módulo(s) afectado(s):** supabase/migrations

**Qué se hizo:**
- Migración `20260811140000`: tablas `story_sequences` y `story_frames` con RLS (FEAT-1 Secuencias de historias)
- Migración `20260811150000`: tablas `competitors` y `competitor_posts` con RLS (FEAT-2 Análisis de competidores)
- Ambas migraciones aplicadas en producción. Sin UI todavía — Santiago implementará cuando lo indique.

---

### 2026-08-11 — feat: add-ons por org, música Trial Reels, regenerar captions, sync stories

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `7e55341`  
**Autor:** Claude  
**Módulo(s) afectado(s):** super-admin, marketing/trial-reels, navigation/sidebar, lib/zernio, permissions

**Qué se hizo:**

**1. [TECH-3] Mecanismo de add-ons por org (sidebar dinámico):**
- `supabase/migrations/20260811130000_enabled_add_ons.sql`: columna `enabled_add_ons TEXT[] NOT NULL DEFAULT '{}'` en `organizations`.
- `lib/auth/get-current-permissions.ts`: tipos `ADD_ON_IDS` y `AddOnId`; `UserPermissions` extendido con `enabledAddOns: AddOnId[]`; lectura desde DB en `getCurrentUserPermissions`.
- `providers/permissions-provider.tsx`: hooks `useEnabledAddOns()` y `useHasAddOn(addOnId)`.
- `lib/navigation/sidebar-modules.ts`: `buildPlatformRootItems(enabledAddOns)` inyecta `operaciones` y `producto` después de `finanzas` si están activos; `buildPlatformSidebarNav()` para componentes que tienen los add-ons.
- `components/navigation/sidebar-navigation.tsx` y `components/layout/mobile-nav.tsx`: usan `buildPlatformSidebarNav(enabledAddOns)`.
- `layouts/super-admin-layout.tsx`: `SUPER_ADMIN_PERMISSIONS` incluye `enabledAddOns: []`.
- `types/super-admin.ts`: `AdminOrganizationDetail` tiene campo `enabledAddOns: string[]`.
- `lib/super-admin/queries.ts`: `loadOrganizationDetail` fetchea `enabled_add_ons` de la org.
- `app/super-admin/actions.ts`: `updateOrgAddOnsAction(orgId, addOns[])` valida contra `ADD_ON_IDS` y guarda.
- `components/super-admin/organization-detail.tsx`: sección "Módulos add-on" con botones toggle por add-on; llama `updateOrgAddOnsAction` on click.

**2. [TRIAL-3] Música personalizable por org en Trial Reels:**
- `supabase/migrations/20260811120000_reel_music_path.sql`: columna `reel_music_path TEXT` en `organizations`.
- `apps/reel-worker/src/types.ts`: `reelMusicPath?: string | null` en `ReelVariationJobPayload`; 5° parámetro `customMusicPath` en `VariantSpec.buildFfmpegArgs`.
- `apps/reel-worker/src/ffmpeg-variants.ts`: variante `music` usa `customMusicPath ?? lutsDir/background-music.mp3`.
- `apps/reel-worker/src/processor.ts`: descarga `reel_music_path` de Storage antes del loop de variantes.
- `app/marketing/content/reel-variation-actions.ts`: lee `reel_music_path` de la org y lo incluye en payload QStash.
- `app/marketing/content/reel-music-actions.ts` (nuevo): `uploadReelMusicAction`, `deleteReelMusicAction`, `getReelMusicPathAction`.
- `components/marketing/trial-reels/reel-music-upload.tsx` (nuevo): UI de upload/delete con accept MP3/M4A/WAV, muestra filename actual.
- `app/(platform)/integrations/page.tsx`: sección "Trial Reels" con `<ReelMusicUpload>`.

**3. [TRIAL-2] Regenerar captions con IA por variante:**
- `components/marketing/trial-reels/variation-card.tsx`: botón "Generar con IA" con estado `generating`, llama `regenerateCaptionAction`, actualiza estado local y propaga via `onUpdate`.

**4. [BUG-1] Sync de stories de Instagram:**
- `lib/zernio/client.ts`: `listPublishedPosts` acepta `type?: string`; nuevo método `syncExternalStories(accountId)` con fallback gracioso para 404/405/400.
- `app/marketing/content/sync-actions.ts`: paso 3 en `fetchExternalPostsViaSync` lanza `syncExternalStories` + `listPublishedPosts({type: "story"})` en paralelo por cada accountId; combina y deduplica.

**Por qué / finalidad:**

- **Add-ons**: permite a Santiago activar módulos premium (Operaciones, Producto, etc.) por cliente desde super-admin sin tocar código — negocio de módulos add-on listo para operar.
- **Música Trial Reels**: cada org puede personalizar el track de fondo de sus reels (variante music) subiendo su propio archivo desde `/integrations`.
- **Regenerar captions**: founder puede hacer varios intentos de IA para el caption/hashtags sin regenerar el video.
- **Stories**: intento de traer historias de Instagram al módulo de marketing, que históricamente solo traía posts.

**Decisiones de diseño relevantes:**

- **Add-ons como TEXT[]**: simple, sin tabla extra ni JSON, con validación en server action. Extensible.
- **Toggle inmediato en super-admin**: click → llamada server action → optimistic update en estado local → revalidate. Sin modal de confirmación para velocidad.
- **Stories dual-strategy**: llamar dos endpoints independientes de Zernio (sync dedicado + listPublishedPosts con type) aumenta probabilidad de éxito sin depender de un solo endpoint desconocido.
- **Música en Storage → path en DB**: el worker descarga el archivo antes de FFmpeg, sin transmitir binarios entre servicios.

**Riesgos / deuda técnica pendiente:**

- Stories: si Zernio no expone stories en ninguno de los dos endpoints, seguirán siendo 0. Requiere verificación en producción con una historia real publicada.
- Add-ons: los cambios de add-ons requieren re-login del usuario (sesión cacheada en `PermissionsProvider`). Agregar revalidación automática sería ideal pero no es bloqueante.
- TRIAL-4: los assets reales de LUT (`warm.cube`) y música (`background-music.mp3`) siguen sin estar en el repo del worker — Santiago debe conseguirlos.

---

### 2026-08-11 — feat: upload real de video a Zernio, email de notificación y cron de limpieza

**Rama/branch:** `feat/trial-reels-video-upload`  
**Commit(s):** `84010ef` — feat(trial-reels): upload real del video a Zernio antes de publicar; `b6b674b` — feat(trial-reels): email de notificación + cron de limpieza de Storage  
**Autor:** Claude  
**Módulo(s) afectado(s):** api/queue/publish-reel-variation, lib/zernio, lib/email, api/cron/cleanup-trial-reels, vercel.json

**Qué se hizo:**

**1. Upload real de video a Zernio (bug crítico resuelto):**
- `lib/zernio/client.ts`: agregados tipos `ZernioMediaPresignResponse` y `ZernioMediaItem`; nuevo método `getMediaPresignedUrl(filename, contentType)` que llama `POST /v1/media/presign`; `createPost()` acepta `mediaItems?: ZernioMediaItem[]` en el payload.
- `api/queue/publish-reel-variation/route.ts`: helper `uploadVideoToZernio()` implementa el flujo completo: obtener presigned URL de Zernio → descargar video de Supabase Storage (URL firmada TTL 2h) → `PUT` video buffer a Zernio → retornar `fileUrl` permanente. `createPost()` ahora incluye `mediaItems: [{ type: "video", url: videoFileUrl }]`. `maxDuration` subido de 30 → 60s.

**2. Email de notificación al admin de la org:**
- `lib/email/trial-reels-email.ts` (nuevo): template HTML con header púrpura OTC, cajas de stats verde/rojo, CTA button. Versión texto plano.
- `lib/email.ts`: `sendTrialReelsDoneEmail()` usando Resend con subject dinámico ("N Trial Reels publicados" o "N publicados, M con error").
- En `publish-reel-variation/route.ts`: cuando `allDone === true`, llama `notifyOrgAdminDone()` best-effort (fire-and-forget, nunca bloquea la respuesta).

**3. Cron de limpieza de Storage:**
- `api/cron/cleanup-trial-reels/route.ts` (nuevo): busca jobs con `status in ('done', 'failed')` y `updated_at < 30 días atrás`; elimina archivos del bucket `trial-reels` vía `admin.storage.from('trial-reels').remove(paths)`; loggea archivos eliminados y errores; idempotente.
- `vercel.json`: entrada del nuevo cron a las 03:00 UTC diariamente.

**Por qué / finalidad:**

El bug principal del feature era que `createPost` en Zernio no tenía el campo `mediaItems` — los reels se creaban en Zernio como borradores vacíos sin video adjunto. La investigación de la API de Zernio (vía repos GitHub de zernio-dev) reveló el flujo de 2 pasos: presign URL → upload binario → usar fileUrl permanente en mediaItems.

El email de notificación cierra el loop para el founder: sabe cuándo terminaron de publicar sus reels sin tener que abrir OTC manualmente. La limpieza de Storage evita acumulación de videos en el bucket trial-reels (cada job puede pesar ~50-200 MB) con retención de 30 días.

**Decisiones de diseño relevantes:**

- **Bufferar video en memoria**: `videoRes.arrayBuffer()` en el worker de Vercel — más simple y compatible con Vercel Edge/Node. Alternativa (streaming) más eficiente pero compleja y con menor compatibilidad.
- **Presigned URL TTL 2h**: el proceso completo (descarga Supabase + upload Zernio) puede tardar hasta 60s; 2h es holgado y cubre reintentos de QStash.
- **notifyOrgAdminDone best-effort**: `void fn().catch(log)` — un fallo de email nunca debe romper la respuesta del endpoint.
- **30 días de retención en Storage**: balance entre debugging (poder ver videos de jobs fallidos) y costo de Storage. Configurable via constante `RETENTION_DAYS`.

**Riesgos / deuda técnica pendiente:**

- Música personalizable por org (upload a Storage, worker descarga) pendiente.
- Re-intentar variante fallida individualmente (sin recrear el job) pendiente.
- Re-generar captions/hashtags con IA por variante pendiente.
- El cron de limpieza no limpia la carpeta raíz si quedó vacía — Supabase Storage no tiene `rmdir` automático, pero no genera costo ni error.

---

### 2026-08-11 — feat: delay real entre publicaciones de Trial Reels con QStash

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `a53ce78` — feat(trial-reels): delay real entre publicaciones con QStash  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/trial-reels, api/queue, lib/queue

**Qué se hizo:**

- `publishVariationsAction` refactorizado: en lugar de publicar sincrónicamente con `setTimeout` falso (máx 30s), ahora encola cada variante incluida en QStash con `delay = posición * delay_hours * 3600` segundos. Retorna inmediatamente con `{ ok: true, scheduled: N }`.
- Nuevo endpoint `POST /api/queue/publish-reel-variation/route.ts`: recibe `{ jobId, variationIndex, organizationId }`, verifica auth (WORKER_AUTH_SECRET triple-auth o firma QStash), genera URL firmada del video en Supabase Storage (TTL 1h), publica en Zernio como draft, actualiza la variante en DB (→ `published` o `failed`). Marca el job como `"done"` cuando todas las variantes incluidas terminan.
- Nuevo estado `"scheduled"` en `ReelVariationStatus`: las variantes pasan a este estado cuando quedan encoladas, antes de que QStash las dispare.
- `variation-card.tsx`: badge "Programada" (azul) para variantes en estado `scheduled`, con ícono `Clock`. También permite expandir preview de video en estado `scheduled`.
- `trial-reels-panel.tsx`: toast de confirmación actualizado al nuevo return type; `includedCount` ahora cuenta también variantes `scheduled`.
- `lib/queue/verify-queue-request.ts` (nuevo): helper de auth para endpoints de cola, triple-método consistente con el worker de Fly.io.
- `lib/queue/qstash-client.ts`: helper `getReelVariationPublishUrl()`.

**Por qué / finalidad:**

El delay entre publicaciones era un `setTimeout(r, Math.min(delayMs, 30_000))` dentro de un Server Action — nunca podría respetar delays de horas sin que Vercel (30s máx en funciones serverless) cortara la conexión. Con QStash se encolan N mensajes independientes, cada uno con su `delay` en segundos; QStash los re-entrega al endpoint correcto en el momento exacto, sin mantener ninguna conexión abierta.

**Decisiones de diseño relevantes:**

- **Posición vs. índice para el delay**: el delay se calcula en base a la posición entre las variantes *incluidas* (no el índice absoluto). La primera incluida siempre se publica inmediatamente (delay=0), la segunda con delay_hours de lag, etc. Esto evita gaps si el usuario excluyó variantes intermedias.
- **Idempotencia en el endpoint**: el endpoint verifica `variation.status !== "scheduled"` antes de procesar; si QStash reintenta (retries=2) y la variante ya fue procesada, responde 200 sin duplicar.
- **Return 200 siempre en el endpoint**: aunque la publicación falle, se responde 200 para que QStash no reintente infinitamente (el error se persiste en `variation.error`).
- **Sin Zernio → falla temprana**: si Zernio no está conectado, `publishVariationsAction` NO falla (sí lo haría el endpoint de publicación individual). Se optó por dejar que falle el endpoint individual para no bloquear el flujo de scheduling.

**Riesgos / deuda técnica pendiente:**

- El endpoint de publicación no adjunta el video binario a Zernio — solo envía el caption. Para que Zernio suba el video a Instagram, hace falta que la API de Zernio soporte una URL de media en el payload `createPost`. Verificar con la documentación de Zernio si el campo `mediaUrl` existe.
- Las URLs firmadas de Supabase Storage (generadas en el endpoint) tienen TTL de 1h — si el delay configurado supera 1h, la URL expirará antes de que Zernio la procese. Solución futura: generar la URL firmada en el momento de publicar (ya está implementado así — el endpoint genera la URL en el momento en que QStash lo dispara, no antes).
- Música personalizable por org (upload a Storage, worker descarga) pendiente.
- Notificación al founder cuando todas las variantes terminaron pendiente.
- Limpieza automática de Storage (trial-reels bucket) pendiente.

---

### 2026-08-10 — Fix: reel-worker crasheaba en Node.js 20 por falta de soporte nativo de WebSocket

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `257d5a1` — fix(reel-worker): Node.js 22 para soporte nativo de WebSocket  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (Dockerfile, package.json)

**Qué se hizo:**

- `apps/reel-worker/Dockerfile`: Cambiado `FROM node:20-slim` → `FROM node:22-slim` en ambas etapas (builder y runner).
- `apps/reel-worker/package.json`: Actualizado `"engines": { "node": ">=20" }` → `"engines": { "node": ">=22" }`.

**Por qué / finalidad:**

Los jobs seguían en estado `"pending"` incluso después del fix de autenticación triple. Fly.io logs revelaron el crash real al procesar el primer job:

```
error: 'Node.js 20 detected without native WebSocket support.
Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })'
```

`@supabase/supabase-js` v2.45 require WebSocket nativo (disponible en Node.js 22+) o instalar el paquete `ws` manualmente. Al llamar `createClient()` en `processor.ts`, la librería de Supabase Realtime intentaba inicializar una conexión WebSocket y crasheaba inmediatamente sin marcar el job como "failed" en DB. El job quedaba en `"pending"` para siempre.

**Decisiones de diseño relevantes:**

- Alternativa 1: agregar `ws` como dependencia y pasarla via `transport` en el `createClient()`. Más invasivo, requiere cambios en processor.ts.
- Alternativa 2: subir a Node.js 22 (WebSocket nativo desde v21.6+). Sin cambios de código, Docker multi-stage lo soporta bien. ✓ Elegida.
- Node.js 22 es LTS desde octubre 2024 — cambio sin riesgo de compatibilidad.

**Riesgos / deuda técnica pendiente:**

- Requirió que el usuario hiciera `git pull` antes de `fly deploy` — el primer intento de deploy usó el Dockerfile local con node:20 (ya que la imagen cacheada en Docker no había cambiado). El segundo intento (con `git pull` previo) compiló node:22 correctamente.
- Si en el futuro se actualiza `@supabase/supabase-js` a v3+, verificar si siguen usando WebSocket nativo o si cambian el modelo de transporte.

---

### 2026-08-10 — Fix: autenticación del worker con triple redundancia (X-Worker-Secret + Bearer + query param)

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `a6a513d` — fix(trial-reels): auth robusta con X-Worker-Secret header y query param  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (index.ts), apps/web (reel-variation-actions.ts)

**Qué se hizo:**

- `apps/reel-worker/src/index.ts`: `verifySignature()` ahora intenta autenticación en este orden:
  1. **X-Worker-Secret** header (custom, nunca stripeado por proxies ni QStash)
  2. **Authorization: Bearer `<secret>`** header (método original)
  3. **`?workerSecret=<secret>`** URL query param (fallback absoluto — QStash nunca modifica query params)
  - Si ninguno coincide, log de diagnóstico mostrando cuántos chars llegaron vs esperados para detectar mismatches.
- `apps/web/app/marketing/content/reel-variation-actions.ts`: `createTrialReelsJobAction` ahora:
  - Agrega `workerSecret` en la URL como query param (`?workerSecret=<secret>`)
  - Pasa ambos headers `X-Worker-Secret` y `Authorization: Bearer` en el `publishJSON()` de QStash

**Por qué / finalidad:**

Después de confirmar que QStash entregaba el job al worker (imageId en response), los jobs seguían en `"pending"`. La hipótesis era que QStash stripeaba el header `Authorization` en tránsito (comportamiento documentado en algunos proxies). La solución: enviar el secret por tres canales distintos para máxima robustez, sin depender de que ninguno en particular llegue intacto.

**Decisiones de diseño relevantes:**

- QStash garantiza que los query params de la URL destino llegan intactos al endpoint — los headers son más propensos a ser modificados/stripeados.
- El log de diagnóstico (`got N chars, expected M`) permite detectar mismatches de WORKER_AUTH_SECRET entre Fly.io y Vercel sin exponer el secret completo en logs.
- La verificación se hace en el orden más-a-menos confiable: header custom → header estándar → query param.

**Riesgos / deuda técnica pendiente:**

- El query param expone el secret en logs de Fly.io y QStash si están habilitados. Para uso en producción de alta seguridad, idealmente usar solo el header X-Worker-Secret. Por ahora el triple-método es adecuado para el contexto.
- Si en el futuro se cambia WORKER_AUTH_SECRET, hay que actualizarlo en dos lugares: Fly.io secrets Y Vercel env vars (y hacer redeploy de ambos).

---

### 2026-08-10 — Fix: Trial Reels quedaba en "pending" por 401 del worker (signing keys QStash incorrectas)

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `9726810` — fix(trial-reels): WORKER_AUTH_SECRET para evitar 401 por signing keys de QStash  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (index.ts), apps/web (reel-variation-actions.ts, [id]/page.tsx)

**Qué se hizo:**

- `apps/reel-worker/src/index.ts`: La función `verifySignature()` ahora verifica primero un `Authorization: Bearer <WORKER_AUTH_SECRET>` header. Si `WORKER_AUTH_SECRET` está configurado y el header coincide → acepta. Si no coincide → rechaza sin continuar a QStash signing. Si `WORKER_AUTH_SECRET` no está configurado → cae al flujo previo de QStash signing.
- `apps/web/app/marketing/content/reel-variation-actions.ts`: `createTrialReelsJobAction` pasa `Authorization: Bearer <WORKER_AUTH_SECRET>` como header custom en el `client.publishJSON()` de QStash (QStash reenvía el header al worker). También agrega log del `hasWorkerAuthSecret` para diagnóstico.
- `apps/web/app/(platform)/marketing/content/[id]/page.tsx`: Agrega `export const maxDuration = 300` para que la Server Action no sea cortada por el timeout de Vercel mientras descarga el video de Drive o sube a Supabase (archivos grandes pueden tardar >10s).
- Startup log del worker ahora muestra explícitamente si `WORKER_AUTH_SECRET` está configurado.

**Por qué / finalidad:**

Después del fix de procesamiento sincrónico (commit `7996341`), los jobs SEGUÍAN quedando en `"pending"` indefinidamente. El diagnóstico:
- QStash entregaba el job al worker (`https://otc-reel-worker.fly.dev/`)
- El worker verificaba la firma usando `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` — estos secrets estaban configurados en Fly.io pero probablemente con valores incorrectos o desincronizados respecto a lo que QStash usa para firmar
- El worker respondía `401 Unauthorized`
- QStash reintentaba 2 veces (retries: 2), fallaba los 3 intentos, abandonaba la entrega
- Job quedaba para siempre en `"pending"` (QStash no tiene mecanismo para marcar el job como fallido en la DB nuestra)

**Decisiones de diseño relevantes:**

- Usar `WORKER_AUTH_SECRET` como token Bearer en lugar de depender de las signing keys de QStash, que son más complejas de sincronizar y verificar (JWT con timestamp, URL, etc.). El Bearer token es más simple, más predecible y más fácil de debuggear.
- Si `WORKER_AUTH_SECRET` está seteado y el header NO coincide, rechazar inmediatamente sin caer al QStash signing. Esto previene bypass accidental por token desconfigurado.
- QStash soporta pasar headers custom en `publishJSON({ headers: {...} })` — los reenvía intactos al endpoint destino.

**Riesgos / deuda técnica pendiente:**

- **El usuario debe configurar `WORKER_AUTH_SECRET` como secret en Fly.io Y como env var en Vercel.** Sin esto, la autenticación del worker cae al flujo QStash signing previo (que sigue sin funcionar si las keys están mal).
- Pasos necesarios:
  1. Generar un string aleatorio: `openssl rand -base64 32`
  2. Configurar en Fly.io: `fly secrets set WORKER_AUTH_SECRET=<valor> --app otc-reel-worker`
  3. Configurar en Vercel: env var `WORKER_AUTH_SECRET=<mismo valor>` → redeploy
  4. Redeploy Fly.io: `fly deploy --config apps/reel-worker/fly.toml`

---

### 2026-08-10 — Fix: reel-worker procesaba en background, Fly.io mataba la máquina antes de que FFmpeg corriera

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `7996341` — fix(reel-worker): procesar sincrónicamente para evitar que Fly.io mate la máquina  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (index.ts, processor.ts)

**Qué se hizo:**

- `index.ts`: El endpoint POST del worker ahora procesa el job **sincrónicamente** (await `processReelVariationJob(payload)` antes de llamar `res.json()`). La conexión HTTP queda abierta mientras corre FFmpeg; Fly.io no puede apagar la máquina mientras haya una conexión activa.
- `processor.ts`: Agregado check de **idempotencia** al inicio de `processReelVariationJob`: si el job ya está en un estado distinto de `"pending"`, se hace return inmediato. Previene reprocesamiento si QStash reintenta una entrega mientras el worker ya está ejecutando.
- Respuesta en error: si `processReelVariationJob` lanza, se responde `200 { ok: false, status: "failed" }` en lugar de `500`, para que QStash no reintente (el processor ya marcó el job como "failed" en DB).

**Por qué / finalidad:**

El job `df1405b3` quedó en estado `"pending"` indefinidamente sin que el worker lo procesara. Diagnóstico:
- Con `auto_stop_machines = true` y `min_machines_running = 0` en fly.toml, Fly.io detiene la máquina cuando no hay conexiones HTTP activas.
- El patrón anterior era: responder `200 OK` inmediatamente → luego procesar en `setImmediate()`.
- Al cerrar la conexión HTTP (200 enviado), Fly.io consideraba la máquina idle y la apagaba antes de que `processReelVariationJob` actualizara la DB a `"processing"` y mucho antes de que FFmpeg terminara.
- El job quedaba en `"pending"` para siempre porque QStash ya no reintentaba (consideraba la entrega exitosa al recibir 200).

**Decisiones de diseño relevantes:**

- Alternativas consideradas: (a) `min_machines_running = 1` (costo constante), (b) aumentar `stop_timeout` en fly.toml (no resuelve trabajo de minutos), (c) procesar sincrónicamente ✓ (aprovecha `timeout: 900` ya configurado en QStash).
- El `timeout: 900` en QStash publishJSON permite que la conexión esté abierta hasta 15 minutos, más que suficiente para FFmpeg (estimado 2-5 min para 5 variantes de un video de reel).

**Riesgos / deuda técnica pendiente:**

- El job `df1405b3` quedó en estado `"pending"` y no puede rerecuperarse automáticamente (QStash ya no va a reintentarlo). El usuario debe crear un nuevo job desde la UI para ese reel.
- Si FFmpeg tarda más de 15 minutos (videos muy largos), QStash timeout-eará la request y reintentará. El check de idempotencia evita doble procesamiento si esto ocurre.
- La respuesta 200 con `{ ok: false }` en caso de error es no convencional; se podría cambiar a usar QStash's "callback URL" para notificaciones de fallo sin depender del HTTP response code.

---

### 2026-08-10 — Fix: errores de TypeScript/ESLint en archivos de Trial Reels para pasar build de Vercel

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `8413c0a` — fix(trial-reels): escapar comillas en JSX para ESLint  
  `939d5c9` — fix(trial-reels): corregir errores de TypeScript en archivos nuevos  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/trial-reels, packages/ui, api/queue

**Qué se hizo:**

Cuatro errores bloqueaban el build de Vercel en los archivos de Trial Reels introducidos en el commit anterior:

1. **ESLint `react/no-unescaped-entities`** (`trial-reels-panel.tsx` línea 234): Las comillas dobles en JSX literal (`"Crear Trial Reels"`) no están permitidas. Fix: `&ldquo;…&rdquo;`.

2. **TypeScript `Type 'string' is not assignable to type 'null'`** (`processor.ts` línea 134): `initialVariations` era inferido como `{ error: null }[]` en vez de `ReelVariation[]`, por lo que asignar `error: msg` (string) fallaba. Fix: agregar anotación explícita `const initialVariations: ReelVariation[]` y tipar `VariantDef.type` como `ReelVariationType`.

3. **TypeScript `Property 'marketing' does not exist on type`** (`reel-variation-actions.ts` líneas 204 y 462): Se usaba `paths.marketing.content` (inexistente en nivel raíz) en vez de `paths.platform.marketing.content`.

4. **TypeScript implicit `any`** (`variation-card.tsx` líneas 213, 225): `onChange` handlers sin tipo. Fix: `React.ChangeEvent<HTMLTextAreaElement>`.

5. **Badge `children` en React 19** (`badge.tsx`): `React.HTMLAttributes` ya no incluye `children` en React 19. Fix: declarar `children?: React.ReactNode` explícitamente en `BadgeProps`.

**Por qué / finalidad:**
Cada commit a la rama dispara un preview deployment en Vercel. Los errores en archivos nuevos (no cacheados por Turbo) fallaban el build impidiendo testear el feature completo en producción.

**Decisiones de diseño relevantes:**
- Los errores de Badge `children` son pre-existentes en muchos archivos del proyecto que ya pasan el build (se sirven desde la caché de Turbo). Solo los archivos nuevos (sin caché) se ven afectados.
- La anotación `ReelVariation[]` en `processor.ts` es la solución mínima — no restructurar la función.

**Riesgos / deuda técnica pendiente:**
- El warning de Badge `children` es cosmético en tsc local pero no falla Vercel — hay ~15 archivos pre-existentes con el mismo error que Vercel ignora por caché de Turbo. A largo plazo, migrar todos los usos.
- El fix de Badge en `packages/ui` es una mejora general pero la raíz del problema es que React 19 eliminó `children` de `HTMLAttributes` — todos los componentes con `extends React.HTMLAttributes` de la UI deben revisarse.

---

### 2026-08-10 — Feature: Trial Reels — generación automática de 5 variaciones de reels

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `1ad489d` — feat(marketing): Trial Reels — generación automática de 5 variaciones de reels  
  `b137a0f` — fix(reel-worker): crear carpeta luts vacía para Docker build  
  `2191cf5` — fix(reel-worker): escuchar en 0.0.0.0 para compatibilidad con Fly.io  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/content, reel-worker (nuevo servicio), supabase/migrations, types, components

**Qué se hizo:**

Feature completa de Trial Reels: el usuario selecciona un reel de `content_pieces` (que tenga un `drive_file_id` vinculado), OTC descarga el video desde Google Drive, lo sube a Supabase Storage y encola un job en QStash. Un worker en Fly.io procesa el video con FFmpeg generando 5 variantes automáticamente. El usuario puede previsualizar cada variante, editar el caption y hashtags, incluir/excluir variantes, y publicarlas en Zernio con delay configurable entre posts.

**Archivos creados:**
- `supabase/migrations/20260810120000_trial_reels_jobs.sql` — Tabla `reel_variation_jobs` + bucket `trial-reels` + RLS + índices + trigger
- `apps/web/types/reel-variations.ts` — Tipos TypeScript para el módulo
- `apps/web/app/marketing/content/reel-variation-actions.ts` — Server Actions: `createTrialReelsJobAction`, `getReelVariationJobAction`, `listReelVariationJobsForPieceAction`, `updateReelVariationAction`, `setReelVariationDelayAction`, `publishVariationsAction`, `refreshVariationPreviewUrlsAction`
- `apps/web/app/api/queue/process-reel-variations/route.ts` — Endpoint receptor de QStash (fallback dev / Vercel)
- `apps/web/app/api/queue/process-reel-variations/processor.ts` — Procesador FFmpeg inline (dev)
- `apps/reel-worker/` — Worker completo para Fly.io (Node.js + FFmpeg):
  - `src/types.ts`, `src/ffmpeg-variants.ts`, `src/captions.ts`, `src/processor.ts`, `src/index.ts`
  - `fly.toml`, `Dockerfile`, `package.json`, `tsconfig.json`, `README.md`
- `apps/web/components/marketing/trial-reels/trial-reels-button.tsx` — Botón CTA
- `apps/web/components/marketing/trial-reels/variation-card.tsx` — Card por variante con video player + editor de caption
- `apps/web/components/marketing/trial-reels/trial-reels-panel.tsx` — Panel completo con Supabase Realtime, selector de delay, y publicación
- `apps/web/components/marketing/trial-reels/index.ts` — Barrel export

**Archivos modificados:**
- `apps/web/components/marketing/content-piece-detail.tsx` — Nueva tab "Trial Reels" + TrialReelsButton en panel izquierdo (solo para reels con Drive vinculado)
- `apps/web/components/marketing/marketing-content-detail-page-client.tsx` — Prop `initialReelJobs`
- `apps/web/app/(platform)/marketing/content/[id]/page.tsx` — Fetcha `reel_variation_jobs` en paralelo para SSR
- `.env.example` — Agregada variable `REEL_WORKER_URL`

**Por qué / finalidad:**

Estrategia de "Trial Reels": publicar 5 variaciones de un reel que funcionó bien, cambiando velocidad, música, subtítulos y colorimetría. Usada por creadores para maximizar alcance y testear qué variante tiene mejor performance. OTC automatiza todo el proceso desde la descarga hasta la publicación.

**Decisiones de diseño relevantes:**

1. **Worker separado en Fly.io** (no Vercel lambda): FFmpeg procesar video tarda varios minutos, Vercel tiene límite de 300s y no tiene FFmpeg instalado. Fly.io con `performance-2x` (2 vCPU, 4 GB RAM) lo maneja sin límite.

2. **El video fuente se descarga desde Next.js (no el worker)**: Para la descarga de Drive se necesita el token OAuth de Google del usuario, que está en la sesión Next.js. El servidor Next.js descarga el video en la Server Action y lo sube a Supabase Storage. El worker solo accede a Storage (con service role), sin necesitar tokens de usuario.

3. **Metadatos anti-detección**: Cada variante reescribe `creation_time`, `encoder`, `make`, `model`; strip con `-map_metadata -1`; bitrate variado ±5%; crop de 1-2px. Esto rompe el fingerprint de video para que Instagram no detecte el mismo video resubido.

4. **Supabase Realtime en el panel**: El estado del job se actualiza en tiempo real sin polling — el worker actualiza DB directamente y el cliente recibe las actualizaciones vía `postgres_changes`.

5. **Captions con Haiku**: Se generan al momento de `preview_ready` con tonos diferentes por variante (energético para speed_up, contemplativo para speed_down, etc.). El usuario puede editarlos antes de publicar.

6. **Publicación como draft en Zernio**: `createPost` con `status: 'draft'` porque Zernio necesita el video subido directamente vía su UI para Instagram reels. La URL firmada de Storage se adjunta para que el usuario la use desde Zernio si la publicación directa falla.

**Riesgos / deuda técnica pendiente:**

- **Fly.io no configurado**: El worker necesita deploy en Fly.io y que `REEL_WORKER_URL` esté en las env vars de Vercel. Sin esto, QStash apunta al endpoint fallback de Next.js que en Vercel devuelve error (sin FFmpeg).
- **LUT y música**: Sin `luts/warm.cube` y `luts/background-music.mp3`, las variantes V3 y V5 usan fallbacks (silencio y eq filter). Para producción real, incluir assets de calidad.
- **Videos > 500 MB**: El límite actual es 500 MB. Videos muy pesados fallarán en descarga.
- **Delay entre publicaciones**: El delay real de horas se simula con 30s max para no bloquear el servidor en la Server Action. Para delays reales, implementar con un schedule de QStash (future work).
- **Instagram Reels vía Zernio**: La publicación directa de reels puede requerir endpoints específicos de Zernio que aún no están mapeados en el cliente. Verificar con equipo Zernio.
- **Concurrencia**: `fly.toml` limita a 2 requests concurrent y 1 soft limit. Si hay muchos jobs simultáneos, se pondrán en cola o se rechazarán.

---

### 2026-08-09 — Fix MRR=0 y Nuevos clientes=0 en Panel General

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `26dcf51` — fix(dashboard): corregir MRR=0 y Nuevos clientes=0 en Panel General  
**Autor:** Claude  
**Módulo(s) afectado(s):** `lib/metrics/derive-dashboard-data.ts`, `components/dashboard/dashboard-page-content.tsx`

**Qué se hizo:**

**Bug 1 — MRR = 0 US$:**  
`deriveDashboardData` llamaba a `deriveFinanceSummary` sin el argumento `payments`. Esto hace que `collectRevenueEvents` use el fallback `collectRevenueEventsFromClients`, que genera eventos de cobro solo a partir de `client.installments[].paidAt`. Los clientes seed con `payment_type = 'upfront_fee'` y `installments = []` no producían ningún evento → MRR = 0, aunque hubiera pagos reales en `client_payments`.

**Fix:** Se agregó un parámetro opcional `payments?: ClientPayment[]` a `deriveDashboardData` y se pasa a `deriveFinanceSummary`. `DashboardPageContent` ahora extrae `clientPayments` de `useFinanceData()` (ya disponible en el provider) y lo pasa al cálculo.

**Bug 2 — Nuevos clientes = 0:**  
`new Date("2026-08-01").getMonth()` retorna `6` (julio) en entornos UTC-3 porque la cadena ISO sin hora se parsea como UTC midnight, y `getMonth()` devuelve la fecha en hora local — que en UTC-3 es `2026-07-31T21:00:00`. Este bug suprimía todo cliente cuyo `joinDate` sea el 1° del mes.

**Fix:** Se reemplaza la comparación `getMonth() / getFullYear()` por comparación de string `YYYY-MM`: `c.joinDate.slice(0, 7) === nowYearMonth`. Inmune a offsets de timezone.

**Por qué / finalidad:**
Estas dos métricas aparecían en "0" en el Panel General incluso con datos seed coherentes insertados. Afectan directamente la legibilidad del dashboard para el founder.

**Decisiones de diseño relevantes:**
- Se eligió agregar `payments?` a `deriveDashboardData` (en lugar de reestructurar para recibir un `FinanceSummary` pre-computado) para mantener la función pura y testeable sin providers.
- `clientPayments` ya estaba disponible en `FinanceDataProvider` y `FinanceDataContext` — solo faltaba consumirlo en el componente del dashboard.
- La comparación de string `YYYY-MM` es más robusta que `parseDateOnly` (de `revenue-period.ts`) porque no requiere importar otra dependencia.

**Riesgos / deuda técnica pendiente:**
- El mismo bug de UTC-midnight podría existir en otros sitios del codebase que usen `new Date("YYYY-MM-DD")` y luego llamen a `.getMonth()` / `.getFullYear()`. Buscar en el futuro: `new Date(.*joinDate|createdAt|paidAt.*).getMonth\(` o similar.
- Si `clientPayments` crece mucho (miles de pagos), el `useMemo` del dashboard se recalculará cada vez que varíe el array. No es un problema hoy pero a escala habría que memoizar mejor.

---

### 2026-08-09 — Diagnóstico de bugs de dashboards con seed data: hallazgos

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Autor:** Claude (investigación, sin cambios de código)  
**Módulo(s) afectado(s):** análisis cross-módulo

**Qué se hizo:**
Investigación exhaustiva de tres problemas reportados tras insertar datos seed:

**Prioridad 1 — "Tasa de agendamiento: 550%" y "Tasa de fantasma: 125%":**  
No hay bug matemático. Con los datos seed: `bookingRate = 55%` (22/40 conversaciones son booked/agendado/closeado), `ghostingRate = 12.5%` (5/40). El formato "55,0%" (coma decimal española en `derive-dashboard-data.ts`) puede confundirse visualmente con "550%" en fuente pequeña. Las fórmulas en `derive-sales-metrics.ts` son correctas (siempre ≤100%).

**Prioridad 3 — "Distribución de contenido publicado: VENTA 100%":**  
No hay bug. Las 6 `content_assets` existentes son posts de Instagram del tipo "Si querés…, entrá a la waitlist" — CTA directo → correctamente etiquetados como VENTA por la IA. Los datos seed se insertaron en `content_pieces` (Zernio, tabla separada), que el gráfico de distribución no consulta. `getContentDistributionDataAction` usa `listContentAssetsAction()` que solo lee `content_assets`.

**Riesgos / deuda técnica pendiente:**
- El gráfico "Distribución de contenido publicado" no incluye `content_pieces` (Zernio). `content_pieces.analysis->>'ai_label'` usa una taxonomía diferente (texto libre: "Ventas y conversión", "Estrategia de contenido", etc.) — no se mapea directamente a AUTORIDAD/ATRACCION/NUTRICION/VENTA. Para incluir `content_pieces` en el gráfico habría que agregar una columna `content_objective TEXT` o normalizar el mapeo en la acción.

---

### 2026-08-09 — Seed data ficticio en Supabase para testing visual de dashboards

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** sin commit — operación directa en DB de Supabase (no hay cambios de código)  
**Autor:** Claude  
**Módulo(s) afectado(s):** Supabase DB (org `46cce98c-6d4c-4e4d-94a7-7cc24ae1104d` — "Optimiza tu Control")

**Qué se hizo:**
Inserción de datos ficticios de prueba en la base de datos del proyecto Supabase (`nrzlylzbmsuowzhpdnjl`) para la org de Santiago Zurbrigk, con el objetivo de testear visualmente charts y dashboards. Todos los registros están marcados con identificadores específicos para fácil eliminación posterior.

**Resumen de registros insertados:**

| Tabla | Registros | Marcador de seed |
|-------|-----------|-----------------|
| `clients` | 25 clientes | `nickname = '_seed_otc'` |
| `client_payments` | 48 pagos | `payment_received_from = '_seed_otc'` |
| `closing_calls` | 38 llamadas | `notes = '_seed_otc'` |
| `call_analyses` | 22 análisis | `fathom_call_id LIKE 'seed_%'` |
| `conversations` | 40 conversaciones | `external_ref LIKE '_seed_otc_%'` |
| `content_pieces` | 30 piezas | `drive_file_name = '_seed_otc'` |

**Detalles de cada tabla:**

- **clients**: 25 clientes ficticios (dic 2025 → ago 2026). Mezcla de `active`, `success_case`, `onboarding_done`, `pending_onboarding`. 3 productos: Mentoría 1:1 Premium ($2500), Consultoría Intensiva ($800), Membresía Comunidad Pro ($97/mes). Plataformas: mercadopago, stripe, bank_transfer. Email termina en `@seed.otc`.
- **client_payments**: 48 pagos coherentes con cada cliente. Pagos upfront, cuotas (3 meses) y membresías mensuales. Total recaudado seed: ~$39,337. Fechas spread dic 2025 → ago 2026.
- **closing_calls**: 38 llamadas de cierre. Statuses: 21 `closed` ($35,091 en revenue), 11 `not_closed`, 5 `no_show`, 1 `scheduled`. Con `outcome` JSONB, `form_answers`, `no_close_reason`, `amount`. Spread dic 2025 → ago 2026.
- **call_analyses**: 22 análisis de llamadas (Fathom-style). Score promedio 86/100. 21 sold=true. Campos completos: `section_scores`, `objections`, `power_phrases`, `weak_phrases`, `filler_words_count`, `summary`, `strengths`, `improvements`.
- **conversations**: 40 conversaciones DM. 14 `closed`, 8 `booked`, 13 `active`, 5 `ghosted`. Todos los campos IA completados: `ai_score`, `ai_label` (hot/warm/cold), `ai_funnel_stage`, `ai_detected_objections`, `ai_booking_signals`, `ai_recommended_action`, etc.
- **content_pieces**: 30 piezas publicadas feb → jul 2026 con tendencia de crecimiento clara. Views feb: 19K total → jul: 115K total. 2 reels virales: "Storytime: el día que perdí un cliente" (28.4K views, may 2026) y "Hot take: si tu mentoría no tiene sistema" (45.2K views, jul 2026). Campos: `metrics` (JSONB flat), `analysis` (JSONB con ai_label, ai_score, strengths, improvements), `format_type`, `hook_type`, `cta_type`.

**Por qué / finalidad:**
El usuario necesitaba datos reales y coherentes para testear visualmente cómo funcionan los charts de clientes, el pipeline de ventas, el scoring de leads, los análisis de llamadas y las métricas de contenido. Los datos vacíos no permiten evaluar el diseño de los dashboards.

**Script de limpieza (EJECUTAR cuando se quieran eliminar los datos seed):**
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

**Decisiones de diseño relevantes:**
- Se eligió marcar con campos existentes en lugar de agregar una columna `is_seed` para no alterar el schema.
- `conversations.external_ref` tiene un unique constraint por `(organization_id, external_ref)`, por eso se usó `_seed_otc_001..040` en lugar del mismo valor en todos.
- Los datos son coherentes entre sí: los clientes tienen pagos que suman su `total_amount`, las llamadas de cierre coinciden con los leads de conversaciones, los análisis de llamadas referencian las mismas llamadas.
- Las métricas de `content_pieces` usan el formato "flat" que `resolvePostAnalytics` normaliza correctamente.
- Las `call_analyses` no están vinculadas a `closing_calls` por FK (la tabla no tiene constraint directo) — son análisis independientes con `fathom_call_id` de tipo texto.

**Riesgos / deuda técnica pendiente:**
- ⚠️ **Estos datos son temporales** — recordar ejecutar el script de limpieza antes de ir a producción real o antes de demos con clientes reales.
- Los `client_payments` tienen `storage_path = '_seed_otc'` (NOT NULL) — este campo normalmente apunta a un path de Storage de Supabase. No hay archivo real asociado.
- Los `content_pieces` tienen `drive_file_name = '_seed_otc'` pero sin `drive_file_id` real — los links de Drive no funcionarán para estos registros.
- Los análisis de llamadas tienen `fathom_call_id` ficticios — no se pueden cargar transcripciones reales desde Fathom para estos registros.

---

### 2026-08-08 — Fix scrollbar vertical en modales + panel ManyChatManageSheet roto en integraciones

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `791a6fa` — fix(integrations): ocultar scrollbar vertical en modales y corregir panel de ManyChat  
**Autor:** Claude  
**Módulo(s) afectado(s):** `packages/ui`, `integrations`

**Qué se hizo:**
1. **`packages/ui/src/primitives/dialog.tsx` — `DialogContent`**: Agrega `[&::-webkit-scrollbar]:hidden` y `[scrollbar-width:none]` al conjunto de clases base. Oculta el track del scrollbar en WebKit (Chrome, Edge, Safari) y Firefox cuando el `DialogContent` tiene `overflow-y-auto` aplicado vía `className`. El contenido sigue siendo scrolleable; solo desaparece la barra visual.
2. **`apps/web/components/integrations/manychat-manage-sheet.tsx`**: Mueve `shadow-xl` al estado abierto (`open = true`). Cuando el panel está cerrado (`translate-x-full`), la clase `shadow-xl` se reemplaza por `shadow-none`. Root cause: la sombra de un elemento `fixed` no está sujeta a `overflow: clip` del ancestro → sangraba ~25px hacia el interior del viewport → aparecía como una franja/panel oscuro en el borde derecho de la página de integraciones.
3. **`apps/web/components/integrations/integration-card.tsx`**: Renderiza `ManyChatManageSheet` condicionalmente solo cuando `integration.provider === 'manychat'`. Antes se renderizaba para todas las cards de integración (N instancias de un aside fijo en el DOM), lo que multiplicaba el artefacto visual.

**Por qué / finalidad:**
- El usuario reportó que en la página de integraciones aparecía "una card a la derecha o una especie de sidebar roto que no llega a verse". Era el shadow del `ManyChatManageSheet` closed sangrando en el viewport.
- El usuario también reportó scrollbar vertical visible en el modal de Zernio (y otros modales) tras el fix de scrollbar horizontal de la sesión anterior.

**Decisiones de diseño relevantes:**
- `scrollbar-width: none` es Firefox; `::-webkit-scrollbar { display: none }` es WebKit. Ambos se necesitan para cobertura cross-browser.
- El render condicional del `ManyChatManageSheet` por provider es correcto: el estado `manychatManageOpen` y su handler están en `IntegrationCard` y solo se usan cuando `provider === 'manychat'`.
- Separar shadow del transform permite que la animación de slide-in/out siga funcionando sin artefactos.

**Riesgos / deuda técnica pendiente:**
- `ManyChatManageSheet` es un aside fijo custom (no usa Radix Sheet). Podría migrarse a un Sheet de Radix para mayor accesibilidad (focus trap, escape key handling).

---

### 2026-08-08 — Fix "Conectá tus redes" en dashboard + scrollbars en modales

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `bef3902` — fix(dashboard+ui): mostrar métricas Zernio en dashboard y eliminar scrollbars en modales  
**Autor:** Claude  
**Módulo(s) afectado(s):** `dashboard`, `packages/ui`

**Qué se hizo:**
1. **`app/integrations/zernio/actions.ts` — `getZernioAnalyticsAction`**: Reemplazada la llamada a `client.getPostsAnalytics()` (→ `/analytics/posts` de Zernio) por una query a `content_pieces` en Supabase. La función ahora suma `metrics.impressions`, `metrics.likes` y `metrics.comments` de las piezas de Zernio publicadas en los últimos 30 días. `hasData` se setea `true` en cuanto existe al menos una pieza de Zernio en la DB (aunque las métricas sean 0), mostrando el ring chart en vez del empty state "Conectá tus redes". Si no hay piezas en los últimos 30 días, hace un segundo query sin filtro de fecha para verificar si hay piezas históricas.
2. **`packages/ui/src/primitives/dialog.tsx` — `DialogContent`**: Agrega `overflow-x-hidden` al conjunto de clases base de todos los `DialogContent`. Fix global para la scrollbar horizontal que aparecía en modales con `overflow-y-auto` (especialmente visible en el modal de Zernio "Conectar Zernio").

**Por qué / finalidad:**
- El dashboard mostraba "Conectá tus redes para ver analytics / Vinculá cuentas en Zernio..." aunque Zernio estaba conectado y había contenido sincronizado. La causa: `getPostsAnalytics()` llama `/analytics/posts` de Zernio cuyo formato de respuesta (`{ posts: [...], analytics: Record<platform, metrics> }`) no matcheaba el parsing del código → todas las métricas quedaban en 0 → `hasData = false`.
- En el modal de Zernio (y otros modales con `overflow-y-auto`) aparecían tanto una scrollbar vertical como una horizontal. La scrollbar horizontal se activa porque la vertical ocupa espacio (en Windows/sistema con scrollbars siempre visibles), lo que estrecha el contenido disponible y puede disparar overflow horizontal. `overflow-x-hidden` lo previene globalmente.

**Decisiones de diseño relevantes:**
- `content_pieces` es la fuente de verdad para métricas de Zernio (ya normalizadas por `resolvePostAnalytics`). Usarla en el dashboard evita una llamada en vivo a Zernio en cada carga del dashboard (más lento y frágil).
- `overflow-x-hidden` en el base `DialogContent` es seguro: los diálogos tienen `max-w-lg` fijo y nunca necesitan scroll horizontal. La propiedad puede sobreescribirse pasando `overflow-x-auto` en `className` si algún caso especial lo requiriera.

**Riesgos / deuda técnica pendiente:**
- Si hay piezas de Zernio pero ninguna en los últimos 30 días, el dashboard mostrará el ring chart con métricas en 0 (con "Sin datos de engagement") en vez del empty state. Es el comportamiento correcto ya que Zernio está conectado y tiene datos históricos.
- La función `getZernioAnalyticsAction` ahora importa `createClient` de `@/lib/supabase/server` en el archivo `zernio/actions.ts`. Verificar que no haya conflictos con el uso existente de `createAdminClient`.

---

### 2026-08-08 — Fix React #418 (hidratación) en detalle de contenido + sync de historias Zernio

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `d724eae` — fix(marketing): hidratación React #418 y sync de historias Zernio  
**Autor:** Claude  
**Módulo(s) afectado(s):** `marketing`, `lib/marketing`

**Qué se hizo:**
1. **`content-piece-detail.tsx` — React error #418**: Añadido `suppressHydrationWarning` en todos los elementos que renderizan fechas/números con `toLocaleString("es-AR")` / `toLocaleDateString("es-AR")` (elementos `<p>` y `<span>` en líneas de fecha de publicación, métricas actualizadas, funnel de atribución de ventas, fecha de variantes IA). Para el prop `subtitle` de `ChartShell` (string interpolado — no admite `suppressHydrationWarning` directamente), se reemplazó `totalInteractions.toLocaleString("es-AR")` por `fmtNum(totalInteractions)` que evita separadores de locale para valores ≥1000.
2. **`sync-actions.ts` — `fetchExternalPostsViaSync`**: Además del `syncExternalPosts` (POST /posts/sync-external → toca Instagram /me/media, NO trae stories), ahora también llama `listPublishedPosts({ source: "external", accountId, limit: 200 })` para cada cuenta. Esto recupera todos los posts externos conocidos por Zernio, incluyendo historias si Zernio las sincroniza vía otro mecanismo. Los dos conjuntos se mergean y se deduplicam con `dedupeExternalPosts`.
3. **`sync-actions.ts` — `externalPlatformPostId`**: Fallback para historias sin `platformPostId`: si el `_id` de Zernio es un MongoDB ObjectID (24 hex chars) y el tipo es `story`, se usa `zstory_<id>` como identificador en lugar de descartar la historia.
4. **Logging**: Se añade logging detallado con `storyCount` y `types` en ambas llamadas a Zernio para diagnosticar qué tipos devuelve cada endpoint.

**Por qué / finalidad:**
- **Error #418**: El componente `ContentPieceDetail` es `"use client"` pero Next.js igual lo pre-renderiza en el servidor (SSR). `toLocaleString("es-AR")` produce resultados distintos entre Node.js (ICU limitada o de sistema) y el browser, causando mismatch en el texto hidratado → React error #418.
- **Historias**: `syncExternalPosts` (POST /posts/sync-external) solo sincroniza el feed `/me/media` de Instagram, que por diseño de la API de Meta no incluye stories (están en `/me/stories`). Las historias publicadas no aparecían en el módulo de Contenido porque nunca se obtenían. El usuario publicó una historia manualmente y al hacer sync manual no la veía.

**Decisiones de diseño relevantes:**
- `suppressHydrationWarning` es preferible a envolver en `useEffect`/`useState` porque no cambia el comportamiento de la UI (la fecha se muestra igual) y no agrega re-render.
- Para el subtitle prop de ChartShell, `fmtNum()` es locale-safe para valores ≥1000 (usa `K`/`M` con `toFixed`) y para <1000 los separadores locales son irrelevantes (no hay miles).
- `zstory_<id>` como prefijo para IDs de historias sin platformPostId evita colisiones con IDs reales de Instagram y hace el origen obvio en la DB.
- La llamada `listPublishedPosts({ source: "external" })` es complementaria a `syncExternalPosts`: la primera lista lo que Zernio ya conoce, la segunda fuerza un re-sync desde Instagram.

**Riesgos / deuda técnica pendiente:**
- No se sabe con certeza si Zernio incluye stories en `GET /posts?source=external`. Hay logging para diagnosticarlo. Si `storyCount` sigue siendo 0, el problema está en Zernio (no sincroniza stories de Instagram en `/me/stories`) y requeriría un endpoint separado en Zernio o un mecanismo diferente.
- La URL de una historia en Instagram solo existe mientras la historia está activa (24hs). Si Zernio no guarda el `thumbnailUrl` de la historia, la columna `thumbnail_url` quedaría null.

---

### 2026-08-08 — Fix errores 403 en consola del módulo Marketing por URLs CDN de Instagram expiradas

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `c432abe` — fix(marketing): eliminar errores 403 por URLs CDN de Instagram expiradas en thumbnails  
**Autor:** Claude  
**Módulo(s) afectado(s):** `marketing`, `lib/marketing`

**Qué se hizo:**
1. **Nuevo `lib/marketing/cdn-utils.ts`**: utilidad pura (sin deps de servidor, importable en Client Components) con `isInstagramCdnUrl` y `safeThumbnailUrl`. Esta última devuelve null para URLs CDN efímeras.
2. **`story-thumbnail-storage.ts`**: importa `isInstagramCdnUrl` desde `cdn-utils.ts` y lo re-exporta (evita duplicación).
3. **`sync-actions.ts` — caso `toInsert`**: cuando `persistContentThumbnail` falla, ahora guarda `null` en lugar de la URL CDN cruda. Antes se insertaba la URL CDN que expira en ~1-2hs generando 403 en el próximo page load.
4. **`sync-actions.ts` — `repairExpiredCdnThumbnails`**: nueva función que nulifica URLs CDN vencidas en filas existentes. Se llama en background cada vez que `maybeSyncZernioContentAction` se ejecuta (en el page load de marketing/content). Las URLs se restauran en el próximo sync de Zernio.
5. **Componentes UI** (`content-piece-grid.tsx`, `content-piece-detail.tsx`, `marketing-overview.tsx`, `marketing-content-library.tsx`): usan `safeThumbnailUrl()` antes de renderizar `<img>` → si la URL es CDN, muestran el fallback icon directamente sin hacer el request HTTP que causaba el 403.

**Por qué / finalidad:**
Las URLs de thumbnails de Instagram/Zernio son efímeras (expiran en ~1-2hs). El sistema tiene lógica para persistirlas en Supabase Storage (`persistContentThumbnail`), pero cuando ese proceso fallaba en inserts, la URL CDN cruda quedaba guardada en la DB. Después de expirar, cada page load del módulo marketing generaba múltiples errores `GET https://scontent-gru*.cdnins... 403 (Forbidden)` en la consola del browser.

**Decisiones de diseño relevantes:**
- **Doble defensa**: fix en sync (no guardar CDN URLs) + fix en UI (no renderizar CDN URLs). Así el comportamiento correcto se mantiene aunque fallen los dos mecanismos por separado.
- **Repair en background**: `repairExpiredCdnThumbnails` corre async sin bloquear el throttle check del sync, minimizando impacto en tiempo de carga.
- **cdn-utils.ts separado**: necesario para que el check sea importable en Client Components (que no pueden importar `story-thumbnail-storage.ts` porque ese archivo tiene `createAdminClient` como dep de servidor).
- El caso `toUpdate` ya era correcto (guardaba null cuando fallaba); solo el caso `toInsert` tenía el bug.

**Riesgos / deuda técnica pendiente:**
- Rows existentes con URLs CDN expiradas quedarán con `thumbnail_url = null` y sin imagen hasta el próximo sync de Zernio. En el sync, se intentará persistir la URL fresca a Supabase Storage.
- Si el bucket `content-thumbnails` no existe o no tiene permisos públicos, las thumbnails persistidas tampoco cargarán. Verificar en Supabase Dashboard que el bucket existe y es público.

---

### 2026-08-08 — Fix TypeScript build error: await faltante en apiRateLimit

**Rama/branch:** `main`  
**Commit(s):** `f056137` — fix(utm): agregar await faltante en apiRateLimit para evitar error de tipo TS  
**Autor:** Claude  
**Módulo(s) afectado(s):** `app/api/utm/click`, `app/api/utm/track`

**Qué se hizo:**
Agregado `await` faltante en dos route handlers de UTM al llamar `apiRateLimit(...)`:
- `apps/web/app/api/utm/click/route.ts` línea 7
- `apps/web/app/api/utm/track/route.ts` línea 7

**Por qué / finalidad:**
El build de Vercel fallaba con `Type error: Property 'allowed' does not exist on type 'Promise<RateLimitResult>'`. La función `rateLimit()` en `lib/rate-limit.ts` devuelve una función async (`Promise<RateLimitResult>`), pero los dos archivos UTM la llamaban de forma síncrona, sin `await`, intentando desestructurar `{ allowed, resetAt }` directo del Promise (que no tiene esas propiedades). TypeScript strict lo detectó como error de compilación bloqueante.

**Decisiones de diseño relevantes:**
El resto de los call sites en el codebase (agente, auth, webhooks, Fathom, etc.) ya usaban correctamente `await`. Este era un bug introducido al mergear el branch `devin/fix-monorepo` que reemplazó el rate limiter in-memory por uno distribuido en PostgreSQL.

**Riesgos / deuda técnica pendiente:**
Ninguno para este cambio. El build debería pasar limpio.

---

### 2026-08-08 — Merge a main: integración de 3 branches en producción

**Rama/branch:** `main`  
**Commit(s):**
- `46020ae` — merge(main): integrar devin/fix-monorepo
- `c59ebd4` — merge(main): integrar claude/contenido-marketing-ui-redesign
- `ba08d79` — merge(main): integrar claude/otc-codebase-exploration-43fo8w  
**Autor:** Claude  
**Módulo(s) afectado(s):** Todo el monorepo

**Qué se hizo:**
`main` estaba congelado desde julio 13 (solo tenía 1 archivo de cambios del PR #1). Todos los cambios recientes vivían en branches de preview de Vercel. Se mergearon tres branches a `main` para que Vercel auto-deploye a producción:

1. **`claude/otc-codebase-exploration-43fo8w`** (245 archivos, 19k inserciones): todo el trabajo reciente — dashboard redesign, marketing overview, sales metrics, design system, lead magnets, multi-closer, métricas personalizadas, agente con herramientas de datos, dark mode Vercel-style, bokeh ambiental, content intelligence, hardening de seguridad, etc.

2. **`claude/contenido-marketing-ui-redesign-y99q45`**: redesign de UI de biblioteca de contenido y detalle de pieza. 4 conflictos resueltos con `--theirs` (la versión del branch redesign era más nueva y completa).

3. **`devin/fix-monorepo-toolchain-y-rate-limit`**: correcciones de toolchain monorepo (lint, typecheck, build) y reemplazo de rate limiter in-memory por rate limiter distribuido en PostgreSQL (`consume_rate_limit` RPC en Supabase).

**Por qué / finalidad:**
Producción mostraba una versión vieja de OTC con módulos eliminados (Operaciones, Producto, Lanzamientos). El usuario había promovido a producción un preview que tampoco tenía los cambios nuevos. La solución correcta era hacer `main` la fuente de verdad y dejar que Vercel auto-deploye desde ahí.

**Decisiones de diseño relevantes:**
- `redesign/visual-v2` y `design/premium-glass-ui` **no se mergearon**: tienen historias de git no relacionadas (675 archivos de diferencia con main, `--allow-unrelated-histories` hubiera creado un caos). Se dejaron fuera intencionalmente.
- Conflictos en contenido resueltos con `--theirs` porque el branch de redesign tenía la versión más reciente de los 4 archivos en conflicto.

**Riesgos / deuda técnica pendiente:**
- Los branches `redesign/visual-v2` y `design/premium-glass-ui` tienen trabajo que puede contener ideas útiles pero no son mergeables en el estado actual sin revisión manual cuidadosa.
- El rate limiter distribuido requiere que la función SQL `consume_rate_limit` exista en la base de datos de Supabase (ya está en las migraciones; verificar que esté aplicada en producción).

---

### 2026-08-08 — Completar DESIGN.md con tokens reales y componentes

**Rama/branch:** `claude/otc-codebase-exploration-43fo8w` → mergeado a `main`  
**Commit(s):** `951db41` — docs(design): completar DESIGN.md con tokens reales, componentes @ai-coo/ui y correcciones dark mode  
**Autor:** Claude  
**Módulo(s) afectado(s):** `DESIGN.md`, documentación

**Qué se hizo:**
449 líneas insertadas, 69 eliminadas en `DESIGN.md`:
- Corregidos tokens dark mode: `--background: 0 0% 0%` (negro puro, no #0A0A0A), `--card: 0 0% 6%`, `--muted: 0 0% 3%`, `--border: 0 0% 11%`
- Agregada tabla de tokens light completa incluyendo `--accent`, `--popover`, `--sidebar-*`, `--ai-muted`, `--primary-border`
- Documentado sistema `--color-surface-*` en formato RGB (globals.css)
- Documentados todos los tokens de chart (`--chart-1` a `--chart-5`, `--chart-accent`, `--chart-background`, etc.)
- Documentados valores exactos de shadows multi-capa para light y dark
- Documentados tokens de glass (`--glass-bg`, `--glass-blur`, etc.) con valores reales
- Agregada API completa de `GlassPanel`, `MetricCard`, `MetricStat`, `MetricBand`, `AiCard`
- Agregada tabla de todos los componentes `@ai-coo/ui`
- Agregada quick-reference de Tailwind, snippets de patrones comunes, keyframes

**Por qué / finalidad:**
El DESIGN.md anterior tenía valores desactualizados y faltaban tokens que existen en el código real. Cualquier sesión nueva de Claude o desarrollador que lo consultara tomaba decisiones incorrectas de diseño.

**Decisiones de diseño relevantes:**
Todos los valores se verificaron contra los archivos fuente reales (`tokens.css`, `globals.css`, `packages/ui/src/`). No se usaron valores aproximados.

**Riesgos / deuda técnica pendiente:**
DESIGN.md necesita actualizarse cada vez que se agreguen nuevos tokens o componentes a `@ai-coo/ui`.

---

### 2026-07-XX — Dashboard, marketing overview, sales redesign (bloque principal)

**Rama/branch:** `claude/otc-codebase-exploration-43fo8w`  
**Commit(s):** múltiples (ver `git log --oneline` desde `054da78` hasta `c7d50a5`)  
**Autor:** Claude  
**Módulo(s) afectado(s):** dashboard, marketing, sales, finanzas, UI, nav, agente, lead magnets, closing

**Qué se hizo (resumen):**

| Area | Cambios |
|------|---------|
| **Dashboard** | Rediseño visual completo con `MetricCard`, embudo de conversión, métricas personalizables con CRUD, selector de pantalla por métrica |
| **Marketing overview** | Rediseño con estructura de v0, charts Bklit (`DualAreaChart`, funnel, heatmap), tab Métricas corregido |
| **Sales / Métricas** | Rediseño completo con variedad de charts Bklit, KPI heroes con `TrendLineChart`, Facturación y Cash Collected como heroes |
| **Closing** | Sistema multi-closer con Calendly por perfil |
| **Lead Magnets** | Módulo nuevo con atribución automática, thumbnails persistidos en Supabase Storage |
| **Content Intelligence** | Módulo de análisis estructurado y reporte de patrones de contenido |
| **Agente** | Herramientas de lectura de datos para todos los módulos |
| **UI / Nav** | Panel flotante unificado + bokeh ambiental estilo Bucket, dark mode Vercel-style, animaciones de entrada globales, sidebar simplificado (Integraciones dentro de Configuración, Base de conocimiento dentro de Agente) |
| **Finanzas** | Pagos del equipo con auto-cálculo desde datos reales |
| **Holding** | Settings de billing model, fixes de bugs en dashboard y onboarding |
| **Seguridad** | Hardening completo del surface de ataque en producción |
| **Landing** | Página /prueba con formulario de confirmación post-Calendly, endpoint /api/trial-confirm |
| **Super Admin** | Módulo Pruebas Gratis con link de sesión Calendly |

**Por qué / finalidad:**
Evolución del producto hacia una UI más premium y funcional. El sidebar fue simplificado eliminando módulos secundarios (Operaciones, Producto, Inteligencia, Reportes Ejecutivos, Tablero de Trabajo) del menú principal — estos pasaron a ser add-ons opcionales. El foco se puso en Marketing, Ventas y Finanzas como los tres pilares del dashboard diario.

**Decisiones de diseño relevantes:**
- Módulos eliminados del sidebar (Operaciones, Producto, Inteligencia, Reportes Ejecutivos, Tablero de Trabajo) siguen existiendo en el código — solo están fuera de la navegación principal. Se documentaron como add-ons en un documento HTML de contexto comercial.
- Charts: se usa la librería Bklit (`@ai-coo/ui`) para gráficos. Los charts legacy de Visx se mantienen donde funcionan.
- Lead Journey en sales combina comentarios Zernio + CTAs ManyChat.

**Riesgos / deuda técnica pendiente:**
- Tab Métricas del marketing overview tuvo varios ciclos de fix por NaN y radar distorsionado — el origen es datos de prueba vacíos. Verificar con datos reales.
- Los módulos add-on (Operaciones, etc.) no tienen ruta de acceso activa en el sidebar — necesitan un mecanismo de activación por org si se quieren vender como add-ons.

---

### 2026-07-XX — Rate limiter distribuido (Supabase PostgreSQL)

**Rama/branch:** `devin/fix-monorepo-toolchain-y-rate-limit` → mergeado a `main`  
**Commit(s):** `aefca02` — fix(monorepo): reparar lint/typecheck/build y rate limiting distribuido  
**Autor:** Devin  
**Módulo(s) afectado(s):** `lib/rate-limit.ts`, `supabase/migrations/`, toolchain monorepo

**Qué se hizo:**
- Reemplazó el rate limiter in-memory (`Map<string, RateLimitEntry>`) por un rate limiter distribuido usando RPC de Supabase (`consume_rate_limit`).
- La función SQL `consume_rate_limit` vive en las migraciones. El in-memory se usa como fallback cuando Supabase no está configurado (dev local) o cuando hay un error de infraestructura (fail-open).
- Expuso múltiples limiters preconfigurados: `aiRateLimit`, `authRateLimit`, `integrationRateLimit`, `apiRateLimit`, `webhookRateLimit`, `sopGenerateRateLimit`, etc.
- También corrigió problemas de toolchain del monorepo (lint, typecheck, build).

**Por qué / finalidad:**
El rate limiter in-memory no funcionaba en entornos serverless (cada lambda tiene su propia instancia de memoria, sin estado compartido). En producción con Vercel, el límite nunca se alcanzaba porque cada request podía caer en una lambda diferente.

**Decisiones de diseño relevantes:**
- Fail-open: si el RPC de Supabase falla, se usa el contador local de la instancia como red mínima. Esto evita que un problema de infraestructura corte tráfico legítimo.
- La tabla `rate_limits` en Supabase solo es accesible via `createAdminClient()` (service role) — RLS bloqueado para clientes normales.

**Riesgos / deuda técnica pendiente:**
- El branch introdujo un bug: dos archivos UTM (`app/api/utm/click/route.ts`, `app/api/utm/track/route.ts`) no tenían `await` al llamar al rate limiter. Fix aplicado en commit `f056137`.
- La función SQL `consume_rate_limit` debe estar aplicada en la base de datos de producción. Verificar en Supabase Dashboard si las migraciones están al día.

---

## Módulos activos en el sidebar (agosto 2026)

Para referencia rápida de qué módulos están visibles en la navegación actual:

| Módulo | Ruta | Estado |
|--------|------|--------|
| Panel General | `/dashboard` | ✅ Activo |
| Marketing | `/marketing/*` | ✅ Activo |
| Ventas / Inbox | `/sales/*` | ✅ Activo |
| Finanzas | `/finance/*` | ✅ Activo |
| Clientes | `/clients` | ✅ Activo |
| Agente de negocio | `/agent` | ✅ Activo (con Base de conocimiento adentro) |
| Configuración | `/settings`, `/integrations` | ✅ Activo (Integraciones adentro) |
| Equipo | (holding/equipo) | ✅ Activo |
| **Operaciones** | `/operations/*` | ⚠️ Add-on — código existe, sin nav |
| **Reportes Ejecutivos** | `/executive-reports` | ⚠️ Add-on — código existe, sin nav |
| **Inteligencia** | `/intelligence` | ⚠️ Add-on — código existe, sin nav |
| **Producto** | `/product/*` | ⚠️ Add-on — código existe, sin nav |
| **Tablero de trabajo** | `/workboard` | ⚠️ Add-on — código existe, sin nav |

---

*Documento creado: 2026-08-08. Actualizar con cada sesión de cambios.*
