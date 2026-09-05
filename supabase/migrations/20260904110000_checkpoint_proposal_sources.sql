-- Las marcas de "ya lo evalué" de las dos fuentes que llenan el buzón de C3.
--
-- Sin esto, el cron diario vuelve a mandarle a Haiku los mismos mensajes y las
-- mismas llamadas todos los días: paga de nuevo por una respuesta que ya tuvo.
--
-- Es una marca de **evaluado**, no de **propuesto**. La diferencia importa: un
-- mensaje que se miró y no proponía nada tiene que quedar marcado igual, o es
-- justamente el que se re-evalúa para siempre.

alter table public.discord_messages
  add column if not exists checkpoint_checked_at timestamptz;

alter table public.fathom_calls
  add column if not exists checkpoint_checked_at timestamptz;

-- Los índices son parciales sobre lo que todavía no se miró: es la única
-- pregunta que hace el cron, y la lista se achica a medida que avanza.
create index if not exists discord_messages_checkpoint_pending_idx
  on public.discord_messages (organization_id, sent_at)
  where checkpoint_checked_at is null;

create index if not exists fathom_calls_checkpoint_pending_idx
  on public.fathom_calls (organization_id, created_at)
  where checkpoint_checked_at is null;
