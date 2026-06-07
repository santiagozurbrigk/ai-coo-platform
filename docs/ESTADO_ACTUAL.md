# Estado actual del proyecto — AI COO Platform

**Última actualización:** 27 de mayo de 2026  
**Rama principal:** `main` (commit reciente: `1755129`)  
**Fase activa:** **Phase 1** — Backend, auth e integraciones  
**Fase 0:** ✅ Cerrada y aprobada (mayo 2026)  
**Fase 2:** 📋 Planificada — ver [`PHASE_2.md`](./PHASE_2.md)

---

## Resumen ejecutivo

**AI COO** es una plataforma de inteligencia operativa con IA para negocios de infoproductos. El monorepo combina una **UI completa en Next.js** (`apps/web`) con **persistencia real en Supabase**, auth multi-tenant e integraciones de negocio.

El producto ya no es un prototipo mock puro: los módulos core (clientes, ventas, closing, finanzas/gastos, onboarding, integraciones clave) leen y escriben en base de datos. Parte de Marketing, insights de IA y algunas integraciones secundarias siguen usando mocks o están en estado parcial.

**Trabajo reciente (mayo 2026):**

- Integración **Fathom** por API key (sync, cron, match automático de clientes, calls en base de conocimiento)
- **Hardening de seguridad** (RLS, validación Zod, rate limits)
- **Dark mode** con fondos negro/gris neutros y bordes sutiles (fix de tokens `--border` y `border-border/60`)
- Módulos **Tablero de trabajo**, **Agente de negocio**, **Producto**, **Formularios** (marketing)

---

## Cómo ejecutar

```bash
pnpm install
npx pnpm@9.15.0 --filter @ai-coo/web dev
```

| URL | Uso |
|-----|-----|
| http://localhost:3000/login | Login / registro (Supabase) |
| http://localhost:3000/onboarding | Wizard primer acceso |
| http://localhost:3000/dashboard | Panel General |
| http://localhost:3000/demo | Recorrido guiado |
| http://localhost:3000/design-system | Sistema de diseño |
| http://localhost:3000/superadmin/login | Super Admin (login mock) |

