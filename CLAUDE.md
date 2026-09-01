# CLAUDE.md — Contexto maestro del monorepo OTC

Documento de referencia para **Claude Code**, Cursor y desarrolladores nuevos.  
Repo: `ai-coo-platform` · App principal: `apps/web` · Última revisión: agosto 2026.

---

## ⚡ REGLAS OBLIGATORIAS PARA CLAUDE CODE — LEER PRIMERO

> Estas reglas aplican a **cualquier sesión** que modifique código en este repo.

### 1. Leer CHANGES.md y PENDIENTES.md al inicio de cada sesión

**Antes de hacer cualquier cambio**, leer los dos archivos siguientes en la raíz del repo:

**[`CHANGES.md`](./CHANGES.md)** — historial de cambios con contexto técnico: qué se hizo, por qué, qué decisiones se tomaron. Es la memoria del proyecto entre sesiones.

**[`PENDIENTES.md`](./PENDIENTES.md)** — backlog de trabajo pendiente organizado por prioridad: bugs conocidos, features en progreso, deuda técnica. Actualizar al finalizar cada sesión.

```
Read /home/user/ai-coo-platform/CHANGES.md
Read /home/user/ai-coo-platform/PENDIENTES.md
```

### 2. Actualizar CHANGES.md al final de cada sesión

**Después de cada bloque de cambios significativo** (no necesariamente al final de cada commit, pero sí antes de terminar una sesión de trabajo), agregar una entrada en `CHANGES.md` con el formato documentado en ese archivo:

- **Fecha** (formato `AAAA-MM-DD`)
- **Título corto** del cambio
- **Branch y commit(s)**
- **Módulo(s) afectado(s)**
- **Qué se hizo** — descripción técnica concreta
- **Por qué / finalidad** — el problema que resuelve o la feature implementada
- **Decisiones de diseño relevantes** — trade-offs, alternativas consideradas
- **Riesgos / deuda técnica pendiente** — qué quedó sin hacer o puede romperse

Agregar la entrada **al principio del historial** (orden cronológico inverso — más reciente arriba).

### 3. Registrar toda API implementada sin documentación

**Primero fijate si la documentación ya está bajada.**
[`docs/external-apis/`](./docs/external-apis/) tiene copias locales completas y
navegables de las APIs externas: **GoHighLevel, VTurb, Whop, Commas (ex Fanbasis),
Hyros y WebinarJam**. Leer de ahí, no de memoria ni de una búsqueda web. Cada carpeta
tiene un `RESUMEN-OTC.md` con lo que OTC necesita de ese proveedor.

Si la API que necesitás no está, **probá su URL antes de darla por bloqueada** y fijate
si publica un spec OpenAPI (cuatro de los seis lo hacen). Bajala con
`docs/external-apis/tools/regenerar.sh` como modelo y commiteala.

Si implementás contra una API externa y **no podés leer su documentación oficial**
(el entorno remoto bloquea varios dominios de documentación), agregá una entrada en
**[`docs/API_DOCS_PENDIENTES.md`](./docs/API_DOCS_PENDIENTES.md)** con qué asumiste,
con qué nivel de confianza y qué necesitás verificar.

Además, en ese caso:
- Persistí el payload crudo **antes** de interpretarlo, para que el primer dato real
  sea la fuente de verdad.
- **Nunca inventes un valor.** Lo que no se entiende queda marcado como no mapeado,
  con su motivo. Un cobro cuyo monto no se lee no es un cobro de cero.
- Aislá el mapeo en un solo archivo por proveedor, con la advertencia en el header.

### 4. Documentar lo que queda sin verificar

Si construís algo que **no podés probar en el momento** —falta una cuenta, una
credencial o la documentación— sumá su bloque de verificación a
**[`docs/PLAN_VERIFICACION.md`](./docs/PLAN_VERIFICACION.md)** con pasos concretos y
resultado esperado, marcando lo que tiene alta probabilidad de fallar, lo que
verifica seguridad y lo que verifica una regla de diseño central.

### 5. Explicar en palabras simples al terminar cada bloque de trabajo

**Cada vez que se termina algo** —una fase, una feature, un bugfix significativo—
cerrar con una explicación **en palabras simples, para alguien que no programa**.

No es un resumen técnico traducido: es contar qué pasaba, qué se hizo y qué
cambia para el negocio, sin nombres de archivos ni de funciones.

- **Qué estaba mal**, con una comparación cotidiana si ayuda
- **Qué se hizo**, en términos de lo que el usuario ve o deja de sufrir
- **Qué falta verificar**, dicho sin rodeos

El detalle técnico va en `CHANGES.md`, no en la respuesta. Los números que
respaldan lo que se afirma (tests, filas afectadas, porcentajes) sí van, porque
son lo que distingue una afirmación de una impresión.

---

### 6. Nunca saltear la actualización de CHANGES.md y PENDIENTES.md

Aunque el cambio parezca pequeño (un bugfix de una línea, un tweak de UI), documentarlo en `CHANGES.md`. La continuidad de contexto entre sesiones depende de este registro.

Al finalizar cada sesión, también actualizar `PENDIENTES.md`:
- Mover a `✅ Completados` los ítems que se terminaron (con fecha)
- Agregar nuevos pendientes que hayan surgido durante la sesión
- Actualizar la descripción de ítems que cambiaron de scope o estado

### 7. Workflow de Git — ramas, PRs y merges

