-- Marketing: campos adicionales en content_assets

alter table public.content_assets
  add column if not exists reel_type text,
  add column if not exists distribution text default 'organic',
  add column if not exists views_organic integer default 0,
  add column if not exists views_paid integer default 0,
  add column if not exists story_replies integer default 0,
  add column if not exists multiplier numeric(4, 2) default 1.0;

alter table public.content_assets
  drop constraint if exists content_assets_distribution_check;

alter table public.content_assets
  add constraint content_assets_distribution_check
  check (distribution is null or distribution in ('organic', 'paid'));

alter table public.content_assets
  drop constraint if exists content_assets_reel_type_check;

alter table public.content_assets
  add constraint content_assets_reel_type_check
  check (reel_type is null or reel_type in ('reel', 'trial_reel'));
