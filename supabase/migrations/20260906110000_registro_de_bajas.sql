-- El registro de bajas del super admin.
--
-- ⭐ Existe porque **la baja borra todo lo demás**. Si el rastro de que una
-- organización existió viviera adentro de esa organización, se borraría con
-- ella, y no habría forma de responder "¿qué pasó con la cuenta de fulano?"
-- tres meses después.
--
-- Por eso no tiene FK a `organizations`: guarda el id y el nombre como texto,
-- congelados en el momento de la baja. Una FK acá haría desaparecer la fila
-- justo cuando más sirve.
--
-- `resultado` guarda lo que efectivamente pasó, no lo que se pretendía: si las
-- cuentas de login se borraron, si quedó algún archivo sin borrar y el motivo.
-- Una baja a medias tiene que poder leerse, no adivinarse.
create table if not exists public.super_admin_deletions (
  id uuid primary key default gen_random_uuid(),
  -- Qué se dio de baja: 'organization' | 'user'
  tipo text not null check (tipo in ('organization', 'user')),
  -- El id de la fila borrada. Sin FK a propósito (ver arriba).
  objetivo_id uuid not null,
  objetivo_nombre text,
  objetivo_email text,
  -- Quién la ejecutó, también congelado.
  ejecutado_por_email text not null,
  -- Conteos y detalle de lo que se llevó puesto.
  resultado jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists super_admin_deletions_created_at_idx
  on public.super_admin_deletions (created_at desc);

-- Sólo el service role. El super admin no lee esto con la sesión del navegador:
-- las bajas se consultan desde el servidor, como todo lo que tiene datos de
-- otras organizaciones.
alter table public.super_admin_deletions enable row level security;
