-- Agregar propuestas de tareas estructuradas a Fathom calls

ALTER TABLE public.fathom_calls
  ADD COLUMN IF NOT EXISTS ai_task_proposals jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tasks_sent_to_board boolean DEFAULT false;

ALTER TABLE public.fathom_calls
  DROP CONSTRAINT IF EXISTS fathom_calls_call_type_check;

ALTER TABLE public.fathom_calls
  ADD CONSTRAINT fathom_calls_call_type_check
  CHECK (
    call_type IS NULL
    OR call_type IN (
      'delivery',
      'consulting',
      'vision',
      'team',
      'team_meeting',
      'other'
    )
  );
