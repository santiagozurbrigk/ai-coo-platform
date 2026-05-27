-- Oleada E (Calendly): persistir tokens OAuth y signing key por organización

create table if not exists public.calendly_integrations (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz,

  -- URI canonical para scope organization (https://api.calendly.com/organizations/...)
  calendly_org_uri text,

  -- Webhook
  webhook_subscription_uri text,
  webhook_signing_key text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calendly_integrations_webhook_signing_key_idx
  on public.calendly_integrations (webhook_signing_key);

alter table public.calendly_integrations enable row level security;

drop policy if exists "Users read org calendly integration" on public.calendly_integrations;
create policy "Users read org calendly integration"
  on public.calendly_integrations for select
  using (organization_id = public.get_my_organization_id());

-- El server backend usa service role (admin client) para escribir/actualizar.
-- No abrimos policies de insert/update públicas para evitar filtración de tokens.

