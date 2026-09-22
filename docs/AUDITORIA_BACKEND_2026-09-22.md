# Auditoría de backend — 2026-09-22

Punto de partida para quien toma el backend. Dice qué se encontró, qué ya quedó
arreglado en la rama `claude/cool-rubin-ssi5x7`, qué hay que hacer para que los
arreglos lleguen a producción y qué queda abierto, ordenado por prioridad.

**Alcance.** Los 84 route handlers de `apps/web/app/api`, los 95 archivos
`"use server"`, `lib/` (auth, holding, integraciones, IA, colas, crons), las 168
migraciones de `supabase/migrations` y `apps/discord-bot`. Cinco pasadas en
paralelo: rutas de API, server actions y permisos, esquema y RLS, secretos e
integraciones, y confiabilidad.

**Cómo se verificó.** Cada hallazgo se leyó en el código antes de tocarlo. Las
dos migraciones nuevas se probaron aplicando **las 168 migraciones del repo** a un
Postgres 16 local (con pgvector y los roles/default privileges de Supabase
simulados) y corriendo los ataques como `authenticated` antes y después.
No hubo acceso a la base de producción: la cuenta de Supabase conectada a la
sesión no tiene el proyecto de Limitless.

**Estado de la base de código al empezar:** `tsc` limpio, 1.131 tests en verde,
lint sin errores. **Al terminar:** `tsc` limpio, 1.168 tests en verde (37 nuevos),
lint sin errores y `next build` de producción OK.

---

## 1. Antes de mergear: lo que no se aplica solo

✅ **Aplicadas y verificadas en producción el 2026-09-22** (Supabase `OTC`,
`nrzlylzbmsuowzhpdnjl`). Al aplicarlas apareció otro agujero: en producción
cualquier miembro podía editar todas las columnas de `organizations`
(`account_type`, `status`, `enabled_add_ons`, la key de Claude). La segunda
migración también lo cierra. Detalle en `CHANGES.md`.

Las dos migraciones:

| Migración | Qué cierra |
|---|---|
| `20260922100000_profiles_columnas_protegidas.sql` | Un usuario ya no puede cambiarse `organization_id` ni `role` |
| `20260922110000_rpcs_y_policies_entre_organizaciones.sql` | RAG de otra org, RPCs que confiaban en el id recibido, secretos de YouTube/Zernio, grants de `organizations`, upserts rotos |

Antes de aplicarlas, correr `supabase db diff` contra producción: hay deriva
conocida entre el repo y la base real (ver §3, "Base de datos y migraciones"). Pasos concretos en
`docs/PLAN_VERIFICACION.md`, bloque "Auditoría de backend".

🔴 **Unipile queda cerrado hasta configurar el secreto.** El webhook ahora exige
`UNIPILE_WEBHOOK_SECRET` (fail-closed). Si el inbox legacy de Unipile sigue en uso,
setear la variable y re-registrar el webhook con el header `Unipile-Auth`. Si no se
usa (la UI ya es Zernio), no hay que hacer nada.

🟡 **Fathom legacy.** El webhook `/api/integrations/fathom/webhook` (sin token)
ahora rechaza con 409 una firma que sirve para más de una org. Con dos o más orgs
conectadas por esa vía, tienen que pasar a la URL por miembro (`/webhook/[token]`).

---

## 2. Qué se arregló

Un commit por bloque, todos en la rama. Cada uno trae el porqué en el mensaje.

### Crítico

