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

#### YouTube — Métricas nativas

**Métricas sincronizadas automáticamente:**
- Vistas, likes, comentarios (desde YouTube Data API v3)
- Duración del video en segundos
- Thumbnail, tags, fecha de publicación
- Todo se guarda en `content_assets.platform_metadata.youtube`

**Retención hasta el CTA:**
- El founder marca el minuto del CTA en cada video desde Marketing → Contenido → detalle del video
- OTC muestra el % estimado de audiencia que llega hasta ese momento
- Estimación basada en curva típica de retención de YouTube
- TODO Phase 2: retención real desde YouTube Analytics API (requiere scope `yt-analytics.readonly` + reportes de audiencia)

**Métricas de Instagram (separadas de YouTube):**
- Alcance, engagement rate, saves, shares
- No se mezclan con métricas de YouTube en la UI

**Comparación entre videos:**
- Disponible cuando hay 3+ videos con `cta_minute` configurado
- Tabla ordenada por retención hasta el CTA
- Correlación retención → leads atribuidos via UTMs

### Instagram

- **Auth:** Meta OAuth. Env: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_REDIRECT_URI`.
- **Cron:** `/api/integrations/instagram/sync` cada hora.
- **Datos:** posts → `content_assets` (`platform = 'instagram'`).
- **RLS:** `instagram_integrations` sin policies para cliente — solo **service role** lee tokens.
- **Limitación Meta:** app en modo desarrollo / permisos limitados según configuración en Meta for Developers (ver sección Limitaciones).

#### Instagram DMs directos (sin ManyChat)

- **Permiso Meta requerido:** `instagram_business_manage_messages` (+ `instagram_business_basic`).
- **Webhook:** `GET/POST /api/webhooks/instagram/messages` — verificación con `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`.
- **Flujo:** Meta envía evento → `processInstagramMessage` → `instagram_messages` + `instagram_threads` + `conversations` (source=`instagram`).
- **Inbox:** mismas conversaciones en `/sales/inbox` con badge **IG DM** (vs **ManyChat**).
- **Scoring IA:** cada 5 mensajes inbound (mín. 3), igual que ManyChat.

#### Configurar webhook de Instagram DMs en Meta

1. developers.facebook.com → tu app → Webhooks
2. Agregar webhook de Instagram
3. Callback URL: `https://www.optimizatucontrol.com/api/webhooks/instagram/messages`
4. Verify Token: `otc_instagram_webhook_2024` (o el valor de `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`)
5. Suscribir al campo: `messages`
6. Guardar y verificar

**Casos de uso Meta (Development):** agregar "Mensajería de Instagram" en la app Optimiza Tu Control antes de testear con cuenta evaluador.

**Migración:** `20260617200000_instagram_messages.sql` — tablas `instagram_messages`, `instagram_threads` y columna `conversations.source`.

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

### Model Routing — Haiku vs Sonnet

**Router central:** `lib/ai/anthropic.ts` → `getModelForTask(task)`

**Tareas → Modelo:**
- conversation_scoring → Haiku (scoring ManyChat)
- content_labeling → Haiku (etiquetado de contenido)
- data_extraction → Haiku (forms, insights simples)
- agent_simple → Haiku (preguntas cortas al Agente)
- call_analysis → Sonnet (análisis profundo Fathom)
- weekly_report → Sonnet (reporte semanal)
- sop_generation → Sonnet (generación de SOPs)
- agent_complex → Sonnet (preguntas complejas al Agente)
- product_extraction → Sonnet (extracción contexto RAG)
- sales_analysis → Sonnet (análisis de ventas)

**Agente de negocio:**
- Detecta complejidad automáticamente con `detectAgentComplexity()`
- Preguntas cortas (<100 chars, sin RAG) → Haiku
- Preguntas complejas, con RAG, o >200 chars → Sonnet

**Fallback:** si no se especifica task ni model → Haiku por defecto

**Override manual:** pasar `model` explícito en lugar de `task`
para casos especiales que necesiten un modelo específico.

**Costos estimados por tarea:**
- Haiku: ~$0.001-0.003 por request
- Sonnet: ~$0.01-0.05 por request

