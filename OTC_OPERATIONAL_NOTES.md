# OTC — Notas Operacionales

Documento de referencia para el equipo y para onboarding de clientes.  
**Última actualización:** 2026-05-28

Fuentes: comentarios en código, migraciones SQL, `.env.example`, `PHASE2_PLAN.md` y comportamiento verificado en el repositorio `ai-coo-platform`.

---

## 🔗 INTEGRACIONES

### Fathom

- **Auth:** API key por organización (no OAuth). Se guarda en `fathom_integrations` vía `POST /api/integrations/fathom/connect`.
- **Ingesta:** webhook `POST /api/integrations/fathom/webhook` (firma HMAC con `webhook_secret` por org o `FATHOM_WEBHOOK_SECRET` global) + sync horario desde API (`/api/integrations/fathom/sync`).
- **Delay de procesamiento:** las calls entrantes se insertan con `status: pending` y `processed_after = now + 30 minutos`. El cron `/api/integrations/fathom/process` (cada 10 min) solo procesa cuando venció ese delay — da tiempo a que llegue el transcript completo.
- **Pipeline básico:** `analyzeFathomTranscript` (Sonnet 4.5) → `fathom_calls` + `client_timeline_entries` + `client_problems`.
- **Asociación a cliente:** matching fuzzy por título de la call (`associateCallWithClients`). Umbrales:
  - Auto-asociar si un candidato con confidence ≥ 0.8
  - `pending_review` si hay ambigüedad o confidence baja
  - Procesar timeline solo si `association_confidence ≥ 0.75` o link manual
- **Calls sin match:** quedan en `/clients/pending-calls` para revisión humana.
- **Re-análisis profundo manual:** `POST /api/integrations/fathom/reanalyze` con `Authorization: Bearer CRON_SECRET`.
- **Cron auth:** si `CRON_SECRET` no está definido, los endpoints cron **no exigen** auth (útil en dev; en producción configurar siempre).

#### Fathom — Análisis profundo de llamadas

- **Requisito mínimo de duración:** el análisis profundo con IA solo se activa para llamadas con transcript Y duración ≥ 10 minutos. Llamadas más cortas reciben únicamente el análisis básico (timeline, resumen, next steps).
- **Modelo usado:** claude-sonnet-4-6 (análisis complejo de ventas)
- **Latencia:** el análisis profundo corre en background después del básico, sin bloquear el proceso principal. Puede tardar 30-60 segundos adicionales.
- **Re-análisis manual:**
  `POST /api/integrations/fathom/reanalyze` con Bearer CRON_SECRET  
  Body: `{ "organizationId": "uuid", "fathomCallId": "opcional" }`  
  Delay de 2s entre calls para respetar rate limits de Anthropic.
- **Guión de ventas:** si la org no tiene un guión configurado en sales_scripts, se usa un guión default de 5 secciones (apertura, diagnóstico, presentación, objeciones, CTA). Configurar el guión propio en Settings mejora la precisión.
- **Cruce con formulario:** si existe un closing_call con el mismo nombre del lead, se incluyen las form_answers en el análisis para detectar gaps calificación.

### ManyChat

- **Auth:** API key + `webhook_token` único por org (no OAuth).
- **Webhook URL:** `{NEXT_PUBLIC_APP_URL}/api/integrations/manychat/webhook/{webhook_token}` — debe configurarse en ManyChat como External Request.
- **Datos:** mensajes → tabla `conversations` con `external_ref = manychat:{subscriberId}`.
- **UTM ManyChat:** migración `20260613200000_utm_manychat.sql` — atribución `manychat_ref` en conversaciones.
- **Seed demo:** si `conversations` está vacía **y** no hay integración ManyChat conectada, se insertan `mockConversations` automáticamente al listar inbox.

#### ManyChat — Scoring de conversaciones

