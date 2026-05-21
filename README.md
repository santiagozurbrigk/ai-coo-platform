# AI COO Platform

Plataforma de inteligencia operativa con IA para negocios de infoproductos.

## Estado actual

**Phase 0 completada** — Prototipo visual navegable (mock data, sin backend).

| Recurso | URL (dev) |
|---------|-----------|
| Inicio | http://localhost:3000 |
| **Recorrido guiado** | http://localhost:3000/demo |
| Plataforma | http://localhost:3000/dashboard |
| Sistema de diseño | http://localhost:3000/design-system |

Documentación de cierre: [`docs/PHASE_0.md`](docs/PHASE_0.md)

## Estructura

```
apps/web          → Next.js 15 (prototipo)
packages/ui       → Design system
packages/config   → Tailwind, ESLint, TypeScript
packages/types    → Tipos compartidos
packages/database → Reservado (Phase 1)
packages/ai       → Reservado (Phase 1)
packages/queue    → Reservado (Phase 1)
packages/integrations → Reservado (Phase 1)
```

## Requisitos

- Node.js >= 20
- pnpm >= 9

## Setup

```bash
pnpm install
pnpm --filter @ai-coo/web dev
```

### Atajos útiles

- **Ctrl+K** — paleta de comandos (navegación rápida)
- **Limpiar build** — `pnpm --filter @ai-coo/web clean` (si hay errores ENOENT en Windows)

Dev por defecto usa **webpack**. Opcional: `pnpm --filter @ai-coo/web dev:turbo`

## Documentación de producto

Ver `/docs`:

- `PROJECT_CONSTITUTION.md`
- `SYSTEM_ARCHITECTURE.md`
- `AI_ENGINE_SPEC.md`
- `UI_UX_SPEC.md`
- `PHASE_0.md` — cierre Phase 0

## Próximo paso

**Phase 1** — Backend, auth, base de datos e integraciones (solo tras aprobar el prototipo).