**Super Admin → AI Costs:**
Tabla de uso por modelo con requests, tokens y costo real
calculado desde `token_usage` en DB.

### Prompt Caching — Contexto de organización

**Qué se cachea:** el contexto estático de la org (SOPs activos, avatar
principal, productos, frameworks de ventas, guión de ventas).

**Ahorro estimado:** 90% menos costo en tokens de input para el contexto
cacheado. El cache dura 5 minutos en Claude y se renueva con cada uso.

**Cache en memoria (OTC):** 10 minutos. Evita consultar DB en cada llamada.
Se invalida automáticamente cuando cambia:
- Un SOP (crear/actualizar)
- El avatar principal
- Un producto
- Un framework de ventas
- La API key de Claude (BYOK)

**Pipelines con caching activo:**
- Fathom deep analysis → org context cacheado
- ManyChat scoring → org context cacheado
- SOP generation → org context cacheado
- Weekly report → org context cacheado
- Agente → org context cacheado + RAG dinámico sin cachear

**Tracking de costos con cache:**
- cache_read_input_tokens → 10% del precio normal (90% descuento)
- cache_creation_input_tokens → 125% del precio normal (prima por crear cache)
- Ambos campos se guardan en token_usage para auditoría real de costos

**Migración requerida:**
20260627200000_token_usage_cache_tokens.sql
→ columnas cache_read_input_tokens y cache_creation_input_tokens en token_usage

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

### Reporte semanal ejecutivo

- **Modelo:** `claude-sonnet-4-6`, feature `weekly_report`.
- **Input:** filas de `weekly_inputs` de la semana + métricas de `conversations` (activas, hot/warm).
- **Output:** `weekly_reports` — `executive_summary`, `risks`, `bottlenecks`, `recommendations`.
- **Trigger:** manual desde `/operations/weekly-inputs` (`generateWeeklyReportAction`).
- **Ver también:** sección Operaciones en Métricas y Datos.

### BYOK — API key propia de Claude

- **Dónde configurar:** Settings → tab "IA" → campo API key de Claude.
- **Formato válido:** la key debe empezar con `sk-ant-`.
- **Validación automática:** al guardar, OTC hace una llamada de prueba a Anthropic para verificar que la key es válida y tiene créditos.
- **Routing automático:** todos los pipelines de IA (análisis de llamadas, scoring de conversaciones, reportes semanales, SOPs, agente) usan automáticamente la key del cliente si está configurada.
- **Fallback:** si la key del cliente falla o no está configurada, OTC usa la `ANTHROPIC_API_KEY` global como fallback.
- **Cache:** la key se cachea en memoria por 5 minutos para no consultar DB en cada llamada de IA. Si el cliente cambia su key, el cache se invalida automáticamente.
- **Seguridad:** la key se guarda en texto plano en DB por ahora. TODO Phase 2: encriptar con Supabase Vault o KMS.
- **Preview seguro:** en la UI solo se muestran los últimos 8 caracteres de la key (`sk-ant-...XXXXXXXX`).
- **Recomendación para clientes:** el plan de $100/mes de Claude incluye suficiente capacidad de API para todo el uso de OTC. Es la opción recomendada para reducir costos del software.
- **Vista Super Admin:** en `/super-admin/costs` aparece columna "Fuente IA": BYOK ✓ (verde) vs OTC Key (gris) por organización.
- **Migración:** `20260615400000_byok_claude.sql` — columnas en `organizations` + vista `organization_claude_status`.

---

## 📊 MÉTRICAS Y DATOS

### Dashboard (Panel General)

- **Con Supabase:** métricas numéricas derivadas de clientes, conversaciones, closing y finanzas (`deriveDashboardData`).
- **Sin Supabase:** 100% `mocks/dashboard.ts`.
- **Churn:** valor `"—"` si no hay cálculo real.
- **Narrativa / riesgos ops:** parcialmente heurístico; no conectado a workboard ni inputs semanales reales.
- **Reporte semanal (con Supabase):** resumen ejecutivo, riesgos y recomendaciones desde `weekly_reports` si `status === 'ready'`; si no hay reporte → CTA a `/operations/weekly-inputs`.

### Operaciones

