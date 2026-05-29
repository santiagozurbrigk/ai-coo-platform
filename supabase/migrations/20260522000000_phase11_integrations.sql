-- Phase 1.1: Fathom, YouTube, Forms, content_assets, client timeline/problems

alter table public.clients
  add column if not exists nickname text;

-- ─── Fathom ───────────────────────────────────────────────────────────────

create table if not exists public.fathom_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  webhook_secret text,
  status text not null default 'connected',
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.fathom_calls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  fathom_call_id text not null unique,
  title text not null,
  raw_title text,
  transcript text,
  summary text,
  duration_seconds integer,
  call_date timestamptz,
  status text not null default 'pending' check (
    status in (
      'pending', 'processing', 'associated', 'unmatched',
      'ignored', 'pending_review'
    )
  ),
  client_id uuid references public.clients (id) on delete set null,
  association_confidence numeric(3, 2),
  association_candidates jsonb not null default '[]'::jsonb,
  call_type text check (
    call_type is null
    or call_type in ('delivery', 'consulting', 'vision', 'team', 'other')
  ),
  ai_situation_summary text,
  ai_next_steps text[] not null default '{}',
  ai_problems_detected text[] not null default '{}',
  ai_progress_vs_previous text,
  fathom_url text,
  processed_after timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists fathom_calls_org_status_idx
  on public.fathom_calls (organization_id, status);

create index if not exists fathom_calls_org_client_idx
  on public.fathom_calls (organization_id, client_id, call_date desc);

create index if not exists fathom_calls_process_idx
  on public.fathom_calls (status, processed_after)
  where status = 'pending';

-- ─── Client timeline & problems ───────────────────────────────────────────

create table if not exists public.client_timeline_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  entry_type text not null check (
    entry_type in (
      'fathom_call', 'manual_note', 'status_change', 'payment', 'onboarding'
    )
  ),
  fathom_call_id uuid references public.fathom_calls (id) on delete set null,
  title text not null,
  situation_summary text,
  next_steps text[] not null default '{}',
  problems_detected text[] not null default '{}',
  progress_indicator text check (
    progress_indicator is null
    or progress_indicator in ('improving', 'stable', 'declining', 'unknown')
  ),
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists client_timeline_client_idx
  on public.client_timeline_entries (client_id, created_at desc);

create table if not exists public.client_problems (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  problem_description text not null,
  detected_at timestamptz not null default now(),
  detected_from text not null check (
    detected_from in ('fathom_call', 'manual', 'form_response')
  ),
  source_id uuid,
  status text not null default 'active' check (
    status in ('active', 'in_progress', 'resolved')
  ),
  resolved_at timestamptz,
  resolution_summary text,
  created_at timestamptz not null default now()
);

create index if not exists client_problems_org_client_idx
  on public.client_problems (organization_id, client_id, status);

-- ─── YouTube ──────────────────────────────────────────────────────────────

create table if not exists public.youtube_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  channel_id text,
  channel_name text,
  channel_thumbnail text,
  status text not null default 'connected',
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── Content assets (Instagram + YouTube) ─────────────────────────────────

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  platform text not null check (platform in ('instagram', 'youtube')),
  external_id text not null,
  title text,
  caption text,
  thumbnail_url text,
  content_type text,
  published_at timestamptz,
  duration_seconds integer,
  views integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  saves integer not null default 0,
  reach integer not null default 0,
  impressions integer not null default 0,
  avg_watch_time_seconds integer,
  retention_percentage numeric(5, 2),
  click_through_rate numeric(5, 2),
  ai_content_label text check (
    ai_content_label is null
    or ai_content_label in ('AUTORIDAD', 'ATRACCION', 'NUTRICION', 'VENTA')
  ),
  ai_label_confidence numeric(3, 2),
  ai_label_reasoning text,
  manual_content_label text check (
    manual_content_label is null
    or manual_content_label in ('AUTORIDAD', 'ATRACCION', 'NUTRICION', 'VENTA')
  ),
  effective_label text generated always as (
    coalesce(manual_content_label, ai_content_label)
  ) stored,
  conversations_generated integer not null default 0,
  bookings_influenced integer not null default 0,
  sales_influenced integer not null default 0,
  revenue_influenced numeric(10, 2) not null default 0,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, platform, external_id)
);

create index if not exists content_assets_org_platform_idx
  on public.content_assets (organization_id, platform, published_at desc);

-- ─── Typeform & Google Forms ──────────────────────────────────────────────

create table if not exists public.typeform_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  status text not null default 'connected',
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.google_forms_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  status text not null default 'connected',
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  platform text not null check (platform in ('typeform', 'google_forms')),
  external_form_id text not null,
  title text not null,
  description text,
  total_responses integer not null default 0,
  completion_rate numeric(5, 2) not null default 0,
  avg_completion_time_seconds integer not null default 0,
  is_active boolean not null default true,
  questions jsonb not null default '[]'::jsonb,
  ai_form_analysis text,
  ai_drop_off_insights text,
  ai_qualification_insights text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, platform, external_form_id)
);

create table if not exists public.form_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  form_id uuid not null references public.forms (id) on delete cascade,
  external_response_id text not null unique,
  respondent_email text,
  respondent_name text,
  answers jsonb not null default '[]'::jsonb,
  submitted_at timestamptz,
  completion_time_seconds integer,
  is_complete boolean not null default true,
  ai_lead_score integer check (
    ai_lead_score is null or (ai_lead_score >= 0 and ai_lead_score <= 100)
  ),
  ai_lead_qualification text check (
    ai_lead_qualification is null
    or ai_lead_qualification in ('qualified', 'not_qualified', 'highly_qualified')
  ),
  ai_key_insights text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists form_responses_form_idx
  on public.form_responses (form_id, submitted_at desc);

-- ─── RLS (lectura por org; escritura vía service role) ────────────────────

alter table public.fathom_integrations enable row level security;
alter table public.fathom_calls enable row level security;
alter table public.client_timeline_entries enable row level security;
alter table public.client_problems enable row level security;
alter table public.youtube_integrations enable row level security;
alter table public.content_assets enable row level security;
alter table public.typeform_integrations enable row level security;
alter table public.google_forms_integrations enable row level security;
alter table public.forms enable row level security;
alter table public.form_responses enable row level security;

create policy "Users read org fathom integration"
  on public.fathom_integrations for select
  using (organization_id = public.get_my_organization_id());

create policy "Users read org fathom calls"
  on public.fathom_calls for select
  using (organization_id = public.get_my_organization_id());

create policy "Users read org client timeline"
  on public.client_timeline_entries for select
  using (organization_id = public.get_my_organization_id());

create policy "Users read org client problems"
  on public.client_problems for select
  using (organization_id = public.get_my_organization_id());

create policy "Users read org youtube integration"
  on public.youtube_integrations for select
  using (organization_id = public.get_my_organization_id());

create policy "Users read org content assets"
  on public.content_assets for select
  using (organization_id = public.get_my_organization_id());

create policy "Users update org content assets label"
  on public.content_assets for update
  using (organization_id = public.get_my_organization_id());

create policy "Users read org typeform integration"
  on public.typeform_integrations for select
  using (organization_id = public.get_my_organization_id());

create policy "Users read org google forms integration"
  on public.google_forms_integrations for select
  using (organization_id = public.get_my_organization_id());

create policy "Users read org forms"
  on public.forms for select
  using (organization_id = public.get_my_organization_id());

create policy "Users read org form responses"
  on public.form_responses for select
  using (organization_id = public.get_my_organization_id());
