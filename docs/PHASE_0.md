# Phase 0 — Prototipo visual (completado)

**Estado:** ✅ Fase 0.8 — cierre y listo para aprobación  
**Idioma UI:** Español  
**Backend:** Ninguno (mock data únicamente)

## Objetivo cumplido

Un founder puede entrar al prototipo y entender en minutos:

- Qué hace el producto
- Por qué es valioso
- Cómo fluye la operación día a día

Sin base de datos, auth ni APIs reales.

## Entregables por sub-fase

| Fase | Entregable |
|------|------------|
| 0.1 | Monorepo, rutas, módulos, redirects |
| 0.2 | Design system `@ai-coo/ui`, `/design-system` |
| 0.3 | Layout 3 columnas (sidebar, main, contexto) |
| 0.4 | Navegación colapsable, breadcrumbs, áreas founder/admin |
| 0.5 | Componentes + pantallas con mocks |
| 0.6 | Español completo + pulido visual |
| 0.7 | Flujos UX, toasts, paleta Ctrl+K, enlaces cruzados |
| 0.8 | `/demo` recorrido guiado, checklist, 404, documentación |

## Cómo ejecutar

```bash
pnpm install
pnpm --filter @ai-coo/web dev
```

- **Inicio:** http://localhost:3000  
- **Recorrido guiado:** http://localhost:3000/demo  
- **Plataforma:** http://localhost:3000/dashboard  

## Checklist de validación (antes de Phase 1)

- [ ] Recorrido `/demo` completo (~12 min)
- [ ] Panel: riesgos, oportunidades y «Qué hacer ahora» navegan bien
- [ ] Bandeja de ventas: selección + análisis en desktop y móvil
- [ ] Input semanal → toast → reporte ejecutivo
- [ ] Generar SOP → borrador `sop4`
- [ ] Conectar integración (mock)
- [ ] Ctrl+K abre paleta y navega a cualquier módulo
- [ ] Super Admin: organizaciones, fundadores, cuentas
- [ ] Copy 100% en español en pantallas principales

## Qué NO incluye Phase 0

- Supabase / PostgreSQL
- Autenticación
- Claude / embeddings / colas
- Integraciones OAuth reales
- Server Actions / API routes de negocio

## Siguiente paso: Phase 1

Implementación según `PROJECT_CONSTITUTION.md`, `SYSTEM_ARCHITECTURE.md` y `AI_ENGINE_SPEC.md`:

1. Auth y multi-tenant  
2. Base de datos + RLS  
3. Motor de contexto (RAG)  
4. Integraciones reales  
5. Workers y colas  

Solo iniciar Phase 1 tras aprobación explícita del prototipo Phase 0.