#### Weekly Inputs y Reportes

- **Frecuencia:** un input por departamento por semana por usuario. Varios miembros del equipo pueden aportar inputs distintos en el mismo departamento.
- **Departamentos:** ventas, delivery, operaciones, marketing, founder.
- **Mínimo para generar reporte:** 2 departamentos completados.
- **Modelo usado:** claude-sonnet-4-6 para generación del reporte ejecutivo.
- **Contexto adicional:** el reporte incluye automáticamente métricas de ventas de la semana (conversaciones activas, leads hot/warm) si existen en DB.
- **Conexión con Dashboard:** el Panel General lee el último reporte generado. Si no hay reporte de la semana → muestra CTA a `/operations/weekly-inputs`.
- **Semana:** se calcula como lunes a domingo. El sistema usa siempre el lunes de la semana actual como clave única del reporte.
- **Estados del reporte:** pending → generating → ready | error.
- **Rutas:** inputs en `/operations/weekly-inputs`; overview en `/operations/overview`.
- **Migración:** `20260615300000_weekly_inputs.sql` — tablas `weekly_inputs` y `weekly_reports`.
- **Actions:** `apps/web/app/operations/actions.ts`.

#### Operaciones Overview

- Muestra el reporte real si `status === 'ready'`.
- Si no hay reporte generado → muestra CTA para completar inputs semanales.
- Los riesgos tienen niveles: high (rojo), medium (amarillo), low (verde).
- **Grid de departamentos:** sigue usando métricas mock hasta conectar datos operacionales por área (Phase 2).

#### SOPs — Generación con IA

- **Modelo usado:** claude-sonnet-4-6 para generación de SOPs.
- **Prerequisito:** ANTHROPIC_API_KEY global o BYOK configurado en Settings → IA. Si falta la key → error claro en el formulario de creación.
- **Contexto usado en el prompt:**
  - Nombre e industria de la organización
  - SOPs existentes (hasta 10, para evitar duplicados)
  - Guión de ventas activo si existe en `sales_scripts`
- **Flujo de creación:** idle → generating (10-20 segundos) → preview editable → guardar borrador o publicar
- **Versionado:**
  - Cada vez que se edita el contenido de un SOP → se guarda una versión nueva automáticamente en `sop_versions`.
  - El historial de versiones es accesible desde la biblioteca de SOPs.
- **Detección automática de oportunidades:**
  - El sistema analiza tareas completadas en `workboard_tasks` de los últimos 30 días.
  - Si una tarea se repite 3+ veces → aparece sugerencia de crear SOP en la biblioteca.
  - El botón "Crear SOP" pre-llena el formulario con el título y departamento.
- **Fallback:**
  - Si la biblioteca de SOPs está vacía → muestra `mocks/sops.ts` como placeholder.
  - Los mocks desaparecen automáticamente cuando hay SOPs reales en DB.
- **Badge IA:**
  - Los SOPs generados por Claude muestran badge "IA" en la biblioteca y en el detalle.
  - Se registra el modelo usado (`ai_model`) para auditoría.
- **Detalle:** el contenido se renderiza como markdown (`react-markdown` + clases `prose`).
- **Migración:** `20260616300000_sops_enhanced.sql` — campos IA + tabla `sop_versions`.
- **Actions:** `apps/web/app/sops/actions.ts`.

#### Equipo — Gestión de miembros

**Invitación de miembros:**
- El founder/admin invita por email desde Equipo → "Invitar miembro".
- Se crea un registro en `team_invitations` con token único y vencimiento de 7 días.
- Si `RESEND_API_KEY` está configurada → se envía email automático con link de invitación.
- Sin Resend → la invitación se crea igual en DB; el founder puede copiar el link manualmente.
- Link de invitación: `/invite?token=XXXX`

**Flujo de aceptación de invitación:**
- Usuario nuevo → formulario de registro en `/invite?token=XXXX`
- Usuario existente → se une a la org directamente
- Al aceptar → perfil se crea con el `organization_id` de la invitación
- La invitación se marca como 'accepted' automáticamente