| # | Problema | Arreglo |
|---|---|---|
| C1 | **Cualquier usuario registrado podía hacerse founder de cualquier org.** La policy de update propio en `profiles` no limitaba columnas: `PATCH /rest/v1/profiles` con la anon key y `{"organization_id": "<otra>", "role": "founder"}`. El signup es público y un org id se publica en la landing. Reproducido en la base local. | Trigger `protect_profile_columns` (security invoker): para `authenticated`/`anon` bloquea `id`, `organization_id`, `role`, `is_holding_admin` y la contraseña temporal; un no-founder sólo edita nombre, email y avatar. Probado: 12 casos. |
| C2 | **`search_rag_chunks` devolvía la base de conocimiento de cualquier org** a cualquier usuario logueado (SECURITY DEFINER, recibe `org_id`, no lo verifica). La vista `organization_claude_status` listaba el id de todas las orgs. | Revocada a `anon`/`authenticated` (la app la llama con service role). La vista filtra por la org del usuario. |
| C3 | **Los webhooks de Mercado Pago, Whop, Commas y GHL y las llamadas del bot de Discord nunca llegaban a su handler**: el middleware les respondía 307 a `/login`. Commas no reintenta, así que esos eventos se perdieron. | `/api/webhooks/*` y `/api/discord/*` pasan como públicas (cada handler verifica su firma). La lista sale a `lib/supabase/public-paths.ts` con 21 tests. |

### Alto

- **Holding:** cualquier miembro invitado al holding podía resetear la contraseña
  de los founders del portfolio y entrar a cualquier negocio. Ahora se exige
  founder o `is_holding_admin`.
- **Server actions sin autenticación** que escribían con service role:
  `registerLeadMagnetFromDm`, `attributeLeadMagnetToClient`,
  `getLeadMagnetUrlsForOrg` (salen a `lib/marketing/lead-magnets-internal.ts`),
  `processAiBrainDocument` (deja de ser action), `processFathomQueueAction`
  (eliminada, no tenía callers), ClickUp validate/lists/preview (proxy abierto).
- **RPCs que confiaban en el id recibido:** `get_active_sales_script`,
  `increment_utm_*` (inflaban `revenue_attributed`, incluso en negativo),
  `get_holding_dashboard_stats`, y `create_default_roles` para `anon`.
- **Secretos de integraciones legibles y editables por cualquier miembro:**
  `youtube_integrations` (tokens, API key) y `zernio_integrations` (api_key,
  webhook_secret). Sin policies de miembro; la app ya usaba service role.
- **Webhooks que atribuían a la org equivocada:**
  - Fathom legacy: tomaba la primera org cuyo secreto global validaba.
  - Discord: el `guild_id` salía del query string. Ahora sale del token de OAuth,
    y Discord documenta el del query como "sólo una pista".
  - Unipile: la verificación era opcional y buscaba otro header, así que se podía
    re-vincular la cuenta de otra org.
  - GHL: en la vía de firma de plataforma, `?organizationId=` ganaba sobre el
    `locationId` firmado.
- **Bot de Discord:** `!vincular a%@gmail.com` usaba `ilike` con el texto del
  usuario. Angostando el patrón se podía vincular a un cliente ajeno.
- **Contraseña temporal:** alcanzaba con llamar a la acción para volverla
  permanente sin cambiarla. Ahora el cambio y la marca van juntos en el servidor.

### Medio

- **Rutas de Storage:** se firmaban y borraban con service role rutas mandadas por
  el cliente. `lib/storage/org-path.ts` valida la carpeta de la org en
  business-context, workboard, SOPs, video de SOP y wins. En variantes de reel, el
  patch se limita a los campos editables.
- **Cifrado:** Zernio, GHL, Hyros, VTurb, WebinarJam y la key de Fathom por
  miembro guardaban la clave **en claro** si faltaba `ENCRYPTION_MASTER_KEY`, y al
  leer mandaban el ciphertext como API key si no descifraba. Ahora fallan.
- **Formularios públicos:** waitlist y trial-confirm no tenían rate limit ni techo
  de largo, y pisaban los datos de un email existente; ahora tienen las dos cosas
  y no pisan. `/api/utm/track` sólo registra
  links que existen. `/api/agent/transcribe` tiene rate limit por usuario.
- **Comparación de secretos en tiempo constante** para `CRON_SECRET` y
  `WORKER_AUTH_SECRET` (`lib/security/safe-equal.ts`).
- **Stripe:** el id de transacción iba sin validar al path de la API con el token
  de la org.