**Todo el desarrollo ocurre en ramas de feature. Nunca commitear directamente a `main`.**

#### Flujo obligatorio

```
main (producción — Vercel auto-deploya desde acá)
  │
  └── rama-de-feature   ← todo el trabajo va acá
        ↓  commits + push
        ↓  PR a main (GitHub)
        ↓  Squash and merge   ← tipo de merge establecido
      main  →  deploy automático en Vercel
```

#### Reglas

1. **Arrancar siempre desde `main` actualizado** antes de crear la rama:
   ```bash
   git fetch origin main
   git checkout -B nombre-del-feature origin/main
   ```
2. **Nunca pushear a `main` directamente** — solo via PR mergeado.
3. **Tipo de merge: siempre "Squash and merge"** — aplasta todos los commits de la rama en uno solo en `main`, manteniendo el historial limpio.
4. **Después de un merge**: la rama anterior queda "consumida". La próxima tarea empieza en una rama nueva desde `main`.
5. **Commits**: mensajes en español, estilo convencional — `feat(modulo): ...`, `fix(zernio): ...`.
6. **No crear PR** a menos que el usuario lo pida explícitamente.
7. **No pushear a `main`** a menos que el usuario lo pida explícitamente.

#### Nombres de rama

Usar nombres descriptivos del feature o fix:
- `feat/trial-reels-delay-qstash`
- `fix/marketing-console-errors`
- `chore/update-dependencies`

Claude Code usa el prefijo `claude/` asignado por el sistema — está bien, no modificar.

---

**Fuentes complementarias (leer si hace falta profundizar):**
- `CHANGES.md` — **historial de cambios con contexto** (leer siempre al inicio)
- `docs/external-apis/` — **copia local de la documentación de las APIs externas** (GoHighLevel, VTurb, Whop, Commas, Hyros, WebinarJam)
- `docs/API_DOCS_PENDIENTES.md` — **APIs implementadas sin documentación**, pendientes de verificar
- `docs/PLAN_VERIFICACION.md` — **qué probar a mano** cuando haya cuentas reales conectadas
- `PENDIENTES.md` — **backlog de pendientes** (leer siempre al inicio, actualizar al terminar)
- `OTC_OPERATIONAL_NOTES.md` — operaciones, integraciones, crons, env vars en detalle
- `DESIGN.md` — design system OTC
- `docs/PROJECT_CONSTITUTION.md` — visión de producto
- `routes/paths.ts` — rutas canónicas de navegación

---

## 1. NEGOCIO — OTC (Optimiza tu Control)

### Qué es OTC

**OTC (Optimiza tu Control)** es el producto comercial del monorepo **AI COO Platform**: un sistema operativo con IA para **negocios de infoproductos** (cursos, mentorías, memberships). No es un CRM ni un dashboard genérico — es un **cerebro operativo** que centraliza ventas, marketing, operaciones, finanzas y documentación, y ayuda al founder a entender qué pasa, dónde están los cuellos de botella y qué priorizar.

### A quién sirve

- **Founders** de infoproductos que gestionan equipo, contenido, ventas por DM y llamadas de cierre
- **Holdings / agencias** que administran **múltiples negocios** desde una cuenta (`account_type = 'holding'`, cookie `otc_active_org`)
- **Operadores** (rol `operator`) y **viewers** con permisos por módulo

### Propuesta de valor

- **Single source of truth**: inbox unificado, clientes, contenido, métricas, SOPs, reportes ejecutivos
- **IA integrada**: agente de negocio, scoring de leads, análisis de llamadas Fathom, etiquetado de contenido, reportes
- **Integraciones nativas**: Calendly, ManyChat, Instagram/YouTube, formularios, pagos (Stripe/MP), Discord, Zernio
- **BYOK Claude**: cada organización puede usar su propia API key de Anthropic (cifrada) u OAuth Claude

### Módulos principales del producto

| Módulo | Ruta | Función |
|--------|------|---------|
| **Panel General** | `/dashboard` | KPIs cross-módulo |
| **Tablero de trabajo** | `/workboard` | Tareas, sprints, links a SOPs/docs |
| **Agente de negocio** | `/agent` | Chat IA con herramientas, canvas, propuestas de grafo |
| **Clientes** | `/clients` | CRM, pagos, timeline, Discord |
| **Marketing** | `/marketing/*` | Overview, contenido (Zernio), anuncios Meta, Drive, UTMs, formularios |
| **Ventas / Inbox** | `/sales/inbox` | DMs Instagram/WhatsApp vía Zernio (reemplaza inbox legacy ManyChat/Unipile en UI actual) |
| **Closing** | `/sales/closing` | Llamadas de cierre, Calendly |
| **Producto** | `/product/*` | Avatares, ofertas, value ladder, propuesta de valor |
| **Operaciones** | `/operations/*` | SOPs, inputs semanales, inteligencia |
| **Finanzas** | `/finance/*` | Gastos, facturación, Mercado Pago |
| **Base de conocimiento** | `/business-context/documents` | Docs + RAG para el agente |
| **Integraciones** | `/integrations` | OAuth y API keys por proveedor |
| **Super Admin** | `/super-admin/*` | Gestión de orgs, costos, waitlist (staff OTC) |

### Conexión con Zernio

