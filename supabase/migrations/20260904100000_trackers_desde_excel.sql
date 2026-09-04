-- Las cinco piezas que los Excel tienen y a OTC le faltaban.
--
-- Análisis completo en docs/TRACKERS_EXCEL_VS_OTC.md. Resumen de por qué cada
-- una está acá:
--
-- 1. PERMISOS del cliente sobre su win — no es una mejora, es una falta: hoy se
--    puede usar el resultado de alguien sin que conste que dio permiso.
-- 2. ESTADO DE USO de un win — el Excel existe "para que ninguno se te escape",
--    y hoy OTC no puede responder "¿cuáles no usé todavía?".
-- 3. OBJETIVO del cliente — sin la meta no se puede cerrar un programa sabiendo
--    si se cumplió, ni responder "¿qué proporción llega al objetivo?".
-- 4. FECHA DE EGRESO — habilita "¿quién está a menos de 2 meses del egreso?".
-- 5. ESTADO ACTUAL en palabras — el campo que el CSM toca cada semana.

-- ─── 1 · 🔴 Los permisos del cliente sobre su propio resultado ──────────────
--
-- La Ficha de Caso del Excel pregunta dos cosas que OTC no guardaba en ninguna
-- forma: si autorizó el uso público, y **cómo quiere aparecer**. Con datos de
-- facturación de personas reales, no tener dónde registrar eso es un problema
-- concreto, no un detalle.
alter table public.client_wins
  add column if not exists consent_status text not null default 'not_asked'
    check (consent_status in ('not_asked', 'granted', 'denied')),

  /**
   * Cómo quiere aparecer. Sólo tiene sentido si autorizó.
   *   'name_and_face'   — nombre y cara
   *   'name_no_numbers' — nombre, sin los números
   *   'anonymous'       — sólo números, sin nombre
   */
  add column if not exists consent_display text
    check (
      consent_display is null or
      consent_display in ('name_and_face', 'name_no_numbers', 'anonymous')
    ),
  add column if not exists consent_note text,
  add column if not exists consent_updated_at timestamptz;

-- Un permiso otorgado sin decir cómo aparecer está a medias: se puede usar el
-- número pero no se sabe si se puede poner el nombre. Se exige elegir.
alter table public.client_wins drop constraint if exists client_wins_consent_check;
alter table public.client_wins add constraint client_wins_consent_check
  check (consent_status <> 'granted' or consent_display is not null);

-- Para filtrar rápido lo publicable.
create index if not exists client_wins_consent_idx
  on public.client_wins (organization_id, consent_status);

-- ─── 2 · El estado de uso de un win ─────────────────────────────────────────
--
-- ⭐ `win_usages` registra **dónde se usó**; esto registra **si todavía no**.
-- Es la diferencia entre un registro y un recordatorio: el Excel existe para
-- mostrar los que faltan.
--
-- 'unused' y 'used' se derivan de si hay filas en win_usages; 'reserved' es una
-- decisión explícita ("lo guardo para el lanzamiento") que no se puede derivar.
alter table public.client_wins
  add column if not exists usage_state text not null default 'unused'
    check (usage_state in ('unused', 'used', 'reserved')),

  /**
   * ⭐ "Sacá la captura el día que la publican, no cuando la vas a usar."
   * El Excel tiene "Captura sacada (Sí/No)" **además** del link, porque lo que
   * importa es saber cuáles están pendientes.
   */
  add column if not exists needs_screenshot boolean not null default false;

create index if not exists client_wins_usage_state_idx
  on public.client_wins (organization_id, usage_state);

-- ─── 3, 4 y 5 · Lo que le falta a la ficha del cliente ──────────────────────
alter table public.clients
  /**
   * ⭐ El objetivo con el que entró. "Se completa en el onboarding, no después.
   * Es el dato que te permite cerrar el programa sabiendo si se cumplió."
   *
   * Va al lado del baseline, que ya existe: uno es de dónde salió, este es a
   * dónde iba. Sin los dos, el recorrido no se puede leer.
   */
  add column if not exists goal_text text,
  add column if not exists goal_metric_key text,
  add column if not exists goal_metric_value numeric,
  add column if not exists goal_metric_unit text,

  /** Cuándo termina el programa. Habilita la conversación de renovación. */
  add column if not exists exit_date date,

  /**
   * Dónde está parado hoy, en palabras. Un checkpoint dice qué pasó; esto dice
   * cómo va. Es el campo que se pisa cada semana.
   */
  add column if not exists current_status_note text,
  add column if not exists current_metric_value numeric,
  add column if not exists current_status_updated_at timestamptz;

-- Para "¿quién está a menos de 2 meses del egreso?".
create index if not exists clients_exit_date_idx
  on public.clients (organization_id, exit_date)
  where exit_date is not null;