### Funcional (el sistema hacía algo mal sin avisar)

- **Sentry nunca arrancó en el servidor:** faltaba `instrumentation.ts`. Ningún
  error de route handler ni server action llegaba a Sentry.
- **Techo de 1000 filas de PostgREST:** `lib/supabase/fetch-all-rows.ts` pagina
  con `.range()`. Aplicado a la tabla de leads (964 leads el 09-03; el
  `truncated` nunca podía dispararse), a los costos de IA del super-admin y a la
  asociación de llamadas con clientes.
- **Upserts que fallaban siempre:** análisis profundo de llamadas
  (`call_analyses`) y sync de YouTube (`content_pieces`) usaban `onConflict`
  contra índices únicos parciales. Se reemplazan por índices comunes.
- **Columnas que no existen:** las herramientas de datos del agente pedían
  `paid_at`, `call_summary`, `weaknesses`, `base_salary`, `snapshot_date` y otras.
  Pagos, análisis de llamadas, compensación y snapshots volvían con error.
  `organizations.country` y `enabled_add_ons` no tenían grant: Configuración no
  guardaba el país y los add-ons se leían siempre vacíos.
- **Crons:**
  - Métricas de contenido: se refrescaban siempre las mismas 50 piezas, y una
    respuesta vacía de Zernio pisaba las métricas con ceros.
  - Reportes ejecutivos: nunca se reintentaban. El mensual corría todas las orgs
    en serie.
  - Fathom: dos corridas podían analizar la misma llamada, y el batch de 50 no
    entraba en 60 s.
  - Typeform y Google Forms: el error de una org frenaba a las siguientes.
  - `calendly-sync` y `ghl-sync` respondían `ok: true` al fallar.
  - Refresh de Mercado Pago: una consulta fallida parecía "nada que refrescar".

---

## 3. Lo que queda abierto, por prioridad

### 🔴 Seguridad

1. **Los roles no se hacen cumplir en la base ni en la mayoría de las acciones.**
   Todas las policies filtran por org, ninguna por rol. Un viewer puede, vía
   PostgREST directo, editar `team_roles.permissions`, `organizations` y las
   tablas de finanzas. Vía server actions puede:
   - cambiar la key BYOK de Claude (`saveClaudeApiKeyAction`);
   - desconectar integraciones;
   - navegar y bajar el Drive del founder;
   - fijarse su propia comisión (`updateCloserCommissionAction`).

   `discord_integrations` es editable por cualquier miembro. Requiere diseño:
   helper `requireRole()` en server actions y policies de escritura por rol.
   Amplía `[PERMISOS-SERVER-ACTIONS]` de PENDIENTES.
2. **Tokens OAuth en texto plano** (con RLS cerrado, sólo service role los lee):
   Calendly, Stripe, Instagram, Typeform, Google/YouTube, Drive de super-admin,
   `fathom_integrations.api_key`, ManyChat y `team_member_integrations`.
   Hace falta cifrar al escribir y migrar lo guardado.
3. **El acceso al portfolio del holding no mira el rol:** cualquier miembro de la
   org holding lee `clients`, `closing_calls` y `conversations` de los negocios.
4. **Ventanas de replay:** Calendly (`t`), Mercado Pago (`ts`, y la firma sólo
   cubre `data.id`) y GHL no validan timestamp. `verifyQStashRequest` no pasa
   `url`, así que un cuerpo firmado sirve para otra ruta `/api/queue/*`.
5. **Mass assignment y ids ajenos:**
   - `updateContentPieceAction` pasa `updates` sin zod.
   - `customRoleId` en invitaciones y `clientId` en `app/fathom/actions.ts:162` no
     se validan contra la org.
6. **Prompt injection:** `wrap-untrusted-content.ts` no escapa el tag de cierre.
   Quedan sin envolver:
   - los DMs en `app/integrations/zernio/actions.ts`;
   - las respuestas de formularios;
   - ManyChat, labeling de contenido y el clasificador de Discord;
   - los resultados de las tools del agente.

   Impacto acotado: las escrituras van con la sesión del usuario.
