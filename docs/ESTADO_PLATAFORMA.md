# Estado de la plataforma — AI COO (Fase 0)

**Última actualización:** mayo 2026  
**Fase actual:** **1** — Backend, auth e integraciones (Fase 0 ✅ cerrada y aprobada)  
**Monorepo:** `pnpm` · App principal: `apps/web` (`@ai-coo/web`)  
**Design system compartido:** `packages/ui` (`@ai-coo/ui`)

---

## Resumen ejecutivo

La plataforma mantiene la **UI completa de Fase 0** (demo-ready). **Phase 1** añade backend real: la UI sigue en español; el estado migrará de **React Context + mocks** hacia **Supabase + Server Actions** de forma incremental.

El trabajo reciente cubre: onboarding pulido, reestructuración de módulos operativos, **Finanzas**, **Marketing** como módulo propio, **Closing → Clientes**, y un **rediseño visual estilo Apple VisionOS** (glassmorphism, púrpura `#7C3AED`).

---

## Cómo ejecutar

```bash
pnpm install
npx pnpm@9.15.0 --filter @ai-coo/web dev
```

| URL | Uso |
|-----|-----|
| http://localhost:3000/login | Entrada cliente |
| http://localhost:3000/onboarding | Wizard primer acceso |
| http://localhost:3000/dashboard | Panel General |
| http://localhost:3000/demo | Recorrido guiado |
| http://localhost:3000/superadmin/login | Super Admin |

---

## Arquitectura de la UI (Fase 0)

```
apps/web/
├── app/(platform)/          # Rutas de la plataforma founder/equipo
├── components/              # UI por dominio (dashboard, sales, finance, marketing…)
├── providers/               # Estado global mock (Platform, Finance, Marketing, Toast…)
├── mocks/                   # Datos realistas
├── routes/                  # paths.ts + navigation.ts (fuente de verdad)
└── types/                   # Tipos por módulo

packages/ui/                 # Primitivos + MetricCard, GlassPanel, Sidebar, charts…
packages/config/tailwind/    # Preset Tailwind
```

**Providers anidados** (`AppProviders`):

1. `ToastProvider` + `CommandPaletteProvider`
2. `WorkspaceProvider`
3. `PlatformDataProvider` — conversaciones, closing, clientes, roles
4. `FinanceDataProvider` — plataformas de pago, gastos
5. `MarketingDataProvider` — conexión Instagram (mock)

---

## Navegación actual (sidebar)

```
Panel General
Finanzas
 └─ Gastos
Marketing
 ├─ Overview
 ├─ Contenido
 └─ Conexión con Ventas
Ventas
 ├─ Bandeja
 ├─ Métricas
 └─ Closing
Clientes
Operaciones
 ├─ Overview
 ├─ SOPs
 └─ Team Inputs
Base de conocimiento
Integraciones
Equipo
───────────────
Configuración (pie del sidebar)
```

**Redirects legacy:** rutas antiguas (`/sales/marketing-insights/*`, `/operations/weekly-inputs`, `/sops` → operaciones) redirigen a las nuevas.

---

## Todo lo implementado (cronológico por área)

### 1. Onboarding y bienvenida

| Entrega | Detalle |
|---------|---------|
| Paso 11 onboarding | Multi-select en modelo de entrega; opción **Otro** con texto obligatorio; eliminado «Modelo híbrido» |
| Campos `*Other` | Tipos + validación en `lib/onboarding/steps.ts` |
| Bienvenida cinematográfica | `components/welcome/cinematic-welcome.tsx`, `welcome-gate.tsx`, `lib/onboarding/welcome-storage.ts` |
| Fix Strict Mode | Animación con keyframes (evita doble ejecución en dev) |

### 2. Panel General (antes «Panel»)

- Renombrado en sidebar, `page-meta`, locale, permisos y tour demo
- Dashboard: **métricas primero**, luego gráfico, IA, riesgos, oportunidades, acciones
- Configuración anclada al **pie del sidebar** (`secondaryNavigation`)

### 3. Ventas

| Módulo | Ruta | Contenido |
|--------|------|-----------|
| Bandeja | `/sales/inbox` | Conversaciones, etiquetas, filtros, journey inline por lead |
| Métricas | `/sales/metrics` | Métricas globales + **rendimiento por closer** (barras horizontales) |
| Closing | `/sales/closing` | Calendario/lista, modales pago / no cierre, columna **Closer** |

**Etiquetas de conversación:** pills + selector compacto; fix overflow en layout de bandeja.

**Closing → Clientes:** al cerrar un deal se crea cliente en `PlatformDataProvider` y se etiqueta conversación como «closeado».

**Modal de pago (Closing):** campos **origen** y **destino** de plataforma (desde Finanzas); atribución de closer (mock).

### 4. Finanzas y Gastos (nuevo)

| Pantalla | Ruta |
|----------|------|
| Finanzas | `/finance` |
| Gastos | `/finance/expenses` |

**Finanzas incluye:**

