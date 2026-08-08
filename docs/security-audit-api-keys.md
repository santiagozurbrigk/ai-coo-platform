# Security audit — API keys en frontend (Medida 1)

**Fecha:** 2026-06-06  
**Resultado:** Sin exposición de secrets en el bundle del cliente.

## Variables `NEXT_PUBLIC_` en uso (permitidas)

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente Supabase (público por diseño) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase (público por diseño) |
| `NEXT_PUBLIC_DISCORD_CLIENT_ID` | OAuth Discord (público por diseño) |
| `NEXT_PUBLIC_APP_URL` | URLs de redirect / webhooks |

## Secrets solo server-side

- `SUPABASE_SERVICE_ROLE_KEY` → `lib/supabase/admin.ts`
- `OTC_WEBHOOK_SECRET` → rutas `/api/discord/*`
- `CRON_SECRET` → crons y sync jobs
- API keys de integraciones → `*_integrations` en DB, leídas con `createAdminClient()`

## Patrón de integraciones

- UI → Server Actions o `POST /api/integrations/*/connect`
- Server → valida sesión + escribe key en DB vía admin client
- Sync/webhooks → admin client + secrets en env o DB

## Rate limiting

Los contadores viven en Postgres (`public.rate_limits` + `consume_rate_limit`, migración `20260808100000`), no en memoria del proceso: en Vercel cada lambda tenía su propio `Map` y los límites de auth (5/15min) y de IA (10/min) se reseteaban en cada cold start. Sin Supabase configurado se usa un contador en memoria (solo dev).

## Acción RLS

Migración `20260606100000_security_hardening_rls.sql` elimina políticas SELECT en tablas de integraciones para que un cliente autenticado no pueda leer `api_key`, `access_token`, etc. directamente desde Supabase JS.