**Variables de entorno:** copiar `.env.example` → `apps/web/.env.local`. Mínimo para Phase 1: Supabase (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`).

**Atajos:** `Ctrl+K` paleta de comandos · `pnpm --filter @ai-coo/web typecheck` · `pnpm --filter @ai-coo/web clean` si hay errores de build en Windows.

---

## Estructura del monorepo

```
ai-coo-platform/
├── apps/web/              # Next.js 15 App Router — app principal
├── packages/ui/           # Design system (@ai-coo/ui)
├── packages/config/       # Preset Tailwind, ESLint, TS
├── packages/types/        # Tipos compartidos
├── supabase/migrations/   # Esquema PostgreSQL + RLS
└── docs/                  # Constitución, fases, arquitectura, este doc
```

**Reservados para evolución:** `packages/database`, `packages/ai`, `packages/queue`, `packages/integrations`.

---

## Arquitectura de la aplicación

```
Usuario → Next.js (RSC + Client Components)
              ↓
         Middleware (auth Supabase)
              ↓
    Server Actions / API Routes (/app/api/...)
              ↓
    Supabase (PostgreSQL + RLS por organization_id)
              ↓
    Integraciones externas (Calendly, ManyChat, Fathom, Google, Typeform, Discord…)
              ↓
    Crons Vercel (sync periódico)
```

**Providers de cliente** (`apps/web/providers/`):

| Provider | Estado |
|----------|--------|
| `PlatformDataProvider` | Supabase si hay env; fallback mocks |
| `FinanceDataProvider` | Supabase + métricas derivadas de clientes/closing |
| `MarketingDataProvider` | Mock (`instagramConnected` local) |
| `ToastProvider`, `CommandPaletteProvider`, `WorkspaceProvider` | UI |

**Fuente de rutas:** `apps/web/routes/paths.ts` + `lib/navigation/sidebar-modules.ts`.

---

## Navegación actual (sidebar)

```
Panel General
Tablero de trabajo
Agente de negocio
Clientes
Base de conocimiento
Integraciones
Equipo
───────────────
Marketing
 ├─ Overview
 ├─ Contenido
 ├─ Conexión con Ventas
 └─ Formularios
Ventas
 ├─ Bandeja
 ├─ Métricas
 └─ Closing
Producto
Operaciones
 ├─ Overview
 ├─ SOPs
 └─ Team Inputs
Finanzas
 ├─ Overview
 └─ Gastos
───────────────
Configuración (pie del sidebar)
```

---

## Phase 1 — Progreso por bloque

### ✅ Auth y multi-tenant

- Supabase Auth: login, registro, callback `/auth/callback`
- Middleware protege rutas de plataforma
- Bootstrap automático: `organizations` + `profiles` (rol `founder`) al primer acceso
- Onboarding persistido en `onboarding_responses`
- Cerrar sesión en Configuración
- Super Admin: login mock en `/superadmin/login`

### ✅ Base de datos (migraciones en repo)

| Migración | Contenido |
|-----------|-----------|
| `20260521000000_phase1_orgs_profiles` | Orgs, perfiles, RLS base |
| `20260521100000_clients` | Clientes |
| `20260521200000_fix_rls_recursion` | Fix RLS |
| `20260521300000_closing_calls` | Llamadas de closing |
| `20260521400000_onboarding_responses` | Onboarding |
| `20260521500000_conversations` | Bandeja ventas |
| `20260521510000_closing_conversation_fk` | FK closing ↔ conversación |
| `20260521600000_calendly_sync_closing_calls` | Metadata Calendly en closing |
| `20260521610000_calendly_integrations` | OAuth Calendly |
| `20260521700000_manychat_integrations` | ManyChat API key + webhook |
| `20260521800000_finance_expenses` | Gastos, plataformas de pago |
| `20260521900000_super_admin` | Tablas Super Admin |
| `20260522000000_phase11_integrations` | YouTube, Typeform, Google Forms, Fathom (base) |
| `20260522100000_agent_module` | Agente de negocio (conversaciones, proyectos) |
| `20260522200000_marketing_content_fields` | Campos contenido marketing |
| `20260522300000_workboard_tasks` | Tablero Kanban |
| `20260522400000_profiles_avatar_url` | Avatares perfil |
| `20260527100000_discord_bot` | Discord (servidor, mensajes) |
| `20260605100000_fathom_api_key` | Fathom API key por org |
| `20260606100000_security_hardening_rls` | RLS integraciones, token_usage |
| `20260607100000_fathom_calls_org_call_unique` | Unique org + fathom_call_id |

> **Verificar en producción** que las tres migraciones de junio 2026 estén aplicadas en el proyecto Supabase desplegado.

### ✅ Módulos con datos reales (Supabase)

| Módulo | Ruta | Backend |
|--------|------|---------|
| Panel General | `/dashboard` | KPIs derivados (clientes, conversaciones, closing, finanzas) |
| Clientes | `/clients`, `/clients/[id]` | CRUD + detalle; llamadas Fathom vinculadas |
| Ventas — Bandeja | `/sales/inbox` | `conversations` + tags |
| Ventas — Métricas | `/sales/metrics` | Derivadas de closing/conversaciones |
| Ventas — Closing | `/sales/closing` | `closing_calls` + sync Calendly |
| Finanzas | `/finance` | Métricas derivadas + config plataformas |
| Gastos | `/finance/expenses` | CRUD gastos fijos, suscripciones, compensación |
| Onboarding | `/onboarding` | DB |
| Integraciones | `/integrations` | Estado real por provider |
| Tablero de trabajo | `/workboard` | `workboard_tasks` |
| Agente de negocio | `/agent` | Conversaciones/proyectos + Claude (si `ANTHROPIC_API_KEY`) |
| Base de conocimiento | `/business-context/documents` | Documentos + calls Fathom sin cliente |
| Formularios | `/marketing/forms` | Typeform / Google Forms sync |
| Contenido YouTube | `/marketing/content` | Parcial — assets desde DB si YouTube conectado |

### 🟡 Híbrido (UI + mocks o parcial)

| Módulo | Notas |
|--------|-------|
| Marketing Overview | Gráficos e insights desde mocks |
| Conexión con Ventas | Journeys mock |
| Instagram | Sin integración real; siempre `not_connected` en integraciones |
| Producto | UI completa; datos mayormente mock |
| Operaciones / SOPs / Team Inputs | UI Fase 0; persistencia limitada |
| Equipo | UI; roles custom parcial |
| Super Admin | UI; datos mixtos |
| Insights IA (dashboard, marketing, finanzas) | Copy estático / mock |

### ❌ Pendiente Phase 1

- Instagram / Make (bloqueado verificación Meta)
- Super Admin con datos 100% reales (baja prioridad)
- RAG completo según `AI_ENGINE_SPEC.md`
- Sustituir mocks restantes de Marketing
- Pagos Stripe / Wise / MercadoPago como integraciones reales
- Tests E2E automatizados

---

## Integraciones

**Providers con flujo real** (`REAL_PROVIDERS` en `app/integrations/actions.ts`):

| Integración | Conexión | Sync / Webhook | Uso en producto |
|-------------|----------|----------------|-----------------|
| **Calendly** | OAuth | Webhook + cron `/api/cron/calendly-sync` | Closing calls |
| **ManyChat** | API key | Webhook por token | Bandeja ventas |
| **Fathom** | API key por org | Cron sync + process cada 10 min | Clientes, KB, contexto calls |
| **YouTube** | Google OAuth | Manual / acciones | Contenido marketing |
| **Typeform** | OAuth | Cron horario | Formularios marketing |
| **Google Forms** | Google OAuth | Cron horario | Formularios marketing |
| **Discord** | OAuth + bot | Webhook interno | Mensajes, stats en integraciones |

**Sin implementación real (UI placeholder / mock):**

Instagram, Notion, Airtable, Google Sheets/Docs, Loom, Miro — aparecen en grid pero estado `not_connected` o mock desactivado.

### Fathom (detalle reciente)

- Conexión por **API key personal** (no OAuth)
- Sync con lookback 90 días si `fathom_calls` vacío
- **Match automático** de cliente por nombre (Fuse.js); enlaces manuales no se sobreescriben
- Calls sin cliente visibles en KB con filtros «Contexto de negocio» / «Reuniones con clientes»
- Script opcional: `supabase/scripts/mark_fathom_business_context_calls.sql`

### Crons Vercel (`apps/web/vercel.json`)

| Ruta | Frecuencia |
|------|------------|
| `/api/integrations/fathom/process` | Cada 10 min |
| `/api/integrations/fathom/sync` | Cada hora |
| `/api/integrations/typeform/sync` | Cada hora |
| `/api/integrations/google-forms/sync` | Cada hora |
| `/api/cron/calendly-sync` | Cada hora |

Protección opcional: `CRON_SECRET` en endpoints sensibles.

---

## Seguridad (mayo 2026)

- RLS por `organization_id` en tablas de negocio
- **Secrets de integraciones** no legibles desde cliente (solo service role en server)
- Validación **Zod** en Server Actions críticas
- **Rate limits** en agente IA y generación SOP
- `requireAuth` / `requireOrganizationId` en capa server

Ver migración `20260606100000_security_hardening_rls.sql` y `docs/security-audit-api-keys.md`.

---

## Design system y UI

**Paquete:** `packages/ui` (`@ai-coo/ui`)  
**Tokens:** `packages/ui/src/styles/tokens.css`  
**Estilos app:** `apps/web/app/globals.css`  
**Preset Tailwind:** `packages/config/tailwind/preset.ts`

**Dark mode (estado actual):**

- Fondos neutros: `#0A0A0A`, `#111111`, `#1A1A1A`, `#222222`, `#2A2A2A`
- Acento marca: `#7C3AED` / `#A78BFA`
- Bordes: token `--border: 0 0% 17%` + soporte `border-border/XX` vía `<alpha-value>` en preset
- Superficies glass con borde `hsl(0 0% 100% / 0.08)`

**Componentes clave:** `Card`, `GlassPanel`, `MetricCard`, `Sidebar`, charts en `apps/web/components/charts/`.

---

## Server Actions principales

```
apps/web/app/
├── auth/actions.ts
├── clients/actions.ts
├── closing/actions.ts
├── conversations/actions.ts
├── onboarding/actions.ts
├── finance/actions.ts
├── calendly/actions.ts
├── manychat/actions.ts
├── fathom/actions.ts
├── integrations/actions.ts
├── marketing/actions.ts
├── forms/actions.ts
├── agent/actions.ts
├── workboard/actions.ts
├── discord/actions.ts
└── super-admin/actions.ts
```

---

## Phase 2 (planificado — no implementar aún)

Documentado en [`PHASE_2.md`](./PHASE_2.md):

- Bot Discord en Railway (complemento a Fathom)
- Testimonios automáticos desde Discord
- Timeline cliente unificado (Fathom + Discord)
- Vista `/clients/testimonials`

> Existe migración y endpoints Discord parciales en Phase 1; el bot en producción y features Phase 2 completas quedan fuera de alcance actual.

---

## Deuda técnica y fixes recientes

| Ítem | Estado |
|------|--------|
| Auditoría UI mayo 2026 | ✅ Ver [`FIXES_PENDIENTES.md`](../FIXES_PENDIENTES.md) |
| Bordes blancos dark mode | ✅ Commits `d43f78f`, `1755129` |
| Fathom sync vacío / upsert schema | ✅ Corregido en oleada Fathom |
| `ESTADO_PLATAFORMA.md` desactualizado | ⚠️ Referencia histórica Fase 0; usar **este documento** |
| README raíz | ⚠️ Aún dice «Phase 0 completada» |
| Marketing overview 100% mock | Pendiente conectar a `content_assets` |
| Derivar todos los KPIs desde una sola capa `lib/metrics/*` | Parcial — dashboard y finanzas ya derivan |

---

## Próximos pasos recomendados

1. **Aplicar migraciones pendientes** en Supabase prod (jun 2026).
2. **Oleada Instagram/Make** cuando Meta lo permita.
3. **Marketing Overview** → datos reales desde `content_assets` + formularios.
4. **Motor RAG** para KB, SOPs y agente con contexto de negocio.
5. **Super Admin** con métricas reales de uso IA y salud de orgs.
6. Actualizar `README.md` y `.cursor/rules/current_phase.md` para alinear con este estado.

---

## Documentación de referencia

| Documento | Contenido |
|-----------|-----------|
| [`PROJECT_CONSTITUTION.md`](./PROJECT_CONSTITUTION.md) | Principios y fases |
| [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md) | Arquitectura objetivo |
| [`PHASE_0.md`](./PHASE_0.md) | Cierre prototipo visual |
| [`PHASE_1.md`](./PHASE_1.md) | Plan Phase 1 y oleadas |
| [`PHASE_2.md`](./PHASE_2.md) | Roadmap Discord y timeline |
| [`AI_ENGINE_SPEC.md`](./AI_ENGINE_SPEC.md) | Motor IA / RAG |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Design system |
| [`UI_UX_SPEC.md`](./UI_UX_SPEC.md) | UX objetivo |
| [`.cursor/rules/current_phase.md`](../.cursor/rules/current_phase.md) | Reglas para agentes Cursor |

---

## Commits recientes relevantes

```
1755129 fix(ui): corregir border-border/60 que renderizaba blanco en dark
d43f78f fix(ui): bordes sutiles en dark mode en lugar de blanco solido
dba9c91 fix(ui): dark mode con negro y grises neutros sin tinte violeta
0e1af25 feat(fathom): match automatico por nombre y calls en base de conocimiento
1fa6ca9 feat(security): hardening RLS, validacion Zod, rate limits y requireAuth
b4765da feat(integrations): reemplazar OAuth de Fathom por API key personal
```

---

*Documento de handoff interno. Actualizar tras cada hito mayor de Phase 1.*
