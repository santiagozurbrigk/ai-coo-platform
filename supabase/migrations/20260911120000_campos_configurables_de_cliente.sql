-- Campos configurables del **cliente** — la tercera entidad de C0.
--
-- El problema que resuelve: la tabla de clientes necesita una columna "Objetivo
-- general" con una lista compartida por toda la organización (10k en primer
-- lanzamiento → escalar a 50k → escalar a 100k → …). Con texto libre, tres
-- personas escriben la misma meta de tres formas y el software no puede
-- responder "¿quiénes van a 50k?".
--
-- ⭐ No se crea una tabla de objetivos. El mecanismo ya existe desde el
-- 2026-09-03: `field_definitions` define columnas configurables con sus
-- opciones ordenadas, con color y archivables, y tiene pantalla propia. Lo único
-- que le faltaba era alcanzar a `clients`. Armar un catálogo aparte sería el
-- segundo mecanismo para lo mismo, justo lo que esa migración vino a evitar.
--
-- Sin backfill: no hay datos previos que migrar.

-- ─── 1 · La entidad nueva ───────────────────────────────────────────────────
--
-- `entity` aceptaba 'win' y 'checkpoint'. Se suma 'client'. El check se
-- recrea entero porque Postgres no permite ampliarlo en el lugar.
alter table public.field_definitions
  drop constraint if exists field_definitions_entity_check;

alter table public.field_definitions
  add constraint field_definitions_entity_check
  check (entity in ('win', 'checkpoint', 'client'));

-- ─── 2 · Dónde viven los valores ────────────────────────────────────────────
--
-- ⭐ Mismo patrón que `client_wins.custom` y `client_checkpoint_events.metrics`:
-- los valores van en un jsonb de la fila dueña, no en una tabla de pares
-- clave-valor. Así leer un cliente sigue siendo leer una fila, sin un join por
-- cada columna configurada.
--
-- `not null default '{}'` y no nullable: un cliente sin nada cargado tiene un
-- objeto vacío, no un `null`. Evita el `coalesce` en cada lectura y hace que
-- `custom->>'clave'` se comporte igual en las 264 filas que ya existen.
alter table public.clients
  add column if not exists custom jsonb not null default '{}'::jsonb;

-- Para "¿quiénes van a 50k?" sin recorrer la tabla entera. GIN sobre el jsonb
-- sirve para cualquier clave que se configure, hoy y las que vengan.
create index if not exists clients_custom_idx
  on public.clients using gin (custom);

-- Las policies de `clients` son por fila (`organization_id`), así que la columna
-- nueva queda cubierta por las que ya existen: no hace falta tocar RLS.