7. **Login:** el rate limit va por email, así que cualquiera puede bloquear a
   otro, y el spraying de passwords no está limitado. Conviene IP + email y
   captcha.
8. **Detalles de error al cliente:**
   - Calendly webhook/callback, `invite/validate`, `rag/ingest`, ManyChat y
     Unipile devuelven el error interno.
   - Whop y Commas revelan si una org tiene la integración conectada.
9. **Storage:**
   - Cinco buckets no están en migraciones: `client-payment-receipts`,
     `business-context-documents`, `sop-attachments`,
     `workboard-task-attachments`, `ai-brain-documents`. Confirmar en el
     dashboard que son privados.
   - `content-thumbnails` tiene una policy pública de listado.
10. **Discord:** el auto-vínculo por nombre parecido (>0.85) usa un dato que
    controla el usuario.

### 🟠 Confiabilidad

1. **Sin timeouts en los clientes de APIs externas** (Zernio, GHL, Hyros,
   Stripe, Mercado Pago, Calendly, Typeform, etc.). Un proveedor colgado retiene
   la lambda hasta `maxDuration`. Sumar `AbortSignal.timeout()` en cada
   `*Fetch`.
2. **El techo de 1000 filas sigue en otros lugares.** Hay 290 lecturas que no
   miran `error`. Candidatos: `lib/intelligence/collect-context.ts:220`,
   `lib/super-admin/client-health.ts`. Regla para adelante: toda suma o conteo
   en JS pasa por `fetchAllRows` o se hace en SQL.
3. **Calendly:**
   - `calendly-sync` y `calendly-sync-closers` corren a la misma hora y se pisan
     (el índice único rechaza el batch entero).
   - Hace N+1 por evento sobre 120 días.
   - `.in()` con URIs largas puede pasarse del largo de URL.
4. **Typeform:**
   - Se pierden las respuestas por encima de 1000 desde la última sync (no
     pagina y avanza `last_synced_at`).
   - `form_responses.external_response_id` es único global: dos orgs con el
     mismo form se pisan.
5. **Dedupe de webhooks vs reintentos:** un evento que falló queda en `error` y
   el reintento del proveedor choca con el índice único y se descarta
   (`payment_webhook_events`, `ghl_webhook_events`). El índice de pagos es
   `(provider, external_event_id)` sin `organization_id`.
6. **Trabajo sin `await` después de responder**, que Vercel puede cortar: embeddings
   RAG, scoring de leads, sync inicial de YouTube, mails de waitlist y eventos de
   Meta. Usar `after()` de `next/server`.
7. **Inbox legacy:** lee y reescribe el array `conversations.messages`, así que
   dos webhooks simultáneos pierden un mensaje.
8. **`cleanup-trial-reels`** reprocesa los mismos jobs todos los días, para
   siempre.
9. **Instagram legacy:** un error transitorio lo deja fuera de la sync para
   siempre.
10. **Meses en UTC y no en ART** en comisiones y payroll
    (`app/finance/actions.ts:482`) y en `client-health`. Es la misma familia que
    BUG-3.
11. **La sync de contenido de Zernio** (`sync-actions.ts`) todavía escribe
    métricas en cero cuando el analytics no se reconoce. El cron diario ya no.

### 🟡 Dinero y datos

- **ClickUp import:** `"1.500"` pasa a 1,5 y `"$2,500.00"` a 2,5.
- **Parser de Excel:** borra todos los puntos (`"1250.50"` pasa a 125050) y una
  fecha vacía pasa a ser hoy.
- **Pagos:** sin moneda se asume USD. Ver `[FACTURACION-MONEDAS]`.
- **"Balance" de Mercado Pago:** es la suma de los últimos 100 pagos, no el saldo.
- **Facturación por closer:** `closer-actions.ts` lee `closing_calls.amount_closed`,
  que no existe, y la métrica falla. No hay columna de monto en llamadas: decidir
  de dónde sale antes de arreglarlo.

