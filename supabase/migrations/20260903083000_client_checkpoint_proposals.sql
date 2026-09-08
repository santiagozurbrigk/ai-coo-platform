-- C3 · Propuestas de checkpoint desde fuentes externas.
--
-- ⭐ Nada se dispara solo. Discord (Encargo E) y Fathom (Encargo B) **proponen**
-- que un cliente alcanzó un hito; alguien lo acepta y ahí recién se crea el
-- evento real (C2). Un checkpoint alcanzado es una afirmación sobre el negocio
-- del cliente: no la hace un heurístico.
--
-- Mismo espíritu que `fathom_calls.ai_task_proposals` (20260708120000): la IA
-- sugiere, la persona confirma.
--
-- Esta tabla es el **buzón receptor**. Los encargos B y E sólo insertan acá.

create table if not exists public.client_checkpoint_proposals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  checkpoint_id uuid not null references public.client_checkpoints (id) on delete cascade,

  /** Quién propone. 'manual' no va acá: una propuesta manual no existe. */
  source text not null check (source in ('discord', 'fathom', 'automatic')),

  /**
   * De dónde salió, para poder volver a la evidencia: el id del mensaje de
   * Discord, de la llamada de Fathom, etc. Sin esto una propuesta es una
   * afirmación sin respaldo.
   */
  source_ref text,

  /** Por qué se propone, en palabras. Es lo que la persona lee para decidir. */
  rationale text,

  /** Cuándo la fuente cree que se alcanzó. Sugerencia: la persona puede cambiarla. */
  suggested_reached_at timestamptz,

  /** Métricas sugeridas, si la fuente pudo leer alguna. Mismo formato que el evento. */
  suggested_metrics jsonb not null default '{}'::jsonb,

  /**
   * Confianza de la fuente, 0 a 1. Se guarda para poder ordenar y para medir
   * después qué fuente acierta. No se usa para auto-aceptar.
   */
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),

  status text not null default 'pending' check (
    status in ('pending', 'accepted', 'rejected')
  ),

  /** Quién resolvió la propuesta y cuándo. Null mientras está pendiente. */
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ⭐ Una sola propuesta pendiente por cliente + checkpoint + fuente. Sin esto,
-- un sync que corre cada hora dejaría veinte propuestas idénticas y el buzón
-- sería inusable. Parcial: las resueltas quedan como historial y no estorban.
create unique index if not exists client_checkpoint_proposals_pending_uidx
  on public.client_checkpoint_proposals (client_id, checkpoint_id, source)
  where status = 'pending';

create index if not exists client_checkpoint_proposals_org_idx
  on public.client_checkpoint_proposals (organization_id, status, created_at desc);

create index if not exists client_checkpoint_proposals_client_idx
  on public.client_checkpoint_proposals (client_id, status);

alter table public.client_checkpoint_proposals enable row level security;

drop policy if exists "Users read org checkpoint proposals" on public.client_checkpoint_proposals;
create policy "Users read org checkpoint proposals"
  on public.client_checkpoint_proposals for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org checkpoint proposals" on public.client_checkpoint_proposals;
create policy "Users insert org checkpoint proposals"
  on public.client_checkpoint_proposals for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org checkpoint proposals" on public.client_checkpoint_proposals;
create policy "Users update org checkpoint proposals"
  on public.client_checkpoint_proposals for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org checkpoint proposals" on public.client_checkpoint_proposals;
create policy "Users delete org checkpoint proposals"
  on public.client_checkpoint_proposals for delete
  using (organization_id = public.get_my_organization_id());

drop trigger if exists client_checkpoint_proposals_updated_at on public.client_checkpoint_proposals;
create trigger client_checkpoint_proposals_updated_at
  before update on public.client_checkpoint_proposals
  for each row execute function public.set_updated_at();