- Configuración de **plataformas de pago** (añadir/editar/eliminar; sugerencias Stripe, Wise, MercadoPago…)
- **6 tarjetas:** Facturación, Cash Collected, Por cobrar (mini timeline), Gastos totales, Margen (arco), Balance por plataforma
- **7 gráficos SVG** personalizados (área doble, stepped timeline, arco gastos, anillos, heatmap, seguidores, stacked revenue)
- Insights de IA (cards con borde accent)

**Gastos incluye:**

- Resumen mensual (fijos, suscripciones, equipo fijo + comisiones)
- Secciones: Gastos fijos, Suscripciones (sugerencias Notion, Zoom…), Compensación de equipo
- Modales para añadir gasto fijo / suscripción

**Estado:** `FinanceDataProvider` + mocks en `mocks/finance.ts`, `mocks/expenses.ts`.

### 5. Marketing (módulo dedicado — antes bajo Ventas)

**Marketing Insights** se eliminó del submenú Ventas. Nuevo módulo top-level:

| Pantalla | Ruta |
|----------|------|
| Overview | `/marketing` |
| Contenido | `/marketing/content` |
| Detalle publicación | `/marketing/content/[id]` |
| Conexión con Ventas | `/marketing/sales-connection` |

**Overview:** 6 métricas, 6 gráficos, insights IA (alcance, funnel, heatmap, etc.).

**Contenido:** grid/lista, filtros por tipo, orden, búsqueda, cards estilo Pinterest.

**Detalle:** métricas por pieza, conversaciones/bookings mock, revenue influenciado, journey touch %, insights IA.

**Conexión con Ventas:** ranking por ventas, journeys horizontales expandibles (Laura Gómez, Carlos Vega → `/clients/[id]`), patrones IA.

**Instagram:** empty state si no conectado → CTA a Integraciones; `MarketingDataProvider` (`instagramConnected`). Tarjeta **Instagram (via Make)** en integraciones.

**Redirects:** `/sales/marketing-insights/*` → rutas nuevas.

### 6. Clientes

| Ruta | Detalle |
|------|---------|
| `/clients` | Lista de clientes post-cierre |
| `/clients/[id]` | Perfil: pagos, cuotas, Fathom, insights IA |

Fix crítico: redirect en bucle `/clients` → `/clients` eliminado.

### 7. Operaciones

| Ruta | Antes |
|------|-------|
| `/operations/overview` | — |
| `/operations/sops` | `/sops` |
| `/operations/team-inputs` | weekly-inputs |

Team Inputs: importancia 🔴🟡⚪ en items.

### 8. Knowledge Base, Equipo, Integraciones

- KB: barra «+ Añadir contenido»
- Equipo: roles personalizados; eliminada sección «Roles del sistema (referencia)»
- Integraciones: mocks incluyen Calendly + **Instagram (via Make)**

### 9. Super Admin (sin cambios estructurales recientes)

- Organizaciones, fundadores, cerebro IA global, etc.
- Rutas bajo `/super-admin/*`

### 10. Bugs corregidos

| Problema | Solución |
|----------|----------|
| `/clients` pantalla negra | Redirect circular en `lib/navigation/redirects.ts` |
| Bandeja ventas rota (overflow/pills) | `overflow-hidden`, selector compacto de etiquetas |
| Marketing Insights rutas viejas | Redirects + páginas legacy que redirigen |

### 11. Rediseño visual (dos iteraciones)

**Iteración 1:** tokens oscuros, glass, metric cards, bar chart línea, sidebar settings al pie.

**Iteración 2 — Apple VisionOS / spatial UI:**

- Base `#080810`, ambient purple gradients
- Marca **#7C3AED** / **#A78BFA** en primary, focus, charts, active nav
- Superficies: blur 40px, top edge highlight, sombras de elevación
- Cards 20px radius, hover lift
- Botones: primary gradient purple; ghost con borde violeta
- Badges pills transparentes
- Modales glass 24px
- Tablas con hover purple
- Sidebar/topbar frosted glass + glow en ítem activo

Archivos clave: `packages/ui/src/styles/tokens.css`, `apps/web/app/globals.css`, primitivos en `packages/ui/src/`.

---

## Estado compartido (mocks conectados)

| Provider | Responsabilidad |
|----------|-----------------|
| `PlatformDataProvider` | Conversaciones, tags, closing calls, clientes, roles custom |
| `FinanceDataProvider` | Plataformas pago, gastos fijos, suscripciones, compensación |
| `MarketingDataProvider` | `instagramConnected` (default: conectado) |

**Flujos cruzados mock:**

- Cerrar deal en Closing → cliente + tag en inbox
- Plataformas en Finanzas → dropdowns en modal Closing
- Contenido Marketing → journeys en bandeja / conexión ventas
- Closers en Métricas ventas alineados con mocks de Finanzas

---

## Qué NO está hecho (explícito Fase 0)

- Supabase / PostgreSQL / RLS
- Auth real (login es UI)
- API routes / Server Actions de negocio
- Claude, embeddings, colas, RAG en producción
- OAuth real (ManyChat, Instagram, Calendly, Drive…)
- Cálculo financiero derivado en tiempo real desde DB (métricas Finanzas usan **snapshots mock** + UI)
- Tests E2E automatizados del nuevo alcance