**Roles default (se crean automáticamente por org):**
- Founder → acceso total
- Setter → bandeja de ventas y métricas
- Closer → closing y clientes
- Operador → operaciones y workboard
- Viewer → solo lectura de métricas

**Roles custom:**
- El founder/admin puede crear roles con permisos granulares por módulo.
- Permisos por módulo: "full" | "read" | "none"
- Los roles default no se pueden eliminar.

**Desactivar miembros:**
- Los miembros se desactivan (is_active: false), nunca se borran.
- Un miembro desactivado no puede iniciar sesión.
- El founder no puede desactivarse a sí mismo.

**last_login_at:**
- Se actualiza automáticamente en cada request autenticada via middleware.
- Se muestra en la tabla de miembros como "hace X horas/días".

**Prerequisito para emails:**
- RESEND_API_KEY y RESEND_FROM_EMAIL deben estar en Vercel.
- Sin estas variables → invitaciones funcionan pero sin email automático.

### Módulo Producto

**Tablas implementadas:**
- `customer_avatars` — avatares de cliente ideal con dolores, deseos, miedos y objeciones
- `products` — ofertas con precio, tipo, posición en value ladder y avatar objetivo
- `value_ladder` — escalones de la escalera de valor vinculados a productos
- `sales_frameworks` — frameworks y scripts de ventas de la org

**Fallback:**
- Si no hay datos en DB → muestra `mocks/product.ts` + badge "Sin datos configurados"
- El badge desaparece automáticamente cuando hay al menos un avatar o producto real

**Avatar principal:**
- Solo puede haber un avatar marcado como `is_primary = true` por org
- Al crear uno nuevo como primario → los anteriores se desmarcan automáticamente
- El avatar primario es el que se usa en el contexto del Agente de negocio

**Conexión con el Agente:**
- El Agente de negocio incluye automáticamente en su system prompt:
  → Avatar principal (dolor, deseos, objeciones)
  → Productos activos (nombre, tipo, precio)
  → Frameworks de ventas activos
- Cuanto más completo esté el módulo Producto → mejores respuestas del Agente
- TODO Phase 2: mover a RAG con embeddings para contexto más rico

**Recomendación de onboarding:**
- Configurar el módulo Producto es el primer paso después del setup inicial
- El orden recomendado: Avatar principal → Productos → Value ladder → Frameworks

### Workboard — Time Tracking

**Flujo de carga de tiempo:**
- Al mover una tarea a "Hecho" (drag o desde el detalle) → aparece modal
  "¿Cuánto tiempo le dedicaste?" con campos de horas y minutos.
- El usuario puede registrar el tiempo o hacer "Omitir" para completar
  sin registrar.
- Si la tarea tenía tiempo estimado → el modal muestra la diferencia
  (verde si tardó menos, rojo si tardó más).

**Reporte "Tiempo por persona":**
- Carga datos reales desde la vista `workboard_time_by_member`.
- Fallback a mock si no hay tareas completadas con tiempo registrado.
- Muestra: horas totales, top 3 tareas, % estratégico vs operativo,
  costo estimado si el miembro tiene tarifa por hora configurada.

**Costo por tarea:**
- El founder/admin puede configurar la tarifa por hora de cada miembro
  en Equipo → columna "Tarifa / hora" (USD o ARS).
- El reporte calcula automáticamente el costo de cada tarea:
  costo = actual_minutes / 60 * hourly_rate

**Insights de automatización (reglas automáticas):**
- Tarea repetida 3+ veces → sugerencia de crear SOP
- Tarea que consume >30% del tiempo de una persona → sugerencia de delegar
- Estimaciones optimistas (real > 2x estimado) → alerta de planificación
- Estas reglas corren en el cliente sin IA (Phase 2: recomendaciones con Claude)

**Limitación actual:**
- El timer en tiempo real (iniciar/pausar/detener) no está implementado.
  Solo carga manual al completar la tarea. Phase 2.

### Workboard — Sprints

**Flujo de sprints:**
- Solo puede haber UN sprint activo por organización a la vez.
- Al crear un nuevo sprint → el sprint activo anterior se marca
  automáticamente como "completado".
- Las tareas nuevas se asignan al sprint activo por defecto.

