# Archivo — documentos reemplazados

Estos documentos se archivaron el 2026-09-23, cuando se reorganizó la documentación por área. Describen
fases, planes o estados **que ya no son los actuales**, y muchas afirmaciones ya no coinciden con el código.
Se conservan para consultar la historia. **No los uses como referencia**: el estado vigente está en
[`docs/README.md`](../README.md).

| Archivo | Qué era | Lo reemplaza |
|---|---|---|
| `OPERATIONAL_NOTES.md` | Notas operativas (mayo 2026) | `docs/areas/*`, `docs/arquitectura/*`, `docs/operacion/entorno-y-deploy.md` |
| `PHASE2_PLAN.md`, `PHASE_0.md`, `PHASE_1.md`, `PHASE_1_HANDOFF_PROMPT.md`, `PHASE_2.md` | Planes por fase del MVP | `docs/areas/*` (estado actual) y `PENDIENTES.md` |
| `ESTADO_ACTUAL.md`, `ESTADO_PLATAFORMA.md` | Fotos del estado en mayo 2026 | `docs/README.md` |
| `FIXES_PENDIENTES.md` | Fixes de mayo 2026, todos cerrados | — |
| `PROJECT_CONSTITUTION.md`, `SYSTEM_ARCHITECTURE.md`, `AI_ENGINE_SPEC.md`, `UI_UX_SPEC.md` | Specs de visión del MVP V1 | `docs/arquitectura/vision-general.md`, `docs/areas/agente-ia.md`, `docs/diseno/*` |
| `DESIGN.md`, `DESIGN_SYSTEM.md` | Design system anterior | `docs/diseno/design-system.md` |
| `PLAN_VERIFICACION.md` | Plan de verificación manual acumulado | `docs/operacion/verificacion-manual.md` (sólo lo abierto) |
| `TESTING_BACKLOG.md` | Backlog de tests | `PENDIENTES.md` (ítems `T-*`) y `docs/operacion/testing.md` |
| `API_DOCS_PENDIENTES.md` | APIs implementadas sin documentación | `docs/integraciones/apis-sin-documentacion.md` |
| `INTEGRACIONES_MAPA.md` | Mapa de integraciones | `docs/integraciones/README.md` |
| `mock-data-audit.md`, `pending-features-audit.md`, `security-audit-api-keys.md` | Auditorías de junio/julio 2026 | `PENDIENTES.md`, `docs/arquitectura/seguridad.md` |

Lo que cada auditoría de área dio por resuelto u obsoleto al archivar estos documentos está en
[`docs/historial/auditoria-docs-2026-09-23.md`](../historial/auditoria-docs-2026-09-23.md).