- **Frecuencia de análisis:** el scoring se dispara automáticamente cada 5 mensajes nuevos, con un mínimo de 3 mensajes para tener contexto suficiente.
- **Modelo usado:** claude-haiku-4-5-20251001 (rápido y económico para scoring)
- **Sin ANTHROPIC_API_KEY:** el scoring se omite silenciosamente sin romper el flujo.
- **Re-análisis manual:**
  `POST /api/integrations/manychat/reanalyze` con Bearer CRON_SECRET  
  Body: `{ "organizationId": "uuid" }`  
  Máximo 20 conversaciones por llamada, delay 1s entre cada una.
- **Atribución UTM:** si el lead llegó via link de ManyChat con ref parameter (ej: `ig.me/m/usuario?ref=yt-video-x`), se cruza automáticamente con utm_links y se registra el video de YouTube de origen en la conversación.
- **Cruce con formulario:** si el lead tiene un closing_call con form_answers, se incluye en el prompt para enriquecer el scoring.

### Calendly

- **Auth:** OAuth 2 + PKCE. Env: `CALENDLY_CLIENT_ID`, `CALENDLY_CLIENT_SECRET`, `CALENDLY_REDIRECT_URI`.
- **Webhooks:** HMAC con `webhook_signing_key`. Si el plan de Calendly no permite webhooks, se guarda `__no_webhook__` y `webhookEnabled: false` — hay que usar sync manual o cron.
- **Cron:** `GET/POST /api/cron/calendly-sync` cada hora.
- **Datos:** eventos → `closing_calls` (incluye `form_answers` de preguntas pre-agenda).
- **Sync manual:** botón en tarjeta Integraciones + acciones en `app/calendly/actions.ts`.

### YouTube

- **Auth:** Google OAuth (misma app que Google Forms). Env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI`.
- **Sync:** inicial en callback OAuth; **no hay cron** dedicado a YouTube.
- **Datos:** canal + videos → `content_assets` (`platform = 'youtube'`).
- **Google OAuth en modo Prueba:** cada email debe estar en Test users del consent screen (documentado en `.env.example`).
- **Tokens unificados:** al conectar YouTube también se persiste fila en `google_forms_integrations`.

### Instagram

- **Auth:** Meta OAuth. Env: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_REDIRECT_URI`.
- **Cron:** `/api/integrations/instagram/sync` cada hora.
- **Datos:** posts → `content_assets` (`platform = 'instagram'`).
- **RLS:** `instagram_integrations` sin policies para cliente — solo **service role** lee tokens.
- **Limitación Meta:** app en modo desarrollo / permisos limitados según configuración en Meta for Developers (ver sección Limitaciones).

### Stripe

- **Auth:** Stripe Connect OAuth, scope `read_only`.
- **Datos:** balance y transacciones vía API en tiempo real en Finanzas — **no se persisten** transacciones en DB.
- **Sin webhooks Stripe** en la versión actual.

### Typeform / Google Forms

- **Auth:** OAuth independiente (Typeform) / Google OAuth unificado (Forms + YouTube).
- **Cron:** sync horario (`/api/integrations/typeform/sync`, `/api/integrations/google-forms/sync`).
- **Datos:** `forms` + `form_responses`; scoring IA con Haiku al sincronizar.
- **Scoring automático:** cada respuesta recibida es analizada con Claude Haiku y genera un `lead_score` (0-100) y un campo `qualification` guardado en `form_responses`.
- **UI:** listado y detalle en `/marketing/forms` — vacío = empty state real (sin seed mock).

### Discord

- **Auth:** OAuth del bot + `DISCORD_BOT_TOKEN` para registrar el guild.
- **Proceso separado:** `apps/discord-bot` debe estar desplegado y conectado al servidor del cliente.
- **Bot escribe directo** en Supabase (`discord_messages`, `discord_client_links`, etc.) con service role.
- **APIs internas:** `OTC_API_URL` + `OTC_WEBHOOK_SECRET` para `pending-link` y `testimonial`.
- **`POST /api/discord/message`:** stub (`{ ok: true }`) — no persiste mensajes; la ingestión real es vía el bot.

---

## 🤖 PIPELINES DE IA

### Análisis profundo de llamadas

