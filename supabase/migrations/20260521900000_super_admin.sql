-- Super Admin Phase 1: tablas globales (sin RLS — acceso vía service role)

alter table public.organizations
  add column if not exists mrr_usd numeric(10, 2) not null default 0;

create table if not exists public.super_admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.token_usage (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  input_cost_usd numeric(10, 6) not null default 0,
  output_cost_usd numeric(10, 6) not null default 0,
  total_cost_usd numeric(10, 6) not null default 0,
  feature text,
  created_at timestamptz not null default now()
);

create index if not exists token_usage_org_created_idx
  on public.token_usage (organization_id, created_at desc);

create index if not exists token_usage_created_idx
  on public.token_usage (created_at desc);

create table if not exists public.ai_brain_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  content_type text not null,
  file_url text,
  file_name text,
  file_size_bytes integer,
  source_url text,
  description text,
  tags text[] not null default '{}',
  status text not null default 'pending_indexing' check (
    status in ('pending_indexing', 'active', 'archived', 'error')
  ),
  uploaded_by text,
  coverage_areas text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_brain_documents_status_idx
  on public.ai_brain_documents (status);

create index if not exists ai_brain_documents_category_idx
  on public.ai_brain_documents (category);

create table if not exists public.organization_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  note text not null,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists organization_notes_org_idx
  on public.organization_notes (organization_id, created_at desc);

-- Bucket: crear en Supabase Dashboard → Storage → New bucket
-- Name: ai-brain-documents | Public: false
-- MIME: pdf, docx, txt, md, png, jpeg, webp
