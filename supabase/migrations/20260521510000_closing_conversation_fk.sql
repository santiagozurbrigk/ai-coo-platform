-- Oleada C: closing_calls.conversation_id → uuid FK a conversations

update public.closing_calls
set conversation_id = null
where conversation_id is not null
  and conversation_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

alter table public.closing_calls
  drop constraint if exists closing_calls_conversation_id_fkey;

alter table public.closing_calls
  alter column conversation_id type uuid
  using (
    case
      when conversation_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then conversation_id::uuid
      else null
    end
  );

alter table public.closing_calls
  add constraint closing_calls_conversation_id_fkey
  foreign key (conversation_id) references public.conversations (id)
  on delete set null;