- **Requisito mínimo de duración:** el análisis profundo con IA solo se activa para llamadas con **transcript** Y duración **≥ 10 minutos**. Llamadas más cortas reciben únicamente el análisis básico (timeline, resumen, next steps).
- **Modelo usado:** `claude-sonnet-4-6` (alias de producto; API actual: Sonnet 4.5) — feature `deep_call_analysis`.
- **Guión:** RPC `get_active_sales_script(org_id)`; si la org no tiene `sales_scripts` activo, usa guión default de 5 secciones (apertura, diagnóstico, presentación, objeciones, cta).
- **Persistencia:** `call_analyses` (upsert por `fathom_call_id`) + actualización de `clients.linked_calls[].analysis` en camelCase.
- **Contexto extra:** intenta enlazar `form_answers` de `closing_calls` por nombre del lead (match `ilike`).
- **Latencia:** el análisis profundo corre en **background** (`void generateDeepCallAnalysis(...)`) después del básico, sin bloquear `finalizeAssociatedCall`. Puede tardar 30–60 segundos adicionales.
- **Re-análisis manual:** `POST /api/integrations/fathom/reanalyze` con body `{ organizationId, fathomCallId? }` y header `Authorization: Bearer CRON_SECRET`. Delay de 2 s entre calls para rate limits.
- **Sin API key:** si `ANTHROPIC_API_KEY` no está configurada, `callClaudeJson` retorna `null` y no se guarda análisis profundo.
- **Pendiente Phase 2:** cola BullMQ (`fathom-analysis`), prompt caching del guión, modelo Haiku para tagging ligero.

### Análisis básico Fathom (timeline)

- **Modelo:** `claude-sonnet-4-5`, feature `fathom_call_analysis`.
- **Input:** transcript (máx. 120 000 chars) + resumen de hasta 3 calls anteriores del mismo cliente.
- **Output:** `situation_summary`, `next_steps`, `problems_detected`, `progress_indicator`, `call_type`.

### Scoring de formularios

- **Lead scoring por respuesta:** `claude-haiku-4-5`, feature `form_lead_scoring`.
- **Scoring automático:** cada respuesta recibida es analizada con Claude Haiku y genera un `lead_score` (0-100) y un campo `qualification` guardado en `form_responses`.
- **Análisis agregado de formulario:** `claude-sonnet-4-5` — patrones, drop-off, calificación.
- **Se ejecuta** en sync de Typeform/Google Forms (cron horario o manual).

### Agente de negocio

- **Requiere:** migraciones agente + `ANTHROPIC_API_KEY` + Supabase configurado.
- **Sin ANTHROPIC_API_KEY:** el agente responde con un mensaje mock fijo. Requiere la key configurada en Vercel para funcionar.
- **Sin API key:** respuesta fija mock (`MOCK_REPLY` en `agent/actions.ts`).
- **Títulos de conversación:** Haiku, máx. 5 palabras.
- **Respuestas:** Sonnet 4.5, feature `agent_chat`.
- **Contexto:** nombre org, etapa de negocio, mensajes recientes de otras conversaciones (últimos 20), nombre de proyecto.
- **Acciones parseadas:** p. ej. `CREATE_SOP` con rate limit por org.
- **Limitación:** sin RAG/SOPs reales en contexto aún (Phase 2).

### Etiquetado de contenido

- **Modelo:** `claude-haiku-4-5`, feature `content_labeling`.
- **Categorías:** AUTORIDAD, ATRACCION, NUTRICION, VENTA.
- **Se ejecuta** al sincronizar contenido Instagram/YouTube cuando hay caption/título.

### Distribución marketing (overview)

- **Insight IA** en overview: Haiku vía `distribution-insight.ts` cuando hay assets reales conectados.

### Scoring de conversaciones ManyChat

- **Modelo:** `claude-haiku-4-5`, feature `conversation_scoring`.
- **Trigger:** cada 5 mensajes (mín. 3) en `upsert-conversation.ts` — fire-and-forget.
- **Persistencia:** columnas `ai_*` en `conversations` (migración `20260615200000_conversation_analysis.sql`).
- **Re-análisis:** `POST /api/integrations/manychat/reanalyze` — ver sección ManyChat en Integraciones.

