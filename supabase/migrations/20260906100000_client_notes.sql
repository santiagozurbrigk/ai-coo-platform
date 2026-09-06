-- El cuaderno de cada cliente.
--
-- Ya existe `current_status_note` (la revisión semanal), pero es otra cosa: ese
-- campo se **pisa** cada semana y responde "cómo va hoy". Esto es lo contrario:
-- se **acumula**, y guarda lo que no entra en ningún campo estructurado — que
-- tiene dos hijos, que odia las llamadas de los lunes, que su socio decide.
--
-- Por eso son dos columnas y no una: si fueran la misma, cada revisión semanal
-- borraría el contexto que alguien tardó meses en juntar.
alter table public.clients
  add column if not exists notes text,
  add column if not exists notes_updated_at timestamptz;