**Filtros del Kanban:**
- Se puede filtrar por sprint (dropdown en el header).
- Se puede filtrar por área (Ventas/Marketing/Ops/Delivery/Producto).
- Ambos filtros son combinables.
- Sin sprint seleccionado → se muestran todas las tareas.

**Completion rate:**
- Se recalcula automáticamente cada vez que una tarea se mueve
  o se completa dentro del sprint.
- Fórmula: tareas en "done" / total tareas del sprint * 100.

**Retrospectiva:**
- Al completarse un sprint → disponible en "Ver retrospectiva"
  con completion rate, objetivo, tiempo total registrado y detalle.

**Asignación de tareas a sprint:**
- Desde el detalle de cada tarea → campo "Sprint" con selector.
- Se puede reasignar una tarea a cualquier sprint existente.

### Ventas

- **Inbox:** `conversations` reales (ManyChat / Instagram); sin datos → empty state con CTA a integraciones.
- **Métricas KPIs:** derivadas de conversaciones + closing (`deriveSalesMetrics`).
- **Objeciones frecuentes:** desde `call_analyses` y `conversations.ai_detected_objections`; fallback mock. Ver sección **Objeciones frecuentes — Datos reales** más abajo.
- **Ranking equipo / evolución closer:** `call_analyses` o mocks (`mockTeamRanking`, `mockCloserEvolution`).
- **Lead journey en inbox:** datos reales cruzando UTMs, conversaciones, `closing_calls` y `clients`. Ver sección **Lead Journey** más abajo.
- **`followUpDelayHours`:** hardcoded `4.2` en derive-sales-metrics.

### Lead Journey — Recorrido real del lead

**Fuentes de datos cruzadas:**
- `conversations.utm_link_id` → video de YouTube de origen
- `conversations.source_video_title` → título del video
- `conversations.source` → `instagram` | `manychat` | `manual`
- `closing_calls` → booking asociado (por `conversation_id` o nombre del lead)
- `clients` → venta cerrada (por `closing_call_id` o nombre del lead)
- `utm_booking_attributions` → atribución directa de booking a UTM

**Pasos del journey:**
1. Contenido → vio un video de YouTube (si hay UTM)
2. DM → primer mensaje del lead en la conversación
3. Booking → llamada agendada (cruzado por `conversation_id` o nombre)
4. Venta → cliente creado (cruzado por `closing_call_id` o nombre)

**Limitación actual:**
- El cruce por nombre del lead puede fallar si hay variaciones en el nombre (ej: "Juan" vs "Juan Pérez")
- Phase 2: cruzar por email cuando esté disponible en el formulario

**Empty state:**
- Si no hay UTM vinculado → no se muestra el paso de contenido
- Para que el journey esté completo el founder debe:
  1. Crear UTMs en Marketing → UTMs
  2. Pegar los links en sus videos de YouTube
  3. Los leads que entren por esos links tendrán journey completo

### Objeciones frecuentes — Datos reales

**Fuentes en orden de prioridad:**
1. `call_analyses.objections` — desde análisis profundo de Fathom
2. `conversations.ai_detected_objections` — desde scoring de ManyChat/Instagram
3. Mock data — fallback si no hay datos reales

**Tendencias:**
- Se comparan los últimos 30 días vs los 30 días anteriores
- Alerta automática si una categoría sube ≥40%
- Las alertas aparecen en Ventas → Métricas y en Dashboard → Riesgos

**Categorías:**
- Closing (rojo): dinero, tiempo, decisión
- Setting (amarillo): proceso de agendamiento
- Marketing (azul): posicionamiento, propuesta de valor

### Marketing

- **Contenido:** `content_assets` real; si lista vacía → fallback `mockMarketingContentAssets`.
- **Detalle contenido `[id]`:** mock `marketing-insights`.
- **Overview charts / funnel / heatmap:** mock en `mocks/marketing.ts` aunque haya assets reales.
- **Conexión ventas:** 100% mock.
- **UTMs:** `utm_links` real; leads en sheet parcialmente mock para links `utm-mock-*`.
- **Landing UTMs:** requiere `NEXT_PUBLIC_UTM_ORGANIZATION_ID` en env de producción.

#### UTMs — Atribución completa