---

## 📊 MÉTRICAS Y DATOS

### Dashboard (Panel General)

- **Con Supabase:** métricas numéricas derivadas de clientes, conversaciones, closing y finanzas (`deriveDashboardData`).
- **Sin Supabase:** 100% `mocks/dashboard.ts`.
- **Churn:** valor `"—"` si no hay cálculo real.
- **Narrativa / riesgos ops:** parcialmente heurístico; no conectado a workboard ni inputs semanales reales.

### Ventas

- **Inbox:** `conversations` reales (ManyChat) o seed mock si tabla vacía sin ManyChat.
- **Métricas KPIs:** derivadas de conversaciones + closing (`deriveSalesMetrics`).
- **Objeciones frecuentes:** desde `call_analyses` últimos 30 días; fallback a `mockFrequentObjections` si vacío.
- **Ranking equipo / evolución closer:** `call_analyses` o mocks (`mockTeamRanking`, `mockCloserEvolution`).
- **Lead journey en inbox:** inline desde `mocks/marketing-insights` (no real).
- **`followUpDelayHours`:** hardcoded `4.2` en derive-sales-metrics.

### Marketing

- **Contenido:** `content_assets` real; si lista vacía → fallback `mockMarketingContentAssets`.
- **Detalle contenido `[id]`:** mock `marketing-insights`.
- **Overview charts / funnel / heatmap:** mock en `mocks/marketing.ts` aunque haya assets reales.
- **Conexión ventas:** 100% mock.
- **UTMs:** `utm_links` real; leads en sheet parcialmente mock para links `utm-mock-*`.
- **Landing UTMs:** requiere `NEXT_PUBLIC_UTM_ORGANIZATION_ID` en env de producción.

### Finanzas

- **Gastos / suscripciones / compensación:** tablas Supabase; **seed desde mocks** si tablas vacías al primer load.
- **Revenue / MRR:** derivado de clientes reales en org.
- **Stripe:** API live en sección Stripe (no mock); no persiste histórico en DB.
- **Sin Supabase:** `mocks/finance.ts` + `mocks/expenses.ts`.

---

## ⚙️ COMPORTAMIENTO DEL SISTEMA

### Modos de operación (con/sin Supabase)

