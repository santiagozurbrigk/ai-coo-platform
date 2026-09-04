-- B · L0 — Las keys de Fathom por miembro, y la identidad de la contraparte.
--
-- 🐛 Arregla un módulo que **nunca funcionó**: `app/fathom/member-actions.ts`
-- escribe y lee `encrypted_api_key`, una columna que **no existe en ninguna
-- migración**. La tabla define `api_key`. Conectar un miembro falla, y
-- sincronizar también. Hoy sólo llegan las llamadas de la key de la
-- organización, que es exactamente el problema que esto viene a resolver.
--
-- ⭐ El hallazgo que cambia la administración: los webhooks de Fathom se crean
-- por API (`POST /webhooks` devuelve id y secret). El miembro pega su key una
-- vez y OTC le crea el webhook solo; al desconectarse, OTC lo borra.
--
-- Sin backfill: los datos históricos no importan (decisión de Santiago).

-- ─── L0 · Lo que le falta a team_member_integrations ────────────────────────
alter table public.team_member_integrations
  /** 🐛 LA COLUMNA QUE FALTABA. Cifrada con lib/security/encryption. */
  add column if not exists encrypted_api_key text,

  /**
   * El mail de la cuenta de Fathom, **confirmado por el miembro**.
   * No hay /users/me: se deduce del `recorded_by` más frecuente y se le muestra
   * para que lo confirme. Nunca se asume en silencio.
   */
  add column if not exists provider_account_email text,

  /** Lo que devuelve POST /webhooks. El secreto verifica la firma de ESE miembro. */
  add column if not exists webhook_id text,
  add column if not exists webhook_secret text,

  /**
   * El segmento opaco de la URL de destino:
   * /api/integrations/fathom/webhook/<token>
   *
   * Con esto la verificación es contra **un solo secreto** en vez del escaneo de
   * todas las organizaciones que hace la ruta actual — más rápido, más simple, y
   * no cruza datos entre organizaciones.
   */
  add column if not exists webhook_token text,

  /**
   * ⭐ El estado peligroso NO es una llamada mal clasificada —esa se ve y se
   * corrige— sino **un miembro cuya key murió**: deja de aportar llamadas y todo
   * parece funcionar bien. Estas cuatro columnas son las que hacen visible ese
   * silencio.
   */
  add column if not exists status text not null default 'connected'
    check (status in ('connected', 'revoked', 'error')),
  /** Cuándo llegó el último webhook. Es LA señal: sin esto no se nota el silencio. */
  add column if not exists last_event_at timestamptz,
  add column if not exists last_error text,
  add column if not exists last_error_at timestamptz;

-- El token es la dirección del webhook: dos iguales entregarían a quien no es.
create unique index if not exists team_member_integrations_webhook_token_uidx
  on public.team_member_integrations (webhook_token)
  where webhook_token is not null;

create index if not exists team_member_integrations_status_idx
  on public.team_member_integrations (organization_id, integration_type, status);

-- ─── L0 · Privacidad ────────────────────────────────────────────────────────
--
-- ⭐ Decisión de Santiago, ya cerrada: pedirle a un miembro que conecte su Fathom
-- significa recibir **todo lo que grabe** —llamadas de venta, sí, pero también
-- 1-a-1, entrevistas y lo que sea—. Entonces:
--
--   Una llamada que NO quedó vinculada a un cliente ni a un lead la ve **sólo
--   quien la grabó**. Al vincularse pasa a ser de la organización, porque ahí sí
--   es información del negocio.
--
-- Se implementa reemplazando el SELECT de `fathom_calls`.
drop policy if exists "Users read org fathom calls" on public.fathom_calls;
drop policy if exists "Users view own organization fathom_calls" on public.fathom_calls;

create policy "Fathom calls: linked are the org's, unlinked are the recorder's"
  on public.fathom_calls for select
  using (
    organization_id = public.get_my_organization_id()
    and (
      -- Vinculada a un cliente: es del negocio.
      client_id is not null
      -- La grabó quien pregunta.
      or user_id = auth.uid()
      -- Sin dueño registrado (las viejas, de la key de la organización): se
      -- mantienen visibles para no romper lo que ya se ve hoy.
      or user_id is null
    )
  );

