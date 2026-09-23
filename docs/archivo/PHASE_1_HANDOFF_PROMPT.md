# Prompt para Claude — Asesoría Phase 1 (sin desarrollo)

Copia y pega el bloque siguiente en Claude. **No pedirle código ni PRs**; solo análisis y recomendación de cómo seguir. Luego pásale la respuesta de Claude a Cursor para implementar.

---

## Prompt (copiar desde aquí)

```
Tu rol en esta conversación es **solo consultor de producto/arquitectura**. NO escribas código, NO generes archivos, NO des pasos de implementación línea por línea. Tu entrega debe ser un **plan de continuación** que yo reenviaré a otro agente (Cursor) que sí desarrolla.

---

## Proyecto

**AI COO Platform** — SaaS para founders (coaching / infoproductos) que unifica ventas, marketing, finanzas, operaciones e IA.

- Monorepo: `apps/web` (Next.js 15) + `packages/ui` (design system VisionOS)
- Idioma UI: español
- **Fase 0:** cerrada y aprobada (mayo 2026). Prototipo completo navegable con mocks y React Context.
- **Fase 1:** en curso. Objetivo: Supabase (auth + DB + RLS) sustituyendo mocks de forma incremental, **sin rediseñar la UI**.

Documentación del repo (por si la conoces): `PROJECT_CONSTITUTION.md`, `SYSTEM_ARCHITECTURE.md`, `PHASE_1.md`, `ESTADO_PLATAFORMA.md`.

---

## Qué ya se hizo en Phase 1 (hecho y validado en producción local)

### Infraestructura Supabase
- Proyecto Supabase creado (región sa-east-1).
- Variables en `apps/web/.env.local`: URL, anon key, service role key.
- Dependencias: `@supabase/supabase-js`, `@supabase/ssr`.
- Clientes: browser, server, admin (service role), middleware de sesión.
- `middleware.ts` protege rutas de plataforma; públicas: login, callback, demo, design-system, superadmin.

### Autenticación
- Login y registro reales en `/login` (email + contraseña).
- Server Actions: sign in, sign up, sign out.
- Callback `/auth/callback` para confirmación de email.
- Al primer acceso: bootstrap automático de **organización** + **perfil** (`role: founder`).
- Super Admin (`/superadmin/login`) **sigue en mock** — sin Supabase aún.

### Base de datos y RLS
Tablas en Supabase:

| Tabla | Propósito |
|-------|-----------|
| `organizations` | Multi-tenant, una org por founder al registrarse |
| `profiles` | Vincula `auth.users` → `organization_id`, rol |
| `clients` | Clientes creados desde Closing |

- RLS activo en las tres tablas.
- Función `get_my_organization_id()` (SECURITY DEFINER) para evitar **recursión infinita** en políticas de `profiles` (bug que ya se corrigió).
- Migraciones versionadas en `supabase/migrations/` (+ `RUN_ALL_PHASE1.sql` como script único).

### Dominios persistidos (oleadas A–G)
- **Clientes** (`clients`): CRUD + FK a `closing_calls`.
- **Closing** (`closing_calls`): listado, estados, Calendly webhook/sync, FK real a clientes.
- **Onboarding** (`onboarding_responses`): wizard completo en DB; guard en login.
- **Conversaciones** (`conversations`): inbox, tags, mensajes/análisis JSONB.
- **Métricas derivadas:** Finanzas y Ventas calculadas desde clientes + closing + gastos en DB.
- **Calendly** (`calendly_integrations`): OAuth, sync manual, estado real en Integraciones.
- **ManyChat** (`manychat_integrations`): API key + webhook; inbox real bloqueado por verificación Meta.
- **Gastos (Oleada G):** `fixed_expenses`, `subscriptions`, `team_compensation`, `payment_platforms` con CRUD vía Server Actions y `FinanceDataProvider`.

### Lo que deliberadamente NO se migró aún
- Marketing (providers mock)
- Instagram / Meta API (bloqueado por verificación developer)
- Super Admin con datos reales
- Motor IA / RAG
- Fathom, Loom, Notion, Google Drive (integraciones reales)

### Deuda / decisiones tomadas
- Arquitectura original mencionaba Clerk; **se eligió Supabase Auth** en Phase 1.
- Bootstrap de org/perfil usa **service role** en servidor.
- Clientes usan JSONB para `installments`, `ai_insights`, `linked_calls`.

---

## Lo que necesito de ti

1. **Priorización:** ¿Cuál es el mejor orden para continuar Phase 1 desde este punto? (ej. closing_calls vs conversaciones vs onboarding en DB vs integraciones).

2. **Riesgos y dependencias:** Qué bloques dependen de otros, qué rompería la demo si se hace mal, qué se puede paralelizar.

3. **Alcance por “oleadas”:** Propón 3–5 oleadas (cada una = un entregable revisable en 1–2 sesiones de dev), con objetivo claro y criterio de “listo”.

4. **Qué NO hacer aún:** Qué conviene dejar para Phase 1.1 o Phase 2 para no sobrecomplicar.

5. **Alineación con el producto:** El founder ya validó la UI de Fase 0; la prioridad es ¿datos reales que demuestren el flujo venta→cierre→cliente, o ¿infra primero (más tablas), o ¿primera integración externa?

Responde en **español**, estructurado con markdown (títulos, tablas si ayudan, lista numerada de recomendación final). Máximo ~800 palabras en el plan; sin código.

Cierra con una sección **"Instrucción para Cursor"**: 1 párrafo que resuma qué debe implementar el agente de desarrollo en el **próximo paso único** (el más importante).
```

---

## Cómo usarlo

1. Pega el prompt en Claude.
2. Copia la respuesta (sobre todo **Instrucción para Cursor** y el orden de oleadas).
3. Pégala en Cursor con algo como: *"Implementa el siguiente paso según la recomendación de Claude:"* + la respuesta.

---

*Actualizar la sección "Qué ya se hizo" cuando se complete otro hito de Phase 1.*