**[Zernio](https://zernio.com)** es la plataforma externa de gestión de redes sociales. OTC se conecta vía API key por organización (`zernio_integrations`).

Zernio provee a OTC:
- **Contenido publicado** (posts/reels de Instagram, posts externos)
- **Métricas** por post y por cuenta
- **Inbox** (DMs Instagram, WhatsApp, etc.)
- **Comentarios** en posts
- **Meta Ads** vinculados a piezas de contenido

Flujo típico:
1. Usuario conecta Zernio en `/integrations` → se guarda `zernio_profile_id` + `connected_accounts`
2. Sync de contenido → `content_pieces` con `platform_post_id` (ID numérico de Instagram media)
3. UI de marketing/inbox/ads fetchea **en vivo** desde Zernio (sin duplicar ads/comentarios en DB)
4. Métricas se persisten en `content_pieces.metrics` + `metrics_updated_at` vía sync programado y manual

Cliente: `apps/web/lib/zernio/client.ts` · Integración org: `apps/web/lib/zernio/integration.ts`

---

## 2. STACK TÉCNICO

### Monorepo (Turborepo + pnpm)

```
ai-coo-platform/
├── apps/
│   ├── web/              # @ai-coo/web — Next.js 15 (app principal)
│   └── discord-bot/      # @ai-coo/discord-bot — bot Discord + Supabase
├── packages/
│   ├── types/            # @ai-coo/types — tipos compartidos
│   ├── ui/               # @ai-coo/ui — design system (Radix, Visx, Framer)
│   ├── config/           # @ai-coo/config — ESLint, Tailwind, TS configs
│   ├── database/         # reservado (futuro)
│   ├── ai/               # reservado
│   ├── integrations/     # reservado
│   └── queue/            # reservado
├── supabase/migrations/  # ~97 migraciones SQL (fuente de verdad del schema)
└── docs/                 # specs de producto
```

- **Package manager:** pnpm 9 · **Node:** ≥20
- **Turbo tasks:** `build`, `dev`, `lint`, `typecheck`, `test`
- **Scripts raíz:** `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm test`

### apps/web

| Capa | Tecnología |
|------|------------|
| Framework | **Next.js 15.3** App Router, React 19 |
| Mutaciones | **Server Actions** (`"use server"`) en `app/**/actions.ts` |
| Streaming IA | **SSE** en `/api/agent/send` → `lib/agent/stream-agent-message.ts` |
| DB | **Supabase** (PostgreSQL + Auth + RLS) |
| IA | **Anthropic SDK** (Claude Haiku/Sonnet), OpenAI (embeddings RAG) |
| UI | **@ai-coo/ui** (Shadcn/Radix) + **Tailwind CSS 3** + **Lucide React** |
| Deploy | **Vercel** región `gru1` (São Paulo) |
| Cola | Upstash QStash (ingesta RAG) |

### Supabase

- **URL:** `NEXT_PUBLIC_SUPABASE_URL` (ej. `https://<project-ref>.supabase.co`)
- **Project ID:** no está commiteado — está en el dashboard de Supabase / env de Vercel
- **Claves:** anon/publishable (cliente + RLS), service role (solo servidor, bypass RLS)
- **Migraciones:** `supabase/migrations/*.sql` — aplicar con CLI Supabase o SQL manual en dashboard
- **No hay** `database.types.ts` generado en el repo; inferir schema desde migraciones

### Vercel

- **Config:** `apps/web/vercel.json` (crons, headers OAuth)
- **Project ID / Team:** no commiteados — configurados en dashboard Vercel
- **Auto-deploy:** push a `main` → deploy de `apps/web`

---

## 3. ESTRUCTURA DE DIRECTORIOS

### `apps/web/app/` — rutas y Server Actions

```
app/
├── (platform)/          # UI autenticada del founder (layout con sidebar)
│   ├── marketing/       # /marketing/*
│   ├── sales/           # /sales/*
│   ├── agent/           # /agent/*
│   ├── clients/         # /clients/*
│   ├── finance/         # /finance/*
│   ├── operations/      # /operations/*
│   ├── product/         # /product/*
│   ├── integrations/    # /integrations
│   ├── workboard/       # /workboard
│   ├── business-context/
│   ├── intelligence/
│   ├── executive-reports/
│   ├── settings/
│   ├── holding/
│   └── onboarding/
├── (landing)/           # Landing pública /
├── (founder)/           # /founder
├── (super-admin)/       # /super-admin/*
├── api/                 # Route Handlers (webhooks, crons, SSE, OAuth callbacks)
├── auth/                # login, callback, recover
├── marketing/           # actions.ts (dominio marketing, fuera de route group)
├── agent/               # actions.ts del agente
├── clients/             # actions.ts CRM
├── integrations/        # zernio/actions.ts, etc.
└── ...                  # Un action file por dominio legacy
```

**Convención de páginas:** `app/(platform)/<modulo>/page.tsx` o `[id]/page.tsx`  
**Convención de actions:** `app/<dominio>/actions.ts` o `app/<dominio>/<subdominio>/*-actions.ts`

### `apps/web/components/` — UI por dominio

```
components/
├── marketing/           # contenido, ads, Drive, charts, marketing-icons.tsx
├── sales/               # inbox Zernio, closing, métricas
├── agent/               # chat, canvas, sidebar
├── navigation/          # sidebar, app-shell
├── shared/              # empty-state, page-loading, filter-pills
├── charts/              # wrappers Visx
├── integrations/        # cards de integración
└── ui/                  # re-exports locales si aplica
```

- **Server Components por defecto** en `page.tsx`
- **Client Components** solo cuando hay estado, efectos, o event handlers → `"use client"` al inicio
- **Iconos:** `lucide-react` vía helpers en `components/marketing/marketing-icons.tsx` — **no emojis en JSX**

### `apps/web/lib/` — lógica de negocio

```
lib/
├── agent/               # streaming, compaction, JIT context, tools, SSE
├── ai/                  # anthropic.ts, org-context.ts, RAG search
├── zernio/              # client.ts, integration.ts, resolve-analytics.ts
├── marketing/           # sync-content-metrics, content-filters
├── supabase/            # client, server, admin, env, middleware
├── auth/                # bootstrap.ts → requireOrganizationId()
├── navigation/          # sidebar-modules.ts, paths helpers
├── integrations/        # cron-auth.ts
└── <dominio>/           # un folder por módulo de negocio
```

### Tipos y rutas

| Ubicación | Uso |
|-----------|-----|
| `apps/web/types/` | Tipos por dominio (`content.ts`, `agent.ts`, …) |
| `packages/types/` | Tipos compartidos del monorepo |
| `apps/web/routes/paths.ts` | **Única fuente de verdad** para paths de navegación |
| `apps/web/lib/navigation/sidebar-modules.ts` | Config del sidebar |

### Naming

| Artefacto | Patrón | Ejemplo |
|-----------|--------|---------|
| Server Action | `*Action` suffix, archivo `actions.ts` o `*-actions.ts` | `getContentPiecesAction` |
| Client component | PascalCase, archivo kebab | `ads-dashboard.tsx` → `AdsDashboard` |
| Lib helper | camelCase | `resolvePostAnalytics` |
| API route | `app/api/<ruta>/route.ts` | `app/api/agent/send/route.ts` |
| Cron | `app/api/cron/<nombre>/route.ts` | `sync-content-metrics` |

---

## 4. APIS EXTERNAS

### Zernio API

- **Base URL:** `https://zernio.com/api/v1` (override: `ZERNIO_BASE_URL`)
- **Auth:** `Authorization: Bearer <api_key>` (org key en DB o `ZERNIO_API_KEY` global en dev)
- **Cliente:** `apps/web/lib/zernio/client.ts` → `createZernioClient(apiKey)`

#### Endpoints usados

| Método cliente | HTTP | Path / query |
|----------------|------|--------------|
| `listAccounts` | GET | `/accounts` |
| `listConversations` | GET | `/inbox/conversations[?accountId=]` |
| `getMessages` | GET | `/inbox/conversations/{id}/messages?accountId=` |
| `sendMessage` | POST | `/inbox/conversations/{id}/messages` |
| `listComments` | GET | `/inbox/comments[?accountId=]` |
| `getPostComments` | GET | `/inbox/comments/{postId}?accountId=&limit=&cursor=` |
| `replyToComment` | POST | `/inbox/comments/{postId}` |
| `hideComment` | POST | `/inbox/comments/{postId}/{commentId}/hide` |
| `getLinkedAds` | GET | `/ads?effectiveInstagramMediaId=&source=all&limit=` |
| `listAds` | GET | `/ads?source=&limit=&status=&platform=&fromDate=&toDate=` |
| `listPublishedPosts` | GET | `/posts?status=&limit=&source=&profileId=&accountId=` |
| `syncExternalPosts` | POST | `/posts/sync-external` body `{ accountId }` |
| `createPost` | POST | `/posts` |
| `getPostAnalytics` | GET | `/analytics?postId=` |
| `listPostAnalytics` | GET | `/analytics?source=&limit=&accountId=&platform=&profileId=` |
| `getAccountAnalytics` | GET | `/analytics/account/{accountId}?startDate=&endDate=` |
| `getPostsAnalytics` | GET | `/analytics/posts` |

**Fetch robusto:** `zernioFetchJson` valida JSON y detecta respuestas HTML (URLs mal formadas).

#### Tres formatos de analytics (`lib/zernio/resolve-analytics.ts`)

`resolvePostAnalytics(analytics)` normaliza a `ContentMetrics`:

1. **Vacío / inválido** — no es objeto → métricas en cero
2. **Plano (flat)** — `{ likes, views, reach, impressions, ... }` en la raíz
3. **Anidado por plataforma** — `{ instagram: { likes, ... }, facebook: { ... } }` o `{ platforms: { instagram: {...} } }` → **suma** across platforms

Campos resultantes: `likes, comments, shares, saves, reach, impressions, views`.

**Regla:** siempre usar `resolvePostAnalytics` — no parsear analytics inline en nuevos archivos.

#### Meta Ads vía Zernio

- `GET /ads` con `effectiveInstagramMediaId` = `content_pieces.platform_post_id`
- Tipos: `ZernioLinkedAd`, `ZernioAdMetrics` en `client.ts`
- UI: tab por pieza (`zernio-post-ads.tsx`) + dashboard `/marketing/anuncios` (`getMarketingAdsAction`)
- **No se persisten en DB** — fetch en vivo como comentarios

### Anthropic API

**Archivo central:** `apps/web/lib/ai/anthropic.ts`

| Modelo constante | ID API |
|------------------|--------|
| `AI_MODELS.HAIKU` | `claude-haiku-4-5-20251001` |
| `AI_MODELS.SONNET` | `claude-sonnet-4-6` (alias API → `claude-sonnet-4-5-20250929`) |

**Task → modelo** (`TASK_MODEL_MAP`):
- Haiku: scoring, labeling, `agent_simple` (compaction, JIT context, selección de bloques)
- Sonnet: análisis Fathom, SOPs, `agent_complex`, análisis de contenido

**BYOK:** `executeWithCredentialFallback` — intenta API key de la org (cifrada) → fallback `ANTHROPIC_API_KEY` global.

**Funciones clave:**
- `callClaudeText` — síncrono, texto plano (compaction, JIT)
- `callClaudeJson` — parseo JSON
- `callClaudeAgent` — loop con tools (no streaming)
- `streamClaudeAgent` — streaming SSE (`lib/agent/stream-claude-agent.ts`)

**Agente de negocio:**
- **Compaction** (`lib/agent/compact-conversation.ts`): si >20 msgs o ~40K tokens estimados, resume con Haiku los mensajes viejos (excepto últimos 6). **No modifica DB.**
- **JIT context** (`lib/agent/jit-context.ts`): Haiku selecciona bloques de contexto org; fallback 3 más recientes
- **Streaming** (`lib/agent/stream-agent-message.ts`): orquesta RAG, tools, canvas, persistencia de mensajes

---

## 5. ENDPOINTS INTERNOS / SERVER ACTIONS

### Patrón Server Action

```typescript
"use server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";

export async function myAction() {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  // RLS filtra por org automáticamente
}
```

Secrets de integraciones → `createAdminClient()` (service role).

### Archivos `*-actions.ts` principales (por dominio)

| Archivo | Exports principales |
|---------|---------------------|
| `app/agent/actions.ts` | `sendAgentMessageAction`, `listAgentMessagesAction`, `createAgentConversationAction`, canvas/knowledge/workboard tools |
| `app/marketing/actions.ts` | overview, content library, labels, UTMs |
| `app/marketing/content/actions.ts` | `getContentPiecesAction`, análisis, variantes, publicar Zernio |
| `app/marketing/content/sync-actions.ts` | `syncZernioContentAction`, `maybeSyncZernioContentAction`, `syncZernioMetricsAction` |
| `app/marketing/content/drive-actions.ts` | Google Drive list/link/create folder |
| `app/marketing/content/comment-actions.ts` | `getContentPieceCommentsAction` |
| `app/marketing/content/ad-actions.ts` | `getContentPieceAdsAction`, `getMarketingAdsAction` |
| `app/integrations/zernio/actions.ts` | `listZernioConversationsAction`, `getZernioMessagesAction`, `sendZernioMessageAction` |
| `app/clients/actions.ts` | CRUD clientes, import |
| `app/clients/payment-actions.ts` | pagos, recibos |
| `app/conversations/actions.ts` | inbox legacy (ManyChat) |
| `app/sales/actions.ts` | métricas ventas |
| `app/product/actions.ts` | avatares, productos, value ladder, frameworks |
| `app/business-context/actions.ts` | docs, RAG indexing |
| `app/workboard/actions.ts` | tareas, sprints |
| `app/workboard/task-link-actions.ts` | links SOPs/docs/adjuntos |
| `app/finance/actions.ts` | gastos, facturación |
| `app/integrations/actions.ts` | estado integraciones |
| `app/fathom/actions.ts` | Fathom connect/sync |
| `app/calendly/actions.ts` | Calendly pull |
| `app/operations/actions.ts` | weekly inputs, reportes |
| `app/intelligence/actions.ts` | snapshots |
| `app/executive-reports/actions.ts` | reportes ejecutivos |
| `app/onboarding/actions.ts` | gate de onboarding del founder (negocio, oferta principal, avatar) |
| `app/(platform)/holding/actions.ts` | switching holding |
| `app/super-admin/actions.ts` | admin OTC |
| `app/auth/actions.ts` | signIn, signUp, signOut |

### Rutas API (`app/api/`)

| Grupo | Rutas | Propósito |
|-------|-------|-----------|
| **Agente** | `POST /api/agent/send` | SSE streaming del agente |
| | `POST /api/agent/transcribe` | Voz → texto |
| **Contenido** | `POST /api/content/analyze` | Análisis IA de pieza |
| **RAG** | `POST /api/rag/ingest` | Ingesta documentos |
| | `POST /api/queue/process-rag-ingestion` | Worker QStash |
| **UTM** | `POST /api/utm/track`, `GET /api/utm/click` | Atribución |
| **Waitlist** | `POST /api/waitlist` | Alta waitlist |
| **Webhooks** | `/api/webhooks/mercadopago`, `instagram/messages`, `unipile` | Eventos externos |
| **Integraciones** | `/api/integrations/{provider}/{connect,callback,sync,webhook}` | OAuth + sync por proveedor |
| **Crons** | ver tabla abajo | Jobs programados Vercel |

### Cron jobs (`apps/web/vercel.json`)

Todos los endpoints dedicados `/api/cron/*` y varios `/api/integrations/*/sync` usan:

```typescript
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
// Authorization: Bearer <CRON_SECRET>
```

| Path | Schedule (UTC) | Qué hace |
|------|----------------|----------|
| `/api/integrations/fathom/process` | `*/10 * * * *` | Procesa calls Fathom pendientes (delay 30 min) |
| `/api/integrations/fathom/sync` | `0 * * * *` | Sync reuniones Fathom |
| `/api/integrations/typeform/sync` | `0 * * * *` | Respuestas Typeform |
| `/api/integrations/google-forms/sync` | `0 * * * *` | Respuestas Google Forms |
| `/api/cron/calendly-sync` | `0 * * * *` | Calendly → `closing_calls` |
| `/api/integrations/instagram/sync` | `0 * * * *` | Contenido Instagram (legacy Graph) |
| `/api/integrations/instagram/poll` | `*/5 * * * *` | Poll mensajes IG |
| `/api/cron/mercadopago-token-refresh` | `0 4 * * *` | Refresh tokens MP |
| `/api/cron/intelligence-snapshot` | `0 0,12 * * *` | Snapshots inteligencia |
| `/api/cron/founder-tone-analysis` | `0 12 * * 1` | Tono del founder (lunes) |
| `/api/cron/executive-report-weekly` | `30 12 * * 1` | Reporte semanal |
| `/api/cron/executive-report-monthly` | `0 13 1 * *` | Reporte mensual |
| `/api/cron/sync-content-metrics` | `0 6 * * *` | Métricas `content_pieces` vía Zernio |

**Protección:** `CRON_SECRET` obligatorio en producción (`assertCronAuthorized` lanza si falta).

**Test manual:**
```bash
curl -X POST "https://<app-url>/api/cron/sync-content-metrics" \
  -H "Authorization: Bearer $CRON_SECRET"
# Opcional: ?organizationId=<uuid> para una sola org
```

---

## 6. BASE DE DATOS

### Tablas principales

| Tabla | Columnas clave | Notas |
|-------|----------------|-------|
| `organizations` | `id`, `name`, `status`, `account_type` (`founder`/`holding`), `industry`, BYOK Claude fields | Multi-tenant root |
| `profiles` | `id` (= auth.users), `organization_id`, `role`, `email` | Un user → una org (salvo super-admin) |
| `content_pieces` | `id`, `organization_id`, `type`, `source` (`zernio`), `platform_post_id`, `platform_post_url`, `metrics` (JSONB), `metrics_updated_at`, `analysis`, `drive_file_id`, `sales_attributed`, `status` | Módulo marketing nuevo |
| `content_assets` | `id`, `organization_id`, `platform`, `external_id`, métricas, `ai_content_label` | Legacy sync IG/YT |
| `conversations` | `id`, `organization_id`, `source`, lead fields, AI scoring | Inbox legacy |
| `clients` | `id`, `organization_id`, `name`, `email`, `status`, `total_amount` | CRM |
| `closing_calls` | `id`, `organization_id`, `client_id`, Calendly data, `form_answers` | Ventas |
| `zernio_integrations` | `organization_id`, `zernio_profile_id`, `connected_accounts` (JSONB) | 1 por org |
| `agent_conversations` / `agent_messages` | `organization_id`, historial agente | |
| `business_context_documents` | `organization_id`, `title`, `content_text`, `status` (`indexed`) | JIT context + RAG |
| `sops` | `organization_id`, `title`, `content`, `department`, `status` | |
| `workboard_tasks` | `organization_id`, sprint, assignees | |
| `rag_documents` / `rag_chunks` | `organization_id`, embeddings | |
| `token_usage` | `organization_id`, modelo, feature, tokens | Costos IA |
| `holding_businesses` | `holding_org_id`, `business_org_id` | Portfolio holding |
| `rate_limits` | `key`, `count`, `reset_at` | Contador de rate limiting compartido entre lambdas (`consume_rate_limit`); solo service role |

### RLS (Row Level Security)

Función central en PostgreSQL:
```sql
get_my_organization_id() → SELECT organization_id FROM profiles WHERE id = auth.uid()
```

Patrón estándar en policies:
```sql
USING (organization_id = public.get_my_organization_id())
WITH CHECK (organization_id = public.get_my_organization_id())
```

**App layer:**
- `requireOrganizationId()` en `lib/auth/bootstrap.ts` — resuelve org efectiva (holding switch vía cookie)
- `createClient()` (server/browser) — respeta RLS con sesión del usuario
- `createAdminClient()` — **bypass RLS**, solo servidor, para secrets y jobs

**Integraciones con tokens:** RLS de lectura eliminado en tablas con secrets — solo admin client en servidor.

### Campos críticos

| Campo | Uso |
|-------|-----|
| `content_pieces.platform_post_id` | ID Instagram media para Zernio (comentarios, ads, analytics). Puede ser UUID interno o media ID numérico — resolver con `resolveContentPieceRow()` |
| `content_pieces.metrics_updated_at` | Throttle y freshness de métricas |
| `content_pieces.metrics` | JSONB normalizado post-`resolvePostAnalytics` |
| `organization_id` | FK en casi todas las tablas — **siempre filtrar** |
| `zernio_integrations.zernio_profile_id` | Solo el `_id` del profile, no JSON completo (`extractProfileId()`) |

---

## 7. PATRONES DE DESARROLLO

### Nueva feature (flujo estándar)

1. **Schema** (si aplica) → migración en `supabase/migrations/`
2. **Lib** → lógica pura en `lib/<dominio>/`
3. **Server Action** → `app/<dominio>/*-actions.ts` con `requireOrganizationId()`
4. **Component** → `components/<dominio>/` (client solo si necesario)
5. **Page** → `app/(platform)/<ruta>/page.tsx` (Server Component que fetchea y pasa props)
6. **Ruta** → agregar en `routes/paths.ts` + `sidebar-modules.ts` si es navegable
7. **Typecheck** → `cd apps/web && node node_modules/typescript/bin/tsc --noEmit`
8. **Tests** → `pnpm test` (Vitest; agregar tests si la feature tiene lógica pura en `lib/`)

### Throttle sync de contenido Zernio

`maybeSyncZernioContentAction()` en `sync-actions.ts`:
- Intervalo: **30 min** (`SYNC_INTERVAL_MS`)
- Corre si: no hay piezas Zernio **o** la más reciente tiene `updated_at` > 30 min atrás
- Si hay datos frescos → skip (log `[syncZernioContent] throttle check`)
- Llamado desde página `/marketing/content` al cargar
- Sync forzado: `syncZernioContentAction()`
- Métricas: `syncZernioMetricsAction()` + cron diario `sync-content-metrics`

### Agente SSE

```
Cliente → POST /api/agent/send
       → streamAgentMessage()
            → buildJitOrgContextText()      # Haiku selecciona contexto
            → compactConversationMessages() # Haiku resume si conversación larga
            → searchRAG()
            → streamClaudeAgent()           # SSE tokens + tools
       → persiste agent_messages (historial completo en DB)
```

Eventos SSE: ver `lib/agent/sse.ts` (`token`, `thinking`, `tool`, `done`, `error`).

### Convenciones UI

- **Iconos:** Lucide React (`lucide-react`), helpers en `components/marketing/marketing-icons.tsx`
- **No emojis** en JSX de producción
- **Design system:** `@ai-coo/ui` + tokens en `DESIGN.md`. El acento de marca es **naranja `#E15D12`** y se usa **siempre por token** (`bg-primary`, `text-primary`) o vía `lib/brand.ts` — nunca hardcodeando el hex
- **Filtros:** `FilterPills` + `segmented-nav-styles.ts`
- **Empty states:** `components/shared/empty-state.tsx`
- **Toasts:** `useToast()` de `@/providers/toast-provider`

### Fetch en vivo vs persistencia

| Dato | Estrategia |
|------|------------|
| Comentarios Zernio | Live fetch, no DB |
| Ads Meta vía Zernio | Live fetch, no DB |
| Contenido / métricas | Sync → `content_pieces` |
| Inbox Zernio | Live desde API (conversaciones en Zernio) |

---

## 8. VARIABLES DE ENTORNO

**Plantilla:** `.env.example` (raíz) → copiar a `apps/web/.env.local`

### Requeridas en producción (mínimo viable)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Sí | URL pública de la app |
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Service role (servidor) |
| `ANTHROPIC_API_KEY` | Sí* | IA global (*o BYOK por org) |
| `ENCRYPTION_MASTER_KEY` | Sí si BYOK | AES-256-GCM para keys org |
| `CRON_SECRET` | Sí | Protección crons |
| `ZERNIO_API_KEY` | Sí si Zernio | Fallback global; idealmente key por org |

### Por integración (según módulos activos)

| Grupo | Variables |
|-------|-----------|
| **Email** | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| **RAG** | `OPENAI_API_KEY`, `QSTASH_TOKEN`, `QSTASH_*_SIGNING_KEY` |
| **Google** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI`, `GOOGLE_FORMS_REDIRECT_URI` |
| **Calendly** | `CALENDLY_CLIENT_ID`, `CALENDLY_CLIENT_SECRET`, `CALENDLY_REDIRECT_URI`, `CALENDLY_WEBHOOK_URL` |
| **Typeform** | `TYPEFORM_CLIENT_ID`, `TYPEFORM_CLIENT_SECRET`, `TYPEFORM_REDIRECT_URI` |
| **Fathom** | `FATHOM_WEBHOOK_SECRET`, `FATHOM_API_BASE` |
| **Stripe** | `STRIPE_CLIENT_ID`, `STRIPE_SECRET_KEY`, `STRIPE_REDIRECT_URI` |
| **Mercado Pago** | `MERCADOPAGO_CLIENT_ID`, `MERCADOPAGO_CLIENT_SECRET`, `MERCADOPAGO_REDIRECT_URI`, `MERCADOPAGO_WEBHOOK_SECRET` |
| **Instagram** | `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_REDIRECT_URI`, `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` |
| **Unipile** | `UNIPILE_DSN`, `UNIPILE_ACCESS_TOKEN`, `UNIPILE_API_KEY`, `UNIPILE_WEBHOOK_SECRET` |
| **ManyChat** | (API key por org en DB) |
| **Zernio** | `ZERNIO_API_KEY`, `ZERNIO_BASE_URL` (opcional) |
| **Discord** | `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, `NEXT_PUBLIC_DISCORD_CLIENT_ID`, `OTC_WEBHOOK_SECRET` |
| **Meta Pixel** | `NEXT_PUBLIC_META_PIXEL_ID`, `META_CONVERSIONS_API_TOKEN` |
| **UTM landing** | `NEXT_PUBLIC_UTM_ORGANIZATION_ID` |
| **Vercel** | `VERCEL_URL`, `VERCEL_GIT_COMMIT_SHA` (auto) |

### Desarrollo local

- Sin Supabase configurado → `isSupabaseConfigured() === false` → modo demo con mocks
- `CRON_SECRET` puede omitirse en algunos endpoints legacy (ver `OTC_OPERATIONAL_NOTES.md`) — **no en producción**
- Google OAuth en modo "Prueba" requiere test users en consent screen

**Helpers:** `apps/web/lib/supabase/env.ts`

---

## 9. WORKFLOW DE DEPLOY

### Flujo completo (ver también Regla 7 en sección de Reglas Obligatorias)

```
rama-de-feature  →  PR a main  →  Squash and merge  →  Vercel build  →  Production (gru1)
```

**Nunca** `git push origin main` directamente. El deploy a producción ocurre **solo** via PR mergeado.

### Deploy automático

Vercel detecta cualquier push a `main` y deploya `apps/web` automáticamente.  
Tiempo estimado de build: ~2 minutos.

### Migraciones Supabase

1. Crear archivo `supabase/migrations/YYYYMMDDHHMMSS_descripcion.sql`
2. Aplicar:
   - `supabase db push` (CLI vinculada al proyecto), o
   - Ejecutar SQL en Supabase Dashboard → SQL Editor
3. Verificar RLS policies en la misma migración

### Typecheck / lint local

```bash
cd apps/web
node node_modules/typescript/bin/tsc --noEmit
pnpm lint
```

### Tests unitarios (Vitest)

```bash
pnpm test                       # todo el monorepo, vía turbo
cd apps/web && pnpm test        # solo la app web
cd apps/web && pnpm test:watch  # modo watch
```

Los tests viven junto al código que cubren, en `lib/<dominio>/__tests__/*.test.ts`.
Entorno `node`: cubren **lógica pura de `lib/`**, no componentes. Los flujos de UI
se cubren con Playwright (`apps/web/e2e/`).

### Testear crons manualmente

```bash
curl -X POST "https://<NEXT_PUBLIC_APP_URL>/api/cron/<nombre>" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Commits

- Mensajes en español, estilo convencional: `feat(marketing): ...`, `fix(zernio): ...`
- No commitear `.env.local`, `.lint-out.txt`, secrets
- **No pushear a `main` directamente** — siempre via PR + Squash and merge

---

## 10. CONTEXTO PARA CLAUDE CODE

### Comportamiento esperado

1. **Explorar antes de escribir** — leer archivos existentes del dominio; copiar patrones, no inventar arquitectura paralela
2. **Cambios mínimos** — el diff más pequeño que resuelva el problema
3. **Server-first** — preferir Server Components y Server Actions; Client solo con razón
4. **No duplicar** — reutilizar `resolvePostAnalytics`, `zernioFetchJson`, `requireOrganizationId`, `marketing-icons.tsx`
5. **Español** — UI strings y commits en español (es-AR)
6. **No emojis en UI** — usar Lucide
7. **No modificar historial del agente** en compaction — solo la payload enviada a Claude
8. **Secrets** — nunca en cliente; `createAdminClient()` solo en servidor

### Archivos críticos (leer antes de tocar el dominio)

| Dominio | Archivos |
|---------|----------|
| **Rutas / nav** | `routes/paths.ts`, `lib/navigation/sidebar-modules.ts` |
| **Auth / org** | `lib/auth/bootstrap.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts` |
| **Zernio** | `lib/zernio/client.ts`, `lib/zernio/integration.ts`, `lib/zernio/resolve-analytics.ts` |
| **Marketing contenido** | `app/marketing/content/sync-actions.ts`, `actions.ts`, `lib/marketing/sync-content-metrics.ts` |
| **Agente** | `lib/agent/stream-agent-message.ts`, `lib/ai/anthropic.ts`, `lib/agent/jit-context.ts`, `lib/agent/compact-conversation.ts` |
| **Inbox ventas** | `components/sales/zernio-inbox-panel.tsx`, `app/integrations/zernio/actions.ts` |
| **IA / contexto** | `lib/ai/org-context.ts`, `lib/ai/wrap-untrusted-content.ts` |
| **Crons** | `apps/web/vercel.json`, `lib/integrations/cron-auth.ts` |

### Qué NO hacer

- ❌ Crear Client Components innecesarios para data fetching
- ❌ Duplicar lógica de `resolvePostAnalytics` o `zernioFetchJson`
- ❌ Guardar en DB datos que deben ser live (comentarios Zernio, ads)
- ❌ Usar emojis como iconos en JSX
- ❌ Leer secrets de integraciones con `createClient()` (RLS bloqueado)
- ❌ Hardcodear URLs de Zernio sin `ZERNIO_API_BASE`
- ❌ Modificar `git config` o hacer force push a `main`
- ❌ Pushear directamente a `main` — siempre via PR + Squash and merge
- ❌ Commitear sin que el usuario lo pida
- ❌ Crear PR sin que el usuario lo pida
- ❌ Agregar `MarketingSubnav` ni subnavs horizontales por módulo — la navegación de la plataforma es **la notch nav** (`components/navigation/notch-nav/`), barra superior de tres islas, y deriva todos sus items de `lib/navigation/sidebar-modules.ts`. Para agregar un módulo se toca ese config, nunca la barra. El sidebar de plataforma se eliminó el 2026-08-30; `components/navigation/sidebar-*` que quedan son piezas compartidas con el sidebar de **super-admin** y el drawer mobile
- ❌ Pasar `profileId` JSON completo a Zernio — usar `extractProfileId()`

### Checklist pre-PR

- [ ] `tsc --noEmit` pasa en `apps/web`
- [ ] `pnpm test` pasa (y la lógica nueva de `lib/` tiene tests)
- [ ] Server Actions usan `requireOrganizationId()`
- [ ] Rutas nuevas en `paths.ts` + sidebar si aplica
- [ ] Sin secrets en código ni logs
- [ ] Patrones existentes respetados (naming, iconos, empty states)

---

*Este documento debe actualizarse cuando cambien integraciones críticas, schema de `content_pieces`, o el flujo del agente.*
