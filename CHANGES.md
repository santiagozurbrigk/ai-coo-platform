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
