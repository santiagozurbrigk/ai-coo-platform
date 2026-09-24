# ADR-009 — Embudos: un motor genérico + plantillas declarativas en código, con fuentes configurables por step

- **Estado:** Aceptada con deuda
- **Fecha:** 2026-08-29 — `docs/historial/CHANGES-2026-07-a-08.md` "DOC-FUNNELS-ARCHITECTURE: análisis y
  arquitectura de embudos intercambiables" (decisiones cerradas con Santiago en `docs/specs/FUNNELS_ARCHITECTURE.md`
  §1). Implementación: entradas "FEAT-EMBUDOS-FASE0" y "FEAT-EMBUDOS-FUENTES" del mismo día; merge en `cb91b280`
  (2026-08-30, PR #30).

## Contexto

Hasta agosto, "embudo" en Limitless eran visualizaciones fijas: el embudo de conversión del panel general
(`components/dashboard/sales-funnel-strip.tsx`) y el de contenido de Marketing, cada uno con su cálculo. Santiago
aportó el documento `Funnel Metrics Standard v1.0` (webinar, VSL book-a-call y DM) y anunció "más documentos, uno
por tipo de embudo", con la necesidad de que el usuario cambie entre "vistas" de embudos.

La lectura de la spec: el documento "no es material de lectura: es **un schema con datos semilla**"; los tres
embudos son instancias de un mismo tipo colapsables a las mismas siete etapas ("spine").

## Decisión

- **Un motor genérico + N definiciones declarativas.** "Agregar un tipo de embudo nuevo debe ser agregar un archivo
  de plantilla en TypeScript — sin migración, sin páginas nuevas, sin componentes nuevos. Si al agregar un tipo de
  embudo hace falta escribir un componente, la arquitectura falló" (spec §0).
- **Spine de 7 etapas inmutable**; lo específico de cada embudo vive en los *steps*.
- **Plantillas en código, no en la base** (`lib/funnels/templates/{webinar,vsl-call,dm}.ts`): historial de git y
  revisión por PR. La base guarda sólo lo de cada org: instancias (`funnel_instances`), bindings de fuentes por step,
  overrides y series.
- **Fuentes configurables por step**: cada step se bindea a una fuente del catálogo (`lib/funnels/sources.ts`:
  tablas propias, GHL, VTurb, WebinarJam, Hyros, pagos, formularios…).
- **Capas separadas**: `compute.ts` (matemática pura, sin Supabase) y `resolve.ts` (sólo trae números).
- **Embudos es un lente de medición** ("Lectura A"), no un contenedor: Marketing, Ventas y Finanzas siguen siendo
  los módulos operativos.
- **Varias instancias por oferta**; **switcher por URL** (`/funnels/[funnelId]`), no por cookie.
- Los datos se llenan **"sí o sí con integración"**, sin carga manual (decisión 3).

## Alternativas consideradas (spec §1 y entrada del 2026-08-29)

- **N módulos de embudo, uno por tipo**: descartado; "evita construir N módulos acoplados".
- **Plantillas en la base de datos**: descartado a favor de archivos TS revisables (mismo patrón que
  `METRIC_SOURCES` y `ADD_ON_IDS`). Un builder para el founder queda "más adelante" (decisión 6).
- **Una instancia por org vs varias por oferta**: varias, porque el documento prohíbe comparar una oferta de $27 con
  una de $5k.
- **Módulo contenedor ("contexto global") vs capa de medición**: capa de medición; el resolver lleva
  `funnelInstanceId` desde el día uno para que lo otro sea extensión.
- **Switcher por cookie vs por URL**: URL (deep-linking desde el diagnóstico, cache y `revalidatePath` por
  instancia); la cookie se reserva para contexto global como el holding (ADR-002).
- **Carga manual de webinar/VSL**: descartada (decisión 3).

## Consecuencias

**Positivas**
- Tres tipos de embudo con el mismo código de pantalla; tests de conformidad de plantillas
  (`lib/funnels/validate-template.ts`) y cálculo testeable sin base.
- Obligó a formalizar la regla "`null` no es `0`" (ver ADR-010).

**Negativas / deuda**
- **Integraciones bloqueantes**: 2 de 3 embudos nacieron con su etapa central sin fuente; hubo que construir GHL
  oportunidades, VTurb, WebinarJam, Hyros y pagos. Ninguna cuenta real conectada todavía
  (`[EMBUDOS-CUENTAS-REALES]`, `[EMBUDOS-PAGOS-VERIFICAR]`).
- Medidas de dinero y anuncios son de la org entera en todos los embudos (`[EMBUDOS-MEDIDAS-POR-EMBUDO]`), en contra
  de la decisión 1; montos de distintas monedas se suman (`[EMBUDOS-MONEDAS]`); `reporting_timezone` se guarda y no
  se usa (`[EMBUDOS-TIMEZONE]`).
- Fases pendientes: salud/bandas (`[EMBUDOS-SALUD]`), snapshots periódicos (`[EMBUDOS-SNAPSHOTS]`), comparación
  (`[EMBUDOS-COMPARAR]`), gestión de instancias (`[EMBUDOS-GESTION-INSTANCIAS]`).
- Bindings por defecto del DM apuntan al inbox legacy vacío (`[EMBUDOS-DM-DEFAULTS]`, ver ADR-007).
- Actions sin chequeo de permiso (`[EMBUDOS-PERMISOS-ACCIONES]`, ver ADR-005).
- Deriva plantilla↔documento: cada plantilla lleva `sourceDocVersion` para detectarla (spec §9.6).

## Evidencia

- `docs/specs/FUNNELS_ARCHITECTURE.md` (§0, §1, §9), `docs/specs/FUNNELS_SOURCE_MAP.md`, `docs/areas/embudos.md`.
- `apps/web/lib/funnels/{spine,types,compute,resolve,sources,source-signal,validate-template}.ts`,
  `apps/web/lib/funnels/templates/`.
- `supabase/migrations/20260829120000_funnels_phase1.sql`.
- `docs/historial/CHANGES-2026-07-a-08.md` 2026-08-29 (DOC-FUNNELS-ARCHITECTURE, FEAT-EMBUDOS-FASE0,
  FEAT-EMBUDOS-FASE1, DB-EMBUDOS + FEAT-EMBUDOS-FUENTES) y 2026-08-30 (UI del módulo); commit `cb91b280`.