### 🔵 Base de datos y migraciones

1. **Una base nueva no se puede armar desde las migraciones.** Fallan:
   - `20260710120000` (usa `organization_members`, que no existe);
   - `20260710140000` (`set_updated_at()` todavía no existe);
   - `20260720100000` (`UPDATE … FROM LATERAL`).

   Esto rompe `supabase db reset` y los branches de preview.
2. **Versiones duplicadas:** `20260706100000`, `20260717100000` y
   `20260825100000`, dos archivos cada una.
3. **`RUN_ALL_PHASE1.sql` está en la carpeta de migraciones.** Correrlo a mano
   pisa la versión de `get_my_organization_id()` que maneja holdings.
4. **Producción tiene deriva:** por ejemplo, `profiles` sin FK a `auth.users`.
   Correr `supabase db diff` y reconciliar.

### ⚪ Salud del código

1. **Legacy todavía agendado:** hay crons de Instagram Graph cada 5 min y cada
   hora, ManyChat, Unipile y `content_assets`, unas 4.000 líneas. Decidir si se
   borran.
2. **La sync de Calendly está duplicada y desalineada** (`sync-events.ts` vs
   `closer-sync.ts`, que nunca setea `lead_id`).
3. **Los crons no siguen un patrón común.** Algunos hacen fan-out, otros corren en
   serie; unos aíslan errores por org y otros no; ninguno tiene lock. Un
   `runPerOrg()` compartido resolvería los cuatro.
4. **Sin tests:**
   - `lib/agent` (compaction, contexto JIT), `lib/ai/anthropic.ts` (BYOK),
     `lib/rag` y `lib/auth/bootstrap`;
   - `lib/queue`, `lib/calendly`, `lib/typeform` y `lib/mercadopago`.
5. **CI** corre typecheck, lint y Vitest. No corre `next build`, e2e ni un chequeo
   de migraciones (armar una base desde cero detectaría el punto 1 de "Base de datos y migraciones").
6. **Helpers exportados desde archivos `"use server"`** que no son acciones:
   `getConversationIdByExternalRef`, `loadTaskLinksBundle`,
   `getProductContextForOrg` y otros. Hoy son inocuos por RLS, pero cada export
   ahí es un endpoint.
7. **Acciones de reels y Drive usan `profile.organization_id`** en vez de
   `requireOrganizationId()`, así que ignoran el negocio activo del holding.

---

## 4. Lo que se revisó y está bien

- **Webhooks correctos:**
  - Whop: Standard Webhooks, ventana de 5 min, dedupe.
  - Commas: HMAC y dedupe.
  - Zernio e Instagram: fail-closed y firma sobre el raw body.
  - Fathom `[token]`.
  - Bot de Discord hacia la app: tiempo constante, fail-closed.
- **Crons:** los 19 de `vercel.json` usan `assertCronAuthorized`, que falla sin
  `CRON_SECRET`.
- **OAuth:** los 10 flujos generan `state` (con PKCE donde existe), lo ligan a
  org y usuario en una cookie httpOnly y redirigen sólo a paths internos.
- **Holding:** la cookie y el header del negocio activo se re-verifican contra
  `holding_businesses`.
- **Super-admin:** todas las acciones pasan por `requireSuperAdmin()`.
- **Base:**
  - las 144 tablas tienen RLS;
  - ninguna policy es `USING (true)` ni de `anon`;
  - todo INSERT tiene WITH CHECK;
  - las 14 funciones SECURITY DEFINER fijan `search_path`.
- **Cliente:** ningún archivo `"use client"` importa el admin client, el cifrado
  ni módulos de IA.
- **Superficie:** no hay SSRF de URL arbitraria, y `dangerouslySetInnerHTML` sólo
  aparece con contenido estático.
- **Cifrado:** AES-256-GCM con IV aleatorio y auth tag.
