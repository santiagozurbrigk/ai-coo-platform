-- D · SOPs desde un video (Loom) — job asíncrono de transcripción y generación.
--
-- Un SOP se escribía llenando cuatro campos. Con esto se graba un video
-- mostrando cómo se hace algo y el SOP sale escrito.
--
-- ⚠️ Nada de esto entra en un request de Vercel: bajar el video, sacarle el
-- audio, transcribirlo y generar el SOP lleva minutos. Por eso es un job, con el
-- mismo molde que `reel_variation_jobs` (20260810120000).
--
-- Sin backfill: no hay jobs previos.

-- ─── Storage: el video va a un bucket PRIVADO ───────────────────────────────
--
-- Un Loom interno muestra cómo opera el negocio por dentro. No va en un bucket
-- público. El worker lo lee con el admin client y lo borra al terminar.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sop-videos',
  'sop-videos',
  false,
  1073741824, -- 1 GB: un Loom de 30 min en mp4 entra cómodo
  array['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska']
)
on conflict (id) do nothing;

create table if not exists public.sop_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  /**
   * pending      → recién creado, esperando al worker
   * transcribing → bajando el video, sacando el audio y transcribiendo
   * generating   → escribiendo el SOP desde la transcripción
   * ready        → terminado, hay markdown
   * failed       → se cortó; `error` dice por qué
   */
  status text not null default 'pending' check (
    status in ('pending', 'transcribing', 'generating', 'ready', 'failed')
  ),

  /** Dónde está el video subido, dentro del bucket `sop-videos`. */
  video_path text not null,
  video_file_name text,
  video_size_bytes bigint,

  /** Lo que el usuario aporta además del video: para qué es y de qué departamento. */
  title text,
  department text,
  context text,

  /**
   * ⭐ La transcripción se guarda **aunque la generación falle**. Es lo caro de
   * todo el proceso (Whisper cobra por minuto): perderla obligaría a volver a
   * pagarla para reintentar.
   */
  transcript text,
  transcript_seconds integer,

  /** El SOP generado, en markdown. */
  generated_markdown text,

  /**
   * Lo que el video NO aclara, en las palabras del modelo. Es lo que separa un
   * SOP útil de uno inventado: le dice al usuario qué le falta grabar.
   */
  open_questions jsonb not null default '[]'::jsonb,

  /** El SOP que se creó al aceptar el resultado, si se aceptó. */
  sop_id uuid references public.sops (id) on delete set null,

  error text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sop_generation_jobs_org_idx
  on public.sop_generation_jobs (organization_id, created_at desc);

create index if not exists sop_generation_jobs_status_idx
  on public.sop_generation_jobs (status)
  where status in ('pending', 'transcribing', 'generating');

alter table public.sop_generation_jobs enable row level security;

drop policy if exists "Users read org sop jobs" on public.sop_generation_jobs;
create policy "Users read org sop jobs" on public.sop_generation_jobs for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org sop jobs" on public.sop_generation_jobs;
create policy "Users insert org sop jobs" on public.sop_generation_jobs for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org sop jobs" on public.sop_generation_jobs;
create policy "Users update org sop jobs" on public.sop_generation_jobs for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org sop jobs" on public.sop_generation_jobs;
create policy "Users delete org sop jobs" on public.sop_generation_jobs for delete
  using (organization_id = public.get_my_organization_id());

drop trigger if exists sop_generation_jobs_updated_at on public.sop_generation_jobs;
create trigger sop_generation_jobs_updated_at
  before update on public.sop_generation_jobs
  for each row execute function public.set_updated_at();

-- ─── Realtime ───────────────────────────────────────────────────────────────
-- La pantalla escucha los cambios del job en vez de que el usuario apriete F5.
-- Mismo patrón que 20260810200000_trial_reels_realtime.sql.
do $$
begin
  alter publication supabase_realtime add table public.sop_generation_jobs;
exception
  when duplicate_object then null;
end $$;