---

## Rutas útiles (post-refactor)

| Módulo | Ruta principal |
|--------|----------------|
| Panel General | `/dashboard` |
| Finanzas | `/finance` |
| Gastos | `/finance/expenses` |
| Marketing Overview | `/marketing` |
| Contenido | `/marketing/content` |
| Publicación | `/marketing/content/[id]` |
| Conexión ventas | `/marketing/sales-connection` |
| Bandeja | `/sales/inbox` |
| Métricas ventas | `/sales/metrics` |
| Closing | `/sales/closing` |
| Clientes | `/clients` |
| Operaciones | `/operations/overview` |
| Integraciones | `/integrations` |

---

## Próximos pasos recomendados

### A. Fase 0 — ✅ Cerrada (mayo 2026)

- Docs sincronizados (`PHASE_0.md`, `current_phase.md`, `PHASE_1.md`)
- Validación founder aprobada
- Pulido visual: tokens de gráficos (`lib/chart/colors.ts`, `tokens.css`), contraste textos secundarios (`white/45–50`)
- Sparklines en metric cards; calendario en Closing
- Tag git recomendado: `phase-0-demo-ready`

### B. Deuda técnica antes de Phase 1

| Ítem | Por qué |
|------|---------|
| Derivar métricas Finanzas desde `clients` + `closingCalls` | Hoy overview usa mocks estáticos; al tener DB conviene una capa `lib/finance/compute-*` |
| Unificar tipos Marketing (`marketing-insights.ts` vs rutas `/marketing`) | Nombre legacy en carpeta `components/marketing-insights` |
| Permisos por módulo | Ya existen ids `finance`, `marketing`, `marketing_content` — conectar a UI de roles en Phase 1 |
| Eliminar rutas/páginas legacy vacías bajo `/sales/marketing-insights` si ya no se necesitan (solo redirects) |

### C. Phase 1 — activa (según constitución del proyecto)

Orden sugerido (alineado con `docs/PROJECT_CONSTITUTION.md` y `docs/SYSTEM_ARCHITECTURE.md`):

1. **Auth + multi-tenant** — Supabase Auth, organización, sesión, guards reales (reemplazar `OnboardingGuard` mock).

2. **Base de datos** — Esquema: orgs, users, clients, deals, payments, installments, expenses, content assets, integrations. RLS por `org_id`.

3. **Integraciones reales (prioridad negocio)**  
   - Instagram vía Make (Marketing)  
   - ManyChat (inbox)  
   - Calendly (Closing)  
   - Stripe / Wise / MercadoPago (Finanzas)

4. **Motor de contexto (RAG)** — documentos KB, SOPs, memoria IA según `AI_ENGINE_SPEC.md`.

5. **API / Server Actions** — sustituir providers mock por fetch + mutaciones; mantener misma UI.

6. **IA operativa** — recomendaciones en Panel General, insights Marketing/Finanzas con datos reales.

7. **Super Admin** — provisioning orgs, usage, cost tracking con datos reales.

### D. Mejoras de producto post-Phase 1 (backlog)

- Facturación calculada con reglas de negocio (solo upfront + cuotas pagadas; por cobrar por mes)
- Comisiones de equipo atribuidas por closer en cada deal
- Sincronización bidireccional contenido Instagram ↔ journeys en inbox
- Export CSV / reportes ejecutivos PDF
- Notificaciones push / email para cuotas vencidas y deals sin follow-up

---

## Archivos de referencia

| Documento | Contenido |
|-----------|-----------|
| `docs/PROJECT_CONSTITUTION.md` | Principios y fases del producto |
| `docs/SYSTEM_ARCHITECTURE.md` | Arquitectura objetivo |
| `docs/AI_ENGINE_SPEC.md` | Motor IA |
| `docs/UI_UX_SPEC.md` | UX objetivo |
| `docs/PHASE_0.md` | Fase 0 cerrada (referencia histórica) |
| `docs/PHASE_1.md` | Plan y orden Phase 1 |
| `docs/DESIGN_SYSTEM.md` | Design system |
| `routes/navigation.ts` | Menú actual |
| `routes/paths.ts` | Constantes de rutas |

---

## Criterios de “Fase 0 completa” (actualizados)

- [x] Panel General renombrado y reordenado  
- [x] Finanzas + Gastos con mocks y gráficos  
- [x] Marketing módulo dedicado (4 pantallas + empty state Instagram)  
- [x] Ventas: inbox, métricas (closers), closing sin Marketing Insights  
- [x] Clientes + sync desde closing  
- [x] Operaciones reestructuradas  
- [x] Rediseño VisionOS en design system  
- [x] Integraciones: Instagram mock  
- [x] Docs repo sincronizados con navegación actual  
- [x] Checklist `/demo` validado por founder  
- [x] Aprobación explícita — **Phase 1 iniciada**  
- [x] Pulido visual opcional (tokens gráficos + contraste)

---

*Documento generado para handoff interno y planificación. Actualizar tras cada hito mayor.*