| Condición | Comportamiento |
|-----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` + anon key **ausentes** | `isSupabaseConfigured() === false` → providers cargan mocks; login mock posible |
| Supabase **configurado** | Datos reales por org; RLS con `get_my_organization_id()` |
| Usuario nuevo | `ensureUserBootstrap` crea `organizations` + `profiles` en primer login |
| Onboarding incompleto | `OnboardingGuard` redirige a `/onboarding` |

### Sistema de modos

- **Sin Supabase configurado:** la app opera en modo demo con todos los datos en mock. Útil para development local sin credenciales.
- **Con Supabase pero tablas vacías:** algunas secciones hacen seed automático de datos demo (conversations, closing_calls, finanzas). Esto puede confundir datos reales con demo en producción.
- **Recomendación:** en producción con cliente real, asegurarse de que las tablas tengan al menos un registro real antes de conectar integraciones, para evitar que el seed automático mezcle datos.

### Seeds automáticos (org vacía, producción)

| Tabla / módulo | Condición del seed | Fuente mock |
|----------------|-------------------|-------------|
| `conversations` | Vacía y **sin** ManyChat | `mockConversations` |
| `closing_calls` | Vacía (tras seed conversations) | `mockClosingCalls` |
| Finanzas (gastos, etc.) | Tablas vacías al load | `mocks/expenses.ts`, `mocks/finance.ts` |
| Marketing contenido | Lista vacía en UI | `mockMarketingContentAssets` |

**Importante para onboarding:** una org nueva puede ver **datos demo** hasta que conecte integraciones reales o borre seeds manualmente en Supabase.

### Fallbacks a mock data

- Ventas: objeciones, ranking calls, evolución closer, lead journey.
- Clientes: `aiInsights` en detalle siempre etiquetados mock; `linked_calls.analysis` solo si pipeline Fathom profundo corrió o JSON manual.
- Producto, Equipo, Operaciones overview, Inteligencia, Reportes ejecutivos: 100% mock.
- Super-admin: fallback `mocks/super-admin.ts`; Holding 100% mock.
- Integraciones catálogo: metadatos de `mocks/integrations.ts`; solo 9 proveedores con estado real.

### Crons y sincronización (Vercel)

| Endpoint | Frecuencia |
|----------|------------|
| `/api/integrations/fathom/process` | Cada 10 min (sync API + procesar pending) |
| `/api/integrations/fathom/sync` | Cada hora |
| `/api/integrations/typeform/sync` | Cada hora |
| `/api/integrations/google-forms/sync` | Cada hora |
| `/api/cron/calendly-sync` | Cada hora |
| `/api/integrations/instagram/sync` | Cada hora |

**Auth cron:** `assertCronAuthorized` — si `CRON_SECRET` está set, requiere `Bearer {CRON_SECRET}`; si no está set, permite acceso (riesgo en prod si URL es pública).

### Endpoints de re-análisis (todos requieren Bearer CRON_SECRET)

- `POST /api/integrations/fathom/reanalyze` — re-analizar calls de Fathom
- `POST /api/integrations/manychat/reanalyze` — re-analizar conversaciones ManyChat

---

## 👤 ONBOARDING DE CLIENTES

### Checklist de configuración inicial

1. **Supabase:** proyecto creado; ejecutar migraciones en orden (`supabase/migrations/`).
2. **Vercel / hosting:** variables de `.env.example` copiadas a `apps/web/.env.local` y Production.
3. **Auth:** primer usuario crea org automáticamente; completar wizard en `/onboarding`.
4. **`ANTHROPIC_API_KEY`:** obligatoria para IA (Fathom profundo, agente, forms, contenido).
5. **`CRON_SECRET`:** recomendado en producción para crons y re-análisis Fathom.
6. **`NEXT_PUBLIC_APP_URL`:** URL exacta de producción (OAuth redirects, webhooks ManyChat).
7. **Landing (opcional):** `NEXT_PUBLIC_UTM_ORGANIZATION_ID` = UUID de la org para waitlist/UTM públicos.
8. **Discord (opcional):** desplegar `apps/discord-bot` con `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OTC_WEBHOOK_SECRET`, `OTC_API_URL`.

### Variables de entorno requeridas (mínimo producción)

| Variable | Propósito |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Backend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, crons, integraciones |
| `NEXT_PUBLIC_APP_URL` | OAuth y webhooks |
| `ANTHROPIC_API_KEY` | Pipelines IA |
| `CRON_SECRET` | Protección crons (recomendado) |

Variables por integración: ver `.env.example` (Calendly, Google, Typeform, Fathom, Stripe, Instagram, Discord).

### Orden de conexión de integraciones recomendado

1. **ManyChat** — inbox de ventas en vivo.
2. **Calendly** — closing calls y `form_answers` para análisis Fathom.
3. **Fathom** — calls, timeline, análisis profundo.
4. **Typeform / Google Forms** — calificación de leads.
5. **YouTube / Instagram** — biblioteca de contenido y labeling.
6. **Stripe** — vista financiera en tiempo real.
7. **Discord** — actividad de clientes en comunidad (requiere bot desplegado).

### Primeros pasos después del setup

1. Completar onboarding y configurar `organizations.website_url` en Settings (base UTMs).
2. Conectar integraciones en `/integrations`; verificar conteos en tarjetas.
3. Esperar 30+ min tras primera call Fathom para procesamiento básico; ≥10 min para análisis profundo.
4. Revisar `/clients/pending-calls` y asociar calls ambiguas.
5. Opcional: `POST /api/integrations/fathom/reanalyze` para backfill de análisis profundo.
6. Verificar `/sales/metrics` y ficha de cliente → Llamadas.

---

## ⚠️ LIMITACIONES CONOCIDAS

### Por integración

| Integración | Limitación |
|-------------|------------|
| **Fathom** | Análisis profundo solo ≥10 min; delay 30 min antes de procesar; sin BullMQ async aún |
| **Calendly** | Webhooks pueden no estar disponibles según plan → sync manual/cron |
| **YouTube** | Sin cron; sync solo al conectar OAuth |
| **Stripe** | Solo lectura; sin histórico en DB |
| **Discord** | Requiere proceso bot aparte; API message route es stub |
| **ManyChat** | Scoring solo cada 5 mensajes; sin re-scoring en tiempo real por mensaje individual |

### Por módulo

| Módulo | Limitación |
|--------|------------|
| **Producto** | 100% mock — badge "Mock · Phase 2" |
| **Lanzamientos** | Placeholder "Próximamente" |
| **Equipo** | Miembros mock; roles custom no persisten |
| **Base de conocimiento** | Documentos mock; upload real no implementado |
| **Operaciones** | Overview y team inputs mock; weekly inputs solo estado local |
| **Inteligencia / Reportes ejecutivos** | 100% mock |
| **Clientes `aiInsights`** | Siempre mock en UI |
| **Super-admin Holding** | Mock multi-tenant |

### Por plan de Meta/Instagram

- App Meta debe tener permisos `instagram_basic`, etc., según features usadas.
- En **modo desarrollo**, solo cuentas de prueba / revisores de la app pueden autorizar.
- Tokens en `instagram_integrations` solo accesibles vía **service role** (no desde cliente autenticado).

---

## 🔐 SEGURIDAD

### RLS y aislamiento de datos

- Multi-tenant por `organization_id` en tablas de negocio.
- Función `get_my_organization_id()` — `SECURITY DEFINER`, grant a `authenticated`.
- Políticas típicas: SELECT/INSERT/UPDATE solo filas de la org del usuario.
- **Excepciones sin SELECT cliente:** tokens de integraciones (`fathom_integrations`, `manychat_integrations`, `calendly_integrations`, `youtube_integrations`, `typeform_integrations`, `google_forms_integrations`, `instagram_integrations`, `stripe_integrations`) — lectura/escritura vía **service role** únicamente (migración `20260606100000_security_hardening_rls.sql`).
- **`waitlist_leads`:** policy deny-all para cliente; solo service role inserta.
- **`ai_brain_documents` / `super_admin_users`:** RLS sin policies → solo service role.
- **`token_usage`:** SELECT por org; escritura service role.

### API keys y secrets

- **Nunca** exponer `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, secrets OAuth en el cliente.
- Claves de integración solo en servidor (`createAdminClient`, route handlers).
- Settings UI para API key Claude: **no persiste** aún (Phase 2).
- Resend: remitente debe ser dominio verificado (no `@*.vercel.app` en prod).

### Webhooks y validación

| Webhook | Validación |
|---------|------------|
| Fathom | HMAC SHA-256 + rate limit por IP |
| Calendly | Firma con `webhook_signing_key` |
| ManyChat | Token en path URL (`webhook_token`) |
| Discord → OTC | `Bearer OTC_WEBHOOK_SECRET` |
| Crons / reanalyze | `Bearer CRON_SECRET` (si configurado) |

### Bootstrap y errores comunes

- Error RLS "infinite recursion": ejecutar `20260521200000_fix_rls_recursion.sql`.
- Tabla ausente: ejecutar migraciones o `RUN_ALL_PHASE1.sql` según mensaje en actions.
- `get_active_sales_script`: requiere migración `20260615100000_sales_script_default.sql`.

---

## Referencias rápidas

- Estado completo del proyecto: `PHASE2_PLAN.md`
- Variables de entorno: `.env.example`, `apps/discord-bot/.env.example`
- Rutas plataforma: `apps/web/routes/paths.ts`
- IDs mock demo (solo sin Supabase o seeds): clientes `client1`, `client2`, `client3`

---

*Actualizar este documento cuando cambien umbrales, crons, integraciones o pipelines de IA.*