**Loop completo implementado:**
```
Video YouTube → link UTM → lead capturado → booking Calendly → cliente creado → $ atribuido
```

**Cómo funciona la atribución de booking:**
- Cuando Calendly registra un nuevo booking, el sistema busca automáticamente
  si el email o nombre del lead coincide con una captura de UTM previa.
- Si hay match → se registra en `utm_booking_attributions` y se incrementa
  el contador `bookings_attributed` en `utm_links`.

**Cómo funciona la atribución de venta:**
- Cuando se crea un cliente desde un closing call, el sistema busca
  la atribución de booking correspondiente y la conecta con la venta.
- Si no hay atribución de booking → intenta por email/nombre del cliente.
- Se registra en `utm_sale_attributions` y se incrementa `sales_attributed`
  y `revenue_attributed` en `utm_links`.

**Idempotencia:**
- Índices únicos en `utm_booking_attributions.closing_call_id` y
  `utm_sale_attributions.client_id` evitan duplicados si el pipeline
  se ejecuta más de una vez.

**Vista funnel en Marketing → UTMs:**
- Click en "Ver leads" de cualquier UTM → sheet con funnel completo:
  Leads capturados → Bookings → Ventas → Revenue total → badge ROI.

**Origen del lead en inbox:**
- Si un lead de ManyChat llegó via UTM de YouTube, el panel de análisis
  de la conversación muestra "Origen: [nombre del video]".

**Limitación actual:**
- La atribución funciona por coincidencia de email o nombre del lead.
  Si el lead usa un email distinto en Calendly al que usó en la landing,
  la atribución puede no conectarse automáticamente.

### Finanzas

- **Gastos / suscripciones / compensación:** tablas Supabase; sin datos → empty state con CTA a `/finance/expenses`.
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
- **Con Supabase pero tablas vacías:** empty states con CTAs para conectar integraciones o configurar datos. No hay inserción automática de mocks en producción.

### Seeds automáticos — ELIMINADOS en producción

**Comportamiento anterior (eliminado):**
- Si `conversations` estaba vacía → se insertaban mocks automáticamente
- Si `closing_calls` estaba vacía → se insertaban mocks automáticamente
- Si finanzas estaban vacías → se insertaban datos demo

**Comportamiento actual:**
- Tablas vacías → empty state con CTA para conectar integración
- No hay inserción automática de datos demo en producción
- Los mocks solo se usan cuando Supabase NO está configurado (modo demo sin credenciales)

**Empty states implementados:**
- Inbox ventas → "Conectá ManyChat o Instagram"
- Closing → "Conectá Calendly"
- Finanzas → "Configurá tus gastos y plataformas"

### Settings — Persistencia completa

**Campos que ahora persisten en DB:**
- `organizations.industry`
- `organizations.timezone`
- `organizations.currency`
- `organizations.language`
- `notification_preferences` (tabla por usuario/org)

**Preferencias de notificaciones:**
- Se crean automáticamente con defaults al primer acceso
- Se guardan automáticamente al cambiar cualquier toggle
- Separadas por usuario (cada miembro tiene sus propias preferencias)

**Migración requerida:**
`20260617400000_settings_complete.sql`

### Fallbacks a mock data (solo UI / sin Supabase)

- Ventas: objeciones, ranking calls, evolución closer, lead journey.
- Clientes: `aiInsights` en detalle siempre etiquetados mock; `linked_calls.analysis` solo si pipeline Fathom profundo corrió o JSON manual.
- Producto, Equipo, Inteligencia, Reportes ejecutivos: 100% mock.
- **Operaciones overview:** reporte ejecutivo real si hay `weekly_reports`; team inputs aún mock.
- Super-admin: datos reales vía service role + `requireSuperAdmin()` (ver sección **Super Admin — Datos reales**).
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
| **Lanzamientos** | CRUD real con métricas diarias, tareas vinculadas y post-mortem IA |
| **Equipo** | Miembros mock; roles custom no persisten |
| **Base de conocimiento** | Documentos mock; upload real no implementado |
| **Operaciones** | Team inputs mock; weekly inputs y reporte ejecutivo reales con migración `20260615300000` |
| **Inteligencia / Reportes ejecutivos** | 100% mock |
| **Clientes `aiInsights`** | Siempre mock en UI |
| **Super-admin Holding** | Portfolio real agregado desde organizaciones activas |