-- ─── L2 · Las identidades: cómo se sabe quién es la otra persona ────────────
--
-- ⭐ El alias **se aprende solo**. Todo cliente fue lead, y su llamada de venta sí
-- estuvo agendada: de ahí sale su nombre de pantalla gratis, y con eso se
-- resuelven todas sus entregas futuras. El lado de ventas le enseña al de
-- entrega.
--
-- Y no arranca vacía: se siembra con lo que OTC ya sabe (nombres, apodos y mails
-- de clientes, leads, turnos, contactos de GHL y compradores de los pagos).
create table if not exists public.client_identities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  /** A quién pertenece. Uno de los dos, nunca los dos. */
  client_id uuid references public.clients (id) on delete cascade,
  lead_id uuid references public.sales_leads (id) on delete cascade,

  /**
   * 'email'         — mail de invitado; determinista
   * 'speaker_alias' — nombre de pantalla ("iPhone de Juan"); lo que resuelve las entregas
   * 'name'          — nombre normalizado; alta pero candidato
   * 'phone'         — teléfono
   */
  identity_type text not null check (
    identity_type in ('email', 'speaker_alias', 'name', 'phone')
  ),

  /** El valor tal como se vio. */
  value text not null,
  /** El valor normalizado, que es contra el que se compara. */
  normalized_value text not null,

  /**
   * De dónde salió. `manual_confirmation` es la más fuerte: alguien lo dijo.
   * Guardar el origen es lo que después permite saber si el módulo funciona por
   * el alias aprendido o porque alguien lo está corrigiendo a mano.
   */
  source text not null default 'seed' check (
    source in ('seed', 'manual_confirmation', 'calendar', 'payment', 'ghl', 'discord')
  ),

  /** Cuántas veces se usó para resolver. Sirve para desempatar. */
  times_matched integer not null default 0,
  last_matched_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Una identidad pertenece a un cliente o a un lead, no a los dos ni a ninguno.
  constraint client_identities_owner_check check (
    (client_id is not null and lead_id is null)
    or (client_id is null and lead_id is not null)
  )
);

-- El mismo valor no puede apuntar a dos personas dentro de una organización:
-- sería exactamente la confusión que este módulo viene a evitar.
create unique index if not exists client_identities_unique_idx
  on public.client_identities (organization_id, identity_type, normalized_value);

create index if not exists client_identities_client_idx
  on public.client_identities (client_id) where client_id is not null;
create index if not exists client_identities_lead_idx
  on public.client_identities (lead_id) where lead_id is not null;

alter table public.client_identities enable row level security;

drop policy if exists "Users manage org client identities" on public.client_identities;
create policy "Users manage org client identities"
  on public.client_identities for all
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop trigger if exists client_identities_updated_at on public.client_identities;
create trigger client_identities_updated_at
  before update on public.client_identities
  for each row execute function public.set_updated_at();

-- ─── L2 · Por qué peldaño se resolvió cada llamada ──────────────────────────
--
-- ⭐ Sin esto, en dos semanas nadie va a saber si el módulo funciona porque el
-- alias aprendido está haciendo el trabajo o porque la IA está tapando un
-- problema de configuración. Con esto, el panel dice dónde invertir.
alter table public.fathom_calls
  add column if not exists resolution_method text
    check (
      resolution_method is null or resolution_method in (
        'invitee_email',      -- mail de invitado externo: determinista
        'speaker_alias',      -- alias aprendido: determinista
        'name_match',         -- nombre normalizado: candidato
        'calendar_crossing',  -- cruce con un turno agendado
        'ai_proposal',        -- propuesta de IA, confirmada por alguien
        'manual'              -- lo resolvió una persona a mano
      )
    ),
  /** El cliente o lead que resultó ser la contraparte. */
  add column if not exists counterparty_lead_id uuid
    references public.sales_leads (id) on delete set null,
  /** El nombre de pantalla de la contraparte, que es lo que se aprende. */
  add column if not exists counterparty_speaker_name text;

create index if not exists fathom_calls_resolution_idx
  on public.fathom_calls (organization_id, resolution_method);