### Super Admin — Datos reales

**Acceso:** solo usuarios en la tabla `super_admin_users` (por email).
Verificación via `requireSuperAdmin()` en cada action y layout guard en `/super-admin/*`.

**Secciones con datos reales:**
- Organizaciones: lista completa con estado, BYOK, miembros, industria
- Usuarios: todos los profiles con última sesión (`last_login_at` / auth)
- AI Costs: desde `token_usage` (últimos 30 días)
  → Por modelo (Haiku vs Sonnet)
  → Por organización
  → Total gastado en el período
- Client Health: score 0-100 por org basado en:
  → Conversaciones activas (25 pts)
  → Calls de Fathom procesadas (25 pts)
  → SOPs activos (25 pts)
  → Weekly inputs enviados (25 pts)
- Holding: portfolio agregado de orgs activas (MRR, usuarios, integraciones, health)

**Health scores:**
- 🟢 Healthy (75-100): org usando el software activamente
- 🟡 Warning (50-74): uso parcial
- 🔴 Critical (0-49): sin actividad o recién configurada

**Agregar super admin:**
Insertar email en tabla `super_admin_users` via Supabase SQL Editor:
```sql
INSERT INTO super_admin_users (email, role) VALUES ('email@ejemplo.com', 'admin');
```

### Módulo Lanzamientos

**Tablas:**
- `launches` — lanzamientos con objetivos, fechas, revenue real y post-mortem
- `launch_metrics` — métricas diarias registradas manualmente
- `workboard_tasks.launch_id` — tareas vinculadas a un lanzamiento

**Flujo recomendado:**
1. Crear lanzamiento con fecha, objetivo de revenue y clientes
2. Vincular producto desde el módulo Producto
3. Crear tareas en el workboard con el lanzamiento seleccionado
4. Durante el lanzamiento → registrar métricas diarias (revenue, clientes)
5. Al completar → cambiar status a "completado" → generar post-mortem

**Post-mortem con IA:**
- Solo disponible cuando status === `completed`
- Modelo: claude-sonnet-4-6 (task: `sales_analysis`)
- Usa prompt caching con contexto de la org
- Analiza: revenue vs objetivo, clientes vs objetivo, tareas completadas
- Genera: resumen, qué funcionó, qué no, aprendizajes, recomendaciones, rating 1-10

**Vinculación con workboard:**
- Las tareas pueden pertenecer a un lanzamiento
- El detalle del lanzamiento muestra todas sus tareas
- Filtro por lanzamiento disponible en el Kanban

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
- Settings → tab IA → API key Claude: ✅ implementado con BYOK completo (ver sección BYOK).
- Resend: remitente debe ser dominio verificado (no `@*.vercel.app` en prod).
- Las API keys de integraciones (Fathom, ManyChat, etc.) se guardan en tablas `*_integrations` con RLS por org, acceso solo via service role.
- La `ANTHROPIC_API_KEY` global nunca se expone al cliente — solo se usa como fallback cuando el cliente no tiene BYOK configurado.
- `CRON_SECRET` protege todos los endpoints de re-análisis y crons. Nunca exponerlo en el frontend.
- **BYOK Claude:** persistencia en `organizations.claude_api_key_encrypted` (guardado/lectura vía service role); ver sección BYOK en Pipelines de IA.

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
- `weekly_inputs` / `weekly_reports`: requiere migración `20260615300000_weekly_inputs.sql`.
- BYOK Claude: requiere migración `20260615400000_byok_claude.sql`.

---

## Referencias rápidas

- Estado completo del proyecto: `PHASE2_PLAN.md`
- Variables de entorno: `.env.example`, `apps/discord-bot/.env.example`
- Rutas plataforma: `apps/web/routes/paths.ts`
- IDs mock demo (solo sin Supabase o seeds): clientes `client1`, `client2`, `client3`

---

*Actualizar este documento cuando cambien umbrales, crons, integraciones o pipelines de IA.*
